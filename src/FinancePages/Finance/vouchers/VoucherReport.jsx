import React, { useEffect, useState } from "react";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import axios from "axios";
import MyDataTable from "../../../Components/MyDataTable";
import VoucherView from "./VoucherView";
import { useLocation } from "react-router-dom";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MySelect from "../../../Components/MySelect";
import { v4 } from "uuid";
import { Button, Input, Popconfirm, Row, Space, Tooltip } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  CloudDownloadOutlined,
  DownloadOutlined,
  PrinterFilled,
  EyeFilled,
  DeleteFilled,
  EditFilled,
} from "@ant-design/icons";
import EditBankVoucher from "./EditBankVoucher";
import { downloadCSV } from "../../../Components/exportToCSV";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";

export default function VoucherReport() {
  const { pathname } = useLocation();
  const [wise, setWise] = useState("date_wise");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detailVoucherId, setDetailVoucherId] = useState(null);
  const [voucherType, setVoucherType] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);

  // console.log(voucherType);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);

  const wiseOptions = [
    { value: "date_wise", text: "Created Date" },
    { value: "eff_wise", text: "Effective Date" },
    { value: "key_wise", text: "Voucher No." },
    { value: "ledger_wise", text: "Ledger" },
  ];
  const getRows = async () => {
    let link = "";
    if (voucherType === "bank-payment") {
      link = "/tally/voucher/bp_list";
    } else if (voucherType === "bank-receipt") {
      link = "/tally/voucher/br_list";
    }
    setLoading(true);
    setSearchLoading(true);
    const { data } = await imsAxios.post(link, {
      wise: wise,
      data:
        wise === "date_wise" || wise === "eff_wise"
          ? searchDateRange
          : searchInput,
    });
    setLoading(false);
    setSearchLoading(false);
    if (data.code === 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          status: row.status == "D" ? "Deleted" : "--",
        };
      });
      setRows(arr);
    } else {
      setRows([]);
      toast.error(data.message.msg);
    }
  };
  const showVoucherTable = [
    {
      headerName: "Action",
      field: "action",
      type: "actions",
      width: 150,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EyeFilled className="view-icon" />}
          onClick={() => setDetailVoucherId(row.module_used)}
          label="Delete"
        />,
        <GridActionsCellItem
          icon={<PrinterFilled className="view-icon" />}
          onClick={() => {
            printFun(row.module_used);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
          icon={<CloudDownloadOutlined className="view-icon" />}
          onClick={() => {
            handleDownload(row.module_used);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
          disabled={row.status == "Deleted"}
          icon={
            <EditFilled
              className={`view-icon ${row.status == "Deleted" && "disable"}`}
            />
          }
          onClick={() => {
            setEditVoucher(row.module_used);
          }}
          label="Delete"
        />,
        // <GridActionsCellItem
        //   disabled={row.status == "Deleted"}
        //   icon={
        //     <Popconfirm
        //       title="Are you sure to delete this Transaction?"
        //       onConfirm={deleteFun}
        //       onCancel={() => {
        //         setDeleteConfirm(null);
        //       }}
        //       okText="Yes"
        //       cancelText="No"
        //     >
        //       <DeleteFilled
        //         style={{ marginBottom: 10 }}
        //         className={`view-icon ${row.status == "Deleted" && "disable"}`}
        //       />{" "}
        //     </Popconfirm>
        //   }
        //   onClick={() => {
        //     setDeleteConfirm(row.module_used);
        //   }}
        //   label="Delete"
        // />,
      ],
    },
    {
      headerName: "Serial No.",
      width: 100,
      field: "index",
    },
    {
      headerName: "Date",
      width: 100,
      field: "ref_date",
    },
    {
      headerName: "Voucher ID",
      field: "module_used",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.module_used}>
          {row.module_used}
        </ToolTipEllipses>
      ),
      width: 200,
    },
    {
      headerName: "Voucher Type",
      width: 100,

      field: "which_module",
    },
    {
      headerName: "Project",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses
          copy={row.project_code.length > 0 && row.project_code != "--" && true}
          text={row.project_code}
        >
          {row.project_code}
        </ToolTipEllipses>
      ),
      field: "project_code",
    },
    {
      headerName: "Bank Name",
      width: 180,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.bank_name}>{row.bank_name}</ToolTipEllipses>
      ),
      field: "bank_name",
    },
    {
      headerName: "Bank Code",
      width: 120,
      renderCell: ({ row }) => (
        <Tooltip title={row.bank_name_code}>{row.bank_name_code}</Tooltip>
      ),
      field: "bank_name_code",
    },
    {
      headerName: "Particular Name",
      width: 180,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.perticular}>
          {row.perticular}
        </ToolTipEllipses>
      ),
      field: "perticular",
    },
    {
      headerName: "Particular Code",
      width: 200,
      renderCell: ({ row }) => (
        <Tooltip title={row.perticular_code}>{row.perticular_code}</Tooltip>
      ),
      field: "perticular_code",
    },
    {
      headerName: "Payment",
      width: 100,
      field: "payment",
    },
    {
      headerName: "Comment",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.comment}>{row.comment}</ToolTipEllipses>
      ),
      field: "comment",
    },

    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span style={{ color: row.status == "Deleted" && "red" }}>
          {row.status}
        </span>
      ),
      // width: "16vw",
      sortable: false,
      width: 100,
    },
  ];
  const deleteFun = async () => {
    setLoading(true);
    if (deleteConfirm) {
      const { data } = await imsAxios.post("/tally/voucher/bank_delete", {
        b_code: deleteConfirm,
      });
      setLoading(false);
      if (data.code == 200) {
        setDeleteConfirm(null);
        toast.success(data.message);
        getRows();
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const printFun = async (id) => {
    setLoading(true);
    let link = "";
    if (voucherType === "bank-payment") {
      link = "/tally/voucher/bp_print";
    } else if (voucherType === "bank-receipt") {
      link = "tally/voucher/br_print";
    }
    const { data } = await imsAxios.post(link, {
      v_code: id,
    });
    printFunction(data.buffer.data);
    // if (data.code === 200) {
    // }
    setLoading(false);
  };
  const handleDownload = async (id) => {
    setLoading(true);
    let link = "";
    let filename = "";
    if (voucherType === "bank-payment") {
      link = "/tally/voucher/bp_print";
      filename = "bank-payment-voucher" + id;
      // console.log("bank-payment-voucher" + id);
    } else if (voucherType === "bank-receipt") {
      link = "tally/voucher/br_print";
      filename = "bank-payment-receipt" + id;
      // console.log("bank-payment-receipt" + id);
    }
    const { data } = await imsAxios.post(link, {
      v_code: id,
    });

    downloadFunction(data.buffer.data, filename);

    setLoading(false);
  };
  const getLedgerOptions = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    if (data.code === 200) {
      setSelectLoading(false);
      const arr = data.data.map((row) => {
        return { value: row.id, text: row.text };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  useEffect(() => {
    if (pathname.includes("payment")) {
      setVoucherType("bank-payment");
    } else if (pathname.includes("receipt")) {
      setVoucherType("bank-receipt");
    }
  }, [pathname]);

  return (
    <div style={{ height: "100%" }}>
      <EditBankVoucher
        getRows={getRows}
        voucherType={voucherType}
        editVoucher={editVoucher}
        setEditVoucher={setEditVoucher}
      />
      <VoucherView
        detailVoucherId={detailVoucherId}
        setDetailVoucherId={setDetailVoucherId}
      />
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <div className="left">
          <Space>
            <div style={{ width: 250 }}>
              <MySelect
                options={wiseOptions}
                // defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
              />
            </div>

            <div style={{ width: 300 }}>
              {wise === "date_wise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : wise === "key_wise" ? (
                <Input
                  size="default"
                  type="text"
                  placeholder="Enter Voucher Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : wise === "eff_wise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : (
                wise === "ledger_wise" && (
                  <MyAsyncSelect
                    selctLoading={selectLoading}
                    optionsState={asyncOptions}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={getLedgerOptions}
                    value={searchInput}
                    placeholder="Select Account.."
                    onChange={setSearchInput}
                  />
                )
              )}
            </div>

            <Button
              disabled={
                wise === "date_wise" || wise === "eff_wise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              loading={searchLoading}
              type="primary"
              onClick={getRows}
            >
              Search
            </Button>
          </Space>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() =>
              downloadCSV(rows, showVoucherTable, `${voucherType} Report`)
            }
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>

      <div style={{ height: "85%", padding: "0 10px" }}>
        <MyDataTable
          // export={true}
          loading={loading}
          columns={showVoucherTable}
          data={rows}
          pagination={true}
        />
      </div>
    </div>
  );
}
