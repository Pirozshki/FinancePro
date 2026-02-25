import React, { useState } from 'react';

const TransactionForm = ({ categories, onAdd }) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: categories[0],
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onAdd({ ...form, id: Date.now(), amount: Number(form.amount) });
    setForm(prev => ({ ...prev, description: '', amount: '' }));
  };

  const isIncome = form.type === 'income';

  return (
    <form onSubmit={handleSubmit} className="neu-flat p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Quick Entry</h2>
        <p className="text-[10px] uppercase tracking-widest opacity-40">Log daily spending or income</p>
      </div>

      {/* Income / Expense toggle */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Type</label>
        <div className="neu-inset flex rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              !isIncome ? 'text-red-500' : 'opacity-30 hover:opacity-60'
            }`}
          >
            − Expense
          </button>
          <div className="w-px bg-current opacity-10" />
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, type: 'income' }))}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              isIncome ? 'text-green-500' : 'opacity-30 hover:opacity-60'
            }`}
          >
            + Income
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Description</label>
          <input
            type="text"
            placeholder={isIncome ? 'e.g. Freelance Payment' : 'e.g. Sloan Park Tickets'}
            className="neu-inset w-full p-4 bg-transparent focus:outline-none dark:text-white placeholder:opacity-30"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Amount</label>
            <div className="neu-inset flex items-center px-4 gap-1">
              <span className={`font-bold text-sm ${isIncome ? 'text-green-500' : 'text-indigo-500'}`}>$</span>
              <input
                type="number"
                placeholder="0.00"
                className={`w-full py-4 bg-transparent focus:outline-none font-bold ${isIncome ? 'text-green-500' : 'text-indigo-500'}`}
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
          </div>

          {/* Category only shown for expenses */}
          {!isIncome && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold opacity-40 ml-2 uppercase">Category</label>
              <select
                className="neu-inset w-full p-4 bg-transparent focus:outline-none text-xs appearance-none"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {categories.map(c => (
                  <option key={c} value={c} className="dark:bg-gray-800">{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={`neu-button w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all ${
          isIncome
            ? 'text-green-600 hover:text-green-500'
            : 'text-indigo-600 hover:text-indigo-500'
        }`}
      >
        {isIncome ? '+ Save Income' : 'Save Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;
