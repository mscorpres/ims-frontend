const FINANCIAL_YEAR_START_MONTH_INDEX = 3; // April (0-based month index)
const DEFAULT_FINANCIAL_YEAR_START_SHORT = 22; // 22-23

const toTwoDigitYear = (year) => String(year).slice(-2);

export const getFinancialYearValueFromDate = (date = new Date()) => {
  const currentYear = date.getFullYear();
  const month = date.getMonth();
  const startYear =
    month >= FINANCIAL_YEAR_START_MONTH_INDEX ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return `${toTwoDigitYear(startYear)}-${toTwoDigitYear(endYear)}`;
};

export const getFinancialYearLabelFromValue = (value) => {
  const [start, end] = String(value).split("-");
  if (!start || !end) return String(value);
  return `20${start}-20${end}`;
};

export const getFinancialYearOptions = (
  startShortYear = DEFAULT_FINANCIAL_YEAR_START_SHORT,
  date = new Date()
) => {
  const [currentStart] = getFinancialYearValueFromDate(date).split("-");
  const endShortYear = Number(currentStart);
  const options = [];

  for (let year = startShortYear; year <= endShortYear; year += 1) {
    const nextYear = year + 1;
    const value = `${String(year).padStart(2, "0")}-${String(nextYear).padStart(
      2,
      "0"
    )}`;
    options.push({
      label: getFinancialYearLabelFromValue(value),
      value,
    });
  }

  return options;
};

export const getDefaultFinancialYearValue = () => getFinancialYearValueFromDate();

/** Parse "YY-YY" start year for comparison (Indian FY labels like 26-27). */
const parseFinancialYearStart = (value) => {
  const part = String(value ?? "").trim().split("-")[0];
  const n = Number.parseInt(part, 10);
  return Number.isFinite(n) ? n : null;
};

/**
 * If persisted session is an earlier financial year than today, return the current FY value.
 * Otherwise return the persisted value unchanged (same FY or user viewing a future/later FY).
 */
export const resolveSessionFinancialYear = (persistedSession) => {
  const current = getFinancialYearValueFromDate();
  if (persistedSession == null || String(persistedSession).trim() === "") {
    return current;
  }
  const storedStart = parseFinancialYearStart(persistedSession);
  const currentStart = parseFinancialYearStart(current);
  if (storedStart === null || currentStart === null) {
    return current;
  }
  if (storedStart < currentStart) {
    return current;
  }
  return String(persistedSession).trim();
};

/**
 * One-time storage sync on load: when calendar rolls into a new FY, replace stale
 * session in localStorage so headers and Session dropdown default to e.g. 26-27.
 */
export function migrateFinancialYearSessionInStorage() {
  if (typeof localStorage === "undefined") {
    return;
  }
  const other = JSON.parse(localStorage.getItem("otherData") || "{}");
  const loggedRaw = localStorage.getItem("loggedInUser");
  const logged = loggedRaw ? JSON.parse(loggedRaw) : null;
  const raw = other?.session ?? logged?.session ?? null;
  if (raw == null || String(raw).trim() === "") {
    return;
  }
  const resolved = resolveSessionFinancialYear(raw);
  if (resolved === raw) {
    return;
  }
  localStorage.setItem(
    "otherData",
    JSON.stringify({ ...other, session: resolved })
  );
  if (logged) {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ ...logged, session: resolved })
    );
  }
}
