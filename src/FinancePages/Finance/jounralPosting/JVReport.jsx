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
import JounralPostingView from "./JounralPostingView";
import EditJournalVoucher from "./EditJournalVoucher";
import MySelect from "../../../Components/MySelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";

function JVReport() {
  const wiseOptions = [
    { text: "Effective Date Wise", value: "eff_wise" },
    { text: "Created Date Wise", value: "date_wise" },
    { text: "JV Wise", value: "code_wise" },
    { text: "Particular Wise", value: "vendor_wise" },
  ];
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("date_wise");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewJVDetail, setViewJVDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);

  const getRows = async () => {
    setRows([]);
    setLoading("fetch");
    const { data } = await imsAxios.post("/tally/jv/jv_list", {
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
  const getLedgerOptions = async (searchTerm) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: searchTerm,
    });
    setSelectLoading(false);
    const { data } = response;
    if (data && data.code === 200) {
      let arr = data.data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
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
      headerName: "JV Code",
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
        <span style={{ color: row.status == "Deleted" && "brown" }}>
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
            setViewJVDetail(row.module_used);
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
            setEditVoucher(row.module_used);
          }}
          label="Edit"
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
  ];
  const printFun = async (key) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/jv/jv_print", {
      jv_key: key,
    });
    setLoading(false);
    printFunction(data.buffer.data);
    // module_used
  };
  const handleDownload = async (id) => {
    setLoading(true);
    let link = "/tally/jv/jv_print";
    let filename = "Journal Voucher " + id;

    const { data } = await imsAxios.post(link, {
      jv_key: id,
    });
    downloadFunction(data.buffer.data, filename);
    setLoading(false);
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
              {wise === "vendor_wise" && (
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getLedgerOptions}
                  optionsState={asyncOptions}
                  value={searchTerm}
                  selectLoading={selectLoading}
                  onChange={setSearchTerm}
                />
              )}
              {wise === "code_wise" && (
                <Input
                  placeholder="JV ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
            onClick={() => downloadCSV(rows, columns, "JV Report")}
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
      <JounralPostingView setJvId={setViewJVDetail} jvId={viewJVDetail} />
      <EditJournalVoucher
        editVoucher={editVoucher}
        setEditVoucher={setEditVoucher}
      />
    </div>
  );
}

export default JVReport;
