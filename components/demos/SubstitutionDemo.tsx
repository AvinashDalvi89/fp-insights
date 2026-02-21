'use client';
import { useState } from 'react';

type Example = 'pure' | 'impure';

const EXAMPLES = {
  pure: {
    title: 'abs(abs(-5))  →  Pure / Always Substitutable',
    steps: [
      { expr: 'abs(abs(-5))',   note: 'Starting expression' },
      { expr: 'abs(|-5|)',      note: 'abs(-5) evaluates to 5' },
      { expr: 'abs(5)',         note: 'Substitute the result' },
      { expr: '5',              note: 'Final result — always 5' },
    ],
    rt: true,
    verdict: '✓ Referentially Transparent. You can replace abs(-5) with 5 anywhere in your code. Always safe. Always predictable.',
  },
  impure: {
    title: 'counter.increment()  →  NOT Substitutable',
    steps: [
      { expr: 'counter.increment()',  note: 'First call' },
      { expr: 'counter.value = 1',    note: 'State changed to 1' },
      { expr: 'counter.increment()',  note: 'Same expression called again!' },
      { expr: 'counter.value = 2',    note: 'But now gives 2 — NOT 1!' },
    ],
    rt: false,
    verdict: '✗ NOT Referentially Transparent. The same expression gives different results depending on when you call it. You cannot reason about it locally.',
  },
};

export default function SubstitutionDemo() {
  const [mode, setMode] = useState<Example>('pure');
  const [stepIdx, setStepIdx] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);

  const ex = EXAMPLES[mode];
  const visibleSteps = ex.steps.slice(0, stepIdx + 1);
  const canStep = stepIdx < ex.steps.length - 1 && !showVerdict;

  const handleStep = () => {
    if (canStep) {
      setStepIdx(s => s + 1);
    } else {
      setShowVerdict(true);
    }
  };

  const switchMode = (m: Example) => {
    setMode(m);
    setStepIdx(0);
    setShowVerdict(false);
  };

  return (
    <div className="demo-box">
      <div className="demo-title">Click [SUBSTITUTE] to evaluate step by step</div>
      <div className="demo-hint">Watch how a pure expression simplifies like algebra. Same input → always same result.</div>
      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button className={`btn sm ${mode === 'pure' ? 'active-mode' : 'amber'}`} onClick={() => switchMode('pure')}>Pure (RT) ✓</button>
        <button className={`btn sm ${mode === 'impure' ? 'active-mode' : 'red'}`} onClick={() => switchMode('impure')}>Impure (Not RT) ✗</button>
      </div>
      <div style={{ color: 'var(--dimtxt)', fontSize: 12, marginBottom: 12 }}>{ex.title}</div>
      {visibleSteps.map((s, i) => (
        <div key={i} className={`slide-in`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ color: 'var(--dimtxt)', fontSize: 10, minWidth: 60, textAlign: 'right' }}>
            {i === 0 ? 'Start:' : `Step ${i}:`}
          </span>
          <span style={{
            fontSize: 15, padding: '5px 12px', border: '1px solid',
            borderColor: i === visibleSteps.length - 1 && showVerdict ? (ex.rt ? 'var(--teal)' : 'var(--red)') : 'var(--border)',
            color: i === visibleSteps.length - 1 && showVerdict ? (ex.rt ? 'var(--teal)' : 'var(--red)') : 'var(--green)',
            background: 'rgba(0,255,65,.03)',
          }}>
            {s.expr}
          </span>
          <span style={{ color: 'var(--dimtxt)', fontSize: 11 }}>{s.note}</span>
        </div>
      ))}
      {showVerdict && (
        <div style={{
          marginTop: 12, padding: '8px 12px', fontSize: 13,
          borderLeft: `3px solid ${ex.rt ? 'var(--green)' : 'var(--red)'}`,
          background: ex.rt ? 'rgba(0,255,65,.04)' : 'rgba(255,68,85,.04)',
          color: ex.rt ? 'var(--green)' : 'var(--red)',
        }}>
          {ex.verdict}
        </div>
      )}
      <div className="btn-row">
        <button className="btn" onClick={handleStep} disabled={showVerdict && mode === 'impure'}>
          {showVerdict ? '✓ Done' : '▶ Substitute Next Step'}
        </button>
        {showVerdict && <button className="btn sm" onClick={() => switchMode(mode === 'pure' ? 'impure' : 'pure')}>Try {mode === 'pure' ? 'Impure' : 'Pure'} Example</button>}
      </div>
    </div>
  );
}
