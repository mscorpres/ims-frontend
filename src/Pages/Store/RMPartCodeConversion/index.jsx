import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import MyButton from "../../../Components/MyButton";
import Loading from "../../../Components/Loading";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
const RMPartCodeConversion = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  /** Each pair: one Initial (in) then one Final (out) at same location; next Initial only after Final is added. */
  const [pairs, setPairs] = useState([]);
  const [remarks, setRemarks] = useState();
  const [editingComponent, setEditingComponent] = useState(false);
  const [componentStock, setComponentStock] = useState("--");

  const [addComponentForm] = Form.useForm();
  const [remarksForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();

  const componentIn = Form.useWatch("componentIn", addComponentForm);
  const componentOut = Form.useWatch("componentOut", addComponentForm);
  const locationIn = Form.useWatch("locationIn", addComponentForm);

  // RM: pick and drop location must be the same — drop mirrors pick
  useEffect(() => {
    if (locationIn) {
      addComponentForm.setFieldValue("locationOut", locationIn);
    }
  }, [locationIn]);

  const getComponentOption = async (search) => {
    try {
      const payload = {
        search,
      };
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
      setLoading("select");
      const response = await imsAxios.get(
        "/conversion/rm/location",
      );
      
      if (response.success) {
        let arr = [];
        arr = response.data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
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
  const deletePair = (pairId) => {
    setPairs((curr) => curr.filter((p) => p.id !== pairId));
  };

  const clearFinalForPair = (pairId) => {
    setPairs((curr) =>
      curr.map((p) =>
        p.id === pairId ? { ...p, out: null } : p,
      ),
    );
  };
  const formResetHandler = (type) => {
    if (type === "initial") {
      addComponentForm.resetFields(["componentIn", "qtyIn", "locationIn"]);
    } else {
      addComponentForm.resetFields(["componentOut", "qtyOut", "locationOut"]);
    }
  };
  const canAddInitial = () => {
    if (pairs.length === 0) return true;
    const last = pairs[pairs.length - 1];
    return last.out != null;
  };

  const canAddFinal = () => {
    if (pairs.length === 0) return false;
    return pairs[pairs.length - 1].out == null;
  };

  const addComponent = async (type) => {
    if (type === "initial") {
      if (!canAddInitial()) {
        toast.error(
          "Add the Final component for the current pair (same location) before adding another Initial.",
        );
        return;
      }
      const values = await addComponentForm.validateFields([
        "componentIn",
        "qtyIn",
        "locationIn",
      ]);

      const pairId = v4();
      const inId = v4();
      setPairs((curr) => [
        ...curr,
        {
          id: pairId,
          in: {
            id: inId,
            component: values.componentIn,
            qty: values.qtyIn,
            location: values.locationIn,
          },
          out: null,
        },
      ]);
    } else {
      if (!canAddFinal()) {
        toast.error("Add an Initial component first, or this pair already has a Final.");
        return;
      }
      const values = await addComponentForm.validateFields([
        "componentOut",
        "qtyOut",
        "locationOut",
      ]);

      setPairs((curr) => {
        const next = [...curr];
        const idx = next.length - 1;
        next[idx] = {
          ...next[idx],
          out: {
            id: v4(),
            component: values.componentOut,
            qty: values.qtyOut,
            location: values.locationOut,
          },
        };
        return next;
      });
    }
    formResetHandler(type);
  };
  const editComponentView = (pair, type) => {
    if (type === "initial") {
      setEditingComponent({ pairId: pair.id, type: "initial" });
      addComponentForm.setFieldsValue({
        componentIn: pair.in.component,
        qtyIn: pair.in.qty,
        locationIn: pair.in.location,
      });
    } else {
      setEditingComponent({ pairId: pair.id, type: "final" });
      addComponentForm.setFieldsValue({
        componentOut: pair.out.component,
        qtyOut: pair.out.qty,
        locationOut: pair.out.location,
      });
    }
  };
  const handleCancelEditing = (type) => {
    setEditingComponent(false);

    formResetHandler(type);
  };
  const saveEditing = async () => {
    if (!editingComponent?.pairId) return;
    const { pairId, type } = editingComponent;
    if (type === "initial") {
      const values = await addComponentForm.validateFields([
        "componentIn",
        "qtyIn",
        "locationIn",
      ]);
      setPairs((curr) =>
        curr.map((p) =>
          p.id === pairId
            ? {
                ...p,
                in: {
                  ...p.in,
                  component: values.componentIn,
                  location: values.locationIn,
                  qty: values.qtyIn,
                },
              }
            : p,
        ),
      );
    } else {
      const values = await addComponentForm.validateFields([
        "componentOut",
        "qtyOut",
        "locationOut",
      ]);
      setPairs((curr) =>
        curr.map((p) =>
          p.id === pairId && p.out
            ? {
                ...p,
                out: {
                  ...p.out,
                  component: values.componentOut,
                  qty: values.qtyOut,
                  location: values.locationOut,
                },
              }
            : p,
        ),
      );
    }
    handleCancelEditing(type);
  };
  let comQtyVal = addComponentForm.getFieldValue("qtyIn");
  const extraButtons = (isEditing, type) => {
    if (isEditing && type === isEditing?.type) {
      return (
        <Space>
          <Button onClick={() => handleCancelEditing(type)}>Cancel</Button>
          <Button onClick={() => saveEditing()} type="primary">
            Save
          </Button>
        </Space>
      );
    } else {
      return (
        <Space>
          <MyButton variant="reset" onClick={() => formResetHandler(type)} />
          <MyButton
            disabled={
              (type === "initial" &&
                (!canAddInitial() ||
                  componentStock === "0 Pcs" ||
                  comQtyVal > componentStock)) ||
              (type === "final" && !canAddFinal())
            }
            variant="add"
            onClick={() => addComponent(type)}
          />
        </Space>
      );
    }
  };
  const validateHandler = async () => {
    const payload = {
      initial: {
        component_in: pairs.map((p) => p.in.component.value),
        qty_in: pairs.map((p) => p.in.qty),
        loc_in: pairs.map((p) => p.in.location.value),
      },
      final: {
        component_out: pairs.map((p) => p.out.component.value),
        qty_out: pairs.map((p) => p.out.qty),
        loc_out: pairs.map((p) => p.out.location.value),
      },
    };
    Modal.confirm({
      title: "Confirm RM Part Code Conversion.",
      content: (
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Typography.Text strong>
              Are you sure you want to convert these part Codes
            </Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Text>
              You have entered{" "}
              <strong>{pairs.length} conversion pair(s)</strong> (Initial + Final
              each).
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
        type: "rm",
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setPairs([]);
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
    setPairs([]);
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
        height: "90%",
        padding: 10,
        paddingRight: "10%",
        paddingLeft: "10%",
      }}
    >
      <Form
        initialValues={defaultValues}
        layout="vertical"
        form={addComponentForm}
      >
        <Row gutter={6}>
          <Col span={12}>
            <Card
              size="small"
              title="Initial Component"
              extra={extraButtons(editingComponent, "initial")}
              style={{ position: "relative" }}
            >
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
                    label="Location (Pick = Drop)"
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
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              title="Final Component"
              extra={extraButtons(editingComponent, "final")}
            >
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
                    label="Drop Location (same as Pick)"
                    name="locationOut"
                  >
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                      loadOptions={getLocationOptions}
                      optionsState={asyncOptions}
                      disabled
                      placeholder="Same as Location above"
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="Qty" rules={rules.qtyOut} name="qtyOut">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>

      <Card
        size="small"
        title="Added Components"
        extra={
          <Space>
            <MyButton variant="clear" onClick={validateClear} />
            <MyButton
              variant="submit"
              disabled={
                componentIn ||
                componentOut ||
                pairs.length === 0 ||
                pairs.some((p) => p.out == null)
              }
              onClick={validateHandler}
            />
          </Space>
        }
        style={{ height: "80%", overflow: "hidden", marginTop: 10 }}
        bodyStyle={{ height: "95%", overflow: "hidden" }}
      >
        <Row style={{ marginBottom: 8 }}>
          <Col span={24}>
            <Typography.Text type="secondary" style={{ fontSize: "0.8rem" }}>
              Note: Add one Initial (with location), then add the Final for that
              pair (Pick = Drop). Complete the Final before adding the next
              Initial — each pair can use its own location.
            </Typography.Text>
          </Col>
        </Row>
        <Row style={{ height: "98%", overflow: "hidden" }}>
          <Col span={24} style={{ height: "100%" }}>
            <Row gutter={6} style={{ height: "100%" }}>
              <Col span={12} style={{ height: "100%" }}>
                <Card
                  size="small"
                  title="Initital Components"
                  style={{ height: "100%" }}
                  bodyStyle={{
                    height: "95%",
                  }}
                >
                  <Row gap={6} style={{ height: "100%", overflow: "hidden" }}>
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
                    {pairs.length === 0 && (
                      <Col style={{ marginTop: 20 }} span={24}>
                        <Row justify="center">
                          <Empty description="No Components added" />
                        </Row>
                      </Col>
                    )}
                    <Col
                      span={24}
                      style={{
                        height: "95%",
                        overflow: "auto",
                        paddingBottom: 20,
                      }}
                    >
                      {pairs.map((pair) => (
                        <Col span={24} key={`in-${pair.id}`}>
                          <Row align="middle">
                            <Col xl={5} xxl={3}>
                              {!editingComponent && (
                                <Space>
                                  <Button
                                    onClick={() =>
                                      editComponentView(pair, "initial")
                                    }
                                    icon={<EditFilled />}
                                  />
                                  <Button
                                    onClick={() => deletePair(pair.id)}
                                    icon={<DeleteFilled />}
                                  />
                                </Space>
                              )}
                            </Col>
                            <Col xl={10} xxl={14}>
                              <Typography.Text>
                                {pair.in.component.label}
                              </Typography.Text>
                            </Col>
                            <Col span={3}>
                              <Typography.Text>{pair.in.qty}</Typography.Text>
                            </Col>
                            <Col span={4}>
                              <Typography.Text>
                                {pair.in.location.label}
                              </Typography.Text>
                            </Col>
                          </Row>
                        </Col>
                      ))}
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  title="Final Components"
                  style={{ height: "99%", overflow: "hidden" }}
                  bodyStyle={{ height: "95%", overflow: "auto" }}
                >
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
                    {pairs.length === 0 && (
                      <Col style={{ marginTop: 20 }} span={24}>
                        <Row justify="center">
                          <Empty description="No Components added" />
                        </Row>
                      </Col>
                    )}
                    {pairs.map((pair) => (
                      <Row
                        align="middle"
                        key={`out-${pair.id}`}
                        style={{ marginBottom: 8 }}
                      >
                        <Col xl={5} xxl={3}>
                          {pair.out && !editingComponent && (
                            <Space>
                              <Button
                                onClick={() =>
                                  editComponentView(pair, "final")
                                }
                                icon={<EditFilled />}
                              />
                              <Button
                                onClick={() => clearFinalForPair(pair.id)}
                                icon={<DeleteFilled />}
                              />
                            </Space>
                          )}
                        </Col>
                        <Col xl={10} xxl={14}>
                          {pair.out ? (
                            <Typography.Text>
                              {pair.out.component.label}
                            </Typography.Text>
                          ) : (
                            <Typography.Text type="secondary">
                              — Add Final above for this pair
                            </Typography.Text>
                          )}
                        </Col>
                        <Col span={3}>
                          <Typography.Text>
                            {pair.out ? pair.out.qty : "—"}
                          </Typography.Text>
                        </Col>
                        <Col span={4}>
                          <Typography.Text>
                            {pair.out ? pair.out.location.label : "—"}
                          </Typography.Text>
                        </Col>
                      </Row>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
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
export default RMPartCodeConversion;
