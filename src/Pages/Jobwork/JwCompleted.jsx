import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import MyDatePicker from "../../Components/MyDatePicker";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { EyeTwoTone } from "@ant-design/icons";
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
    { field: "index", headerName: "S No.", width: 18 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "transaction_id", headerName: "JW Id.", width: 150 },
    { field: "sku_code", headerName: "SKU", width: 100 },
    { field: "sku_name", headerName: "Product", width: 510 },
    { field: "ord_qty", headerName: "Order Qty", width: 120 },
    // { field: "jw_sku_name", headerName: "Actions", width: 260 },
    {
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: ({ row }) => [
        <TableActions
          action="print"
          onClick={() => handlePrint(row.transaction_id)}
        />,
        <TableActions
          action="download"
          onClick={() => handleDownload(row.transaction_id)}
        />,
        <TableActions
          action="view"
          onClick={() =>
            setViewModalOpen({
              jwId: row.transaction_id,
              po_sku_transaction: row.transaction_id,
              skuKey: row.sku_key,
            })
          }
        />,
      ],
    },
  ];
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
              <MyButton
                variant="search"
                type="primary"
                loading={loading}
                onClick={fetchDatewise}
              >
                Fetch
              </MyButton>
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
              <MyButton
                variant="search"
                loading={loading}
                type="primary"
                onClick={fetchJWwise}
              >
                Fetch
              </MyButton>
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
              <MyButton
                variant="search"
                loading={loading}
                type="primary"
                onClick={fetchSKUwise}
              >
                Fetch
              </MyButton>
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
              <MyButton
                variant="search"
                loading={loading}
                type="primary"
                onClick={fetchVendorwise}
              >
                Fetch
              </MyButton>
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
                loading={loading}
                onClick={fetchDatewise}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "89%", margin: "10px" }}>
        {allData.setType == "datewise" ? (
          <MyDataTable loading={loading} data={dateData} columns={columns} />
        ) : allData.setType == "jw_transaction_wise" ? (
          <MyDataTable data={jwData} columns={columns} />
        ) : allData.setType == "jw_sfg_wise" ? (
          <MyDataTable data={skuData} columns={columns} />
        ) : allData.setType == "vendorwise" ? (
          <MyDataTable data={vendorData} columns={columns} />
        ) : (
          <MyDataTable data={dateData} columns={columns} />
        )}
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
