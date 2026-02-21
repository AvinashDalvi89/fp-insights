import fs from 'fs';
import path from 'path';

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    const [header, , ...body] = tableRows;
    const th = header.split('|').filter(Boolean).map(c =>
      `<th>${inline(c.trim())}</th>`).join('');
    const trs = body.map(r =>
      `<tr>${r.split('|').filter(Boolean).map(c => `<td>${inline(c.trim())}</td>`).join('')}</tr>`
    ).join('');
    out.push(`<table class="ref-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`);
    tableRows = [];
    inTable = false;
  };

  const flushList = () => {
    if (!listItems.length) return;
    out.push(`<ul class="ref-list">${listItems.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`);
    listItems = [];
    inList = false;
  };

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, '<code class="ref-code">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="ref-strong">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  for (const raw of lines) {
    const line = raw;

    // Code block start/end
    if (line.startsWith('```')) {
      if (inCode) {
        out.push(
          `<div class="ref-codeblock"><div class="ref-cblang">${codeLang || 'code'}</div><pre>${codeLines.join('\n')}</pre></div>`
        );
        codeLines = [];
        codeLang = '';
        inCode = false;
      } else {
        if (inTable) flushTable();
        if (inList) flushList();
        inCode = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // Table rows
    if (line.startsWith('|')) {
      if (inList) flushList();
      inTable = true;
      tableRows.push(line);
      continue;
    }
    if (inTable) flushTable();

    // List items
    if (/^[-*] /.test(line)) {
      listItems.push(line.slice(2));
      inList = true;
      continue;
    }
    if (inList && line.trim() === '') { flushList(); out.push('<div class="ref-gap"></div>'); continue; }
    if (inList) { listItems.push(line); continue; }

    // Headings
    if (line.startsWith('#### ')) { out.push(`<h4 class="ref-h4">${inline(line.slice(5))}</h4>`); continue; }
    if (line.startsWith('### '))  { out.push(`<h3 class="ref-h3">${inline(line.slice(4))}</h3>`); continue; }
    if (line.startsWith('## '))   { out.push(`<h2 class="ref-h2">${inline(line.slice(3))}</h2>`); continue; }
    if (line.startsWith('# '))    { out.push(`<h1 class="ref-h1">${inline(line.slice(2))}</h1>`); continue; }

    // Blockquote
    if (line.startsWith('> ')) { out.push(`<blockquote class="ref-bq">${inline(line.slice(2))}</blockquote>`); continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { out.push('<hr class="ref-hr" />'); continue; }

    // Blank line
    if (line.trim() === '') { out.push('<div class="ref-gap"></div>'); continue; }

    // Normal paragraph
    out.push(`<p class="ref-p">${inline(line)}</p>`);
  }

  if (inCode)  out.push(`<pre>${codeLines.join('\n')}</pre>`);
  if (inTable) flushTable();
  if (inList)  flushList();

  return out.join('\n');
}

export default function ReferencePage() {
  const filePath = path.join(process.cwd(), 'content', 'FP-in-Scala-Insights.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const html = renderMarkdown(raw);

  return (
    <>
      <style>{`
        .ref-page { max-width: 820px; }
        .ref-page a { color: var(--green); }
        .ref-h1 { color: var(--amber); font-size: 22px; margin: 1.5rem 0 .5rem; text-shadow: 0 0 20px rgba(255,183,0,.2); }
        .ref-h2 { color: var(--green); font-size: 17px; margin: 2rem 0 .5rem; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
        .ref-h3 { color: var(--teal); font-size: 14px; margin: 1.4rem 0 .4rem; letter-spacing: .5px; }
        .ref-h4 { color: var(--amber); font-size: 13px; margin: 1rem 0 .3rem; }
        .ref-p  { color: var(--gdim); line-height: 1.85; margin: .4rem 0; font-size: 13px; }
        .ref-strong { color: var(--green); font-weight: bold; }
        .ref-code { background: rgba(0,255,65,.06); border: 1px solid rgba(0,255,65,.15); padding: 1px 5px; color: var(--teal); font-size: 12px; }
        .ref-bq { border-left: 3px solid var(--amber); padding: .5rem 1rem; margin: .8rem 0; background: rgba(255,183,0,.03); color: var(--amber); font-size: 13px; }
        .ref-hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
        .ref-gap { height: .5rem; }
        .ref-list { padding-left: 1.4rem; margin: .4rem 0; }
        .ref-list li { color: var(--gdim); font-size: 13px; line-height: 1.8; list-style: none; padding-left: .5rem; }
        .ref-list li::before { content: '▸ '; color: var(--gdim); }
        .ref-table { border-collapse: collapse; width: 100%; font-size: 12.5px; margin: 1rem 0; }
        .ref-table th { text-align: left; color: var(--amber); padding: 6px 12px; border-bottom: 1px solid var(--border); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; background: rgba(255,183,0,.03); }
        .ref-table td { padding: 6px 12px; border-bottom: 1px solid var(--border); color: var(--gdim); line-height: 1.6; }
        .ref-table tr:hover td { background: rgba(0,255,65,.02); }
        .ref-codeblock { background: var(--bg2); border: 1px solid var(--border); margin: 1rem 0; overflow: hidden; }
        .ref-cblang { padding: 4px 12px; background: rgba(255,255,255,.02); border-bottom: 1px solid var(--border); color: var(--amber); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
        .ref-codeblock pre { padding: 1rem 1.2rem; font-size: 12px; color: var(--gdim); line-height: 1.65; overflow-x: auto; white-space: pre; }
      `}</style>

      <div className="ref-page">
        <div className="concept-hdr">
          <div className="concept-num">FULL REFERENCE · ALL CHAPTERS</div>
          <h1 className="concept-title">FP in Scala — Complete Insights</h1>
          <p className="concept-tagline">"What the book actually teaches, without the Scala"</p>
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );
}
