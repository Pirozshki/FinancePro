import React from 'react';

// Strips noise from raw bank descriptions
const cleanDescription = (desc) => {
  if (!desc) return desc;
  let s = desc;
  s = s.replace(/^POS DEBIT\s+/i, '');
  s = s.replace(/ORIG CO NAME:\s*/i, '').replace(/\s*CO ENTRY DESCR:.*$/i, '');
  s = s.replace(/\s+WEB ID:[\s\S]*$/i, '').replace(/\s+PPD ID:[\s\S]*$/i, '');
  s = s.replace(/\s+\d{2}\/\d{2,3}$/, ''); // trailing date codes like 02/23
  s = s.replace(/\b\d{9,}\b/g, '');         // long numeric IDs
  s = s.replace(/\s{2,}/g, ' ').trim();
  // Title-case
  s = s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return s.trim() || desc.trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SummaryTable = ({ expenses, categoryLimits = {}, onDelete }) => {
  // ── Category breakdown ──────────────────────────────────────────────────
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // ── Transactions grouped by date ─────────────────────────────────────────
  const sortedExpenses = [...expenses].sort((a, b) =>
    new Date(b.date || 0) - new Date(a.date || 0)
  );

  const groupedByDate = sortedExpenses.reduce((acc, e) => {
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
            <p className="text-[9px] opacity-40 uppercase tracking-widest font-bold">Total</p>
            <p className="text-lg font-black text-indigo-500">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="py-10 text-center opacity-20 italic font-bold">No activity logged.</p>
        ) : (
          <div className="space-y-5">
            {sortedCategories.map(([cat, total]) => {
              const limit = categoryLimits[cat];
              const pct = limit ? Math.min((total / limit) * 100, 100) : 0;
              const isOver = limit && total > limit;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-600 dark:text-gray-300">{cat}</span>
                    <div className="flex items-center gap-2">
                      {isOver && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">
                          Over Limit
                        </span>
                      )}
                      <span className={`text-sm font-black ${isOver ? 'text-red-500' : 'text-indigo-500'}`}>
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {limit && (
                        <span className="text-[9px] opacity-30 font-bold">
                          / ${limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {limit && (
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
        <h2 className="text-xl font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
          Transaction Ledger
        </h2>

        {Object.keys(groupedByDate).length === 0 ? (
          <p className="py-10 text-center opacity-20 italic font-bold">No activity logged.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, txns]) => (
              <div key={date}>
                <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-2 px-1">
                  {date !== 'Unknown' ? formatDate(date) : 'Unknown Date'}
                </p>
                <div className="space-y-1">
                  {txns.map(exp => (
                    <div key={exp.id} className="group flex items-center gap-3 neu-inset px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                          {cleanDescription(exp.description)}
                        </p>
                        <p className="text-[9px] opacity-30 font-bold mt-0.5">{exp.category}</p>
                      </div>
                      <span className="text-sm font-black text-indigo-500 whitespace-nowrap">
                        ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => onDelete && onDelete(exp.id)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 p-1 hover:scale-110 transition-all text-xs shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
