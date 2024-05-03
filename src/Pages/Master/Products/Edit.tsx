import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Skeleton,
  Space,
} from "antd";
import MySelect from "../../../Components/MySelect";
import useApi from "../../../hooks/useApi";
import {
  getProductDetails,
  updateProductDetails,
} from "../../../api/master/products";

const taxOptions = [
  { text: "Exempted", value: "EXE" },
  { text: "Regular", value: "REG" },
];
const enabledOptions = [
  { text: "Yes", value: true },
  { text: "No", value: false },
];
const productTypeOptions = [
  { text: "FG", value: "fg" },
  { text: "SFG", value: "sfg" },
];

const category = [
  { text: "Goods", value: "goods" },
  { text: "Services", value: "services" },
];
const Edit = ({
  editingProduct,
  setEditingProduct,
  productType,
  uomOptions,
  getProductRows,
}) => {
  const [productName, setProductName] = useState("");

  const { executeFun, loading } = useApi();
  const [updateProductForm] = Form.useForm();

  const getDetails = async () => {
    if (editingProduct) {
      const response = await executeFun(
        () => getProductDetails(editingProduct),
        "fetch"
      );
      if (response.success) {
        updateProductForm.setFieldsValue(response.data);
        setProductName(response.data.name);
      }
      // setDetailsLoading(true);
      // const { data } = await imsAxios.post(
      //   "/products/getProductForUpdate",
      //   {
      //     product_key: editingProduct,
      //   }
      // );
      // setDetailsLoading(false);
      // if (data.code === 200) {
      //   let obj = data.data[0];
      //   obj = {
      //     ...obj,
      //     producttype:
      //       productType === "sfg" ? "semi" : "default",
      //   };
      //   console.log("Object->", obj);
      //   setProductName(data.data[0].productname);
      //   updateProductForm.setFieldsValue(obj);
      // }
    }
  };

  const submitHandler = async () => {
    const values = await updateProductForm.validateFields();

    const response = await executeFun(
      () => updateProductDetails(values, editingProduct, productType),
      "submit"
    );

    if (response.success) {
      getProductRows();
      setEditingProduct(false);
    }
    // try {
    //   const values = await updateProductForm.validateFields();
    //   let link =
    //     productType === "sfg"
    //       ? "/products/updateSemiProduct"
    //       : "/products/updateProduct";
    //   const fgObj = {
    //     hsn: values.hsncode,
    //     jobworkcost: values.jobworkcost,
    //     labourcost: values.laboutcost,
    //     packingcost: values.packingcost,
    //     othercost: values.othercost,
    //     minstock: values.minstock,
    //     batchstock: values.batchstock,
    //     category: values.productcategory, //ask
    //     mrp: values.mrp,
    //     brand: values.brand,
    //     ean: values.ean,
    //     weight: values.weight,
    //     vweight: values.vweight,
    //     height: values.height,
    //     width: values.width,
    //     minstockrm: values.minrmstock,
    //     producttype: values.producttype,
    //     isenabled: values.enablestatus_name,
    //     gsttype: values.tax_type_name,
    //     gstrate: values.gstrate_name,
    //     product_category: values.category,
    //     location: values.loc,
    //     description: values.description,
    //     uom: values.uomid,
    //     product_name: values.productname,
    //     producttKey: editingProduct,
    //   };
    //   const sfgObj = {
    //     sac: values.hsncode,
    //     description: values.description,
    //     product_category: values.category,
    //     category: values.productcategory, // ask
    //     producttKey: editingProduct,
    //     uom: values.uomid,
    //     isenabled: values.enablestatus_name,
    //     gstrate: values.gstrate_name,
    //     gsttype: values.tax_type_name,
    //     product_name: values.productname,
    //     producttype: values.producttype,
    //   };
    //   console.log(fgObj);
    //   let finalObj = productType === "sfg" ? sfgObj : fgObj;
    //   setSubmitLoading(true);
    //   const { data } = await imsAxios.post(link, finalObj);
    //   setSubmitLoading(false);
    //   if (data.code === 200) {
    //     toast.success(data.message);
    //     getProductRows();
    //     setEditingProduct(false);
    //   } else {
    //     toast.error(data.message.msg);
    //   }
    // } catch (err) {
    //   console.log("errror", err);
    // }
  };

  useEffect(() => {
    if (editingProduct) {
      getDetails();
    }
  }, [editingProduct]);
  return (
    <Drawer
      open={editingProduct}
      onClose={() => setEditingProduct(false)}
      width="50vw"
      title={"Updating: " + productName}
      extra={
        <Space>
          <Button onClick={() => setEditingProduct(false)}>Back</Button>
          <Button
            loading={loading("submit")}
            onClick={submitHandler}
            type="primary"
          >
            Update
          </Button>
        </Space>
      }
    >
      <Form form={updateProductForm} onFinish={submitHandler} layout="vertical">
        <Divider
          style={{ marginTop: -10, marginBottom: 10 }}
          orientation="left"
        >
          Basic Details
        </Divider>
        <Row gutter={8}>
          <Col span={9}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="name" label="Product Name">
              {!loading("fetch") && <Input />}
            </Form.Item>
          </Col>
          <Col span={3}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="uom" label="UoM">
              {!loading("fetch") && <MySelect options={uomOptions} />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {" "}
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="productCategory" label="Product Category">
              {!loading("fetch") && <Input />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item label="Category" name="category">
              {!loading("fetch") && <MySelect options={category} />}
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={6}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="mrp" label="MRP">
              {!loading("fetch") && <Input disabled />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="type" label="Type">
              {!loading("fetch") && <MySelect options={productTypeOptions} />}
            </Form.Item>
          </Col>
          {/* <Col span={6}> //ask this
            {loading('fetch') && (
              <Skeleton.Input active  />
            )}
            <Form.Item name="costprice" label="Cost Price">
              {!loading('fetch') && <Input />}
            </Form.Item>
          </Col> */}
          <Col span={6}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="isEnabled" label="Enabled">
              {!loading("fetch") && <MySelect options={enabledOptions} />}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {loading("fetch") && (
              <Skeleton.Input block active loading={loading("fetch")} />
            )}
            <Form.Item name="description" label="Description">
              {!loading("fetch") && <Input.TextArea rows={4} />}
            </Form.Item>
          </Col>
        </Row>

        <Divider
          style={{ marginTop: -10, marginBottom: 10 }}
          orientation="left"
        >
          Tax Details
        </Divider>

        <Row gutter={8}>
          <Col span={8}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="taxType" label="Tax Type">
              {!loading("fetch") && <MySelect options={taxOptions} />}
            </Form.Item>
          </Col>
          <Col span={8}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="taxRate" label="GST Rate">
              {!loading("fetch") && <Input />}
            </Form.Item>
          </Col>
          <Col span={8}>
            {loading("fetch") && <Skeleton.Input active />}
            <Form.Item name="hsn" label="HSN">
              {!loading("fetch") && <Input />}
            </Form.Item>
          </Col>
        </Row>
        {productType === "fg" && (
          <>
            <Divider
              style={{ marginTop: -10, marginBottom: 10 }}
              orientation="left"
            >
              Advance Details
            </Divider>

            <Row gutter={8}>
              <Col span={8}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="brand" label="Brand">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="ean" label="EAN">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="weight" label="Weight">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={8}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="volumetricWeight" label="Volumetric Weight">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="height" label="Height">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="width" label="Width">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
            </Row>

            <Divider
              style={{ marginTop: -10, marginBottom: 10 }}
              orientation="left"
            >
              Production Plan and Costing
            </Divider>

            <Row gutter={8}>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="minStock" label="MIN Stock (FG)">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="minRmStock" label="MIN Stock(RM)">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="batchQty" label="MFG Batch Size">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item
                  name="defaultStockLocation"
                  label="Default Stock Location"
                >
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="labourCost" label="Labour Cost">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="packingCost" label="Sec Packing Cost">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="jobworkCost" label="JW Cost">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {loading("fetch") && <Skeleton.Input active />}
                <Form.Item name="otherCost" label="Other Cost">
                  {!loading("fetch") && <Input />}
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default Edit;
