import { Form, Row, Typography } from "antd";
import { memo } from "react";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";

/** Space for fixed NavFooter at bottom of drawer */
const FOOTER_OFFSET = 56;

const MINComponentsTable = ({
  columns,
  listName,
  removableRows,
  nonRemovableColumns = 2,
  displayLabels = [],
}) => {
  return (
    <table style={tableStyle}>
      <thead style={theadStyle}>
        <tr style={tableHeaderStyle}>
          {removableRows && (
            <td style={{ ...columnHeaderStyle(), width: 30 }} />
          )}
          {columns.map((col) =>
            !col.conditional ? (
              <td
                key={col.name || col.headerName}
                style={columnHeaderStyle(col)}
              >
                <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                  {col.headerName}
                </Typography.Text>
              </td>
            ) : (
              col.condition() && (
                <td
                  key={col.name || col.headerName}
                  style={columnHeaderStyle(col)}
                >
                  <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                    {col.headerName}
                  </Typography.Text>
                </td>
              )
            )
          )}
        </tr>
      </thead>

      <tbody style={tbodyStyle}>
        <Form.List name={listName}>
          {(fields, { remove }) =>
            fields.map((field) => (
              <MINTableRow
                key={field.key}
                field={field}
                fieldsLength={fields.length}
                nonRemovableColumns={nonRemovableColumns}
                removableRows={removableRows}
                remove={remove}
                index={field.name}
                columns={columns}
                listName={listName}
                displayLabels={displayLabels}
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

export default memo(MINComponentsTable);

const MINTableRow = memo(function MINTableRow({
  field,
  fieldsLength,
  nonRemovableColumns,
  removableRows,
  remove,
  index,
  columns,
  listName,
  displayLabels,
}) {
  const rowRules = (colName) => [
    ({ getFieldValue }) => ({
      validator(_, value) {
        const qty = getFieldValue([listName, field.name, "qty"]);
        if (!qty || Number(qty) <= 0) {
          return Promise.resolve();
        }
        const rules = fieldRules[colName];
        if (!rules) {
          return Promise.resolve();
        }
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return Promise.reject(new Error(rules[0].message));
        }
        return Promise.resolve();
      },
    }),
  ];

  const labels = displayLabels[field.name];

  return (
    <tr style={tableColumnStyle}>
      <Form.Item name={[field.name, "componentKey"]} hidden>
        <input type="hidden" />
      </Form.Item>
      <Form.Item name={[field.name, "partCode"]} hidden>
        <input type="hidden" />
      </Form.Item>
      <Form.Item name={[field.name, "newPartCode"]} hidden>
        <input type="hidden" />
      </Form.Item>
      {removableRows && (
        <td style={{ whiteSpace: "nowrap", width: 30, flexShrink: 0 }}>
          {fieldsLength > nonRemovableColumns && (
            <CommonIcons action="removeRow" onClick={() => remove(index)} />
          )}
        </td>
      )}
      {columns.map((col, columnIndex) =>
        !col.conditional ? (
          <td key={columnIndex} style={columnCellStyle(col, index)}>
            {col.skipFormItem ? (
              <div style={cellInnerStyle(col)}>
                {col.field({ fieldName: field.name, labels }, index)}
              </div>
            ) : (
              <Form.Item
                rules={rowRules(col.name)}
                name={[field.name, col.name]}
                style={formItemStyle(col)}
                validateTrigger="onBlur"
              >
                {col.field({ fieldName: field.name, labels }, index)}
              </Form.Item>
            )}
          </td>
        ) : (
          col.condition() && (
            <td key={columnIndex} style={columnCellStyle(col, index)}>
              {col.skipFormItem ? (
                <div style={cellInnerStyle(col)}>
                  {col.field({ fieldName: field.name, labels }, index)}
                </div>
              ) : (
                <Form.Item
                  rules={rowRules(col.name)}
                  name={[field.name, col.name]}
                  style={formItemStyle(col)}
                  validateTrigger="onBlur"
                >
                  {col.field({ fieldName: field.name, labels }, index)}
                </Form.Item>
              )}
            </td>
          )
        )
      )}
    </tr>
  );
});

const cellInnerStyle = (col) => ({
  width: col.width,
  maxWidth: col.width,
  overflow: "hidden",
});

const formItemStyle = (col) => ({
  margin: 0,
  padding: 0,
  width: col.width,
  maxWidth: col.width,
  display: col.justify && "flex",
  justifyContent: col.justify,
});

const columnHeaderStyle = (col) => ({
  whiteSpace: "nowrap",
  width: col?.width,
  minWidth: col?.width,
  flexShrink: 0,
  margin: "0px 1px",
  background: "#f5f5f5",
  borderRadius: 3,
  padding: "4px 6px",
});

const columnCellStyle = (row, rowIndex) => ({
  whiteSpace: "nowrap",
  width: row.width,
  minWidth: row.width,
  maxWidth: row.width,
  flexShrink: 0,
  verticalAlign: "middle",
  background: rowIndex % 2 === 0 ? "#f5f5f57f" : undefined,
  margin: "0px 1px",
  padding: "2px 4px",
});

const tableStyle = {
  display: "block",
  height: "100%",
  width: "100%",
  overflowX: "scroll",
  overflowY: "auto",
  padding: 0,
  paddingBottom: FOOTER_OFFSET,
};

const theadStyle = {
  width: "100%",
  display: "block",
  marginTop: 3,
  verticalAlign: "middle",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

const tbodyStyle = {
  display: "block",
  width: "fit-content",
  minWidth: "100%",
};

const tableHeaderStyle = {
  display: "flex",
  width: "fit-content",
  minWidth: "100%",
  borderRadius: 5,
};

const tableColumnStyle = {
  display: "flex",
  width: "fit-content",
  minWidth: "100%",
  marginTop: 3,
  borderRadius: 5,
};

const fieldRules = {
  hsn: [
    {
      required: true,
      message: "Please enter a HSN code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
};
