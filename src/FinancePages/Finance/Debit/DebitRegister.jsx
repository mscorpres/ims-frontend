import  { useState, useEffect } from "react";
import { Col, Input, Modal, Row,Space, Tag } from "antd";
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
  EditFilled,
  CloseOutlined
} from "@ant-design/icons";
import { GridActionsCellItem } from "@mui/x-data-grid";

import MySelect from "../../../Components/MySelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import DebitView from "./DebitView";
import DebitEdit from "./DebitEdit";
import MyButton from "../../../Components/MyButton";

function DebitRegister() {
  const wiseOptions = [
    { text: "Date", value: "date_wise" },
    { text: "Effective Wise", value: "eff_wise" },
    { text: "Debit Code", value: "code_wise" },
    { text: "Ledger", value: "vendor_wise" },
  ];
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("date_wise");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDebitDetail, setViewDebitDetail] = useState(null);
  const [editDebit, setEditDebit] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const getRows = async () => {
    if(searchTerm === "") 
    {
      toast.error("Please enter value/date");
      return
    }
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

  const deleteFun = async (dv_code, remark) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/dv/cancel-debit-note", {
      debitNo: dv_code,
      cancelReason: remark,
    });
    setLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      getRows();
    } else {
      toast.error(data.message.msg);
    }
  };

  const confirmDelete = (jv_code) => {
    let remark = "";
    Modal.confirm({
      title: "Cancel Voucher",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      content: (
        <div>
          <p style={{ marginBottom: 2 }}>
            Debit Code: <b>{jv_code}</b>
          </p>
          <Input.TextArea
            rows={3}
            placeholder="Enter remark for cancellation"
            onChange={(e) => {
              remark = e.target.value;
            }}
          />
        </div>
      ),
      onOk() {
        if (!remark.trim()) {
          toast.error("Please enter a remark for cancellation");
          return Promise.reject();
        }
        return deleteFun(jv_code, remark);
      },
    });
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
      headerName: "DN Status",
      field: "dnStatus",
      renderCell: ({ row }) => (
        <Tag color={row.dnStatus === "ACTIVE" ? "green" : "red"}>
                          {row.dnStatus}
                        </Tag>
      ),
      width: 120,
    },
    // {
    //   headerName: "Status",
    //   field: "status",
    //   renderCell: ({ row }) => (
    //     <span
    //       style={{
    //         color: row.status == "Deleted" && "brown",
    //       }}
    //     >
    //       {row.status}
    //     </span>
    //   ),
    //   width: 120,
    // },

    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key={`view-${row.module_used}`}
          disabled={loading}
          icon={<EyeFilled className="view-icon" />}
          onClick={() => setViewDebitDetail(row?.module_used)}
          label="view"
        />,
        <GridActionsCellItem
          key={`print-${row.module_used}`}
          disabled={loading}
          icon={<PrinterFilled className="view-icon" />}
          onClick={() => printFun(row.module_used)}
          label="print"
        />,
        <GridActionsCellItem
          key={`download-${row.module_used}`}
          disabled={loading}
          icon={<CloudDownloadOutlined className="view-icon" />}
          onClick={() => handleDownload(row.module_used)}
          label="download"
        />,
        ...(row?.dnStatus !== "CANCELLED"
          ? [
              <GridActionsCellItem
                key={`edit-${row.module_used}`}
                disabled={loading}
                icon={<EditFilled className="view-icon" />}
                onClick={() => setEditDebit(row.module_used)}
                label="edit"
              />,
              <GridActionsCellItem
                key={`delete-${row.module_used}`}
                disabled={loading || row.status == "Deleted"}
                icon={
                  <CloseOutlined 
                    className={`view-icon ${
                      row.status == "Deleted" && "disable"
                    }`}
                  />
                }
                onClick={() => confirmDelete(row.module_used)}
                label="Delete"
              />,
            ]
          : []),
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
    setLoading(true);
    const { data } = await imsAxios.post("/tally/dv/printDebitVoucher", {
      dv_key: id,
    });
    downloadFunction(data.buffer.data, "Debit Voucher " + id);
    setLoading(false);
  };
  const getLedgerName = async (e) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: e,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
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
              {(wise === "date_wise" || wise === "eff_wise") && (
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
    </div>
  );
}

export default DebitRegister;
