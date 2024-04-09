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
  return +Number(value ?? "0").toFixed(decimal ?? 4);
};

export const convertDate = (date, format = "DD-MM-YYYY") => {
  return dayjs(date).format(format);
};

export const downloadFromLink = (uri) => {
  const splitArr = uri.split("/");
  const name = splitArr[splitArr.length - 1];
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // delete link;
};
