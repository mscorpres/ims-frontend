import { Button, Card, Col, Form, Row, Space, Typography } from "antd";
import React from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";

const HeaderDetails = ({
  loading,
  setLoading,
  asyncOptions,
  setAsyncOptions,
  handleProductOptions,
  submitHandler,
}) => {
  const process = Form.useWatch("process");
  return (
    <Card size="small">
      <Row gutter={[0, 6]}>
        <Col span={24}>
          <Form.Item name="sku" label="Select Product">
            <MyAsyncSelect
              optionsState={asyncOptions}
              onBlur={() => setAsyncOptions([])}
              loadOptions={handleProductOptions}
              selectLoading={loading === "select"}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Typography.Text strong style={{ fontSize: "0.8rem" }}>
            Select a product or SKU to continue mapping processes.
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text strong style={{ fontSize: "0.8rem" }}>
            Processes entered: {process?.length}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text strong style={{ fontSize: "0.8rem" }}>
            You can click on "Create Process" to create a new process.
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text strong style={{ fontSize: "0.8rem" }}>
            After entering all the required processes click on "Map Processes"
            to finish.
          </Typography.Text>
        </Col>

        <Col span={24}>
          <Row justify="end">
            <Space>
              <Space>
                <Button type="link">Create Process</Button>
              </Space>
            </Space>
          </Row>
        </Col>
        <Col span={24}>
          <Row justify="end">
            <Space>
              <Button>Reset</Button>
              <Button onClick={submitHandler} type="primary">
                Map Processes
              </Button>
            </Space>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default HeaderDetails;
