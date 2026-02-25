import React from 'react';

const LimitManager = ({ categories, limits, income, onUpdateLimit }) => {
  const totalBudgeted = Object.values(limits || {}).reduce((a, b) => a + b, 0);
  const remaining = income - totalBudgeted;
  const budgetPct = income > 0 ? Math.min((totalBudgeted / income) * 100, 100) : 0;
  const isOverBudget = totalBudgeted > income;

  return (
    <div className="neu-flat p-8 space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black opacity-40 uppercase tracking-widest text-indigo-500">Monthly Targets</h3>
        <p className="text-[10px] opacity-50 italic">Set a spending ceiling for each category</p>
      </div>

      {/* Summary bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-bold opacity-50">
          <span>
            ${totalBudgeted.toLocaleString()} budgeted
          </span>
          <span className={isOverBudget ? 'text-red-500 opacity-100' : ''}>
            {isOverBudget
              ? `$${(totalBudgeted - income).toLocaleString()} over income`
              : `$${remaining.toLocaleString()} unallocated`}
          </span>
        </div>
        <div className="neu-inset h-2 w-full p-px">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? 'bg-red-500' : budgetPct >= 90 ? 'bg-amber-500' : 'bg-indigo-500'}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        {categories.map(cat => (
          <div key={cat} className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold opacity-70 flex-1 min-w-0 truncate" title={cat}>{cat}</span>
            <div className="neu-inset flex items-center gap-1 px-3 py-2 shrink-0">
              <span className="text-[10px] font-bold text-indigo-500 opacity-60">$</span>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="0"
                value={limits[cat] || ''}
                onChange={(e) => onUpdateLimit(cat, Number(e.target.value) || 0)}
                className="bg-transparent focus:outline-none text-xs font-bold text-indigo-500 text-right w-20"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] opacity-30 italic text-center">
        Targets drive the "Projected Left" stat and category bars above
      </p>
    </div>
  );
};

export default LimitManager;
