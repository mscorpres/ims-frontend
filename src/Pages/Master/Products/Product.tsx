import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { useLocation } from "react-router-dom";
import View from "@/Pages/Master/Products/View";
import Add from "@/Pages/Master/Products/Add";
import Edit from "@/Pages/Master/Products/Edit";
import AddPhoto from "@/Pages/Master/Products/AddPhoto";
import useApi from "@/hooks/useApi";
import { getUOMList } from "@/api/master/uom";
import { ResponseType } from "@/types/general";
import { getProductsList } from "@/api/master/products";
import ComponentImages from "./ComponentImages";
import { ProductType } from "@/types/master";

const Product = () => {
  const [productType, setProductType] = useState<"fg" | "sfg">();
  const [uomOptions, setUomOptions] = useState([]);
  const [rows, setRows] = useState<ProductType[]>([]);
  const [editingProduct, setEditingProduct] = useState<boolean | string>(false);
  const [updatingImage, setUpdatingImage] = useState<ProductType | false>(
    false
  );
  const [showImages, setShowImages] = useState<ProductType | false>(false);
  const { executeFun, loading } = useApi();

  const { pathname } = useLocation();

  const getUomOptions = async () => {
    const { data } = await executeFun(() => getUOMList(), "fetch");
    setUomOptions(data);
  };
  const getProductRows = async (productType: "fg" | "sfg" | undefined) => {
    if (productType) {
      const response: ResponseType = await executeFun(
        () => getProductsList(productType),
        "fetch"
      );
      setRows(response.data);
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
    <Row gutter={6} justify="start" align="top" style={{ margin:12 }}>
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
      <Col xs={24} md={8} lg={8} xl={8} xxl={6}>
        <Add
          uomOptions={uomOptions}
          getProductRows={getProductRows}
          productType={productType}
        />
      </Col>
      <Col xs={24} md={16} lg={16} xl={16} xxl={18}>
        <View
          rows={rows}
          loading={loading("fetch")}
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
