import {
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Typography,
} from "antd";
import React, { useState } from "react";
import MyButton from "@/Components/MyButton";
import MySelect from "@/Components/MySelect.jsx";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { SelectOptionType } from "@/types/general";
import useApi from "@/hooks/useApi";
import { getComponentOptions } from "@/api/general";
import { convertSelectOptions } from "@/utils/general";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { toast } from "react-toastify";

const typeOptions: SelectOptionType[] = [
  {
    text: "Main",
    value: "main",
  },
  {
    text: "Substitute",
    value: "substitute",
  },
];

interface ComponentType {
  component: {
    label: string;
    value: string;
  };
  text: string;
  value: string;
  qty: string;
  remarks: string;
  type: "main" | "substitute";
  substituteOf: {
    label: string;
    value: string;
  };
}

const BOMCreate = () => {
  const [mainComponents, setMainComponents] = useState<ComponentType[]>([]);
  const [subComponents, setSubComponents] = useState<ComponentType[]>([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const type = Form.useWatch("type", form);

  const handleFetchComponentOptions = async (search: string) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setAsyncOptions(convertSelectOptions(response.data ?? []));
    console.log("component response", response);
  };

  const handleAddComponents = async () => {
    const values = await form.validateFields([
      "component",
      "qty",
      "type",
      "remarks",
      "substituteOf",
    ]);
    console.log("add values", values);
    const newComponent = {
      ...values,

      value: values.component.value,
      text: values.component.label,
    };

    let verifyArr = [...mainComponents, ...subComponents];
    const found = verifyArr.find((row) => row.value === values.component.value);
    // if (verifyArr.find((row) => row.value === values.component.value)) {
    //   return toast.error(
    //     `Component already added in ${found?.type} components with Qty: ${found?.qty}`
    //   );
    // }

    if (values.type === "main") {
      setMainComponents((curr) => [...curr, newComponent]);
    } else {
      setSubComponents((curr) => [...curr, newComponent]);
    }

    // form.resetFields(["component", "type", "qty", "remarks", "substituteOf"]);
  };

  const handleDeleteComponent = (
    componentkey: string,
    type: ComponentType["type"]
  ) => {
    if (type === "main") {
      setMainComponents((curr) =>
        curr.filter((row) => row.value !== componentkey)
      );
    } else {
      setSubComponents((curr) =>
        curr.filter((row) => row.value !== componentkey)
      );
    }
  };
  return (
    <Form
      style={{ padding: 10, height: "95%" }}
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Row gutter={6} justify="center" style={{ height: "100%" }}>
        <Col span={4}>
          <Flex vertical gap={5}>
            <Card size="small" title="Header Details">
              <Form.Item name="name" label="BOM Name">
                <Input />
              </Form.Item>
              <Form.Item name="product" label="Product">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Flex justify="center" gap={5}>
                <MyButton variant="reset" />
                <MyButton variant="submit" />
              </Flex>
            </Card>
            {/* Compnent add card */}
            <Card size="small" title="Add Component">
              <Form.Item name="component" label="Component">
                <MyAsyncSelect
                  loadOptions={handleFetchComponentOptions}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  labelInValue={true}
                  selectLoading={loading("select")}
                />
              </Form.Item>
              <Flex wrap="wrap" gap={5}>
                <Form.Item
                  style={{ flex: 1, minWidth: 100 }}
                  name="qty"
                  label="Qty"
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item style={{ minWidth: 150 }} name="type" label="Type">
                  <MySelect options={typeOptions} />
                </Form.Item>
              </Flex>
              {type === "substitute" && (
                <Form.Item name="substituteOf" label="Substitute Of">
                  <MySelect options={mainComponents} labelInValue={true} />
                </Form.Item>
              )}

              <Form.Item name="remarks" label="Remarks">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Flex justify="center" gap={5}>
                <MyButton variant="reset" />
                <MyButton variant="add" onClick={handleAddComponents} />
              </Flex>
            </Card>
          </Flex>
        </Col>
        <Col span={18} style={{ height: "100%", overflow: "hidden" }}>
          <Row gutter={6} style={{ height: "100%" }}>
            <Col span={12} style={{ height: "100%", overflow: "hidden" }}>
              <Card
                size="small"
                title="Main Components"
                style={{
                  height: "100%",
                }}
                extra={`${mainComponents.length} Added`}
                bodyStyle={{
                  height: "95%",
                }}
              >
                <div
                  style={{
                    height: "100%",
                  }}
                >
                  <Components
                    rows={mainComponents}
                    type="main"
                    handleDeleteComponent={handleDeleteComponent}
                  />
                </div>
              </Card>
            </Col>
            <Col span={12} style={{ height: "100%", overflow: "hidden" }}>
              <Card
                size="small"
                title="Substitute Components"
                extra={`${subComponents.length} Added`}
                style={{
                  height: "100%",
                }}
                bodyStyle={{
                  height: "95%",
                }}
              >
                <div
                  style={{
                    height: "100%",
                  }}
                >
                  <Components
                    rows={subComponents}
                    type="substitute"
                    handleDeleteComponent={handleDeleteComponent}
                  />
                </div>
              </Card>
            </Col>
            {/* <Col span={12}>
              <Card
                size="small"
                title="Substitute Components"
                style={{ height: "100%", overflow: "hidden" }}
                bodyStyle={{ height: "98%", overflow: "hidden" }}
              >
                <Components
                  rows={subComponents}
                  type="substitute"
                  handleDeleteComponent={handleDeleteComponent}
                />
              </Card>
            </Col> */}
          </Row>
        </Col>
      </Row>
      ;
    </Form>
  );
};

export default BOMCreate;

const Components = ({
  rows,
  type,
  handleDeleteComponent,
}: {
  rows: ComponentType[];
  type?: "main" | "substitute";
  handleDeleteComponent: (
    componentKey: string,
    type: ComponentType["type"]
  ) => void;
}) => {
  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      {rows.length === 0 && <Empty />}
      {rows.length > 0 && (
        <Row gutter={[6, 6]} style={{ height: "100%" }}>
          {/* headers */}
          <Col span={1}>
            <Typography.Text strong>#</Typography.Text>
          </Col>
          <Col span={8}>
            <Typography.Text strong>Component</Typography.Text>
          </Col>
          <Col span={4}>
            <Typography.Text strong>Qty</Typography.Text>
          </Col>
          {type === "substitute" && (
            <Col span={6}>
              <Typography.Text strong>Substitute of</Typography.Text>
            </Col>
          )}
          <Col span={type === "substitute" ? 5 : 11}>
            <Typography.Text strong>Remarks</Typography.Text>
          </Col>

          {/* rows */}
          <Col
            span={24}
            style={{ height: "100%", overflow: "auto", paddingBottom: 30 }}
          >
            <Row gutter={[0, 4]}>
              {rows.map((row, index: number) => (
                <>
                  <Col span={1}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {index + 1}
                    </Typography.Text>
                  </Col>
                  <Col span={8}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.component.label}
                    </Typography.Text>
                  </Col>
                  <Col span={4}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.qty}
                    </Typography.Text>
                  </Col>
                  {type === "substitute" && (
                    <Col span={6}>
                      <Typography.Text style={{ fontSize: 13 }}>
                        {row.substituteOf?.label}
                      </Typography.Text>
                    </Col>
                  )}
                  <Col span={type === "substitute" ? 4 : 10}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.remarks}
                    </Typography.Text>
                  </Col>
                  <Col span={1}>
                    <CommonIcons
                      action="deleteButton"
                      onClick={() => handleDeleteComponent(row.value, row.type)}
                    />
                  </Col>
                </>
              ))}
            </Row>
            <Flex justify="center">
              <Typography.Text strong type="secondary">
                --End of the list--
              </Typography.Text>
            </Flex>
          </Col>
        </Row>
      )}
    </div>
  );
};

// {
//     name:"",
//     product:"",
//     description;"",
//     components:[
//         {
//             component:"",
//             qty:"",
//             remarks:"",
//             type :"main" | "subsitute",
//             substitueOf:"",
//             status:"active" | "inactive"
//         }
//     ]
// }

const initialValues = {
  component: undefined,
  qty: undefined,
  type: "main",
  remarks: undefined,
  substituteOf: undefined,
};

const Empty = () => {
  return (
    <Flex justify="center" align="center" style={{ height: "100%" }}>
      <Typography.Text strong type="secondary">
        No Components Added!!!
      </Typography.Text>
    </Flex>
  );
};
