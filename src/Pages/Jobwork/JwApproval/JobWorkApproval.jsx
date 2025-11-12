import {  Col, Input, Row, Space, Tooltip } from "antd";
import { useState } from "react";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { useEffect } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import PoDetailsView from "./JwDetailsView.jsx";
import { downloadCSV } from "../../../Components/exportToCSV";
import PoRejectModa from "./JwRejectModal.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import PoApprovalModel from "./JwApprovalModal.jsx";
import { getProjectOptions, getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import useApi from "../../../hooks/useApi.ts";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";
import { Print, Search } from "@mui/icons-material";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";

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
  const [rowSelection, setRowSelection] = useState({});
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
    const response = await imsAxios.post("/jobwork/fetchneededApprovalJW", {
      data: searchInput,
      wise: wise,
    });
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
      jwid: poid,
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
      header: "Sr. No",
      accessorKey: "id",
      size: 80,
    },
    {
      header: "PO ID",
      accessorKey: "jw_transaction",
      size: 150,
    },
    {
      header: "Cost Center",
      accessorKey: "jw_costcenter",

      size: 150,
    },
    {
      header: "Project ID",
      accessorKey: "jw_projectname",

      size: 150,
    },
    {
      header: "Project Name",
      accessorKey: "project_description",
      size: 200,
      Cell: ({ row }) => (
        <ToolTipEllipses text={row?.original?.project_description} />
      ),
    },
    {
      header: "Vendor",
      accessorKey: "vendor_name",
      size: 200,
    },
    {
      header: "PO Date / Time",
      accessorKey: "jw_reg_date",
      size: 150,
    },
    {
      header: "Deviation Comment",
      accessorKey: "deviation_remark",

      Cell: ({ row }) => (
        <ToolTipEllipses text={row?.original?.deviation_remark} />
      ),
      size: 150,
    },
    {
      header: "PO Created By",
      accessorKey: "jw_reg_by",

      size: 150,
    },
    {
      header: "PO Requested By",
      accessorKey: "requested_by",

      size: 200,
    },
  ];
  useEffect(() => {
    setSearchInput("");
  }, [wise]);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    enableRowSelection: true,
    renderRowActions: ({ row }) => (
      <Tooltip title="View">
        <IconButton
          color="inherit"
          size="small"
          onClick={() => {
            setViewPoDetails(row.jw_transaction);
          }}
        >
          <Print fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  useEffect(() => {
    const selectedRows = table
      .getSelectedRowModel()
      .flatRows.map((r) => r.original);
    setSelectedPo(selectedRows);
  }, [rowSelection, table]);
  return (
    <div style={{ height: "90%", padding: 12 }}>
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
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading === "fetch"}
                  onclick={getRows}
                />

                <CustomButton
                  size="small"
                  title={"Approve Selected Jw's"}
                  loading={loading === "fetch"}
                  onclick={ApproveSelectedPo}
                  disabled={selectedPo.length === 0}
                />
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
      <div style={{ height: "100%", marginTop: 12 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
