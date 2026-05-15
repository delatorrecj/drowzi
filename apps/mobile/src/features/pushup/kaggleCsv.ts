export type CsvAngleRow = { frame: number; angleDeg: number };

/** Expect header: frame, angle_deg */
export function parseAngleSeriesCsv(csvText: string): CsvAngleRow[] {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim());
  const frameIdx = header.indexOf('frame');
  const angleIdx = header.indexOf('angle_deg');
  if (frameIdx < 0 || angleIdx < 0) {
    throw new Error('CSV must include columns: frame, angle_deg');
  }

  const rows: CsvAngleRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const frame = Number(cols[frameIdx]);
    const angleDeg = Number(cols[angleIdx]);
    if (Number.isFinite(frame) && Number.isFinite(angleDeg)) {
      rows.push({ frame, angleDeg });
    }
  }
  return rows.sort((a, b) => a.frame - b.frame);
}
