import { useEffect, useRef, useState } from "react";
import "./r.css";
import "../../Store/MaterialTransfer/Modal/viewModal.css";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { Row, Col, Button, Spin, Select } from "antd";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import MyDataTable from "../../../Components/MyDataTable";
import Tooltip from "@mui/material/Tooltip";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
import { toast } from "react-toastify";

const R1 = () => {
  const [allResponseData, setAllResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({
    selectProduct: "",
    bom: "",
    date: "",
  });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const abortControllerRef = useRef(null);
  const { executeFun } = useApi();

  const getProductNameFetch = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      const { data } = response;
      setAsyncOptions(data || []);
    }
  };

  const getBom = async (product) => {
    if (!product) {
      setBomOptions([]);
      return;
    }
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: product,
    });
    const arr = (data?.data || []).map((d) => ({
      value: d.bomid,
      label: d.bomname,
    }));
    setBomOptions(arr);
  };

  useEffect(() => {
    getBom(filterData.selectProduct);
  }, [filterData.selectProduct]);

  const handleSearch = async () => {
    if (!filterData.selectProduct) {
      toast.error("Please select a SKU / Product");
      return;
    }
    if (!filterData.bom) {
      toast.error("Please select a BOM");
      return;
    }
    if (!filterData.date) {
      toast.error("Please select a Date");
      return;
    }

    // Create a fresh AbortController for this request.
    // Storing it in a ref means Cancel can reach it without a re-render.
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setAllResponseData([]);

      const { data } = await imsAxios.post(
        "/report1",
        {
          product: filterData.selectProduct,
          subject: filterData.bom,
          date: filterData.date,
          action: "search_r1",
        },
        { signal: abortControllerRef.current.signal }
      );

      if (data.code == 200) {
        const rows = data?.response?.data || [];
        const arr = rows.map((row) => ({ ...row, id: v4() }));
        setAllResponseData(arr);
      } else {
        toast.error(data.message?.msg || data.message);
      }
    } catch (error) {
      // Axios throws CanceledError when .abort() is called — swallow it silently.
      // Any other error (network, server) still shows the toast.
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        toast.error("Failed to fetch report");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Signal the in-flight axios request to stop immediately.
    abortControllerRef.current?.abort();
    setLoading(false);
    setAllResponseData([]);
  };

  const columns = [
    { field: "sku", headerName: "SKU", width: 60 },
    { field: "partno", headerName: "Part", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "components",
      headerName: "Component",
      width: 250,
    },
    {
      field: "bom_category",
      headerName: "Category",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Status",
      width: 150,
      type: "actions",
      renderCell: (a) =>
        a.row.bom_status ==
        '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>' ? (
          <div
            style={{
              width: "80%",
              textAlign: "center",
              backgroundColor: "#03C988",
            }}
          >
            <span style={{ color: "white", fontWeight: "bolder" }}>ACTIVE</span>
          </div>
        ) : a.row.bom_status ==
          '<span style="color: #e53935; font-weight: 600;">INACTIVE</span>' ? (
          <div
            style={{
              width: "80%",
              textAlign: "center",
              backgroundColor: "#FF1E00",
            }}
          >
            <span style={{ color: "white", fontWeight: "bolder" }}>
              INACTIVE
            </span>
          </div>
        ) : a.row.bom_status ==
          '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>' ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              backgroundColor: "#FFB200",
            }}
          >
            <span style={{ color: "white" }}>ALTERNATIVE</span>
          </div>
        ) : (
          ""
        ),
    },
    {
      field: "bomalt_name",
      headerName: "Alternate Of",
      width: 120,
      renderCell: ({ row }) => (
        <Tooltip title={row.bomalt_name}>{row.bomalt_part}</Tooltip>
      ),
    },
    { field: "bomqty", headerName: "BOM Qty", width: 100 },
    { field: "units_name", headerName: "UoM", width: 100 },
    { field: "opening", headerName: "Opening", width: 120 },
    { field: "inward", headerName: "Inward", width: 120 },
    { field: "outward", headerName: "Outward", width: 100 },
    { field: "closing", headerName: "Closing", width: 100 },
    {
      field: "weightedPurchaseRate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
    {
      field: "transit_in",
      headerName: "Order In Transit",
      width: 150,
    },
    {
      field: "lastrate",
      headerName: "Last Purchase Price",
      width: 180,
    },
    {
      field: "currency",
      headerName: "Currency",
      width: 180,
    },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = allResponseData;
    csvData = arr.map((row) => {
      return {
        Sku: row.sku,
        Part: row.partno,
        Component: row.components,
        Category: row.bom_category,
        Status:
          row.bom_status ==
          '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>'
            ? "ACTIVE"
            : row.bom_status ==
                '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>'
              ? "ALTERNATIVE"
              : "INACTIVE",
        "Alt Of": row.bomalt_name[0],
        "Bom Qty": row.bomqty,
        Uom: row.units_name,
        Opening: row.opening == 0 ? "0" : row.opening,
        Inward: row.inward == 0 ? "0" : row.inward,
        Outward: row.outward == 0 ? "0" : row.outward,
        Closing: row.closing == 0 ? "0" : row.closing,
        "Order In Transit": row.transit_in == 0 ? "0" : row.transit_in,
        "Last Purchase Price": row.lastrate == 0 ? "0" : row.lastrate,
        Currency: row.currency,
      };
    });
    downloadCSVCustomColumns(csvData, "Bom Wise Report");
  };

  return (
    <div style={{ height: "97%" }}>
      <Row gutter={12} align="middle" style={{ margin: "0 10px 10px 10px" }}>
        <Col span={7}>
          <MyAsyncSelect
            style={{ width: "100%" }}
            loadOptions={getProductNameFetch}
            onBlur={() => setAsyncOptions([])}
            value={filterData.selectProduct}
            placeholder="Product Name / SKU"
            optionsState={asyncOptions}
            onChange={(value) =>
              setFilterData((prev) => ({
                ...prev,
                selectProduct: value,
                bom: "",
              }))
            }
          />
        </Col>
        <Col span={5}>
          <Select
            style={{ width: "100%" }}
            placeholder="Select BOM"
            options={bomOptions}
            value={filterData.bom || undefined}
            onChange={(value) =>
              setFilterData((prev) => ({ ...prev, bom: value }))
            }
          />
        </Col>
        <Col span={6}>
          <MyDatePicker
            value={filterData.date}
            setDateRange={(value) =>
              setFilterData((prev) => ({ ...prev, date: value }))
            }
            size="default"
          />
        </Col>
        <Col span={3}>
          <Button
            type="primary"
            onClick={handleSearch}
            loading={loading}
            style={{ width: "100%" }}
          >
            Search
          </Button>
        </Col>
        <Col span={3} style={{ textAlign: "end" }}>
          {allResponseData.length >= 1 && (
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          )}
        </Col>
      </Row>

      <div className="hide-select" style={{ height: "87%", margin: "10px" }}>
        {loading ? (
          <div
            style={{
              height: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "10%",
                justifyContent: "space-around",
              }}
            >
              <Spin size="large" />
              <div style={{ borderLeft: "2px solid grey", height: "40px" }} />
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <MyDataTable
            checkboxSelection={true}
            data={allResponseData}
            columns={columns}
          />
        )}
      </div>
    </div>
  );
};

export default R1;
