import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import Loading from "../../../Components/Loading";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
const PartCodeConversion = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [addedComponents, setAddedComponents] = useState({
    in: [],
    out: {},
  });
  const [remarks, setRemarks] = useState();
  const [editingComponent, setEditingComponent] = useState(false);
  const [componentStock, setComponentStock] = useState("--");

  const [addComponentForm] = Form.useForm();
  const [remarksForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();

  const componentIn = Form.useWatch("componentIn", addComponentForm);
  const componentOut = Form.useWatch("componentOut", addComponentForm);
  const locationIn = Form.useWatch("locationIn", addComponentForm);

  const getComponentOption = async (search) => {
    try {
      const response = await executeFun(
        () => getComponentOptions(search),
        "select"
      );
      const { data } = response;
      if (data) {
        let arr = [];
        if (data.length) {
          arr = data.map((d) => {
            return { text: d.text, value: d.id };
          });
          setAsyncOptions(arr);
        } else {
          setAsyncOptions([]);
        }
      } else {
        setAsyncOptions([]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getLocationOptions = async (search) => {
    try {
      const payload = {
        searchTerm: search,
      };
      setLoading("select");
      const response = await imsAxios.post(
        "/conversion/conversion_locations",
        payload
      );
      const { data } = response;
      if (data) {
        let arr = [];
        if (data.code === 200) {
          arr = data.data.map((d) => {
            return { text: d.text, value: d.id };
          });
          setAsyncOptions(arr);
        } else {
          setAsyncOptions([]);
        }
      } else {
        setAsyncOptions([]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getComponentStock = async (component, location) => {
    try {
      setLoading("page");
      const response = await imsAxios.post("/backend/compStockLoc", {
        component,
        location,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setComponentStock(`${data.data.closingStock} ${data.data.uom ?? ""}`);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const deleteAddedComponent = (id, type) => {
    setAddedComponents((curr) => {
      if (type === "initial") {
        return {
          ...curr,
          in: curr.in.filter((c) => c.id !== id),
        };
      } else {
        return {
          ...curr,
          out: {},
        };
      }
    });
  };
  const formResetHandler = (type) => {
    if (type === "initial") {
      addComponentForm.resetFields(["componentIn", "qtyIn", "locationIn"]);
    } else {
      addComponentForm.resetFields(["componentOut", "qtyOut", "locationOut"]);
    }
  };
  const addComponent = async (type) => {
    if (type === "initial") {
      const values = await addComponentForm.validateFields([
        "componentIn",
        "qtyIn",
        "locationIn",
      ]);

      setAddedComponents((curr) => ({
        in: [
          {
            id: v4(),
            component: values.componentIn,
            qty: values.qtyIn,
            location: values.locationIn,
          },
          ...curr.in,
        ],
        out: curr.out,
      }));
    } else {
      const values = await addComponentForm.validateFields([
        "componentOut",
        "qtyOut",
        "locationOut",
      ]);

      setAddedComponents((curr) => ({
        in: curr.in,
        out: {
          id: v4(),
          component: values.componentOut,
          qty: values.qtyOut,
          location: values.locationOut,
        },
      }));
    }
    formResetHandler(type);
  };
  const editComponentView = (component, type) => {
    if (type === "initial") {
      setEditingComponent({ id: component.id, type });
      addComponentForm.setFieldsValue({
        componentIn: component.component,
        qtyIn: component.qty,
        locationIn: component.location,
      });
    } else {
      setEditingComponent({ component: true, type });
      addComponentForm.setFieldsValue({
        componentOut: addedComponents.out.component,
        qtyOut: addedComponents.out.qty,
        locationOut: addedComponents.out.location,
      });
    }
  };
  const handleCancelEditing = (type) => {
    setEditingComponent(false);

    formResetHandler(type);
  };
  const saveEditing = async () => {
    if (editingComponent.type === "initial") {
      const values = await addComponentForm.validateFields([
        "componentIn",
        "qtyIn",
        "locationIn",
      ]);
      const updatedComponent = {
        id: editingComponent.id,
        component: values.componentIn,
        location: values.locationIn,
        qty: values.qtyIn,
      };

      setAddedComponents((curr) => ({
        ...curr,
        in: curr.in.map((comp) => {
          if (comp.id === editingComponent.id) {
            return updatedComponent;
          } else {
            return comp;
          }
        }),
      }));
    } else {
      const values = await addComponentForm.validateFields([
        "componentOut",
        "qtyOut",
        "locationOut",
      ]);

      setAddedComponents((curr) => ({
        ...curr,
        out: {
          id: v4(),
          component: values.componentOut,
          qty: values.qtyOut,
          location: values.locationOut,
        },
      }));
    }
    handleCancelEditing(editingComponent.type);
  };
  let comQtyVal = addComponentForm.getFieldValue("qtyIn");
  const extraButtons = (isEditing, type) => {
    if (type === isEditing.type) {
      return (
        <Space>
          <CustomButton
            variant="text"
            size="small"
            title={"cancel"}
            onclick={() => handleCancelEditing(type)}
          />
          <CustomButton
            size="small"
            title={"save"}
            onclick={() => saveEditing(type)}
          />
        </Space>
      );
    } else {
      return (
        <Space>
          <CustomButton
            variant="outlined"
            size="small"
            title={"reset"}
            onclick={() => formResetHandler(type)}
          />
          <CustomButton
            size="small"
            title={"add"}
            disabled={
              (addedComponents.out?.component && type === "final") ||
              componentStock === "0 Pcs" ||
              comQtyVal > componentStock
            }
            onclick={() => addComponent(type)}
          />
        </Space>
      );
    }
  };
  const validateHandler = async () => {
    const payload = {
      initial: {
        component_in: addedComponents.in.map((row) => row.component.value),
        qty_in: addedComponents.in.map((row) => row.qty),
        loc_in: addedComponents.in.map((row) => row.location.value),
      },
      final: {
        component_out: addedComponents.out.component.value,
        qty_out: addedComponents.out.qty,
        loc_out: addedComponents.out.location.value,
      },
    };
    Modal.confirm({
      title: "Confirm Part Code Conversion.",
      content: (
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Typography.Text strong>
              Are you sure you want to convert these part Codes
            </Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Text>
              You haved entered{" "}
              <strong>{addedComponents.in.length} Components </strong>
              to convert
            </Typography.Text>
          </Col>
          <Col span={24}>
            <Form
              form={remarksForm}
              style={{ width: "100%" }}
              layout="vertical"
              initialValues={{
                remarks: "",
              }}
            >
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea
                  rows={3}
                  // onChange={(e) => setRemarks(e.target.value)}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      ),
      okText: "Continue",
      cancelText: "Cancel",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const remarks = await remarksForm.validateFields(["remarks"]);

      const response = await imsAxios.post("/conversion/saveConversion", {
        ...payload,
        ...remarks,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setAddedComponents({
            in: [],
            qty: {},
          });
          remarksForm.resetFields();

          setRemarks("");
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const validateClear = () => {
    Modal.confirm({
      title: "Confirm Clear",
      content: "Are you sure you want to clear all the added components?",
      okText: "Continue",
      cancelText: "Cancel",
      onOk: () => clearAddedComponents(),
    });
  };
  const clearAddedComponents = () => {
    setAddedComponents({
      in: [],
      out: {},
    });
  };

  useEffect(() => {
    if (componentIn && locationIn)
      getComponentStock(componentIn.value, locationIn.value);
    else {
      setComponentStock("--");
    }
  }, [componentIn, locationIn]);

  return (
    <div
      style={{
        height: "calc(100vh - 100px)",
        padding: "0px 14px",
        margin: "10px 0px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Form
        initialValues={defaultValues}
        layout="vertical"
        form={addComponentForm}
      >
        <Row gutter={12}>
          <Col span={12}>
            <CustomFieldBox title={"Initial Component"}>
              {loading === "page" && <Loading />}
              <Row gutter={6}>
                <Col span={14}>
                  <Form.Item
                    extra={
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Existing Stock: {componentStock}
                      </Typography.Text>
                    }
                    label="Component"
                    labelCol={{
                      span: 24,
                    }}
                    rules={rules.componentIn}
                    name="componentIn"
                  >
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                      loadOptions={getComponentOption}
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label="Pick Location"
                    rules={rules.locationIn}
                    name="locationIn"
                  >
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                      loadOptions={getLocationOptions}
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="Qty" rules={rules.qtyIn} name="qtyIn">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {extraButtons(editingComponent, "initial")}
              </div>
            </CustomFieldBox>
          </Col>

          <Col span={12}>
            <CustomFieldBox title={"Final Component"}>
              <Row gutter={6}>
                <Col span={14}>
                  <Form.Item
                    label="Component"
                    rules={rules.componentOut}
                    name="componentOut"
                  >
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                      loadOptions={getComponentOption}
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label="Drop Location"
                    rules={rules.locationOut}
                    name="locationOut"
                  >
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                      loadOptions={getLocationOptions}
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="Qty" rules={rules.qtyOut} name="qtyOut">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {extraButtons(editingComponent, "final")}
              </div>
            </CustomFieldBox>
          </Col>
        </Row>
      </Form>
      <CustomFieldBox title={"Added Components"}>
        <Row style={{ height: "calc(100% - 40px)", overflow: "hidden" }}>
          <Col span={24} style={{ height: "100%" }}>
            <Row gutter={12} style={{ height: "100%", padding: "6px 0px" }}>
              <Col span={12} style={{ height: "100%" }}>
                <CustomFieldBox title={"Initial Components"}>
                  <Row gap={6} style={{ overflow: "hidden" }}>
                    <Col xl={5} xxl={3}></Col>
                    <Col xl={10} xxl={14}>
                      <Typography.Text strong>Component</Typography.Text>
                    </Col>
                    <Col span={3}>
                      <Typography.Text strong>Qty</Typography.Text>
                    </Col>
                    <Col span={4}>
                      <Typography.Text strong>Location</Typography.Text>
                    </Col>
                    {addedComponents.in.length === 0 && (
                      <Col style={{ marginTop: 20 }} span={24}>
                        <Row justify="center">
                          <Empty description="No Components added" />
                        </Row>
                      </Col>
                    )}
                    <Col
                      span={24}
                      style={{
                        height: "calc(100% - 40px)",
                        overflow: "auto",
                      }}
                    >
                      {addedComponents.in.map((component) => (
                        <Col span={24}>
                          <Row align="middle">
                            <Col xl={5} xxl={3}>
                              {!editingComponent && (
                                <Space>
                                  <Button
                                    onClick={() =>
                                      editComponentView(component, "initial")
                                    }
                                    icon={<EditFilled />}
                                  />
                                  <Button
                                    onClick={() =>
                                      deleteAddedComponent(
                                        component.id,
                                        "initial"
                                      )
                                    }
                                    icon={<DeleteFilled />}
                                  />
                                </Space>
                              )}
                            </Col>
                            <Col xl={10} xxl={14}>
                              <Typography.Text>
                                {component.component.label}
                              </Typography.Text>
                            </Col>
                            <Col span={3}>
                              <Typography.Text>{component.qty}</Typography.Text>
                            </Col>
                            <Col span={4}>
                              <Typography.Text>
                                {component.location.label}
                              </Typography.Text>
                            </Col>
                          </Row>
                        </Col>
                      ))}
                    </Col>
                  </Row>
                </CustomFieldBox>
              </Col>
              <Col span={12}>
                <CustomFieldBox title={"Final Components"}>
                  <Row align="middle">
                    <Col xl={5} xxl={3}></Col>
                    <Col xl={10} xxl={14}>
                      <Typography.Text strong>Component</Typography.Text>
                    </Col>
                    <Col span={3}>
                      <Typography.Text strong>Qty</Typography.Text>
                    </Col>
                    <Col span={4}>
                      <Typography.Text strong>Location</Typography.Text>
                    </Col>
                    {!addedComponents.out?.component && (
                      <Col style={{ marginTop: 20 }} span={24}>
                        <Row justify="center">
                          <Empty description="No Components added" />
                        </Row>
                      </Col>
                    )}
                    <Col xl={5} xxl={3}>
                      {addedComponents.out?.component && !editingComponent && (
                        <Space>
                          <Button
                            onClick={() => editComponentView(null, "final")}
                            icon={<EditFilled />}
                          />
                          <Button
                            onClick={() => deleteAddedComponent(null, "final")}
                            icon={<DeleteFilled />}
                          />
                        </Space>
                      )}
                    </Col>
                    <Col xl={10} xxl={14}>
                      <Typography.Text>
                        {addedComponents.out?.component?.label}
                      </Typography.Text>
                    </Col>
                    <Col span={3}>
                      <Typography.Text>
                        {addedComponents.out?.qty}
                      </Typography.Text>
                    </Col>
                    <Col span={4}>
                      <Typography.Text>
                        {addedComponents.out?.location?.label}
                      </Typography.Text>
                    </Col>
                  </Row>
                </CustomFieldBox>
              </Col>
            </Row>
          </Col>
        </Row>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 10,
          }}
        >
          <CustomButton
            size="small"
            variant="text"
            title="Clear"
            onclick={validateClear}
          />

          <CustomButton
            size="small"
            title="Submit"
            onclick={validateHandler}
            disabled={
              componentIn ||
              componentOut ||
              !addedComponents.in[0] ||
              !addedComponents.out?.component
            }
          />
        </div>
      </CustomFieldBox>
    </div>
  );
};

const rules = {
  componentIn: [
    {
      required: true,
      message: "Please select a component",
    },
  ],
  qtyIn: [
    {
      required: true,
      message: "Please enter a quantity",
    },
  ],
  locationIn: [
    {
      required: true,
      message: "Please select a location",
    },
  ],
  componentOut: [
    {
      required: true,
      message: "Please select a component",
    },
  ],
  qtyOut: [
    {
      required: true,
      message: "Please enter a quantity",
    },
  ],
  locationOut: [
    {
      required: true,
      message: "Please select a location",
    },
  ],
};
const defaultValues = {
  componentIn: null,
  qtyIn: "",
  locationIn: null,
  componentOut: null,
  qtyOut: "",
  locationOut: null,
};
export default PartCodeConversion;
