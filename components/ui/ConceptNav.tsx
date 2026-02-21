'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Concept } from '@/lib/types';
import { isDone, markDone } from '@/lib/progress';

interface Props {
  conceptId: string;
  prev: Concept | null;
  next: Concept | null;
}

export default function ConceptNav({ conceptId, prev, next }: Props) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(isDone(conceptId));
  }, [conceptId]);

  const handleMarkDone = () => {
    markDone(conceptId);
    setDone(true);
    window.dispatchEvent(new Event('fp-progress'));
  };

  return (
    <div className="concept-nav">
      {prev ? (
        <Link href={`/concepts/${prev.id}`} className="nav-btn">
          <span className="dir">◀ PREV</span>
          <span className="nname">{prev.title}</span>
        </Link>
      ) : <div />}
      <button className="nav-btn mark-done-btn" onClick={handleMarkDone}>
        <span className="dir">{done ? '✓ COMPLETED' : 'MARK COMPLETE'}</span>
        <span className="nname">{done ? 'Well done!' : 'Press when done'}</span>
      </button>
      {next ? (
        <Link href={`/concepts/${next.id}`} className="nav-btn right">
          <span className="dir">NEXT ▶</span>
          <span className="nname">{next.title}</span>
        </Link>
      ) : <div />}
    </div>
  );
}
