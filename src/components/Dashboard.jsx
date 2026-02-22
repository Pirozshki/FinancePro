import React from 'react';
import { ResponsiveContainer, Tooltip, Cell, PieChart, Pie, BarChart, Bar, XAxis, YAxis } from 'recharts';

const Dashboard = ({ income, expenses, limits, monthName, allMonthlyData, currentMonthIndex, months }) => {
  const totalExp = expenses.reduce((sum, i) => sum + i.amount, 0);
  const balance = income - totalExp;
  const totalLimit = Object.values(limits || {}).reduce((a, b) => a + b, 0);
  const projectedSavings = income - totalLimit;

  // Aggregate by category for pie chart
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map(name => ({
    name,
    value: categoryTotals[name]
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Weekly insight — transactions logged in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyTotal = expenses
    .filter(e => e.date && new Date(e.date + 'T00:00:00') >= oneWeekAgo)
    .reduce((sum, e) => sum + e.amount, 0);
  const weeklyBudget = Math.round(income / 4.33);
  const weeklyOnTrack = weeklyTotal <= weeklyBudget;

  // 6-month spending trend
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonthIndex - 5 + i + 12) % 12;
    const month = months[idx];
    const monthExpenses = allMonthlyData[month]?.expenses || [];
    const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { name: month.substring(0, 3), spent, isCurrent: i === 5 };
  });

  return (
    <div className="space-y-8">

      {/* KPI Cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Total Usage</h3>
          <div className="neu-inset h-3 w-full p-0.5">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((totalExp / income) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[9px] opacity-40 mt-2 font-bold">{Math.round((totalExp / income) * 100)}% of income spent</p>
        </div>

        <div className="neu-flat p-2 h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={25} outerRadius={40} dataKey="value">
                {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '10px', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Insight + 6-Month Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Insight */}
        <div className={`neu-flat p-6 flex flex-col justify-center border-l-4 ${weeklyOnTrack ? 'border-green-400/40' : 'border-red-400/40'}`}>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">This Week</h3>
          <p className={`text-2xl font-black ${weeklyOnTrack ? 'text-green-500' : 'text-red-500'}`}>
            ${weeklyTotal.toLocaleString()}
          </p>
          <p className="text-[9px] opacity-40 mt-1 font-bold italic">
            {weeklyOnTrack ? '✓ On track' : '⚠ Over weekly pace'} · ~${weeklyBudget.toLocaleString()} / week
          </p>
        </div>

        {/* 6-Month Trend Bar Chart */}
        <div className="neu-flat p-6 lg:col-span-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">6-Month Spending Trend</h3>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={trendData} barSize={22}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontWeight: 700, opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: '10px', borderRadius: '10px', border: 'none' }}
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Spent']}
              />
              <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                {trendData.map((entry, i) => (
                  <Cell key={i} fill={entry.isCurrent ? '#6366f1' : '#c7d2fe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
