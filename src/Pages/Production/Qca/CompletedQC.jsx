import React, { useEffect, useState } from "react";
import { Button, Input, Popconfirm, Row, Space, Popover } from "antd";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import MyDataTable from "../../../Components/MyDataTable";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import FormTable from "../../../Components/FormTable";

import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions, getVendorOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";
import MyButton from "../../../Components/MyButton";
function CompletedQC() {
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Pending Sample Date Wise", value: "datewise" },
    { text: "Vendor", value: "vendorwise" },
    { text: "Part", value: "partwise" },
  ];

  const getPartOptions = async (search) => {
    // setSelectLoading(false);
    // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(true);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    const arr = data.map((row) => {
      return {
        text: row.text,
        value: row.id,
      };
    });
    setAsyncOptions(arr);
  };

  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const getRows = async () => {
    setSearchLoading(true);
    setTableLoading(true);

    const { data } = await imsAxios.post("/qc/qcApproval", {
      data: searchInput,
      wise: wise,
    });
    setTableLoading(false);
    setSearchLoading(false);

    if (data.code == 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          // remark: "",
          // status: "",
          // finalStatus: "",
        };
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
    }
  };

  const submitSample = async (row) => {
    setSubmitLoading(row.id);
    const { data } = await imsAxios.post("/qc/updateSampling_stage3", {
      component: row.componentKey,
      sample_txn: row.sample_txn,
      min_txn: row.min_txn,
      authKey: row.authkey,
      status: "A",
      remark: row.remark,
    });
    setSubmitLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      let arr = rows;
      arr = arr.map((tableRow) => {
        if (tableRow.id === row.id) {
          return {
            ...tableRow,
            currStatus: "A",
          };
        } else {
          return tableRow;
        }
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
    }
  };

  const rejectSample = async (row) => {
    setSubmitLoading(row.id);
    const { data } = await imsAxios.post("/qc/updateSampling_stage3", {
      component: row.componentKey,
      sample_txn: row.sample_txn,
      min_txn: row.min_txn,
      authKey: row.authkey,
      status: "R",
      remark: row.remark,
    });
    setSubmitLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      let arr = rows;
      arr = arr.map((tableRow) => {
        if (tableRow.id === row.id) {
          return {
            ...tableRow,
            currStatus: "F",
          };
        } else {
          return tableRow;
        }
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
    }
  };

  const content1 = (row) => (
    // <div>
    <span
      style={{ fontWeight: "bold", fontSize: "14px" }}
      dangerouslySetInnerHTML={{ __html: row }}
    />
    // </div>
  );

  const columns = [
    {
      headerName: "#",
      width: 30,
      field: "index",
      renderCell: ({ row }) => <p>{row.index}</p>,
    },

    {
      headerName: "Sample No.",
      width: 120,
      field: "sample_txn",
      renderCell: ({ row }) => (
        <span
          style={{
            color: row.status === "A" ? "green" : "brown",
          }}
        >
          {row.sample_txn}
        </span>
      ),
    },
    {
      headerName: "MIN No.",
      field: "min_txn",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.min_txn} />,
    },
    {
      headerName: "MIN Date",
      field: "min_txn_dt",
      width: 180,
      renderCell: ({ row }) => <ToolTipEllipses text={row.min_txn_dt} />,
    },
    {
      headerName: "Invoice",
      width: 180,
      field: "invoice",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.invoice} />
      ),
    },
    {
      headerName: "Vendor Code",
      width: 120,
      field: "vendorcode",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.vendorcode} />
      ),
    },
    {
      headerName: "Vendor Name",
      width: 200,
      field: "vendorname",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.vendorname} />
      ),
    },
    {
      headerName: "Part",
      width: 100,
      field: "part",
      renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
    },
    {
      headerName: "Component",
      field: "component",
      width: 250,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
    },

    {
      headerName: "In Qty",
      width: 100,
      field: "inQty",
      renderCell: ({ row }) => <ToolTipEllipses text={row.inQty} />,
    },
    {
      headerName: "UoM",
      width: 100,
      field: "unit",
      renderCell: ({ row }) => <ToolTipEllipses text={row.unit} />,
    },

    {
      headerName: "Sample Qty",
      width: 100,
      field: "samQty",
      renderCell: ({ row }) => <ToolTipEllipses text={row.samQty} />,
    },

    {
      headerName: "Sample Date",
      width: 150,
      field: "sample_qc_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.sample_qc_date} />,
    },

    {
      headerName: "Stage 1 Remarks",
      width: 150,
      field: "comment_stage_first",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.comment_stage_first} />
      ),
    },
    {
      headerName: "Stage 2 Remarks",
      width: 150,
      field: "comment_stage_second",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.comment_stage_second} />
      ),
    },
    {
      headerName: "UoM",
      width: 100,
      field: "unit",
      renderCell: ({ row }) => <ToolTipEllipses text={row.unit} />,
    },
    {
      headerName: "Status",
      width: 80,
      field: "status",
      renderCell: ({ row }) => (
        <span
          style={{
            color: row.status === "A" ? "green" : "brown",
          }}
        >
          {row.status === "A" ? "Pass" : "Rejected"}
        </span>
      ),
    },
    {
      headerName: "Remarks",
      field: "remark",
      width: 200,
      renderCell: ({ row }) =>
        row.currStatus === "A" || row.currStatus === "F" ? (
          <ToolTipEllipses text={row.remark} />
        ) : (
          <Input
            value={row.remark}
            onChange={(e) => inputHandler("remark", e.target.value, row.id)}
          />
        ),
    },
    {
      headerName: "Actions",
      field: "actions",
      type: "actions",
      width: 120,
      // width: 100,
      renderCell: ({ row }) => [
        row.currStatus === "A" || row.currStatus === "F" ? (
          <span
            style={{
              color: row.currStatus === "A" ? "green" : "brown",
            }}
          >
            {row.currStatus === "A" ? "Final Pass" : "Final Rejected"}
          </span>
        ) : (
          <Space>
            <Popconfirm
              title={`Are you sure to pass Sample ${row.part}?`}
              onConfirm={() => submitSample(row)}
              onCancel={() => {
                setShowConfirmModal(null);
              }}
              okText="Yes"
              loading={submitLoading === row.id}
              cancelText="No"
            >
              <Button
                // disabled={row.status !== ""}
                shape="circle"
                type="primary"
                size="small"
                disabled={row.currStatus === "A" || row.currStatus === "F"}
                icon={<CheckOutlined />}
              />
            </Popconfirm>
            <Popconfirm
              title={`Are you sure to reject Sample ${row.transaction}?`}
              onConfirm={() => rejectSample(row)}
              onCancel={() => {
                setShowConfirmModal(null);
              }}
              loading={submitLoading === row.id}
              okText="Yes"
              disabled={row.currStatus === "A" || row.currStatus === "F"}
              cancelText="No"
            >
              <Button
                shape="circle"
                type="primary"
                size="small"
                disabled={row.currStatus === "A" || row.currStatus === "F"}
                icon={<CloseOutlined />}
              />
            </Popconfirm>
          </Space>
        ),
      ],
    },
  ];

  const inputHandler = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      let obj = row;
      if (row.id == id) {
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  useEffect(() => {
    setSearchInput("");
  }, [wise]);

  return (
    <>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size="default"
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
                  setDateRange={setSearchInput}
                  dateRange={setSearchInput}
                  value={setSearchInput}
                />
              ) : wise === "partwise" ? (
                <MyAsyncSelect
                  size="default"
                  selectLoading={loading1("select")}
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={getPartOptions}
                  optionsState={asyncOptions}
                  placeholder="Select Part..."
                />
              ) : (
                wise === "vendorwise" && (
                  <div>
                    <MyAsyncSelect
                      size="default"
                      onBlur={() => setAsyncOptions([])}
                      selectLoading={loading1("select")}
                      value={searchInput}
                      onChange={(value) => setSearchInput(value)}
                      loadOptions={getVendors}
                      optionsState={asyncOptions}
                      placeholder="Select Vendor..."
                    />
                  </div>
                )
              )}
            </div>
            <MyButton
              variant="search"
              disabled={!searchInput ? true : false}
              type="primary"
              loading={searchLoading}
              onClick={getRows}
              id="submit"
              // className="primary-button search-wise-btn"
            >
              Search
            </MyButton>
          </Space>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => downloadCSV(rows, columns, "Stage 3 QC Report")}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "85%", padding: "0px 10px" }}>
        <FormTable columns={columns} data={rows} loading={tableLoading} />
      </div>
    </>
  );
}

export default CompletedQC;
