import { imsAxios } from "@/axiosInterceptor";
import { ModalType } from "@/types/general";
import {
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface PropType extends ModalType {
  field: any;
  fieldSelectOptions: any[];
  handleFetchFields: () => void;
}
const AddCategoryModal = (props: PropType) => {
  const packageSizeValidation = (value: string, name: string) => {
    const first = value.toString().split(".")[0];
    const second = value.toString().split(".")[1];
    const updatedFirst = first.padStart(2, "0").substring(0, 2);
    const updatedSecond = second.padEnd(2, "0").substring(0, 2);
    form.setFieldValue(name, `${updatedFirst}.${updatedSecond}`);
  };

  const validateHander = async () => {
    const values = await form.validateFields();

    let newValue;

    if (
      props.field?.name === "89768575" ||
      props.field?.name === "7876567" ||
      props.field?.name === "453940492"
    ) {
      const found = props.fieldSelectOptions.filter(
        (row) => row.name === props.field?.name
      );

      const lastValue = found[found?.length - 1];

      newValue = +lastValue.value + 1;
      if (props.field?.name === "7876567") {
        newValue = newValue.toString().padStart(2, "0");
      }
    } else if (props.field?.name === "434092") {
      newValue = values.input1 + "*" + values.input2;
    } else {
      newValue = values.label;
    }

    const payload = {
      attribute: props.field?.name,
      value: newValue,
      code: newValue,
    };

    Modal.confirm({
      title: "Adding Attribute Option",
      content:
        "Please check the values you have entered, this action is irreversible",
      onOk: () => submitHandler(payload),
      okText: "Submit",
    });
  };

  const submitHandler = async (payload) => {
    try {
      const response = await imsAxios.post(
        "/mfgcategory/insertAttributesData",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          props.hide();
          props.handleFetchFields();
          form.resetFields();
        }
      }
    } catch (error) {}
  };
  const [form] = Form.useForm();

  useEffect(() => {
    if (!props.show) {
      form.resetFields();
    }
  }, [props.show]);
  console.log("this is props.show", props.show);
  return (
    <Modal
      title="Add Option"
      open={props.show}
      width={300}
      okText="Add"
      onOk={validateHander}
      // confirmLoading={loadi}
      onCancel={props.hide}
    >
      <Form initialValues={initialValues} layout="vertical" form={form}>
        <Row>
          <Typography.Text strong style={{ textTransform: "capitalize" }}>
            Attribute : {props.field?.label?.replaceAll("_", " ")}
          </Typography.Text>
        </Row>
        <Divider />
        {props.field?.name === "434092" && (
          <Flex align="center" justify="center" gap={10}>
            <Form.Item name="input1" label="Length">
              <InputNumber
                placeholder="00.00"
                step={"00.01"}
                onBlur={(e) => {
                  packageSizeValidation(e.target.value, "input1");
                }}
              />
            </Form.Item>
            *
            <Form.Item name="input2" label="Width">
              <InputNumber
                placeholder="00.00"
                step={"00.01"}
                onBlur={(e) => {
                  packageSizeValidation(e.target.value, "input2");
                }}
              />
            </Form.Item>
          </Flex>
        )}
        {props.field?.name !== "434092" && (
          <>
            {" "}
            <Form.Item
              name="label"
              label="Label"
              rules={
                props.field?.regex && [
                  {
                    required: true,

                    pattern:
                      /^([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?\*([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?$/,

                    message: "Wrong format!",
                  },
                ]
              }
            >
              <Input />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;

const initialValues = {
  code: "",
  label: "",
};
