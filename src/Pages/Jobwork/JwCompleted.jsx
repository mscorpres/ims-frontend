import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDatePicker from "../../Components/MyDatePicker";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import CompletedModal from "./Modal/CompletedModal";
import { imsAxios } from "../../axiosInterceptor";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import TableActions from "../../Components/TableActions.jsx/TableActions";
import ViewModal from "./Modal/ViewModal";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import useApi from "../../hooks/useApi.ts";
import MyButton from "../../Components/MyButton";
import { Box, LinearProgress, Tooltip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Download, Print, Search, Visibility } from "@mui/icons-material";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback.jsx";

const JwCompleted = () => {
  const [viewModalOpen, setViewModalOpen] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [allData, setAllData] = useState({
    setType: "datewise",
    jw: "",
    sku: "",
    ven: "",
  });

  const option = [
    { label: "Date Wise", value: "datewise" },
    { label: "JW ID Wise", value: "jw_transaction_wise" },
    { label: "SFG SKU Wise", value: "jw_sfg_wise" },
    { label: "Vendor Wise", value: "vendorwise" },
  ];

  const [dateData, setDateData] = useState([]);
  const [jwData, setDJWData] = useState([]);
  const [skuData, setSKUData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const getOption = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/getProductByNameAndNo", {
        search: e,
      });
      // console.log(data);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const handlePrint = async (d) => {
    setLoading("print");
    const { data } = await imsAxios.post("/jobwork/print_jw_analysis", {
      transaction: d,
    });
    setLoading(false);
    printFunction(data.data.buffer.data);
  };
  const handleDownload = async (d) => {
    setLoading("print");
    const { data } = await imsAxios.post("/jobwork/print_jw_analysis", {
      transaction: d,
    });
    setLoading(false);
    downloadFunction(data.data.buffer.data, d);
  };

  const getVendor = async (search) => {
    if (search.length > 2) {
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

  const fetchDatewise = async () => {
    if (allData?.setType == "") {
      toast.error("Please Select Option");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("jobwork/fetch_jw_completed_list", {
        data: datee,
        wise: allData.setType,
      });
      if (data.code == 200) {
        let arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setDateData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const fetchJWwise = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/jobwork/fetch_jw_completed_list", {
      data: allData.jw,
      wise: allData.setType,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setDJWData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const fetchSKUwise = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/jobwork/fetch_jw_completed_list", {
      data: allData.sku,
      wise: allData.setType,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setSKUData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const fetchVendorwise = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/jobwork/fetch_jw_completed_list", {
      data: allData.ven,
      wise: allData.setType,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setVendorData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const columns = [
    { accessorKey: "index", header: "S No.", size: 18 },
    { accessorKey: "status", header: "Status", size: 120 },
    { accessorKey: "date", header: "JW Date", size: 120 },
    { accessorKey: "transaction_id", header: "JW Id.", size: 150 },
    { accessorKey: "sku_code", header: "SKU", size: 100 },
    { accessorKey: "sku_name", header: "Product", size: 510 },
    { accessorKey: "ord_qty", header: "Order Qty", size: 120 },
  ];

  const table = useMaterialReactTable({
    columns: columns,
    data:
      allData.setType == "datewise"
        ? dateData
        : allData.setType == "jw_transaction_wise"
        ? jwData
        : allData.setType == "jw_sfg_wise"
        ? skuData
        : allData.setType == "vendorwise"
        ? vendorData
        : dateData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        key="download"
        icon={<Download />}
        label="Download"
        onClick={() => {
          handleDownload(row?.original?.transaction_id);
          closeMenu();
        }}
        table={table}
      />,

      <MRT_ActionMenuItem
        key="print"
        icon={<Print />}
        label="Print"
        onClick={() => {
          () => handlePrint(row?.original?.transaction_id);
          closeMenu();
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="view"
        icon={<Visibility />}
        label="View"
        onClick={() => {
          setViewModalOpen({
            jwId: row?.original?.transaction_id,
            po_sku_transaction: row?.original?.transaction_id,
            skuKey: row?.original?.sku_key,
          });

          closeMenu();
        }}
        table={table}
      />,
    ],
  });

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "10px" }}>
        <Col span={4}>
          <Select
            placeholder="Please Select Option"
            style={{ width: "100%" }}
            options={option}
            value={allData.setType.value}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, setType: e };
              })
            }
          />
        </Col>
        {allData.setType == "datewise" ? (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={fetchDatewise}
              />
            </Col>
          </>
        ) : allData.setType == "jw_transaction_wise" ? (
          <>
            <Col span={6}>
              <Input
                placeholder="JW/Challan"
                value={allData.jw}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, jw: e.target.value };
                  })
                }
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={fetchJWwise}
              />
            </Col>
          </>
        ) : allData.setType == "jw_sfg_wise" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getOption}
                value={allData.sku}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, sku: e };
                  })
                }
                placeholder="SFG SKU wise"
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={fetchSKUwise}
              />
            </Col>
          </>
        ) : allData.setType == "vendorwise" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getVendor}
                value={allData.ven}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, ven: e };
                  })
                }
                placeholder="Vendor wise"
                loading={loading1("select")}
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={fetchVendorwise}
              />
            </Col>
          </>
        ) : (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={fetchDatewise}
              />
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "89%", margin: "10px" }}>
        <MaterialReactTable table={table} />
      </div>

      <CompletedModal editModal={editModal} setEditModal={setEditModal} />
      <ViewModal
        setViewModalOpen={setViewModalOpen}
        viewModalOpen={viewModalOpen}
      />
    </div>
  );
};

export default JwCompleted;
