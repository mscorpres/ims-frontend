import { Space, Row, Form, Col } from "antd";
import { useState } from "react";
import MyDatePicker from "../../../../../Components/MyDatePicker";
import { getChallanList } from "../../../../../api/sales/salesOrder";
import useApi from "../../../../../hooks/useApi.ts";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import { downloadCSV } from "../../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import ChallanDetails from "./ChallanDetails";
import MySelect from "../../../../../Components/MySelect";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import { getClientsOptions } from "../../../../../api/finance/clients";
import CustomFieldBox from "../../../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../../../new/components/reuseable/CustomButton.jsx";
import { Search, Visibility } from "@mui/icons-material";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EmptyRowsFallback from "../../../../../new/components/reuseable/EmptyRowsFallback.jsx";

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

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Tooltip title="View">
        <IconButton
          color="inherit"
          size="small"
          onClick={() => {
            setShowDetails(row?.challanId);
          }}
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
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
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Col span={6}>
        <CustomFieldBox title="Filters">
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

              <CustomButton
                size="small"
                onclick={getRows}
                title="Search"
                starticon={<Search fontSize="small" />}
                loading={loading("fetch")}
              />
            </Space>
          </Row>
        </CustomFieldBox>
      </Col>
      <Col span={18}>
       
        <MaterialReactTable table={table} />
      </Col>
      <ChallanDetails open={showDetails} hide={() => setShowDetails(null)} />
    </Row>
  );
}

export default Challan;
const columns = [
  {
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Date",
    size: 180,
    accessorKey: "date",
  },
  {
    header: "Challan Id",
    size: 180,
    accessorKey: "challanId",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.challanId} copy={true} />
    ),
  },
  {
    header: "Client Code",
    size: 130,
    accessorKey: "clientCode",
  },
  {
    header: "Client",
    size: 200,
    accessorKey: "client",
  },

  {
    header: "Billing Address",
    size: 200,
    accessorKey: "billingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingAddress} />,
  },
  {
    header: "Shipping Address",
    size: 200,
    accessorKey: "shippingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
  },
];
