import React, { useState } from "react";
import { Card, Col, Form, Row, Space } from "antd";
import { R34Type } from "@/types/reports";
import MyDataTable from "@/Components/MyDataTable";
import MyButton from "@/Components/MyButton";

import ToolTipEllipses from "@/Components/ToolTipEllipses";
import { getR34 } from "@/api/reports/inventoryReport";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import { downloadCSV } from "@/Components/exportToCSV";
import MyDatePicker from "@/Components/MyDatePicker";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Details from "@/Pages/Reports/R/R34/Details";
import useApi from "@/hooks/useApi";

function R34() {
  const [rows, setRows] = useState<R34Type[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<R34Type | null>(null);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const date = Form.useWatch("date", form);

  const handleFetchRows = async () => {
    const values = await form.validateFields();
    const response = await executeFun(() => getR34(values.date), "fetch");
    setRows(response.data ?? []);
  };

  const actionColumn = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }: { row: R34Type }) => [
        // Edit icon
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label={"Details"}
          onClick={() => setSelectedTransaction(row)}
        />,
      ],
    },
  ];
  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <Details
        selectedTransaction={selectedTransaction}
        setSelectedTransaction={setSelectedTransaction}
      />
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
        <MyDataTable columns={[...actionColumn, ...columns]} data={rows} />
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
    headerName: "Txn Id",
    field: "transactionId",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.transactionId} />
    ),
    width: 150,
  },
   {
    headerName: "Ref Id",
    field: "refId",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.executionId} />
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
    headerName: "Qty",
    field: "qty",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.qty} />
    ),
    width: 120,
  },
  {
    headerName: "Remarks",
    field: "remarks",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.remarks} />
    ),
    width: 180,
  },
  {
    headerName: "Rtn. Date",
    field: "insertedDate",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.insertedDate} />
    ),
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Rtn. By",
    field: "insertedBy",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.insertedBy} />
    ),
    minWidth: 150,
    flex: 1,
  },
];
