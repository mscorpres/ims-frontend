import React, { useState } from "react";
import { Card, Col, Form, Row, Space } from "antd";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { R34Type } from "../../../types/reports";
import MyDataTable from "../../gstreco/myDataTable";
import MyButton from "../../../Components/MyButton";
import useApi from "../../../hooks/useApi";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { getR34 } from "../../../api/reports/inventoryReport";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDatePicker from "../../../Components/MyDatePicker";

function R34() {
  const [rows, setRows] = useState<R34Type[]>([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const date = Form.useWatch("date", form);

  console.log("selecegd date", date);

  const handleFetchRows = async () => {
    const values = await form.validateFields();

    const response = await executeFun(() => getR34(values.date), "fetch");

    setRows(response.data ?? []);
  };

  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <Col span={4}>
        <Card size="small">
          <Form form={form} layout="vertical">
            <Form.Item name="date" label="Date">
              <MyDatePicker
                setDateRange={(value) => form.setFieldValue("date", value)}
              />
            </Form.Item>
            <Row justify="end">
              <Space>
                <CommonIcons
                  action="downloadButton"
                  onClick={() =>
                    downloadCSV(rows, columns, "R34 Report", [
                      {
                        id: "Selected Date",
                        department: date,
                      },
                    ])
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
        <MyDataTable columns={columns} data={rows} />
      </Col>
    </Row>
  );
}

export default R34;

const columns = [
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
    width: 80,
  },
  {
    headerName: "Product",
    field: "product",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.product} />
    ),
    width: 150,
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
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.remarks} />
    ),
    width: 220,
  },
];
