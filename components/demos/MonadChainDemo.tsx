'use client';
import { useState } from 'react';

const INIT_STEPS = [
  { name: 'getUser(42)',      someVal: 'User{id:42, name:"Alice"}', noneReason: 'User not found' },
  { name: 'getOrders(user)',  someVal: '[Order#1, Order#2]',          noneReason: 'No orders found' },
  { name: 'calcTotal(orders)',someVal: 'Total: $148.00',              noneReason: 'Calculation error' },
];

export default function MonadChainDemo() {
  const [states, setStates] = useState([true, true, true]);

  const toggle = (i: number) => setStates(s => s.map((v, idx) => idx === i ? !v : v));
  const failIdx = states.findIndex(s => !s);

  return (
    <div className="demo-box">
      <div className="demo-title">Option/Maybe chain — click any step to return None</div>
      <div className="demo-hint">This is how Promises, async/await, and optional chaining work under the hood. One failure = the rest skip automatically.</div>
      <div className="chain-steps">
        {INIT_STEPS.map((s, i) => {
          const skip = failIdx >= 0 && i > failIdx;
          const isFail = !states[i];
          const cls = skip ? 'skip' : isFail ? 'none' : 'some';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
              {i > 0 && (
                <div className={`ch-arrow${failIdx >= 0 && i > failIdx ? ' dead' : (failIdx === i - 1 ? ' dead' : '')}`}>→</div>
              )}
              <div className={`ch-step ${cls}`}>
                <div className="ch-name">{s.name}</div>
                <div className="ch-val">
                  {skip ? '— skipped (None propagated) —' : isFail ? `None: ${s.noneReason}` : `Some(${s.someVal})`}
                </div>
                <button className={`btn sm${isFail ? ' red' : ''}`} style={{ marginTop: 8 }} onClick={() => toggle(i)}>
                  {isFail ? '✗ → Some' : '✓ → None'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`ch-result ${failIdx >= 0 ? 'none' : 'some'}`}>
        {failIdx >= 0
          ? <><strong>Final: None</strong> — "{INIT_STEPS[failIdx].noneReason}"<br /><span style={{ fontSize: 11, color: 'var(--dimtxt)' }}>Steps {failIdx + 2}–{INIT_STEPS.length} never executed.</span></>
          : <><strong>Final: Some</strong> — {INIT_STEPS[INIT_STEPS.length - 1].someVal}</>
        }
      </div>
    </div>
  );
}
