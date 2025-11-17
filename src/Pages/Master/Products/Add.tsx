import { Col, Form, Input, Row, Space } from "antd";
import MySelect from "../../../Components/MySelect";
import { addProduct } from "../../../api/master/products";
import { ResponseType } from "../../../types/general";
import useApi from "../../../hooks/useApi";
//@ts-ignore
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { renderIcon } from "@/new/components/layout/Sidebar/iconMapper";

const Add = ({ uomOptions, productType, getProductRows }) => {
  const [addProductForm] = Form.useForm();
  const { executeFun, loading } = useApi();
  const category = [
    { text: "Goods", value: "goods" },
    { text: "Services", value: "services" },
  ];
  const submitHandler = async () => {
    const values = await addProductForm.validateFields();

    if (values) {
      const response: ResponseType = await executeFun(
        () => addProduct(values, productType),
        "submit"
      );
      if (response.success) {
        resetHandler();
        getProductRows();
      }
    }
  };
  const resetHandler = () => {
    addProductForm.resetFields();
  };

  return (
    <div style={{ height: "90%" }}>
      <CustomFieldBox
        title={productType === "sfg" ? "Add New SFG" : "Add New FG"}
      >
        <Form
          initialValues={initialValues}
          form={addProductForm}
          layout="vertical"
        >
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Form.Item
                name="category"
                label="Product Type"
                rules={rules.category}
              >
                <MySelect options={category} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item name="sku" label="Product SKU" rules={rules.sku}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="uom" label="UOM" rules={rules.uom}>
                    <MySelect options={uomOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Form.Item name="name" label="Product Name" rules={rules.product}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row justify="end">
                <Space>
                  <Form.Item>
                    <CustomButton
                    size = "small"
                      variant="outlined"
                      onclick={resetHandler}
                      title="Reset"
                      endicon={renderIcon("ResetIcon")}
                    />
                  </Form.Item>
                  <Form.Item>
                    <CustomButton
                      size = "small"
                      variant="submit"
                      onclick={submitHandler}
                      title="Save"
                      endicon={renderIcon("CheckCircleOutlined")}
                      loading={loading("submit")}
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
          </Row>
        </Form>
      </CustomFieldBox>
    </div>
  );
};

export default Add;

const initialValues = {
  category: "goods",
  product: undefined,
  sku: undefined,
  uom: undefined,
};

const rules = {
  category: [
    {
      required: true,
      message: "Category is required",
    },
  ],
  sku: [
    {
      required: true,
      message: "SKU is required",
    },
  ],
  uom: [
    {
      required: true,
      message: "UOM is required",
    },
  ],
  product: [
    {
      required: true,
      message: "Product name is required",
    },
  ],
};
