import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import SummaryTable from './components/SummaryTable';
import LimitManager from './components/LimitManager';
import CSVImport from './components/CSVImport';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(months[new Date().getMonth()]);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  // Initial Fetch & Real-time Subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cloudData, error } = await supabase
          .from('budget_data')
          .select('content')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;

        if (cloudData) {
          setData(cloudData.content);
        } else {
          setData({
            income: 20000,
            categories: ['🏠 Rent/Mortgage', '🛒 Groceries', '⚡ Utilities', '🎢 Kids/Family', '⚾ Cubs Trip', '🚗 Transport', '✈️ Travel', '🍔 Dining Out', '💰 Savings'],
            monthlyData: {}
          });
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase.channel('realtime-budget')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'budget_data' },
        (payload) => {
          if (payload.new && payload.new.content) {
            setData(payload.new.content);
          }
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Save changes to cloud
  useEffect(() => {
    if (!loading && data) {
      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        const { error } = await supabase
          .from('budget_data')
          .upsert(
            { id: 1, content: data },
            { onConflict: 'id' }
          );

        if (error) {
          console.error("Save Error:", error.message);
          setSaveStatus('idle');
        } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2500);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  // System Theme Sync
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      setIsDark(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };
    setIsDark(mq.matches);
    document.documentElement.classList.toggle('dark', mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec] dark:bg-[#1a1d23]">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-bounce">⚾</div>
          <p className="font-black text-indigo-500 uppercase tracking-widest animate-pulse">
            Establishing Secure Sync...
          </p>
        </div>
      </div>
    );
  }

  const activeMonthData = data.monthlyData[currentMonth] || { expenses: [], limits: {} };

  const addTransaction = (item) => {
    const updated = { ...data.monthlyData };
    const monthTarget = updated[currentMonth] || { expenses: [], limits: {} };
    monthTarget.expenses = [item, ...monthTarget.expenses];
    updated[currentMonth] = monthTarget;
    setData(prev => ({ ...prev, monthlyData: updated }));
  };

  const deleteTransaction = (id) => {
    const updated = { ...data.monthlyData };
    const monthTarget = updated[currentMonth] || { expenses: [], limits: {} };
    monthTarget.expenses = monthTarget.expenses.filter(e => e.id !== id);
    updated[currentMonth] = monthTarget;
    setData(prev => ({ ...prev, monthlyData: updated }));
  };

  const updateTransactionCategory = (id, newCategory) => {
    const updated = { ...data.monthlyData };
    const monthTarget = updated[currentMonth] || { expenses: [], limits: {} };
    monthTarget.expenses = monthTarget.expenses.map(e =>
      e.id === id ? { ...e, category: newCategory } : e
    );
    updated[currentMonth] = monthTarget;
    setData(prev => ({ ...prev, monthlyData: updated }));
  };

  const addBulkTransactions = (transactions) => {
    setData(prev => {
      const updated = { ...prev.monthlyData };
      transactions.forEach((t, i) => {
        const date = new Date(t.date + 'T00:00:00');
        const monthName = months[date.getMonth()];
        const monthEntry = updated[monthName] || { expenses: [], limits: {} };
        monthEntry.expenses = [
          { id: Date.now() + i, description: t.description, amount: t.amount, category: t.category, date: t.date, type: 'expense' },
          ...monthEntry.expenses,
        ];
        updated[monthName] = monthEntry;
      });
      return { ...prev, monthlyData: updated };
    });
  };

  const updateLimit = (category, amount) => {
    const updated = { ...data.monthlyData };
    const monthTarget = updated[currentMonth] || { expenses: [], limits: {} };
    monthTarget.limits = { ...monthTarget.limits, [category]: amount };
    updated[currentMonth] = monthTarget;
    setData(prev => ({ ...prev, monthlyData: updated }));
  };

  const saveStatusLabel = saveStatus === 'saving'
    ? '⏳ Saving…'
    : saveStatus === 'saved'
    ? '✅ Saved'
    : null;

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-12 transition-all duration-700 ${currentMonth === 'March' ? 'cubs-theme' : ''}`}>
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter text-indigo-500">FINANCE_PRO 2026</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">
                Cloud Live Sync • Secure Connection
              </p>
              {saveStatusLabel && (
                <span className="text-[9px] font-black uppercase tracking-widest text-green-500 animate-pulse">
                  {saveStatusLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="neu-flat p-2 flex items-center gap-2 overflow-x-auto max-w-xs no-scrollbar">
              {months.map(m => (
                <button
                  key={m}
                  onClick={() => setCurrentMonth(m)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentMonth === m ? 'text-indigo-500 neu-inset' : 'opacity-40 hover:opacity-100'}`}
                >
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCSVImport(true)}
              className="neu-button px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 active:scale-95 transition-all"
            >
              📥 Import CSV
            </button>
            <button
              onClick={toggleDarkMode}
              title="Toggle dark/light mode"
              className="neu-button p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 active:scale-95 transition-all"
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </header>

        {showCSVImport && (
          <CSVImport
            categories={data.categories}
            onImport={(txns) => { addBulkTransactions(txns); }}
            onClose={() => setShowCSVImport(false)}
          />
        )}

        <Dashboard
          income={data.income}
          expenses={activeMonthData.expenses}
          limits={activeMonthData.limits}
          monthName={currentMonth}
        />

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:w-1/3 space-y-10">

            {/* Income input with $ prefix */}
            <div className="neu-flat p-8 space-y-6">
              <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-indigo-500">Global Income</h3>
              <div className="neu-inset p-4 flex items-center justify-between">
                <span className="text-xs font-bold opacity-60">Monthly Base</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-green-500">$</span>
                  <input
                    type="number"
                    className="bg-transparent text-right focus:outline-none font-bold text-green-500 w-28"
                    value={data.income}
                    onChange={(e) => setData(prev => ({ ...prev, income: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <TransactionForm categories={data.categories} onAdd={addTransaction} />
            <LimitManager
              categories={data.categories}
              limits={activeMonthData.limits}
              income={data.income}
              onUpdateLimit={updateLimit}
            />
          </div>

          <div className="w-full lg:w-2/3">
            <SummaryTable
              expenses={activeMonthData.expenses}
              categoryLimits={activeMonthData.limits}
              categories={data.categories}
              onDelete={deleteTransaction}
              onUpdateCategory={updateTransactionCategory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
