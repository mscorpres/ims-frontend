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
    form.resetFields(["component", "partCode", "qty", "rate", "hsn", "value"]);
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
      style={{ height: "100%", overflow: "hidden" }}
    >
      <div>
        <Card
          size="small"
          title={`Total : ${rows?.length} Components | Selected: ${selectedRows?.length} Components`}
          extra={
            <Space>
              <MyButton variant="add" onClick={addComponent} />
            </Space>
          }
        >
          {/* <Form form={form} initialValues={initialValues}> */}
          <SingleComponent
            rows={rows}
            form={form}
            locationOptions={locationOptions}
            autoConsOptions={autoConsOptions}
          />
          {/* </Form> */}
        </Card>
      </div>
      <Flex style={{ flex: 1 }}>
        <Card
          size="small"
          style={{ flex: 1 }}
          bodyStyle={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
            <Row gutter={[0, 6]} style={{ height: "100%", overflow: "hidden" }}>
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
              <Col span={24} style={{ overflowY: "auto", height: "95%" }}>
                <Row>
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
                        <Col span={3}>{row.component.label}</Col>
                        <Col span={2}>{row.partCode}</Col>

                        <Col span={2}>
                          <ToolTipEllipses text={row.qty} />
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
      </Flex>
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
    console.log(found);
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
    const value = +Number(rate).toFixed(3) * +Number(qty);
    form.setFieldValue("value", value == "NaN" ? 0 : value.toFixed(3));
  }, [qty, rate]);
  useEffect(() => {
    if (component) {
      selectingComponent(component.value);
    }
  }, [component]);
  return (
    <Form
      style={{ marginBottom: 20 }}
      form={form}
      initialValues={initialValues}
    >
      <Flex
        justify="center"
        style={{ flexWrap: "wrap", rowGap: 40, columnGap: 10 }}
      >
        <div style={{ width: 250 }}>
          <Form.Item rules={rules.component} label="Component" name="component">
            <MyAsyncSelect
              loadOptions={getComponent}
              optionsState={asyncOptions}
              labelInValue={true}
            />
          </Form.Item>
        </div>
        <div style={{ width: 150 }}>
          <Form.Item rules={rules.component} label="Part Code" name="partCode">
            <Input disabled />
          </Form.Item>
        </div>

        <div style={{ width: 120 }}>
          <Form.Item rules={rules.qty} label="Qty" name="qty">
            <Input />
          </Form.Item>
        </div>
        <div style={{ width: 120 }}>
          <Form.Item rules={rules.rate} label="Rate" name="rate">
            <Input />
          </Form.Item>
        </div>
        <div style={{ width: 200 }}>
          <Form.Item rules={rules.hsn} label="HSN" name="hsn">
            <Input />
          </Form.Item>
        </div>
        <div style={{ width: 150 }}>
          <Form.Item rules={rules.value} label="Value" name="value">
            <Input disabled />
          </Form.Item>
        </div>
        <div style={{ width: 200 }}>
          <Form.Item rules={rules.invoice} label="Invoice" name="invoiceId">
            <Input />
          </Form.Item>
        </div>
        <div style={{ width: 150 }}>
          <Form.Item rules={rules.location} label="Location" name="location">
            <MySelect labelInValue={true} options={locationOptions} />
          </Form.Item>
        </div>
        <div style={{ width: 150 }}>
          <Form.Item
            rules={rules.autoConsump}
            label="Auto Consump"
            name="autoCons"
          >
            <MySelect labelInValue={true} options={autoConsOptions} />
          </Form.Item>
        </div>
        <div style={{ width: 250 }}>
          <Form.Item label="Remark" name="remark">
            <Input />
          </Form.Item>
        </div>
      </Flex>
    </Form>
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
  autoCons: { label: "NO", value: 0 },
  remarks: "",
};
const rules = {
  component: [
    {
      required: true,
      message: "Select a component",
    },
  ],
  partCode: [
    {
      required: true,
      message: "Select a part code",
    },
  ],
  qty: [
    {
      required: true,
      message: "Enter Qty",
    },
  ],
  rate: [
    {
      required: true,
      message: "Enter Rate",
    },
  ],
  hsn: [
    {
      required: true,
      message: "Enter HSN Code",
    },
  ],
  value: [
    {
      required: true,
      message: "Enter Value",
    },
  ],
  invoice: [
    {
      required: true,
      message: "Enter Invoice Number",
    },
  ],
  location: [
    {
      required: true,
      message: "Select a location",
    },
  ],
  autoConsump: [
    {
      required: true,
      message: "Select a auto consum location",
    },
  ],
  remarks: [
    {
      required: true,
      message: "Enter remarks",
    },
  ],
};
