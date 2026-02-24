import React from 'react';

const SummaryTable = ({ expenses, onDelete, categoryLimits = {} }) => {
  // Helper defined inside the component scope
  const getCategoryTotal = (catName) => {
    return expenses
      .filter(e => e.category === catName)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="neu-flat p-8 overflow-x-auto min-h-[500px]">
      <h2 className="text-xl font-black mb-8 text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
        Transaction Ledger
      </h2>
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest opacity-40">
            <th className="px-4">Description</th>
            <th className="px-4">Category</th>
            <th className="px-4 text-right">Amount</th>
            <th className="px-4"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => {
            const totalSpent = getCategoryTotal(exp.category);
            const limit = categoryLimits[exp.category];
            const isOver = limit && totalSpent > limit;

            return (
              <tr key={exp.id} className="group">
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
          {expenses.length === 0 && (
            <tr>
              <td colSpan="4" className="py-20 text-center opacity-20 italic font-bold">
                No activity logged.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
