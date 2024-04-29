import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button, Row, Space, Tooltip, Popover, Form, Drawer } from "antd";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { DownloadOutlined, MessageOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { set } from "lodash";
import { useEffect } from "react";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import Loading from "../../../Components/Loading";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { getVendorOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";

function ViewBranchTransfer() {
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
  const { executeFun, loading: loading1 } = useApi();
  const getcomoponents = async (trans_id) => {
    setLoading("fetch");
    const { data } = await imsAxios.post(
      "/branchTransfer/branchTransferDetails",
      {
        trans_id: trans_id,
      }
    );
    console.log(data);
    let arr = data.data.map((row, index) => ({
      id: index,
      index: index + 1,
      component: row.component,
      part_no: row.part_no,
      qty: row.qty,
      remark: row.comp_remark,
      trans_id: trans_id,
    }));
    setDetailData(arr);
    setShowViewModal(true);
    setLoading(false);
  };

  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          getcomoponents(row.trans_id);
        }}
        label="View and approve"
      />,
    ],
  };

  const statusOptions = [
    { text: "Date Wise", value: "date" },
    { text: "Vendor Wise", value: "vendor" },
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
      console.log(values);
      let fetchdata = "";
      if (values.status === "date") {
        fetchdata = {
          data: values.date,
          type: values.status,
        };
      } else {
        fetchdata = {
          data: values.vendorname.value,
          type: values.status,
        };
      }
      setLoading("rows");
      const response = await imsAxios.post(
        "/branchTransfer/getBranchTransfer",
        fetchdata
      );
      const { data } = response;
      if (data.status === "error") {
        toast.error(data.message);
      } else if (data.status === "success") {
        if (data.code === 200) {
          console.log("coming here");
          console.log(data);
          const arr = data.data.map((row, index) => {
            return {
              key: index,
              id: index,
              index: index + 1,
              trans_id: row.trans_id,
              vendor: row.vendor,
              from_location: row.from_location,
              to_location: row.to_location,
              vendor_code: row.vendor_code,
              vehicle_no: row.vehicle_no,
              narration: row.narration,
            };
          });
          setRows(arr);
        }
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
                      name={"vendorname"}
                      label="Vendor Name"
                      rules={rules.vendorname}
                    >
                      <MyAsyncSelect
                        labelInValue
                        placeholder="Select Vendor Name"
                        optionsState={asyncOptions}
                        onChange={(value) => {
                          qcReportForm.setFieldValue("vendorname", value);
                        }}
                        loadOptions={getVendors}
                      />
                    </Form.Item>
                  </div>
                )}

                <MyButton
                  variant="search"
                  type="primary"
                  loading={loading === "rows"}
                  onClick={getRows}
                  id="submit"
                >
                  Search
                </MyButton>
              </Space>
            </div>
          </Form>
          <Space>
            <Button
              type="primary"
              onClick={() =>
                downloadCSV(
                  rows,
                  status === "R" ? [...columns, extraColumn] : columns,
                  "Branch Transfer Report"
                )
              }
              shape="circle"
              icon={<DownloadOutlined />}
              disabled={rows.length == 0}
            />
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
      <ViewModal
        show={showViewModel}
        setshow={setShowViewModal}
        detaildata={detailData}
        status={status}
        loading={loading}
        setLoading={setLoading}
        component={<Loading />}
      />
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
    headerName: "Vendor Name",
    width: 250,
    field: "vendor",
  },
  {
    headerName: "Transaction Id",
    width: 180,
    field: "trans_id",
  },
  {
    headerName: "Pick Up Location",
    width: 180,
    field: "from_location",
  },
  {
    headerName: "Drop Location",
    width: 180,
    field: "to_location",
  },
  {
    headerName: "Vechile Number",
    flex: 1,
    minWidth: 200,
    field: "vehicle_no",
  },
  {
    headerName: "Description",
    flex: 1,
    minWidth: 200,
    field: "narration",
  },
];

const defaultValues = {
  ppr: "",
  process: "",
  status: "date",
};

const rules = {
  ppr: [{ required: true, message: "Please select Vendor" }],
};

export default ViewBranchTransfer;

const ViewModal = ({
  loading,
  setLoading,
  show,
  setshow,
  detaildata,
  status,
  component,
}) => {
  console.log(detaildata);
  const viewcolumns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
    },
    {
      headerName: "Component",
      width: 180,
      field: "component",
    },
    {
      headerName: "Part Number",
      width: 180,
      field: "part_no",
    },
    {
      headerName: "Quantity",
      width: 180,
      field: "qty",
    },
    {
      headerName: "Remark",
      width: 180,
      field: "remark",
    },
  ];
  const approveTransfer = async () => {
    setLoading("fetch");
    const { data } = await imsAxios.post(
      "/branchTransfer/approveTransferStock",
      {
        trans_id: detaildata[0].trans_id,
      }
    );
    if (data.status === "success") {
      toast.success(data.message);
    } else if (data.status === "error") {
      toast.error(data.message.msg);
    }
    setLoading(false);
    setshow(false);
  };

  return (
    <Drawer
      width="50vw"
      title={`Branch Transfer of ${detaildata.vendor}`}
      onClose={() => {
        setshow(false);
      }}
      extra={
        <Space>
          <Button type="primary" onClick={approveTransfer}>
            Approve
          </Button>
          <Button
            type="primary"
            onClick={() =>
              downloadCSV(detaildata, [...viewcolumns], "Component Report")
            }
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={detaildata?.length == 0}
          />
        </Space>
      }
      open={show}
      bodyStyle={{ paddingTop: 5 }}
    >
      {loading === "fetch" && component}
      <MyDataTable columns={[...viewcolumns]} data={detaildata} />
    </Drawer>
  );
};
