import React, { useEffect, useState } from "react";
import axios from "axios";

import moment from "moment";
import { DatePicker, Select } from "antd";
import { toast } from "react-toastify";
import MyDatePicker from "../../../Components/MyDatePicker";
import { v4 } from "uuid";
import { Button, Modal, Row, Col, Input } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";

const { RangePicker } = DatePicker;

const OpenR29Modal = ({
  viewModal,
  setViewModal,
  setAllResponseData,
  // loading,
  setLoading,
  setFilterData,
}) => {
  const [seacrh, setSearch] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [date, setDate] = useState("");
  const [dataa, setData] = useState({
    selectProduct: "",
    bom: "",
  });

  const { executeFun, loading } = useApi();
  // console.log(dataa);
  const [bomName, setBomName] = useState([]);
  const opt = [{ label: "Bom Wise", value: "Bom Wise" }];

  const getProductNameFecth = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      let { data } = response;
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      // return arr;
      setAsyncOptions(arr);
    }
  };

  const getBom = async () => {
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: dataa?.selectProduct,
    });
    const arr = data.data.map((d) => {
      return { value: d.bomid, label: d.bomname };
    });
    setBomName(arr);

    //  setBranch(arr);
  };

  useEffect(() => {
    if (dataa.selectProduct) {
      getBom();
    }
  }, [dataa.selectProduct]);

  const generateFun = async () => {
    setLoading(true);
    setAllResponseData([]);
    const { data } = await imsAxios.post("/report29", {
      product: dataa.selectProduct,
      subject: dataa.bom,
      date: date,
    });
    console.log(data, "r29 dataaaaaaaaaaaaaaaaa");
    if (data.code == 200) {
      setData({
        selectProduct: "",
        bom: "",
      });
      let arr = data.response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllResponseData(arr);
      // setShow(false);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message);
      // setViewModal(false);
      // setShow(false);
      setLoading(false);
    }
  };

  if (!viewModal) {
    return null;
  }

  return (
    <form>
      <Modal
        title="BOM Wise SF Report"
        centered
        open={viewModal}
        onOk={() => {
          generateFun();
          setViewModal(false);
        }}
        onCancel={() => setViewModal(false)}
        width={800}
      >
        <Row justify="center" gutter={16}>
          <Col span={12}>
            <MyAsyncSelect
              selectLoading={selectLoading}
              style={{ width: "100%" }}
              loadOptions={getProductNameFecth}
              onBlur={() => setAsyncOptions([])}
              onInputChange={(e) => setSearch(e)}
              value={dataa.selectProduct.value}
              placeholder="Product Name / SKU"
              optionsState={asyncOptions}
              onChange={(e) =>
                setData((dataa) => {
                  return { ...dataa, selectProduct: e };
                })
              }
            />
          </Col>
          <Col span={12}>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Bom"
              options={bomName}
              value={dataa.bom.value}
              onChange={(e) =>
                setData((dataa) => {
                  return { ...dataa, bom: e };
                })
              }
            />
          </Col>
          <Col span={12} style={{ marginTop: "5px" }}>
            <MyDatePicker setDateRange={setDate} size="default" />
          </Col>
        </Row>
      </Modal>
    </form>
  );
};

export default OpenR29Modal;
