"use client";
import React from 'react';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
interface JsonArray extends Array<JsonValue> {}

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value);
}

function stringifyValue(v: Exclude<JsonValue, JsonObject | JsonArray>): string {
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

function pathKey(path: (string | number)[]): string {
  return path.join('.');
}

function includesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="highlight">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function JsonTree({ data, query = '' }: { data: JsonValue; query?: string }) {
  return (
    <div className="tree">
      <Node value={data} path={[]} query={query} depth={0} />
    </div>
  );
}

function Node({ value, path, query, depth }: { value: JsonValue; path: (string | number)[]; query: string; depth: number }) {
  const [open, setOpen] = React.useState(depth < 1);

  if (isObject(value)) {
    const keys = Object.keys(value);
    const count = keys.length;
    const label = `{${count}}`;
    const keyMatches = keys.some(k => includesQuery(k, query));

    return (
      <div>
        <div className="line">
          <button className="toggle" onClick={() => setOpen(o => !o)} aria-label="toggle">{open ? '?' : '+'}</button>
          <span className="type">object</span>
          <span className="value">{label}</span>
        </div>
        {open && (
          <div style={{ paddingLeft: 18 }}>
            {keys.map((k) => {
              const v = value[k];
              const keyNode = (
                <span className="key">{highlight(JSON.stringify(k), query)}</span>
              );
              return (
                <div key={pathKey([...path, k])}>
                  <div className="line">
                    <span>{keyNode}</span>
                    <span>: </span>
                    {isObject(v) || isArray(v) ? (
                      <Node value={v} path={[...path, k]} query={query} depth={depth + 1} />
                    ) : (
                      <span className="value">{highlight(stringifyValue(v as any), query)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (isArray(value)) {
    const count = value.length;
    const label = `[${count}]`;

    return (
      <div>
        <div className="line">
          <button className="toggle" onClick={() => setOpen(o => !o)} aria-label="toggle">{open ? '?' : '+'}</button>
          <span className="type">array</span>
          <span className="value">{label}</span>
        </div>
        {open && (
          <div style={{ paddingLeft: 18 }}>
            {value.map((v, i) => (
              <div key={pathKey([...path, i])} className="line">
                <span className="type">{i}:</span>
                {isObject(v) || isArray(v) ? (
                  <Node value={v} path={[...path, i]} query={query} depth={depth + 1} />
                ) : (
                  <span className="value">{highlight(stringifyValue(v as any), query)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="value">{stringifyValue(value)}</span>;
}
