import { useState, useEffect, useMemo } from "react";
import { Col, Input, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import ViewComponentSideBar from "./Sidebars/ViewComponentSideBar";
import EditPO from "./EditPO/EditPO";
import MateirialInward from "./MaterialIn/MateirialInward";
import CancelPO from "./Sidebars/CancelPO";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import UploadDoc from "./UploadDoc";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import SearchIcon from "@mui/icons-material/Search";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { getManagePOColumns } from "../../../new/pages/procurement/POType.jsx";
import { Box, LinearProgress } from "@mui/material";
import {
  Download,
  Edit,
  Visibility,
  Print,
  Cancel,
  Upload,
} from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";

const ManagePO = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showViewSidebar, setShowViewSideBar] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [componentData, setComponentData] = useState(null);
  const [wise, setWise] = useState("po_wise");
  const [rows, setRows] = useState([]);
  const [updatePoId, setUpdatePoId] = useState(null);
  const [materialInward, setMaterialInward] = useState(null);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [showUploadDocModal2, setShowUploadDocModal2] = useState(null);
  const [showCancelPO, setShowCancelPO] = useState(null);
  const [newPoLogs, setnewPoLogs] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { value: "single_date_wise", text: "Date Wise" },
    { value: "po_wise", text: "PO ID Wise" },
    { value: "vendor_wise", text: "Vendor Wise" },
  ];
  const printFun = async (poid, close) => {
    close?.();
    setLoading(true);
    const { data } = await imsAxios.post("/poPrint", {
      poid: poid,
    });

    printFunction(data.data.buffer.data);
    setLoading(false);
  };

  const handleCancelPO = async (poid, close) => {
    close?.();
    setLoading(true);
    const { data } = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
      purchaseOrder: poid,
    });
    setLoading(false);
    if (data.code == 200) {
      setShowCancelPO(poid);
    } else {
      toast.error("PO is already cancelled");
    }
  };
  const handleDownload = async (poid, close) => {
    close?.();
    setLoading(true);
    const { data } = await imsAxios.post("/poPrint", {
      poid: poid,
    });
    setLoading(false);
    let filename = `PO ${poid}`;
    downloadFunction(data.data.buffer.data, filename);
  };

  const columns = useMemo(() => getManagePOColumns(), []);
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
    muiTableContainerProps: {
      sx: {
        height:
          loading || viewLoading || searchLoading
            ? "calc(100vh - 240px)"
            : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Purchase Orders Found" />
    ),

    renderTopToolbar: () =>
      loading || viewLoading || searchLoading ? (
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
        icon={<Edit />}
        key="edit"
        label="Edit"
        onClick={() => getPoDetail(row?.original?.po_transaction, closeMenu)}
        table={table}
        disabled={row.original.approval_status === "C" || viewLoading}
      />,
      <MRT_ActionMenuItem
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() =>
          getComponentData(
            row.original?.po_transaction,
            row?.original?.approval_status,
            closeMenu
          )
        }
        table={table}
        disabled={viewLoading}
      />,
      <MRT_ActionMenuItem
        icon={<Download />}
        key="download"
        label="Download"
        onClick={() => handleDownload(row?.original?.po_transaction, closeMenu)}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Print />}
        key="print"
        label="Print"
        onClick={() => printFun(row?.original?.po_transaction, closeMenu)}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Cancel />}
        key="cancel"
        label="Cancel"
        onClick={() => handleCancelPO(row?.original?.po_transaction, closeMenu)}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Upload />}
        key="upload"
        label="Upload File"
        onClick={() => {}}
        table={table}
      />,
    ],
  });
  const getSearchResults = async () => {
    setRows([]);
    let search;
    if (wise == "single_date_wise") {
      search = searchDateRange;
    } else {
      search = null;
    }
    if (searchInput || search) {
      setSearchLoading(true);
      const { data } = await imsAxios.post(
        "/purchaseOrder/fetchPendingData4PO",
        {
          data:
            wise == "vendor_wise"
              ? searchInput
              : wise == "po_wise"
              ? searchInput.trim()
              : wise == "single_date_wise" && searchDateRange,
          wise: wise,
        }
      );
      setSearchLoading(false);
      if (data.code == 200) {
        let arr = data?.data?.map((row, index) => ({
          ...row,
          id: row.po_transaction,
          index: index + 1,
        }));
        setRows(arr);
      } else {
        if (data.message.msg) {
          toast.error(data.message.msg);
        } else {
          toast.error(data.message);
        }
      }
    } else {
      if (wise == "single_date_wise" && searchDateRange == null) {
        toast.error("Please select start and end dates for the results");
      } else if (wise == "po_wise") {
        toast.error("Please enter a PO id");
      } else if (wise == "vendor_wise") {
        toast.error("Please select a vendor");
      }
    }
  };
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };
  //getting component view data
  const getComponentData = async (poid, status, close) => {
    close?.();
    setViewLoading(true);
    const { data } = await imsAxios.post(
      "/purchaseOrder/fetchComponentList4PO",
      {
        poid,
      }
    );
    setViewLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: index,
        };
      });
      setComponentData({ poid: poid, components: arr, status: status });

      setShowViewSideBar(true);
      getPoLogs(poid);
    } else {
      toast.error(data.message);
    }
  };

  const getPoLogs = async (po_id) => {
    const { data } = await imsAxios.post("/purchaseOthers/pologs", {
      po_id,
    });
    if (data.code === "200" || data.code == 200) {
      let arr = data.data;
      setnewPoLogs(arr.reverse());
      // console.logg("data for po logs", arr);
    }
  };
  const getPoDetail = async (poid, close) => {
    close?.();
    setLoading(true);
    const { data, message } = await imsAxios
      .post("/purchaseOrder/fetchData4Update", {
        pono: poid.replaceAll("_", "/"),
      })
      .then((res) => {
        if (res.code == 500) {
          toast.error(res.message.msg);
          setLoading(false);
        } else {
          return res;
        }
      });
    setLoading(false);
    if (data?.code == 200) {
      setUpdatePoId({
        ...data.data.bill,
        materials: data.data.materials,
        ...data.data.ship,
        ...data.data.vendor[0],
      });
    } else {
      toast.error(data?.message || message);
    }
  };
  useEffect(() => {
    console.log("this is the wise in po", wise);
  }, [wise]);

  return (
    <div
      className="manage-po"
      style={{
        position: "relative",
        height: "calc(100vh - 100px)",
        marginTop: 8,
      }}
    >
      <Row justify="space-between" style={{ padding: "4px 10px" }}>
        <Col>
          <Space style={{ paddingTop: 5, paddingBottom: 8 }}>
            <div style={{ width: 150 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "single_date_wise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : wise === "po_wise" ? (
                <Input
                  style={{ width: "100%" }}
                  type="text"
                  placeholder="Enter Po Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : (
                wise === "vendor_wise" && (
                  <MyAsyncSelect
                    size="default"
                    selectLoading={loading1("select")}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={(value) => setSearchInput(value)}
                    loadOptions={getVendors}
                    optionsState={asyncOptions}
                    placeholder="Select Vendor..."
                  />
                )
              )}
            </div>

            <CustomButton
              size="small"
              title={"Search"}
              starticon={<SearchIcon fontSize="small" />}
              loading={searchLoading}
              disabled={
                wise === "single_date_wise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              onclick={getSearchResults}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <UploadDoc
        setShowUploadDocModal2={setShowUploadDocModal2}
        showUploadDocModal2={showUploadDocModal2}
      />
      <CancelPO
        getSearchResults={getSearchResults}
        setShowCancelPO={setShowCancelPO}
        showCancelPO={showCancelPO}
        setRows={setRows}
        rows={rows}
      />

      <EditPO updatePoId={updatePoId} setUpdatePoId={setUpdatePoId} />

      <MateirialInward
        materialInward={materialInward}
        setMaterialInward={setMaterialInward}
        asyncOptions={asyncOptions}
        setAsyncOptions={setAsyncOptions}
      />
      <div
        style={{
          height: "85%",
          padding: "0 10px",
        }}
      >
        <MaterialReactTable table={table} />
      </div>
      <ViewComponentSideBar
        getPoLogs={getPoLogs}
        newPoLogs={newPoLogs}
        setnewPoLogs={setnewPoLogs}
        setShowViewSideBar={setShowViewSideBar}
        showViewSidebar={showViewSidebar}
        componentData={componentData}
      />
    </div>
  );
};

export default ManagePO;
