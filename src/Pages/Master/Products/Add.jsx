import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import MySelect from "../../../Components/MySelect";
import Loading from "../../../Components/Loading";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyButton from "../../../Components/MyButton";

const Add = ({ uomOptions, formLoading, productType, getProductRows }) => {
  const [addProductForm] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const category = [
    { text: "Goods", value: "goods" },
    { text: "Services", value: "services" },
  ];
  const submitHandler = async (values) => {
    let link = "";
    if (productType === "sfg") {
      link = "/products/insertSemi";
    } else {
      link = "/products/insertProduct";
    }
    setSubmitLoading(true);
    let response = await imsAxios.post(link, values);
    setSubmitLoading(false);
    if (response.data.code === 200) {
      toast.success(response.data.message);
      resetHandler();
      getProductRows();
    } else {
      toast.error(response.data.message.msg);
    }
  };
  const resetHandler = () => {
    addProductForm.resetFields();
  };
  useEffect(() => {
    addProductForm.setFieldsValue({
      category: "",
      p_name: "",
      p_sku: "",
      units_id: "",
    });
  }, []);
  return (
    <div style={{ height: "90%" }}>
      <Card
        size="small"
        title={productType === "sfg" ? "Add New SFG" : "Add New FG"}
      >
        {formLoading && <Loading />}
        <Form form={addProductForm} layout="vertical" onFinish={submitHandler}>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Form.Item
                name="category"
                label="Product Type"
                rules={[
                  {
                    required: true,
                    message: "Please select type ",
                  },
                ]}
              >
                <MySelect options={category} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item
                    name="p_sku"
                    label="Product SKU"
                    rules={[
                      {
                        required: true,
                        message: "Please entar a unique SKU Code!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="units_id"
                    label="Unit"
                    rules={[
                      {
                        required: true,
                        message: "Please select a Unit for the product!",
                      },
                    ]}
                  >
                    <MySelect options={uomOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Form.Item
                name="p_name"
                label="Product Name"
                rules={[
                  {
                    required: true,
                    message: "Please entar a name for the product!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row justify="end">
                <Space>
                  <Form.Item>
                    <MyButton
                      // htmlType="button"
                      onClick={resetHandler}
                      variant="reset"
                    >
                      Reset
                    </MyButton>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      loading={submitLoading}
                      type="primary"
                      htmlType="submit"
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Space>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default Add;
