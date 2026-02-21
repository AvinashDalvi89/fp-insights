'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONCEPTS } from '@/lib/concepts';
import { getCompleted } from '@/lib/progress';

export default function Sidebar() {
  const pathname = usePathname();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getCompleted());
    const handler = () => setCompleted(getCompleted());
    window.addEventListener('fp-progress', handler);
    return () => window.removeEventListener('fp-progress', handler);
  }, [pathname]);

  const parts = [...new Set(CONCEPTS.map(c => c.part))];
  const pct = Math.round((completed.length / CONCEPTS.length) * 100);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">FP INSIGHTS</div>
        <div className="sidebar-sub">// Functional Programming in Scala</div>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className={`nav-item${pathname === '/' ? ' active' : ''}`}>
          <span className="nav-num">⌂</span>
          <span>Home</span>
        </Link>
        <Link href="/reference" className={`nav-item${pathname === '/reference' ? ' active' : ''}`}>
          <span className="nav-num">☰</span>
          <span>Full Reference</span>
        </Link>
        {parts.map(part => (
          <div key={part}>
            <div className="nav-section">{part}</div>
            {CONCEPTS.filter(c => c.part === part).map(c => {
              const active = pathname === `/concepts/${c.id}`;
              const done   = completed.includes(c.id);
              return (
                <Link
                  key={c.id}
                  href={`/concepts/${c.id}`}
                  className={`nav-item${active ? ' active' : ''}${done ? ' done' : ''}`}
                >
                  <span className="nav-num">{c.num}</span>
                  <span className="nav-lbl">{c.title}</span>
                  <span className="nav-check">✓</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="prog-label">{completed.length} / {CONCEPTS.length} complete</div>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </aside>
  );
}
