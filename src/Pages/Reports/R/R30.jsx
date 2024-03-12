import { Button, Card, Col, Drawer, Form, Row, Space, Typography } from "antd";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components//exportToCSV";
import Loading from "../../../Components/Loading";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import SummaryCard from "../../../Components/SummaryCard";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { getVendorOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";
import useApi from "../../../hooks/useApi";

function R30() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [componentList, setComponentList] = useState(false);
  const [jwId, setJwId] = useState("");
  const [searchForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();
  const getRows = async (values) => {
    setFetchLoading(true);
    values = { ...values, date: dateRange };
    // log
    const { data } = await imsAxios.post("/report30", values);
    setFetchLoading(false);
    if (data.code === 200) {
      let arr = data.response.data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      setRows(arr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
    }
  };
  const getComponentsList = async (row) => {
    setFetchLoading(true);
    console.log("row", row);
    setJwId(row.jobwork);
    let values = await searchForm.validateFields();
    // console.log("values", values);
    // return;
    const response = await imsAxios.post("/report30/viewRM", {
      vendor: values.vendor,
      jw: row.jobwork,
      challan: row.challan,
    });
    console.log("response", response);
    const { data } = response;
    // let arr = data.message;
    let arr = data.response.data;

    if (data.code === 200) {
      arr = arr.map((row, index) => ({
        id: index + 1,
        ...row,
      }));
    }
    setComponentList(arr);
    setFetchLoading(false);
  };
  const columns = [
    {
      headerName: "",
      field: "actions",
      width: 10,
      type: "actions",
      getActions: ({ row }) => [
        // <GridActionsCellItem
        //   showInMenu
        //   // disabled={loading}
        //   onClick={() => {
        //     // setOpen(true);
        //     // setModalVals(row);
        //     downloadCSV(rows, downldcolumns, "R30 Report");
        //   }}
        //   label="Download"
        // />,

        <GridActionsCellItem
          showInMenu
          // disabled={loading}
          onClick={() => {
            // setOpen(true);
            getComponentsList(row);
          }}
          label="Components list"
        />,
      ],
    },
    // { headerName: "#", field: "id", width: 80 },
    { headerName: "Jobwork", field: "jobwork", flex: 1 },
    { headerName: "Challan", field: "challan", flex: 1 },
    { headerName: "Inserted By", field: "insert_by", flex: 1 },
    { headerName: "Insert Date", field: "insert_dt", flex: 1 },
  ];
  const downldcolumns = [
    { headerName: "Sr. No", field: "id", width: 80 },
    { headerName: "Jobwork", field: "jobwork", flex: 1 },
    { headerName: "Challan", field: "challan", flex: 1 },
    { headerName: "Inserted By", field: "insert_by", flex: 1 },
    { headerName: "Insert Date", field: "insert_dt", flex: 1 },
  ];
  const drawercolumns = [
    { headerName: "Sr. No", field: "id", width: 80 },
    { headerName: "Cat Part No.", field: "cat_part_no", flex: 1 },
    { headerName: "Part No.", field: "part_no", flex: 1 },
    { headerName: "Part Name", field: "part_name", flex: 1 },
    { headerName: "HSN", field: "hsn", flex: 1 },
    { headerName: "Left Qty", field: "jw_leftqty", flex: 1 },
    { headerName: "Qty", field: "jw_qty", flex: 1 },
    { headerName: "UoM", field: "uom", flex: 1 },
    { headerName: "Rate", field: "jw_rate", flex: 1 },
  ];
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const getAsyncOptions = async (url, search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post(url, {
      search: search,
      searchTerm: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (data.code) {
      arr = data.data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
    } else {
      arr = data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
    }
    setAsyncOptions(arr);
  };
  const getVendorLocation = async () => {
    let vendor = searchForm.getFieldsValue().vendor;
    if (vendor) {
      setFormLoading(true);
      const { data } = await imsAxios.post("/backend/fetchVendorJWLocation", {
        search: vendor,
      });

      setFormLoading(false);
      if (data.code === 200) {
        let arr = [];
        arr = data.data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setLocationOptions(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  useEffect(() => {
    getVendorLocation();
  }, [searchForm.getFieldsValue().vendor]);

  useEffect(() => {
    getVendorLocation();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={4} style={{ height: "100%", padding: "0px 5px" }}>
        <Col
          style={{ overflowY: "auto", height: "100%", paddingBottom: 50 }}
          span={6}
        >
          <Card size="small" style={{ marginBottom: 5 }}>
            {formLoading && <Loading />}
            <Form
              onFinish={getRows}
              layout="vertical"
              size="small"
              form={searchForm}
            >
              <Row>
                <Col span={24}>
                  {/* <Form.Item
                    label="Select Component"
                    name="component"
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Component!",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      selectLoading={selectLoading}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      // value={searchObj.vendor}
                      loadOptions={(search) =>
                        getAsyncOptions(
                          "/backend/getComponentByNameAndNo",
                          search
                        )
                      }
                      // onChange={(value) => {
                      //   setSearchObj((obj) => ({
                      //     ...obj,
                      //     vendor: value,
                      //   }));
                      // }}
                    />
                  </Form.Item> */}
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Select Vendor"
                    name="vendor"
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Vendor!",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      loadOptions={(search) => getVendors(search)}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Select Period"
                    // name="date"
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Date Period!",
                      },
                    ]}
                  >
                    <MyDatePicker
                      size="default"
                      setDateRange={setDateRange}
                      dateRange={dateRange}
                      value={dateRange}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Space>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        // loading={fetchLoading}
                        size="default"
                        htmlType="submit"
                        type="primary"
                      >
                        Generate
                      </Button>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <CommonIcons
                        action="downloadButton"
                        onClick={() =>
                          downloadCSV(rows, downldcolumns, "R30 Report")
                        }
                      />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={18}>
          <div className="hide-select" style={{ height: "100%" }}>
            <MyDataTable
              checkboxSelection={true}
              loading={fetchLoading}
              data={rows}
              columns={columns}
            />
          </div>
        </Col>
      </Row>
      <Drawer
        onClose={() => setComponentList(false)}
        open={componentList}
        width="100vw"
        bodyStyle={{ overflow: "hidden", padding: 0 }}
        className="message-modal"
        // closable={false}
        destroyOnClose={true}
        title={`Component List ${jwId}`}
        extra={
          <Space>
            <Button
              onClick={() =>
                downloadCSV(componentList, drawercolumns, "SO component Report")
              }
              type="primary"
            >
              Download
            </Button>
          </Space>
        }
      >
        <MyDataTable
          // loading={loading}
          columns={drawercolumns}
          data={componentList}
        />
      </Drawer>
    </div>
  );
}

export default R30;
