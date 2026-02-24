import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';

const Dashboard = ({ income, expenses, limits, monthName }) => {
  const totalExp = expenses.reduce((sum, i) => sum + i.amount, 0);
  const balance = income - totalExp;
  const totalLimit = Object.values(limits || {}).reduce((a, b) => a + b, 0);
  const projectedSavings = income - totalLimit;

  // Aggregate by category
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map(name => ({
    name,
    value: categoryTotals[name]
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="neu-flat p-6 flex flex-col justify-center">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{monthName} Balance</h3>
        <p className={`text-3xl font-black ${balance >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
          ${balance.toLocaleString()}
        </p>
      </div>

      <div className="neu-flat p-6 flex flex-col justify-center border-l-4 border-green-500/20">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Projected Left</h3>
        <p className="text-3xl font-black text-green-500">${projectedSavings.toLocaleString()}</p>
        <p className="text-[9px] opacity-40 mt-1 font-bold italic">After all target spending</p>
      </div>

      <div className="neu-flat p-6 flex flex-col justify-center">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Total Usage</h3>
        <div className="neu-inset h-3 w-full p-0.5">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min((totalExp / income) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="neu-flat p-2 h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} innerRadius={25} outerRadius={40} dataKey="value">
              {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{fontSize: '10px', borderRadius: '10px', border: 'none'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;