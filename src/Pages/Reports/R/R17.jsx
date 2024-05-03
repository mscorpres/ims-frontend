import { Button, Card, Col, Form, Row, Space, Typography } from "antd";
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
import { getComponentOptions, getVendorOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";
function R17() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [summaryData, setSummaryData] = useState([
    { title: "Component", description: "--" },
    { title: "ClosingQty", description: "--" },
  ]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  // const [searchObj, setSearchObj] = useState({
  //   part_code: "",
  //   location: "",
  //   vendor: "",
  // });
  const [dateRange, setDateRange] = useState("");
  const [searchForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();
  const getRows = async (values) => {
    setFetchLoading(true);
    values = { ...values, date: dateRange };
    const { data } = await imsAxios.post("/report17", values);
    setFetchLoading(false);
    if (data.code === 200) {
      let arr = data.response.data2.map((row, index) => ({
        ...row,
        id: index,
      }));
      setRows(arr);
      let summaryArr = [
        { title: "Component", description: data.response.data1.component },
        {
          title: "Closing Quantity",
          description: `${data.response.data1.closingqty} ${data.response.data1.uom}`,
        },
      ];
      setSummaryData(summaryArr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
    }
  };
  const columns = [
    { headerName: "Sr. No", field: "serial_no", width: 80 },
    { headerName: "Date", field: "date", flex: 1 },
    {
      headerName: "Trans Type",
      field: "transaction_type",
      width: 100,
      renderCell: ({ row }) => (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <div
            style={{
              justifyItems: "center",
              alignItems: "center",
              height: 12,
              width: 12,
              borderRadius: 500,
              background: row.transaction_type === "INWARD" ? "#39B689" : "red",
            }}
          ></div>
        </div>
      ),
    },
    { headerName: "Qty In", field: "qty_in", flex: 1 },
    { headerName: "Qty Out", field: "qty_out", flex: 1 },
    { headerName: "Location Inward", field: "location_in", flex: 1 },
    { headerName: "Location Outward", field: "location_out", flex: 1 },
  ];
  const handleDownloadExcel = () => {
    downloadCSV(rows, columns, "Vendor Jobwork Stock Report");
  };
  const getPartOptions = async (search) => {
    // setSelectLoading(false);
    // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(true);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    const arr = data.map((row) => {
      return {
        text: row.text,
        value: row.id,
      };
    });
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
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
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
                  <Form.Item
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
                      selectLoading={loading1("select")}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      // value={searchObj.vendor}
                      loadOptions={(search) => getPartOptions(search)}
                      // onChange={(value) => {
                      //   setSearchObj((obj) => ({
                      //     ...obj,
                      //     vendor: value,
                      //   }));
                      // }}
                    />
                  </Form.Item>
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
                      selectLoading={selectLoading}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      loadOptions={(search) => getVendors(search)}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Select Location"
                    name="location"
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Location!",
                      },
                    ]}
                  >
                    <MySelect
                      options={locationOptions}
                      onBlur={() => setAsyncOptions([])}
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
                      <MyButton
                        variant="search"
                        loading={fetchLoading}
                        size="default"
                        htmlType="submit"
                        type="primary"
                      >
                        Generate
                      </MyButton>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <CommonIcons
                        action="downloadButton"
                        onClick={handleDownloadExcel}
                      />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
          <SummaryCard
            title="Summary"
            summary={summaryData}
            loading={fetchLoading}
          />
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
    </div>
  );
}

export default R17;
