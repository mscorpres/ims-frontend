import dayjs from "dayjs";

export const convertSelectOptions = (arr, label, value) => {
  if (arr.map) {
    return arr.map((row) => ({
      text: row[label ?? "text"],
      value: row[value ?? "id"],
    }));
  }
};

export const removeHtml = (value) => {
  return value.replace(/<[^>]*>/g, " ");
};
export const getInt = (value, decimal) => {
  return +Number(value ?? "0").toFixed(decimal ?? 3);
};

export const convertDate = (date, format = "DD-MM-YYYY") => {
  return dayjs(date).format(format);
};
