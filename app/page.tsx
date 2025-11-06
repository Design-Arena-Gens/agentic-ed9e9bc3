"use client";
import React from 'react';
import { JsonTree } from "@components/JsonTree";
import { arrayOfObjectsToCsv, isArrayOfRecords, summarizeJson, tryParseJson } from "@utils/json";

export default function Page() {
  const [raw, setRaw] = React.useState('');
  const [data, setData] = React.useState<unknown | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  const summary = React.useMemo(() => data != null ? summarizeJson(data) : null, [data]);

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setRaw(text);
      const res = tryParseJson(text);
      if (res.ok) { setData(res.value); setError(null); }
      else { setError(res.error); setData(null); }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  }

  function onPasteJson() {
    const res = tryParseJson(raw);
    if (res.ok) { setData(res.value); setError(null); }
    else { setError(res.error); setData(null); }
  }

  function download(content: string, filename: string, mime = 'application/octet-stream') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPretty() {
    if (data == null) return;
    download(JSON.stringify(data, null, 2), 'data.pretty.json', 'application/json');
  }

  function exportMin() {
    if (data == null) return;
    download(JSON.stringify(data), 'data.min.json', 'application/json');
  }

  function exportCsv() {
    if (!isArrayOfRecords(data)) return;
    const csv = arrayOfObjectsToCsv(data);
    download(csv, 'data.csv', 'text/csv');
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>JSON Explorer</h1>
        <div className="toolbar">
          <button className="button" onClick={() => fileInputRef.current?.click()}>Upload JSON</button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => {
            const f = e.target.files?.[0]; if (f) onFile(f);
          }} />
          <button className="button secondary" onClick={exportPretty} disabled={!data}>Download pretty</button>
          <button className="button secondary" onClick={exportMin} disabled={!data}>Download minified</button>
          <button className="button secondary" onClick={exportCsv} disabled={!isArrayOfRecords(data)}>Export CSV</button>
        </div>
      </div>

      <div className="grid">
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>Paste JSON</strong>
          <textarea className="textarea" placeholder="Paste JSON here" value={raw} onChange={(e) => setRaw(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button" onClick={onPasteJson}>Parse</button>
            <button className="button secondary" onClick={() => { setRaw(''); setData(null); setError(null); setQuery(''); }}>Clear</button>
          </div>
          <div className="small">Alternatively, use the Upload button to select a .json file from your computer.</div>
          {error && <div className="small" style={{ color: '#b91c1c' }}>{error}</div>}
        </section>

        <section className="card">
          <strong>Search</strong>
          <input className="input" placeholder="Search keys or values" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="small">Highlights matching substrings. Search is case-insensitive.</div>
          {summary && (
            <dl className="kv" style={{ marginTop: 12 }}>
              <dt>Type</dt><dd>{summary.type}</dd>
              {summary.size !== undefined && (<><dt>Size</dt><dd>{summary.size}</dd></>)}
              {summary.keys !== undefined && (<><dt>Keys</dt><dd>{summary.keys}</dd></>)}
            </dl>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        {data == null ? (
          <div className="drop">
            Drop a JSON file here or use the controls above
          </div>
        ) : (
          <JsonTree data={data as any} query={query} />
        )}
      </section>
    </div>
  );
}
