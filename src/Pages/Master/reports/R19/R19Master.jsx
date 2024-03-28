import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Popconfirm,
  Row,
  Space,
  Typography,
} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import MyDataTable from "../../../../Components/MyDataTable";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import VerifiedFilePreview from "./VerifiedFilePreview";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import { getComponentOptions } from "../../../../api/general";
import useApi from "../../../../hooks/useApi";
import MyButton from "../../../../Components/MyButton";
function R19Master() {
  const [rows, setRows] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [verifiedFile, setVerifiedFile] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);

  const [addSingleComponentForm] = Form.useForm();

  const { executeFun, loading: loading1 } = useApi();
  const props = {
    name: "file",
    showUploadList: false,
    multiple: true,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",

    beforeUpload(file) {
      setUploadingFile(file);
      return false;
    },
  };
  const getRows = async () => {
    setFetchLoading(true);
    const { data } = await imsAxios.post("/report19/getSelectedComponent");
    setFetchLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      setRows(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  const deleteComponent = async (id) => {
    const response = await imsAxios.post("/report19/removeComponent", {
      component_key: id,
    });
    if (response.data.code === 200) {
      getRows();
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message.msg);
    }
  };
  const columns = [
    { headerName: "Sr. No.", width: 80, field: "id" },
    { headerName: "part", width: 120, field: "part" },
    { headerName: "Name", width: 120, field: "name", flex: 1 },
    {
      headerName: "Actions",
      type: "actions",
      width: 120,
      getActions: ({ row }) => [
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to delete this component"
          onConfirm={() => deleteComponent(row.component_key)}
          // onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <TableActions
            action="delete"
            // onClick={() => deleteComponent(row.component_key)}
          />
        </Popconfirm>,
      ],
    },
  ];
  const verifyFile = async () => {
    const formData = new FormData();
    formData.append("uploadfile", uploadingFile);
    setLoading("1");
    const { data } = await imsAxios.post(
      "/report19/uploadComponents?stage=1",
      formData
    );
    setLoading(false);
    if (data.code === 200) {
      let arr = data.data.data.map((row, index) => ({ ...row, id: index + 1 }));
      setVerifiedFile(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  const submitHandler = async (type, value) => {
    if (type === "excel") {
      const formData = new FormData();
      formData.append("uploadfile", uploadingFile);
      setLoading("2");
      const { data } = await imsAxios.post(
        "/report19/uploadComponents?stage=2",
        formData
      );
      setLoading(false);
      if (data.code === 200) {
        toast.success(data.message);
        setVerifiedFile(false);
        setUploadingFile(false);
      } else {
        toast.error(data.message.msg);
      }
    } else if (type === "single") {
      setLoading("single");
      const response = await imsAxios.post("/report19/addComponent", {
        component_key: value.component,
      });
      setLoading(false);
      if (response.data.code === 200) {
        toast.success(response.data.message);
        getRows();
        addSingleComponentForm.resetFields();
      } else {
        toast.error(response.data.message.msg);
      }
    }
  };
  const getComponents = async (search) => {
    setSelectLoading(true);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setSelectLoading(false);
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
  useEffect(() => {
    getRows();
    addSingleComponentForm.setFieldsValue({ component: "" });
  }, []);
  return (
    <Row gutter={6} style={{ padding: 10, height: "90%" }}>
      <VerifiedFilePreview
        verifiedFile={verifiedFile}
        setVerifiedFile={setVerifiedFile}
        submitHandler={submitHandler}
        loading={loading}
      />
      <Col span={6}>
        <Row gutter={[0, 6]} justify="end">
          <Col span={24}>
            <Card size="small">
              {!uploadingFile && (
                <Dragger {...props}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Dragger>
              )}

              {uploadingFile && (
                <Row justify="space-between">
                  <Typography.Title style={{ margin: 0 }} level={4}>
                    {uploadingFile?.name}
                  </Typography.Title>
                  <TableActions
                    action="cancel"
                    onClick={() => setUploadingFile(false)}
                  />
                </Row>
              )}
            </Card>
          </Col>

          <Row justify="end">
            <Space>
              <MyButton
                href="https://ims.mscorpres.net/assets/files/R19.csv"
                type="link"
                variant="downloadSample"
              >
                Download Sample File
              </MyButton>
              <MyButton
                loading={loading === "1"}
                onClick={verifyFile}
                type="primary"
                disabled={!uploadingFile}
                variant="next"
              >
                Next
              </MyButton>
            </Space>
          </Row>
          <Col span={24}>
            <Card size="small" title="Upload Single Component">
              <Form
                onFinish={(values) => submitHandler("single", values)}
                form={addSingleComponentForm}
                layout="vertical"
              >
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label="Select Component"
                      name="component"
                      rules={[
                        {
                          required: true,
                        },
                        () => ({
                          validator(_, value) {
                            if (
                              !rows.filter(
                                (row) =>
                                  row.component_key ===
                                  addSingleComponentForm.getFieldsValue()
                                    .component
                              )[0]
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "This Component is already added to the database"
                              )
                            );
                          },
                        }),
                      ]}
                    >
                      <MyAsyncSelect
                        selectLoading={loading1("select")}
                        loadOptions={getComponents}
                        optionsState={asyncOptions}
                        onBlur={() => setAsyncOptions([])}
                        onChange={(value) =>
                          addSingleComponentForm.setFieldsValue({
                            component: value,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row justify="end">
                      <Button
                        loading={loading === "single"}
                        type="primary"
                        // disabled={!uploadingFile}
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
        </Row>
      </Col>
      <Col span={18} style={{ height: "100%" }}>
        <MyDataTable loading={fetchLoading} rows={rows} columns={columns} />
      </Col>
    </Row>
  );
}

export default R19Master;
