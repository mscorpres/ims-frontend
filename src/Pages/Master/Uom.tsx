import React, { useEffect, useState } from "react";
import { Card, Col, Form, Input, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import MyButton from "../../Components/MyButton";
import useApi from "../../hooks/useApi.ts";
import { createUOM, getUOMList } from "../../api/master/uom";
import { ResponseType } from "../../types/general.ts";

const Uom = () => {
  const [uomData, setUomData] = useState([]);
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  //   fetch uom
  const handleFetchUOMList = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomData(response.data ?? []);
  };

  //   add UOM
  const submitHandler = async () => {
    const values = await form.validateFields();
    const response: ResponseType = await executeFun(
      () => createUOM(values),
      "submit"
    );
    if (response.success) {
      form.resetFields();
      handleFetchUOMList();
    }
  };

  const resetHandler = () => {
    form.resetFields();
  };

  const columns = [
    { field: "id", headerName: "#", width: 30 },
    { field: "name", headerName: "Unit", minWidth: 170, flex: 1 },
    { field: "details", headerName: "Specification", minWidth: 170, flex: 1 },
  ];

  useEffect(() => {
    handleFetchUOMList();
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <Row gutter={6} style={{ padding: 10 }} justify="center">
        <Col md={8} xl={6} xxl={4}>
          <Card size="small" title="Create UOM">
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Unit">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Specification">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Row justify="center">
                <Space>
                  <MyButton onClick={resetHandler} variant="reset" />
                  <MyButton
                    loading={loading("submit")}
                    onClick={submitHandler}
                    variant="submit"
                  />
                </Space>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col md={12} xl={10} xxl={8}>
          <div className="m-2" style={{ height: "100%" }}>
            <div style={{ height: "80vh" }}>
              <MyDataTable
                loading={loading("fetch")}
                data={uomData}
                columns={columns}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Uom;
