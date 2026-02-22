import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import SummaryTable from './components/SummaryTable';
import LimitManager from './components/LimitManager';
import CSVImport from './components/CSVImport';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useDarkMode } from './hooks/useDarkMode';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(months[new Date().getMonth()]);
  const [showImport, setShowImport] = useState(false);
  const { data, setData, loading, saveError } = useSupabaseSync();
  const { isDark, toggle: toggleDark } = useDarkMode();

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

  // When switching to a month with no data, auto-populate any recurring items
  const changeMonth = (month) => {
    setCurrentMonth(month);
    const recurring = data.recurringItems || [];
    if (!data.monthlyData[month] && recurring.length > 0) {
      setData((prev) => ({
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [month]: {
            expenses: recurring.map((item) => ({
              ...item,
              id: Date.now() + Math.random(),
              date: new Date().toISOString().split('T')[0],
            })),
            limits: {},
          },
        },
      }));
    }
  };

  const addTransaction = (item) => {
    setData((prev) => {
      const monthTarget = prev.monthlyData[currentMonth] || { expenses: [], limits: {} };
      const newState = {
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [currentMonth]: {
            ...monthTarget,
            expenses: [item, ...monthTarget.expenses],
          },
        },
      };
      if (item.recurring) {
        newState.recurringItems = [
          ...(prev.recurringItems || []),
          { ...item, id: `recurring-${Date.now()}` },
        ];
      }
      return newState;
    });
  };

  const deleteTransaction = (id) => {
    setData((prev) => {
      const monthTarget = prev.monthlyData[currentMonth] || { expenses: [], limits: {} };
      return {
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [currentMonth]: {
            ...monthTarget,
            expenses: monthTarget.expenses.filter((e) => e.id !== id),
          },
        },
      };
    });
  };

  const updateLimit = (category, amount) => {
    setData((prev) => {
      const monthTarget = prev.monthlyData[currentMonth] || { expenses: [], limits: {} };
      return {
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [currentMonth]: {
            ...monthTarget,
            limits: { ...monthTarget.limits, [category]: amount },
          },
        },
      };
    });
  };

  // Distributes imported CSV transactions into the correct month automatically
  const importTransactions = (transactions) => {
    setData((prev) => {
      const updatedMonthlyData = { ...prev.monthlyData };

      transactions.forEach((t) => {
        const date = new Date(t.date + 'T00:00:00');
        const monthName = months[date.getMonth()];
        const monthTarget = updatedMonthlyData[monthName] || { expenses: [], limits: {} };

        updatedMonthlyData[monthName] = {
          ...monthTarget,
          expenses: [
            ...monthTarget.expenses,
            {
              id: Date.now() + Math.random(),
              description: t.description,
              amount: t.amount,
              category: t.category,
              date: t.date,
              recurring: false,
            },
          ],
        };
      });

      return { ...prev, monthlyData: updatedMonthlyData };
    });

    setShowImport(false);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-12 transition-all duration-700 ${currentMonth === 'March' ? 'cubs-theme' : ''}`}>
      <div className="max-w-7xl mx-auto space-y-10">

        <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter text-indigo-500">FINANCE_PRO 2026</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">
              Cloud Live Sync • Secure Connection
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="neu-flat p-2 flex items-center gap-2 overflow-x-auto max-w-xs no-scrollbar">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => changeMonth(m)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    currentMonth === m ? 'text-indigo-500 neu-inset' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Chase CSV Import button */}
            <button
              onClick={() => setShowImport(true)}
              className="neu-button px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 text-indigo-500"
            >
              🏦 Import CSV
            </button>
            <button
              onClick={toggleDark}
              className="neu-button p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-60"
            >
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </header>

        {saveError && (
          <div className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold text-center">
            ⚠️ {saveError}
          </div>
        )}

        <Dashboard
          income={data.income}
          expenses={activeMonthData.expenses}
          limits={activeMonthData.limits}
          monthName={currentMonth}
          allMonthlyData={data.monthlyData}
          currentMonthIndex={months.indexOf(currentMonth)}
          months={months}
        />

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:w-1/3 space-y-10">

            <div className="neu-flat p-8 space-y-6">
              <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-indigo-500">Global Income</h3>
              <div className="neu-inset p-4 flex items-center justify-between">
                <span className="text-xs font-bold opacity-60">Annual Base</span>
                <input
                  type="number"
                  min="0"
                  className="bg-transparent text-right focus:outline-none font-bold text-green-500 w-24"
                  value={data.income}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, income: Math.max(0, Number(e.target.value)) }))
                  }
                />
              </div>
            </div>

            <TransactionForm categories={data.categories} onAdd={addTransaction} />
            <LimitManager categories={data.categories} limits={activeMonthData.limits} onUpdateLimit={updateLimit} />
          </div>

          <div className="w-full lg:w-2/3">
            <SummaryTable
              expenses={activeMonthData.expenses}
              categoryLimits={activeMonthData.limits}
              onDelete={deleteTransaction}
            />
          </div>
        </div>

      </div>

      {/* CSV Import modal */}
      {showImport && (
        <CSVImport
          categories={data.categories}
          onImport={importTransactions}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
};

export default App;
