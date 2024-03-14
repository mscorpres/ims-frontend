import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Upload,
  Row,
  Space,
  Tooltip,
  Popover,
  Form,
  Drawer,
  Input,
  Col,
  Descriptions,
  Modal,
  Collapse,
} from "antd";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import {
  DownloadOutlined,
  MessageOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { set } from "lodash";
import { useEffect } from "react";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import Loading from "../../../Components/Loading";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import NavFooter from "../../../Components/NavFooter";
import useApi from "../../../hooks/useApi";
import { getVendorOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";

function ViewRnC() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState();
  const [loading, setLoading] = useState(false);
  const [processOptions, setProcessOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [showViewModel, setShowViewModal] = useState(false);
  const [detailData, setDetailData] = useState([]);

  const [qcReportForm] = Form.useForm();
  const ppr = Form.useWatch("ppr", qcReportForm);
  const status = Form.useWatch("status", qcReportForm);
  const processName = Form.useWatch("process", qcReportForm);
  const [searchInput, setSearchInput] = useState("");
  const [rowdata, setrowdata] = useState("");
  const [docview, setdocview] = useState(false);
  const [viewdata, setviewdata] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        disabled={loading}
        onClick={() => {
          getagreementdetails(row);
        }}
        label="View"
      />,
      // <GridActionsCellItem
      //   showInMenu
      //   // disabled={loading}
      //   // onClick={() => {
      //   //   getcomoponents(row.trans_id)
      //   // }}
      //   label="Print"
      // />,
      <GridActionsCellItem
        showInMenu
        disabled={loading}
        onClick={() => {
          addendum(row);
        }}
        label="Addendum"
      />,
    ],
  };

  const getagreementdetails = async (row) => {
    console.log(row);
    const response = await imsAxios.get(
      `agreement/download?agreementNumber=${row.agreement_no}`
    );
    console.log(response);
    setviewdata(response.data);
    setdocview(true);
  };

  const addendum = (row) => {
    console.log("addendum", row);
    setrowdata(row);
    setShowViewModal(true);
  };

  const downloadattachment = () => {
    console.log("attachment");
  };

  const statusOptions = [
    { text: "Date Wise", value: "date" },
    { text: "Party Wise", value: "vendor" },
  ];

  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };
  const getPPRDetails = async (ppr) => {
    try {
      setLoading("fetch");
      let sku;
      // getting sku from ppr
      const response = await imsAxios.post("/createqca/fetchPprDetails", {
        ppr_no: ppr,
      });
      const { data } = response;
      if (data) {
        sku = data.data[0].product_sku;
      }

      // getting process list from sku
      const processResponse = await imsAxios.post(
        "/qaProcessmaster/fetchQAProcess",
        {
          sku,
        }
      );
      const { data: processData } = processResponse;
      if (processData) {
        const arr = processData.data.map((row) => ({
          text: row.process.name,
          value: row.process.key,
        }));

        setProcessOptions(arr);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRows = async () => {
    try {
      setRows([]);
      const values = await qcReportForm.validateFields();
      let fetchdata = "";
      if (values.status === "date") {
        fetchdata = {
          data: values.date,
          type: values.status,
        };
      } else {
        fetchdata = {
          partyName: values.partyName,
          type: values.status,
        };
      }
      setLoading("rows");
      const response = await imsAxios.post(
        "agreement/fetchagreement",
        fetchdata
      );
      const { data } = response;
      if (data.status === "error") {
        toast.error(data.message);
      } else if (response.status === 200) {
        const arr = data.data.map((row, index) => {
          return {
            key: index,
            id: index,
            index: index + 1,
            first_party: row.first_party,
            second_party: row.second_party,
            agreement_no: row.stamp_number,
            agreement_type: row.agreement_type,
            effective_date: row.effective_date,
            expiry_date: row.expiry_date,
            date_of_execution: row.execution_date,
            agreement_title: row.agreement_title,
            agreement_desciption: row.agreement_description,
          };
        });
        setRows(arr);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ppr) {
      getPPRDetails(ppr);
    }
  }, [ppr]);
  const extraColumn = {
    headerName: "Fail reason",
    width: 350,
    field: "failReason",
    renderCell: ({ row }) => <ToolTipEllipses text={row.failReason} />,
  };
  return (
    <>
      <div style={{ height: "90%", marginTop: 10 }}>
        <Row
          justify="space-between"
          style={{ padding: "0px 10px", marginBottom: -15 }}
        >
          {loading === "fetch" && <Loading />}
          <Form
            form={qcReportForm}
            layout="vertical"
            initialValues={defaultValues}
          >
            <div>
              <Space>
                <div style={{ width: 200 }}>
                  <Form.Item name="status" label="Status">
                    <MySelect options={statusOptions} />
                  </Form.Item>
                </div>
                {status === "date" ? (
                  <div style={{ width: 240 }}>
                    <Form.Item name="date" label="Date" rules={rules.date}>
                      <MyDatePicker
                        setDateRange={(value) =>
                          qcReportForm.setFieldValue("date", value)
                        }
                      />
                    </Form.Item>
                  </div>
                ) : (
                  <div style={{ width: 240 }}>
                    <Form.Item
                      name={"partyName"}
                      label="Party Name"
                      rules={rules.vendorname}
                    >
                      <Input placeholder="Enter Party Name" />
                      {/* <MyAsyncSelect
                               labelInValue
                                placeholder="Select party Name"
                                optionsState={asyncOptions}
                                onChange={(value) => {
                                  qcReportForm.setFieldValue(
                                    "vendorname",
                                    value
                                  );
                                }}
                                loadOptions={getVendors}
                              /> */}
                    </Form.Item>
                  </div>
                )}

                <Button
                  type="primary"
                  loading={loading === "rows"}
                  onClick={getRows}
                  id="submit"
                >
                  Search
                </Button>
              </Space>
            </div>
          </Form>
          <Space>
            {/* <Button
              type="primary"
              onClick={() =>
                downloadCSV(
                  rows,
                  status === "R" ? [...columns, extraColumn] : columns,
                  "Final QC Report"
                )
              }
              shape="circle"
              icon={<DownloadOutlined />}
              disabled={rows.length == 0}
            /> */}
          </Space>
        </Row>
        <div style={{ height: "93%", padding: "0px 10px" }}>
          <MyDataTable
            columns={[actionColumn, ...columns]}
            data={rows}
            loading={searchLoading}
          />
        </div>
      </div>
      <AddAddendumModal
        show={showViewModel}
        setshow={setShowViewModal}
        detaildata={rowdata}
        status={status}
        loading={loading}
        setLoading={setLoading}
        component={<Loading />}
      />
      <ViewModal show={docview} setshow={setdocview} viewdata={viewdata} />
    </>
  );
}
const columns = [
  {
    headerName: "#",
    width: 50,
    field: "index",
  },
  {
    headerName: "First Party",
    width: 180,
    field: "first_party",
  },
  {
    headerName: "Second Party",
    width: 180,
    field: "second_party",
  },
  {
    headerName: "Agreement Number",
    width: 180,
    field: "agreement_no",
  },
  {
    headerName: "Agreement Title",
    width: 180,
    field: "agreement_title",
  },
  {
    headerName: "Agreeement Type",
    width: 180,
    field: "agreement_type",
  },
  {
    headerName: "Effective Date",
    width: 180,
    field: "effective_date",
  },
  {
    headerName: "Expiry Date",
    width: 180,
    field: "expiry_date",
  },
  {
    headerName: "Date of Execution",
    width: 180,
    field: "date_of_execution",
  },
  {
    headerName: "Agreement Description",
    width: 180,
    field: "agreement_desciption",
  },
];

const defaultValues = {
  ppr: "",
  process: "",
  status: "date",
};

const rules = {
  ppr: [{ required: true, message: "Please select party" }],
};

export default ViewRnC;

const AddAddendumModal = ({
  loading,
  setLoading,
  show,
  setshow,
  detaildata,
  status,
  component,
}) => {
  const [addaddendumform] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [dateType, setDateType] = useState("");
  const options = [
    {
      text: "Date",
      value: "date",
    },
    {
      text: "On termination",
      value: "onTermination",
    },
  ];

  useEffect(() => {
    addaddendumform.setFieldValue(
      "previousstampnumber",
      detaildata?.agreement_no
    );
  }, [detaildata]);

  const props = {
    onRemove: (file) => {
      setFileList(fileList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      console.log(fileList);
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const onOk = async () => {
    setLoading("fetch");
    const values = await addaddendumform.validateFields();
    console.log(values);
    const formdata = new FormData();
    console.log(fileList);
    fileList.forEach((file) => {
      formdata.append("file", file);
    });
    formdata.append("stamp_number", values.stampnumber);
    formdata.append("ref_id", values.previousstampnumber);
    formdata.append("execution_date", values.executiondate);
    formdata.append("effective_date", values.effectivedate);
    formdata.append("renewal_date", values.renewaldate);
    if (values.selectType === "date") {
      formdata.append("expiry_date", values.expirydate);
    } else {
      formdata.append("expiry_date", "onTermination");
    }
    formdata.append("addendum_title", values.addendumTitle);
    formdata.append("addendum_description", values.addendumDes);

    const response = await imsAxios.post("agreement/addaddendum", formdata);
    addaddendumform.resetFields();
    setFileList([]);
    toast.success(response.data.msg);
    setshow(false);
    setLoading(false);
  };

  return (
    <>
      <Drawer
        title={`Add Addendum`}
        placement="right"
        open={show}
        onClose={() => setshow(false)}
        width={"40%"}
        extra={
          <Space>
            <Button onClick={() => setshow(false)}>Cancel</Button>
            <Button type="primary" onClick={onOk}>
              OK
            </Button>
          </Space>
        }
      >
        {loading === "fetch" && <Loading />}
        <Form form={addaddendumform} layout="vertical">
          <Row gutter={[4, 2]}>
            <Col span={16}>
              <Form.Item
                name={"addendumTitle"}
                label="Addendum Title"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Addendum Title!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name={"previousstampnumber"}
                label="Parent Stamp Number"
                rules={[
                  {
                    required: true,
                    message: "Please Enter a Stamp Number!",
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name={"stampnumber"}
                label="Stamp Number"
                rules={[
                  {
                    required: true,
                    message: "Please Enter a Stamp Number!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name={"addendumDes"}
                label="Addendum Description"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Addendum Description!",
                  },
                ]}
              >
                <Input.TextArea row={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            {/* terms and conditions */}
            <Col span={8}>
              <Form.Item
                name="effectivedate"
                label="Effective Date"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Effective Date!",
                  },
                ]}
              >
                <SingleDatePicker
                  legal={true}
                  setDate={(value) => {
                    addaddendumform.setFieldValue("effectivedate", value);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="selectType"
                label="Expiry"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please Enter Expiry Date!",
                //   },
                // ]}
              >
                <MySelect
                  options={options}
                  onChange={setDateType}
                  value={dateType}
                />
              </Form.Item>
            </Col>
            {dateType === "date" ? (
              <Col span={12}>
                <Form.Item
                  name="expirydate"
                  label="Expiry Date"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Expiry Date!",
                    },
                  ]}
                >
                  <SingleDatePicker
                    legal={true}
                    setDate={(value) => {
                      addaddendumform.setFieldValue("expirydate", value);
                    }}
                  />
                </Form.Item>
              </Col>
            ) : (
              ""
            )}
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="executiondate"
                label="Execution Date"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Execution Date!",
                  },
                ]}
              >
                <SingleDatePicker
                  legal={true}
                  setDate={(value) => {
                    addaddendumform.setFieldValue("executiondate", value);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="renewaldate"
                label="Renewal Date"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Effective Date!",
                  },
                ]}
              >
                <SingleDatePicker
                  legal={true}
                  setDate={(value) => {
                    addaddendumform.setFieldValue("renewaldate", value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Col span={16}>
            <Row gutter={6}>
              {/* pan number */}
              <Col span={8}>
                <Form.Item
                  name="file"
                  label="Select File"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Document!",
                    },
                  ]}
                >
                  <Upload {...props}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Form>
      </Drawer>
    </>
  );
};
const handleDownloadClick = (row) => {
  // Create a dynamic link
  const path = JSON.parse(row.path);
  const link = document.createElement("a");
  link.href = imsAxios.defaults.baseURL + path.doc_path; // Set the download link
  link.download = row.stampNumber; // Set the filename for download
  link.target = "_blank"; // Open the link in a new tab
  document.body.appendChild(link);
  // Trigger the click event
  link.click();
  // Remove the link from the document
  document.body.removeChild(link);
};

const agreementcolumn = [
  {
    headerName: "#",
    width: 50,
    field: "index",
  },
  {
    headerName: "Stamp Number",
    flex: 1,
    field: "stampNumber",
  },
  {
    headerName: "Action",
    flex: 1,
    renderCell: ({ row }) => {
      return (
        <>
          <Tooltip title="Download">
            <DownloadOutlined
              onClick={() => {
                handleDownloadClick(row);
              }}
              style={{ marginLeft: "10px", height: "20px" }}
            />
          </Tooltip>
        </>
      );
    },
  },
];
const addendumcolumn = [
  {
    headerName: "#",
    width: 50,
    field: "index",
  },
  {
    headerName: "Stamp Number",
    width: 180,
    field: "stampNumber",
  },
  {
    headerName: "Action",
    flex: 1,
    renderCell: ({ row }) => {
      return (
        <>
          <Tooltip title="Download">
            <DownloadOutlined
              onClick={() => {
                handleDownloadClick(row);
              }}
              style={{ marginLeft: "10px", height: "20px" }}
            />
          </Tooltip>
        </>
      );
    },
  },
  {
    headerName: "Addendum Title",
    flex: 50,
    field: "addendumTitle",
  },
];

const ViewModal = ({ show, setshow, viewdata }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const keys = Object.keys(viewdata);
    console.log(keys);
    let arr = keys.map((elem) => {
      const column = elem === "Addendum" ? addendumcolumn : agreementcolumn;
      const data = viewdata[elem].map((elem, index) => {
        return {
          id: v4(),
          index: index + 1,
          stampNumber: elem.stampNo,
          path: elem.docPath,
          addendumTitle: elem.addendumTitle,
        };
      });
      console.log(data);
      return {
        key: v4(),
        label: elem.toUpperCase(),
        children: (
          <div style={{ height: "350px" }}>
            <MyDataTable columns={column} data={data} />
          </div>
        ),
      };
    });
    setItems(arr);
  }, [viewdata]);

  return (
    <>
      <Modal
        title="Agreement Details"
        open={show}
        onOk={() => setshow(false)}
        onCancel={() => setshow(false)}
      >
        <Collapse items={items} />
      </Modal>
    </>
  );
};
