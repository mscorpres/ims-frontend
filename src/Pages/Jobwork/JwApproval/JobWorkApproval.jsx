import { Button, Col, Input, Popconfirm, Row, Space, Tooltip } from "antd";
import React from "react";
import { useState } from "react";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { useEffect } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../Components/MyDataTable";
import PoDetailsView from "./JwDetailsView.jsx";
import { downloadCSV } from "../../../Components/exportToCSV";
import PoRejectModa from "./JwRejectModal.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CloseOutlined, CheckOutlined, EyeOutlined } from "@ant-design/icons";
import PoApprovalModel from "./JwApprovalModal.jsx";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  getProjectOptions,
  getVendorOptions,
} from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";

export default function JobWorkApproval() {
  const [loading, setLoading] = useState(false);
  const [wise, setWise] = useState("jwwise");
  const [searchInput, setSearchInput] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [viewPoDetails, setViewPoDetails] = useState(null);
  const [rejectPo, setRejectPo] = useState(null);
  const [rows, setRows] = useState([]);
  const [approvePo, setApprovePo] = useState(null);
  const [selectedPo, setSelectedPo] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "PO Wise", value: "jwwise" },
    { text: "Vendor Wise", value: "vendorwise" },
    { text: "Project Wise", value: "projectwise" },
  ];
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const getRows = async () => {
    setRows([]);
    setLoading("fetch");
    const response = await imsAxios.post(
      "/jobwork/fetchneededApprovalJW",
      {
        data: searchInput,
        wise: wise,
      }
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const approveSubmitHandler = async (poid, remark) => {
    setLoading("approving");
    const response = await imsAxios.post("/jobwork/updateJWApproval", {
      jwid:poid,
      remark,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        getRows();
        setApprovePo(null);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const ApproveSelectedPo = () => {
    // selectedPo
    const arr = [];
    selectedPo.map((row) => {
      let matched = rows.filter((r) => r.id === row)[0];
      if (matched) {
        arr.push(matched.jw_transaction);
      }
    });
    setApprovePo(arr);
  };
  const RejectSelectedPo = () => {
    // selectedPo
    const arr = [];
    selectedPo.map((row) => {
      let matched = rows.filter((r) => r.id === row)[0];
      if (matched) {
        arr.push(matched.jw_transaction);
      }
    });
    setRejectPo(arr);
    // setApprovePo(arr);
  };
  const columns = [
    {
      headerName: "",
      field: "actions",
      width: 30,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          onClick={() => {
            setViewPoDetails(row.jw_transaction);
          }}
          label="View"
        />,
      ],
    },
    {
      headerName: "Sr. No",
      field: "id",
      width: 80,
    },
    {
      headerName: "PO ID",
      field: "jw_transaction",
      width: 150,
    },
    {
      headerName: "Cost Center",
      field: "jw_costcenter",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Project ID",
      field: "jw_projectname",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Project Name",
      field: "project_description",
      minWidth: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.project_description} />
      ),
    },
    {
      headerName: "Vendor",
      field: "vendor_name",
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: "PO Date / Time",
      field: "jw_reg_date",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Deviation Comment",
      field: "deviation_remark",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.deviation_remark} />,
      minWidth: 150,
    },
    {
      headerName: "PO Created By",
      field: "jw_reg_by",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "PO Requested By",
      field: "requested_by",
      flex: 1,
      minWidth: 200,
    },
  ];
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{ height: "90%", padding: 5, paddingTop: 0 }}>
      <PoRejectModa
        getRows={getRows}
        open={rejectPo}
        close={() => setRejectPo(null)}
      />
      <PoApprovalModel
        open={approvePo}
        close={() => {
          setApprovePo(false);
        }}
        submitHandler={approveSubmitHandler}
        loading={loading === "approving"}
      />
      <PoDetailsView
        viewPoDetails={viewPoDetails}
        setViewPoDetails={setViewPoDetails}
      />
      <Row justify="space-between">
        <Col span={18}>
          <Row gutter={6}>
            <Col span={4}>
              <MySelect
                options={wiseOptions}
                value={wise}
                onChange={(value) => setWise(value)}
              />
            </Col>
            <Col span={8}>
              {wise === "datewise" && (
                <MyDatePicker
                  setDateRange={setSearchInput}
                  dateRange={searchInput}
                  value={searchInput}
                />
              )}
              {wise === "jwwise" && (
                <Input
                  onChange={(e) => setSearchInput(e.target.value)}
                  value={searchInput}
                />
              )}
              {wise === "vendorwise" && (
                <MyAsyncSelect
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  optionsState={asyncOptions}
                  loadOptions={getVendorOption}
                  onBlur={() => setAsyncOptions([])}
                  loading={loading1("select")}
                />
              )}
              {wise === "projectwise" && (
                <MyAsyncSelect
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  optionsState={asyncOptions}
                  loadOptions={handleFetchProjectOptions}
                  onBlur={() => setAsyncOptions([])}
                  loading={loading1("select")}
                />
              )}
            </Col>
            <Col>
              <Space>
                <MyButton
                  loading={loading === "fetch"}
                  type="primary"
                  onClick={getRows}
                  variant="search"
                >
                  Fetch
                </MyButton>
                <Button
                  loading={loading === "fetch"}
                  disabled={selectedPo.length === 0}
                  onClick={ApproveSelectedPo}
                >
                  Approve Selected Jw's
                </Button>
                <Button
                  loading={loading === "fetch"}
                  disabled={selectedPo.length === 0}
                  onClick={RejectSelectedPo}
                >
                  Reject Selected Jw's
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
        <Col>
          <CommonIcons
            action="downloadButton"
            onClick={() => downloadCSV(rows, columns, "PO Approval Report")}
          />
        </Col>
      </Row>
      <div style={{ height: "100%", paddingTop: 5 }}>
        <MyDataTable
          loading={loading === "fetch"}
          columns={columns}
          checkboxSelection
          rows={rows}
          onSelectionModelChange={(selected) => {
            console.log(selected);
            console.log(rows);
            setSelectedPo(selected);
          }}
        />
      </div>
    </div>
  );
}
