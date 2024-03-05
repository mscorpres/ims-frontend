import { useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Row,
  Input,
  Typography,
  Modal,
  Popover,
  Space,
  Switch,
  Card,
  Dropdown,
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { InfoCircleOutlined } from "@ant-design/icons";
import SelectedModal from "./SelectedModal";
import { set } from "lodash";
import { useLayoutEffect } from "react";
import FormTable from "../../../../Components/FormTable";
import MySelect from "../../../../Components/MySelect";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import socket from "../../../../Components/socket";
import confirm from "antd/es/modal/confirm";
import MyDatePicker from "../../../../Components/MyDatePicker";

export default function AccountsPayableReport() {
  const [loading, setLoading] = useState(false);
  const [selectOptions, setSelectOptions] = useState([]);
  const [rows, setRows] = useState(false);
  const [subgroup, setSubgroup] = useState("");
  const [socketValue, setSocketValue] = useState("");
  const [open, setOpen] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState("");
  const options = selectOptions;
  console.log("options", options);
  const fetchReport = async () => {
    setLoading(true);
    setRows([]);
    const response = await imsAxios.get(
      "/tally/ap/fetchSubGroup/sundryCreditor"
    );
    // console.log("response", response);
    if (!response) {
      setLoading(false);
    }
    if (response.status == 200) {
      const { data } = response;
      console.log("data ======", data);
      setSelectOptions(data);

      setLoading(false);
    } else if (response.status == 500) {
      toast.error(response.message.msg);
      setLoading(false);
    }

    setLoading(false);
  };
  const fetchAPData = async (subgroup) => {
    setLoading(true);
    let subgroupValue = subgroup.value;
    const response = await imsAxios.get(
      `/tally/ap/allApData?groupKey=${subgroupValue}`
    );

    let { data } = response;
    if (response.status == 200) {
      let arr = data?.map((row, index) => ({
        ...row,
        id: v4(),
        index: index + 1,
      }));

      setRows(arr);
      setLoading(false);
    } else {
      toast.error(response.message.msg);
      setLoading(false);
    }
  };
  // left vbt columns
  // const columns = [
  //   {
  //     headerName: "#",
  //     field: "index",
  //     // renderCell: ({ row }) => row.index,
  //     width: 30,
  //   },

  //   {
  //     headerName: "Invoice No.",
  //     field: "invoiceNumber",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceNumber} />,
  //     width: 150,
  //   },

  //   {
  //     headerName: "Invoice Date",
  //     field: "invoiceDate",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceDate} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "Effective Date",
  //     field: "effectiveDate",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.effectiveDate} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "PO ID",
  //     field: "poID",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.poID} />,
  //     width: 120,
  //   },
  //   {
  //     headerName: "VBT No.",
  //     field: "vbtKey",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.vbtKey} />,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Vendor Code",
  //     field: "vendorCode",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.vendorCode} />,
  //     width: 120,
  //   },
  //   {
  //     headerName: "Project",
  //     field: "project",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.project} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "Type",
  //     field: "type",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.type} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "Due Date",
  //     field: "dueDate",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.dueDate} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "Invoice Age",
  //     field: "ageInvoiceWise",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.ageInvoiceWise} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "Effective Age",
  //     field: "ageEffectiveWise",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.ageEffectiveWise} />,
  //     width: 100,
  //   },

  //   // {
  //   //   headerName: "O/S Amount / Bill Amount",
  //   //   field: "amount",
  //   //   renderCell: ({ row }) => (
  //   //     <ToolTipEllipses text={row.osAmm + " / " + row.amount} />
  //   //   ),
  //   //   width: 150,
  //   // },
  //   {
  //     headerName: "O/S Amount",
  //     field: "osAmm",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.osAmm} />,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Bill Amount",
  //     field: "amount",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.amount} />,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Settled Amount",
  //     field: "clearAmm",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.clearAmm} />,
  //     width: 120,
  //   },
  //   {
  //     headerName: "Total Bill Amount",
  //     field: "totalBillAmount",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.totalBillAmount} />,
  //     width: 120,
  //   },

  //   {
  //     headerName: "Cost Center",
  //     field: "costCenter",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.costCenter} />,
  //     width: 100,
  //   },
  //   // {
  //   //   headerName: "Age",
  //   //   field: "age",
  //   //   renderCell: ({ row }) => <ToolTipEllipses text={row.age} />,
  //   //   width: 100,
  //   // },
  // ];

  // const handleDownload = () => {
  //   downloadCSV(rows, columns, "AP Report");
  // };
  useEffect(() => {
    fetchReport();
  }, []);

  // const clickedinvoice = document.getElementById("invoice");
  // // const clickedDueDate = document.getElementById("dueDate");
  // console.log("clickedinvoice", clickedinvoice);
  // if (clickedinvoice) {
  //   clickedinvoice.addEventListener("click", () => {
  //     setSocketValue("invoice");
  //     // emitDownloadEvent(socketValue);
  //   });
  // }
  // const clickedDueDate = document.getElementById("dueDate");
  // // const clickedDueDate = document.getElementById("dueDate");
  // console.log("clickedDueDate", clickedDueDate);
  // if (clickedDueDate) {
  //   clickedDueDate.addEventListener("click", () => {
  //     setSocketValue("dueDate");
  //   });
  // }

  const emitDownloadEvent = (value) => {
    let newId = v4();
    // let arr = notifications;
    let groupkey = subgroup.value;
    if (!groupkey) {
      toast.error("Select and Search the Group for Download");
    }
    socket.emit("getAgeingReport", {
      notificationId: newId,
      groupKey: groupkey,
      wise: value,
      date: searchDateRange,
    });
    // socket.emit("socket_receive_notification");
    // if (notificationId) {
    // }
  };
  const InvoiceWise = () => {
    setSocketValue("invoiceWise");
    handleCancel();
    toast.info("Kindly check your mail after sometime.");
  };
  const effectiveWise = () => {
    setSocketValue("effectiveWise");
    handleCancel();
    toast.info("Kindly check your mail after sometime.");
  };
  useEffect(() => {
    if (subgroup) {
      console.log("subgroup", subgroup);
      setSubgroup(subgroup);
    }
  }, [subgroup]);
  const handleCancel = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (socketValue.length > 0) {
      console.log("socketValue", socketValue);
      emitDownloadEvent(socketValue);
    }
  }, [socketValue]);

  return (
    <div style={{ height: "90%", padding: "0px 10px" }}>
      <Row gutter={4} style={{ height: "95%" }} justify="space-between">
        <Col style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Typography.Text style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
            Sundry Creditors:
          </Typography.Text>
          <div style={{ width: 250 }}>
            <MySelect
              options={options}
              labelInValue
              value={subgroup}
              onChange={setSubgroup}
            />
          </div>
          <div style={{ width: 300 }}>
            <MyDatePicker
              size="default"
              setDateRange={setSearchDateRange}
              dateRange={searchDateRange}
              value={searchDateRange}
            />
          </div>
          <Button
            type="primary"
            disabled={!subgroup}
            onClick={() => setOpen(true)}
          >
            Search
          </Button>
        </Col>

        <Col></Col>
        <Col span={24} style={{ height: "100%", paddingTop: 5 }}>
          {/* <MyDataTable data={rows} columns={columns} loading={loading} /> */}
        </Col>
      </Row>
      <Modal
        style={{
          top: "20em",
        }}
        title="Download Ageing Report"
        open={open}
        // onOk={handleOk}
        onCancel={handleCancel}
        okText="Effective Date"
        okCancel="Invoice Date"
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={effectiveWise}
          >
            Effective
          </Button>,
          <Button
            key="link"
            type="primary"
            loading={loading}
            onClick={InvoiceWise}
          >
            Invoice
          </Button>,
        ]}
      >
        <p>Select the filter you want to download the report in.</p>
      </Modal>
    </div>
  );
}
