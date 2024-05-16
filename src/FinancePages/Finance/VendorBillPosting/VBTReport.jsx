import React, { useState, useEffect } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import ViewVBTReport from "./ViewVBTReport";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { Button, Col, Input, Modal, Popconfirm, Row, Space } from "antd";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";

import EditVBT1 from "./VBT1/EditVBT1";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { useNavigate, Link } from "react-router-dom";
// import EditVBTReport from "./EditVbtRecord/EditVBTReport";
import { CheckOutlined } from "@ant-design/icons";
import DeleteVbt from "./DeleteVbt";
import CreateDebitNote from "../DebitNote/Create";
import VBT01Report from "./FormVBT/VBT01/VBT01Report";
import VBT02Report from "./FormVBT/VBTtype2/VBT02Report";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";

export default function VBTReport() {
  const [searchInput, setSearchInput] = useState("MIN/24-25/");

  const [wise, setWise] = useState("minwise");
  const [vbtOption, setVbtOption] = useState("ALL");
  const [selectLoading, setSelectLoading] = useState(false);
  const [viewReportData, setViewReportData] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingVBT, setEditingVBT] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editVbtDrawer, setEditVbtDrawer] = useState(false);
  const [debitNotevbtCodes, setDebitNoteSetVBTCodes] = useState(null);
  const [creatingDebitNote, setCreatingDebitNotes] = useState(false);
  const [openModal, setOpenModal] = useState(null);
  const [debitNoteDrawer, setDebitNoteDrawer] = useState(null);
  const [editvbturl, setEditVbtUrl] = useState("");
  const { executeFun, loading: loading1 } = useApi();

  const navigate = useNavigate();
  const getApiUrl = (editVbtDrawer) => {
    // console.log("vbtCode", vbtCode.split("/")[0].toLowerCase());
    return editVbtDrawer.split("/")[0].toLowerCase();
  };

  useEffect(() => {
    if (editVbtDrawer) {
      var checkapi = getApiUrl(editVbtDrawer);
      setEditVbtUrl(checkapi);
      console.log("editVbtDrawer------", checkapi);
    }
  }, [editVbtDrawer]);

  const wiseOptions = [
    { value: "datewise", text: "Date Wise" },
    { value: "minwise", text: "MIN Wise" },
    { value: "vendorwise", text: "Vendor Wise" },
    { value: "vbtwise", text: "VBT Code Wise" },
    { value: "effectivewise", text: "Effective Date Wise" },
  ];
  const vbtTypeOptions = [
    { text: "All", value: "ALL" },
    { text: "VBT1", value: "VBT01" },
    { text: "VBT2", value: "VBT02" },
    { text: "VBT3", value: "VBT03" },
    { text: "VBT4", value: "VBT04" },
    { text: "VBT5", value: "VBT05" },
    { text: "VBT6", value: "VBT06" },
    { text: "VBT7", value: "VBT07" },
  ];

  const printFun = async (vbtId) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/vbt_report/print_vbt_report", {
      vbt_key: vbtId,
    });
    printFunction(data.buffer.data);
    setLoading(false);
  };
  const handleDownload = async (id) => {
    setLoading(true);
    let link = "/tally/vbt_report/print_vbt_report";
    let filename = id;

    const { data } = await imsAxios.post(link, {
      vbt_key: id,
    });

    downloadFunction(data.buffer.data, filename);
    setLoading(false);
  };
  const deleteFun = async () => {
    const { data } = await imsAxios.post("/tally/vbt01/vbt_delete", {
      vbt_code: deleteConfirm,
    });
    if (data.code == 200) {
      toast.success(data.message);
      getSearchResults();
    }
  };
  const getEditVBTDetails = async (code) => {
    setLoading(true);

    const { data } = await imsAxios.post("/tally/vbt01/vbt_edit", {
      vbt_code: code,
    });
    setLoading(false);
    if (data.code == 200) {
      setEditingVBT(data.message);
    } else {
      toast.error(data.message.msg);
    }
  };
  const setDebitNoteVbtCodesHandler = async (singleRowArr) => {
    let arr = [];
    selectedRows.map((row) => {
      let matched = rows.filter((r) => r.id === row)[0];
      if (matched) {
        arr.push(matched.vbt_code);
      }
    });
    setDebitNoteDrawer(arr);
  };
  const callModal = (vbtCode) => {
    setOpenModal(true);
  };
  const confirmDelete = () => {};

  const handleVerify = async (row) => {
    Modal.confirm({
      title: `Are you sure you want to verify ${row?.vbt_code}?`,
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitVerifyHandler(row);
      },
      onCancel() {
        submitUnVerifyHandler(row);
      },
      okText: "Yes",
      cancelText: "No",
    });
  };
  const submitVerifyHandler = async (row) => {
    let vbtKey = row.vbt_code;
    let id = row.ID;
    const response = await imsAxios.patch("/tally/vbt/verify", {
      ID: id,
      vbtKey: vbtKey,
      verificationStatus: "true",
    });
    if (response.status === 200) {
      getSearchResults();
    }
  };
  const submitUnVerifyHandler = async (row) => {
    let vbtKey = row.vbt_code;
    let id = row.ID;
    const response = await imsAxios.patch("/tally/vbt/verify", {
      ID: id,
      vbtKey: vbtKey,
      verificationStatus: "false",
    });
    if (response.status === 200) {
      getSearchResults();
    }
  };

  const columns = [
    {
      headerName: "",
      field: "actions",
      width: 10,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          disabled={loading}
          onClick={() => {
            setViewReportData(row.vbt_code);
          }}
          label="View"
        />,
        <GridActionsCellItem
          showInMenu
          disabled={row.vbt_code.split("/")[0] == "VBT03"}
          onClick={() => {
            setEditVbtDrawer(row.vbt_code);
          }}
          label="Edit"
        />,
        <GridActionsCellItem
          showInMenu
          disabled={loading}
          onClick={() => {
            setOpenModal(row);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
          showInMenu
          disabled={loading}
          onClick={() => printFun(row.vbt_code)}
          label="Print"
        />,
        <GridActionsCellItem
          showInMenu
          disabled={loading}
          onClick={() => {
            handleDownload(row.vbt_code);
          }}
          label="Download"
        />,

        // <GridActionsCellItem
        //   showInMenu
        //   disabled={loading}
        //   // icon={<CloudDownloadOutlined className="view-icon" />}
        //   onClick={() => {
        //     setDebitNoteVbtCodesHandler([row]);
        //   }}
        //   label="Create Debit Note"
        // />,
        <GridActionsCellItem
          showInMenu
          disabled={loading}
          onClick={() => {
            setDebitNoteDrawer(row);
          }}
          label="Create Debit Note"

          // label={
          //   <Link
          //     style={{
          //       color: "black",
          //       textDecoration: "none",
          //     }}
          //     to="/tally/debit-note/vbt/create"
          //     state={{ vbtCodes: [row.vbt_code] ?? "blank code" }}
          //   >
          //
          //   </Link>
          // }
        />,
        // <GridActionsCellItem
        //   showInMenu
        //   disabled={loading}
        //   // icon={<CloudDownloadOutlined className="view-icon" />}
        //   onClick={() => {
        //     handleVerify(row);
        //   }}
        //   label="Verify"
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   disabled={loading}
        //   label={
        //     <Space>
        //       <Popconfirm
        //         title={`Are you sure to pass Sample ${row.vbt_code}?`}
        //         okText="Yes"
        //         // loading={submitLoading === row.id}
        //         cancelText="No"
        //       >
        //         Delete
        //       </Popconfirm>
        //     </Space>
        //   }
        // />,
      ],
    },
    {
      headerName: "VBT Code",
      field: "vbt_code",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.vbt_code} />
      ),
      width: 150,
    },
    {
      headerName: "MIN ID",
      field: "min_id",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.min_id} />
      ),
    },
    {
      headerName: "Due Date",
      field: "due_dt",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.due_dt} />
      ),
    },
    {
      headerName: "Days(Age)",
      field: "days",
      width: 100,
      renderCell: ({ row }) => <ToolTipEllipses copy={true} text={row.days} />,
    },
    {
      headerName: "Project",
      field: "project_name",
      renderCell: ({ row }) => (
        <ToolTipEllipses
          copy={row.project_name?.length >= 0}
          text={row.project_name}
        />
      ),
      width: 150,
    },
    {
      headerName: "PO ID",
      field: "po_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={row.po_id?.length >= 0} text={row.po_id} />
      ),
      width: 150,
    },
    {
      headerName: "Effective Date",
      field: "eff_date",
      width: 150,
    },
    {
      headerName: "VBT Status",
      field: "status",
      renderCell: ({ row }) => (
        <span style={{ color: row.status == "Deleted" && "red" }}>
          {row.status}
        </span>
      ),
      width: 100,
    },
    {
      headerName: "VBT Type",
      field: "type",
      width: 80,
    },
    {
      headerName: "Invoice Date",
      field: "invoice_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_dt} />,
      width: 100,
    },
    {
      headerName: "Invoice No.",
      field: "invoice_no",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_no} />,
      width: 100,
    },
    {
      headerName: "Vendor Name",
      field: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
      width: 150,
    },
    {
      headerName: "Vendor Code",
      field: "ven_code",
      width: 100,
    },
    // {
    //   headerName: "Vendor Address",
    //   field: "ven_address",
    //   renderCell: ({ row }) => (
    //     <Tooltip title={row.ven_address}>
    //       <span>{row.ven_address}</span>
    //     </Tooltip>
    //   ),
    //   width: 120,
    // },
    {
      headerName: "Item Name",
      field: "part",
      renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
      width: 120,
    },
    {
      headerName: "Part Code",
      field: "part_code",
      width: 100,
    },
    {
      headerName: "Actual Quantity",
      field: "act_qty",
      width: 100,
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 80,
    },
    {
      headerName: "Taxable Value",
      renderCell: ({ row }) => <ToolTipEllipses text={row.taxable_value} />,
      field: "taxable_value",
      width: 100,
    },
    {
      headerName: "CGST",
      field: "cgst",
      width: 80,
    },
    {
      headerName: "SGST",
      field: "sgst",
      width: 80,
    },
    {
      headerName: "IGST",
      field: "igst",
      width: 80,
    },
    {
      headerName: "TDS",
      field: "tds_amm",
      width: 100,
    },
    {
      headerName: "Custom",
      field: "custum",
      width: 80,
    },
    {
      headerName: "Freight",
      field: "freight",
      width: 80,
    },
    {
      headerName: "Ven. Bill Amount",
      field: "ven_bill_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ven_bill_amm} />,
      width: 100,
    },
    {
      headerName: "Purchase GL",
      field: "vbt_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vbt_gl} />,
      width: 120,
    },
    {
      headerName: "CGST GL",
      field: "cgst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cgst_gl} />,
      width: 120,
    },
    {
      headerName: "SGST GL",
      field: "sgst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.sgst_gl} />,
      width: 120,
    },
    {
      headerName: "IGST GL",
      field: "igst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.igst_gl} />,
      width: 120,
    },
    {
      headerName: "TDS GL",
      field: "tds_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.tds_gl} />,
      width: 180,
    },

    {
      headerName: "Inserted At",
      field: "insertedAt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.insertedAt} />,
      width: 180,
    },
    {
      headerName: "Inserted By",
      field: "insertBy",

      renderCell: ({ row }) => <ToolTipEllipses text={row.insertBy} />,
      width: 180,
    },
    {
      headerName: "Updated At",
      field: "updatedAt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.updatedAt} />,
      width: 180,
    },
    {
      headerName: "Updated By",
      field: "updatedBy",
      renderCell: ({ row }) => <ToolTipEllipses text={row.updatedBy} />,
      width: 180,
    },
    {
      headerName: "Verified",
      field: "isVerified",
      width: 180,
      renderCell: ({ row }) => (
        <span style={{ color: row.isVerified == "false" ? "red" : "green" }}>
          {row.isVerified === "true" ? "True" : "False"}
        </span>
      ),
    },
    {
      headerName: "Verified At",
      field: "verifiedAt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.verifiedAt} />,
      width: 180,
    },
    {
      headerName: "Verified By",
      field: "verifiedBy",
      renderCell: ({ row }) => <ToolTipEllipses text={row.verifiedBy} />,
      width: 180,
    },
  ];
  const downloadcolumns = [
    // {
    //   headerName: "",
    //   field: "actions",
    //   width: 10,
    //   type: "actions",
    //   getActions: ({ row }) => [
    //     <GridActionsCellItem
    //       showInMenu
    //       disabled={loading}
    //       onClick={() => {
    //         setViewReportData(row.vbt_code);
    //       }}
    //       label="View"
    //     />,
    //     <GridActionsCellItem
    //       showInMenu
    //       disabled={loading}
    //       onClick={() => {
    //         setEditVbtDrawer(row.vbt_code);
    //       }}
    //       label="Edit"
    //     />,
    //     <GridActionsCellItem
    //       showInMenu
    //       disabled={loading}
    //       onClick={() => {
    //         setOpenModal(row);
    //       }}
    //       label="Delete"
    //     />,
    //     <GridActionsCellItem
    //       showInMenu
    //       disabled={loading}
    //       onClick={() => printFun(row.vbt_code)}
    //       label="Print"
    //     />,
    //     <GridActionsCellItem
    //       showInMenu
    //       disabled={loading}
    //       onClick={() => {
    //         handleDownload(row.vbt_code);
    //       }}
    //       label="Download"
    //     />,

    //     // <GridActionsCellItem
    //     //   showInMenu
    //     //   disabled={loading}
    //     //   // icon={<CloudDownloadOutlined className="view-icon" />}
    //     //   onClick={() => {
    //     //     setDebitNoteVbtCodesHandler([row]);
    //     //   }}
    //     //   label="Create Debit Note"
    //     // />,
    //     <GridActionsCellItem
    //       showInMenu
    //       disabled={loading}
    //       onClick={() => {
    //         setDebitNoteDrawer(row);
    //       }}
    //       label="Create Debit Note"

    //       // label={
    //       //   <Link
    //       //     style={{
    //       //       color: "black",
    //       //       textDecoration: "none",
    //       //     }}
    //       //     to="/tally/debit-note/vbt/create"
    //       //     state={{ vbtCodes: [row.vbt_code] ?? "blank code" }}
    //       //   >
    //       //
    //       //   </Link>
    //       // }
    //     />,
    //     // <GridActionsCellItem
    //     //   showInMenu
    //     //   disabled={loading}
    //     //   // icon={<CloudDownloadOutlined className="view-icon" />}
    //     //   onClick={() => {
    //     //     handleVerify(row);
    //     //   }}
    //     //   label="Verify"
    //     // />,
    //     // <GridActionsCellItem
    //     //   showInMenu
    //     //   disabled={loading}
    //     //   label={
    //     //     <Space>
    //     //       <Popconfirm
    //     //         title={`Are you sure to pass Sample ${row.vbt_code}?`}
    //     //         okText="Yes"
    //     //         // loading={submitLoading === row.id}
    //     //         cancelText="No"
    //     //       >
    //     //         Delete
    //     //       </Popconfirm>
    //     //     </Space>
    //     //   }
    //     // />,
    //   ],
    // },
    {
      headerName: "VBT Code",
      field: "vbt_code",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.vbt_code} />
      ),
      width: 150,
    },
    {
      headerName: "MIN ID",
      field: "min_id",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.min_id} />
      ),
    },
    {
      headerName: "Due Date",
      field: "due_dt",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.due_dt} />
      ),
    },
    {
      headerName: "Days(Age)",
      field: "days",
      width: 100,
      renderCell: ({ row }) => <ToolTipEllipses copy={true} text={row.days} />,
    },
    {
      headerName: "Project",
      field: "project_name",
      renderCell: ({ row }) => (
        <ToolTipEllipses
          copy={row.project_name?.length >= 0}
          text={row.project_name}
        />
      ),
      width: 150,
    },
    {
      headerName: "PO ID",
      field: "po_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={row.po_id?.length >= 0} text={row.po_id} />
      ),
      width: 150,
    },
    {
      headerName: "Effective Date",
      field: "eff_date",
      width: 150,
    },
    {
      headerName: "VBT Status",
      field: "status",
      renderCell: ({ row }) => (
        <span style={{ color: row.status == "Deleted" && "red" }}>
          {row.status}
        </span>
      ),
      width: 100,
    },
    {
      headerName: "VBT Type",
      field: "type",
      width: 80,
    },
    {
      headerName: "Invoice Date",
      field: "invoice_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_dt} />,
      width: 100,
    },
    {
      headerName: "Invoice No.",
      field: "invoice_no",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_no} />,
      width: 100,
    },
    {
      headerName: "Vendor Name",
      field: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
      width: 150,
    },
    {
      headerName: "Vendor Code",
      field: "ven_code",
      width: 100,
    },
    // {
    //   headerName: "Vendor Address",
    //   field: "ven_address",
    //   renderCell: ({ row }) => (
    //     <Tooltip title={row.ven_address}>
    //       <span>{row.ven_address}</span>
    //     </Tooltip>
    //   ),
    //   width: 120,
    // },
    {
      headerName: "Item Name",
      field: "part",
      renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
      width: 120,
    },
    {
      headerName: "Part Code",
      field: "part_code",
      width: 100,
    },
    {
      headerName: "Actual Quantity",
      field: "act_qty",
      width: 100,
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 80,
    },
    {
      headerName: "Taxable Value",
      renderCell: ({ row }) => <ToolTipEllipses text={row.taxable_value} />,
      field: "taxable_value",
      width: 100,
    },
    {
      headerName: "CGST",
      field: "cgst",
      width: 80,
    },
    {
      headerName: "SGST",
      field: "sgst",
      width: 80,
    },
    {
      headerName: "IGST",
      field: "igst",
      width: 80,
    },
    {
      headerName: "TDS",
      field: "tds_amm",
      width: 100,
    },
    {
      headerName: "Custom",
      field: "custum",
      width: 80,
    },
    {
      headerName: "Freight",
      field: "freight",
      width: 80,
    },
    {
      headerName: "Ven. Bill Amount",
      field: "ven_bill_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ven_bill_amm} />,
      width: 100,
    },
    {
      headerName: "Purchase GL",
      field: "vbt_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vbt_gl} />,
      width: 120,
    },
    {
      headerName: "CGST GL",
      field: "cgst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cgst_gl} />,
      width: 120,
    },
    {
      headerName: "SGST GL",
      field: "sgst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.sgst_gl} />,
      width: 120,
    },
    {
      headerName: "IGST GL",
      field: "igst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.igst_gl} />,
      width: 120,
    },
    {
      headerName: "TDS GL",
      field: "tds_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.tds_gl} />,
      width: 180,
    },

    {
      headerName: "Inserted At",
      field: "insertedAt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.insertedAt} />,
      width: 180,
    },
    {
      headerName: "Inserted By",
      field: "insertBy",

      renderCell: ({ row }) => <ToolTipEllipses text={row.insertBy} />,
      width: 180,
    },
    {
      headerName: "Updated At",
      field: "updatedAt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.updatedAt} />,
      width: 180,
    },
    {
      headerName: "Updated By",
      field: "updatedBy",
      renderCell: ({ row }) => <ToolTipEllipses text={row.updatedBy} />,
      width: 180,
    },
    {
      headerName: "Verified",
      field: "isVerified",
      width: 180,
      renderCell: ({ row }) => (
        <span style={{ color: row.isVerified == "false" ? "red" : "green" }}>
          {row.isVerified === "true" ? "True" : "False"}
        </span>
      ),
    },
    {
      headerName: "Verified At",
      field: "verifiedAt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.verifiedAt} />,
      width: 180,
    },
    {
      headerName: "Verified By",
      field: "verifiedBy",
      renderCell: ({ row }) => <ToolTipEllipses text={row.verifiedBy} />,
      width: 180,
    },
  ];
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  //getting rows from database from all 3 filter po wise, data wise, vendor wise
  const getSearchResults = async () => {
    setRows([]);
    setLoading(true);
    let search;
    if (wise === "datewise" || wise === "effectivewise") {
      search = searchDateRange;
    } else {
      search = null;
    }
    if (searchInput || search) {
      setLoading(true);
      const { data } = await imsAxios.post("/tally/vbt_report/vbt_report", {
        data:
          wise == "vendorwise"
            ? searchInput
            : wise == "minwise"
            ? searchInput.trim()
            : wise == "vbtwise"
            ? searchInput.trim()
            : wise == "datewise"
            ? searchDateRange
            : wise == "effectivewise" && searchDateRange,
        wise: wise,
        vbt_type: vbtOption,
      });
      setLoading(false);
      if (data.code == 200) {
        const arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
            index: data.data.indexOf(row) + 1,
            status: row.status == "D" ? "Deleted" : "--",
            taxableValue: row.vbp_inqty * row.vbp_inrate,
          };
        });

        setRows(arr);
      } else {
        if (data.message.msg) {
          toast.error(data.message.msg);
        } else if (data.message) {
          toast.error(data.message.msg);
        } else {
          toast.error("Something wrong happened");
        }
      }
    } else {
      if (wise == "datewise" && searchDateRange == null) {
        toast.error("Please select start and end dates for the results");
      } else if (wise == "powise") {
        toast.error("Please enter a PO id");
      } else if (wise == "vendorwise") {
        toast.error("Please select a vendor");
      }
    }
  };

  const getVBTDetails = async (vbtId) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/vbt_report/vbt_report_data", {
      vbt_key: vbtId,
    });
    setLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
          vbt_code: vbtId,
        };
      });
      setViewReportData(arr);
    } else {
      if (data.message.msg) {
        toast.error(data.message.msg);
      } else if (data.message) {
        toast.error(data.message.msg);
      } else {
        toast.error("Something wrong happened");
      }
    }
  };
  useEffect(() => {
    setRows([]);
    if (wise == "minwise") {
      setSearchInput("MIN/24-25/");
    } else {
      setSearchInput("");
    }
    setSearchDateRange("");
  }, [wise]);
  // useEffect(() => {
  //   if (openModal) {
  //     callModal();
  //   }
  // }, [openModal]);

  return (
    <div style={{ height: "90%" }}>
      {editVbtDrawer ? (
        editvbturl === "vbt03" ? (
          <VBT02Report
            setEditVbtDrawer={setEditVbtDrawer}
            editVbtDrawer={editVbtDrawer}
          />
        ) : (
          <VBT01Report
            setEditVbtDrawer={setEditVbtDrawer}
            editVbtDrawer={editVbtDrawer}
          />
        )
      ) : (
        ""
      )}

      {/* {editVbtDrawer ? (
        <VBT01Report
          setEditVbtDrawer={setEditVbtDrawer}
          editVbtDrawer={editVbtDrawer}
        />
      ) : editvbturl === "vbt03" ? (
        <VBT02Report
          setEditVbtDrawer={setEditVbtDrawer}
          editVbtDrawer={editVbtDrawer}
        />
      ) : (
        ""
      )} */}
      <ViewVBTReport
        viewReportData={viewReportData}
        setViewReportData={setViewReportData}
        getSearchResults={getSearchResults}
      />
      {/* <DebitNote
        debitNotevbtCodes={debitNotevbtCodes}
        creatingDebitNote={creatingDebitNote}
        setCreatingDebitNotes={setCreatingDebitNotes}
      /> */}
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : wise === "minwise" ? (
                <Input
                  type="text"
                  size="default"
                  placeholder="Enter MIN Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : wise === "powise" ? (
                <>
                  <Input
                    size="default"
                    type="text"
                    placeholder="Enter Po Number"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </>
              ) : wise === "vbtwise" ? (
                <div>
                  <Input
                    size="default"
                    type="text"
                    placeholder="Enter VBT Code..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              ) : wise === "vendorwise" ? (
                <>
                  <MyAsyncSelect
                    size="default"
                    selectLoading={loading1("select")}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={(value) => setSearchInput(value)}
                    loadOptions={getVendors}
                    optionsState={asyncOptions}
                    defaultOptions
                    placeholder="Select Vendor..."
                  />
                </>
              ) : (
                wise == "effectivewise" && (
                  <MyDatePicker
                    size="default"
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                  />
                )
              )}
            </div>
            <div style={{ width: 150 }}>
              <MySelect
                options={vbtTypeOptions}
                onChange={setVbtOption}
                value={vbtOption}
              />
            </div>
            <MyButton
              disabled={
                wise === "datewise" || wise === "effectivewise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              type="primary"
              onClick={getSearchResults}
              variant="search"
            >
              Search
            </MyButton>
            <Button
              disabled={selectedRows.length === 0}
              type="primary"
              onClick={setDebitNoteVbtCodesHandler}
            >
              Create Debit Note
            </Button>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, downloadcolumns, "VBT Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <EditVBT1 editingVBT={editingVBT} setEditingVBT={setEditingVBT} />

      {/* data table here */}

      <div style={{ height: "95%", padding: "0 10px" }}>
        <MyDataTable
          // initialState={{
          //   columns: {
          //     // ...data.initialState?.columns,
          //     columnVisibilityModel: {
          //       min_id: false,
          //       // vbt_code: false,
          //       cgst_gl: false,
          //     },
          //   },
          // }}
          checkboxSelection={wise == "vendorwise"}
          loading={loading}
          columns={columns}
          data={rows}
          onSelectionModelChange={(newSelectionModel) => {
            setSelectedRows(newSelectionModel);
          }}
        />
        <DeleteVbt
          openModal={openModal}
          setOpenModal={setOpenModal}
          getVBTDetails={getVBTDetails}
          getSearchResults={getSearchResults}
        />
        <CreateDebitNote
          debitNoteDrawer={debitNoteDrawer}
          setDebitNoteDrawer={setDebitNoteDrawer}
        />
      </div>
    </div>
  );
}
