import { useState } from "react";
import { Button, Col, Form, Row, Space } from "antd";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import MyDatePicker from "../../Components/MyDatePicker";
import { FileImageOutlined } from "@ant-design/icons";
import ComponentImages from "../Master/Components/material/ComponentImages";
import useApi from "../../hooks/useApi.ts";
import { getComponentOptions } from "../../api/general.ts";
import CustomFieldBox from "../../new/components/reuseable/CustomFieldBox.jsx";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Search } from "@mui/icons-material";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
export default function ItemAllLogs() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [summaryData, setSummaryData] = useState([
    { title: "Component", description: "" },
    // { title: "Closing Stock", description: "" },
    { title: "Last In (Date)", description: "" },
    { title: "Last Rate", description: "" },
  ]);
  const [showImages, setShowImages] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const [searchForm] = Form.useForm();
  const selectedComonents = Form.useWatch("component", searchForm);

  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    getData(response);
  };

  // getting data from response for setting async options for async select
  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    }
  };

  // getting rows
  const getRows = async (values) => {
    setLoading("fetch");
    setSummaryData([
      { title: "Component", description: "" },
      // { title: "Closing Stock", description: "" },
      { title: "Last In (Date)", description: "" },
      { title: "Last Rate", description: "" },
    ]);
    setRows([]);
    const response = await imsAxios.post("/itemQueryA/fetchRM_logs", {
      range: values.date,
      wise: "C",
      data: values.component,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200 || data.code === "200") {
        const arr = data.response.data2.map((row, index) => ({
          index: index + 1,
          id: v4(),
          ...row,
        }));
        setRows(arr);
        setSummaryData([
          { title: "Component", description: data.response.data1.component },
          { title: "Part Code", description: data.response.data1.partno },
          { title: "Unique Id", description: data.response.data1.unique_id },
          {
            title: "Closing",
            description:
              data.response.data1.closingqty + " " + data.response.data1.uom,
          },
          {
            title: "Last In (Date)",
            description: data.response.data1.last_date ?? "--",
          },
          { title: "Last Rate", description: data.response.data1.lastRate },
        ]);
      }
    }
  };
  // columns
  let columns = [
    {
      header: "#",
      accessorKey: "index",
      size: 80,
    },
    {
      header: "Date",
      accessorKey: "date",
      size: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
    },
    {
      header: "Type",
      accessorKey: "transaction_type",
      size: 30,
      renderCell: ({ row }) => (
        <div
          style={{
            height: "15px",
            size: "15px",
            borderRadius: "50px",
            backgroundColor:
              row.transaction_type === "CONSUMPTION"
                ? "#678983"
                : row.transaction_type === "INWARD"
                ? "#59CE8F"
                : row.transaction_type === "TRANSFER"
                ? "#FFB100"
                : row.transaction_type === "ISSUE"
                ? "#DD5353"
                : row.transaction_type === "JOBWORK"
                ? "#DD5353"
                : row.transaction_type === "CANCELLED" && "#36454F",
          }}
        />
      ),
    },
    {
      header: "Transaction",
      accessorKey: "transaction",
      size: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction} copy={true} />
      ),
    },
    {
      header: "Qty In",
      accessorKey: "qty_in",
      size: 120,
    },
    {
      header: "Qty Out",
      accessorKey: "qty_out",
      size: 120,
    },
    {
      header: "Out Rate",
      accessorKey: "out_rate",
      size: 120,
    },
    {
      accessorKey: "weightedPurchaseRate",
      header: "Weighted Average Rate",
      size: 180,
    },
    {
      header: "Method",
      accessorKey: "mode",
      size: 120,
    },
    {
      header: "Loc In",
      accessorKey: "location_in",
      size: 120,
    },
    {
      header: "Loc Out",
      accessorKey: "location_out",
      size: 120,
    },
    {
      header: "Doc Type",
      accessorKey: "vendortype",
      size: 120,
    },
    {
      header: "Vendor",
      accessorKey: "vendorname",
      size: 150,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendorname} />,
    },
    {
      header: "Vendor Code",
      accessorKey: "vendorcode",
      size: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendorcode} copy={true} />
      ),
    },
    {
      header: "Created/Approved By",
      accessorKey: "doneby",
      size: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.doneby} />,
    },
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
        height:
          loading === "fetch" ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
    <Row gutter={6} style={{ height: "90%", margin: "12px" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <CustomFieldBox title={"Filters"}>
              <Form
                onFinish={getRows}
                form={searchForm}
                initialValues={initialValues}
                layout="vertical"
              >
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label="Component"
                      rules={rules.component}
                      name="component"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getComponentOption}
                        optionsState={asyncOptions}
                        selectLoading={loading1("select")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Date Range"
                      rules={rules.date}
                      name="date"
                    >
                      <MyDatePicker
                        setDateRange={(value) =>
                          searchForm.setFieldValue("date", value)
                        }
                        size="default"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={6}>
                      <Space>
                        <CustomButton
                          size="small"
                          title={"Search"}
                          starticon={<Search fontSize="small" />}
                          loading={loading === "fetch"}
                          htmlType="submit"
                        />

                        <CommonIcons
                          disabled={rows.length === 0}
                          onClick={() =>
                            downloadCSV(rows, columns, "Item Location Log")
                          }
                          action="downloadButton"
                        />
                        <Button
                          type="primary"
                          shape="circle"
                          disabled={!selectedComonents}
                          icon={<FileImageOutlined />}
                          onClick={() => {
                            setShowImages({
                              partNumber: selectedComonents,
                            });
                          }}
                        />
                      </Space>
                    </Row>
                  </Col>
                </Row>
              </Form>
            </CustomFieldBox>
          </Col>
          <Col span={24}>
            <SummaryCard
              title="Component Stock"
              loading={loading === "fetch"}
              summary={summaryData}
            />
          </Col>
        </Row>
      </Col>
      <Col span={18}>
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
}

// initial form values
const initialValues = {
  component: "",
};

// form rules
const rules = {
  component: [{ required: true, message: "Please select a component" }],
  date: [{ required: true, message: "Please select a date range" }],
};
