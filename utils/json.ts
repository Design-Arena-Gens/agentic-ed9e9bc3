export function tryParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const value = JSON.parse(text);
    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Invalid JSON' };
  }
}

export function summarizeJson(value: unknown): { type: string; size?: number; keys?: number } {
  if (Array.isArray(value)) {
    return { type: 'array', size: value.length };
    
  }
  if (value !== null && typeof value === 'object') {
    return { type: 'object', keys: Object.keys(value as any).length };
  }
  return { type: typeof value } as any;
}

export function arrayOfObjectsToCsv(rows: Array<Record<string, unknown>>): string {
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach(k => set.add(k));
    return set;
  }, new Set<string>()))

  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape((row as any)[h])).join(','));
  }
  return lines.join('\n');
}

export function isArrayOfRecords(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.every(v => v && typeof v === 'object' && !Array.isArray(v));
}
