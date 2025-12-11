import React, { useState } from "react";
import { Card, Col, Form, Input, Row, Space } from "antd";
import MyButton from "../../../../Components/MyButton";
import MyDatePicker from "../../../../Components/MyDatePicker";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import useApi from "../../../../hooks/useApi";
import MyDataTable from "../../../../Components/MyDataTable";
import { getCompletedReturns } from "../../../../api/store/fgReturn";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { downloadCSV, exportCSVFile } from "../../../../Components/exportToCSV";

const CompletedFgReturn = () => {
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleFetchRows = async () => {
    const values = await form.validateFields();

    if (values) {
      const response = await executeFun(
        () => getCompletedReturns(values.date),
        "fetch"
      );
      setRows(response.data);
    }
  };

  const handleDownload = () => [
    downloadCSV(rows, columns, "Completed FG Return Report"),
  ];
  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <Col span={4}>
        <Card size="small">
          <Form layout="vertical" form={form}>
            <Form.Item name="date" label="Period">
              <MyDatePicker
                setDateRange={(value:any) => form.setFieldValue("date", value)}
              />
            </Form.Item>
          </Form>
          <Row justify="center">
            <Space>
              <CommonIcons onClick={handleDownload} action="downloadButton" />
              <MyButton
                onClick={handleFetchRows}
                variant="search"
                text="fetch"
                loading={loading("fetch")}
              />
            </Space>
          </Row>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable columns={columns} data={rows} loading={loading("fetch")} />
      </Col>
    </Row>
  );
};

export default CompletedFgReturn;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 120,
  },
  {
    headerName: "Trans. Id",
    field: "transactionId",
    width: 150,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "In Qty",
    field: "inQty",
    width: 150,
  },
  {
    headerName: "Exec. Qty",
    field: "executedQty",
    width: 150,
  },
  {
    headerName: "Exec. By",
    field: "executedBy",
    width: 150,
  },
];
