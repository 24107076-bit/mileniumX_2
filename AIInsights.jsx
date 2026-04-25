import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';

const fmt = (v) => {
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (Math.abs(v) >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000)     return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v.toLocaleString()}`;
};

export default function AIInsights() {
  const { params, simulationResult } = useSimulation();

  const { insights, loans } = useMemo(() => {
    const cards = [];
    const savings = params.monthlySalary - params.monthlyExpenses;
    const savingsRate = savings / params.monthlySalary;
    const loans = simulationResult.loanTracking || [];

    // 1. Savings rate
    if (savingsRate < 0.10) {
      cards.push({
        icon: '⚠️', iconClass: 'ai-icon-amber',
        title: 'Savings Rate Critical',
        body: `You're only saving ${(savingsRate * 100).toFixed(1)}% of income (₹${fmt(savings)}/mo). Target at least 20%. Reduce discretionary spend or increase income through upskilling.`,
      });
    } else if (savingsRate >= 0.30) {
      cards.push({
        icon: '🚀', iconClass: 'ai-icon-green',
        title: 'Elite Savings Rate',
        body: `Outstanding! ${(savingsRate * 100).toFixed(1)}% savings rate. At ₹${fmt(savings)}/mo, consider accelerating milestone payoffs or investing in high-yield index funds.`,
      });
    } else {
      cards.push({
        icon: '📈', iconClass: 'ai-icon-indigo',
        title: 'Healthy Accumulation',
        body: `Savings rate: ${(savingsRate * 100).toFixed(1)}% (₹${fmt(savings)}/mo). A ${params.annualStepUp * 100}% annual step-up compounds this significantly over time.`,
      });
    }

    // 2. Retirement outlook
    const retPt = simulationResult.timeline.find(t => t.age === params.retirementAge);
    if (retPt) {
      const corpus = retPt.netWorth;
      const annualSpend = params.monthlyExpenses * 12;
      const yearsSupported = corpus / annualSpend;
      if (yearsSupported < 15) {
        cards.push({
          icon: '🔴', iconClass: 'ai-icon-red',
          title: 'Retirement Corpus Insufficient',
          body: `At retirement (age ${params.retirementAge}) your projected corpus is ${fmt(corpus)}. This sustains only ~${yearsSupported.toFixed(0)} years of current expenses. Increase savings or delay retirement.`,
        });
      } else {
        cards.push({
          icon: '🏖️', iconClass: 'ai-icon-green',
          title: 'Retirement On Track',
          body: `Projected corpus at age ${params.retirementAge}: ${fmt(corpus)} — ~${yearsSupported.toFixed(0)} years of expenses covered. Consider inflation-adjusted SWR for accuracy.`,
        });
      }
    }

    // 3. Loan strategy
    if (loans.length > 0) {
      const byRate = [...loans].sort((a, b) => b.rate - a.rate);
      const byBal  = [...loans].sort((a, b) => a.initialBalance - b.initialBalance);
      const top = byRate[0];
      const aligned = top.name === byBal[0].name;
      cards.push({
        icon: '🏦', iconClass: 'ai-icon-amber',
        title: aligned ? 'Debt Avalanche = Snowball' : 'Use Debt Avalanche Method',
        body: aligned
          ? `${top.name} has both the highest rate (${(top.rate*100).toFixed(1)}%) and lowest balance. Aggressively over-pay — this saves maximum interest and clears it fastest.`
          : `Pay minimums on all loans, then funnel surplus towards ${top.name} (${(top.rate*100).toFixed(1)}% — highest interest). This saves the most money mathematically over the loan term.`,
      });
    } else {
      cards.push({
        icon: '✨', iconClass: 'ai-icon-indigo',
        title: 'Zero Active Debt',
        body: 'No loan shortfalls detected. Your wealth is compounding organically. Consider deploying surplus savings into diversified index funds to accelerate growth.',
      });
    }

    return { insights: cards, loans };
  }, [params, simulationResult]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* AI Insight Cards */}
      {insights.map((ins, i) => (
        <div className="ai-card" key={i}>
          <div className="ai-card-header">
            <div className={`ai-icon ${ins.iconClass}`}>{ins.icon}</div>
            <span className="ai-card-title">{ins.title}</span>
          </div>
          <p className="ai-card-body">{ins.body}</p>
        </div>
      ))}

      {/* Loan tracker */}
      {loans.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
            Active Loan Tracking
          </div>
          {loans.map((loan, i) => {
            const totalInterest = Math.max(0, (loan.emi * loan.remainingTerm * 12) - loan.initialBalance);
            const priority = i === [...loans].sort((a, b) => b.rate - a.rate).findIndex(l => l === loan) ? true : false;
            return (
              <div className="loan-row" key={i} style={{ marginBottom: '10px', borderColor: priority ? 'rgba(245,158,11,0.3)' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                  <strong>{loan.name}</strong>
                  <span style={{ color: 'var(--amber)', fontSize: '0.78rem', fontWeight: 700 }}>
                    {(loan.rate * 100).toFixed(1)}% p.a.
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                  <span>Principal: {fmt(loan.initialBalance)}</span>
                  <span>EMI: {fmt(loan.emi)}/mo</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--red)' }}>
                  Est. Total Interest: {fmt(totalInterest)}
                </div>
                {/* progress */}
                <div className="progress-bar-bg" style={{ height: '5px' }}>
                  <div className="progress-bar-fill" style={{ width: '4%', background: 'var(--amber)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Just started — {loan.remainingTerm}y remaining</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
