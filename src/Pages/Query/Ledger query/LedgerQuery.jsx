import { useState } from "react";
import { Row, Col, Divider, Flex, Form, Typography } from "antd";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { downloadCSV } from "../../../Components/exportToCSV";
import { fetchQ4 } from "../../../api/reports/query";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";

const Q4 = () => {
  const [summary, setSummary] = useState({});
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  const handleFetchComponentOptons = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }

    setAsyncOptions(arr);
  };

  const handleFetchRows = async () => {
    const values = await form.validateFields();
    const response = await executeFun(() => fetchQ4(values.component), "fetch");
    setRows(response.data.result);
    setSummary(response.data.summary);
  };

  const handleDownload = async () => {
    await form.validateFields();
    downloadCSV(rows, columns, `Q4 Report `);
  };

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
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

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
    <Row style={{ height: "95%", margin: 12 }} gutter={10}>
      <Col span={6}>
        <Flex vertical gap={10}>
          <CustomFieldBox>
            <Form form={form} layout="vertical">
              <Form.Item
                name="component"
                label="Component"
                rules={rules.component}
              >
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={handleFetchComponentOptons}
                  optionsState={asyncOptions}
                  selectLoading={loading("select")}
                  placeholder="Select Component"
                />
              </Form.Item>
              <Flex justify="end" gap={5}>
                <CommonIcons action="downloadButton" onClick={handleDownload} />

                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={handleFetchRows}
                />
              </Flex>
            </Form>
          </CustomFieldBox>
          <SummaryCard summary={summary} />
        </Flex>
      </Col>
      <Col span={18}>
        {/* <MyDataTable data={rows} columns={columns} loading={loading("fetch")} /> */}
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
};

export default Q4;

const columns = [
  {
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Vendor",
    minsize: 200,
    flex: 1,
    accessorKey: "vendor",
    renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
  },
  {
    header: "Vendor Code",
    size: 100,
    accessorKey: "vendorCode",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.vendorCode} copy={true} />
    ),
  },
  {
    header: "Effective Date",
    size: 150,
    accessorKey: "effectiveDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.effectiveDate} />,
  },
  {
    header: "Insert Date",
    size: 150,
    accessorKey: "insertDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.insertDate} />,
  },
  {
    header: "VBT Code",
    size: 150,
    accessorKey: "vbtCode",
    renderCell: ({ row }) => <ToolTipEllipses text={row.vbtCode} copy={true} />,
  },
  {
    header: "Project",
    size: 150,
    accessorKey: "project",
    renderCell: ({ row }) => <ToolTipEllipses text={row.project} copy={true} />,
  },
  {
    header: "PO ID",
    size: 150,
    accessorKey: "poId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.poId} copy={true} />,
  },
  {
    header: "MIN ID",
    size: 150,
    accessorKey: "minId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.minId} copy={true} />,
  },
  {
    header: "Invoice No.",
    size: 150,
    accessorKey: "invoiceNumber",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.invoiceNumber} copy={true} />
    ),
  },
  {
    header: "IN Rate",
    size: 150,
    accessorKey: "inRate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.inRate} />,
  },
  {
    header: "CIF Rate",
    size: 150,
    accessorKey: "cifRate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.cifRate} />,
  },

  {
    header: "In Qty",
    size: 150,
    accessorKey: "inQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.inQty} />,
  },
  {
    header: "Considered Qty",
    size: 150,
    accessorKey: "consideredQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.consideredQty} />,
  },
  {
    header: "Total Value",
    size: 150,
    accessorKey: "totalValue",
    renderCell: ({ row }) => <ToolTipEllipses text={row.totalValue} />,
  },
];

const rules = {
  component: [
    {
      required: true,
      message: "Select a component",
    },
  ],
};

const SummaryCard = ({ summary }) => {
  return (
    <CustomFieldBox title="Summary">
      <Flex vertical>
        <Flex justify="space-between">
          <Typography.Text strong>Data as Per</Typography.Text>
          <Typography.Text>{summary?.closingDate}</Typography.Text>
        </Flex>
        <Divider />
        <Flex justify="space-between">
          <Typography.Text strong>Total Price</Typography.Text>
          <Typography.Text>{summary?.totalPrice}</Typography.Text>
        </Flex>
        <Divider />
        <Flex justify="space-between">
          <Typography.Text strong>Total Considered Qty</Typography.Text>
          <Typography.Text>{summary?.totalConsideredQty}</Typography.Text>
        </Flex>
      </Flex>
    </CustomFieldBox>
  );
};
