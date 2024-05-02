import { useEffect, useState } from "react";
import { Card, Col, Form, Input, Row } from "antd";
import { useLocation } from "react-router-dom";
import View from "./View";
import Add from "./Add";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import Edit from "./Edit";
import AddPhoto from "./AddPhoto";
import ComponentImages from "./ComponentImages";
import useApi from "../../../hooks/useApi";
import { getUOMList } from "../../../api/master/uom";

const Product = () => {
  const [productType, setProductType] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [uomOptions, setUomOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingProduct, setEditingProduct] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const { executeFun } = useApi();

  const { pathname } = useLocation();

  const getUomOptions = async () => {
    const { data } = await executeFun(() => getUOMList(), "fetch");
    setUomOptions(data);
  };
  const getProductRows = async (type) => {
    let link = "";
    if (pathname.includes("sfg")) {
      link = "/products/semiProducts";
    } else {
      link = "/products";
    }
    setTableLoading(true);
    const { data } = await imsAxios.get(link);
    setTableLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        ...row,
        index: index + 1,
        id: index,
      }));
      setRows(arr);
    }
  };
  useEffect(() => {
    if (pathname.includes("sfg")) {
      setProductType("sfg");
    } else {
      setProductType("fg");
    }
  }, [pathname]);
  useEffect(() => {
    getUomOptions();
  }, []);
  useEffect(() => {
    getProductRows(productType);
  }, [productType]);
  return (
    <Row gutter={6} style={{ height: "90%", padding: "0px 5px" }}>
      <ComponentImages showImages={showImages} setShowImages={setShowImages} />
      <Edit
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        productType={productType}
        uomOptions={uomOptions}
        getProductRows={getProductRows}
      />
      <AddPhoto
        updatingImage={updatingImage}
        setUpdatingImage={setUpdatingImage}
        getProductRows={getProductRows}
      />
      <Col span={6}>
        <Add
          formLoading={formLoading}
          uomOptions={uomOptions}
          getProductRows={getProductRows}
          productType={productType}
        />
      </Col>
      <Col span={18}>
        <View
          rows={rows}
          tableLoading={tableLoading}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          setUpdatingImage={setUpdatingImage}
          productType={productType}
          setShowImages={setShowImages}
        />
      </Col>
    </Row>
  );
};

export default Product;
