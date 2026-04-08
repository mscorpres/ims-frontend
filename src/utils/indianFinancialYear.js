export function getIndianFinancialYearStartYear(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return m >= 3 ? y : y - 1;
}

export function mergeMsmeYearOptions(legacyOptions, now = new Date()) {
  const currentStart = getIndianFinancialYearStartYear(now);
  const byKey = new Map();
  for (const o of legacyOptions) {
    const key = String(o.value).replaceAll(/\s+/g, "");
    if (!byKey.has(key)) byKey.set(key, { text: o.text, value: o.value });
  }
  const keys = [...byKey.keys()];
  const legacyMin =
    keys.length > 0
      ? Math.min(
          ...keys.map((k) => Number.parseInt(String(k).split("-")[0], 10)),
        )
      : currentStart;
  const minStart = Math.min(legacyMin, currentStart);
  for (let y = minStart; y <= currentStart; y++) {
    const key = `${y}-${y + 1}`;
    if (!byKey.has(key)) byKey.set(key, { text: `${y}-${y + 1}`, value: key });
  }
  return [...byKey.values()].sort(
    (a, b) =>
      Number.parseInt(String(b.value).split("-")[0], 10) -
      Number.parseInt(String(a.value).split("-")[0], 10),
  );
}
