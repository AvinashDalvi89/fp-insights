'use client';
import { useState } from 'react';
import { GLOSSARY } from '@/lib/glossary';

export default function Glossary() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="glossary-btn" onClick={() => setOpen(true)}>? JARGON DECODER</button>
      <div className={`glossary-drawer${open ? ' open' : ''}`}>
        <div className="glossary-hdr">
          <h3>JARGON DECODER</h3>
          <button className="glossary-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="glossary-body">
          {GLOSSARY.map(t => (
            <div key={t.name} className="g-term">
              <div className="g-name">{t.name}</div>
              <div className="g-plain">{t.plain}</div>
              {t.example && <div className="g-code">e.g. {t.example}</div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
