import { Form, Row, Typography } from "antd";
import React from "react";
import { CommonIcons } from "./TableActions.jsx/TableActions";
import { useEffect } from "react";
import { memo } from "react";

const FormTable2 = ({
  form,
  columns,
  listName,
  removableRows,
  nonRemovableColumns = 2,
  watchKeys,
  calculation,
  nonListWatchKeys,
  componentRequiredRef,
  addableRow,
  newRow,
  reverse,
  validatingRules,
}) => {
  const formValues = Form.useWatch();
  const addRow = (newRow) => {
    let obj = newRow ?? {};
    const names = columns.map((row) => row.name);
    if (!newRow) {
      names.map((name) => name !== "" && (obj[name] = ""));
    }

    const rows = form.getFieldValue(listName);
    console.log("these are the rows", rows);
    let arr = [];
    if (reverse) {
      arr = [...rows, obj];
    } else {
      arr = [obj, ...rows];
    }

    form.setFieldValue(listName, arr);
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
                // width: 30,
              }}
            >
              {addableRow && (
                <CommonIcons
                  size="large"
                  action="addRow"
                  onClick={() => addRow(newRow)}
                />
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
          height: "99%",
          width: "100%",
        }}
      >
        <Form.List
          name={listName}
          rules={validatingRules ?? []}
          style={{
            width: "fit-content",
            height: "100%",
          }}
        >
          {(fields, { add, remove }) =>
            fields.map((field, index) => (
              <SingleRow
                field={field}
                fieldsLength={fields.length}
                nonRemovableColumns={nonRemovableColumns}
                removableRows={removableRows}
                remove={remove}
                index={index}
                columns={columns}
                listName={listName}
                watchKeys={watchKeys}
                form={form}
                calculation={calculation}
                formValues={formValues}
                nonListWatchKeys={nonListWatchKeys}
                componentRequiredRef={componentRequiredRef}
              />
            ))
          }
        </Form.List>
        <Row justify="center" align="middle">
          <Typography.Text type="secondary">
            ----End of the List----
          </Typography.Text>
        </Row>
      </tbody>
    </table>
  );
};

export default FormTable2;

const SingleRow = memo(
  ({
    field,
    fieldsLength,
    nonRemovableColumns = 1,
    removableRows,
    remove,
    index,
    columns,
    watchKeys = [],
    listName,
    form,
    calculation,
    nonListWatchKeys = [],
    componentRequiredRef = [],
  }) => {
    console.log("this is the field", field);
    const watchValues = watchKeys.map((val) =>
      form.getFieldValue([listName, field.name, val])
    );
    const nonListWatchValues = nonListWatchKeys.map((val) =>
      form.getFieldValue(val)
    );
    const componentRequiredValues = componentRequiredRef.map((val) =>
      form.getFieldValue([listName, field.name, val])
    );
    const valueObj = form.getFieldValue([listName, field.name]);
    const isComponentRequired = () => {
      let isRequired = false;
      componentRequiredValues.map((val) => {
        if (val && val.length > 0) {
          isRequired = true;
        }
      });
      return isRequired;
    };
    useEffect(() => {
      if (calculation) {
        let obj = {};

        watchKeys.map((key) => {
          obj = {
            ...obj,
            [key]: form.getFieldValue([listName, field.name, key]),
          };
        });
        calculation(field.name, obj);
      }
    }, [...[...watchValues, ...nonListWatchValues]]);
    return (
      <Form.Item noStyle>
        <tr align="middle" key={field.key} style={tableColumnStyle}>
          {removableRows && (
            <td
              style={{
                whiteSpace: "nowrap",
                width: 38,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {fieldsLength > nonRemovableColumns && (
                <CommonIcons action="removeRow" onClick={() => remove(index)} />
              )}
            </td>
          )}
          {columns.map((row, columnIndex) =>
            !row.conditional ? (
              <td key={columnIndex} style={columnCellStyle(row, index)}>
                <Form.Item
                  validateStatus={row.validateStatus}
                  help={row.help}
                  rules={
                    isComponentRequired()
                      ? [
                          {
                            required: true,
                            message: `${row.headerName} is required`,
                          },
                        ]
                      : row.rules ?? []
                  }
                  name={[field.name, row.name]}
                  style={{
                    margin: 0,
                    padding: 0,
                    display: row.justify && "flex",
                    justifyContent: row.justify,
                  }}
                  validateTrigger="onBlur"
                >
                  {row.field({ fieldName: field.name, ...valueObj }, index)}
                </Form.Item>
              </td>
            ) : (
              row.condition({ fieldName: field.name, ...valueObj }, index) && (
                <td style={columnCellStyle(row, index)}>
                  <Form.Item
                    rules={
                      isComponentRequired() && [
                        {
                          required: true,
                          message: `${row.headerName} is required`,
                        },
                      ]
                    }
                    name={[field.name, row.name]}
                    style={{
                      margin: 0,
                      padding: 0,
                      display: row.justify && "flex",
                      justifyContent: row.justify,
                    }}
                    validateTrigger="onBlur"
                  >
                    {row.field({ fieldName: field.name, ...valueObj }, index)}
                  </Form.Item>
                </td>
              )
            )
          )}
        </tr>
      </Form.Item>
    );
  }
);
const columnHeaderStyle = (col) => ({
  whiteSpace: "nowrap",
  width: col?.width,
  flex: col?.flex && 1,
  margin: "0px 1px",
  background: "#f5f5f5",
  borderRadius: 3,
  padding: 8,
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

// const rules = {
//   hsn: [
//     {
//       required: true,
//       message: "Please enter a hsn code!",
//     },
//   ],
//   location: [
//     {
//       required: true,
//       message: "Please select a Location!",
//     },
//   ],
// };
