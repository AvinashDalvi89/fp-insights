'use client';
import { useState } from 'react';

const INITIAL_STEPS = [
  { name: 'Validate Email',   success: true, out: '"user@email.com"',  err: 'Err: Invalid email' },
  { name: 'Find User in DB',  success: true, out: 'User{id:42}',        err: 'Err: User not found' },
  { name: 'Check Account',    success: true, out: 'Account{active}',    err: 'Err: Account suspended' },
  { name: 'Process Payment',  success: true, out: 'Receipt{#8821}',     err: 'Err: Card declined' },
];

export default function RailwayDemo() {
  const [steps, setSteps] = useState(INITIAL_STEPS);

  const toggle = (i: number) => {
    setSteps(s => s.map((step, idx) => idx === i ? { ...step, success: !step.success } : step));
  };

  const failIdx = steps.findIndex(s => !s.success);

  return (
    <div className="demo-box">
      <div className="demo-title">Click any step to toggle success ✓ / failure ✗</div>
      <div className="demo-hint">A failure at any step automatically skips everything after it. You don't write any if/else — the chain handles it.</div>
      <div className="rw-steps">
        {steps.map((s, i) => {
          const skipped = failIdx >= 0 && i > failIdx;
          const state = skipped ? 'skipped' : s.success ? 'success' : 'failure';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`rw-step ${state}`} onClick={() => toggle(i)}>
                <div className="rw-step-name">{s.name}</div>
                <div className="rw-step-out">
                  {skipped ? '— skipped —' : s.success ? s.out : s.err}
                </div>
                <button className={`btn sm${s.success ? '' : ' red'}`} style={{ marginTop: 8 }}>
                  {s.success ? '✓ click to fail' : '✗ click to pass'}
                </button>
              </div>
              {i < steps.length - 1 && (
                <div className={`rw-arrow${failIdx >= 0 && i >= failIdx ? ' killed' : ''}`}>
                  {failIdx === i ? '✗' : '→'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={`rw-result ${failIdx >= 0 ? 'err' : 'ok'}`}>
        {failIdx >= 0
          ? <><strong>Result: Left (Error)</strong> — {steps[failIdx].err}<br /><span style={{ fontSize: 11, color: 'var(--dimtxt)' }}>Steps {steps.slice(failIdx + 1).map(s => s.name).join(', ')} never ran.</span></>
          : <><strong>Result: Right (Success)</strong> — {steps[steps.length - 1].out}<br /><span style={{ fontSize: 11, color: 'var(--gdim)' }}>All steps completed.</span></>
        }
      </div>
    </div>
  );
}
