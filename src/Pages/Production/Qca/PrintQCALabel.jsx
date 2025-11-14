import { useState } from "react";
import { Col, Form, Input, Row } from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import printFunction from "../../../Components/printFunction";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
import CustomButton from "../../../new/components/reuseable/CustomButton";

const PrintQCALabel = () => {
  const [loading, setLoading] = useState(false);
  const [printLabelForm] = Form.useForm();

  const printHandler = async () => {
    const values = await printLabelForm.validateFields();
    try {
      setLoading(true);
      const response = await imsAxios.post("/qcalable/generateQcaLable", {
        skuType: values.type,
        totalQr: values.quantity,
      });
      const { data } = response;
      if (data) {
        printFunction(data.data.buffer.data);
      }
    } catch (error) {
      console.log("error while printing labels", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ height: "90%", margin: 12 }} justify="center">
      <Col span={8}>
        <CustomFieldBox title="Print QCA Label">
          <Form
            initialValues={defaultValues}
            form={printLabelForm}
            layout="vertical"
          >
            <Form.Item label="SKU Type" name="type" rules={rules.type}>
              <MySelect options={typeOptions} />
            </Form.Item>
            <Form.Item label="Quantity" name="quantity" rules={rules.quantity}>
              <Input />
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <CustomButton
              size="small"
              title={"Print"}
              onclick={printHandler}
              loading={loading}
            />
          </div>
        </CustomFieldBox>
      </Col>
    </Row>
  );
};

const typeOptions = [
  {
    label: "FG",
    value: "FG",
  },
  {
    label: "SFG",
    value: "SFG",
  },
];

const defaultValues = {
  type: "FG",
  quantity: "",
};

const rules = {
  type: [
    {
      required: true,
      message: "Please select FG type",
    },
  ],
  quantity: [
    {
      required: true,
      message: "Please input quantity",
    },
  ],
};
export default PrintQCALabel;
