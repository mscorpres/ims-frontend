import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Tooltip, Popconfirm, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import {
  CloudDownloadOutlined,
  PrinterFilled,
  EyeFilled,
  DeleteFilled,
  EditFilled,
} from "@ant-design/icons";
import { GridActionsCellItem } from "@mui/x-data-grid";
import JounralPostingView from "../jounralPosting/JounralPostingView";
import EditJournalVoucher from "../jounralPosting/EditJournalVoucher";
import MySelect from "../../../Components/MySelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import DebitView from "./DebitView";
import DebitEdit from "./DebitEdit";

function DebitRegister() {
  const wiseOptions = [
    { text: "Date", value: "date_wise" },
    { text: "Effective Wise", value: "eff_wise" },
    { text: "Debit Code", value: "code_wise" },
    { text: "Ledger", value: "vendor_wise" },
  ];
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("date_wise");
  // console.log("Wise", wise);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDebitDetail, setViewDebitDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editDebit, setEditDebit] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);

  const getRows = async () => {
    setRows([]);
    setLoading("fetch");
    const { data } = await imsAxios.post("/tally/dv/debitVoucherList", {
      wise: wise,
      data: searchTerm,
    });
    setLoading(false);
    if (data.code == 200) {
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
      setLoading(false);
    }
  };

  const deleteFun = async () => {
    setLoading(true);
    if (deleteConfirm) {
      const { data } = await imsAxios.post("/tally/jv/jv_delete", {
        jv_code: deleteConfirm,
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

  const columns = [
    {
      headerName: "Sr No.",
      field: "index",
      width: 80,
    },
    {
      headerName: "Date",
      field: "ref_date",
    },

    {
      headerName: "Debit Code",
      field: "module_used",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.module_used} />
      ),
      flex: 1,
    },
    {
      headerName: "Account",
      field: "account",
      renderCell: ({ row }) => <ToolTipEllipses text={row.account} />,
      flex: 1,
    },
    {
      headerName: "Account Code",
      field: "account_code",
      flex: 1,
    },
    {
      headerName: "Credit",
      field: "credit",
      width: 120,
    },
    {
      headerName: "Debit",
      field: "debit",
      width: 120,
    },
    {
      headerName: "Comment",
      renderCell: ({ row }) => <ToolTipEllipses text={row.comment} />,
      field: "comment",
      flex: 1,
    },

    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span
          style={{
            color: row.status == "Deleted" && "brown",
          }}
        >
          {row.status}
        </span>
      ),
      width: 120,
    },

    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        // view voucher
        <GridActionsCellItem
          disabled={loading}
          icon={<EyeFilled className="view-icon" />}
          onClick={() => {
            // console.log(row);
            setViewDebitDetail(row?.module_used);
          }}
          label="view"
        />,
        <GridActionsCellItem
          // print voucher
          disabled={loading}
          icon={<PrinterFilled className="view-icon" />}
          onClick={() => {
            printFun(row.module_used);
          }}
          label="print"
        />,
        <GridActionsCellItem
          // download voucher
          disabled={loading}
          icon={<CloudDownloadOutlined className="view-icon" />}
          onClick={() => {
            handleDownload(row.module_used);
          }}
          label="download"
        />,
        <GridActionsCellItem
          // edit voucher
          disabled={loading}
          icon={<EditFilled className="view-icon" />}
          onClick={() => {
            // console.log(row);
            setEditDebit(row.module_used);
          }}
          label="download"
        />,
        // <GridActionsCellItem
        //   // delete voucher
        //   style={{ marginTop: -5 }}
        //   disabled={row.status == "Deleted"}
        //   icon={
        //     <Popconfirm
        //       title="Are you sure to delete this Voucher?"
        //       onConfirm={deleteFun}
        //       onCancel={() => {
        //         setDeleteConfirm(null);
        //       }}
        //       okText="Yes"
        //       cancelText="No"
        //     >
        //       <DeleteFilled
        //         className={`view-icon ${
        //           row.status == "Deleted" && "disable"
        //         }`}
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
  ];

  const printFun = async (key) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/dv/printDebitVoucher", {
      dv_key: key,
    });
    setLoading(false);
    printFunction(data.buffer.data);
    // module_used
  };
  const handleDownload = async (id) => {
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
  const getLedgerName = async (e) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: e,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          text: row.text,
          value: row.id,
        };
      });
      console.log(data.data);
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  useEffect(() => {
    setSearchTerm("");
  }, [wise]);
  return (
    <div style={{ height: "90%" }}>
      <Row justify="space-between" style={{ padding: 5, paddingTop: 5 }}>
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                options={wiseOptions}
                value={wise}
                onChange={(value) => setWise(value)}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "date_wise" && (
                <MyDatePicker size="default" setDateRange={setSearchTerm} />
              )}
              {wise === "eff_wise" && (
                <MyDatePicker size="default" setDateRange={setSearchTerm} />
              )}
              {wise === "code_wise" && (
                <Input
                  placeholder="Debit Code"
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
                  // defaultOptions
                  loadOptions={getLedgerName}
                  optionsState={asyncOptions}
                  placeholder="Select Ledger..."
                />
                // <MyAsyncSelect
                //   selectLoading={selectLoading}
                //   onBlur={() => setAsyncOptions([])}
                //   value={selectedLedger}
                //   onChange={(value) =>
                //     setSelectedLedger(value)
                //   }
                //   loadOptions={getLedgerName}
                //   optionsState={asyncOptions}
                //   placeholder="Select Ledger..."
                // />
              )}
            </div>
            <Button
              loading={loading === "fetch"}
              type="primary"
              onClick={getRows}
            >
              Fetch
            </Button>
          </Space>
        </Col>
        <Space>
          <CommonIcons
            action="downloadButton"
            onClick={() => downloadCSV(rows, columns, "Debit Report")}
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
      />
      <DebitEdit setEditDebit={setEditDebit} editDebit={editDebit} />
      {/* <JounralPostingView
        setJvId={setViewJVDetail}
        jvId={viewJVDetail}
      />
      <EditJournalVoucher
        editVoucher={editVoucher}
        setEditVoucher={setEditVoucher}
      /> */}
    </div>
  );
}

export default DebitRegister;
