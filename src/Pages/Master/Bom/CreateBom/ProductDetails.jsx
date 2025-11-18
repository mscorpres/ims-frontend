import { Button, Card, Col, Form, Input, Radio, Row, Space } from "antd";
import React from "react";
import MySelect from "../../../../Components/MySelect";
import UploadFile from "./UploadFile";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import Typography from "antd/es/typography/Typography";
import MyButton from "../../../../Components/MyButton";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox";
import CustomButton from "../../../../new/components/reuseable/CustomButton";
import { renderIcon } from "../../../../new/components/layout/Sidebar/iconMapper";
import { Search } from "@mui/icons-material";

const ProductDetails = ({
  submitHandler,
  uploadType,
  setUploadType,
  getSKUDetails,
  productSelected,
  resetProduct,
  loading,
  getComponentOptions,
  asyncOptions,
  selectLoading,
  setAsyncOptions,
  stage,
  projectData,
}) => {
  const toggleInputType = (e) => {
    setUploadType(e.target.value);
  };

  const productType = Form.useWatch("type");

  return (
    <CustomFieldBox title="Product Details">
      <Row gutter={6}>
        <Col span={24}>
          <Radio.Group
            onChange={toggleInputType}
            value={uploadType}
            options={uploadTypeOptions}
          />
        </Col>
        <Col span={24}>
          <Form.Item label="BOM Name" name="name" rules={rules.name}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="SKU" name="sku" rules={rules.sku}>
            <Input disabled={productSelected} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Product Type" name="type" rules={rules.type}>
            <MySelect options={typeOptions} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Row justify="end">
            <Space>
              <CustomButton
                size="small"
                onclick={resetProduct}
                loading={loading === "fetch"}
                variant="outlined"
                title="Reset"
                endicon={renderIcon("ResetIcon")}
              />

              <CustomButton
                onclick={getSKUDetails}
                size="small"
                loading={loading === "fetch"}
                title="search"
                endicon={<Search fontSize="small" />}
              />
            </Space>
          </Row>
        </Col>
        <Col span={24}>
          <Form.Item label="Level" name="level" rules={rules.level}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Product" name="product" rules={rules.product}>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Project" name="project" rules={rules.project}>
            <MySelect options={projectData} />
          </Form.Item>
        </Col>
        {productType === "Y" && (
          <Col span={24}>
            <Form.Item
              label="SFG Part Code"
              name="partCode"
              rules={rules.partCode}
            >
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                loadOptions={getComponentOptions}
                selectLoading={selectLoading}
                optionsState={asyncOptions}
                labelInValue
              />
            </Form.Item>
          </Col>
        )}
        {uploadType === "file" && (
          <Col span={24} style={{ marginBottom: 10 }}>
            <Typography.Text type="secondary" strong>
              Note: <br />
              Kindly don't do any changes with columns of the sample file, it
              can lead to errors.
            </Typography.Text>
          </Col>
        )}
        {uploadType === "file" && (
          <Col span={24}>
            <UploadFile rules={rules.file} />
          </Col>
        )}
        <Col span={24}>
          <Row justify="end">
            <Space>
              {uploadType === "file" && (
                <Button
                  href="https://media.mscorpres.net/oakterIms/other/BOM%20UPLOAD.csv"
                  type="link"
                >
                  Download Sample File
                </Button>
              )}
             
              <CustomButton
                size="small"
                title={
                  stage === "preview"
                    ? uploadType === "file"
                      ? "Preview"
                      : "Submit"
                    : "Submit"
                }
                disabled={!productSelected}
                onclick={submitHandler}
                loading={loading === "submit"}
              />
            </Space>
          </Row>
        </Col>
      </Row>
    </CustomFieldBox>
  );
};

export default ProductDetails;
const typeOptions = [
  {
    text: "Finished Goods",
    value: "N",
  },
  {
    text: "Semi-Finished Goods",
    value: "Y",
  },
];

const uploadTypeOptions = [
  {
    label: "File",
    value: "file",
  },
  {
    label: "Manual",
    value: "table",
  },
];
const rules = {
  name: [
    {
      required: true,
      message: "Please enter a BOM name!",
    },
  ],
  sku: [
    {
      required: true,
      message: "Please provide a SKU",
    },
  ],
  type: [
    {
      required: true,
      message: "Please provide a product type",
    },
  ],
  level: [
    {
      required: true,
      message: "Please provide a level",
    },
  ],
  file: [
    {
      required: true,
      message: "Please select a file to upload",
    },
  ],
  partCode: [
    {
      required: true,
      message: "Please enter SFG Part Code",
    },
  ],
  project: [
    {
      required: true,
      message: "Please select a Project",
    },
  ],
};
