export const s = (v: unknown, def = ""): string =>
  typeof v === "string" ? v : v == null ? def : String(v);

export const a = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter(Boolean).map(String) : v ? [String(v)] : [];

export const yearFromPeriod = (period?: string) => {
  const str = s(period);
  const match = str.match(/^\d{4}/);
  return match?.[0] ?? "";                         // "2025" or ""
};

export const quarterFromPeriod = (period?: string) => {
  const str = s(period);
  const match = str.match(/Q([1-4])/i);
  return match?.[1] ?? "";                      // "1".."4" or ""
};
