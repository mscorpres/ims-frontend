import { Button, Col, Row, Space, Input, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiFillEdit } from "react-icons/ai";
import {
  CloudDownloadOutlined,
  EditFilled,
  EyeFilled,
  PrinterFilled,
} from "@ant-design/icons";
import DebitView from "./DebitView";
// ----
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import DebitEdit from "./DebitEdit";
import MyButton from "../../../Components/MyButton";

// import {loading}
function DebitCentralizedRegister() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("DN/23-24/");
  const [wise, setWise] = useState("debit_key_wise");
  const [viewDebitDetail, setViewDebitDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editDebit, setEditDebit] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);

  const wiseOptions = [
    // { text: "Date", value: "datfe_wise" },
    { text: "Effective Wise ", value: "effective_date_wise" },
    { text: "Ledger Wise", value: "vendor_wise" },
    { text: "Create Date Wise", value: "created_date_wise" },
    { text: "Debit Key Wise", value: "debit_key_wise" },
  ];
  // created_date_wise, effective_date_wise, debit_key_wise, vendor_wise;
  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (!data.msg) {
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.get(
      `/tally/dv/register?wise=${wise}&data=${searchTerm}`
    );
    console.log("resonse----", response);
    const { data } = response;
    if (response.status === 200) {
      // console.log("arr-------------", arr);
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setLoading(false);
      setRows(arr);
    } else {
      setLoading(false);
    }
    // let arr = data.data;
  };
  //debit note WithOUT  vbt functions
  const printFunWithout = async (key) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/dv/printDebitVoucher", {
      dv_key: key,
    });
    setLoading(false);
    printFunction(data.buffer.data);
    // module_used
  };
  const handleDownloadwithout = async (id) => {
    console.log(id);
    setLoading(true);
    let link = "/tally/dv/printDebitVoucher";
    let filename = "Debit Voucher " + id;

    const { data } = await imsAxios.post(link, {
      dv_key: id,
    });
    downloadFunction(data.buffer.data, filename);
    setLoading(false);
  };
  //debit note with  vbt functions
  const handleSinblePrint = async (id) => {
    setLoading("tableLoading");
    const { data } = await imsAxios.post(
      "/tally/vbt_report/print_vbt_debit_report",
      {
        debit_code: id,
      }
    );
    printFunction(data.buffer.data);
    setLoading(false);
  };
  const handleSingleDownload = async (id) => {
    setLoading("tableLoading");
    let link = "/tally/vbt_report/print_vbt_debit_report";
    let filename = id;

    const { data } = await imsAxios.post(link, {
      debit_code: id,
    });

    downloadFunction(data.buffer.data, filename);
    setLoading(false);
  };

  // useEffect(() => {
  //   setSearchTerm("");
  // }, [wise]);

  useEffect(() => {
    setRows([]);
    if (wise == "debit_key_wise") {
      setSearchTerm("DN/23-24/");
    } else {
      setSearchTerm("");
    }
    setSearchTerm("");
  }, [wise]);
  // useEffect(() => {
  //   setRows([]);
  //   if (wise == "debit_key_wise") {
  //     setSearchTerm("MIN/23-24/");
  //   } else {
  //     setSearchTerm("");
  //   }
  //   setSearchTerm("");
  // }, [wise]);
  const columns = [
    {
      headerName: "",
      field: "actions",
      width: 50,
      type: "actions",
      getActions: ({ row }) =>
        row.docType == "without vbt"
          ? [
              <GridActionsCellItem
                showInMenu
                disabled={loading}
                icon={<EyeFilled className="view-icon" />}
                onClick={() => {
                  // console.log(row);
                  setViewDebitDetail(row?.debitNo);
                }}
                label="View"
              />,
              <GridActionsCellItem
                showInMenu // print voucher
                disabled={loading}
                icon={<PrinterFilled className="view-icon" />}
                onClick={() => {
                  printFunWithout(row.debitNo);
                }}
                label="Print"
              />,
              <GridActionsCellItem
                showInMenu
                // download voucher
                disabled={loading}
                icon={<CloudDownloadOutlined className="view-icon" />}
                onClick={() => {
                  handleDownloadwithout(row.debitNo);
                }}
                label="Download"
              />,
              <GridActionsCellItem
                showInMenu
                // edit voucher
                disabled={loading}
                icon={<EditFilled className="view-icon" />}
                onClick={() => {
                  console.log(row);
                  setEditDebit(row.debitNo);
                }}
                label="Edit"
              />,
            ]
          : [
              <GridActionsCellItem
                showInMenu
                disabled={loading === "tableLoading"}
                icon={<PrinterFilled className="view-icon" />}
                onClick={() => handleSinblePrint(row.debitNo)}
                label="Print"
              />,
              <GridActionsCellItem
                showInMenu
                disabled={loading === "tableLoading"}
                icon={<CloudDownloadOutlined className="view-icon" />}
                onClick={() => {
                  handleSingleDownload(row.debitNo);
                }}
                label="Download"
              />,
            ],
    },
    {
      headerName: "Sr. No.",
      field: "index",
      width: 80,
      // flex: 1,
    },
    {
      headerName: "Doc Type",
      field: "docType",
      renderCell: ({ row }) =>
        row.docType == "without vbt" ? (
          <span style={{ color: "##b38f56" }}>Without VBT</span>
        ) : (
          <span style={{ color: "#237083" }}>With VBT</span>
        ),
      width: 150,
    },
    {
      headerName: "Created On",
      field: "create_dt",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.create_dt} />,
      width: 150,
    },
    {
      headerName: "Debit No",
      field: "debitNo",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.debitNo} />,
      width: 150,
    },
    {
      headerName: "Effective Date",
      field: "eff_dt",

      width: 150,
    },
    {
      headerName: "Type",
      field: "type",
      renderCell: ({ row }) => <ToolTipEllipses text={row.type} />,
      width: 100,
    },
    {
      headerName: "Account",
      field: "account",
      renderCell: ({ row }) => <ToolTipEllipses text={row.account} />,
      width: 150,
    },
    {
      headerName: "Debit",
      field: "debit",
      renderCell: ({ row }) => <ToolTipEllipses text={row.debit} />,
      width: 150,
    },
    {
      headerName: "Credit",
      field: "credit",
      renderCell: ({ row }) => <ToolTipEllipses text={row.credit} />,
      width: 150,
    },

    {
      headerName: "PO ID",
      field: "po_id",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.po_id} />,
      width: 150,
    },
    {
      headerName: "Project ID",
      field: "project_id",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.project_id} />,
      width: 150,
    },
    {
      headerName: "VBT Code",
      field: "vbt_code",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.vbt_code} />,
      width: 150,
    },
    {
      headerName: "MIN ID",
      field: "min_id",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.min_id} />,
      width: 150,
    },
    {
      headerName: "Status",
      field: "status",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.status} />,
      width: 100,
    },
    {
      headerName: "Invoice No.",
      field: "invoice_no",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_no} />,
      width: 150,
    },
    {
      headerName: "Part",
      field: "part",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
      width: 150,
    },
    {
      headerName: "Part Code",
      field: "part_code",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.part_code} />,
      width: 80,
    },
    {
      headerName: "Act Qty",
      field: "act_qty",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.act_qty} />,
      width: 80,
    },
    {
      headerName: "Rate",
      field: "rate",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.rate} />,
      width: 80,
    },
    {
      headerName: "Taxable Value",
      field: "taxable_value",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.taxable_value} />,
      width: 80,
    },
    {
      headerName: "CGST",
      field: "cgst",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.cgst} />,
      width: 80,
    },
    {
      headerName: "SGST",
      field: "sgst",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.sgst} />,
      width: 80,
    },
    {
      headerName: "IGST",
      field: "igst",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.igst} />,
      width: 80,
    },
    {
      headerName: "Custom",
      field: "custom",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.custom} />,
      width: 80,
    },
    {
      headerName: "Freight",
      field: "freight",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.freight} />,
      width: 80,
    },
    {
      headerName: "Bill Amount",
      field: "ven_bill_amm",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.ven_bill_amm} />,
      width: 100,
    },
    {
      headerName: "VBT GL",
      field: "vbt_gl",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.vbt_gl} />,
      width: 150,
    },
    {
      headerName: "CGST GL",
      field: "cgst_gl",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.cgst_gl} />,
      width: 150,
    },
    {
      headerName: "SGST GL",
      field: "sgst_gl",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.sgst_gl} />,
      width: 150,
    },
    {
      headerName: "IGST GL",
      field: "igst_gl",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.igst_gl} />,
      width: 150,
    },
    {
      headerName: "TDS GL",
      field: "tds_gl",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.tds_gl} />,
      width: 150,
    },
    {
      headerName: "TDS Amount",
      field: "tds_amm",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.tds_amm} />,
      width: 150,
    },
    {
      headerName: "Invoice Date",
      field: "invoice_dt",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_dt} />,
      width: 150,
    },
    {
      headerName: "Comment",
      field: "comment",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.comment} />,s
      width: 150,
    },
  ];
  return (
    <div style={{ height: "90%" }}>
      <Row justify="space-between" style={{ padding: 5, paddingTop: 5 }}>
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                placeholder="Please Select Option "
                options={wiseOptions}
                value={wise}
                onChange={(value) => setWise(value)}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "created_date_wise" && (
                <MyDatePicker size="default" setDateRange={setSearchTerm} />
              )}
              {wise === "effective_date_wise" && (
                <MyDatePicker size="default" setDateRange={setSearchTerm} />
              )}
              {wise === "debit_key_wise" && (
                <Input
                  type="text"
                  size="default"
                  placeholder="Enter Debit Key"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
              {wise === "vendor_wise" && (
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  onBlur={() => setAsyncOptions([])}
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                  defaultOptions
                  loadOptions={getLedger}
                  optionsState={asyncOptions}
                  placeholder="Select Ledger..."
                />
              )}
            </div>
            <MyButton
              loading={loading === "fetch"}
              type="primary"
              onClick={getRows}
              variant="search"
            >
              Fetch
            </MyButton>
          </Space>
        </Col>
        <Space>
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(rows, columns, "Debit Report Centralized")
            }
          />
        </Space>
      </Row>
      <div style={{ height: "95%", padding: "0px 5px" }}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
      </div>
      <DebitView
        setViewDebitDetail={setViewDebitDetail}
        viewDebitDetail={viewDebitDetail}
        loading={loading}
        setLoading={setLoading}
      />
      <DebitEdit setEditDebit={setEditDebit} editDebit={editDebit} />
    </div>
  );
}
export default DebitCentralizedRegister;
