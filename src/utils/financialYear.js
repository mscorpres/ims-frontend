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
