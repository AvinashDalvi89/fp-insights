'use client';
import { useRef, useState } from 'react';

const INPUT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
type CellState = '' | 'active' | 'done' | 'skipped' | 'emitted' | 'unneeded';
type Mode = 'strict' | 'lazy';

function mapFn(x: number) { return x * 2; }
function filterFn(x: number) { return x > 10; }

export default function PipelineDemo() {
  const [mode, setMode] = useState<Mode>('strict');
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [stats, setStats] = useState('');
  const [running, setRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCells({});
    setStats('');
    setRunning(false);
  };

  const setCell = (r: number, c: number, s: CellState) =>
    setCells(prev => ({ ...prev, [`${r}_${c}`]: s }));

  const run = () => {
    if (running) return;
    reset();
    setRunning(true);
    const queue: { delay: number; action: () => void }[] = [];
    let ops = 0;

    if (mode === 'strict') {
      INPUT.forEach((_, c) => {
        queue.push({ delay: c * 80,      action: () => setCell(0, c, 'active') });
        queue.push({ delay: c * 80 + 60, action: () => setCell(0, c, 'done') }); ops++;
      });
      INPUT.forEach((_, c) => {
        const pass = filterFn(mapFn(INPUT[c]));
        queue.push({ delay: 900 + c * 80,      action: () => setCell(1, c, 'active') });
        queue.push({ delay: 900 + c * 80 + 60, action: () => setCell(1, c, pass ? 'done' : 'skipped') }); ops++;
      });
      let t = 1800, taken = 0;
      INPUT.forEach((_, c) => {
        if (filterFn(mapFn(INPUT[c])) && taken < 3) {
          queue.push({ delay: t, action: () => setCell(2, c, 'emitted') }); t += 120; taken++; ops++;
        }
      });
      queue.push({ delay: t + 100, action: () => { setStats(`Strict: ${ops} total operations. All 10 elements × 3 pipeline stages = full scan.`); setRunning(false); } });
    } else {
      let delay = 0, taken = 0;
      for (let c = 0; c < INPUT.length && taken < 3; c++) {
        const filtered = filterFn(mapFn(INPUT[c]));
        const d = delay;
        const dc = c;
        queue.push({ delay: d,        action: () => setCell(0, dc, 'active') }); ops++;
        queue.push({ delay: d + 60,   action: () => setCell(0, dc, 'done') });
        queue.push({ delay: d + 100,  action: () => setCell(1, dc, 'active') }); ops++;
        if (filtered) {
          queue.push({ delay: d + 160,  action: () => setCell(1, dc, 'done') });
          queue.push({ delay: d + 200,  action: () => setCell(2, dc, 'active') }); ops++;
          queue.push({ delay: d + 260,  action: () => setCell(2, dc, 'emitted') });
          taken++;
        } else {
          queue.push({ delay: d + 160,  action: () => setCell(1, dc, 'skipped') });
        }
        delay += 300;
      }
      for (let c = 0; c < INPUT.length; c++) {
        if (!queue.find(q => q.action.toString().includes(`0, ${c},`))) {
          const dc = c;
          queue.push({ delay: delay + 50, action: () => { setCell(0, dc, 'unneeded'); setCell(1, dc, 'unneeded'); setCell(2, dc, 'unneeded'); } });
        }
      }
      queue.push({ delay: delay + 200, action: () => { setStats(`Lazy: only ${ops} operations! Stopped as soon as 3 results found. Never processed elements 7–10.`); setRunning(false); } });
    }

    queue.forEach(({ delay, action }) => {
      const t = setTimeout(action, delay);
      timersRef.current.push(t);
    });
  };

  const ROWS = ['map(x×2)', 'filter(x>10)', 'take(3)'];

  return (
    <div className="demo-box">
      <div className="demo-title">Pipeline: map(×2) → filter(&gt;10) → take(3)  |  Input: [1..10]</div>
      <div className="demo-hint">Strict processes everything first. Lazy processes one element at a time and stops early.</div>
      <div className="btn-row" style={{ marginBottom: 14 }}>
        <button className={`btn ${mode === 'strict' ? 'active-mode amber' : ''}`} onClick={() => { setMode('strict'); reset(); }}>STRICT (eager)</button>
        <button className={`btn ${mode === 'lazy' ? 'active-mode' : ''}`} onClick={() => { setMode('lazy'); reset(); }}>LAZY (fused)</button>
      </div>
      <div className="pipe-grid">
        {ROWS.map((lbl, r) => (
          <div key={r} className="pipe-row">
            <div className="pipe-lbl">{lbl}</div>
            {INPUT.map((v, c) => {
              const state = cells[`${r}_${c}`] || '';
              let content: string = String(v);
              if (state === 'done' || state === 'active') {
                if (r === 0) content = String(mapFn(v));
                else if (r === 1) content = filterFn(mapFn(v)) ? '✓' : '✗';
                else content = String(v);
              }
              if (state === 'emitted') content = '✓';
              if (state === 'skipped') content = '✗';
              if (state === 'unneeded') content = '–';
              return <div key={c} className={`pipe-cell ${state}`}>{content}</div>;
            })}
          </div>
        ))}
      </div>
      {stats && <div className="pipe-stats">{stats.includes('Strict') ? <span style={{ color: 'var(--red)' }}>{stats}</span> : <span style={{ color: 'var(--green)' }}>{stats}</span>}</div>}
      <div className="btn-row">
        <button className="btn" onClick={run} disabled={running}>▶ Animate</button>
        <button className="btn sm" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
