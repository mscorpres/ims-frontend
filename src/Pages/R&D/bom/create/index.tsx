import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import { toast } from "react-toastify";
import MyButton from "@/Components/MyButton";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import TableActions from "@/Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../../Components/MyDataTable";
import useApi from "@/hooks/useApi";
import { ModalType, SelectOptionType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";
import { getComponentMfgCodeAndType, getComponentOptions } from "@/api/general";
import { getProductOptions } from "@/api/r&d/products";
import {
  createBOM,
  createBomRND,
  createDraftBomRND,
  downloadSampleComponentFile,
  getComponentsFromFile,
  getExistingBom,
  uploadDocs,
} from "@/api/r&d/bom";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "@/Components/Loading.jsx";
import ApproverMetrics from "@/Pages/R&D/bom/create/ApproverMetrics";
import { bomUpdateType, MultiStageApproverType } from "@/types/r&d";
import UpdateTypeModal from "@/Pages/R&D/bom/create/UpdateTypeModal";
import AddComponent from "@/Pages/R&D/bom/create/AddComponent";
import routeConstants from "@/Routes/routeConstants.js";
import UploadDocumentModal from "@/Pages/R&D/bom/create/UploadDocumentModal";
import React from "react";
import { Box } from "@mui/material";

interface ComponentType {
  component: {
    label: string;
    value: string;
  };
  locations: string;
  text: string;
  value: string;
  qty: string;
  remarks: string;
  type: "main" | "substitute";
  mfgCode: null | string;
  smtType: string;
  make: string;
  mpn: string;
  substituteOf: {
    label: string;
    value: string;
  };
  vendor: {
    text: string;
    value: string;
  };
}

const BOMCreate = () => {
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [mainComponents, setMainComponents] = useState<ComponentType[]>([]);
  const [subComponents, setSubComponents] = useState<ComponentType[]>([]);
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const [isEditing, setIsEditing] = useState<string | number | boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [showApproversMetrics, setShowApproverMetrics] = useState(false);
  const [isBomUpdating, setIsBomUpdating] = useState(false);
  const [updateType, setUpdateType] = useState<bomUpdateType | null>(null);
  const [showUpdateTypeModal, setShowUpdateTypeModal] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [saveType, setSaveType] = useState<null | "draft" | "final">(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [isBomRej, setIsBomRej] = useState(false);
  const [bomId, setBomId] = useState("");
  const navigate = useNavigate();
  const [approvers, setApprovers] = useState<MultiStageApproverType[]>(
    initialApprovers as any
  );

  const [queryParams] = useSearchParams();

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const selectedProduct = Form.useWatch("product", form);
  const selectedSubstituteOf = Form.useWatch("altComp", form);

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
        type:
          row.type === "main" || row.type === "Main" ? "main" : "substitute",
        locations: row.location,
        vendor: {
          ...row.vendor,
          // label: row.vendor.text,
        },
        make: row.make,
        mpn: row.mpn,
        remarks: row.remarks,
        partCode: row.partCode?.code,
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

      setMainComponents((curr) => [...curr, ...mainComponents]);
      setSubComponents((curr) => [...curr, ...alternateComponents]);
    }
  };
  const handleAddComponents = async () => {
    // setApprovers(initialApprovers);
    const values = await form.validateFields([
      "component",
      "qty",
      "type",
      "substituteOf",
      "locations",
      "type",
      "vendor",
      "remarks",
      "make",
      "mpn",
    ]);
    const mfgCodesResponse = await handleFetchMfgCodeAndCategory(
      values.component.value
    );
    let arr = values?.component?.label?.split(")");
    const lastElement = arr[arr?.length - 1]; // " P4805"
    const newComponent = {
      ...values,
      mfgCode: mfgCodesResponse.data[0].mfgCode,
      smtType: mfgCodesResponse.data[0].category,
      partCode: lastElement,
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
      "make",
      "mpn",
    ]);
  };

  const handleFetchMfgCodeAndCategory = async (components: string[]) => {
    const response = await executeFun(
      () => getComponentMfgCodeAndType(components),
      "fetch"
    );
    return response;
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
      "make",
      "mpn",
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
    setIsEditing(false);
    form.resetFields([
      "component",
      "type",
      "qty",
      "remarks",
      "substituteOf",
      "vendor",
      "locations",
      "make",
      "mpn",
    ]);
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
    await form.validateFields(["name", "version", "product", "bomRef"]);
    setSaveType(action);
   if( action === "final"){
     setShowApproverMetrics(true);
   } 
   else{
    Modal.confirm({
      title: "Are you sure you want to save this BOM as Draft?",
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitHandler(action);
      },
      onCancel() {},
    });
    
   }
  };
  function convertStageToNumber(data) {
    // console.log("data ub ", data);

    return data.map((item) => {
      if (typeof item.stage === "string") {
        const match = item.stage.match(/\d+/);
        item.stage = match ? parseInt(match[0], 10) : item.stage;
      }
      return item;
    });
  }
  function showConfirmation(message: string) {
    const userConfirmed = window.confirm(
      `${message} , Do you wish to go to BOM List?`
    );
    if (userConfirmed) {
      navigate(routeConstants.researchAndDevelopment.bom.list);
      window.location.reload();
    } else {
      window.location.reload();
    }
  } 

  const submitHandler = async (action: "final" | "draft") => {
    const values = await form.validateFields([
      "name",
      "version",
      "product",
      "description",
      "document",
      "documents",
      "bomRef",
    ]);
    setShowApproverMetrics(false);
    let combined = [...mainComponents, ...subComponents];
    const payload = {
      product: values.product?.value ? values?.product.value : values?.product,
      bomName: values.name,
      brn: values.version,
      bomDoc: values.documents,
      bomRef: values.bomRef,
      bomRemark: values.description,
      approvers: approvers.map(
        (stage) => stage.approvers.map((approver: any) => approver?.user?.value) // Extract the 'value' of each approver's user
      ),
      // bomDoc: values.documents,
      componets: combined.map((item: any) => ({
        vendor: item?.vendor?.key ? item?.vendor.key : item?.vendor?.value,
        component: item.component.value
          ? item.component.value
          : item.componentKey, // Extract the component value
        quantity: item.qty.toString(), // Ensure quantity is a string
        type: item.type === "substitute" ? "alternate" : item.type, // Retain the type
        placement: item.locations, // Add placement field
        remark: item.remarks,
        altComp: item.substituteOf?.value,
        make: item?.make,
        mpn: item?.mpn,
        // ?item.substituteOf.value:item.substituteOf,
      })),
    };
    let response;
    if (action === "final") {
      response = await executeFun(() => createBomRND(payload as any), action);
    } else {
      response = await executeFun(
        () => createDraftBomRND(payload as any),
        action
      );
    }
    console.log(response)
    if (response?.success||response?.success !=="error") {
      setBomId("");
      setIsBomRej(false);
      setShowApproverMetrics(false);
      resetHandler();
      showConfirmation(response?.message);
    } else {
      if (approvers) {
        const updatedData = convertStageToNumber(approvers);
        setApprovers(updatedData);
      }
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFetchExistingBom = async (sku: any, version: string = "1.0") => {
    const response = await executeFun(
      () => getExistingBom(sku.value ?? sku, version),
      "fetch"
    );
    if (response.success) {
      if (response.data === null) {
        form.setFieldValue("version", "1.0");
        return;
      } else if (response.data.id && !queryParams.get("sku")) {
        toast.error(
          "This BOM is already created! You can view it in the BOM List. and Update it."
        );
      } else {
        form.setFieldValue("version", response.data.version);
      }

      if (
        response.data.isDraft == false &&
        response.data.isRejected == false &&
        queryParams.get("sku") &&
        queryParams.get("version") &&
        !window.location.href.includes("draft")
      ) {
        setShowUpdateTypeModal(true);
      }
      if (response.data && Array.isArray(response.data)) {
        // setSubComponents([]);
      } else if (response.data && response.data.length === undefined) {
        if (response.data.code == 417) {
          // form.setFieldValue("version", "1.0");
        } else {
          setBomId(response.data.id);
          setIsBomRej(response.data.isRejected);
          if (!queryParams.get("sku") && !queryParams.get("version")) {
            // setShowRedirectModal(true);
            return;
          }
          form.setFieldsValue(response.data);
          setLatestVersion(response.data.latestVersion);

          setMainComponents(
            response.data.components.filter((row) => row.type === "main")
          );
          setSubComponents(
            response.data.components.filter((row) => row.type === "substitute")
          );
        }
      }
    }
  };

  const handleUpload = async (files) => {
    // Create a FormData object
    const formData = new FormData();

    // Append each file to FormData
    files.forEach((file) => {
      formData.append("documents", file.originFileObj); // Use 'originFileObj' for actual file object
    });

    try {
      const result = await uploadDocs(formData);
      form.setFieldValue("documents", result);
      // Show success toast
      toast.success("Upload successful");
      setVisible(false); // Close the modal
    } catch (error) {
      console.error("Error during upload:", error); // Handle error
    }
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
    // setIsEditing(false);
  };

  // downloadSampleComponentFile
  const handleDownloadComponentSampleFile = () => {
    executeFun(() => downloadSampleComponentFile(), "sample");
  };
  useEffect(() => {
    if (queryParams.get("sku")) {
      handleFetchExistingBom(
        queryParams.get("sku"),
        queryParams.get("version") ?? ""
      );
    }
  }, [queryParams]);
  useEffect(() => {
    if (selectedProduct !== undefined) {
      if (selectedProduct && selectedProduct?.value) {
        handleFetchExistingBom(selectedProduct);
      }
    }
  }, [selectedProduct]);
  useEffect(() => {
    if (!showRedirectModal) {
      resetHandler();
    }
  }, [showRedirectModal]);
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

  useEffect(() => {
    const currentVersion = form.getFieldValue("version");
    let numericVersion = parseFloat(currentVersion); // Convert currentVersion to a number

    if (updateType === "ecn") {
      // Increase by 0.1 and keep 2 decimal places
      const updatedVersion = (numericVersion + 0.1).toFixed(2);
      form.setFieldValue("version", parseFloat(updatedVersion)); // Set value back as number
    } else if (updateType === "main") {
      // If it's a whole number like 1.0, it should start from 2.0
      if (numericVersion % 1 === 0) {
        // Increment by 1 if the number is a whole number
        numericVersion += 1;
      } else {
        // If it's not a whole number, round up normally
        numericVersion = Math.ceil(numericVersion);
      }

      console.log(currentVersion, numericVersion, "uuii");
      form.setFieldValue("version", numericVersion); // Set the updated version
    }
  }, [updateType]);

  return (
    <Form
      style={{ padding: 10, height: "95%" }}
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <RedirectModal
        show={showRedirectModal}
        hide={() => setShowRedirectModal(false)}
      />
      <UpdateTypeModal
        setIsBomUpdating={setIsBomUpdating}
        hide={() => setShowUpdateTypeModal(false)}
        setUpdateType={setUpdateType}
        show={showUpdateTypeModal}
      />
      {(loading("fetch") || loading("final") || loading("draft")) && (
        <Loading />
      )}
      <Row gutter={6} justify="center" style={{ height: "100%" }}>
        <Col span={5} style={{ height: "100%", overflow: "auto" }}>
          <Flex vertical gap={5}>
            <Card size="small" title="Header Details">
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
                <Input readOnly={updateType == "ecn"} />
              </Form.Item>
              <Form.Item
                name="version"
                label="BRN [BOM ref. no.] "
                // rules={rules.version}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="bomRef"
                label="ECN Number"
                rules={rules.bomRef}
              >
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Remarks">
                <Input.TextArea rows={3} />
              </Form.Item>
              {/* <Form.Item
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
                    onClick={() => setVisible(true)} // Trigger the modal when clicked
                  />
                </Upload>
              </Form.Item> */}

              <Button
                type="primary"
                style={{ width: "60%" }}
                onClick={() => setVisible(true)}
              >
                Upload Documents
              </Button>
            </Card>
            {/* Component add card */}
            <AddComponent
              asyncOptions={asyncOptions}
              form={form}
              handleAddComponents={handleAddComponents as any}
              handleCancelEditing={handleCancelEditing}
              handleDownloadComponentSampleFile={
                handleDownloadComponentSampleFile
              }
              handleFetchComponentOptions={handleFetchComponentOptions}
              handleFetchComponentsFromFile={handleFetchComponentsFromFile}
              handleUpdateCompnent={handleUpdateCompnent}
              isBomUpdating={isBomUpdating}
              isEditing={isEditing}
              loading={loading}
              mainComponents={mainComponents}
              subComponents={subComponents}
              rules={rules}
              selectedFile={selectedFile}
              setAsyncOptions={setAsyncOptions}
              setSelectedFile={setSelectedFile}
              validateHandler={validateHandler as any}
              submitHandler={submitHandler}
            />
            <ApproverMetrics
              approvers={approvers}
              setApprovers={setApprovers}
              show={showApproversMetrics}
              hide={() => setShowApproverMetrics(false)}
              submitHandler={submitHandler}
              submitLoading={loading("final") || loading("draft")}
              saveType={saveType}
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
                <UploadDocumentModal
                  open={visible}
                  close={() => setVisible(false)}
                  handleUpload={(files) => handleUpload(files)}
                  fileList={fileList} // Pass the selected file list to the modal
                  setFileList={setFileList}
                />
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

// const Components = ({
//   rows,
//   type,
//   handleDeleteComponent,
//   setIsEditing,
//   handleSetComponentForEditing,
// }: {
//   rows: ComponentType[];
//   type?: "main" | "substitute";
//   handleDeleteComponent: (
//     componentKey: string,
//     type: ComponentType["type"]
//   ) => void;
//   setIsEditing: React.Dispatch<React.SetStateAction<string | number | boolean>>;
//   handleSetComponentForEditing: (component: ComponentType) => void;
// }) => {
//   return (
//     <div style={{ height: "100%", overflow: "hidden" }}>
//       {rows.length === 0 && <Empty />}
//       {rows.length > 0 && (
//         <Row gutter={[6, 6]} style={{ height: "100%" }}>
//           {/* headers */}
//           <Col span={1}>
//             <Typography.Text strong>#</Typography.Text>
//           </Col>
//           <Col span={2}>
//             <Typography.Text strong>PartCode</Typography.Text>
//           </Col>
//           <Col span={8}>
//             <Typography.Text strong>Component</Typography.Text>
//           </Col>
//           <Col span={2}>
//             <Typography.Text strong>Qty</Typography.Text>
//           </Col>
//           <Col span={2}>
//         <Typography.Text strong>Make</Typography.Text>
//       </Col>
//       <Col span={2}>
//         <Typography.Text strong>MPN</Typography.Text>
//       </Col>
//           <Col span={3}>
//             <Typography.Text strong>Vendor</Typography.Text>
//           </Col>
//           <Col span={2}>
//             <Typography.Text strong>Placement</Typography.Text>
//           </Col>
//           {type === "substitute" && (
//             <Col span={4}>
//               <Typography.Text strong>Alternate Of</Typography.Text>
//             </Col>
//           )}
//           <Col span={type === "substitute" ? 2 : 6}>
//             <Typography.Text strong>Remarks</Typography.Text>
//           </Col>

//           {/* rows */}
//           <Col
//             span={24}
//             style={{ height: "100%", overflow: "auto", paddingBottom: 30 }}
//           >
//             <Row gutter={[0, 4]}>
//               {rows.map((row: any, index: number) => (
//                 <React.Fragment key={row.value}>
//                   <Col span={1} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {index + 1}
//                     </Typography.Text>
//                   </Col>
//                   <Col span={2} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {row?.partCode}
//                     </Typography.Text>
//                   </Col>
//                   {/* <Col span={1} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {row.component?.code}
//                     </Typography.Text>
//                   </Col> */}
//                   <Col span={8} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Tooltip
//                       title={
//                         row.mfgCode?.length === 0
//                           ? "No Mfg Code found."
//                           : "Mfg Code: " + row.mfgCode
//                       }
//                     >
//                       <Typography.Text
//                         style={{
//                           fontSize: 13,
//                           color:
//                             row.smtType !== "Other" && row.mfgCode?.length === 0
//                               ? "red"
//                               : "black",
//                         }}
//                       >
//                         {row.component.label ?? row.component.text}
//                       </Typography.Text>
//                     </Tooltip>
//                   </Col>
//                   <Col span={2} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {row.qty}
//                     </Typography.Text>
//                   </Col>
//                   <Col span={2} style={{ borderBottom: "1px solid #ddd" }}>
//                 <Typography.Text style={{ fontSize: 13 }}>
//                   {row.make}
//                 </Typography.Text>
//               </Col>
//               <Col span={2} style={{ borderBottom: "1px solid #ddd" }}>
//                 <Typography.Text style={{ fontSize: 13 }}>
//                   {row.mpn}
//                 </Typography.Text>
//               </Col>
//                   <Col span={3} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {row.vendor?.label ?? row.vendor}
//                     </Typography.Text>
//                   </Col>
//                   <Col span={2} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {row.locations}
//                     </Typography.Text>
//                   </Col>
//                   {type === "substitute" && (
//                     <Col span={4} style={{ borderBottom: "1px solid #ddd" }}>
//                       <Typography.Text style={{ fontSize: 13 }}>
//                         {row.substituteOf?.label}
//                       </Typography.Text>
//                     </Col>
//                   )}
//                   <Col
//                     span={type === "substitute" ? 1 : 5}
//                     style={{ borderBottom: "1px solid #ddd" }}
//                   >
//                     <Typography.Text style={{ fontSize: 13 }}>
//                       {row.remarks}
//                     </Typography.Text>
//                   </Col>
//                   <Col span={1} style={{ borderBottom: "1px solid #ddd" }}>
//                     <Flex gap={2}>
//                       <TableActions
//                         action="edit"
//                         onClick={() => {
//                           handleSetComponentForEditing(row);
//                           setIsEditing(index);
//                         }}
//                       />
//                       <TableActions
//                         action="delete"
//                         onClick={() =>
//                           handleDeleteComponent(row.value, row.type)
//                         }
//                       />
//                     </Flex>
//                   </Col>
//                 </React.Fragment>
//               ))}
//             </Row>
//             <Flex justify="center" style={{ marginTop: 20 }}>
//               <Typography.Text strong type="secondary">
//                 --End of the list--
//               </Typography.Text>
//             </Flex>
//           </Col>
//         </Row>
//       )}
//     </div>
//   );
// };
 // Assuming TableActions is a component for Edit/Delete actions

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
  // Columns definition for MyDataTable
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      sortable: true,
    },
    {
      field: "partCode",
      headerName: "PartCode",
      width: 150,
      sortable: true,
    },
    {
      field: "text",
      headerName: "Component",
      width: 200,
      sortable: true,
      // renderCell: (params) => <span>{params.value?.label || params.value?.text}</span>,
    },
    {
      field: "qty",
      headerName: "Quantity",
      width: 120,
      sortable: true,
    },
    {
      field: "make",
      headerName: "Make",
      width: 120,
      sortable: true,
    },
    {
      field: "mpn",
      headerName: "MPN",
      width: 150,
      sortable: true,
    },
    {
      field: "vendor",
      headerName: "Vendor",
      width: 180,
      sortable: true,
      renderCell: (params: any) => <Tooltip title={params.value?.label||params.value.name+" ("+params.value?.code+")"}>{params.value?.label||params.value.name+" ("+params.value?.code+")" }</Tooltip>,
    },
    {
      field: "locations",
      headerName: "Placement",
      width: 180,
      sortable: true,
    },
    ...(type === "substitute" 
      ? [
          {
            field: "substituteOf",
            headerName: "Alternate Of",
            width: 200,
            sortable: true,
            renderCell: (params: any) => <Tooltip title={params.value.label}>{params.value.label}</Tooltip>, // Render substitute label
          }
        ]
      : []),
    {
      field: "remarks",
      headerName: "Remarks",
      width: 250,
      sortable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params: any) => (
        <Flex gap={2}>
          <TableActions
            action="edit"
            onClick={() => {
              handleSetComponentForEditing(params.row);
              setIsEditing(params.rowIndex);
            }}
          />
          <TableActions
            action="delete"
            onClick={() =>
              handleDeleteComponent(params.row.value, params.row.type)
            }
          />
        </Flex>
      ),
    },
  ];
  const rowsWithId = rows?.map((row,index) => ({
    ...row,
    id: index+1,  // Add `id` using the `value` field as the unique identifier
  }));
  
  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      {rowsWithId?.length === 0 && <Empty />}
      {rowsWithId?.length > 0 && (
        <Row gutter={[6, 6]} style={{ height: "100%" }}>
          <MyDataTable data={rowsWithId} columns={columns} loading={false}  />
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
  bomRef: [
    {
      required: true,
      message: "BOM Reference is required",
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
  make: [
    {
      required: true,
      message: "Make is required",
    },
  ],
  mpn: [
    {
      required: true,
      message: "MPN is required",
    },
  ],
};

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

const RedirectModal = ({ hide, show }: ModalType) => {
  const navigate = useNavigate();
  return (
    <Modal
      open={show}
      onCancel={hide}
      title="Existing BOM found"
      footer={<></>}
    >
      <Flex vertical align="center" gap={10}>
        <Typography.Text strong>
          It looks like BOM already exist for this product. Select the version
          of the BOM you want to update from BOM List page.
        </Typography.Text>
        <MyButton
          variant="next"
          text="Bom List"
          onClick={() =>
            navigate(routeConstants.researchAndDevelopment.bom.list)
          }
        />
      </Flex>
    </Modal>
  );
};
