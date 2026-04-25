import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { LOAN_TYPES } from '../engine/FinanceEngine';

const fmt = (v) => {
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (Math.abs(v) >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000)     return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v.toLocaleString()}`;
};

export default function MilestoneTracker() {
  const { params, simulationResult, updateMilestone, addMilestone, removeMilestone } = useSimulation();
  const [newM, setNewM] = useState({ name: '', cost: 1000000, age: params.currentAge + 5, loanType: '' });

  const handleAdd = () => {
    if (!newM.name.trim()) return;
    addMilestone(newM);
    setNewM({ name: '', cost: 1000000, age: params.currentAge + 5, loanType: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {params.milestones.map(m => {
        const gap    = simulationResult.trackedShortfalls[m.id] || 0;
        const funded = gap <= 0;
        const yearsLeft = m.age - params.currentAge;
        const inflatedCost = m.cost * Math.pow(1 + params.inflationRate, Math.max(0, yearsLeft));
        const pct = funded ? 100 : Math.max(0, Math.min(99, ((inflatedCost - gap) / inflatedCost) * 100));

        return (
          <div className="m-card" key={m.id}>
            <div className="m-card-header">
              <span className="m-card-title">{m.name}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${funded ? 'badge-green' : gap > inflatedCost * 0.5 ? 'badge-red' : 'badge-amber'}`}>
                  {funded ? '✓ Funded' : 'Shortfall'}
                </span>
                <button
                  className="btn btn-sm btn-icon"
                  onClick={() => removeMilestone(m.id)}
                  style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', padding: '4px 8px' }}
                  title="Remove"
                >✕</button>
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.78rem', marginBottom: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-3)', marginBottom: '2px' }}>Target Age</div>
                <div style={{ fontWeight: 700 }}>{m.age} yrs</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', marginBottom: '2px' }}>Today's Cost</div>
                <div style={{ fontWeight: 700 }}>{fmt(m.cost)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', marginBottom: '2px' }}>Inflation Cost</div>
                <div style={{ fontWeight: 700 }}>{fmt(inflatedCost)}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-bar-bg" style={{ marginBottom: '6px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-2)', marginBottom: '12px' }}>
              <span>Funded {pct.toFixed(0)}%</span>
              {gap > 0 && <span style={{ color: 'var(--red)' }}>Gap: {fmt(gap)}</span>}
            </div>

            {/* Loan selector */}
            <select
              value={m.loanType || ''}
              onChange={e => updateMilestone(m.id, { loanType: e.target.value })}
            >
              <option value="">No Loan (EMI off)</option>
              {Object.entries(LOAN_TYPES).map(([k, l]) => (
                <option key={k} value={k}>{l.name} — {(l.rate * 100).toFixed(1)}%, {l.termsYears}y</option>
              ))}
            </select>
          </div>
        );
      })}

      {/* Add new goal */}
      <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-2)' }}>+ Add New Goal</div>
        <input className="input-field" placeholder="Goal name (e.g. Dream Home)" value={newM.name}
          onChange={e => setNewM({ ...newM, name: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
          <input className="input-field" type="number" placeholder="Cost (₹)" value={newM.cost}
            onChange={e => setNewM({ ...newM, cost: Number(e.target.value) })} />
          <input className="input-field" type="number" placeholder="Age" value={newM.age}
            onChange={e => setNewM({ ...newM, age: Number(e.target.value) })} />
        </div>
        <select value={newM.loanType} onChange={e => setNewM({ ...newM, loanType: e.target.value })}>
          <option value="">No Loan</option>
          {Object.entries(LOAN_TYPES).map(([k, l]) => (
            <option key={k} value={k}>{l.name} — {(l.rate * 100).toFixed(1)}%</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleAdd}>Add Goal</button>
      </div>
    </div>
  );
}
