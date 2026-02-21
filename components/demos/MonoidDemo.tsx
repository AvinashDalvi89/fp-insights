'use client';
import { useRef, useState } from 'react';

const DATA = [3, 1, 4, 1, 5, 9, 2, 6];
type Mode = 'seq' | 'par';
type CellState = '' | 'active' | 'combined' | 'final';

export default function MonoidDemo() {
  const [mode, setMode] = useState<Mode>('seq');
  const [cells, setCells] = useState<Record<number, CellState>>({});
  const [rounds, setRounds] = useState<number[][]>([]);
  const [result, setResult] = useState('');
  const [roundsNote, setRoundsNote] = useState('');
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setCells({});
    setRounds([]);
    setResult('');
    setRoundsNote('');
    setRunning(false);
  };

  const animate = () => {
    if (running) return;
    reset();
    setRunning(true);
    const queue: { delay: number; action: () => void }[] = [];

    if (mode === 'seq') {
      let running_sum = 0;
      DATA.forEach((v, i) => {
        running_sum += v;
        const rs = running_sum;
        queue.push({ delay: i * 220, action: () => setCells(c => ({ ...c, [i]: 'active' })) });
        queue.push({ delay: i * 220 + 140, action: () => setCells(c => ({ ...c, [i]: 'combined' })) });
      });
      const total_delay = DATA.length * 220 + 100;
      queue.push({ delay: total_delay, action: () => { setResult(`Sum = ${DATA.reduce((a, b) => a + b, 0)}`); setRoundsNote(`${DATA.length - 1} serial operations`); setRunning(false); } });
    } else {
      let cur = [...DATA];
      let delay = 0;
      let roundCount = 0;
      const allRounds: number[][] = [];
      while (cur.length > 1) {
        const next: number[] = [];
        for (let i = 0; i < cur.length; i += 2) {
          next.push(i + 1 < cur.length ? cur[i] + cur[i + 1] : cur[i]);
        }
        allRounds.push(next);
        const d = delay;
        const nr = [...next];
        queue.push({ delay: d, action: () => setRounds(r => [...r, nr]) });
        cur = next;
        delay += 400;
        roundCount++;
      }
      queue.push({ delay: delay + 100, action: () => { setResult(`Sum = ${DATA.reduce((a, b) => a + b, 0)}`); setRoundsNote(`Only ${roundCount} parallel rounds (vs ${DATA.length - 1} serial)`); setRunning(false); } });
    }

    queue.forEach(({ delay, action }) => {
      const t = setTimeout(action, delay);
      timers.current.push(t);
    });
  };

  return (
    <div className="demo-box">
      <div className="demo-title">Summing [3, 1, 4, 1, 5, 9, 2, 6] — same answer, different structure</div>
      <div className="demo-hint">Because addition is associative (grouping doesn&apos;t matter), you can split the work and do it in parallel. Same result, fewer rounds.</div>
      <div className="btn-row" style={{ marginBottom: 14 }}>
        <button className={`btn ${mode === 'seq' ? 'active-mode amber' : ''}`} onClick={() => { setMode('seq'); reset(); }}>SEQUENTIAL</button>
        <button className={`btn ${mode === 'par' ? 'active-mode' : ''}`} onClick={() => { setMode('par'); reset(); }}>PARALLEL TREE</button>
      </div>
      <div className="mono-row">
        <div className="mono-lbl" style={{ fontSize: 10, color: 'var(--dimtxt)' }}>Input:</div>
        {DATA.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`mono-cell ${cells[i] || ''}`}>{v}</div>
            {i < DATA.length - 1 && <div className="mono-op">+</div>}
          </div>
        ))}
      </div>
      {rounds.map((row, ri) => (
        <div key={ri} className="mono-row slide-in">
          <div className="mono-lbl" style={{ fontSize: 10 }}>Round {ri + 1}:</div>
          {row.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="mono-cell combined">{v}</div>
              {i < row.length - 1 && <div className="mono-op">+</div>}
            </div>
          ))}
        </div>
      ))}
      {result && (
        <div className="mono-result slide-in">
          <span style={{ color: 'var(--teal)' }}>{result}</span>
          <div className="mono-rounds"><span className="rv">{roundsNote}</span></div>
        </div>
      )}
      <div className="btn-row">
        <button className="btn" onClick={animate} disabled={running}>▶ Animate</button>
        <button className="btn sm" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
