import React, { useState, useEffect } from "react";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import axios from "axios";
import { BsDownload, BsEyeFill } from "react-icons/bs";
import MyDataTable from "../../../Components/MyDataTable";
import ViewContraDetail from "./ViewContraDetail";
import { AiFillDelete, AiFillPrinter } from "react-icons/ai";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MySelect from "../../../Components/MySelect";
import { Button, Input, Popconfirm, Row, Space } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { v4 } from "uuid";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import ContraEdit from "./ContraEdit";

export default function ContraReport() {
  const [wise, setWise] = useState("date");
  const [searchDateRange, setSearchDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contraId, setContraId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [editingContra, setEditingContra] = useState(null);

  const wiseOptions = [
    { text: "Created Date Wise", value: "date" },
    { text: "Contra ID Wise", value: "number" },
    { text: "Effective Date Wise", value: "effective" },
    { text: "Ledger Wise", value: "ledger" },
  ];
  const getRows = async () => {
    // console.log(searchDateRange);
    let d;
    if (wise == "date") {
      if (searchDateRange) {
        d = searchDateRange;
      } else {
        toast.error("Please select a time period");
      }
    } else if (wise == "number") {
      if (searchInput) {
        d = searchInput?.trim();
      } else {
        toast.error("Please Enter a Contra ID");
      }
    } else if (wise == "ledger") {
      if (searchInput) {
        d = searchInput?.trim();
      } else {
        toast.error("Please Enter a Contra ID");
      }
    } else if (wise == "effective") {
      if (searchDateRange) {
        d = searchDateRange;
      } else {
        toast.error("Please select a time period");
      }
    }

    setLoading(true);
    const { data } = await imsAxios.post("/tally/contra/contra_report_list", {
      wise: wise,
      data: d,
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
      toast.error(data.message.msg);
      setRows([]);
    }
    setLoading(false);
    // console.log(data);
  };
  const printFun = async (id) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/contra/contra_print", {
      code: id,
    });
    printFunction(data.buffer.data);
    setLoading(false);
  };
  const handleDownload = async (id) => {
    setLoading(true);
    let link = "/tally/contra/contra_print";
    let filename = "Contra Transaction " + id;

    const { data } = await imsAxios.post(link, {
      code: id,
    });
    downloadFunction(data.buffer.data, filename);
    setLoading(false);
  };
  const deleteFun = async () => {
    setLoading(true);
    if (deleteConfirm) {
      const { data } = await imsAxios.post("/tally/contra/contra_delete", {
        contra_code: deleteConfirm,
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
  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/contra/bank_cash_ledgers", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (data.code == 200) {
      arr = data.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    } else {
      arr = [];
    }
    setAsyncOptions(arr);
  };
  const columns = [
    {
      headerName: "Serial No.",
      field: "index",
      flex: 1,
    },
    {
      headerName: "Contra ID",
      field: "contra_number",
      flex: 1,
    },
    {
      headerName: "Created Date",
      field: "create_date",
      flex: 1,
    },
    {
      headerName: "Reference Date",
      field: "ref_date",
      flex: 1,
    },
    {
      headerName: "Amount",
      field: "ammount",
      flex: 1,
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
      flex: 1,
    },
    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
          disabled={loading}
          icon={<BsEyeFill className="view-icon" />}
          onClick={() => {
            setContraId(row.contra_number);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
          disabled={loading}
          icon={<AiFillPrinter className="view-icon" />}
          onClick={() => {
            printFun(row.contra_number);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
          disabled={loading}
          icon={<BsDownload className="view-icon" />}
          onClick={() => {
            handleDownload(row.contra_number);
          }}
          label="Delete"
        />,

        <TableActions
          action="edit"
          disabled={loading}
          onClick={() => {
            setEditingContra(row.contra_number);
          }}
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
        //       <AiFillDelete
        //         style={{ marginTop: -5 }}
        //         className={`view-icon ${row.status == "Deleted" && "disable"}`}
        //       />{" "}
        //     </Popconfirm>
        //   }
        //   onClick={() => {
        //     setDeleteConfirm(row.contra_number);
        //   }}
        //   label="Delete"
        // />,
      ],
    },
  ];
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <ViewContraDetail contraId={contraId} setContraId={setContraId} />
      <ContraEdit contra={editingContra} close={() => setEditingContra(null)} />
      <Row
        style={{ padding: "0px 10px", paddingBottom: 5 }}
        justify="space-between"
      >
        <div>
          <Space>
            <div style={{ width: 250 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "date" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : wise === "number" ? (
                <Input
                  size="default"
                  type="text"
                  // className="form-control w-100 "
                  placeholder="Enter Conttra Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : wise === "effective" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : (
                wise === "ledger" && (
                  <MyAsyncSelect
                    selectLoading={selectLoading}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={setSearchInput}
                    optionsState={asyncOptions}
                    loadOptions={getLedger}
                  />
                )
              )}
            </div>
            <Button
              disabled={
                wise === "date" || wise === "effective"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
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
            onClick={() => downloadCSV(rows, columns, "Contra Report")}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div className="" style={{ height: "85%", padding: "0 10px" }}>
        <MyDataTable
          loading={loading}
          pagination={true}
          headText="center"
          columns={columns}
          data={rows}
        />
      </div>
    </div>
  );
}
