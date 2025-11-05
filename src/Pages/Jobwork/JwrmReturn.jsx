import React, { useState, useEffect } from "react";
import MyDatePicker from "../../Components/MyDatePicker";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Button, Col, Input, Row, Select } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { ArrowRightOutlined } from "@ant-design/icons";
import JwReturnModel from "./Modal/JwReturnModel";
import { imsAxios } from "../../axiosInterceptor";
import useLoading from "../../hooks/useLoading";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import useApi from "../../hooks/useApi.ts";
import MyButton from "../../Components/MyButton";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Search } from "@mui/icons-material";

const JwrmReturn = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading();
  const [editModal, setEditModal] = useState(false);
  const [datee, setDatee] = useState("");
  const [allData, setAllData] = useState({
    setType: "",
    jw: "",
    sku: "",
    ven: "",
  });

  const [dateData, setDateData] = useState([]);
  const [jwData, setDJWData] = useState([]);
  const [skuData, setSKUData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const option = [
    { label: "Date Wise", value: "datewise" },
    { label: "JW ID Wise", value: "jw_transaction_wise" },
    { label: "SFG SKU Wise", value: "jw_sfg_wise" },
    { label: "Vendor Wise", value: "vendorwise" },
  ];

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
      setLoading("fetch", true);
      const { data } = await imsAxios.post("/jobwork/fetchJwRmReturn", {
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
        setLoading("fetch", false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading("fetch", "fetch", false);
      }
    }
  };

  const fetchJWwise = async () => {
    setLoading("fetch", true);
    const { data } = await imsAxios.post("/jobwork/fetchJwRmReturn", {
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
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };

  const fetchSKUwise = async () => {
    setLoading("fetch", true);
    const { data } = await imsAxios.post("/jobwork/fetchJwRmReturn", {
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
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };
  const fetchVendorwise = async () => {
    setLoading("fetch", true);
    const { data } = await imsAxios.post("/jobwork/fetchJwRmReturn", {
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
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };

  const columns = [
    { accessorKey: "index", header: "S No.", size: 8 },
    { accessorKey: "date", header: "JW Date", size: 120 },
    { accessorKey: "transaction_id", header: "JW Id", size: 150 },
    { accessorKey: "vendor", header: "Vendor", size: 350 },
    { accessorKey: "sku_code", header: "SKU", size: 100 },
    { accessorKey: "sku_name", header: "Name", size: 300 },
    { accessorKey: "ord_qty", header: "Required Qty", size: 150 },
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
    renderRowActions: ({ row }) => (
      <CustomButton
        title={"Process"}
        size="small"
        onClick={() =>
          setEditModal({
            sku: row?.original?.sku,
            transaction: row?.original?.transaction_id,
          })
        }
      />
    ),
    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 240px)"
          : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") ? (
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
  });

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "12px" }}>
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
                loading={loading("fetch")}
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
                loading={loading("fetch")}
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
                placeholder="SFG SKU"
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading("fetch")}
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
                placeholder="Vendor"
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading("fetch")}
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
                loading={loading("fetch")}
                onclick={fetchDatewise}
              />
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "89%", margin: "10px" }}>
        <MaterialReactTable table={table} />
      </div>

      <JwReturnModel show={editModal} close={() => setEditModal(false)} />
    </div>
  );
};

export default JwrmReturn;
