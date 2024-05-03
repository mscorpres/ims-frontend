import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { useLocation } from "react-router-dom";
import View from "@/pages/Master/Products/View";
import Edit from "@/pages/Master/Products/Edit";
import Add from "@/pages/Master/Products/Add";
import AddPhoto from "@/pages/Master/Products/AddPhoto";
import ComponentImages from "@/pages/Master/Products/ComponentImages";
import useApi from "@/hooks/useApi";
import { getUOMList } from "@/api/master/uom";
import { getProductsList } from "@/api/master/products";
import { ResponseType } from "@/types/general";

const Product = () => {
  const [productType, setProductType] = useState<"fg" | "sfg">();
  const [uomOptions, setUomOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingProduct, setEditingProduct] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [showImages, setShowImages] = useState(false);

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
    <Row
      gutter={6}
      justify="center"
      style={{ height: "90%", padding: "0px 5px" }}
    >
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
      <Col sm={8} xl={6} xxl={4}>
        <Add
          uomOptions={uomOptions}
          getProductRows={getProductRows}
          productType={productType}
        />
      </Col>
      <Col span={10}>
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
