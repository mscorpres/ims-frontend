import { useEffect, useState } from "react";
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
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import { toast } from "react-toastify";

const Edit = ({
  editingProduct,
  setEditingProduct,
  productType,
  uomOptions,
  getProductRows,
}) => {
  const [productName, setProductName] = useState("");
  const [detailsLoading, setDetailsLoading] =
    useState(false);
  const [submitLoading, setSubmitLoading] = useState(true);

  const taxOptions = [
    { text: "Exempted", value: "EXE" },
    { text: "Regular", value: "REG" },
  ];
  const enabledOptions = [
    { text: "Yes", value: "Y" },
    { text: "No", value: "N" },
  ];
  const productTypeOptions = [
    { text: "FG", value: "default" },
    { text: "SFG", value: "semi" },
  ];
  const [updateProductForm] = Form.useForm();

  // console.log(updateProductForm);
  const getDetails = async () => {
    setDetailsLoading(true);
    const { data } = await imsAxios.post(
      "/products/getProductForUpdate",
      {
        product_key: editingProduct,
      }
    );
    setDetailsLoading(false);
    if (data.code === 200) {
      let obj = data.data[0];
      obj = {
        ...obj,
        producttype:
          productType === "sfg" ? "semi" : "default",
      };
      console.log("Object->", obj);
      setProductName(data.data[0].productname);
      updateProductForm.setFieldsValue(obj);
    }
  };

  const submitHandler = async () => {
    try {
      const values =
        await updateProductForm.validateFields();
      let link =
        productType === "sfg"
          ? "/products/updateSemiProduct"
          : "/products/updateProduct";
      const fgObj = {
        hsn: values.hsncode,
        jobworkcost: values.jobworkcost,
        labourcost: values.laboutcost,
        packingcost: values.packingcost,
        othercost: values.othercost,
        minstock: values.minstock,
        batchstock: values.batchstock,
        category: values.productcategory,
        mrp: values.mrp,
        brand: values.brand,
        ean: values.ean,
        weight: values.weight,
        vweight: values.vweight,
        height: values.height,
        width: values.width,
        minstockrm: values.minrmstock,
        producttype: values.producttype,
        isenabled: values.enablestatus_name,
        gsttype: values.tax_type_name,
        gstrate: values.gstrate_name,
        product_category: values.category,
        location: values.loc,
        description: values.description,
        uom: values.uomid,
        product_name: values.productname,
        producttKey: editingProduct,
      };
      const sfgObj = {
        sac: values.hsncode,
        description: values.description,
        product_category: values.category,
        category: values.productcategory,
        producttKey: editingProduct,
        uom: values.uomid,
        isenabled: values.enablestatus_name,
        gstrate: values.gstrate_name,
        gsttype: values.tax_type_name,
        product_name: values.productname,
        producttype: values.producttype,
      };
      console.log(fgObj);
      let finalObj = productType === "sfg" ? sfgObj : fgObj;
      setSubmitLoading(true);
      const { data } = await imsAxios.post(link, finalObj);
      setSubmitLoading(false);
      if (data.code === 200) {
        toast.success(data.message);
        getProductRows();
        setEditingProduct(false);
      } else {
        toast.error(data.message.msg);
      }
    } catch (err) {
      console.log("errror", err);
    }
  };

  const category = [
    { text: "Goods", value: "goods" },
    { text: "Services", value: "services" },
  ];

  useEffect(() => {
    if (editingProduct) {
      getDetails();
      setTimeout(() => {
        setSubmitLoading(false);
      }, 4000);
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
          <Button onClick={() => setEditingProduct(false)}>
            Back
          </Button>
          <Button
            loading={submitLoading}
            onClick={submitHandler}
            type="primary"
          >
            Update
          </Button>
        </Space>
      }
    >
      <Form
        form={updateProductForm}
        onFinish={submitHandler}
        layout="vertical"
      >
        <Divider
          style={{ marginTop: -10, marginBottom: 10 }}
          orientation="left"
        >
          Basic Details
        </Divider>
        <Row gutter={8}>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item
              name="productname"
              label="Product Name"
            >
              {!detailsLoading && <Input />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item name="uomid" label="UoM">
              {!detailsLoading && (
                <MySelect options={uomOptions} />
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item
              name="productcategory"
              label="Category"
            >
              {!detailsLoading && <Input />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item label="Product Type" name="category">
              {!detailsLoading && (
                // <Input />
                <MySelect options={category} />
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item name="mrp" label="MRP">
              {!detailsLoading && <Input disabled />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item
              name="producttype"
              label="Product Type"
            >
              {!detailsLoading && (
                <MySelect options={productTypeOptions} />
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item name="costprice" label="Cost Price">
              {!detailsLoading && <Input />}
            </Form.Item>
          </Col>
          <Col span={6}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item
              name="enablestatus_name"
              label="Enabled"
            >
              {!detailsLoading && (
                <MySelect options={enabledOptions} />
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {detailsLoading && (
              <Skeleton.Input
                block
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item
              name="description"
              label="Description"
            >
              {!detailsLoading && (
                <Input.TextArea rows={4} />
              )}
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
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item
              name="tax_type_name"
              label="Tax Type"
            >
              {!detailsLoading && (
                <MySelect options={taxOptions} />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item name="gstrate_name" label="GST Rate">
              {!detailsLoading && <Input />}
            </Form.Item>
          </Col>
          <Col span={8}>
            {detailsLoading && (
              <Skeleton.Input
                active
                loading={detailsLoading}
              />
            )}
            <Form.Item name="hsncode" label="HSN">
              {!detailsLoading && <Input />}
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
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item name="brand" label="Brand">
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item name="ean" label="EAN">
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item name="weight" label="Weight">
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={8}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="vweight"
                  label="Volumetric Weight"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item name="height" label="Height">
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={8}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item name="width" label="Width">
                  {!detailsLoading && <Input />}
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
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="minstock"
                  label="MIN Stock (FG)"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="minrmstock"
                  label="MIN Stock(RM)"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="batchstock"
                  label="MFG Batch Size"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="loc"
                  label="Default Stock Location"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="laboutcost"
                  label="Labour Cost"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="packingcost"
                  label="Sec Packing Cost"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="jobworkcost"
                  label="JW Cost"
                >
                  {!detailsLoading && <Input />}
                </Form.Item>
              </Col>
              <Col span={6}>
                {detailsLoading && (
                  <Skeleton.Input
                    active
                    loading={detailsLoading}
                  />
                )}
                <Form.Item
                  name="othercost"
                  label="Other Cost"
                >
                  {!detailsLoading && <Input />}
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
