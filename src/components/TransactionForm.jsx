import React, { useState } from 'react';

const TransactionForm = ({ categories, onAdd }) => {
  const [form, setForm] = useState({ 
    description: '', 
    amount: '', 
    category: categories[0], 
    date: new Date().toISOString().split('T')[0] 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onAdd({ ...form, id: Date.now(), amount: Number(form.amount) });
    setForm({ ...form, description: '', amount: '' });
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
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Amount</label>
            <input 
              type="number" 
              placeholder="0.00"
              className="neu-inset w-full p-4 bg-transparent focus:outline-none text-indigo-500 font-bold"
              value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Category</label>
            <select 
              className="neu-inset w-full p-4 bg-transparent focus:outline-none text-xs appearance-none"
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
            >
              {categories.map(c => <option key={c} value={c} className="dark:bg-gray-800">{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button type="submit" className="neu-button w-full py-4 rounded-2xl font-black text-indigo-600 uppercase tracking-widest text-xs hover:text-indigo-500 active:scale-95 transition-all">
        Save Transaction
      </button>
    </form>
  );
};

export default TransactionForm;