import React, { useState, useEffect } from "react";
import MyDatePicker from "../../Components/MyDatePicker";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Button, Col, Input, Row, Select } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { ArrowRightOutlined } from "@ant-design/icons";
import JwReturnModel from "./Modal/JwReturnModel";
import { imsAxios } from "../../axiosInterceptor";
import useLoading from "../../hooks/useLoading";
import { getVendorOptions } from "../../api/general";
import { convertSelectOptions } from "../../utils/general";
import useApi from "../../hooks/useApi";

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
    { field: "index", headerName: "S No.", width: 8 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "transaction_id", headerName: "JW Id", width: 150 },
    { field: "vendor", headerName: "Vendor", width: 350 },
    { field: "sku_code", headerName: "SKU", width: 100 },
    { field: "sku_name", headerName: "Name", width: 300 },
    { field: "ord_qty", headerName: "Required Qty", width: 150 },
    // { field: "jw_sku_name", headerName: "Actions", width: 260 },
    {
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: ({ row }) => [
        // <TableActions action="view" onClick={() => setViewModalOpen(row)} />,
        // <TableActions action="cancel" onClick={() => setCloseModalOpen(row)} />,
        // <TableActions action="print" onClick={() => console.log(row)} />,
        // <TableActions action="edit" />,

        <ArrowRightOutlined
          onClick={() =>
            setEditModal({ sku: row.sku, transaction: row.transaction_id })
          }
          style={{ color: "#1890ff", fontSize: "15px" }}
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
        {allData.setType == "datewise" ? (
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
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchJWwise}
              >
                Fetch
              </Button>
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
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchSKUwise}
              >
                Fetch
              </Button>
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
              <Button
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </Button>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "89%", margin: "10px" }}>
        {allData.setType == "datewise" ? (
          <MyDataTable
            loading={loading("fetch")}
            data={dateData}
            columns={columns}
          />
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

      <JwReturnModel show={editModal} close={() => setEditModal(false)} />
    </div>
  );
};

export default JwrmReturn;
