import React, { useState } from "react";
import { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  Typography,
  Upload,
  message,
  Modal,
} from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
  downloadExcel,
} from "../../../Components/printFunction";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general.ts";
function R20() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [verifiedFile, setVerifiedFile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewed, setPreviewed] = useState([]);
  const [singleUpload, setSingleUpload] = useState(false);
  const [multipleUpload, setmultipleUpload] = useState(false);
  const [showModalData, setShowModalData] = useState(false);
  const [previewDT, setPreviewDT] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadForm] = Form.useForm();
  const [compKey, setCompKey] = useState([]);
  const [stdPrice, setStdPrice] = useState([]);

  const { executeFun, loading: loading1 } = useApi();
  const getRows = async () => {
    setLoading(true);

    const response = await imsAxios.get("/report20");
    setLoading(false);

    if (response) {
      const { data } = response;
      let arr = data.result.map((row, index) => {
        return {
          ...row,
          id: v4(),
          serial_no: index + 1,
        };
      });
      setRows(arr);
      setClosing(data.closingDate);
    }
  };
  const handleDownloadCSV = () => {
    downloadCSVCustomColumns(rows, "Report20");
  };
  const handleOk = () => {
    setShowModalData(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const columns = [
    { field: "serial_no", headerName: "S.No.", width: 80 },
    { field: "partCode", headerName: "Part Code", width: 120 },
    // { field: "componentKey", headerName: "Component Key", flex: 1 },
    { field: "component", headerName: "Component", flex: 1 },
    { field: "group", headerName: "Group", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "fifoAveragePrice", headerName: "FIFO Average Price", width: 180 },
    { field: "closingStock", headerName: "Closing Stock", width: 180 },
    { field: "vbtRecord", headerName: "VBT Record", width: 150 },
    { field: "totalValue", headerName: "Total Value", width: 180 },
  ];
  const drawerColumns = [
    { headerName: "Sr. No.", width: 80, field: "id" },
    { headerName: "Part Code", width: 120, field: "partCode" },
    {
      headerName: "Component Name",
      width: 120,
      field: "componentName",
      flex: 1,
    },
    {
      headerName: "Component Key",
      width: 120,
      field: "componentKey",
      flex: 1,
    },
    { headerName: "Price", width: 120, field: "standardPrice", flex: 1 },
  ];
  const previewSingleData = async (componentKey, standardPrice) => {
    setShowModalData(false);
    const response = await imsAxios.post("/report20/standardPrice/update", {
      componentKey: [componentKey],
      standardPrice: [standardPrice],
    });
    const { data } = response;
    if (response.status === 200) {
      toast.success(data);
      setShowModalData(false);
    }
  };
  const previewMultiData = async (componentKey, standardPrice) => {
    setLoading(true);
    const response = await imsAxios.post("/report20/standardPrice/update", {
      componentKey: componentKey,
      standardPrice: standardPrice,
    });
    const { data } = response;
    if (response.status === 200) {
      toast.success(data);
      setLoading(false);
      setIsModalOpen(false);
      setPreviewDT(true);
      setShowModalData(false);
    }
  };
  const getComponents = async (search) => {
    // setSelectLoading(true);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    let arr = [];
    if (response.data[0]) {
      arr = response.data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const props = {
    name: "file",
    multiple: false,
    maxCount: 1,
    action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
    beforeUpload(file) {
      setUploadingFile(file);
      return false;
    },
  };

  const verifyFile = async () => {
    const formData = new FormData();
    formData.append("file", uploadingFile);
    setLoading("1");
    const response = await imsAxios.post("/report20/standardPrice", formData);
    setLoading(false);
    const { data } = response;
    if (response.status === 200) {
      setIsModalOpen(true);
      let arr = data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      let compkey = [];
      let stdP = [];
      setPreviewed(arr);
      setmultipleUpload(true);
      arr.map((r) => {
        compkey.push(r.componentKey);
        stdP.push(r.standardPrice);
      });
      setCompKey(compkey);
      setStdPrice(stdP);
      setmultipleUpload(true);
    } else {
      toast.error(data.statusText);
    }
  };

  const downloadSampleFile = async () => {
    toast.info("PartCode list will be downloaded shortly!");
    setLoading(true);
    const response = await imsAxios.get("/report20/componentList");
    const { data } = response;
    console.log("response for downloaded file", data);
    if (response.status === 200) {
      downloadExcel(data.data.data, "component1215145", data.data.type);
    }
  };

  useEffect(() => {
    if (open) {
      setIsModalOpen(true);
    }
  }, [open]);
  useEffect(() => {
    getRows();
  }, []);
  const uploadSingleField = async () => {
    const values = await uploadForm.validateFields();
    const componentKey = values.component;
    const standardPrice = values.standardPrice;
    setSingleUpload(true);
    previewSingleData(componentKey, standardPrice);
  };
  useEffect(() => {
    console.log("inside USeeffect");
    if (showModalData) {
      previewMultiData(compKey, stdPrice);
    }
  }, [showModalData]);

  return (
    <>
      <Modal
        width={1000}
        title="Basic Modal"
        open={isModalOpen}
        // onOk={() => setShowModalData(true)}
        // onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => setShowModalData(true)}
          >
            Submit
          </Button>,
        ]}
      >
        <div style={{ height: "20rem" }}>
          <MyDataTable
            loading={loading}
            data={previewed}
            columns={drawerColumns}
          />
        </div>
      </Modal>
      <Drawer
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        width="100vw"
        bodyStyle={{ overflow: "hidden", padding: 0 }}
        closable={true}
        destroyOnClose={true}
        title={"Standard Price"}
      >
        <Row gutter={6} style={{ padding: 10, height: "90%" }}>
          <Col span={6}>
            <Col span={24}>
              <Card size="small" title="Upload Single Component">
                <Form form={uploadForm} layout="vertical">
                  <Row>
                    <Col span={24}>
                      <Form.Item label="Select Component" name="component">
                        <MyAsyncSelect
                          selectLoading={loading1("select")}
                          loadOptions={getComponents}
                          optionsState={asyncOptions}
                          onBlur={() => setAsyncOptions([])}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="Set Price" name="standardPrice">
                        <Input placeholder="Enter value" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Row justify="end">
                        <Button
                          loading={loading === "single"}
                          type="primary"
                          disabled={!compKey}
                          onClick={uploadSingleField}
                          htmlType="submit"
                        >
                          Save
                        </Button>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
            <Row gutter={[0, 6]} justify={"space-between"}>
              <Col span={24}>
                <Card size="small" style={{ marginTop: "1em" }}>
                  <Col span={24} style={{ display: "inline-flex" }}>
                    <div>
                      <Form form={uploadForm} style={{ align: "middle" }}>
                        <Form.Item name="dragger">
                          <Upload {...props}>
                            <Button icon={<UploadOutlined />}>
                              Upload Excel Here
                            </Button>
                          </Upload>
                        </Form.Item>
                      </Form>
                      <Row justify="end" style={{ marginLeft: "5rem" }}>
                        <Button onClick={downloadSampleFile} type="link">
                          Download PartCode List
                        </Button>
                        <Button
                          loading={loading === "1"}
                          onClick={verifyFile}
                          type="primary"
                          disabled={!uploadingFile}
                          style={{ marginRight: "-1rem" }}
                        >
                          Next
                        </Button>
                      </Row>
                    </div>
                  </Col>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={18} style={{ height: "100%" }}>
            {previewDT && (
              <MyDataTable rows={previewed} columns={drawerColumns} />
            )}
          </Col>
        </Row>
      </Drawer>
      <div style={{ height: "97%" }}>
        <Row
          span={24}
          style={{ marginLeft: "1rem", marginTop: "0.25rem" }}
          justify={"space-between"}
        >
          {" "}
          <div>
            <CommonIcons
              size="small"
              action="downloadButton"
              onClick={handleDownloadCSV}
            />
            <Typography.Text
              style={{ marginLeft: "1rem", marginTop: "0.5rem" }}
              level={2}
            >
              Data as per-{closing}
            </Typography.Text>
          </div>
          <div>
            <Button
              style={{ marginRight: "1em" }}
              onClick={() => setOpenDrawer(true)}
            >
              Standardize{" "}
            </Button>
          </div>
        </Row>

        <div className="hide-select" style={{ height: "90%", margin: "10px" }}>
          <MyDataTable loading={loading} data={rows} columns={columns} />
        </div>
      </div>
    </>
  );
}

export default R20;
