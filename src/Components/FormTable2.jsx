import { Button, Flex, Form, Row, Space, Typography } from "antd";
import React, { useState } from "react";
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
}) => {
  const limit = 10;
  const formValues = Form.useWatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationButtons, setPaginationButtons] = useState({
    next: true,
    back: false,
  });
  const addRow = (newRow) => {
    let obj = newRow;
    const names = columns.map((row) => row.name);
    if (!newRow) {
      names.map((name) => name !== "" && (obj[name] = ""));
    }

    const rows = form.getFieldValue(listName);
    let arr = [];
    if (reverse) {
      arr = [...rows, obj];
    } else {
      arr = [obj, ...rows];
    }

    form.setFieldValue(listName, arr);
  };

  const handleNext = () => {
    // if(currentPage)
    const rows = form.getFieldValue(listName);
    const length = rows?.length;
    const count = Math.ceil(length / limit);
    // console.log("this is the count", count);
    // console.log("this is the count length", length);
    // if (count === currentPage) {
    //   setPaginationButtons((curr) => ({
    //     ...curr,
    //     next: false,
    //   }));
    // }
    if (count > currentPage) {
      setCurrentPage((curr) => curr + 1);
    }
  };

  const handlePrev = () => {
    const rows = form.getFieldValue(listName);
    const length = rows.length;
    const count = Math.ceil(length / limit);

    // if (!paginationButtons.next) {
    //   setPaginationButtons((curr) => ({
    //     ...curr,
    //     next: true,
    //   }));
    // }
    // if(currentPage)
    setCurrentPage((curr) => curr - 1);
  };

  const handlePaginationState = () => {
    const rows = form.getFieldValue(listName);
    const length = rows?.length ?? 1;
    const count = Math.ceil(length / limit);

    console.log("this is the count", count);

    const currentItems = rows.filter(
      (_, index) =>
        index < limit * currentPage &&
        (currentPage > 1 ? index >= limit * (currentPage - 1) : true)
    );

    const nextItems = rows.filter(
      (_, index) =>
        index < limit * (currentPage + 1) &&
        (currentPage > 1 ? index >= limit * currentPage : true)
    );

    console.log("this is the current length count", nextItems.length > 0);
    if (currentItems.length === 0 && currentPage > 1) {
      handlePrev();
    }
    setPaginationButtons((curr) => ({
      next: nextItems.length > 0,
      back: currentPage > 1,
    }));
  };
  useEffect(() => {
    handlePaginationState();
    // if(currentPage === count){
    //   setPaginationButtons(curr)
    // }
  }, [currentPage]);
  useEffect(() => {
    setTimeout(() => {
      handlePaginationState();
    }, 1000);
  }, []);
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "auto",
        pading: 5,
        border: "1px solid #ccc",
        borderRadius: 10,
      }}
    >
      <table style={tableStyle}>
        <thead
          style={{
            width: "100%",
            display: "block",
            // marginTop: 3,
            verticalAlign: "middle",
            position: "sticky",
            top: 0,
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <tr style={tableHeaderStyle}>
            {removableRows && (
              <td
                style={{
                  ...columnHeaderStyle(),
                  width: 30,
                }}
              >
                {addableRow && (
                  <CommonIcons
                    action="addRow"
                    onClick={() => {
                      handlePaginationState();
                      addRow(newRow);
                    }}
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
            height: "90%",
            width: "100%",
            // overflowY: "auto",
            // overflowX:'hidden'
          }}
        >
          <Form.List
            name={listName}
            style={{
              width: "fit-content",
              height: "100%",
            }}
          >
            {(fields, { add, remove }) =>
              fields
                .filter(
                  (_, index) =>
                    index < limit * currentPage &&
                    (currentPage > 1
                      ? index >= limit * (currentPage - 1)
                      : true)
                )
                .map((field, index) => (
                  <SingleRow
                    currentPage={currentPage}
                    limit={limit}
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
                    handlePaginationState={handlePaginationState}
                  />
                ))
            }
          </Form.List>
        </tbody>
        {/* <tfoot
          style={{
            width: "100%",
            overflowX: "hidden",
            position: "sticky",
            background: "blue",
          }}
        >
          <Row justify="center" align="middle">
            <Typography.Text type="secondary">
              ----End of the List----
            </Typography.Text>
          </Row>
        </tfoot> */}
      </table>
      <Flex justify="center" style={{}}>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ flex: 1 }}>
            <Flex justify="center">
              <Typography.Text type="secondary" style={{ flex: 1 }}>
                ----End of the List----
              </Typography.Text>
            </Flex>
          </div>
          <Flex justify="end">
            <Space style={{ flex: 1 }}>
              <Typography.Text strong type="secondary">
                Current Page: {currentPage}
              </Typography.Text>
              <Button disabled={!paginationButtons.back} onClick={handlePrev}>
                Prev
              </Button>
              <Button disabled={!paginationButtons.next} onClick={handleNext}>
                Next
              </Button>
            </Space>
          </Flex>
        </Flex>
      </Flex>
    </div>
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
    watchKeys,
    listName,
    form,
    calculation,
    nonListWatchKeys = [],
    componentRequiredRef = [],
    currentPage,
    handlePaginationState,
    limit,
  }) => {
    console.log("this is field", field);
    const watchValues = watchKeys.map((val) =>
      form.getFieldValue([listName, field.name, val])
    );
    const nonListWatchValues = nonListWatchKeys?.map((val) =>
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
    }, [[...watchValues, ...nonListWatchValues]]);
    return (
      <Form.Item noStyle>
        <tr align="middle" key={field.key} style={tableColumnStyle}>
          {removableRows && (
            <td
              style={{
                whiteSpace: "nowrap",
                width: 30,
              }}
            >
              {fieldsLength > nonRemovableColumns && (
                <CommonIcons
                  action="removeRow"
                  onClick={() => {
                    handlePaginationState();
                    remove(field.name);
                  }}
                />
              )}
            </td>
          )}
          {columns.map((row, columnIndex) =>
            !row.conditional ? (
              <td key={columnIndex} style={columnCellStyle(row, index)}>
                <Form.Item
                  rules={isComponentRequired() && rules[row.name]}
                  name={[field.name, row.name]}
                  style={{
                    margin: 0,
                    padding: 0,
                    display: row.justify && "flex",
                    justifyContent: row.justify,
                  }}
                  validateTrigger="onBlur"
                >
                  {row.field(
                    { fieldName: field.name, ...valueObj },
                    index + limit * (currentPage - 1)
                  )}
                </Form.Item>
              </td>
            ) : (
              row.condition() && (
                <td style={columnCellStyle(row, index)}>
                  <Form.Item
                    rules={isComponentRequired() && rules[row.name]}
                    name={[field.name, row.name]}
                    style={{
                      margin: 0,
                      padding: 0,
                      display: row.justify && "flex",
                      justifyContent: row.justify,
                    }}
                    validateTrigger="onBlur"
                  >
                    {row.field(
                      { fieldName: field.name, ...valueObj },
                      index + limit * currentPage
                    )}
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
});

const columnCellStyle = (row, index) => ({
  whiteSpace: "nowrap",
  width: row.width,
  flex: row.flex && 1,
  background: index % 2 === 0 && "#f5f5f57f",
  margin: "0px 1px",
});
const tableStyle = {
  // display: "block",
  // height: "100%",
  // width: "100%",
  // overflow: "hidden",
  // position: "sticky",
  // overflowX: "auto",
  // overflowY: "hidden",

  padding: 0,
};
const tableHeaderStyle = {
  // display: "flex",
  // minWidth: "100%",
  // width: "fit-content",
  // borderRadius: 5,
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
