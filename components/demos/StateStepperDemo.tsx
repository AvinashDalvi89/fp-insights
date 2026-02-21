'use client';
import { useState } from 'react';

const OPS = [
  { name: 'nextInt(rng0)',    sig: 'RNG → (Int, RNG)',    desc: 'Generate first number' },
  { name: 'nextInt(rng1)',    sig: 'RNG → (Int, RNG)',    desc: 'Thread new state forward' },
  { name: 'nextDouble(rng2)', sig: 'RNG → (Double, RNG)', desc: 'Different type, same pattern' },
];
const STATES = [42, 2654435769, 1013904223, 3422808825];
const VALS = [{ v: '7', t: 'Int' }, { v: '31', t: 'Int' }, { v: '0.74', t: 'Double' }];

export default function StateStepperDemo() {
  const [step, setStep] = useState(-1);

  return (
    <div className="demo-box">
      <div className="demo-title">Pure state threading — no mutation, no hidden state</div>
      <div className="demo-hint">Each function takes the current RNG state in and returns (value, new state) out. Press Next to advance.</div>
      <div className="state-fn-row">
        {OPS.map((op, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
              {i > 0 && <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--gdim)', fontSize: 18 }}>→</div>}
              <div className={`state-fn-box${active ? ' active' : ''}`}>
                <div className="sfn-name">{op.name}</div>
                <div className="sfn-sig">{op.sig}</div>
                <div className="sfn-in">{i === 0 ? 'in: rng0 = seed(42)' : (done || active) ? `in: rng${i} = ${STATES[i]}` : 'waiting...'}</div>
                {(done || active) && <>
                  <div className="sfn-out">out: {VALS[i].v} ({VALS[i].t})</div>
                  <div className="sfn-state">new rng: {STATES[i + 1]}</div>
                </>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="state-result">
        {step < 0
          ? <span style={{ color: 'var(--dimtxt)', fontSize: 12 }}>Press Next Step to watch state thread through each call.</span>
          : step >= OPS.length - 1
          ? <>
              <div className="srow"><span className="sk">All values:</span><span className="sv">[{VALS.map(v => v.v).join(', ')}]</span></div>
              <div className="srow"><span className="sk">Final state:</span><span className="sv">rng{OPS.length} = {STATES[OPS.length]}</span></div>
              <div className="srow"><span className="sk">Reproducible?</span><span style={{ color: 'var(--green)' }}>✓ Yes — start from seed(42) again, get identical results</span></div>
            </>
          : <div className="srow"><span className="sk">Current:</span><span className="sv">value = {VALS[step].v}, next rng = {STATES[step + 1]}</span></div>
        }
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => setStep(s => Math.min(s + 1, OPS.length - 1))} disabled={step >= OPS.length - 1}>▶ Next Step</button>
        <button className="btn sm" onClick={() => setStep(-1)}>Reset</button>
      </div>
    </div>
  );
}
