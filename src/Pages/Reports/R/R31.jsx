import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
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
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { getVendorOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
import { convertSelectOptions } from "../../../utils/general";
import MyButton from "../../../Components/MyButton";

function R31() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [wise, setWise] = useState([]);
  const [selectvendor, setSelectVendor] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [componentList, setComponentList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jwId, setJwId] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const [searchForm] = Form.useForm();
  const getRows = async (values) => {
    setFetchLoading(true);
    // log
    const { data } = await imsAxios.post("/report31", {
      wise: wise,
      data: searchTerm,
      vendor: selectvendor.key,
    });
    setFetchLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      console.log(" data.data", data.data);
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
    // { headerName: "id", field: "id", flex: 1 },
    { headerName: "Cat Part Code", field: "cat_part_no", width: 130 },
    { headerName: "Part Code", field: "part_no", width: 130 },
    { headerName: "Cat Part Name", field: "part_name", width: 350 },
    { headerName: "Create By", field: "create_by", width: 130 },
    { headerName: "Create Date", field: "create_dt", width: 130 },
    { headerName: "Doc Date", field: "doc_date", width: 130 },
    { headerName: "Doc Reference", field: "doc_ref", width: 130 },
    { headerName: "Hsn", field: "hsn", width: 130 },
    { headerName: "Qty", field: "qty", width: 130 },
    { headerName: "Transaction Id", field: "txn_id", width: 130 },
    { headerName: "Unit", field: "unit", width: 130 },
  ];

  const wiseOptions = [
    { text: "Document Number", value: "doc_no" },
    { text: "Document Date", value: "doc_date" },
    { text: "Created Date", value: "create_date" },
  ];
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
  // const getVendorLocation = async () => {
  //   let vendor = searchForm.getFieldsValue().vendor;
  //   if (vendor) {
  //     setFormLoading(true);
  //     const { data } = await imsAxios.post("/backend/fetchVendorJWLocation", {
  //       search: vendor,
  //     });

  //     setFormLoading(false);
  //     if (data.code === 200) {
  //       let arr = [];
  //       arr = data.data.map((row) => ({
  //         value: row.id,
  //         text: row.text,
  //       }));
  //       setLocationOptions(arr);
  //     } else {
  //       toast.error(data.message.msg);
  //     }
  //   }
  // };
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  // useEffect(() => {
  //   getVendorLocation();
  // }, [searchForm.getFieldsValue().vendor]);

  // useEffect(() => {
  //   getVendorLocation();
  // }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={4} style={{ height: "95%", padding: "0px 5px" }}>
        <Col
          style={{ overflowY: "auto", height: "100%", paddingBottom: 50 }}
          span={6}
        >
          <Card size="small" style={{ marginBottom: 5 }}>
            {formLoading && <Loading />}
            <Form layout="vertical" size="small" form={searchForm}>
              <Row>
                <Col span={24}>
                  <Form.Item name="Wise" label="Select Wise">
                    <MySelect
                      options={wiseOptions}
                      defaultValue={
                        wiseOptions.filter((o) => o.value === wise)[0]
                      }
                      onChange={setWise}
                      value={wise}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="Search" label="Select Period">
                    {wise === "doc_no" ? (
                      <Input
                        type="text"
                        size="default"
                        placeholder="Enter Document Number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    ) : wise == "create_date" ? (
                      <MyDatePicker
                        size="default"
                        setDateRange={setSearchTerm}
                        dateRange={searchTerm}
                        value={searchTerm}
                      />
                    ) : (
                      <SingleDatePicker setDate={setSearchTerm} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="vendor" label="Select Vendor">
                    <MyAsyncSelect
                      onBlur={() => setAsyncOptions([])}
                      // selectLoading={selectLoading}
                      placeholder="Enter the Vendor Code or Name..."
                      labelInValue
                      onChange={setSelectVendor}
                      loadOptions={getVendorOption}
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Space>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <MyButton variant="search"
                        // loading={fetchLoading}
                        size="default"
                        htmlType="submit"
                        type="primary"
                        onClick={() => getRows()}
                      >
                        Generate
                      </MyButton>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <CommonIcons
                        action="downloadButton"
                        onClick={() => downloadCSV(rows, columns, "R30 Report")}
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
              // checkboxSelection={true}
              // loading={fetchLoading}
              data={rows}
              columns={columns}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default R31;
