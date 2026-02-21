'use client';
import { useRef, useState } from 'react';

function goodReverse<T>(arr: T[]): T[] { return [...arr].reverse(); }
function buggyReverse<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr;
  return [...arr].reverse().slice(0, -1);
}
function randArr(): number[] {
  const n = Math.floor(Math.random() * 8);
  return Array.from({ length: n }, () => Math.floor(Math.random() * 20) - 5);
}

export default function PBTDemo() {
  const [hasBug, setHasBug] = useState(false);
  const [lines, setLines] = useState<{ cls: string; txt: string }[]>([{ cls: 'info', txt: '// Press "Run 100 Tests" to generate random test cases...' }]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLine = (txt: string, cls: string) => {
    setLines(l => [...l, { cls, txt }]);
    setTimeout(() => { if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight; }, 10);
  };

  const clear = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLines([{ cls: 'info', txt: '// Press "Run 100 Tests" to generate random test cases...' }]);
    setProgress('');
    setRunning(false);
  };

  const runTests = () => {
    if (running) return;
    setRunning(true);
    setLines([
      { cls: 'info', txt: `// Property: reverse(reverse(xs)) === xs` },
      { cls: 'info', txt: `// Bug mode: ${hasBug ? 'ON — reverse loses first element' : 'OFF — correct'}` },
    ]);

    let i = 0, passed = 0, failedAt: number | null = null;
    const rev = hasBug ? buggyReverse : goodReverse;

    timerRef.current = setInterval(() => {
      if (i >= 100 || (failedAt !== null && i > failedAt + 3)) {
        clearInterval(timerRef.current!);
        setProgress('');
        if (failedAt !== null) {
          addLine(`✗ FAILED after ${passed} passed tests`, 'sum');
        } else {
          addLine(`✓ PASSED — 100 tests, all properties hold`, 'oksum');
        }
        setRunning(false);
        return;
      }
      const xs = randArr();
      const result = rev(rev(xs));
      const ok = JSON.stringify(result) === JSON.stringify(xs);
      if (ok) {
        if (i < 15 || i % 10 === 0) addLine(`  Test ${String(i + 1).padStart(3)}: [${xs.join(',')}] ✓`, 'pass');
        passed++;
      } else if (failedAt === null) {
        failedAt = i;
        addLine(`  Test ${String(i + 1).padStart(3)}: [${xs.join(',')}] ✗  ← COUNTEREXAMPLE FOUND`, 'fail');
        addLine(`    Input:    [${xs.join(',')}]`, 'fail');
        addLine(`    Got:      [${rev(rev(xs)).join(',')}]`, 'fail');
        addLine(`    Expected: [${xs.join(',')}]`, 'fail');
      }
      i++;
      setProgress(`Running... ${i}/100`);
    }, 25);
  };

  return (
    <div className="demo-box">
      <div className="demo-title">Property: reverse(reverse(xs)) === xs for ALL lists xs</div>
      <div className="demo-hint">Instead of writing specific test cases, we write a rule and let the machine test it with 100 random inputs.</div>
      <div className="btn-row" style={{ marginBottom: 12 }}>
        <label className="toggle-row">
          <div className={`toggle${hasBug ? ' on' : ''}`} onClick={() => setHasBug(b => !b)} />
          <span style={{ color: hasBug ? 'var(--red)' : 'var(--dimtxt)' }}>
            {hasBug ? '🐛 Bug ON: reverse loses first element' : 'Inject Bug (turn ON to break the function)'}
          </span>
        </label>
      </div>
      <div className="pbt-console" ref={consoleRef}>
        {lines.map((l, i) => <div key={i} className={`pbt-line ${l.cls}`}>{l.txt}</div>)}
      </div>
      <div className="pbt-running">{progress}</div>
      <div className="btn-row">
        <button className="btn" onClick={runTests} disabled={running}>▶ Run 100 Tests</button>
        <button className="btn sm" onClick={clear}>Clear</button>
      </div>
    </div>
  );
}
