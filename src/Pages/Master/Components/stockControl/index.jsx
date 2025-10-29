import { Card, Col, Row, Space, Upload, Form } from "antd";
import { useState, useMemo } from "react";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";
import CustomButton from "../../../../new/components/reuseable/CustomButton";
import { renderIcon } from "../../../../new/components/layout/Sidebar/iconMapper";

function StockControl() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [uploadForm] = Form.useForm();

  ///change the smaple File
  const sampleData = [
    {
      PART_CODE: "P2044",
      SF_CTRL_QTY: "0",
    },
  ];
  const columns = () => [
    { header: "#", accessorKey: "id", width: 20 },
    { header: "Component", accessorKey: "part_name", flex: 1 },
    { header: "PART Code", accessorKey: "part_no", width: 100 },
    { header: "SF Quantity", accessorKey: "sf_ctrl_qty", width: 100 },
  ];
  const stockColumns = useMemo(() => columns(), []);

  const table = useMaterialReactTable({
    columns: stockColumns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderTopToolbar: () =>
      loading === "fetch" ? (
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

  const displayDataTable = async () => {
    setLoading("fetch");
    const response = await imsAxios.get("/component/fetchSfCtrl");
    setLoading(false);

    const { data: newData } = response;
    if (newData.code === 200 || newData.code === "200") {
      let arr = newData.data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      setRows(arr);
      console.log(rows);
    }
  };

  const submitFile = async () => {
    setLoading("submitting");
    const values = await uploadForm.validateFields();
    setLoading(false);

    const formData = new FormData();
    formData.append("file", values.dragger[0].originFileObj);

    const link = "/component/uploadSfCtrlFile";
    const response = await imsAxios.post(link, formData);

    const { data } = response;
    if (data) {
      if (data.code === 200 || data.code === "200") {
        // reset();
        toast.success(data.message);
        displayDataTable();
      }
    } else {
      toast.error(data.message.msg);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const reset = () => {
    uploadForm.resetFields();
  };

  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
  };

  useEffect(() => {
    displayDataTable();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={8} style={{ height: "100%", padding: "0 10px" }}>
        <Col span={10}>
          <Form initialValues={initialValues} form={uploadForm}>
            <Card size="small" title="Upload Stock Control Files">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "5em 4em 5em 0em",

                  alignItems: "center",
                }}
              >
                <Form.Item>
                  <Form.Item
                    style={{ padding: "20px" }}
                    name="dragger"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    noStyle
                  >
                    <Upload.Dragger name="files" {...props}>
                      <p className="ant-upload-drag-icon">
                        <BsFillCloudArrowUpFill
                          style={{
                            fontSize: 70,
                            color: "#0d9488",
                            opacity: 0.6,
                            zIndex: 1,
                            marginRight: "20px",
                          }}
                        />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload.
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Form.Item>
              </div>
            </Card>
          </Form>
          <Row justify="end">
            <Space style={{ marginTop: 10 }}>
              <CustomButton
                variant="text"
                onclick={() =>
                  downloadCSVCustomColumns(sampleData, "Stock Control Sample")
                }
                title="Download Sample File"
                endicon={renderIcon("DownloadIcon")}
                size="small"
              />
              <CustomButton
                variant="outlined"
                onclick={reset}
                title="Reset"
                endicon={renderIcon("ResetIcon")}
              />
              <CustomButton
                variant="submit"
                onclick={submitFile}
                title="Submit"
                endicon={renderIcon("CheckCircleOutlined")}
                loading={loading === "submitting"}
              />
            </Space>
          </Row>
        </Col>
        <Col
          span={14}
          style={{
            height: "93%",
            borderRadius: 5,
          }}
        >
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
}

export default StockControl;

const initialValues = {
  dragger: [],
};
