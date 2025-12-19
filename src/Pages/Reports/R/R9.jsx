import React, { useState, useEffect } from "react";
import "./r.css";
import axios from "axios";

import { Button, Col, DatePicker, Input, Row, Skeleton } from "antd";
import { toast } from "react-toastify";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import InternalNav from "../../../Components/InternalNav";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";

import { MdOutlineDownloadForOffline } from "react-icons/md";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";
import { Tooltip } from "@mui/material";
const { TextArea } = Input;
function R9() {
  const [locDataTo, setloctionDataTo] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [seacrh, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [bomName, setBomName] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
    selectLocation: "",
  });
  // console.log(allData);
  const [resData, setResData] = useState([]);
  const [locationDetail, setLocationDetail] = useState("");

  const { executeFun, loading1 } = useApi();
  const handleDownloadingCSV = () => {
    //   let arr = [];
    //   let csvData = [];
    //   arr = resData;
    //   csvData = arr.map((row) => {
    //     console.log(row);
    //     return {
    //       "Part No": row.partno,
    //       // "S.No": row.serial_no,
    //       Component: row.components,
    //       Category: row.category,
    //       Status: row.status,
    //       // Status:
    //       //   row.status ==
    //       //   '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>'
    //       //     ? "Active"
    //       //     : row.status ==
    //       //       '<span style="color: #e53935; font-weight: 600;">INACTIVE</span>'
    //       //     ? "Inactive"
    //       //     : row.status ==
    //       //       '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>'
    //       //     ? "Alternative"
    //       //     : "",
    //       "Alt Of": row.bomalt_part,
    //       "Bom Qty": row.bomqty,
    //       // "PRD MFG": row.mfg_qty,
    //       UOM: row.uom,
    //       "OP Qty": row.openBal == 0 ? "0" : row.openBal,
    //       "IN Qty": row.creditBal == 0 ? "0" : row.creditBal,
    //       "OUT Qty": row.debitBal == 0 ? "0" : row.closicreditBalngBal,
    //       "CL Qty": row.closingBal == 0 ? "0" : row.closingBal,
    //     };
    //   });
    //   downloadCSVCustomColumns(csvData, "Location Wise BOM Report");
    downloadCSV(resData, columns, "Location Wise BOM Report");
  };

  const getDataBySearch = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      setAsyncOptions(response.data);
    }
  };

  const emitDownloadEvent = async () => {

console.log("object")
    const payload = {
      skucode: allData.selectProduct,
      subject: allData.selectBom,
      date: selectDate,
    };
    console.log(payload);
    socket.emit("bomRecipe", {
      otherdata: payload,
    });
  };

  const getDataByLocation = async (e) => {
    const { data } = await imsAxios.post("/backend/fetchLocation");
    let v = [];
    data?.map((ad) => v.push({ text: ad.text, value: ad.id }));
    setloctionDataTo(v);

    if (e.length > 3) {
      const { data } = await imsAxios.post("/backend/fetchLocation", {
        searchTerm: e,
      });

      if (data.code == 500) {
        toast.error(data.massage);
      } else {
        let arr = [];
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setloctionDataTo(arr);
      }
    }
  };

  const getBom = async () => {
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData?.selectProduct,
    });
    console.log(data.data);
    const arr = data.data.map((d) => {
      return { value: d.bomid, text: d.bomname };
    });
    setBomName(arr);
  };

  const fetchBySearch = async () => {
    if (!allData.selectProduct) {
      toast.error("Please select a product");
    } else if (!allData.selectBom) {
      toast.error("Please select a bom");
    } else if (!allData.selectLocation) {
      toast.error("Please select a Location");
    } else if (!selectDate[0]) {
      toast.error("Please select a valid date");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/report9", {
        skucode: allData.selectProduct,
        subject: allData.selectBom,
        location: allData.selectLocation,
        date: selectDate,
        action: "search_r9",
      });
      // console.log(data);
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return {
            ...row,
            id: v4(),
            statusHtml: row.status,
            status: row.status?.includes("INACTIVE")
              ? "INACTIVE"
              : row.status.includes("ALTERNATIVE")
              ? "ALTERNATIVE"
              : row.status.includes("ACTIVE")
              ? "ACTIVE"
              : "",
          };
        });
        setResData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        setLoading(true);
        toast.error(data.message);
        setLoading(false);
      }
    }
  };

  const getLocationFunctionTo = async (e) => {
    const { data } = await imsAxios.post("/backend/fetchLocation", {
      seacrhTerm: e,
    });
    // console.log(data);

    let v = [];
    data.map((ad) => v.push({ text: ad.text, value: ad.id }));
    setloctionDataTo(v);
  };

  const getLocationShow = async () => {
    const { data } = await imsAxios.post("/report9/fetchLocationDetail", {
      location_key: allData?.selectLocation,
    });
    setLocationDetail(data?.data);
  };

  const columns = [
    // { field: "dt", headerName: "S.No.", width: 150 },
    { field: "partno", headerName: "Part No", width: 80 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "components",
      headerName: "Component",
      width: 380,
    },
    { field: "category", headerName: "Category", width: 100 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      type: "status",
      renderCell: ({ row }) => (
        <span dangerouslySetInnerHTML={{ __html: row.statusHtml }} />
      ),
    },
    { field: "bomalt_part", headerName: "Alt Of", width: 120, renderCell:({row})=> (<Tooltip title={row.bomalt_name}>{row.bomalt_part}</Tooltip>) },
    { field: "bomqty", headerName: "Bom Qty", width: 120 },
    { field: "uom", headerName: "UoM", width: 100 },
    { field: "openBal", headerName: "Op Qty", width: 100 },
    { field: "creditBal", headerName: "In Qty", width: 100 },
    { field: "debitBal", headerName: "Out Qty", width: 100 },
    { field: "closingBal", headerName: "Cl Qty", width: 100 },
    {
      field: "weightedPurchaseRate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
  ];

  // const reset = () => {
  //   setAllData({
  //     selectProduct: "",
  //     selectBom: "",
  //     selectLocation: "",
  //   });
  //   setResData([]);
  // };

  useEffect(() => {
    if (allData?.selectProduct) {
      getBom();
    }
  }, [allData?.selectProduct]);

  useEffect(() => {
    if (allData.selectProduct || allData.selectBom) {
      getLocationFunctionTo();
    }
  }, [allData.selectProduct || allData.selectBom]);

  useEffect(() => {
    if (allData?.selectLocation) {
      getLocationShow();
    }
  }, [allData?.selectLocation]);

  useEffect(() => {
    getDataByLocation();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={5}>
          <Row gutter={16}>
            <Col span={24}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                placeholder="Select Product"
                loadOptions={getDataBySearch}
                value={allData.selectProduct.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectProduct: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              <MySelect
                placeholder="Select Bom"
                options={bomName}
                value={allData?.selectBom.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectBom: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                optionsState={locDataTo}
                placeholder="Select Location"
                loadOptions={getDataByLocation}
                onInputChange={(e) => setSearch(e)}
                value={allData.selectLocation.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectLocation: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              <SingleDatePicker setDate={setSelectDate} />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              {locationDetail.length > 1 && (
                <TextArea rows={3} disabled value={locationDetail} />
              )}
            </Col>
            {allData?.selectBom.length > 1 && (
              <Col span={24} style={{ marginTop: "5px" }}>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  {/* <Button
                    onClick={reset}
                    style={{ backgroundColor: "red", color: "white", marginRight: "5px" }}
                  >
                    Cancel
                  </Button> */}
                  <MyButton
                    variant="search"
                    onClick={fetchBySearch}
                    type="primary"
                  >
                    Generate
                  </MyButton>
                </div>
              </Col>
            )}
          </Row>
        </Col>
        <Col span={19}>
          <Row>
            {resData.length > 1 && (
              <Col span={24}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: "5px",
                  }}
                >
                  <Button onClick={()=>emitDownloadEvent()}>
                    <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
                  </Button>
                </div>
              </Col>
            )}
            <Col span={24}>
              <Skeleton loading={loading} active>
                <div className="hide-select" style={{ height: "75vh" }}>
                  <MyDataTable
                    checkboxSelection={true}
                    loading={loading}
                    data={resData}
                    columns={columns}
                  />
                </div>
              </Skeleton>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default R9;
