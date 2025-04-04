import { Space, Row, Form, Card, Col } from "antd";
import React, { useState } from "react";
import MyDatePicker from "../../../../../Components/MyDatePicker";
import { getChallanList } from "../../../../../api/sales/salesOrder";
import useApi from "../../../../../hooks/useApi.ts";
import MyDataTable from "../../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import { downloadCSV } from "../../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ChallanDetails from "./ChallanDetails";
import MySelect from "../../../../../Components/MySelect";
import MyButton from "../../../../../Components/MyButton";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import { getClientsOptions } from "../../../../../api/finance/clients";

const wiseOptions = [
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Client Wise",
    value: "clientwise",
  },
];

const initialValues = {
  data: "",
  wise: "clientwise",
};

const rules = {
  data: [
    {
      required: true,
      message: "This field is required",
    },
  ],
  wise: [
    {
      required: true,
      message: "This field is required",
    },
  ],
};
function Challan() {
  const [showDetails, setShowDetails] = useState(null);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [filterForm] = Form.useForm();
  const wise = Form.useWatch("wise", filterForm);

  const { executeFun, loading } = useApi();

  const getRows = async () => {
    const values = await filterForm.validateFields();
    const response = await executeFun(
      () => getChallanList(values.wise, values.data),
      "fetch"
    );
    const { data } = response;
    setRows(data);
  };

  const handleExcelDownload = () => {
    downloadCSV(rows, columns, "SO Challan Report");
  };

  const handleFetchClientOptions = async (search) => {
    const response = await executeFun(
      () => getClientsOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data.data, "name", "code");
    }
    setAsyncOptions(arr);
  };
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          setShowDetails(row?.challanId);
        }}
        label="View"
      />,
    ],
  };

  return (
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Col span={4}>
        <Card size="small" title="Filters">
          <Form
            form={filterForm}
            layout="vertical"
            initialValues={initialValues}
          >
            <Form.Item name="wise" label="Filter Wise" rules={rules.wise}>
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item
              name="data"
              rules={rules.data}
              label={wise === "datewise" ? "Period" : "Client"}
            >
              {wise === "datewise" && (
                <MyDatePicker
                  setDateRange={(value) =>
                    filterForm.setFieldValue("data", value)
                  }
                />
              )}
              {wise === "clientwise" && (
                <MyAsyncSelect
                  optionsState={asyncOptions}
                  loadOptions={handleFetchClientOptions}
                  onBlur={() => setAsyncOptions([])}
                  selectLoading={loading("select")}
                />
              )}
            </Form.Item>
          </Form>
          <Row justify="end">
            <Space>
              <CommonIcons
                action="downloadButton"
                onClick={handleExcelDownload}
              />
              <MyButton
                variant="search"
                loading={loading("fetch")}
                onClick={getRows}
              />
            </Space>
          </Row>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading("fetch")}
          columns={[actionColumn, ...columns]}
          data={rows}
        />
      </Col>
      <ChallanDetails open={showDetails} hide={() => setShowDetails(null)} />
    </Row>
  );
}

export default Challan;
const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Date",
    width: 180,
    field: "date",
  },
  {
    headerName: "Challan Id",
    width: 180,
    field: "challanId",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.challanId} copy={true} />
    ),
  },
  {
    headerName: "Client Code",
    width: 130,
    field: "clientCode",
  },
  {
    headerName: "Client",
    minWidth: 200,
    flex: 1,
    field: "client",
  },

  {
    headerName: "Billing Address",
    minWidth: 200,
    flex: 1,
    field: "billingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingAddress} />,
  },
  {
    headerName: "Shipping Address",
    minWidth: 200,
    flex: 1,
    field: "shippingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
  },
];
