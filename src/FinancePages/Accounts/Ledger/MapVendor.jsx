import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Typography,
} from "antd";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import axios from "axios";
import { toast } from "react-toastify";
import errorToast from "../../../Components/errorToast";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";

function MapVendor({ options, statusOptions, getLedgerList }) {
  const [newVendor, setNewVendor] = useState({
    name: "",
    code: "",
    sub_group: "",
    search_name: "--",
    gst: "yes",
    tds: "yes",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading: loading1 } = useApi();

  const getSubGroupSelect = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((d) => {
        return { text: d.label, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const vendorInputHander = async (name, value) => {
    let obj = newVendor;
    if (name == "code") {
      obj = {
        ...obj,
        [name]: value.value,
        name: value.label,
      };
    } else {
      obj = {
        ...obj,
        [name]: value,
      };
    }
    //  obj = {
    //   ...obj,
    //   [name]: value
    //  }
    setNewVendor(obj);
  };
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const addVendor = async () => {
    const { gst, tds, status, sub_group, code, name } = newVendor;
    if (!name || name == "") {
      return toast.error("Please Select a vendor");
    } else if (!code || code == "") {
      return toast.error("Please Select a vendor");
    } else if (!sub_group || sub_group == "") {
      return toast.error("Please Select a Sub Group");
    } else if (!gst || gst == "") {
      return toast.error("Please Select GST Apply");
    } else if (!tds || tds == "") {
      return toast.error("Please Select TDS Apply");
    }
    setLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/addVendorLedger", {
      ...newVendor,
      sub_group: sub_group,
      gst: gst,
      tds: tds,
      status: status,
    });
    setLoading(false);
    // console.llg(data);
    if (data.code == 200) {
      toast.success(data.message);
      getLedgerList();
      vendorReset();
      // reset();
    } else {
      toast.error(errorToast(data.message));
    }
  };
  const vendorReset = () => {
    setNewVendor({
      name: "",
      code: "",
      sub_group: "",
      search_name: "--",
      gst: "",
      tds: "",
      status: "active",
    });
  };

  return (
    <Card title="Map Vendor" size="small">
      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Select Vendor
                </span>
              }
            >
              <MyAsyncSelect
                selectLoading={loading1("select")}
                labelInValue
                onBlur={() => setAsyncOptions([])}
                value={newVendor.code}
                onChange={(value) => vendorInputHander("code", value)}
                // defaultOptions
                loadOptions={getVendors}
                optionsState={asyncOptions}
                placeholder="Select Vendor..."
              />
              {/* <Input
            size="default"
            value={newLedger.code}
            onChange={(e) =>
              vendorInputHander("code", e.target.value)
            }
            placeholder="Enter New Ledger Code.."
          /> */}
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Vendor Name
                </span>
              }
            >
              <Input
                size="default"
                value={newVendor.name}
                onChange={(e) => vendorInputHander("name", e.target.value)}
                placeholder="Enter New Vendor Name.."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Search Name
                </span>
              }
            >
              <Input
                size="default"
                value={newVendor.search_name}
                onChange={(e) =>
                  vendorInputHander("search_name", e.target.value)
                }
                placeholder="Sub Group"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Sub Group
                </span>
              }
            >
              <MyAsyncSelect
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
                value={newVendor.sub_group}
                onChange={(value) => {
                  vendorInputHander("sub_group", value);
                }}
                // defaultOptions
                loadOptions={getSubGroupSelect}
                optionsState={asyncOptions}
                placeholder="Select Sub Group..."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  GST Apply
                </span>
              }
            >
              <MySelect
                options={options}
                value={newVendor.gst}
                onChange={(value) => {
                  vendorInputHander("gst", value);
                }}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Apply
                </span>
              }
            >
              <MySelect
                value={newVendor.tds}
                onChange={(value) => {
                  vendorInputHander("tds", value);
                }}
                options={options}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Block Account
                </span>
              }
            >
              <MySelect
                value={newVendor.status}
                onChange={(value) => {
                  vendorInputHander("status", value);
                }}
                options={statusOptions}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row justify="end">
        <Col>
          <Space align="center" style={{ height: "100%", paddingTop: 7 }}>
            <Button onClick={addVendor} type="primary">
              Save
            </Button>
            <Button onClick={vendorReset} type="default">
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

export default MapVendor;
