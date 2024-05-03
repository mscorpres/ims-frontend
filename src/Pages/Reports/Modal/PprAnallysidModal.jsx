import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import {
  Col,
  Drawer,
  Row,
  Select,
  Space,
  Layout,
  Button,
  DatePicker,
} from "antd";
import { toast } from "react-toastify";
import { CloseCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import moment from "moment";
import axios from "axios";
import MyDatePicker from "../../../Components/MyDatePicker";
import useApi from "../../../hooks/useApi.ts";
import { getProductsOptions } from "../../../api/general.ts";
const { Footer } = Layout;
const { RangePicker } = DatePicker;

function PprAnallysidModal({
  pprModal,
  setPprModal,
  setLoading,
  setAllDataComesFromDatabase,
}) {
  const { executeFun, loading } = useApi();
  const [allData, setAllData] = useState({
    projectName: "",
    productName: "",
    selectBom: "",
  });
  const [bomName, setBomName] = useState([]);
  const [dateSelect, setDateSelect] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const getProjectName = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/pprProjectName", {
        search: e,
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getProductName = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );

      setAsyncOptions(response.data);
    }
  };

  const getBomCall = async () => {
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData.productName,
    });
    //  console.log(data.data);

    const arr = data?.data?.map((d) => {
      return { label: d.bomname, value: d.bomid };
    });
    setBomName(arr);
  };

  const generateFun = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/report15", {
      product: allData.productName,
      subject: allData.selectBom,
      project: allData.projectName,
      date: dateSelect,
    });
    if (data.code == 200) {
      let arr = data.response.data0.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllDataComesFromDatabase(arr);
      setPprModal(false);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message);
      setLoading(false);
    }
    // console.log(data.response.data0);
  };

  const reset = () => {
    setAllData({
      projectName: "-----",
      productName: "----",
      selectBom: "-----",
    });
    //  setDateSelect("");
    setPprModal(false);
  };

  useEffect(() => {
    if (allData.productName) {
      getBomCall();
    }
  }, [allData.productName]);
  return (
    <>
      <Space>
        <Drawer
          width="45vw"
          title="PPR Analysis"
          placement="right"
          closable={false}
          onClose={() => setPprModal(false)}
          open={pprModal}
          getContainer={false}
          style={{
            position: "absolute",
          }}
          extra={
            <Space>
              <CloseCircleFilled onClick={() => setPprModal(false)} />
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <span>Project Name:</span>
              <div>
                <MyAsyncSelect
                  style={{ width: "100%" }}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getProjectName}
                  optionsState={asyncOptions}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, projectName: e };
                    })
                  }
                  value={allData.projectName}
                  placeholder="Project Name"
                />
              </div>
            </Col>
            <Col span={12}>
              <span>Product Name/SKU:</span>
              <div>
                <MyAsyncSelect
                  style={{ width: "100%" }}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getProductName}
                  optionsState={asyncOptions}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, productName: e };
                    })
                  }
                  value={allData.productName}
                  placeholder="Project Name"
                />
              </div>
            </Col>
            <Col span={12} style={{ marginTop: "15px" }}>
              <span>Select BOM:</span>
              <div>
                <Select
                  options={bomName}
                  style={{ width: "100%" }}
                  placeholder="Select Location"
                  value={allData.selectBom}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, selectBom: e };
                    })
                  }
                />
              </div>
            </Col>
            <Col span={12} style={{ marginTop: "15px" }}>
              <span>Select Date:</span>
              <MyDatePicker setDateRange={setDateSelect} size="default" />
            </Col>
            <Col span={24} style={{ marginTop: "55vh" }}>
              <div style={{ textAlign: "end" }}>
                <Button
                  onClick={reset}
                  style={{
                    background: "red",
                    color: "white",
                    marginRight: "10px",
                  }}
                >
                  Close
                </Button>
                <Button type="primary" onClick={generateFun}>
                  Generate
                </Button>
              </div>
            </Col>
          </Row>
        </Drawer>
      </Space>
    </>
  );
}

export default PprAnallysidModal;
