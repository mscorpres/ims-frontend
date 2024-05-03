import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Popconfirm,
  Row,
  Space,
  Typography,
} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import VerifiedFilePreview from "../../Master/reports/R19/VerifiedFilePreview";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDatePicker from "../../../Components/MyDatePicker";
import { v4 } from "uuid";
import socket from "../../../Components/socket";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general.ts";
import MyButton from "../../../Components/MyButton";
const WeeklyAudit = () => {
  const [rows, setRows] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [verifiedFile, setVerifiedFile] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [addSingleComponentForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();

  const columns = [
    { headerName: "Sr. No.", width: 80, field: "id" },
    { headerName: "Part Code", width: 120, field: "part_code" },
    { headerName: "Part Name", width: 120, field: "part_name", flex: 1 },
    {
      headerName: "Actions",
      type: "actions",
      width: 120,
      getActions: ({ row }) => [
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to delete this component"
          onConfirm={() => deleteComponent(row.part_code)}
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

  const handlesingleComponent = async () => {
    try {
      setFetchLoading(true);
      const { data } = await imsAxios.post("/monthAudit/addPart", {
        component: searchInput,
      });
      if (data.code === 200) {
        toast.success(data.message);
        setSearchInput("");
        getRows();
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const getCompOptions = async (search) => {
    try {
      // setLoading("select");
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: search,
      // });
      const response = await executeFun(
        () => getComponentOptions(search),
        "select"
      );
      const { data } = response;
      if (data && data?.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const verifyFile = async () => {
    const formData = new FormData();
    formData.append("file", uploadingFile);
    setLoading("1");
    const response = await imsAxios.post("/monthAudit/uploadExcel", formData);
    setLoading(false);
    if (response.data.code == 200) {
      //   let arr = data.data.data.map((row, index) => ({ ...row, id: index + 1 }));
      //   setVerifiedFile(arr);

      toast.success(response.data.message);
      getRows();
    } else {
      toast.error(response.message.msg);
    }
  };

  const props = {
    name: "file",
    showUploadList: false,
    multiple: true,
    beforeUpload(file) {
      setUploadingFile(file);
      return false;
    },
  };

  const getRows = async () => {
    setFetchLoading(true);
    const { data } = await imsAxios.get("/monthAudit/getPartList");
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
  const downloadFun = () => {
    let newId = v4();
    let obj = {
      notificationId: newId,
      otherdata: { date: dateRange },
    };
    toast.success("Request Sent...");
    socket.emit("monthly_audit", obj);
  };

  useEffect(() => {
    getRows();
  }, []);

  const deleteComponent = async (id) => {
    const response = await imsAxios.post("/monthAudit/removePart", {
      part_code: id,
    });
    if (response.data.code === 200) {
      getRows();
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message.msg);
    }
  };

  return (
    <>
      <Row gutter={6} style={{ padding: 10, height: "90%" }}>
        <VerifiedFilePreview
          verifiedFile={verifiedFile}
          setVerifiedFile={setVerifiedFile}
          // submitHandler={submitHandler}
          loading={loading}
        />
        <Col span={6}>
          <Row gutter={[0, 6]} justify="end">
            <Col span={24}>
              <Card title="Select Date">
                <SingleDatePicker
                  setDate={setDateRange}
                  placeholder="Select Date.."
                  selectedDate={dateRange}
                  value={dateRange}
                />
                <Button style={{ marginTop: "1rem" }} onClick={downloadFun}>
                  Generate
                </Button>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Add Single Component">
                <MyAsyncSelect
                  selectLoading={loading1("select")}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  onChange={setSearchInput}
                  loadOptions={getCompOptions}
                />
                <Button
                  style={{ marginTop: "1rem" }}
                  onClick={handlesingleComponent}
                >
                  Submit
                </Button>
              </Card>
            </Col>
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
                <Button
                  href="https://media.mscorpres.net/oakterIms/other/MonthlyAudit.xlsx
                "
                  type="link"
                >
                  Download Sample File
                </Button>
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
          </Row>
        </Col>
        <Col span={18} style={{ height: "100%" }}>
          <MyDataTable loading={fetchLoading} rows={rows} columns={columns} />
        </Col>
      </Row>
    </>
  );
};

export default WeeklyAudit;
