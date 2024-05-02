import React, { useEffect, useState } from "react";
import { Card, Col, Form, Row, Space } from "antd";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { R33Type } from "../../../types/reports";
import MyDataTable from "../../gstreco/myDataTable";
import MyButton from "../../../Components/MyButton";
import useApi from "../../../hooks/useApi";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { getR33 } from "../../../api/reports/inventoryReport";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";

const wiseOptions = [
  {
    text: "Single Date",
    value: "singleDate",
  },
  {
    text: "Date Range",
    value: "dateRange",
  },
];
function R33() {
  const [rows, setRows] = useState<R33Type[]>([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const date = Form.useWatch("date", form);
  const wise = Form.useWatch("wise", form);

  const handleFetchRows = async () => {
    const values = await form.validateFields();

    const response = await executeFun(
      () => getR33(values.date, values.wise),
      "fetch"
    );

    setRows(response.data ?? []);
  };

  useEffect(() => {
    setRows([]);
  }, [wise]);

  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <Col span={4}>
        <Card size="small">
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item name="wise" label="Wise">
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item name="date" label="Date">
              {wise === "singleDate" && (
                <SingleDatePicker
                  setDate={(value) => form.setFieldValue("date", value)}
                />
              )}
              {wise === "dateRange" && (
                <MyDatePicker
                  setDateRange={(value) => form.setFieldValue("date", value)}
                />
              )}
            </Form.Item>
            <Row justify="end">
              <Space>
                <CommonIcons
                  action="downloadButton"
                  disabled={rows.length === 0}
                  onClick={() =>
                    downloadCSV(
                      rows,
                      wise === "singleDate" ? singleColumns : rangeColumns,
                      "R33 Report",
                      [
                        {
                          id: "Selected Date",
                          department: date,
                        },
                      ]
                    )
                  }
                />
                <MyButton
                  onClick={handleFetchRows}
                  loading={loading("fetch")}
                  variant="search"
                  text="Fetch"
                />
              </Space>
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          columns={wise === "singleDate" ? singleColumns : rangeColumns}
          data={rows}
        />
      </Col>
    </Row>
  );
}

export default R33;

const singleColumns = [
  {
    headerName: "#",
    field: "id",
    width: 40,
  },
  {
    headerName: " Date",
    field: "date",
    width: 100,
  },
  {
    headerName: " Shift Start",
    field: "shiftStart",
    width: 140,
  },
  {
    headerName: "Shift End",
    field: "shiftEnd",
    width: 140,
  },
  {
    headerName: " Department",
    field: "department",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.department} />
    ),
    width: 150,
  },

  {
    headerName: "SKU",
    field: "sku",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
    width: 100,
  },
  {
    headerName: "Product",
    field: "product",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.product} />
    ),
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "UoM",
    field: "uom",
    width: 70,
  },
  {
    headerName: " Manpower",
    field: "manPower",
    width: 110,
  },

  {
    headerName: "No Of Lines",
    field: "lineCount",
    width: 110,
  },
  {
    headerName: "Output",
    field: "output",
    width: 110,
  },

  {
    headerName: "Over Time",
    field: "overTime",
    width: 140,
  },
  {
    headerName: " Working Hours",
    field: "workHours",
    width: 150,
  },
  {
    headerName: "Remarks.",
    field: "remarks",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.remarks} />
    ),
    width: 220,
  },
];

const rangeColumns = [
  {
    headerName: "#",
    field: "id",
    width: 40,
  },

  {
    headerName: " Department",
    field: "department",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.department} />
    ),
    width: 150,
  },

  {
    headerName: "SKU",
    field: "sku",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
    width: 100,
  },
  {
    headerName: "Product",
    field: "product",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.product} />
    ),
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "UoM",
    field: "uom",
    width: 70,
  },
  {
    headerName: " Manpower",
    field: "manPower",
    width: 110,
  },

  {
    headerName: "No Of Lines",
    field: "lineCount",
    width: 110,
  },
  {
    headerName: "Output",
    field: "output",
    width: 110,
  },

  {
    headerName: "Over Time",
    field: "overTime",
    width: 140,
  },
  {
    headerName: " Working Hours",
    field: "workHours",
    width: 150,
  },
  // {
  //   headerName: "Remarks.",
  //   field: "remarks",
  //   renderCell: ({ row }: { row: R34Type }) => (
  //     <ToolTipEllipses text={row.remarks} />
  //   ),
  //   width: 220,
  // },
];

const initialValues = {
  wise: "singleDate",
};
