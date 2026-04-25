import React, { useState } from 'react';

const QUIZ_DATA = [
  {
    question: "What is the primary benefit of compound interest?",
    options: [
      "It guarantees stock market returns.",
      "You earn interest on both your principal and previously earned interest.",
      "It eliminates inflation from your savings.",
      "It reduces the tax you pay on investments."
    ],
    correct: 1,
    explanation: "Compound interest acts like a snowball—your money earns interest, and then that total amount earns even more interest."
  },
  {
    question: "Which debt repayment strategy mathematically saves the most money on interest?",
    options: [
      "Debt Snowball (paying smallest balances first)",
      "Paying the minimum on everything evenly",
      "Debt Avalanche (paying off highest interest rate first)",
      "Consolidating all loans into one credit card"
    ],
    correct: 2,
    explanation: "Debt Avalanche tackles the highest interest rates first, minimizing the total interest that accrues over time."
  },
  {
    question: "If inflation is 6% and your savings account yields 4%, what is your real rate of return?",
    options: ["10%", "2%", "-2%", "4%"],
    correct: 2,
    explanation: "Real Return = Nominal Yield (4%) - Inflation (6%) = -2%. Your purchasing power is actually decreasing."
  },
  {
    question: "What is a 'Step-Up' SIP in investing?",
    options: [
      "Moving from mutual funds to direct stocks",
      "Increasing your monthly investment amount by a fixed percentage each year",
      "Paying a penalty for stepping out of a fund early",
      "A guaranteed step-up in your portfolio's value"
    ],
    correct: 1,
    explanation: "A Step-Up SIP automatically increases your investment generally in line with your annual salary hikes, massively compounding corpus growth."
  },
  {
    question: "Why should milestones (like buying a car in 5 years) be inflation-adjusted?",
    options: [
      "Because the government requires it.",
      "Because a 10L car today will cost more than 10L in 5 years.",
      "Because you will want a more expensive car later.",
      "It shouldn't be adjusted; the cost stays the same."
    ],
    correct: 1,
    explanation: "Prices rise over time due to inflation. Forecasting tomorrow's goals with today's prices creates devastating shortfalls."
  }
];

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [finished, setFinished] = useState(false);

  const handleOptionClick = (idx) => {
    if (showAnswer) return;
    setSelectedOpt(idx);
    setShowAnswer(true);
    if (idx === QUIZ_DATA[currentQ].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < QUIZ_DATA.length - 1) {
      setCurrentQ(q => q + 1);
      setShowAnswer(false);
      setSelectedOpt(null);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setStarted(true);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setShowAnswer(false);
    setSelectedOpt(null);
  };

  if (!started) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
        <div style={{ 
          width: '100%', maxWidth: '600px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,184,166,0.1))',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '60px 40px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎓</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', letterSpacing: '-1px' }}>Financial IQ Quiz</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: '32px', lineHeight: 1.6 }}>
            Test your knowledge on compounding, inflation, and debt strategies. 
            Earn points and unlock your MileniumX literacy badge!
          </p>
          <button className="btn btn-primary" onClick={() => setStarted(true)} style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
            Start Challenge 🚀
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = (score / QUIZ_DATA.length) * 100;
    let rank = 'Master';
    let color = 'var(--green)';
    if (pct < 50) { rank = 'Novice'; color = 'var(--red)'; }
    else if (pct < 80) { rank = 'Proficient'; color = 'var(--amber)'; }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{pct === 100 ? '👑' : pct >= 60 ? '🎯' : '📚'}</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Quiz Complete!</h1>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-2)', marginBottom: '24px' }}>
            You scored <strong style={{ color: '#fff' }}>{score}</strong> out of <strong style={{ color: '#fff' }}>{QUIZ_DATA.length}</strong>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}`, 
            borderRadius: '16px', padding: '24px', marginBottom: '32px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Your Rank</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{rank}</div>
          </div>
          <button className="btn btn-primary" onClick={restart}>Try Again</button>
        </div>
      </div>
    );
  }

  const q = QUIZ_DATA[currentQ];

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Financial IQ</h2>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', fontWeight: 600 }}>
          Score: <span style={{ color: 'var(--indigo)' }}>{score}</span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ color: 'var(--indigo)', fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>
          QUESTION {currentQ + 1} OF {QUIZ_DATA.length}
        </div>
        <h3 style={{ fontSize: '1.8rem', lineHeight: 1.4, marginBottom: '32px' }}>{q.question}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {q.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.05)';
            let bo = '1px solid var(--border)';
            if (showAnswer) {
              if (i === q.correct) { bg = 'rgba(34,197,94,0.1)'; bo = '1px solid var(--green)'; }
              else if (i === selectedOpt) { bg = 'rgba(239,68,68,0.1)'; bo = '1px solid var(--red)'; }
            } else if (selectedOpt === i) {
              bg = 'rgba(99,102,241,0.2)'; bo = '1px solid var(--indigo)';
            }
            return (
              <button 
                key={i}
                onClick={() => handleOptionClick(i)}
                style={{ 
                  background: bg, border: bo, padding: '18px 24px', borderRadius: '12px',
                  color: '#fff', fontSize: '1.05rem', textAlign: 'left', cursor: showAnswer ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div style={{ 
            animation: 'fadeSlideUp 0.3s ease forwards',
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ flex: 1, paddingRight: '24px' }}>
              <div style={{ fontWeight: 700, color: selectedOpt === q.correct ? 'var(--green)' : 'var(--red)', marginBottom: '8px' }}>
                {selectedOpt === q.correct ? 'Correct!' : 'Incorrect'}
              </div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {q.explanation}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleNext}>
              {currentQ === QUIZ_DATA.length - 1 ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
