import { Card, Flex, Modal, Popover, Radio, Skeleton } from "antd";
import { Col, Divider, Form, Input, Row, Space, Typography } from "antd/es";
import React, { useEffect, useState } from "react";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import MySelect from "../../../../Components/MySelect";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Loading from "../../../../Components/Loading";
import useLoading from "../../../../hooks/useLoading";

const RequestApproveModal = ({ show, hide, getRows }) => {
  const [form] = Form.useForm();
  const [details, setDetails] = useState([]);
  const [headers, setHeaders] = useState(null);
  const [loading, setLoading] = useLoading();
  const [componentOptions, setComponentOptions] = useState([]);
  const [pickLocationOptions, setPickLocationOptions] = useState([]);
  const [filterString, setFilterString] = useState("");
  const [action, setAction] = useState(null);

  const availableQty = Form.useWatch("availableQty", { form, preserve: true });
  const requestedQty = Form.useWatch("requestedQty", { form, preserve: true });
  const weightedRate = Form.useWatch("weightedRate", { form, preserve: true });
  const authKey = Form.useWatch("authKey", { form, preserve: true });
  const unit = Form.useWatch("unit", { form, preserve: true });
  const reason = Form.useWatch("reason", { form, preserve: true });
  const selectedComponent = Form.useWatch("component", form);
  const pickLocation = Form.useWatch("pickLocation", form);

  const getDetails = async (requestId) => {
    try {
      setLoading("fetch", true);
      const payload = {
        transaction: requestId,
      };
      const response = await imsAxios.post(
        "/storeApproval/fetchTransactionItems",
        payload
      );

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          // console.log("data", data);
          const header = data.data.header[0];
          const materials = data.data.material;
          const compOptions = materials.map((row) => ({
            text: `${row.partno} `,
            componentName: row.component,
            // text: `${row.partno} | ${row.component}`,
            value: row.compKey,
          }));

          const detailsData = materials.map((row) => ({
            componentKey: row.compKey,
            authKey: row.authIdentity,
            requestedQty: row.requiredQty,
            unit: row.unit,
            remarks: row.remark,
            reason: row.reason,
          }));

          const headerData = {
            bomKey: header.bomKey,
            bom: header.bom,
            locationKey: header.locationKey,
            transactionKey: header.transaction,
            location: header.location,
            mfgQty: header.mfgqty,
          };
          setHeaders(headerData);
          setDetails(detailsData);
          setComponentOptions(compOptions);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading("fetch", false);
    }
  };

  const getPickLocationOptions = async () => {
    try {
      setLoading("fetchLocations", true);
      const response = await imsAxios.get(
        "/storeApproval/fetchLocationAllotedTransApprv"
      );
      // console.log("response", response);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            value: row.id,
            text: row.text,
          }));

          setPickLocationOptions(arr);
        }
      }
    } catch (error) {
    } finally {
      setLoading("fetchLocations", false);
    }
  };

  const getComponentStock = async (component, location) => {
    try {
      setLoading("fetchSTock", true);
      const payload = { component, location };
      const response = await imsAxios.post("/godown/godownStocks", payload);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const qty = data.data.available_qty;
          const rate = data?.data?.avr_rate;
          form.setFieldValue("availableQty", qty);
          form.setFieldValue("weightedRate", rate);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading("fetchSTock", false);
    }
  };

  const validateHandler = async () => {
    const values = await form.validateFields();
    let link = "";
    let payload = {};
    if (action === "approve") {
      payload = {
        location: headers.locationKey,
        authKey: authKey,
        subject: headers.bomKey,
        requestedQty: requestedQty,

        pickLocation: values.pickLocation,
        component: values.component,
        issueQty: values.issueQty,
        remark: values.remarks ?? "--",
        reason: values.reason ?? "N/A",
      };
      link = "/storeApproval/AllowComponentsApproval";
    } else if (action === "reject") {
      payload = {
        authKey: authKey,
        transaction: headers.transactionKey,
        component: values.component,
        remark: values.remarks,
        reason: values.reason ?? "N/A",
      };
      link = "/storeApproval/AllowComponentsCancellation"; 
    }

    Modal.confirm({
      title: `${action === "approve" ? "Approving" : "Rejecting"} Request`,
      content: `Are you sure you want ${
        action === "approve" ? "Approve" : "Reject"
      } this request`,
      onOk: () => submitHandler(link, payload),
      okText: "Continue",
    });
  };

  const submitHandler = async (link, payload) => {
    try {
      setLoading("submit", true);
      const response = await imsAxios.post(link, payload);

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          getRows();
          // hide();
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading("submit", false);
    }
  };
  useEffect(() => {
    if (show) {
      getDetails(show.requestId);
      getPickLocationOptions();
    } else {
      form.resetFields();
      setComponentOptions([]);
      setAction(null);
      setHeaders(null);
    }
  }, [show]);

  useEffect(() => {
    if (action === "reject") {
      form.setFieldValue("pickLocation", undefined);
      form.setFieldValue("issueQty", undefined);
    }
  }, [action]);

  useEffect(() => {
    if (selectedComponent) {
      const selected = details.filter(
        (row) => row.componentKey === selectedComponent
      );
      if (selected[0]) {
        form.setFieldValue("requestedQty", selected[0].requestedQty);
        form.setFieldValue("unit", selected[0].unit);
        form.setFieldValue("authKey", selected[0].authKey);
        form.setFieldValue("reason", selected[0].reason);
      }
    }
  }, [selectedComponent]);

  useEffect(() => {
    if (selectedComponent && pickLocation) {
      getComponentStock(selectedComponent, pickLocation);
    }
  }, [pickLocation, selectedComponent]);
  return (
    <Modal
      title="Process Request"
      open={show}
      width="70vw"
      centered={true}
      okButtonProps={{
        disabled: !action,
      }}
      okText="Submit"
      cancelText="Back"
      onOk={validateHandler}
      confirmLoading={loading("submit")}
      onCancel={hide}
    >
      <Form layout="vertical" form={form} initialValues={initialValues}>
        <Row gutter={6}>
          <Col span={4}>
            <Card
              size="small"
              title="Request Details"
              style={{ height: "100%" }}
              bodyStyle={{ height: "95%" }}
            >
              <Row gutter={[6, 6]}>
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    BOM:
                  </Typography.Text>
                  <br />
                  {loading("fetch") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetch") && (
                    <Typography.Text>{headers?.bom}</Typography.Text>
                  )}
                </Col>

                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Req. Location:
                  </Typography.Text>
                  <br />
                  {loading("fetch") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetch") && (
                    <Typography.Text>{headers?.location}</Typography.Text>
                  )}
                </Col>
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    MFG Qty:
                  </Typography.Text>
                  <br />
                  {loading("fetch") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetch") && (
                    <Typography.Text>{headers?.mfgQty}</Typography.Text>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={10}>
            <Card
              size="small"
              style={{ height: "100%" }}
              bodyStyle={{ height: "100%" }}
              title="Request Components"
            >
              <Flex
                vertical
                style={{ height: "90%" }}
                justify="space-between"
                align="space-between"
              >
                <div>
                  <Input
                    placeholder="Filter Components"
                    valye={filterString}
                    onChange={(e) => setFilterString(e.target.value)}
                  />
                </div>
                <Flex
                  vertical
                  style={{
                    flex: 1,
                    minHeight: "86%",
                    maxHeight: 400,

                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      // height: "100%",
                      overflow: "auto",
                    }}
                  >
                    <Form.Item
                      name="component"
                      label="Select Part Code"
                      rules={rules.component}
                    >
                      <Radio.Group style={{ width: "100%" }}>
                        <Row>
                          {loading("fetchLocations") && <Loading />}
                          {componentOptions
                            .filter((row) => {
                              const matched = row.text
                                .toLowerCase()
                                .includes(filterString.toLowerCase());
                              return matched;
                            })
                            .map((comp, index) => (
                              <Col span={6}>
                                <Popover content={comp.componentName}>
                                  <Radio value={comp.value}>{comp.text}</Radio>
                                </Popover>
                              </Col>
                            ))}
                        </Row>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </Flex>
              </Flex>
            </Card>
          </Col>

          <Col span={10}>
            <Card size="small" title="Component Transfer Details">
              <Row justify="center" gutter={6}>
                <Col span={24} style={{ marginBottom: 10 }}>
                  <Flex justify="end">
                    <Radio.Group
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      buttonStyle="solid"
                      disabled={!selectedComponent}
                    >
                      <Radio.Button type="danger" danger value="reject">
                        <Flex gap={5}>
                          Reject
                          <CloseOutlined />
                        </Flex>
                      </Radio.Button>
                      <Radio.Button icon={<CheckOutlined />} value="approve">
                        <Flex gap={5}>
                          Approve
                          <CheckOutlined />
                        </Flex>
                      </Radio.Button>
                    </Radio.Group>
                  </Flex>
                </Col>
                <Col span={6}>
                  <Typography.Text style={{ fontSize: 12 }} strong>
                    Available Qty
                  </Typography.Text>
                  <br />
                  {loading("fetchStock") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetchStock") && (
                    <Typography.Text style={{ fontSize: 12 }}>
                      {availableQty ?? 0}{" "}
                      {" " + unit === undefined || null ? "" : unit}
                    </Typography.Text>
                  )}
                  <Divider />
                </Col>
              

                <Col span={6}>
                  <Typography.Text style={{ fontSize: 12 }} strong>
                    Requested Qty
                  </Typography.Text>
                  <br />
                  {loading("fetchStock") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetchStock") && (
                    <Typography.Text style={{ fontSize: 12 }}>
                      {requestedQty ?? 0}{" "}
                      {" " + unit === undefined || null ? "" : unit}
                    </Typography.Text>
                  )}
                  <Divider />
                </Col>
                <Col span={6}>
                <Typography.Text style={{ fontSize: 12 }} strong>
                    Weighted Average Rate
                  </Typography.Text>
                  <br />
                  {loading("fetchStock") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetchStock") && (
                    <Typography.Text style={{ fontSize: 12 }}>
                      {weightedRate ?? 0}{" "}
                      
                    </Typography.Text>
                  )}
                  <Divider />
                </Col>
                <Col span={6}>
                  <Typography.Text style={{ fontSize: 12 }} strong>
                    Reason
                  </Typography.Text>
                  <br />
                  {loading("fetch") && (
                    <Skeleton.Button size="small" active block />
                  )}
                  {!loading("fetch") && (
                    <Typography.Text style={{ fontSize: 12 }}>
                      {reason ?? "N/A"}
                    </Typography.Text>
                  )}
                  <Divider />
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="pickLocation"
                    label="Pick Location"
                    rules={action === "approve" && rules.pickLocation}
                  >
                    <MySelect
                      disabled={action === "reject" || !action}
                      options={pickLocationOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="issueQty"
                    label="Issue Qty"
                    rules={action === "approve" && rules.issueQty}
                  >
                    <Input disabled={action === "reject" || !action} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="remarks" label="Remarks">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const initialValues = {
  component: undefined,
  pickLocation: undefined,
  issueQty: undefined,
  remarks: undefined,
  requestedQty: undefined,
  unit: undefined,
  authKey: undefined,
  reason: undefined,
};
export default RequestApproveModal;

const rules = {
  component: [
    {
      required: true,
      message: "Component is required",
    },
  ],
  pickLocation: [
    {
      required: true,
      message: "Pick Location is required",
    },
  ],
  issueQty: [
    {
      required: true,
      message: "Issue Qty is required",
    },
  ],
  remark: [
    {
      required: true,
      message: "Remark is required",
    },
  ],
};
