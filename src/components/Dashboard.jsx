import React from 'react';
import { ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';

const Dashboard = ({ income, expenses, limits, monthName }) => {
  // Separate income-type entries from expense entries
  const expenseItems = expenses.filter(i => i.type !== 'income');
  const incomeItems  = expenses.filter(i => i.type === 'income');

  const totalExp       = expenseItems.reduce((sum, i) => sum + i.amount, 0);
  const extraIncome    = incomeItems.reduce((sum, i) => sum + i.amount, 0);
  const effectiveIncome = income + extraIncome;
  const balance        = effectiveIncome - totalExp;

  const totalLimit     = Object.values(limits || {}).reduce((a, b) => a + b, 0);
  const hasTargets     = totalLimit > 0;
  const projectedSavings = effectiveIncome - totalLimit;

  const usagePct = effectiveIncome > 0
    ? Math.min((totalExp / effectiveIncome) * 100, 100)
    : 0;

  // Aggregate expenses by category for the donut
  const categoryTotals = expenseItems.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map(name => ({
    name,
    value: categoryTotals[name],
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

      {/* ── BALANCE ── */}
      <div className="neu-flat p-6 flex flex-col justify-center">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          {monthName} Balance
        </h3>
        <p className={`text-3xl font-black ${balance >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[9px] opacity-30 mt-1 font-bold italic">
          Income minus spending
        </p>
      </div>

      {/* ── PROJECTED LEFT ── */}
      <div className="neu-flat p-6 flex flex-col justify-center border-l-4 border-green-500/20">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Projected Left
        </h3>
        {hasTargets ? (
          <>
            <p className={`text-3xl font-black ${projectedSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${projectedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[9px] opacity-40 mt-1 font-bold italic">
              After all target spending
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-gray-400">—</p>
            <p className="text-[9px] opacity-40 mt-1 font-bold italic">
              Set monthly targets to preview
            </p>
          </>
        )}
      </div>

      {/* ── TOTAL USAGE ── */}
      <div className="neu-flat p-6 flex flex-col justify-center">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Total Usage
        </h3>
        <div className="flex justify-between text-[9px] font-bold opacity-50 mb-1.5">
          <span>${totalExp.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} spent</span>
          <span>{usagePct.toFixed(0)}%</span>
        </div>
        <div className="neu-inset h-3 w-full p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${usagePct >= 100 ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <p className="text-[9px] opacity-30 mt-1.5 font-bold">
          of ${effectiveIncome.toLocaleString()} monthly income
        </p>
      </div>

      {/* ── DONUT CHART ── */}
      <div className="neu-flat p-2 h-[140px] relative">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[9px] opacity-20 font-bold italic">No expenses yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={28} outerRadius={44} dataKey="value" paddingAngle={2}>
                {chartData.map((e, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: '10px', borderRadius: '10px', border: 'none' }}
                formatter={(v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
