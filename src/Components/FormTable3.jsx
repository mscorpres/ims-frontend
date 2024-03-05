import { memo, useCallback, useState } from "react";
import { Form, Row, Typography } from "antd";
import TableActions, { CommonIcons } from "./TableActions.jsx/TableActions";
import { v4 } from "uuid";
import { useEffect } from "react";
import { toast } from "react-toastify";

const validateTable = (rules, rows) => {
  let errors = false;
  let arr = rows;
  for (let key in rules) {
    arr = arr.map((row) => {
      let obj = { ...row };
      if (!obj[key] || obj[key] === "") {
        errors = rules[key][0]["message"];
        return {
          ...obj,
          error: true,
        };
      } else {
        return obj;
      }
    });
  }
  return { errors, arr };
};

export { validateTable };

const FormTable3 = ({
  columns,
  data,
  setData,
  calculation,
  newRow,
  removableRows,
  addableRow,
  rules,
}) => {
  const [editing, setEditing] = useState(false);
  const [editingRow, setEditingRow] = useState({});
  const addRows = (newRow) => {
    let newRowObj = {
      id: v4(),
    };
    if (newRow) {
      newRowObj = { id: v4(), ...newRow };
    }
    const rows = [...data, newRowObj];
    setData(rows);
  };
  const removeRow = (id) => {
    let rows = data;
    rows = rows.filter((row) => row.id !== id);
    setData(rows);

    // setData((rows) => rows.filter((row) => row.id !== id));
  };

  const validate = (rules, row) => {
    let errors = false;
    let obj = { ...row, error: false };
    for (let key in rules) {
      if (!obj[key] || obj[key] === "") {
        errors = rules[key][0]["message"];
        obj = {
          ...obj,
          error: true,
        };
      }
    }
    return { errors, obj };
  };

  const inputHandler = (value, id, name) => {
    if (calculation) {
      let newObj = editingRow;
      newObj = { ...newObj, [name]: value };
      return calculation(newObj, setEditingRow, name);
    } else {
      // let newObj = data.find((row) => row.id === id);
      let newObj = editingRow;
      console.log("this is the newobj", newObj);
      setEditingRow({ ...newObj, [name]: value });
    }
  };
  const saveRow = (id) => {
    let rows = data;
    let obj = editingRow;
    const { errors, obj: validatedObj } = validate(rules, obj);

    if (errors) {
      toast.error(errors);
    }
    obj = validatedObj;
    rows = rows.map((row) => {
      if (row.id === id) {
        return obj;
      }
      return row;
    });
    setData(rows);
    setEditingRow({});
    setEditing(false);
  };
  return (
    <table style={tableStyle}>
      <thead
        style={{
          width: "100%",
          display: "block",
          marginTop: 3,
          verticalAlign: "middle",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <tr style={tableHeaderStyle}>
          {removableRows && (
            <td
              style={{
                ...columnHeaderStyle(),
                width: 60,
              }}
            >
              {addableRow && (
                <CommonIcons action="addRow" onClick={() => addRows(newRow)} />
              )}
            </td>
          )}
          {columns.map((col) =>
            !col.conditional ? (
              <td style={columnHeaderStyle(col)}>
                <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                  {col.headerName}
                </Typography.Text>
              </td>
            ) : (
              col.condition() && (
                <td style={columnHeaderStyle(col)}>
                  <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                    {col.headerName}
                  </Typography.Text>
                </td>
              )
            )
          )}
        </tr>
      </thead>

      <tbody
        style={{
          display: "block",
          width: "100%",
          // height: "100%",
          // overflowY: "hidden",
        }}
      >
        {data.map((row, index) => (
          <WrappedChildComponent
            removableRows={removableRows}
            key={row.id}
            dataRow={row}
            index={index}
            dataLength={data.length}
            columns={columns}
            editingRow={editingRow}
            setEditing={setEditing}
            setEditingRow={setEditingRow}
            saveRow={saveRow}
            editing={editing}
            calculation={calculation}
            removeRow={removeRow}
            inputHandler={inputHandler}
          />
        ))}

        <Row justify="center" align="middle">
          <Typography.Text type="secondary">
            ----End of the List----
          </Typography.Text>
        </Row>
      </tbody>
    </table>
  );
};

export default FormTable3;

const SingleRow = ({
  dataLength,
  nonRemovableColumns = 1,
  removableRows,
  removeRow,
  index,
  columns,
  calculation,
  editing,
  saveRow,
  inputHandler,
  dataRow,
  setEditing,
  setEditingRow,
  editingRow,
}) => {
  return (
    <tr
      align="middle"
      key={dataRow.id}
      style={{
        ...tableColumnStyle,
        background: dataRow.error ? "#ff00005f" : "#fff",
      }}
    >
      {removableRows && (
        <td
          style={{
            whiteSpace: "nowrap",
            width: 30,
          }}
        >
          {editing !== dataRow.id && dataLength > nonRemovableColumns && (
            <CommonIcons
              action="removeRow"
              onClick={() => removeRow(dataRow.id)}
            />
          )}
        </td>
      )}
      {!editing && (
        <td>
          <TableActions
            action="edit"
            onClick={() => {
              setEditing(dataRow.id);
              setEditingRow(dataRow);
            }}
          />
        </td>
      )}
      {editing === dataRow.id && (
        <td>
          <TableActions action="save" onClick={() => saveRow(dataRow.id)} />
          <TableActions action="cancel" onClick={() => setEditing(false)} />
        </td>
      )}

      {columns.map((row, columnIndex) =>
        !row.conditional ? (
          <td key={columnIndex} style={columnCellStyle(row, index)}>
            {row.name !== "index" && editing === dataRow.id ? (
              row.field(
                editing === dataRow.id ? editingRow : dataRow,
                index,
                inputHandler,
                row.name
              )
            ) : (
              <Typography.Text>
                {dataRow[row.name]?.label || dataRow[row.name]?.label === ""
                  ? dataRow[row.name].label
                  : dataRow[row.name] ?? ""}
              </Typography.Text>
            )}
            {row.name === "index" && (
              <Typography.Text type="secondary">{index + 1}</Typography.Text>
            )}
          </td>
        ) : (
          row.condition() && (
            <td style={columnCellStyle(row, index)}>{row.field(index)}</td>
          )
        )
      )}
    </tr>
  );
};
const WrappedChildComponent = memo(SingleRow);
const columnHeaderStyle = (col) => ({
  whiteSpace: "nowrap",
  width: col?.width,
  flex: col?.flex && 1,
  margin: "0px 1px",
  background: "#f5f5f5",
  borderRadius: 3,
});

const columnCellStyle = (row, index) => ({
  whiteSpace: "nowrap",
  width: row.width,
  flex: row.flex && 1,
  background: index % 2 === 0 && "#f5f5f57f",
  margin: "0px 1px",
});
const tableStyle = {
  display: "block",
  height: "100%",
  width: "100%",
  overflowX: "scroll",
  overflowY: "auto",
  padding: 0,
};
const tableHeaderStyle = {
  display: "flex",
  minWidth: "100%",
  width: "fit-content",
  borderRadius: 5,
};
const tableColumnStyle = {
  display: "flex",
  minWidth: "100%",
  width: "fit-content",

  marginTop: 3,
  borderRadius: 5,
};

const rules = {
  hsn: [
    {
      required: true,
      message: "Please enter a hsn code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
};
