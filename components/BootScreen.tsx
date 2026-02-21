'use client';
import { useEffect, useState } from 'react';

const LOGO = `  ███████╗██████╗     ██╗███╗   ██╗███████╗██╗ ██████╗ ██╗  ██╗████████╗███████╗
  ██╔════╝██╔══██╗    ██║████╗  ██║██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝██╔════╝
  █████╗  ██████╔╝    ██║██╔██╗ ██║███████╗██║██║  ███╗███████║   ██║   ███████╗
  ██╔══╝  ██╔═══╝     ██║██║╚██╗██║╚════██║██║██║   ██║██╔══██║   ██║   ╚════██║
  ██║     ██║         ██║██║ ╚████║███████║██║╚██████╔╝██║  ██║   ██║   ███████║
  ╚═╝     ╚═╝         ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝`;

const MESSAGES = [
  { t: 200,  cls: '',     txt: '[  OK  ] Loading kernel modules...' },
  { t: 450,  cls: 'ok',  txt: '[  OK  ] Functional core initialized' },
  { t: 700,  cls: 'ok',  txt: '[  OK  ] Pure function registry loaded (10 concepts)' },
  { t: 950,  cls: '',    txt: '[ WARN ] Side effects detected — quarantining to thin shell...' },
  { t: 1150, cls: 'ok',  txt: '[  OK  ] Referential transparency: ENABLED' },
  { t: 1350, cls: 'ok',  txt: '[  OK  ] Immutable data structures mounted' },
  { t: 1600, cls: 'ok',  txt: '[  OK  ] Interactive demos compiled' },
  { t: 1800, cls: 'ok',  txt: '[  OK  ] Glossary: 17 terms indexed' },
];

const CMD = 'open fp-insights.db --interactive';

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<{ cls: string; txt: string }[]>([]);
  const [cmd, setCmd] = useState('');
  const [out, setOut] = useState(false);

  useEffect(() => {
    MESSAGES.forEach(({ t, cls, txt }) => {
      setTimeout(() => setLines(l => [...l, { cls, txt }]), t);
    });
    // Type the command
    setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setCmd(CMD.slice(0, ++i));
        if (i >= CMD.length) {
          clearInterval(iv);
          setTimeout(() => { setOut(true); setTimeout(onDone, 600); }, 400);
        }
      }, 38);
    }, 2100);
  }, [onDone]);

  return (
    <div className={`boot-overlay${out ? ' out' : ''}`}>
      <div className="boot-content">
        <pre className="boot-logo">{LOGO}</pre>
        {lines.map((l, i) => (
          <div key={i} className={`boot-line ${l.cls}`}>{l.txt}</div>
        ))}
        <div className="boot-prompt" style={{ marginTop: '1.2rem' }}>
          <span className="prompt-user">root@fp-insights</span>
          <span style={{ color: 'var(--dimtxt)' }}>:</span>
          <span className="prompt-path">~</span>
          <span className="prompt-dollar" style={{ color: 'var(--dimtxt)' }}>$</span>
          {' '}{cmd}<span className="cursor">█</span>
        </div>
      </div>
    </div>
  );
}
