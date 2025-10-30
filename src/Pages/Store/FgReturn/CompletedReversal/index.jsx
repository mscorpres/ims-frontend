import { useState } from "react";
import {  Col, Form, Row, Space } from "antd";
import MyDatePicker from "../../../../Components/MyDatePicker";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import useApi from "../../../../hooks/useApi";
import { getCompletedReturns } from "../../../../api/store/fgReturn";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { downloadCSV } from "../../../../Components/exportToCSV";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../../new/components/reuseable/CustomButton";

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

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 190px)"
          : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Product Found" />
    ),

    renderTopToolbar: () =>
      loading("fetch") ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });
  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <Col span={6}>
        <CustomFieldBox title={"Filter"}>
          <Form layout="vertical" form={form}>
            <Form.Item name="date" label="Period">
              <MyDatePicker
                setDateRange={(value) => form.setFieldValue("date", value)}
              />
            </Form.Item>
          </Form>
          <Row justify="end">
            <Space>
              <CommonIcons onClick={handleDownload} action="downloadButton" />
              <CustomButton
                title={"Search"}
                size="small"
                loading={loading("fetch")}
                onclick={handleFetchRows}
             
              />
            </Space>
          </Row>
        </CustomFieldBox>
      </Col>
      <Col span={18}>
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
};

export default CompletedFgReturn;

const columns = [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 120,
  },
  {
    header: "Trans. Id",
    accessorKey: "transactionId",
    size: 150,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    header: "SKU",
    accessorKey: "sku",
    size: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    header: "Product",
    accessorKey: "product",
    size: 150,
    flex: 1,
  },
  {
    header: "In Qty",
    accessorKey: "inQty",
    size: 150,
  },
  {
    header: "Exec. Qty",
    accessorKey: "executedQty",
    size: 150,
  },
  {
    header: "Exec. By",
    accessorKey: "executedBy",
    size: 150,
  },
];
