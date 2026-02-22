import React, { useMemo, useState } from 'react';

const SummaryTable = ({ expenses, onDelete, categoryLimits = {} }) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // All unique categories present in the ledger for the filter dropdown
  const categories = useMemo(() => {
    const cats = [...new Set(expenses.map(e => e.category))];
    return ['All', ...cats];
  }, [expenses]);

  // Pre-compute category totals once (O(n)) instead of per-row (O(n²))
  const categoryTotals = useMemo(() =>
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {}),
    [expenses]
  );

  const filteredExpenses = useMemo(() => {
    const list = filterCategory === 'All'
      ? expenses
      : expenses.filter(e => e.category === filterCategory);

    return [...list].sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [expenses, filterCategory, sortOrder]);

  return (
    <div className="neu-flat p-8 overflow-x-auto min-h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-xl font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
          Transaction Ledger
        </h2>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="neu-inset px-3 py-2 bg-transparent focus:outline-none text-xs font-bold appearance-none cursor-pointer text-gray-500 dark:text-gray-300"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="neu-inset px-3 py-2 bg-transparent focus:outline-none text-xs font-bold appearance-none cursor-pointer text-gray-500 dark:text-gray-300"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>
      </div>

      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest opacity-40">
            <th className="px-4">Date</th>
            <th className="px-4">Description</th>
            <th className="px-4">Category</th>
            <th className="px-4 text-right">Amount</th>
            <th className="px-4"></th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((exp) => {
            const totalSpent = categoryTotals[exp.category] || 0;
            const limit = categoryLimits[exp.category];
            const isOver = limit && totalSpent > limit;

            return (
              <tr key={exp.id} className="group">
                <td className="py-4 px-4 text-[10px] font-bold opacity-40 whitespace-nowrap">
                  {exp.date
                    ? new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'
                  }
                  {exp.recurring && <span className="ml-1 text-indigo-400" title="Recurring">↻</span>}
                </td>
                <td className="py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                  {exp.description}
                  {isOver && (
                    <span className="ml-2 text-[9px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-black">
                      OVER LIMIT
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className={`neu-inset px-4 py-2 text-xs ${isOver ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    {exp.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-black text-indigo-500">
                  ${exp.amount.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 p-2 hover:scale-110 transition-all"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
          {filteredExpenses.length === 0 && (
            <tr>
              <td colSpan="5" className="py-20 text-center opacity-20 italic font-bold">
                {filterCategory !== 'All' ? `No ${filterCategory} transactions this month.` : 'No activity logged.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
