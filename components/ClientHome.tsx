'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Concept } from '@/lib/types';
import { getCompleted } from '@/lib/progress';
import BootScreen from './BootScreen';

export default function ClientHome({ concepts }: { concepts: Concept[] }) {
  const [booted, setBooted] = useState(false);
  const [show, setShow] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const alreadyBooted = sessionStorage.getItem('fp_booted');
    if (alreadyBooted) {
      setBooted(true);
      setShow(true);
    }
    setCompleted(getCompleted());
  }, []);

  const handleBootDone = () => {
    sessionStorage.setItem('fp_booted', '1');
    setBooted(true);
    setTimeout(() => setShow(true), 100);
  };

  return (
    <>
      {!booted && <BootScreen onDone={handleBootDone} />}
      <div style={{ opacity: show ? 1 : 0, transition: 'opacity 0.4s' }}>
        <div className="home-hero">
          <h1>&gt; FP Insights<span className="cursor">█</span></h1>
          <p className="sub">
            An interactive deep-dive into <strong>Functional Programming in Scala</strong> — recommended by Boris (Anthropic CEO).
            <br />This is NOT a Scala book. These concepts apply in Python, JavaScript, Go, Rust — any language.
          </p>
          <div className="home-meta">10 concepts · Plain English · Interactive demos · Quizzes · Jargon glossary</div>
        </div>
        <div className="section-lbl">CHOOSE A CONCEPT</div>
        <div className="concept-grid">
          {concepts.map(c => (
            <Link key={c.id} href={`/concepts/${c.id}`} className={`card${completed.includes(c.id) ? ' done' : ''}`}>
              <div className="card-num">CONCEPT {c.num} · {c.part}</div>
              <div className="card-title">{c.title}</div>
              <div className="card-desc">{c.cardDesc}</div>
              <div className="card-tags">{c.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
