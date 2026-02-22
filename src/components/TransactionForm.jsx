import React, { useState } from 'react';

const TransactionForm = ({ categories, onAdd }) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: categories[0],
    date: new Date().toISOString().split('T')[0],
    recurring: false,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Please enter a description.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter an amount greater than $0.'); return; }
    setError('');
    onAdd({ ...form, id: Date.now(), amount: Number(form.amount) });
    setForm({ ...form, description: '', amount: '', recurring: false });
  };

  return (
    <form onSubmit={handleSubmit} className="neu-flat p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Quick Entry</h2>
        <p className="text-[10px] uppercase tracking-widest opacity-40">Log daily spending</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Description</label>
          <input
            type="text"
            placeholder="e.g. Sloan Park Tickets"
            className="neu-inset w-full p-4 bg-transparent focus:outline-none dark:text-white placeholder:opacity-30"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Amount</label>
            <input
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="neu-inset w-full p-4 bg-transparent focus:outline-none text-indigo-500 font-bold"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Category</label>
            <select
              className="neu-inset w-full p-4 bg-transparent focus:outline-none text-xs appearance-none"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(c => <option key={c} value={c} className="dark:bg-gray-800">{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Date</label>
          <input
            type="date"
            className="neu-inset w-full p-4 bg-transparent focus:outline-none text-xs font-bold text-gray-500 dark:text-gray-300"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Recurring toggle */}
        <div className="neu-inset px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-300">Recurring monthly</p>
            <p className="text-[9px] opacity-40 mt-0.5">Auto-adds this to future months</p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, recurring: !form.recurring })}
            className={`relative w-10 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
              form.recurring ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                form.recurring ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {error && <p className="text-[10px] text-red-500 font-bold px-2">{error}</p>}

      <button
        type="submit"
        className="neu-button w-full py-4 rounded-2xl font-black text-indigo-600 uppercase tracking-widest text-xs hover:text-indigo-500 active:scale-95 transition-all"
      >
        Save Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
