import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";

const JWUpdateRate = () => {
  const [previewRows, setpreviewRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [stage, setStage] = useState("preview");

  const [updateJwForm] = Form.useForm();
  const file = Form.useWatch("files", updateJwForm);

  const previewFileHandler = async () => {
    try {
      const file = await updateJwForm.validateFields(["files"]);
      const form = new FormData();
      form.append("file", file.files[0].originFileObj);
      setLoading("preview");
      const response = await imsAxios.post(
        "/part_rate/previewRateExcelData",
        form
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setStage("submit");
          const arr = data.data.map((row, index) => ({
            id: index + 1,
            component: row.PART_NAME,
            partCode: row.PART_CODE,
            rate: row.PART_RATE,
            uom: row.PART_UOM,
          }));

          setpreviewRows(arr);
        } else {
          toast.error(data.message.msg);
        }
      } else {
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  const getJwOptions = async (search) => {
    try {
      setLoading("select");
      const response = await imsAxios.post("/backend/fetchJWid", {
        search: search.toString().toUpperCase(),
      });

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            text: row.jw_id,
            value: row.jw_id,
          }));

          setAsyncOptions(arr);
        }
      }
    } catch {
      setAsyncOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const validateHandler = async () => {
    const values = await updateJwForm.validateFields();
    const formData = new FormData();
    console.log(values);
    formData.append("file", values.files[0].originFileObj);
    formData.append("jobwork_id", values.jwId);
    Modal.confirm({
      title: "Submit JW Rates",
      content: `Are you sure you want to update the rates of ${values.jwId}}?`,
      okText: "Continue",
      cancelText: "Cancel",
      onOk: () => submitHandler(formData),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/part_rate/insertPartRatethroughExcel",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          updateJwForm.resetFields();
          setpreviewRows([]);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const validateResetHandler = () => {
    Modal.confirm({
      title: "Reset Details",
      content:
        "Are you sure you want to reset the form, all changes will be lost.",
      okText: "Reset",
      cancelText: "Back",
      onOk: resetHandler,
    });
  };

  const resetHandler = () => {
    updateJwForm.resetFields();
    setStage("preview");
    setpreviewRows([]);
  };

  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e.files[0].originFileObj;
    }
    return e?.fileList;
  };
  useEffect(() => {
    setStage("preview");
    console.log("this is the file", file);
    if (file?.length === 0) {
      setpreviewRows([]);
    }
  }, [file]);
  return (
    <Row  gutter={6} style={{ padding: 10, height: "90%" }}>
      <Col span={4}>
        <Card>
          <Form
            initialValues={initialValues}
            form={updateJwForm}
            layout="vertical"
          >
            <Form.Item label="Jobwork Id" name="jwId" rules={rules.jwId}>
              <MyAsyncSelect
                loadOptions={getJwOptions}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                selectLoading={loading === "select"}
              />
            </Form.Item>
            <Form.Item label="Rate File">
              <Form.Item
                name="files"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={rules.file}
                noStyle
              >
                <Upload.Dragger name="files" {...props}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
            <Row justify="end" style={{ marginTop: 10 }}>
              <Space>
                <MyButton variant="reset" onClick={validateResetHandler} />
                {stage === "preview" && (
                  <MyButton
                    loading={loading === "preview"}
                    variant="next"
                    text="Preview"
                    onClick={previewFileHandler}
                  />
                )}
                {stage === "submit" && (
                  <MyButton
                    loading={loading === "submit"}
                    variant="submit"
                    onClick={validateHandler}
                  />
                )}
              </Space>
            </Row>
            <Row justify="end" style={{ marginTop: 5 }}>
              <MyButton
                variant="downloadSample"
                href="https://media.mscorpres.net/oakterIms/other/PART%20RATE.csv"
              />
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={16}>
        <MyDataTable
          loading={loading === "preview"}
          columns={columns}
          data={previewRows}
        />
      </Col>
    </Row>
  );
};

export default JWUpdateRate;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Component",
    minWidth: 200,
    field: "component",
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Part Code",
    width: 150,
    field: "partCode",
    renderCell: ({ row }) => (
      <ToolTipEllipses
        style={{ width: "100%" }}
        text={row.partCode}
        copy={true}
      />
    ),
  },
  {
    headerName: "UoM",
    width: 100,
    field: "uom",
  },
  {
    headerName: "Rate",
    width: 100,
    field: "rate",
  },
];

const initialValues = {
  files: undefined,
  jwId: undefined,
};

const rules = {
  file: [
    {
      required: true,
      message: "Please select a file",
    },
  ],
  jwId: [
    {
      required: true,
      message: "Please select a Job Work",
    },
  ],
};
