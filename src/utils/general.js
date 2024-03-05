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
