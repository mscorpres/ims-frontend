import {
  Col,
  Form,
  Row,
  Typography,
  Input,
  Divider,
  Card,
  Space,
  Flex,
} from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyButton from "../../../../Components/MyButton";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";

const Components = ({
  locationOptions,
  formRules,
  rows,
  setRows,
  selectedRows,
  setSelectedRows,
  autoConsOptions,
  setAutoConsumptionOption,
  setOpen,
  open,
  preview,
  setPreview,
}) => {
  const addComponent = async () => {
    const values = await form.validateFields();
    const found = selectedRows.find(
      (row) => row.component.value === values.component.value
    );
    if (found) {
      alert("same component");
      return;
    }
    // form.resetFields();
    form.setFieldValue("value", "");
    form.setFieldValue("hsn", "");
    form.setFieldValue("rate", "");
    form.setFieldValue("qty", "");
    form.setFieldValue("partCode", "");
    form.setFieldValue("component", "");
    form.setFieldValue("component", "");
    form.setFieldValue("pendingQty","");
    setSelectedRows((curr) => [values, ...curr]);
  };
  const deleteComponent = (key) => {
    setSelectedRows((curr) =>
      curr.filter((row) => row.component.value !== key)
    );
  };

  const [form] = Form.useForm();

  return (
    <Flex
      vertical
      gutter={[0, 6]}
      gap="small"
      style={{ position: "relative", height: "100%", overflow: "hidden" }}
    >
      <Card
        size="small"
        title={`Total : ${rows?.length} Components | Selected: ${selectedRows?.length} Components`}
        extra={
          <>
            <Space>
              <MyButton variant="upload" onClick={() => setOpen(true)} />
            </Space>
            <Space>
              <MyButton
                variant="add"
                // disabled={selectedRows.length === 0}
                // disabled={selectedRows.length === 0}
                onClick={addComponent}
                style={{ marginLeft: 10 }}
              />
            </Space>
          </>
        }
      >
        <Form form={form} initialValues={initialValues}>
          <SingleComponent
            rows={rows}
            form={form}
            locationOptions={locationOptions}
            autoConsOptions={autoConsOptions}
          />
        </Form>
      </Card>
      <div style={{ height: "83%" }}>
        <Card
          size="small"
          style={{ height: "100%", paddingBottom: 10 }}
          bodyStyle={{ height: "100%" }}
        >
          <div
            style={{
              height: "100%",
              overflow: "hidden",
              justifyContent: "center",
            }}
          >
            <Row
              gutter={[0, 6]}
              style={{
                height: "100%",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <Col span={24}>
                <Row>
                  <Col span={1}></Col>
                  <Col span={3}>
                    <Typography.Text strong>Component</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Part Code</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Qty</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Pending Qty</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Rate</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>HSN</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Value</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Invoice</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Location</Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text strong>Auto Consmp</Typography.Text>
                  </Col>
                  <Col span={4}>
                    <Typography.Text strong>Remark</Typography.Text>
                  </Col>
                </Row>
              </Col>
              <Col
                span={24}
                style={{
                  overflowY: "auto",
                  height: "85%",
                  bodyStyle: "100%",
                  marginBottom: "10px",
                  // backgroundColor: "red",
                }}
              >
                <Row bodyStyle="100%" style={{ justifyContent: "center" }}>
                  {selectedRows.map((row, index) => (
                    <Col span={24}>
                      <Row align="middle">
                        <Col span={1}>
                          <Flex align="center">
                            <TableActions
                              action={"delete"}
                              onClick={() =>
                                deleteComponent(row.component.value)
                              }
                            />
                            <Typography.Text type="secondary">
                              {index + 1}.
                            </Typography.Text>
                          </Flex>
                        </Col>
                        <Col span={3}>{row?.component?.label}</Col>
                        <Col span={2}>{row.partCode}</Col>

                        <Col span={2}>
                          <ToolTipEllipses text={row.qty} />
                        </Col>
                        <Col span={2}>
                          <ToolTipEllipses text={row.pendingQty??"--"} />
                        </Col>
                        <Col span={2}>
                          <ToolTipEllipses text={row.rate} />
                        </Col>
                        <Col span={2}>{row.hsn}</Col>
                        <Col span={2}>
                          <ToolTipEllipses text={row.value} />
                        </Col>
                        <Col span={2}>
                          <ToolTipEllipses text={row.invoiceId} copy={true} />
                        </Col>
                        <Col span={2}>{row.location?.label ?? "--"}</Col>
                        <Col span={2}>{row.autoCons?.label ?? "--"}</Col>
                        <Col span={4}>
                          <ToolTipEllipses text={row.remark} copy={true} />
                        </Col>
                      </Row>
                      <Divider style={{ margin: "5px 0" }} />
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </Flex>
  );
};

export default Components;

const SingleComponent = ({ form, locationOptions, rows, autoConsOptions }) => {
  const [asyncOptions, setAsyncOptions] = useState([]);

  const component = Form.useWatch("component", form);
  const getComponent = async (search) => {
    const filtered = rows.filter(
      (row) =>
        row.component.toLowerCase().includes(search.toLowerCase()) ||
        row.partCode.toLowerCase().includes(search.toLowerCase())
    );
    const arr = filtered.map((row) => ({
      text: `${row.partCode} | ${row.component}`,
      value: row.componentKey,
    }));
    setAsyncOptions(arr);
  };
  const selectingComponent = (key) => {
    const found = rows.find((row) => row.componentKey === key);
    form.setFieldsValue({
      ...found,
      component: {
        label: found.component,
        value: found.componentKey,
      },
    });
  };
  const qty = Form.useWatch("qty", form);
  const rate = Form.useWatch("rate", form);

  useEffect(() => {
    if(rows){
      const filtered = rows.filter(
        (row) =>
          row.component.toLowerCase() ||
          row.partCode.toLowerCase()
      );
      setAsyncOptions(filtered.map((row) => ({
        text: `${row.partCode} | ${row.component}`,
        value: row.componentKey,
      })))
    }
  }, [rows])

  useEffect(() => {
    const value = +Number(rate).toFixed(3) * +Number(qty);
    form.setFieldValue("value", value == "NaN" ? 0 : value.toFixed(3));
  }, [qty, rate]);
  useEffect(() => {
    if (component) {
      selectingComponent(component.value);
    }
  }, [component]);
  return (
    <Row gutter={[6, -6]} style={{ marginBottom: "18px" }}>
      <Col span={3}>
        <Form.Item label="Component" name="component">
          <MyAsyncSelect
            loadOptions={getComponent}
            optionsState={asyncOptions}
            labelInValue={true}
          />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Part Code" name="partCode">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={2}>
        <Form.Item label="Qty" name="qty">
          <Input type="number" />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Pending Qty" name="pendingQty">
          <Input type="number" disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Rate" name="rate">
          <Input type="number" />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="HSN" name="hsn">
        <Input />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Value" name="value">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Invoice" name="invoiceId">
          <Input />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Location" name="location">
          <MySelect labelInValue={true} options={locationOptions} />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Auto Consump" name="autoCons">
          <MySelect labelInValue={true} options={autoConsOptions} />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Remark" name="remark">
          <Input />
        </Form.Item>
      </Col>
    </Row>
  );
};

const initialValues = {
  component: undefined,
  partCode: undefined,
  qty: "",
  rate: "",
  value: 0,
  invoice: "",
  location: undefined,
  autoCons: { label: "NO", value: "0" },
  remarks: "",
};
