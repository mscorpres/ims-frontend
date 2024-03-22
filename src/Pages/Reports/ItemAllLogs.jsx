import { useState } from "react";
import { Button, Card, Col, Form, Row, Space } from "antd";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import MyDatePicker from "../../Components/MyDatePicker";
import { FileImageOutlined } from "@ant-design/icons";
import ComponentImages from "../Master/Components/material/ComponentImages";
import useApi from "../../hooks/useApi";
import { getComponentOptions } from "../../api/general";
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
  // initializing searh form
  const [searchForm] = Form.useForm();
  const selectedComonents = Form.useWatch("component", searchForm);

  //getting components options
  const getComponentOption = async (search) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    // setLoading(false);
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
      headerName: "#",
      field: "index",
      width: 80,
    },
    {
      headerName: "Date",
      field: "date",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
    },
    {
      headerName: "Type",
      field: "transaction_type",
      width: 30,
      renderCell: ({ row }) => (
        <div
          style={{
            height: "15px",
            width: "15px",
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
      headerName: "Transaction",
      field: "transaction",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction} copy={true} />
      ),
    },
    {
      headerName: "Qty In",
      field: "qty_in",
      width: 120,
    },
    {
      headerName: "Qty Out",
      field: "qty_out",
      width: 120,
    },
    {
      headerName: "Method",
      field: "mode",
      width: 120,
    },
    {
      headerName: "Loc In",
      field: "location_in",
      width: 120,
    },
    {
      headerName: "Loc Out",
      field: "location_out",
      width: 120,
    },
    {
      headerName: "Doc Type",
      field: "vendortype",
      width: 120,
    },
    {
      headerName: "Vendor",
      field: "vendorname",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendorname} />,
    },
    {
      headerName: "Vendor Code",
      field: "vendorcode",
      minWidth: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendorcode} copy={true} />
      ),
    },
    {
      headerName: "Created/Approved By",
      field: "doneby",
      minWidth: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.doneby} />,
    },
  ];

  return (
    <Row gutter={6} style={{ padding: "0px 5px", height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <Col span={4} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
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
                      {/* <RangePicker
                        style={{ width: "100%" }}
                        format="DD-MM-YYYY"
                      /> */}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={6}>
                      <Space>
                        <Button
                          loading={loading === "fetch"}
                          block
                          htmlType="submit"
                          type="primary"
                        >
                          Fetch
                        </Button>

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
            </Card>
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
      <Col span={20}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
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
