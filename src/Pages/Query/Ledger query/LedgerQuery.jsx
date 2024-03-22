import { useState } from "react";
import { Row, Col, Divider, Flex, Form, Card, Typography } from "antd";
import useApi from "../../../hooks/useApi";
import { getComponentOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyButton from "../../../Components/MyButton";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import { downloadCSV } from "../../../Components/exportToCSV";
import { fetchQ4 } from "../../../api/reports/query";

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
  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={10}>
      <Col span={4}>
        <Flex vertical gap={10}>
          <Card size="small">
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
                <MyButton
                  onClick={handleFetchRows}
                  variant="search"
                  loading={loading("fetch")}
                />
              </Flex>
            </Form>
          </Card>
          <SummaryCard summary={summary} />
        </Flex>
      </Col>
      <Col span={20}>
        <MyDataTable data={rows} columns={columns} loading={loading("fetch")} />
      </Col>
    </Row>
  );
};

export default Q4;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Vendor",
    minWidth: 200,
    flex: 1,
    field: "vendor",
    renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
  },
  {
    headerName: "Vendor Code",
    width: 100,
    field: "vendorCode",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.vendorCode} copy={true} />
    ),
  },
  {
    headerName: "Effective Date",
    width: 150,
    field: "effectiveDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.effectiveDate} />,
  },
  {
    headerName: "Insert Date",
    width: 150,
    field: "insertDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.insertDate} />,
  },
  {
    headerName: "VBT Code",
    width: 150,
    field: "vbtCode",
    renderCell: ({ row }) => <ToolTipEllipses text={row.vbtCode} copy={true} />,
  },
  {
    headerName: "Project",
    width: 150,
    field: "project",
    renderCell: ({ row }) => <ToolTipEllipses text={row.project} copy={true} />,
  },
  {
    headerName: "PO ID",
    width: 150,
    field: "poId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.poId} copy={true} />,
  },
  {
    headerName: "MIN ID",
    width: 150,
    field: "minId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.minId} copy={true} />,
  },
  {
    headerName: "Invoice No.",
    width: 150,
    field: "invoiceNumber",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.invoiceNumber} copy={true} />
    ),
  },
  {
    headerName: "IN Rate",
    width: 150,
    field: "inRate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.inRate} />,
  },
  {
    headerName: "CIF Rate",
    width: 150,
    field: "cifRate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.cifRate} />,
  },

  {
    headerName: "In Qty",
    width: 150,
    field: "inQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.inQty} />,
  },
  {
    headerName: "Considered Qty",
    width: 150,
    field: "consideredQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.consideredQty} />,
  },
  {
    headerName: "Total Value",
    width: 150,
    field: "totalValue",
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
    <Card size="summary">
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
    </Card>
  );
};
