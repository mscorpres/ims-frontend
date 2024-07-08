import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Tabs,
  Typography,
  Upload,
} from "antd";
import { toast } from "react-toastify";
import MyButton from "@/Components/MyButton";

import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import TableActions from "@/Components/TableActions.jsx/TableActions";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import useApi from "@/hooks/useApi";
import { ModalType, ResponseType, SelectOptionType } from "@/types/general";
import { convertSelectOptions, downloadFromLink } from "@/utils/general";
import { getComponentOptions, getVendorOptions } from "@/api/general";
import { getProductOptions } from "@/api/r&d/products";
import {
  createBOM,
  downloadSampleComponentFile,
  getComponentsFromFile,
  getExistingBom,
} from "@/api/r&d/bom";
import { useSearchParams } from "react-router-dom";
import Loading from "@/Components/Loading.jsx";
import { downloadCSV } from "@/Components/exportToCSV.jsx";
import SettingsDropdown from "@/Pages/R&D/bom/create/SettingsDropdown";
import ApproverMetrics from "@/Pages/R&D/bom/create/ApproverMetrics";
import { bomUpdateType, MultiStageApproverType } from "@/types/r&d";
import UpdateTypeModal from "@/Pages/R&D/bom/create/UpdateTypeModal";
import AddComponent from "@/Pages/R&D/bom/create/AddComponent";
import { imsAxios } from "@/axiosInterceptor";

interface ComponentType {
  component: {
    label: string;
    value: string;
  };
  text: string;
  value: string;
  qty: string;
  remarks: string;
  type: "main" | "substitute";
  mfgCode: null | string;
  smtType: string;
  substituteOf: {
    label: string;
    value: string;
  };
}

const BOMCreate = () => {
  const [mainComponents, setMainComponents] = useState<ComponentType[]>([]);
  const [subComponents, setSubComponents] = useState<ComponentType[]>([]);
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const [isEditing, setIsEditing] = useState<string | number | boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [showApproversMetrics, setShowApproverMetrics] = useState(false);
  const [isBomUpdating, setIsBomUpdating] = useState(false);
  const [updateType, setUpdateType] = useState<bomUpdateType | null>(null);
  const [showUpdateTypeModal, setShowUpdateTypeModal] = useState(false);
  const [approvers, setApprovers] =
    useState<MultiStageApproverType[]>(initialApprovers);

  const [queryParams] = useSearchParams();

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const selectedProduct = Form.useWatch("product", form);
  const selectedSubstituteOf = Form.useWatch("substituteOf", form);

  const handleFetchComponentOptions = async (search: string) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setAsyncOptions(convertSelectOptions(response.data ?? []));
  };

  const handleFetchComponentsFromFile = async () => {
    if (selectedFile) {
      const response = await executeFun(
        () => getComponentsFromFile(selectedFile),
        "upload"
      );
      if (!response.success) {
        return;
      }
      setSelectedFile(null);

      const updatedArr = response.data.map((row) => ({
        component: { ...row.partCode, label: row.partCode.text },
        qty: row.quantity,
        type: row.type === "main" ? "main" : "substitute",
        locations: row.location,
        vendor: {
          ...row.make,
          label: row.make.text,
        },
        remarks: row.remarks,
        value: row.partCode.value,
        text: row.partCode.text,
        substituteOf: row.alternateOfPartCode
          ? {
              ...row.alternateOfPartCode,
              label: row.alternateOfPartCode.text,
            }
          : null,
      }));
      const mainComponents = updatedArr.filter((row) => row.type === "main");
      const alternateComponents = updatedArr.filter(
        (row) => row.type === "substitute"
      );

      setMainComponents(mainComponents);
      setSubComponents(alternateComponents);
    }
  };
  const handleAddComponents = async () => {
    const values = await form.validateFields([
      "component",
      "qty",
      "type",
      "substituteOf",
      "locations",
      "type",
      "vendor",
      "remarks",
    ]);

    const newComponent = {
      ...values,

      value: values.component.value,
      text: values.component.label,
    };

    let verifyArr = [...mainComponents, ...subComponents];
    const found = verifyArr.find((row) => row.value === values.component.value);
    if (verifyArr.find((row) => row.value === values.component.value)) {
      return toast.error(
        `Component already added in ${found?.type} components with Qty: ${found?.qty}`
      );
    }

    if (values.type === "main") {
      setMainComponents((curr) => [...curr, newComponent]);
    } else {
      setSubComponents((curr) => [...curr, newComponent]);
    }

    form.resetFields([
      "component",
      "type",
      "qty",
      "remarks",
      "substituteOf",
      "vendor",
      "locations",
    ]);
  };

  const handleUpdateCompnent = async () => {
    const values = await form.validateFields([
      "component",
      "qty",
      "type",
      "substituteOf",
      "locations",
      "type",
      "vendor",
      "remarks",
    ]);

    const newComponent = {
      ...values,

      value: values.component.value,
      text: values.component.label,
    };

    if (values.type === "main") {
      setMainComponents((curr) => {
        let arr = curr;
        arr = arr.map((row, index) => {
          if (index === isEditing) {
            return newComponent;
          } else return row;
        });

        return arr;
      });
    } else {
      setSubComponents((curr) => {
        let arr = curr;
        arr = arr.map((row, index) => {
          if (index === isEditing) {
            return newComponent;
          } else return row;
        });

        return arr;
      });
    }
    handleCancelEditing();
  };

  const handleDeleteComponent = (
    componentkey: string,
    type: ComponentType["type"]
  ) => {
    if (type === "main") {
      setMainComponents((curr) =>
        curr.filter((row) => row.value !== componentkey)
      );
    } else {
      setSubComponents((curr) =>
        curr.filter((row) => row.value !== componentkey)
      );
    }
  };

  const handleFetchProductOptions = async (search: string) => {
    const response = await executeFun(
      () => getProductOptions(search),
      "select"
    );
    setAsyncOptions(response.data ?? []);
  };

  const validateHandler = async (action: "final" | "draft") => {
    const values = await form.validateFields(["name", "version", "product"]);

    let combined = [...mainComponents, ...subComponents];
    const response = await executeFun(
      () => createBOM({ ...values, components: combined }, approvers, action),
      action
    );

    if (response.success) {
      resetHandler();
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFetchExistingBom = async (sku: string) => {
    const response = await executeFun(
      () => getExistingBom(sku.value ?? sku),
      "fetch"
    );

    if (response.success) {
      setShowUpdateTypeModal(true);
      // return;
      if (Array.isArray(response.data)) {
        form.setFieldsValue({
          product: sku,
          name: sku.label ?? sku + "V-00.00",
          description: undefined,
          document: [],
          version: "00.00",
        });
        setMainComponents([]);
        setSubComponents([]);

        return;
      } else if (response.data && response.data.length === undefined) {
        form.setFieldsValue(response.data);
        form.setFieldValue("name", sku.label ?? sku + "V-00.00");
        setVersion(response.data.version);
        setMainComponents(
          response.data.components.filter((row) => row.type === "main")
        );
        setSubComponents(
          response.data.components.filter((row) => row.type === "substitute")
        );
      }
    }
  };

  const toggleVendorType = () => {
    setVendorType((curr) => !curr);
    form.setFieldValue("vendor", undefined);
  };

  const resetHandler = () => {
    form.resetFields();
    setMainComponents([]);
    setSubComponents([]);
  };

  const handleSetComponentForEditing = (component: ComponentType) => {
    form.setFieldsValue(component);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    form.resetFields();
  };

  // downloadSampleComponentFile
  const handleDownloadComponentSampleFile = () => {
    executeFun(() => downloadSampleComponentFile(), "sample");
  };

  useEffect(() => {
    if (queryParams.get("sku")) {
      handleFetchExistingBom(queryParams.get("sku"));
    }
  }, [queryParams]);
  useEffect(() => {
    if (selectedProduct !== undefined) {
      if (selectedProduct && selectedProduct?.value) {
        handleFetchExistingBom(selectedProduct);
        form.setFieldValue("name", selectedProduct?.label + "V-00.00");
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedSubstituteOf) {
      const found = mainComponents.find(
        (row) => row.component.value === selectedSubstituteOf.value
      );
      if (found) {
        form.setFieldValue("locations", found.locations);
      }
    }
  }, [selectedSubstituteOf]);
  useEffect(() => {
    if (!showUpdateTypeModal && !isBomUpdating) {
      resetHandler();
    }
  }, [showUpdateTypeModal]);
  return (
    <Form
      style={{ padding: 10, height: "95%" }}
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <UpdateTypeModal
        setIsBomUpdating={setIsBomUpdating}
        hide={() => setShowUpdateTypeModal(false)}
        setUpdateType={setUpdateType}
        show={showUpdateTypeModal}
      />
      {loading("fetch") && <Loading />}
      <Row gutter={6} justify="center" style={{ height: "100%" }}>
        <Col span={5} style={{ height: "100%", overflow: "auto" }}>
          <Flex vertical gap={5}>
            <Card
              size="small"
              title="Header Details"
              extra={
                <SettingsDropdown
                  setShowApproverMetrics={setShowApproverMetrics}
                />
              }
            >
              <Form.Item name="product" label="Product" rules={rules.product}>
                <MyAsyncSelect
                  loadOptions={handleFetchProductOptions}
                  selectLoading={loading("select")}
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  fetchDefault={true}
                  labelInValue
                />
              </Form.Item>
              <Form.Item name="name" label="BOM Name" rules={rules.name}>
                <Input />
              </Form.Item>
              <Form.Item name="version" label="Version" rules={rules.version}>
                <Input disabled />
              </Form.Item>

              <Form.Item name="description" label="Remarks">
                <Input.TextArea rows={3} />
              </Form.Item>
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
              {/* <Flex justify="center" gap={5}>
                <MyButton variant="reset" />
                <MyButton variant="submit" onClick={validateHandler} />
              </Flex> */}
            </Card>
            {/* Component add card */}
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Components",
                  children: (
                    <AddComponent
                      asyncOptions={asyncOptions}
                      form={form}
                      handleAddComponents={handleAddComponents}
                      handleCancelEditing={handleCancelEditing}
                      handleDownloadComponentSampleFile={
                        handleDownloadComponentSampleFile
                      }
                      handleFetchComponentOptions={handleFetchComponentOptions}
                      handleFetchComponentsFromFile={
                        handleFetchComponentsFromFile
                      }
                      handleUpdateCompnent={handleUpdateCompnent}
                      isBomUpdating={isBomUpdating}
                      isEditing={isEditing}
                      loading={loading}
                      mainComponents={mainComponents}
                      rules={rules}
                      selectedFile={selectedFile}
                      setAsyncOptions={setAsyncOptions}
                      setSelectedFile={setSelectedFile}
                      subComponents={subComponents}
                      validateHandler={validateHandler}
                    />
                  ),
                },
                {
                  key: "2",
                  label: "Approval Metrics",
                  children: (
                    <ApproverMetrics
                      approvers={approvers}
                      setApprovers={setApprovers}
                      show={showApproversMetrics}
                      hide={() => setShowApproverMetrics(false)}
                    />
                  ),
                },
              ]}
            />
          </Flex>
        </Col>
        <Col span={19} style={{ height: "100%", overflow: "hidden" }}>
          <Row gutter={[6, 6]} style={{ height: "100%" }}>
            <Col span={24} style={{ height: "50%", overflow: "hidden" }}>
              <Card
                size="small"
                title="Main Components"
                style={{
                  height: "100%",
                }}
                extra={`${mainComponents.length} Added`}
                bodyStyle={{
                  height: "95%",
                }}
              >
                <div
                  style={{
                    height: "100%",
                  }}
                >
                  <Components
                    rows={mainComponents}
                    type="main"
                    handleDeleteComponent={handleDeleteComponent}
                    handleSetComponentForEditing={handleSetComponentForEditing}
                    setIsEditing={setIsEditing}
                  />
                </div>
              </Card>
            </Col>
            <Col span={24} style={{ height: "100%", overflow: "hidden" }}>
              <Card
                size="small"
                title="Substitute Components"
                extra={`${subComponents.length} Added`}
                style={{
                  height: "50%",
                }}
                bodyStyle={{
                  height: "95%",
                }}
              >
                <div
                  style={{
                    height: "100%",
                  }}
                >
                  <Components
                    rows={subComponents}
                    type="substitute"
                    handleDeleteComponent={handleDeleteComponent}
                    handleSetComponentForEditing={handleSetComponentForEditing}
                    setIsEditing={setIsEditing}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      ;
    </Form>
  );
};

export default BOMCreate;

const Components = ({
  rows,
  type,
  handleDeleteComponent,
  setIsEditing,
  handleSetComponentForEditing,
}: {
  rows: ComponentType[];
  type?: "main" | "substitute";
  handleDeleteComponent: (
    componentKey: string,
    type: ComponentType["type"]
  ) => void;
  setIsEditing: React.Dispatch<React.SetStateAction<string | number | boolean>>;
  handleSetComponentForEditing: (component: ComponentType) => void;
}) => {
  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      {rows.length === 0 && <Empty />}
      {rows.length > 0 && (
        <Row gutter={[6, 6]} style={{ height: "100%" }}>
          {/* headers */}
          <Col span={1}>
            <Typography.Text strong>#</Typography.Text>
          </Col>
          <Col span={8}>
            <Typography.Text strong>Component</Typography.Text>
          </Col>
          <Col span={2}>
            <Typography.Text strong>Qty</Typography.Text>
          </Col>
          <Col span={3}>
            <Typography.Text strong>Vendor</Typography.Text>
          </Col>
          <Col span={3}>
            <Typography.Text strong>Placement</Typography.Text>
          </Col>
          {type === "substitute" && (
            <Col span={4}>
              <Typography.Text strong>Alternate Of</Typography.Text>
            </Col>
          )}
          <Col span={type === "substitute" ? 3 : 7}>
            <Typography.Text strong>Remarks</Typography.Text>
          </Col>

          {/* rows */}
          <Col
            span={24}
            style={{ height: "100%", overflow: "auto", paddingBottom: 30 }}
          >
            <Row gutter={[0, 4]}>
              {rows.map((row, index: number) => (
                <>
                  <Col span={1}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {index + 1}
                    </Typography.Text>
                  </Col>
                  <Col span={8}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.component.label ?? row.component.text}
                    </Typography.Text>
                  </Col>
                  <Col span={2}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.qty}
                    </Typography.Text>
                  </Col>
                  <Col span={3}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.vendor?.label ?? row.vendor}
                    </Typography.Text>
                  </Col>
                  <Col span={3}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.locations}
                    </Typography.Text>
                  </Col>
                  {type === "substitute" && (
                    <Col span={4}>
                      <Typography.Text style={{ fontSize: 13 }}>
                        {row.substituteOf?.label}
                      </Typography.Text>
                    </Col>
                  )}
                  <Col span={type === "substitute" ? 2 : 6}>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {row.remarks}
                    </Typography.Text>
                  </Col>
                  <Col span={1}>
                    <Flex gap={2}>
                      <TableActions
                        action="edit"
                        onClick={() => {
                          handleSetComponentForEditing(row);
                          setIsEditing(index);
                        }}
                      />
                      <CommonIcons
                        action="deleteButton"
                        onClick={() =>
                          handleDeleteComponent(row.value, row.type)
                        }
                      />
                    </Flex>
                  </Col>
                </>
              ))}
            </Row>
            <Flex justify="center">
              <Typography.Text strong type="secondary">
                --End of the list--
              </Typography.Text>
            </Flex>
          </Col>
        </Row>
      )}
    </div>
  );
};
const initialValues = {
  component: undefined,
  qty: undefined,
  type: "main",
  remarks: undefined,
  substituteOf: undefined,
  vendor: undefined,
  locations: undefined,
};

const Empty = () => {
  return (
    <Flex justify="center" align="center" style={{ height: "100%" }}>
      <Typography.Text strong type="secondary">
        No Components Added!!!
      </Typography.Text>
    </Flex>
  );
};

interface LocationProps extends ModalType {}
const LocationModal = (props: LocationProps) => {
  const [searchInput, setSearchInput] = useState("");
  const { executeFun, loading } = useApi();
  return (
    <Modal open={props.show} onCancel={props.hide} title="Locations">
      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </Modal>
  );
};

const rules = {
  name: [
    {
      required: true,
      message: "BOM Name is required",
    },
  ],
  version: [
    {
      required: true,
      message: "BOM Version is required",
    },
  ],
  product: [
    {
      required: true,
      message: "Product is required",
    },
  ],
  component: [
    {
      required: true,
      message: "Component is required",
    },
  ],
  qty: [
    {
      required: true,
      message: "Qty is required",
    },
  ],
  type: [
    {
      required: true,
      message: "Type is required",
    },
  ],
  locations: [
    {
      required: true,
      message: "PCB Locations is required",
    },
  ],
};

// const handleDownloadComponentSampleFile = async () => {

//   // const columns = [
//   //   {
//   //     headerName: "S.No",
//   //     field: "S.No",
//   //   },
//   //   {
//   //     headerName: "Part No",
//   //     field: "Part No",
//   //   },
//   //   // {
//   //   //   headerName: "Description in IMS",
//   //   //   field:"Description in IMS"
//   //   // },
//   //   {
//   //     headerName: "Type",
//   //     field: "Type",
//   //   },
//   //   {
//   //     headerName: "Location",
//   //     field: "Location",
//   //   },
//   //   {
//   //     headerName: "Scale",
//   //     field: "Scale",
//   //   },
//   //   {
//   //     headerName: "Make",
//   //     field: "Make",
//   //   },
//   //   {
//   //     headerName: "Alternate of Part No",
//   //     field: "Alternate of Part No",
//   //   },
//   //   {
//   //     headerName: "Remark",
//   //     field: "Remark",
//   //   },
//   // ];
//   // const rows = [];

//   // downloadCSV(rows, columns, "Sample BOM File");
// };

// {
//   "partCode": {
//       "text": "CH9102F- QFN-24-EP(4x4) USB Converters ROHS - P4576",
//       "value": "202454111729182"
//   },
//   "type": "main",
//   "alternateOfPartCode": null,
//   "make": {
//       "text": "SHRI SAI SHAKTI PRINTERS - VEN0004",
//       "value": "VEN0004"
//   },
//   "quantity": 1,
//   "location": "c1,c2",
//   "remarks": "test"
// }

// {
//   "component": {
//       "label": "(\tElectric Weighing Machine Capacity 5kg) P2678",
//       "value": "1673438387251",
//       "key": "1673438387251"
//   },
//   "qty": 10,
//   "type": "main",
//   "locations": "c1",
//   "vendor": {
//       "label": "(VEN0116) NAVS INTERNATIONAL",
//       "value": "VEN0116",
//       "key": "VEN0116"
//   },
//   "remarks": "remars",
//   "value": "1673438387251",
//   "text": "(\tElectric Weighing Machine Capacity 5kg) P2678"
// }

const initialApprovers = [
  {
    stage: 1,
    approvers: [
      {
        line: 1,
        user: undefined,
      },

      {
        line: 2,
        user: undefined,
        fixed: true,
      },
    ],
  },
  {
    stage: 2,
    approvers: [
      {
        line: 1,
        user: undefined,
      },

      {
        line: 2,
        user: undefined,
        fixed: true,
      },
    ],
  },
  {
    stage: 3,
    approvers: [
      {
        line: 1,
        user: undefined,
      },

      {
        line: 2,
        user: undefined,
        fixed: true,
      },
    ],
  },
];
