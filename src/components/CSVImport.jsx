import React, { useState, useRef } from 'react';

// Maps Chase's built-in categories to FinancePro categories
const CHASE_CATEGORY_MAP = {
  'Food & Drink': '🍔 Dining Out',
  'Groceries': '🛒 Groceries',
  'Travel': '✈️ Travel',
  'Gas': '🚗 Transport',
  'Automotive': '🚗 Transport',
  'Bills & Utilities': '⚡ Utilities',
  'Home': '🏠 Rent/Mortgage',
  'Mortgage & Rent': '🏠 Rent/Mortgage',
  'Entertainment': '🎢 Kids/Family',
  'Health & Wellness': '🛒 Groceries',
  'Fees & Adjustments': '⚡ Utilities',
};

// Parses a single CSV line, respecting quoted fields
const parseCSVLine = (line) => {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
    else { current += char; }
  }
  cols.push(current.trim());
  return cols;
};

// Converts MM/DD/YYYY → YYYY-MM-DD
const toISODate = (dateStr) => {
  const parts = dateStr.replace(/"/g, '').split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  }
  return dateStr;
};

const parseChaseCSV = (text) => {
  // Strip UTF-8 BOM that Chase CSVs often include, plus normalize line endings
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim().split('\n').filter(l => l.trim());

  // Find the header row — supports both credit card ('Transaction Date') and
  // checking account ('Details, Posting Date') Chase CSV formats
  const headerIdx = lines.findIndex(l => {
    const normalized = l.replace(/"/g, '').trim();
    return normalized.startsWith('Transaction Date') ||
           normalized.startsWith('Date,') ||
           normalized.startsWith('Details,');
  });
  if (headerIdx === -1) return null;

  const headers = parseCSVLine(lines[headerIdx]).map(h => h.replace(/"/g, ''));
  const col = (name) => headers.findIndex(h => h === name);

  // Credit card exports use 'Transaction Date'; checking exports use 'Posting Date'
  const dateIdx = col('Transaction Date') !== -1 ? col('Transaction Date') :
                  col('Posting Date') !== -1    ? col('Posting Date') :
                                                  col('Date');
  const descIdx = col('Description');
  const amtIdx = col('Amount');
  const catIdx = col('Category');
  const typeIdx = col('Type');

  if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) return null;

  const transactions = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const amount = parseFloat(cols[amtIdx]);
    const type = typeIdx >= 0 ? cols[typeIdx]?.replace(/"/g, '').trim() : '';

    // Chase exports debits as negative numbers — skip credits, returns, payments
    if (isNaN(amount) || amount >= 0) continue;
    if (['Payment', 'Return', 'Credit'].includes(type)) continue;

    const chaseCategory = catIdx >= 0 ? cols[catIdx]?.replace(/"/g, '').trim() : '';

    transactions.push({
      date: toISODate(cols[dateIdx]),
      description: cols[descIdx]?.replace(/"/g, '').trim(),
      amount: Math.abs(amount),
      chaseCategory,
      suggestedCategory: CHASE_CATEGORY_MAP[chaseCategory] || null,
      category: CHASE_CATEGORY_MAP[chaseCategory] || null, // will be set in component
    });
  }

  return transactions;
};

const CSVImport = ({ categories, onImport, onClose }) => {
  const [step, setStep] = useState('upload'); // 'upload' | 'review' | 'done'
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseChaseCSV(evt.target.result);

      if (!parsed) {
        setError('Could not read this file. Make sure you exported it as a CSV from Chase.');
        return;
      }
      if (parsed.length === 0) {
        setError('No expense transactions found in this file. Chase credits and payments are excluded automatically.');
        return;
      }

      // Assign a default category for any transaction that didn't auto-match
      const withCategories = parsed.map(t => ({
        ...t,
        category: t.suggestedCategory || categories[0],
      }));

      setTransactions(withCategories);
      setStep('review');
    };
    reader.readAsText(file);
  };

  const updateCategory = (index, category) => {
    setTransactions(prev => prev.map((t, i) => i === index ? { ...t, category } : t));
  };

  const handleImport = () => {
    onImport(transactions);
    setStep('done');
  };

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="neu-flat p-8 w-full max-w-3xl max-h-[88vh] flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-indigo-500 uppercase tracking-tighter">
              Chase CSV Import
            </h2>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">
              {step === 'upload' && 'Upload your Chase transaction export'}
              {step === 'review' && `${transactions.length} expenses found — review categories before importing`}
              {step === 'done' && `${transactions.length} transactions imported across your monthly ledgers`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="neu-button p-3 rounded-2xl text-xs font-black opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {/* ── UPLOAD STEP ── */}
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center gap-6 py-10">
            <div className="text-5xl">🏦</div>
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-300">
                How to get your Chase CSV:
              </p>
              <ol className="text-[10px] opacity-50 space-y-1 text-left list-decimal list-inside">
                <li>Go to chase.com and sign in</li>
                <li>Open your checking or credit card account</li>
                <li>Click <strong>Download</strong> (top right of transactions)</li>
                <li>Select <strong>CSV</strong> format and your date range</li>
                <li>Upload the downloaded file below</li>
              </ol>
            </div>
            {error && (
              <p className="text-[10px] text-red-500 font-bold text-center max-w-sm">{error}</p>
            )}
            <input ref={fileRef} type="file" accept=".csv,.CSV,text/csv" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current.click()}
              className="neu-button px-8 py-4 rounded-2xl font-black text-indigo-600 uppercase tracking-widest text-xs"
            >
              Choose CSV File
            </button>
          </div>
        )}

        {/* ── REVIEW STEP ── */}
        {step === 'review' && (
          <>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest opacity-40">
                    <th className="px-3">Date</th>
                    <th className="px-3">Description</th>
                    <th className="px-3 text-right">Amount</th>
                    <th className="px-3">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-[10px] font-bold opacity-40 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 max-w-[180px] truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="px-3 py-2 text-right font-black text-indigo-500 text-sm whitespace-nowrap">
                        ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={t.category}
                          onChange={e => updateCategory(i, e.target.value)}
                          className={`neu-inset px-2 py-1.5 bg-transparent focus:outline-none text-[10px] font-bold appearance-none cursor-pointer w-full ${t.suggestedCategory ? 'text-indigo-500' : 'text-gray-400'
                            }`}
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[9px] opacity-40 italic">
              Categories in indigo were auto-matched from Chase. Adjust any that look off before importing.
            </p>

            <button
              onClick={handleImport}
              className="neu-button w-full py-4 rounded-2xl font-black text-indigo-600 uppercase tracking-widest text-xs"
            >
              Import {transactions.length} Transactions →
            </button>
          </>
        )}

        {/* ── DONE STEP ── */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="text-5xl">✅</div>
            <p className="font-black text-indigo-500 uppercase tracking-widest text-sm">Import Complete</p>
            <p className="text-[10px] opacity-40 text-center">
              {transactions.length} transactions added. Each one was placed in its correct month automatically.
            </p>
            <button
              onClick={onClose}
              className="neu-button px-8 py-4 rounded-2xl font-black text-indigo-600 uppercase tracking-widest text-xs mt-4"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CSVImport;
