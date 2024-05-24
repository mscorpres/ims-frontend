import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Typography,
  Upload,
} from "antd";
import { toast } from "react-toastify";
import MyButton from "@/Components/MyButton";
import MySelect from "@/Components/MySelect.jsx";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import useApi from "@/hooks/useApi";
import { ModalType, SelectOptionType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";
import { getComponentOptions, getVendorOptions } from "@/api/general";
import { getProductOptions } from "@/api/r&d/products";
import { createBOM, getExistingBom } from "@/api/r&d/bom";

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
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const [version, setVersion] = useState("");
  const [vendorType, setVendorType] = useState(false);

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const type = Form.useWatch("type", form);

  const handleFetchComponentOptions = async (search: string) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setAsyncOptions(convertSelectOptions(response.data ?? []));
  };

  const handleAddComponents = async () => {
    const values = await form.validateFields([
      "component",
      "qty",
      "type",
      "remarks",
      "substituteOf",
      "vendor",
      "locations",
    ]);
    console.log("add values", values);
    const newComponent = {
      ...values,

      value: values.component.value,
      text: values.component.label,
    };

    let verifyArr = [...mainComponents, ...subComponents];
    const found = verifyArr.find((row) => row.value === values.component.value);
    if (verifyArr.find((row) => row.value === values.component.value)) {
      return toast.error(
        `Component already added in ${found?.type} components with Qty: ${found?.qty}`
      );
    }

    if (values.type === "main") {
      setMainComponents((curr) => [...curr, newComponent]);
    } else {
      setSubComponents((curr) => [...curr, newComponent]);
    }

    form.resetFields([
      "component",
      "type",
      "qty",
      "remarks",
      "substituteOf",
      "vendor",
      "locations",
    ]);
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

  const handleFetchProductOptions = async (search: string) => {
    const response = await executeFun(
      () => getProductOptions(search),
      "select"
    );
    setAsyncOptions(response.data ?? []);
  };

  const handleFetchVendorOptions = async (search: string) => {
    const response = await executeFun(() => getVendorOptions(search), "select");

    let arr: SelectOptionType[] = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }

    setAsyncOptions(arr);
  };

  const validateHandler = async () => {
    const values = await form.validateFields();

    let combined = [...mainComponents, ...subComponents];
    const response = await executeFun(
      () => createBOM({ ...values, components: combined }),
      "submit"
    );

    if (response.success) {
      resetHandler();
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFetchExistingBom = async (sku: string) => {
    const response = await executeFun(() => getExistingBom(sku), "fetch");
    if (response.success) {
      form.setFieldsValue(response.data);
      setVersion(response.data.version);
      setMainComponents(
        response.data.components.filter((row) => row.type === "main")
      );
      setSubComponents(
        response.data.components.filter((row) => row.type === "substitute")
      );
      console.log("this is response", response.data);
    }
  };

  const toggleVendorType = () => {
    setVendorType((curr) => !curr);
    form.setFieldValue("vendor", undefined);
  };
  const resetHandler = () => {
    form.resetFields();
    setMainComponents([]);
    setSubComponents([]);
  };
  return (
    <Form
      style={{ padding: 10, height: "95%" }}
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Row gutter={6} justify="center" style={{ height: "100%" }}>
        <Col span={4} style={{ height: "100%", overflow: "auto" }}>
          <Flex vertical gap={5}>
            <Card
              size="small"
              title="Header Details"
              extra={<Typography.Text strong>V{version}</Typography.Text>}
            >
              <Form.Item name="name" label="BOM Name">
                <Input />
              </Form.Item>
              <Form.Item name="product" label="Product">
                <MyAsyncSelect
                  loadOptions={handleFetchProductOptions}
                  selectLoading={loading("select")}
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  onChange={(value) => handleFetchExistingBom(value)}
                />
              </Form.Item>
              <Form.Item name="description" label="Remarks">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                name="documents"
                label="Documents"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                extra="Max 4 Documents"
              >
                <Upload
                  name="document"
                  beforeUpload={() => false}
                  style={{ marginBottom: 10 }}
                  maxCount={4}
                >
                  <MyButton
                    variant="upload"
                    text="Select"
                    style={{ width: "100%", marginBottom: 5 }}
                  />
                </Upload>
              </Form.Item>
              {/* <Flex justify="center" gap={5}>
                <MyButton variant="reset" />
                <MyButton variant="submit" onClick={validateHandler} />
              </Flex> */}
            </Card>
            {/* Component add card */}
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
                <Form.Item
                  style={{ flex: 1, minWidth: 100 }}
                  name="type"
                  label="Type"
                >
                  <MySelect options={typeOptions} />
                </Form.Item>
              </Flex>
              {type === "substitute" && (
                <Form.Item name="substituteOf" label="Substitute Of">
                  <MySelect options={mainComponents} labelInValue={true} />
                </Form.Item>
              )}
              <Form.Item
                style={{ flex: 1, minWidth: 100 }}
                name="vendor"
                label={
                  <Flex
                    align="center"
                    style={{ width: 500 }}
                    justify="space-between"
                  >
                    <p>Vendor</p>
                    <Button onClick={toggleVendorType} size="small" type="link">
                      {!vendorType ? "Type" : "Select"} Vendor
                    </Button>
                  </Flex>
                }
              >
                {!vendorType && (
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    loadOptions={handleFetchVendorOptions}
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                  />
                )}
                {vendorType && <Input />}
              </Form.Item>
              <Form.Item
                style={{ flex: 1, minWidth: 100 }}
                name="locations"
                label="Placement"
              >
                <Input />
              </Form.Item>

              <Form.Item name="remarks" label="Remarks">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Flex justify="center" gap={5}>
                <MyButton variant="reset" />
                <MyButton variant="add" onClick={handleAddComponents} />
              </Flex>
              <Divider />
              <Flex align="center" vertical gap={10}>
                <Typography.Text
                  strong
                  type="secondary"
                  style={{ textAlign: "center", fontSize: 13 }}
                >
                  After adding the components and header details, click on
                  Create BOM
                </Typography.Text>
                <MyButton
                  variant="submit"
                  text="Create BOM"
                  loading={loading("submit")}
                  onClick={validateHandler}
                />
              </Flex>
            </Card>
          </Flex>
        </Col>
        <Col span={20} style={{ height: "100%", overflow: "hidden" }}>
          <Row gutter={[6, 6]} style={{ height: "100%" }}>
            <Col span={24} style={{ height: "50%", overflow: "hidden" }}>
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
            <Col span={24} style={{ height: "100%", overflow: "hidden" }}>
              <Card
                size="small"
                title="Substitute Components"
                extra={`${subComponents.length} Added`}
                style={{
                  height: "50%",
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
          <Col span={2}>
            <Typography.Text strong>Qty</Typography.Text>
          </Col>
          <Col span={3}>
            <Typography.Text strong>Vendor</Typography.Text>
          </Col>
          <Col span={3}>
            <Typography.Text strong>Locations</Typography.Text>
          </Col>
          {type === "substitute" && (
            <Col span={4}>
              <Typography.Text strong>Substitute of</Typography.Text>
            </Col>
          )}
          <Col span={type === "substitute" ? 3 : 7}>
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
                      {row.component.label ?? row.component.text}
                    </Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.qty}
                    </Typography.Text>
                  </Col>
                  <Col span={3}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.vendor?.label ?? row.vendor}
                    </Typography.Text>
                  </Col>
                  <Col span={3}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.locations}
                    </Typography.Text>
                  </Col>
                  {type === "substitute" && (
                    <Col span={4}>
                      <Typography.Text style={{ fontSize: 13 }}>
                        {row.substituteOf?.label}
                      </Typography.Text>
                    </Col>
                  )}
                  <Col span={type === "substitute" ? 2 : 6}>
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
const initialValues = {
  component: undefined,
  qty: undefined,
  type: "main",
  remarks: undefined,
  substituteOf: undefined,
  vendor: undefined,
  locations: undefined,
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

interface LocationProps extends ModalType {}
const LocationModal = (props: LocationProps) => {
  const [searchInput, setSearchInput] = useState("");
  const { executeFun, loading } = useApi();
  return (
    <Modal open={props.show} onCancel={props.hide} title="Locations">
      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </Modal>
  );
};
