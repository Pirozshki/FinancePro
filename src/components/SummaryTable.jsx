import React, { useState } from 'react';

// Strips noise from raw bank descriptions
const cleanDescription = (desc) => {
  if (!desc) return desc;
  let s = desc;
  s = s.replace(/^POS DEBIT\s+/i, '');
  s = s.replace(/ORIG CO NAME:\s*/i, '').replace(/\s*CO ENTRY DESCR:.*$/i, '');
  s = s.replace(/\s+WEB ID:[\s\S]*$/i, '').replace(/\s+PPD ID:[\s\S]*$/i, '');
  s = s.replace(/\s+\d{2}\/\d{2,3}$/, '');
  s = s.replace(/\b\d{9,}\b/g, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  s = s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return s.trim() || desc.trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SummaryTable = ({ expenses, categoryLimits = {}, categories = [], onDelete, onUpdateCategory }) => {
  const [search, setSearch] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Separate income and expense items
  const expenseItems = expenses.filter(e => e.type !== 'income');
  const incomeItems  = expenses.filter(e => e.type === 'income');

  // ── Category breakdown (expenses only) ──────────────────────────
  const categoryTotals = expenseItems.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const totalSpent = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // ── All transactions sorted by date ──────────────────────────────
  const sortedExpenses = [...expenses].sort((a, b) =>
    new Date(b.date || 0) - new Date(a.date || 0)
  );

  // ── Search filter ────────────────────────────────────────────────
  const filteredExpenses = search.trim()
    ? sortedExpenses.filter(e =>
        cleanDescription(e.description)?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase())
      )
    : sortedExpenses;

  // ── Group filtered transactions by date ──────────────────────────
  const groupedByDate = filteredExpenses.reduce((acc, e) => {
    const key = e.date || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* ── SPENDING BREAKDOWN ─────────────────────────────────────── */}
      <div className="neu-flat p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
            Spending Breakdown
          </h2>
          <div className="neu-inset px-4 py-2 text-right">
            <p className="text-[9px] opacity-40 uppercase tracking-widest font-bold">Total Spent</p>
            <p className="text-lg font-black text-indigo-500">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Extra income transactions summary */}
        {incomeItems.length > 0 && (
          <div className="neu-inset px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Extra Income This Month</span>
            <span className="text-sm font-black text-green-500">
              +${incomeItems.reduce((s, e) => s + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {sortedCategories.length === 0 ? (
          <p className="py-10 text-center opacity-20 italic font-bold">No expenses logged.</p>
        ) : (
          <div className="space-y-5">
            {sortedCategories.map(([cat, total]) => {
              const limit = categoryLimits[cat] || 0;
              const hasLimit = limit > 0;
              const pct = hasLimit ? Math.min((total / limit) * 100, 100) : 0;
              const isOver = hasLimit && total > limit;
              const txCount = expenseItems.filter(e => e.category === cat).length;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-gray-600 dark:text-gray-300 truncate">{cat}</span>
                      <span className="text-[9px] opacity-30 font-bold shrink-0">
                        {txCount} {txCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOver && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">
                          Over Budget
                        </span>
                      )}
                      <span className={`text-sm font-black ${isOver ? 'text-red-500' : 'text-indigo-500'}`}>
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {hasLimit && (
                        <span className="text-[9px] opacity-30 font-bold">
                          / ${limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {hasLimit && (
                    <div className="neu-inset h-1.5 w-full p-px">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TRANSACTION LEDGER ─────────────────────────────────────── */}
      <div className="neu-flat p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter shrink-0">
            Transaction Ledger
          </h2>
          {/* Search bar */}
          <div className="neu-inset flex items-center px-3 py-2 gap-2 flex-1 max-w-xs">
            <span className="opacity-30 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent focus:outline-none text-xs w-full placeholder:opacity-30 dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="opacity-40 hover:opacity-80 text-xs font-black transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {search && filteredExpenses.length === 0 && (
          <p className="py-6 text-center opacity-20 italic font-bold text-sm">No transactions match "{search}"</p>
        )}

        {Object.keys(groupedByDate).length === 0 && !search ? (
          <p className="py-10 text-center opacity-20 italic font-bold">No activity logged.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, txns]) => (
              <div key={date}>
                <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-2 px-1">
                  {date !== 'Unknown' ? formatDate(date) : 'Unknown Date'}
                </p>
                <div className="space-y-1">
                  {txns.map(exp => {
                    const isIncome = exp.type === 'income';
                    const isEditingCat = editingCategoryId === exp.id;

                    return (
                      <div key={exp.id} className={`group flex items-center gap-3 neu-inset px-4 py-3 ${isIncome ? 'border-l-2 border-green-500/40' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                            {isIncome && <span className="text-green-500 mr-1">↑</span>}
                            {cleanDescription(exp.description)}
                          </p>

                          {/* Category — click to edit */}
                          {isEditingCat ? (
                            <select
                              autoFocus
                              value={exp.category || ''}
                              onChange={(e) => {
                                onUpdateCategory && onUpdateCategory(exp.id, e.target.value);
                                setEditingCategoryId(null);
                              }}
                              onBlur={() => setEditingCategoryId(null)}
                              className="mt-0.5 text-[9px] font-bold bg-transparent focus:outline-none text-indigo-500 cursor-pointer appearance-none"
                            >
                              {categories.map(c => (
                                <option key={c} value={c} className="dark:bg-gray-800">{c}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => !isIncome && setEditingCategoryId(exp.id)}
                              title={isIncome ? undefined : 'Click to change category'}
                              className={`text-[9px] font-bold mt-0.5 text-left transition-opacity ${
                                isIncome
                                  ? 'opacity-30 cursor-default text-green-500'
                                  : 'opacity-30 hover:opacity-70 hover:text-indigo-400 cursor-pointer'
                              }`}
                            >
                              {isIncome ? 'Income' : (exp.category || 'Uncategorized')}
                              {!isIncome && <span className="ml-1 opacity-50">✏︎</span>}
                            </button>
                          )}
                        </div>

                        <span className={`text-sm font-black whitespace-nowrap ${isIncome ? 'text-green-500' : 'text-indigo-500'}`}>
                          {isIncome ? '+' : ''}${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => onDelete && onDelete(exp.id)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 p-1 hover:scale-110 transition-all text-xs shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SummaryTable;
