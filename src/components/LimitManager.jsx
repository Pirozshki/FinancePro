import React from 'react';

const LimitManager = ({ categories, limits, onUpdateLimit }) => {
  return (
    <div className="neu-flat p-8 space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black opacity-40 uppercase tracking-widest text-indigo-500">Monthly Targets</h3>
        <p className="text-[10px] opacity-50 italic">Set ceilings for your core categories</p>
      </div>
      
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {categories.map(cat => (
          <div key={cat} className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold opacity-70">{cat}</span>
              <span className="text-[10px] font-mono text-indigo-500">${limits[cat] || 0}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="2000" 
              step="50"
              value={limits[cat] || 0}
              onChange={(e) => onUpdateLimit(cat, Number(e.target.value))}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LimitManager;