import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { Card } from './CardSwap';

const fmt = (v) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
  if (v < 0) return `-₹${Math.abs(v).toLocaleString()}`;
  return `₹${v.toLocaleString()}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,20,0.95)', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px' }}>
      <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#fff' }}>Age {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.stroke || p.fill || '#aaa', fontSize: '0.9rem' }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Card 0: Net Worth Projection ──────────────────────────────────────────
export const NetWorthCard = React.forwardRef((props, ref) => {
  const { simulationResult, monteCarloData, monteCarloEnabled, params } = useSimulation();
  const data = monteCarloEnabled ? monteCarloData : simulationResult.timeline;

  return (
    <Card ref={ref} style={{ width: 600, height: 500 }}>
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#fff' }}>Net Worth Projection</h3>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
          Compound wealth trajectory across your lifetime.
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gwNW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="age" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={fmt} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Net Worth" dataKey="netWorth" stroke="#6366f1" fill="url(#gwNW)" strokeWidth={2.5} dot={false} />
              {!monteCarloEnabled && params.milestones.map(m => {
                const pt = data.find(d => d.age === m.age);
                if (!pt) return null;
                const hasSF = simulationResult.trackedShortfalls[m.id] > 0;
                return <ReferenceDot key={m.id} x={m.age} y={pt.netWorth} r={6} fill={hasSF ? '#f59e0b' : '#22c55e'} stroke="white" strokeWidth={2} />;
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
});
NetWorthCard.displayName = 'NetWorthCard';

// ── Card 1: Finance Cashflow ──────────────────────────────────────────────
export const CashflowCard = React.forwardRef((props, ref) => {
  const { params } = useSimulation();

  const cashflowData = useMemo(() => {
    let income = params.monthlySalary * 12;
    let expenses = params.monthlyExpenses * 12;
    return Array.from({ length: 10 }, (_, i) => {
      const row = { year: `Yr ${i + 1}`, income: Math.round(income), expenses: Math.round(expenses), savings: Math.round(income - expenses) };
      income *= (1 + params.annualStepUp);
      expenses *= (1 + params.inflationRate);
      return row;
    });
  }, [params]);

  return (
    <Card ref={ref} style={{ width: 600, height: 500 }}>
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#fff' }}>Finance Cashflow</h3>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
          Income vs Expenses over a 10-year horizon.
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflowData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="year" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={fmt} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Annual Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Annual Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" name="Net Savings" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
});
CashflowCard.displayName = 'CashflowCard';

// ── Card 2: Milestone Progress ────────────────────────────────────────────
export const MilestoneAnalysisCard = React.forwardRef((props, ref) => {
  const { params, simulationResult } = useSimulation();

  const progressData = useMemo(() => {
    return params.milestones.map(m => {
      const yearsFromStart = m.age - params.currentAge;
      const inflatedCost = m.cost * Math.pow(1 + params.inflationRate, yearsFromStart);
      const gap = simulationResult.trackedShortfalls[m.id] || 0;
      const completed = Math.max(0, inflatedCost - gap);
      const remaining = Math.max(0, gap);
      const pct = inflatedCost > 0 ? Math.min(100, (completed / inflatedCost) * 100) : 100;
      return { name: m.name, age: m.age, completed, remaining, inflatedCost, pct };
    });
  }, [params, simulationResult]);

  return (
    <Card ref={ref} style={{ width: 600, height: 500 }}>
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#fff' }}>Life Milestone Progress</h3>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
          Goal funding completion — how much is saved vs remaining.
        </p>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {progressData.length === 0 ? (
            <p style={{ color: '#52525b', textAlign: 'center', paddingTop: '40px' }}>
              No milestones yet. Add goals in the left panel.
            </p>
          ) : (
            progressData.map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{d.name}</strong>
                    <span style={{ color: '#71717a', fontSize: '0.8rem', marginLeft: '8px' }}>@ Age {d.age}</span>
                  </div>
                  <span style={{
                    color: d.pct >= 100 ? '#22c55e' : d.pct >= 50 ? '#f59e0b' : '#ef4444',
                    fontWeight: 700, fontSize: '0.95rem'
                  }}>
                    {d.pct >= 100 ? '✓ Funded' : `${d.pct.toFixed(1)}%`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${d.pct}%`, height: '100%', borderRadius: '5px',
                    background: d.pct >= 100 ? '#22c55e' : d.pct >= 50 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#71717a', fontSize: '0.8rem' }}>
                  <span>Funded: {fmt(d.completed)}</span>
                  <span style={{ color: d.remaining > 0 ? '#f87171' : '#71717a' }}>
                    {d.remaining > 0 ? `Gap: ${fmt(d.remaining)}` : `Total: ${fmt(d.inflatedCost)}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
});
MilestoneAnalysisCard.displayName = 'MilestoneAnalysisCard';
