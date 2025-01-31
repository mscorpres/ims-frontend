import { useEffect, useState } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Card, Col, Flex, Form, Input, Modal, Row, Upload } from "antd";

import MySelect from "@/Components/MySelect";
import MyButton from "@/Components/MyButton";
import ToolTipEllipses from "@/Components/ToolTipEllipses.jsx";
import MyDataTable from "@/Components/MyDataTable.jsx";

import Approval from "@/Pages/R&D/products/approval";
import ProductDocuments from "@/Pages/R&D/products/documents";

import useApi from "@/hooks/useApi";

import { getUOMList } from "@/api/master/uom";
import { createProduct, getProductsList } from "@/api/r&d/products";

import { ModalType, SelectOptionType } from "@/types/general";
import { ProductType } from "@/types/r&d";
import { getCostCentresOptions, getProjectOptions } from "@/api/general";
import { convertSelectOptions } from "@/utils/general";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";

export default function Products() {
  const [rows, setRows] = useState([]);
  const [rdsfg, setRdsfg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleFetchProductList = async () => {
    const response = await executeFun(() => getProductsList(), "fetch");
    setRdsfg(response.newSkuCode);
    setRows(response.data ?? [])
      .filter(
        (row) => row.approvalStage !== "PEN"
        // || row.approvalStage === "1"
      )
      .map((row, index) => ({
        ...row,
        id: index + 1,
      }));
  };

  const handleCostCenterOptions = async (search: string) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr: SelectOptionType[] = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const handleProjectOptions = async (search: string) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );

    setAsyncOptions(response.data ?? []);
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
    } else {
      setShowConfirm(false);
    }
  };

  const resetHandler = () => {
    form.resetFields();
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  useEffect(() => {
    handleFetchProductList();
  }, []);

  const actionColumns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          placeholder="See Attachments"
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
        loading={loading("submit")}
      />
      {selectedProduct && selectedProduct?.key && (
        <ProductDocuments
          show={showDocs}
          hide={() => setShowDocs(false)}
          product={selectedProduct}
        />
      )}

      <Col span={6} xxl={4}>
        <Card size="small" title={"Add New Product"}>
          <Form initialValues={initialValues} form={form} layout="vertical">
            <Row gutter={[0, 6]}>
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
                <Form.Item
                  label="Product SKU"
                >
                  <Input value={rdsfg} disabled/>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  style={{ flex: 1, minWidth: 100 }}
                  name="costCenter"
                  label="Cost Center"
                >
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    loadOptions={handleCostCenterOptions}
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                    fetchDefault={true}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  style={{ flex: 1, minWidth: 100 }}
                  name="project"
                  label="Project"
                >
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    loadOptions={handleProjectOptions}
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                    fetchDefault={true}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Remarks">
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
                      loading={loading("submit") || loading("fetch")}
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
      <Col span={20} xl={18} xxl={16}>
        <MyDataTable
          columns={[...actionColumns, ...columns]}
          data={rows}
          loading={loading("fetch") || loading("submit")}
        />
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
    headerName: "Cost Center",
    field: "costCenter",
    width: 150,
  },
  {
    headerName: "Project",
    field: "project",
    width: 150,
  },
  {
    headerName: "Approval Stage",
    field: "approvalStage",
    renderCell: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses
        text={
          row?.approvalStage == "PEN"
            ? "Pending"
            : row?.approvalStage == "APR"
            ? "Approved"
            : "Rejected"
        }
        // copy={true}
      />
    ),
    width: 120,
  },

  {
    headerName: "Created By",
    field: "createdBy",
    width: 180,
  },
  {
    headerName: "Created At",
    field: "createdDate",
    width: 120,
  },
];
