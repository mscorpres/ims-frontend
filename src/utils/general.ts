import dayjs from "dayjs";

export const convertSelectOptions = (
  arr: [],
  label?: string,
  value?: string
) => {
  if (arr.map) {
    return arr.map((row) => ({
      text: row[label ?? "text"],
      value: row[value ?? "id"],
    }));
  }
};

export const removeHtml = (value:any) => {
  return value.replace(/<[^>]*>/g, " ");
};
export const getInt = (value:any, decimal:any) => {
  return +Number(value ?? "0").toFixed(decimal ?? 4);
};

export const convertDate = (date:any, format = "DD-MM-YYYY") => {
  return dayjs(date).format(format);
};

export const downloadFromLink = (uri:any) => {
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
