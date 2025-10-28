import { Col, Input, Row, Space } from "antd";
import { useMemo, useState, useEffect } from "react";
import MySelect from "../../../../Components/MySelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import PoDetailsView from "./PoDetailsView";
import { downloadCSV } from "../../../../Components/exportToCSV";
import PoRejectModa from "./PoRejectModa";
import PoApprovalModel from "./PoApprovalModel";
import {
  getProjectOptions,
  getVendorOptions,
} from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import SearchIcon from "@mui/icons-material/Search";
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { getApprovedPOColumns } from "../../../../new/pages/procurement/POType.jsx";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box } from "@mui/system";
import { LinearProgress } from "@mui/material";
import { Visibility } from "@mui/icons-material";

export default function PoApproval() {
  const [loading, setLoading] = useState(false);
  const [wise, setWise] = useState("powise");
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
    { text: "PO Wise", value: "powise" },
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
      "/purchaseOrder/fetchneededApprovalPO",
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
    const response = await imsAxios.post("/purchaseOrder/updatePOApproval", {
      poid,
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
        arr.push(matched.po_transaction);
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
        arr.push(matched.po_transaction);
      }
    });
    setRejectPo(arr);
    // setApprovePo(arr);
  };

  const columns = useMemo(() => getApprovedPOColumns(), []);
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
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 250px)" : "calc(100vh - 300px)",
      },
    },

    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Purchase Orders Found" />
    ),
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() => {
          closeMenu?.();
          setViewPoDetails(row?.original?.po_transaction);
        }}
        table={table}
        disabled={loading}
      />,
    ],
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  useEffect(() => {
    const selectedRows = table
      .getSelectedRowModel()
      .flatRows.map((r) => r.original);
    setSelectedPo(selectedRows);
  }, [rowSelection, table]);

  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
        marginTop: 8,
        padding: "8px 8px",
      }}
    >
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
      <Row justify="space-between" style={{ paddingTop: 5, paddingBottom: 8 }}>
        <Col span={18}>
          <Row gutter={6} style={{ display: "flex", gap: 8 }}>
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
              {wise === "powise" && (
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
                  starticon={<SearchIcon fontSize="small" />}
                  loading={loading === "fetch"}
                  onclick={getRows}
                />
                <CustomButton
                  size="small"
                  title={" Approve Selected Po's"}
                  disabled={
                    Object.keys(rowSelection).length === 0 ||
                    selectedPo.length === 0 ||
                    loading === "fetch"
                  }
                  onclick={ApproveSelectedPo}
                />
                <CustomButton
                  size="small"
                  title={"Reject Selected Po's"}
                  disabled={
                    Object.keys(rowSelection).length === 0 ||
                    selectedPo.length === 0 ||
                    loading === "fetch"
                  }
                  onclick={RejectSelectedPo}
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
      <div style={{ height: "100%", paddingTop: 5 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
