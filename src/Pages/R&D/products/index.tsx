import { useEffect, useState } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Card, Col, Flex, Form, Input, Modal, Row, Upload } from "antd";
//@ts-ignore
import MyButton from "@/Components/MyButton";
//@ts-ignore
import ToolTipEllipses from "@/Components/ToolTipEllipses.jsx";
//@ts-ignore
import MyDataTable from "@/Components/MyDataTable.jsx";
import ProductDocuments from "@/Pages/R&D/products/documents";
import useApi from "@/hooks/useApi";
import { createProduct, getProductsList } from "@/api/r&d/products";
import { ModalType, SelectOptionType } from "@/types/general";
import { ProductType } from "@/types/r&d";
import { getCostCentresOptions, getProjectOptions } from "@/api/general";
import { convertSelectOptions } from "@/utils/general";
//@ts-ignore
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import UpdateProduct from "@/Pages/R&D/products/UpdateProduct";
//@ts-ignore
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
//@ts-ignore
import CustomButton from "../../../new/components/reuseable/CustomButton";
//@ts-ignore
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import { Update, Visibility } from "@mui/icons-material";

export default function Products() {
  const [rows, setRows] = useState<any>([]);
  const [rdsfg, setRdsfg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
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
        (row: any) => row.approvalStage !== "PEN"
        // || row.approvalStage === "1"
      )
      .map((row: any, index: any) => ({
        ...row,
        id: index + 1,
      }));
  };

  const handleCostCenterOptions = async (search: string) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr: any = [];
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

  const normFile = (e: any) => {
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
      getActions: ({ row }: { row: any }) => [
        <GridActionsCellItem
          showInMenu
          placeholder="Update"
          label={"Update"}
          onClick={() => {
            setUpdateModal(true);
            setSelectedProduct(row);
          }}
        />,
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

  const showCofirmModal = () => {
    Modal.confirm({
      okText: "Reset",
      title: "Are you sure?",
      content:
        "Are you sure you want to reset the data, all changes will be lost",
      onOk() {
        resetHandler();
      },
    });
  };

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    renderRowActions: ({ row }: { row: any }) => (
      <div>
        <Tooltip title="Update">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              setUpdateModal(true);
              setSelectedProduct(row?.original);
            }}
          >
            <Update fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="See Attachments">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              setShowDocs(true);
              setSelectedProduct(row?.original);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    ),
    muiTableContainerProps: {
      sx: {
        height: loading("fetch") || loading("submit") ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") || loading("submit") ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });

  return (
    <Row gutter={6} style={{ margin: 12, height: "95%" }} justify="center">
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

      <UpdateProduct
        show={updateModal}
        hide={() => setUpdateModal(false)}
        product={selectedProduct}
        id={selectedProduct?.key}
        handleFetchProductList={handleFetchProductList}
      />

      <Col
        span={6}
        xxl={4}
        style={{
          height: "calc(100% - 50px)",
          overflow: "auto",
          padding: "2px 4px",
        }}
      >
        <CustomFieldBox title="Add New Product">
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
                <Form.Item label="Product SKU">
                  <Input value={rdsfg} disabled />
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
                    <CustomButton
                      size="small"
                      onclick={showCofirmModal}
                      variant="outlined"
                      title={"reset"}
                    />
                  </Form.Item>
                  <Form.Item>
                    <CustomButton
                      size="small"
                      onclick={validateHandler}
                      title={"submit"}
                      loading={loading("submit") || loading("fetch")}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>
          </Form>
        </CustomFieldBox>
      </Col>
      <Col span={20} xl={18} xxl={16}>
       
        <MaterialReactTable table={table} />
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
  { header: "#", accessorKey: "id", width: 30 },
  {
    header: "Product Name",
    accessorKey: "name",
    flex: 1,
    render: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.name} />
    ),
  },
  {
    header: "SKU",
    accessorKey: "sku",
    width: 100,
    render: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
  },
  {
    header: "Unit",
    accessorKey: "unit",
    width: 80,
  },
  {
    header: "Cost Center",
    accessorKey: "costCenter",
    width: 150,
  },
  {
    header: "Project",
    accessorKey: "project",
    width: 150,
  },
  {
    header: "Approval Stage",
    accessorKey: "approvalStage",
    render: ({ row }: { row: any }) => (
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
    header: "Created By",
    accessorKey: "createdBy",
    width: 180,
  },
  {
    header: "Created At",
    accessorKey: "createdDate",
    width: 120,
  },
];
