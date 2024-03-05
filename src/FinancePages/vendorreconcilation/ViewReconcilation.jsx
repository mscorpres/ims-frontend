import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button, Modal } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
// import SelectChallanTypeModal from "./components/WoCreateChallan/SelectChallanTypeModal";
// import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
// import { getClientOptions, getWorkOrderAnalysis } from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import { Navigate, useNavigate } from "react-router-dom";
import { getVendorOptions } from "../../api/general";
import { convertSelectOptions } from "../../utils/general";
import useApi from "../../hooks/useApi";

const ViewReconcilation = () => {
  document.title = "View Challan";
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [detaildata, setDetailData] = useState("");
  const [challantype, setchallantype] = useState(challanoptions[0].value);
  const [cancelRemark, setCancelRemark] = useState("");
  const [vendorName, setVendorName] = useState(null);
  const [vendorCode, setVendorCode] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const showSubmitConfirmationModal = (f) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Cancel the Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Input
          onChange={(e) => {
            setCancelRemark(e.target.value);
          }}
          placeholder="please input the cancel Reason"
        />
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await cancelwochallan(f.challanId, f.transactionId);
      },
    });
  };

  const printwoChallan = async (row) => {
    setLoading("fetch");
    const response = await imsAxios.post(
      challantype === "Delivery Challan"
        ? "/wo_challan/printWorkorderDeliveryChallan"
        : "/wo_challan/printWorkorderReturnChallan",
      {
        invoice_id: row.transactionId,
        ref_id: "--",
        challan: row.challanId,
      }
    );
    printFunction(response.data.data.buffer.data);
    setLoading(false);
  };

  const downloadwochallan = async (row) => {
    setLoading("fetch");
    const response = await imsAxios.post(
      challantype === "Delivery Challan"
        ? "/wo_challan/printWorkorderDeliveryChallan"
        : "/wo_challan/printWorkorderReturnChallan",
      {
        invoice_id: row.transactionId,
        ref_id: "--",
        challan: row.challanId,
      }
    );
    downloadFunction(response.data.data.buffer.data);
    setLoading(false);
  };

  const cancelwochallan = async (cid, woid) => {
    try {
      setLoading("select" / "fetch");
      const response = await imsAxios.post(
        challantype === "Delivery Challan"
          ? "wo_challan/woDeliveryChallanCancel"
          : "wo_challan/woReturnChallanCancel",
        {
          wo_id: woid,
          challan_id: cid,
          remark: cancelRemark,
        }
      );
      toast.success(response.data.message);
      // toast.error
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

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
          navigate(`/vendorreco?daterange=${row.daterange}&vcode=${row.vcode}`);
        }}
        label="Continue"
      />,
    ],
  };
  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get(
        `/vendorReconciliation/view/reconciliation?wise=vendorwise&data=${vendorCode}`
      );
      const { data } = response;
      console.log(response.status);
      if (response.status === 200) {
        const arr = data.map((row, index) => ({
          id: index + 1,
          daterange: row.dateRange,
          status: row.status,
          month: row.month,
          vcode: row.vendorCode,
          vname: row.vendorName,
        }));
        setRows(arr);
      } else {
        toast.error(data.message.msg);
        setRows([]);
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      // const arr = await getClientOptions(search);
      // setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getVendorBranchOptions = async (inputValue) => {
    setLoading("fetch");
    setVendorName(inputValue.label);
    setVendorCode(inputValue.value);
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: inputValue.value,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        await getVendorBranchDetails(arr[0].value, inputValue.value);
        // createPoForm.setFieldValue("vendorbranch", arr[0].value);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured while getting vendor branches ");
    }
  };
  const getVendorBranchDetails = async (bcode, vcode) => {
    setLoading("fetch");
    const response = await imsAxios.post("/backend/vendorAddress", {
      vendorcode: vcode,
      branchcode: bcode,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        // createPoForm.setFieldValue(
        //   "vendoraddress",
        //   data.data?.address?.replaceAll("<br>", "\n")
        // );
        // createPoForm.setFieldValue("gstin", data.data?.gstid);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured while getting vendor address ");
    }
  };

  return (
    <div
      style={{
        height: "90%",
        paddingTop: 20,
        paddingRight: 10,
        paddingLeft: 10,
      }}
    >
      <Col span={24}>
        <Row>
          <Col>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <div style={{ width: 200 }}>
                  <MyAsyncSelect
                    onBlur={() => setAsyncOptions([])}
                    // value={searchLedger}
                    selectLoading={selectLoading}
                    placeholder="Enter the Vendor Code or Name..."
                    labelInValue
                    onChange={(value) => getVendorBranchOptions(value)}
                    loadOptions={getVendorOption}
                    optionsState={asyncOptions}
                  />
                </div>

                <Button
                  onClick={getRows}
                  loading={loading === "fetch"}
                  type="primary"
                >
                  Fetch
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Col>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={[actionColumn, ...columns]}
        />
      </div>
    </div>
  );
};

const columns = [
  {
    headerName: "#",
    field: "index",
    width: 30,
  },
  {
    headerName: "Vendor Code",
    field: "vcode",
    width: 150,
  },
  {
    headerName: "Vendor Name",
    field: "vname",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Month",
    field: "month",
    minWidth: 150,
  },
  {
    headerName: "Status",
    field: "status",
    minWidth: 150,
  },
];

const challanoptions = [
  { text: "Delivery Challan", value: "Delivery Challan" },
  { text: "Return Challan", value: "RM Challan" },
];

export default ViewReconcilation;
