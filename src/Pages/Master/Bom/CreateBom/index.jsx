import { Col, Form, Modal, Row } from "antd";
import React from "react";
import ProductDetails from "./ProductDetails";
import Components from "./Components";
import { useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import { useEffect } from "react";
import useApi from "../../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../../api/general.ts";
const CreateBom = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSelected, setProductSelected] = useState(false);
  const [uploadType, setUploadType] = useState("table");
  const [stage, setStage] = useState("preview");
  const [previewData, setpreviewData] = useState([]);
  const [form] = Form.useForm();
  const files = Form.useWatch("files", form);

  const { executeFun, loading: loading1 } = useApi();
  const getSKUDetails = async () => {
    try {
      setLoading("fetch");
      const values = await form.validateFields(["sku"]);
      const response = await imsAxios.get(`products/bySku?sku=${values.sku}`);
      const { data } = response;

    
        if (response?.success) {
          const product = data.productName;
          const productKey = data.productKey;
          form.setFieldValue("product", product);
          form.setFieldValue("productKey", productKey);
          setProductSelected(true);
        } else {
          toast.error(response.message);
        }
    
    } catch (error) {
    
      console.log("error while fetching SKU details", error);
    } finally {
      setLoading(false);
    }
  };

  const getPreviewData = async (values, url) => {};

  const resetProduct = () => {
    setProductSelected(false);
    form.setFieldValue("sku", "");
    form.setFieldValue("product", "");
  };

  const validateHandler = async () => {
    const values = await form.validateFields();
    let finalObj = {};
    let formData = new FormData();
    let url = "";
    if (uploadType === "file") {
      if (stage === "preview") {
        url = "/bom/showExcelBomData";
      } else if (stage === "submit") {
        url = "/bom/insertBOMthroughExcel";
      }
      const obj = {
        file: values.files[0].originFileObj,
        bom_recipe_type: values.type,
        bom_subject: values.name,
        mapped_sfg: values.type === "Y" ? values.partCode.value : undefined,
        sku: values.sku,
        bom_level: values.level,
        bom_project: values.project,
      };
      formData.append("excelFile", obj.file);
      formData.append("bom_recipe_type", obj.bom_recipe_type);
      formData.append("bom_subject", obj.bom_subject);
      formData.append("mapped_sfg", obj.mapped_sfg);
      formData.append("sku", obj.sku);
      formData.append("bom_level", obj.bom_level);
      formData.append("bom_project",obj.project)

      finalObj = formData;
    }
    if (uploadType === "table") {
      setStage("submit");
      url = "/bom/insert";
      finalObj = {
        bom_recipe_type: values.type,
        bom_subject: values.name,
        mapped_sfg: values.type === "Y" ? values.partCode.value : undefined,
        sku: values.sku,
        bom_level: values.level,
        bom_project: values.project,
        bom_components: {
          component_key: values.components.map((row) => row.component.key),
          qty: values.components.map((row) => row.qty),
        },
      };
      // console.log("finalObj", finalObj);
      // console.log("stage", stage);
      // return;
    }
    if (stage === "submit") {
      Modal.confirm({
        title: "Create BOM",
        content: "Are you sure you want to create this BOM?",
        okText: "Continue",
        onOk: () => submitHandler(finalObj, url),
      });
    } else {
      submitHandler(finalObj, url);
    }
  };
  const submitHandler = async (values, url) => {
    try {
      setLoading("submit");
      // console.log("submig handler valuesssss", values, url);
      const response = await imsAxios.post(url, values);
      const { data } = response;
        if (response?.success) {
          if (stage === "preview") {
            const arr = data.map((row, index) => ({
              id: index + 1,
              category: row.CATEGORY,
              source: row.COMP_SOURCE,
              partCode: row.PARTCODE,
              priority: row.PRIORITY,
              process: row.PROCESS,
              qty: row.QTY,
              smyLoc: row.SMY_MI_LOC,
              status: row.STATUS,
              vendorCode: row.VENDOR,
            }));
            setStage("submit");
            setpreviewData(arr);
          }
          if (stage === "submit") {
            toast.success(response?.message);
            setProductSelected(false);
            form.resetFields();
            setpreviewData([]);
          }
        } else {
          toast.error(response.message);
        }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
   
    const { data } = response;
    // setLoading(false);
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));

        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    } else {
      setAsyncOptions([]);
    }
  };

  const fetchProjects = async () => {
    const response = await imsAxios.post("/ppr/allProjects");
    const { data } = response?.data;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          value: row.project,
          text: row.description,
        }));

        setProjectData(arr);
      } else {
        setProjectData([]);
      }
    } else {
      setProjectData([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  },[])
  
  useEffect(() => {
    if (files) {
      setStage("preview");
    }
  }, [files]);
  useEffect(() => {
    if (uploadType === "table") {
      setStage("submit");
    } else {
      setStage("preview");
    }
  }, [uploadType]);

  return (
    <div style={{ height: "90%", padding: 10, paddingTop: 0 }}>
      <Form
        initialValues={initialValues}
        layout="vertical"
        form={form}
        style={{ height: "100%" }}
      >
        <Row style={{ height: "100%" }} gutter={6}>
          <Col span={6} style={{ height: "100%", overflow: "auto" }}>
            <ProductDetails
              uploadType={uploadType}
              setUploadType={setUploadType}
              submitHandler={validateHandler}
              getSKUDetails={getSKUDetails}
              productSelected={productSelected}
              resetProduct={resetProduct}
              loading={loading}
              selectLoading={loading1("select")}
              getComponentOptions={getComponentOption}
              asyncOptions={asyncOptions}
              stage={stage}
              setAsyncOptions={setAsyncOptions}
              projectData={projectData}
            />
          </Col>
          <Col span={18} style={{ height: "100%", overflow: "auto" }}>
            {uploadType === "table" && (
              <Components
                asyncOptions={asyncOptions}
                setAsyncOptions={setAsyncOptions}
                getComponentOptions={getComponentOption}
                selectLoading={loading1("select")}
                loading={loading === "fetch"}
                form={form}
              />
            )}
            {uploadType === "file" && (
              <MyDataTable columns={previewColumns} data={previewData} />
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateBom;

const initialValues = {
  files: [],
  type: "N",
  name: "",
  sku: "",
  level: "",
  components: [
    {
      component: "",
      qty: "",
    },
  ],
};

const previewColumns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partCode} copy={true} />
    ),
  },
  {
    headerName: "Priority",
    field: "priority",
    width: 100,
  },
  {
    headerName: "Qty",
    field: "qty",
    width: 100,
  },
  {
    headerName: "Category",
    field: "category",
    width: 80,
  },
  {
    headerName: "Status",
    field: "status",
    width: 100,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.status === "A" ? "Active" : "Inactive"} />
    ),
  },
  {
    headerName: "Vendor",
    field: "vendorCode",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Process",
    field: "process",
    width: 100,
  },
  {
    headerName: "Source",
    field: "source",
    width: 100,
  },
  {
    headerName: "SMY_MI_LOC",
    field: "smyLoc",
    width: 100,
  },
];
