import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyDatePicker from "../../Components/MyDatePicker.jsx";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../Components/MyAsyncSelect.jsx";
import { v4 } from "uuid";
import MyDataTable from "../../Components/MyDataTable.jsx";
import { ArrowRightOutlined } from "@ant-design/icons";
import JwRmConsumptionModal from "./Modal/JwRmConsumptionModal.jsx";
import { imsAxios } from "../../axiosInterceptor.js";
import useLoading from "../../hooks/useLoading.js";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import MyButton from "../../Components/MyButton/index.jsx";

const JwRmConsumption = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading(false);
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
  // console.log(allData);
  const { executeFun, loading: loading1 } = useApi();
  const option = [
    { label: "Date Wise", value: "date" },
    { label: "JW ID Wise", value: "jw" },
    { label: "SFG SKU Wise", value: "sfg" },
    { label: "Vendor Wise", value: "vendor" },
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
      const response = await imsAxios.get(
        `jobwork/rm-consumption/view?data=${encodeURIComponent(datee)}&wise=${
          allData.setType
        }`
      );
      if (response.success) {
        let arr = response.data.map((row, index) => {
          return {
            id: v4(),
            index: index + 1,
            date: row.date,
            transaction_id: row.transaction,
            transaction: row.transaction,
            vendor: row.vendor?.name || "",
            vendorCode: row.vendor?.code || "",
            sku_code: row.product?.sku || "",
            sku_name: row.product?.name || "",
            productKey: row.product?.skey || "",
            ord_qty: row.qty?.order || "0",
            consump_qty: row.qty?.consump || "0",
            // Keep original nested structure for reference
            originalData: row,
          };
        });
        setDateData(arr);
        setLoading("fetch", false);
      } else {
        toast.error(response.message);
        setLoading("fetch", false);
      }
    }
  };

  const fetchJWwise = async () => {
    setLoading("fetch", true);
    const response = await imsAxios.get(
      `jobwork/rm-consumption/view?data=${allData.jw}&wise=${allData.setType}`
    );
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          id: v4(),
          index: index + 1,
          date: row.date,
          transaction_id: row.transaction,
          transaction: row.transaction,
          vendor: row.vendor?.name || "",
          vendorCode: row.vendor?.code || "",
          sku_code: row.product?.sku || "",
          sku_name: row.product?.name || "",
          productKey: row.product?.skey || "",
          ord_qty: row.qty?.order || "0",
          consump_qty: row.qty?.consump || "0",
          // Keep original nested structure for reference
          originalData: row,
        };
      });
      setDJWData(arr);
      setLoading("fetch", false);
    } else {
      toast.error(response.message);
      setLoading("fetch", false);
    }
  };

  const fetchSKUwise = async () => {
    setLoading("fetch", true);
    // Extract the value from the select object if it's an object
    const skuValue =
      typeof allData.sku === "object"
        ? allData.sku?.value || allData.sku?.id
        : allData.sku;
    const response = await imsAxios.get(
      `jobwork/rm-consumption/view?data=${skuValue}&wise=${allData.setType}`
    );
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          id: v4(),
          index: index + 1,
          date: row.date,
          transaction_id: row.transaction,
          transaction: row.transaction,
          vendor: row.vendor?.name || "",
          vendorCode: row.vendor?.code || "",
          sku_code: row.product?.sku || "",
          sku_name: row.product?.name || "",
          productKey: row.product?.skey || "",
          ord_qty: row.qty?.order || "0",
          consump_qty: row.qty?.consump || "0",
          // Keep original nested structure for reference
          originalData: row,
        };
      });
      setSKUData(arr);
      setLoading("fetch", false);
    } else {
      toast.error(response.message);
      setLoading("fetch", false);
    }
  };
  const fetchVendorwise = async () => {
    setLoading("fetch", true);
    // Extract the value from the select object if it's an object
    const venValue =
      typeof allData.ven === "object"
        ? allData.ven?.value || allData.ven?.id
        : allData.ven;
    const response = await imsAxios.get(
      `jobwork/rm-consumption/view?data=${venValue}&wise=${allData.setType}`
    );
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          id: v4(),
          index: index + 1,
          date: row.date,
          transaction_id: row.transaction,
          transaction: row.transaction,
          vendor: row.vendor?.name || "",
          vendorCode: row.vendor?.code || "",
          sku_code: row.product?.sku || "",
          sku_name: row.product?.name || "",
          productKey: row.product?.skey || "",
          ord_qty: row.qty?.order || "0",
          consump_qty: row.qty?.consump || "0",
          // Keep original nested structure for reference
          originalData: row,
        };
      });
      setVendorData(arr);
      setLoading("fetch", false);
    } else {
      toast.error(response.message);
      setLoading("fetch", false);
    }
  };

  const handleActionsClick = async (row) => {
    // Use transaction_id or transaction field from the mapped data
    const jwId =
      row?.transaction_id || row?.transaction || row?.originalData?.transaction;
    // Convert qty to number if it's a string
    const qty = parseFloat(row?.ord_qty) || 0;

    if (!jwId) {
      toast.error("JW ID is missing");
      return;
    }

    if (!qty || qty === 0) {
      toast.error("Order quantity is missing or invalid");
      return;
    }

    setLoading("fetch", true);
    try {
      // Execute GET request to fetch BOM data
      const response = await imsAxios.get(
        `/jobwork/rm-consumption/view/bom?jw=${encodeURIComponent(
          jwId
        )}&qty=${qty}`
      );

      if (response.success || response.data) {
        toast.success("BOM data fetched successfully");
        // Open the edit modal with the row data, including qty for BOM API call
        setEditModal({
          all: allData.setType,
          row: row,
          bomData: response.data || response,
          qty: qty, // Store qty for use in getFetchData
        });
      } else {
        toast.error(response.message || "Failed to fetch BOM data");
      }
      setLoading("fetch", false);
    } catch (error) {
      setLoading("fetch", false);
      toast.error(error.message || "Error fetching BOM data");
    }
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 80 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "vendor", headerName: "Vendor", width: 250 },
    { field: "transaction_id", headerName: "JW Id", width: 150 },
    { field: "sku_code", headerName: "SKU", width: 120 },
    { field: "sku_name", headerName: "Product", width: 300 },
    { field: "ord_qty", headerName: "JW PO Order Qty", width: 150 },
    { field: "consump_qty", headerName: "Consumed Qty", width: 150 },
    {
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ row }) => [
        <ArrowRightOutlined
          onClick={() => handleActionsClick(row)}
          style={{ color: "#1890ff", fontSize: "15px", cursor: "pointer" }}
        />,
      ],
    },
  ];
  return (
    <div style={{ height: "95%" }}>
      {/* <InternalNav links={JobworkLinks} /> */}
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
        {allData.setType == "date" ? (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "jw" ? (
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
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchJWwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "sfg" ? (
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
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchSKUwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "vendor" ? (
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
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchVendorwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <MyButton
                variant="search"
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "89%", margin: "10px" }}>
        {allData.setType == "date" ? (
          <MyDataTable
            loading={loading("fetch")}
            data={dateData}
            columns={columns}
          />
        ) : allData.setType == "jw" ? (
          <MyDataTable data={jwData} columns={columns} />
        ) : allData.setType == "sfg" ? (
          <MyDataTable data={skuData} columns={columns} />
        ) : allData.setType == "vendor" ? (
          <MyDataTable data={vendorData} columns={columns} />
        ) : (
          <MyDataTable data={dateData} columns={columns} />
        )}
      </div>

      <JwRmConsumptionModal
        editModal={editModal}
        setEditModal={setEditModal}
        fetchDatewise={fetchDatewise}
        fetchJWwise={fetchJWwise}
        fetchSKUwise={fetchSKUwise}
        fetchVendorwise={fetchVendorwise}
      />
    </div>
  );
};

export default JwRmConsumption;
