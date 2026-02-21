'use client';
import { useState } from 'react';

const INIT_VALIDATIONS = [
  { name: 'Email format valid',     pass: true, err: 'Invalid email format' },
  { name: 'Password length ≥ 8',   pass: true, err: 'Password too short' },
  { name: 'Username available',     pass: true, err: 'Username already taken' },
];

type Mode = 'monad' | 'ap';

export default function ApplicativeDemo() {
  const [validations, setValidations] = useState(INIT_VALIDATIONS);
  const [mode, setMode] = useState<Mode>('monad');

  const toggle = (i: number) => setValidations(v => v.map((item, idx) => idx === i ? { ...item, pass: !item.pass } : item));

  const failures = validations.filter(v => !v.pass);
  const firstFailIdx = validations.findIndex(v => !v.pass);

  return (
    <div className="demo-box">
      <div className="demo-title">Form validation — Monad vs Applicative</div>
      <div className="demo-hint">Click validations to make them fail. Switch modes to see how each strategy handles multiple failures.</div>
      <div className="btn-row" style={{ marginBottom: 14 }}>
        <button className={`btn red ${mode === 'monad' ? 'active-mode' : ''}`} onClick={() => setMode('monad')}>MONAD (stop at first error)</button>
        <button className={`btn amber ${mode === 'ap' ? 'active-mode' : ''}`} onClick={() => setMode('ap')}>APPLICATIVE (collect all errors)</button>
      </div>
      <div className="ap-steps">
        {validations.map((v, i) => (
          <div key={i} className="ap-step">
            <div className="ap-step-lbl">{v.name}</div>
            <div className={`ap-step-box ${v.pass ? 'pass' : 'fail'}`} onClick={() => toggle(i)}>
              {v.pass ? '✓ Valid' : `✗ ${v.err}`}
              <span style={{ fontSize: 10, color: 'var(--dimtxt)', marginLeft: 8 }}>(click to toggle)</span>
            </div>
          </div>
        ))}
      </div>
      <div className={`ap-result ${failures.length === 0 ? 'allok' : mode === 'monad' ? 'monaderr' : 'aperr'}`}>
        {failures.length === 0
          ? '✓ All validations passed!'
          : mode === 'monad'
          ? <><strong>Left: "{validations[firstFailIdx].err}"</strong><br /><span style={{ fontSize: 11 }}>Monad stopped at step {firstFailIdx + 1}. {firstFailIdx < 2 ? 'Later validations never ran.' : ''}</span></>
          : <><strong>All {failures.length} error{failures.length > 1 ? 's' : ''} collected:</strong><br />{failures.map(f => `• ${f.err}`).join('\n')}</>
        }
      </div>
      <div className="ap-note">
        {mode === 'monad' ? 'Monad (Either/flatMap): user sees only the first error — frustrating UX.' : 'Applicative (Validated/map2): user sees all errors at once — better UX, and validations can run in parallel.'}
      </div>
    </div>
  );
}
