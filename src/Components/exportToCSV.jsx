import * as xlsx from "xlsx";

const mergeRows = (rows) => {
  return rows.map((row) => {
    const newRow = row.reduce((r, c) => ({ ...r, ...c }), {});
    return newRow;
  });
};
const arrayFromObject = (rows, columnsFields) => {
  const finalRows = rows.map((row) => {
    let obj = row;
    let arr = [];
    columnsFields.map((key) => {
      // if (obj[key] != undefined) {
      arr = [...arr, obj[key] ?? "--"];
      // }
    });
    return arr;
  });

  return finalRows;
};
const cleanString = (str) => {
  return str
    .toString()
    .replaceAll(",", ";")
    .replaceAll(";", "")
    .replaceAll("/n", " ")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ")
    .replaceAll("/r", " ")
    .replaceAll("<br>", " ");
};

export const downloadCSVAntTable = (rows, columns, name) => {
  try {
    let arr1 = [];

    let arr = rows.map((row) => {
      return columns.map((col) => {
        if (col.type != "actions") {
          if (row[col.dataIndex] || row[col.dataIndex] == "0") {
            return {
              [col.headerName]: row[col.dataIndex],
            };
          } else {
            return { [col.headerName]: "" };
          }
        }
      });
    });

    arr = mergeRows(arr);

    arr.map((row) => {
      let obj = {};

      for (var key in row) {
        if (key !== "id") {
          obj = {
            ...obj,
            [key]: row[key]
              ? row[key].toString().includes("/")
                ? cleanString(row[key])
                : cleanString(row[key])
              : "--",
          };
        }
      }
      delete obj["id"];
      arr1.push(obj);
    });

    let headers = [];
    let data = [];

    for (let key in arr1[0]) {
      headers.push(key);
    }
    data = arr1.map((row) => {
      let arr2 = [];
      for (let key in row) {
        arr2.push(row[key]);
      }

      return arr2;
    });

    exportCSVFile([headers, ...data], name ? name : "File");
  } catch (error) {
    console.error(error);
  }
};

export const downloadCSV = (rows, columns, name, newRows) => {
  try {
    const columnsArr = columns
      .filter((row) => row.type !== "actions")
      .map((row) => row.headerName);
    const columnsFields = columns
      .filter((row) => row.type !== "actions")
      .map((row) => row.field);
    const processedRows = rows.map(row => ({
      ...row,
      alts: Array.isArray(row.alts)
        ? row.alts.map(alt => alt.alt_component_part).join(" | ")
        : ""
    }));

    let rowsArr = arrayFromObject(processedRows, columnsFields);
    rowsArr.unshift(columnsArr);

    if (newRows) {
      const processedNewRows = newRows.map(row => ({
        ...row,
        alts: Array.isArray(row.alts)
          ? row.alts.map(alt => alt.alt_component_part).join(" | ")
          : ""
      }));

      const newRowsTemp = arrayFromObject(processedNewRows, columnsFields);
      newRowsTemp.map((row) => rowsArr.unshift(row));
    }

    exportCSVFile(rowsArr, name ?? "File");
  } catch (error) {
    console.error(error);
  }
};

export const downloadCSVnested = (rows, columns, name, newRows) => {
  try {
    const columnsArr = columns
      .filter((row) => row.type !== "actions")
      .map((row) => row.title);
    const columnsFields = columns.map((row) => row.key);

    const rowsArr = arrayFromObject(rows, columnsFields);

    rowsArr.unshift(columnsArr);
    if (newRows) {
      const newRowsTemp = arrayFromObject(newRows, columnsFields);
      newRowsTemp.map((row) => rowsArr.unshift(row));
    }
    exportCSVFile(rowsArr, name ?? "File");
  } catch (error) {
    console.error(error);
  }
};

export const downloadCSVCustomColumns = (csvData, name) => {
  try {
    let arr1 = [];
    csvData.map((row) => {
      let obj = {};

      for (var key in row) {
        if (key !== "id") {
          obj = {
            ...obj,
            [key]: row[key]
              ? row[key].toString().includes("/")
                ? cleanString(row[key])
                : cleanString(row[key])
              : "--",
          };
        }
      }
      delete obj["id"];
      arr1.push(obj);
    });

    let headers = [];
    let data = [];

    for (let key in arr1[0]) {
      headers.push(key);
    }
    data = arr1.map((row) => {
      let arr2 = [];
      for (let key in row) {
        arr2.push(row[key]);
      }

      return arr2;
    });

    exportCSVFile([headers, ...data], name ? name : "File");
  } catch (error) {
    console.error(error);
  }
};

export function exportCSVFile(items, fileTitle) {
  let arr = items;
  // console.log("items here it is", items);
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(arr);
  xlsx.utils.book_append_sheet(wb, ws, "Sheet 1");
  xlsx.writeFile(wb, `${fileTitle}.xlsx`);
}

export const downloadCSVnested2 = (rows, columns, name, newRows) => {
  try {
    // Get the column headers and fields
    const columnsArr = columns
      .filter((row) => row.type !== "actions")
      .map((row) => row.headerName);
    const columnsFields = columns
      .filter((row) => row.type !== "actions")
      .map((row) => row.field);

    // Transform rows into an array of arrays (AoA)
    const rowsArr = rows.map((row) => {
      const transformedRow = { ...row };

      // Apply category transformation logic
      if (transformedRow.category === "") {
        transformedRow.category = "--";
      } else if (transformedRow.category === "services") {
        transformedRow.category = "Services";
      } else {
        transformedRow.category = "Goods";
      }

      // Transform status field correctly
      if (transformedRow.projectStatus === "") {
        transformedRow.projectStatus = "--";
      } else if (transformedRow.projectStatus === 0) {
        transformedRow.projectStatus = "InActive";
      } else {
        transformedRow.projectStatus = "Active";
      }

      if (transformedRow.status === "") {
        transformedRow.status = "--";
      } else if (transformedRow.status === 0|| transformedRow.status === "DISABLE") {
        transformedRow.status = "InActive";
      } else {
        transformedRow.status = "Active";
      }

      // Convert row object to array based on columnsFields
      return columnsFields.map((field) => {
        // Ensure that we handle missing fields correctly
        return transformedRow[field] !== undefined ? transformedRow[field] : "";
      });
    });

    // Add the column headers as the first row
    rowsArr.unshift(columnsArr);

    // If newRows are provided, apply the same transformation and add to rowsArr
    if (newRows) {
      const newRowsTemp = newRows.map((row) => {
        const transformedRow = { ...row };

        if (transformedRow.category === "") {
          transformedRow.category = "--";
        } else if (transformedRow.category === "services") {
          transformedRow.category = "Services";
        } else {
          transformedRow.category = "Goods";
        }

        return columnsFields.map((field) => transformedRow[field]);
      });

      newRowsTemp.forEach((row) => rowsArr.unshift(row));
    }

    // Call the function to export the CSV file
    exportCSVFile(rowsArr, name ?? "File");
  } catch (error) {
    console.error(error);
  }
};


