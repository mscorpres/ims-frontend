import { Card, Col, Form, Input, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "@/Components/MySelect";
import MyButton from "@/Components/MyButton";
import ToolTipEllipses from "@/Components/ToolTipEllipses.jsx";
import MyDataTable from "@/Components/MyDataTable.jsx";
import useApi from "@/hooks/useApi";
import { getUOMList } from "@/api/master/uom";

const categoryOptions = [
  { text: "Goods", value: "goods" },
  { text: "Services", value: "services" },
];

export default function Products() {
  const [rows, setRows] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleFetchUomOptions = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomOptions(response.data ?? []);
  };

  useEffect(() => {
    handleFetchUomOptions();
  }, []);

  return (
    <Row gutter={6} style={{ padding: 5, height: "95%" }} justify="center">
      <Col span={4}>
        <Card size="small" title={"Add New Product"}>
          <Form initialValues={initialValues} form={form} layout="vertical">
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <Form.Item
                  name="category"
                  label="Product Type"
                  rules={rules.category}
                >
                  <MySelect options={categoryOptions} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={4}>
                  <Col span={12}>
                    <Form.Item name="sku" label="Product SKU" rules={rules.sku}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="uom" label="UOM" rules={rules.uom}>
                      <MySelect options={uomOptions} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={rules.product}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row justify="end">
                  <Space>
                    <Form.Item>
                      <MyButton
                        // onClick={resetHandler}
                        variant="reset"
                      >
                        Reset
                      </MyButton>
                    </Form.Item>
                    <Form.Item>
                      <MyButton
                        // loading={loading("submit")}
                        type="primary"
                        variant="submit"
                        // onClick={submitHandler}
                      />
                    </Form.Item>
                  </Space>
                </Row>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={10}>
        <MyDataTable columns={columns} data={rows} />
      </Col>
    </Row>
  );
}

const initialValues = {
  category: "goods",
  product: undefined,
  sku: undefined,
  uom: undefined,
};

const rules = {
  category: [
    {
      required: true,
      message: "Category is required",
    },
  ],
  sku: [
    {
      required: true,
      message: "SKU is required",
    },
  ],
  uom: [
    {
      required: true,
      message: "UOM is required",
    },
  ],
  product: [
    {
      required: true,
      message: "Product name is required",
    },
  ],
};

const columns = [
  { headerName: "#", field: "id", width: 30 },
  {
    headerName: "Product Name",
    field: "name",
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Unit",
    field: "uom",
    width: 80,
  },
  {
    headerName: "Category",
    field: "category",
    width: 100,
    renderCell: ({ row }) => (
      <>
        {row?.category == ""
          ? "--"
          : row?.category == "services"
          ? "Services"
          : "Goods"}
      </>
    ),
  },
];
