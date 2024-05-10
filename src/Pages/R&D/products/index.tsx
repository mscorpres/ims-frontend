import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "@/Components/MySelect";
import MyButton from "@/Components/MyButton";
import ToolTipEllipses from "@/Components/ToolTipEllipses.jsx";
import MyDataTable from "@/Components/MyDataTable.jsx";
import useApi from "@/hooks/useApi";
import { getUOMList } from "@/api/master/uom";
import { createProduct, getProductsList } from "@/api/r&d/products";
import { ModalType } from "@/types/general";
import { ProductType } from "@/types/r&d";
import ProductDocuments from "@/Pages/R&D/products/documents";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { UploadOutlined } from "@ant-design/icons";

export default function Products() {
  const [rows, setRows] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleFetchUomOptions = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomOptions(response.data ?? []);
  };

  const handleFetchProductList = async () => {
    const response = await executeFun(() => getProductsList(), "fetch");
    setRows(response.data ?? []);
  };

  const validateHandler = async () => {
    await form.validateFields();
    setShowConfirm(true);
  };

  const handleCreateProduct = async () => {
    const values = form.getFieldsValue();
    const response = await executeFun(() => createProduct(values), "submit");
    if (response.success) {
      setShowConfirm(false);
      resetHandler();
      handleFetchProductList();
    }
  };

  const resetHandler = () => {
    form.resetFields();
  };

  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  useEffect(() => {
    handleFetchUomOptions();
    handleFetchProductList();
  }, []);

  const actionColumns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // docs and images
        <GridActionsCellItem
          showInMenu
          placeholder="Show Docs and Images"
          // disabled={disabled}
          label={"Attachments"}
          onClick={() => {
            setShowDocs(true);
            setSelectedProduct(row);
          }}
        />,
      ],
    },
  ];

  return (
    <Row gutter={6} style={{ padding: 5, height: "95%" }} justify="center">
      <ConfirmModal
        show={showConfirm}
        hide={() => setShowConfirm(false)}
        submitHandler={handleCreateProduct}
      />
      {selectedProduct && (
        <ProductDocuments
          show={showDocs}
          hide={() => setShowDocs(false)}
          product={selectedProduct}
        />
      )}

      <Col span={4}>
        <Card size="small" title={"Add New Product"}>
          <Form initialValues={initialValues} form={form} layout="vertical">
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <Row gutter={4}>
                  <Col span={12}>
                    <Form.Item name="sku" label="Product SKU" rules={rules.sku}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="unit" label="UOM" rules={rules.uom}>
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
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="images"
                  label="Images"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  extra="Max 4 Images"
                >
                  <Upload
                    name="image"
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
              </Col>
              <Col span={24}>
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
              </Col>
              <Col span={24}>
                <Flex justify="center" gap={5}>
                  <Form.Item>
                    <MyButton onClick={resetHandler} variant="reset">
                      Reset
                    </MyButton>
                  </Form.Item>
                  <Form.Item>
                    <MyButton
                      loading={loading("submit")}
                      type="primary"
                      variant="submit"
                      onClick={validateHandler}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={10}>
        <MyDataTable columns={[...actionColumns, ...columns]} data={rows} />
      </Col>
    </Row>
  );
}

interface ModalProps extends ModalType {}
const ConfirmModal = (props: ModalProps) => {
  return (
    <Modal
      open={props.show}
      onCancel={props.hide}
      title="Create Product"
      okText="Continue"
      onOk={props.submitHandler}
      confirmLoading={props.loading}
    >
      Are you sure you want to create this product?
    </Modal>
  );
};

const initialValues = {
  product: undefined,
  sku: undefined,
  uom: undefined,
};

const rules = {
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
    renderCell: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.name} />
    ),
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 100,
    renderCell: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
  },
  {
    headerName: "Unit",
    field: "unit",
    width: 80,
  },
  {
    headerName: "Approval Stage",
    field: "approvalStage",
    width: 120,
  },
];
