import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
const { TextArea } = Input;

function RmtoRm() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    locationFrom: "",
    companyBranch: "",
    comment: "",
    locationTo: "",
    component: "",
    qty1: "",
    tobranch: "",
  });
  // console.log(allData);

  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [branchName, setbBanchName] = useState([]);
  const [qty, setQty] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const [locationName, setLocationName] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  // console.log(branchName);
  const getLocationFunction = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationForRM2RM_from");

    let v = [];
    data.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionData(v);
  };
  const getLocationFunctionTo = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationForRM2RM_to");

    let v = [];
    data.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionDataTo(v);
  };

  const branchInfoFunction = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_from", {
      location_key: allData.locationFrom,
    });
    // console.log(data.data);
    setbBanchName(data.data);
  };

  const getComponentList = async (e) => {
    if (e?.length > 2) {
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      // return arr;
      setAsyncOptions(arr);
    }
  };

  const getQtyFuction = async () => {
    const { data } = await imsAxios.post("/godown/godownStocks", {
      component: allData.component,
      location: allData.locationFrom,
    });

    // console.log(data);

    setQty(data.data);
  };

  const saveRmToRm = async () => {
    if (!allData.locationFrom) {
      toast.error("Please enter location");
    } else if (!allData.component) {
      toast.error("Please Enter component");
    } else if (!allData.qty1) {
      toast.error("Please Enter a qty");
    } else if (!allData.locationTo) {
      toast.error("Please enter location");
    } else if (allData.locationFrom == allData.locationTo) {
      toast.error("Both Location Same....");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/godown/transferRM2RM", {
        // companybranch: "BRMSC012",
        comment: allData.comment,
        fromlocation: allData.locationFrom,
        component: [allData.component],
        tolocation: [allData.locationTo],
        qty: [allData.qty1],
        type: "RM2RM",
        tobranch: allData.tobranch,
      });
      if (data.code == 200) {
        // setAllData({
        //   comment: "",
        // });
        // toast.success(
        //   "This Component Transfer `${allData.locationTo.label} -> ${allData.locationFrom.label}`"
        // );
        toast.success(data.message.toString()?.replaceAll("<br/>", ""));
        setAllData({
          locationFrom: "",
          companyBranch: "",
          comment: "",
          locationTo: "",
          component: "",
          qty1: "",
          tobranch: "",
        });
        setbBanchName("");
        setLocationName("");
        setQty("");
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const handleBranchSelection = async (branchCode) => {
    try {
      const { data } = await imsAxios.post("/location/fetchLocationBranch", {
        branch: branchCode,
      });
      let arr = [];
      const list = data?.data ?? data; // support both shapes
      if (Array.isArray(list)) {
        list.map((a) => arr.push({ label: a.text, value: a.id }));
      }
      setloctionDataTo(arr);
      setAllData((prev) => ({ ...prev, locationTo: "" }));
    } catch (error) {
      console.error("Error fetching locations for branch", error);
      toast.error("Failed to fetch drop locations for selected branch");
    }
  };

  const getLocationName = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: allData?.locationTo,
    });
    setLocationName(data.data);
  };

  const reset = async (e) => {
    e.preventDefault();
    setAllData({
      locationFrom: "",
      companyBranch: "",
      comment: "",
      locationTo: "",
      component: "",
      qty1: "",
      tobranch: "",
    });
    setbBanchName("");
    setLocationName("");
    setQty("");
  };

  useEffect(() => {
    getLocationFunction();
    getLocationFunctionTo();
  }, []);

  useEffect(() => {
    if (allData.locationFrom) {
      branchInfoFunction();
    }
  }, [allData?.locationFrom]);

  useEffect(() => {
    if (allData?.locationFrom && allData?.component) {
      getQtyFuction();
    }
  }, [allData?.locationFrom, allData?.component]);

  useEffect(() => {
    if (allData.locationTo) {
      getLocationName();
    }
  }, [allData.locationTo]);

  return (
    <div style={{ height: "95%" }}>
      {/* <InternalNav links={Main} /> */}
      <Row gutter={10} style={{ padding: "10px", height: "79vh" }}>
        <Col span={6}>
          <Row gutter={10} style={{ margin: "5px" }}>
            <Col span={24} style={{ marginBottom: "10px", width: "100%" }}>
              <span>PICK LOCATION</span>
            </Col>
            <Col span={24}>
              <Select
                placeholder="Please Select Location"
                style={{ width: "100%" }}
                options={locData}
                value={allData.locationFrom}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, locationFrom: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "10px" }}>
              <TextArea rows={2} disabled value={branchName} />
            </Col>
            <Col span={24} style={{ marginTop: "10px" }}>
              <TextArea
                rows={2}
                value={allData.comment}
                placeholder="Comment Optional"
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, comment: e.target.value };
                  })
                }
              />
            </Col>
          </Row>
        </Col>

        <Col span={18}>
          <Row gutter={10}>
            <Col span={24}>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "38vh",
                }}
              >
                <table
                  style={{
                    tableLayout: "fixed",
                    width: "100%",
                    minWidth: 1200,
                  }}
                >
                  <tr>
                    <th className="an" style={{ width: "18vw" }}>
                      Component/Part No.
                    </th>
                    <th className="an" style={{ width: "12vw" }}>
                      STOCK QUANTITY
                    </th>
                    <th className="an" style={{ width: "12vw" }}>
                      TRANSFERING QTY
                    </th>
                    <th className="an" style={{ width: "14vw" }}>
                      DROP (+) Branch
                    </th>
                    <th className="an" style={{ width: "14vw" }}>
                      DROP (+) Loc
                    </th>
                    <th className="an" style={{ width: "12vw" }}>
                      Weighted Average Rate
                    </th>
                  </tr>
                  <tr>
                    <td style={{ width: "18vw" }}>
                      <MyAsyncSelect
                        style={{ width: "100%" }}
                        loadOptions={getComponentList}
                        onBlur={() => setAsyncOptions([])}
                        onInputChange={(e) => setSearch(e)}
                        placeholder="Part Name/Code"
                        value={allData.component}
                        optionsState={asyncOptions}
                        onChange={(e) =>
                          setAllData((allData) => {
                            return { ...allData, component: e };
                          })
                        }
                      />
                    </td>
                    <td style={{ width: "12vw" }}>
                      <Input
                        suffix={qty?.unit}
                        // style={{ width: "100%" }}
                        disabled
                        value={
                          qty?.available_qty
                            ? `${qty?.available_qty} ${qty?.unit}`
                            : "0"
                        }
                      />
                    </td>
                    <td style={{ width: "12vw" }}>
                      <Input
                        // style={{ width: "20%" }}
                        value={allData?.qty1}
                        onChange={(e) =>
                          setAllData((allData) => {
                            return { ...allData, qty1: e.target.value };
                          })
                        }
                        suffix={qty?.unit}
                      />
                    </td>
                    <td style={{ width: "14vw" }}>
                      <MySelect
                        options={[
                          { text: "A-21 [BRMSC012]", value: "BRMSC012" },
                          { text: "B-29 [BRMSC029]", value: "BRMSC029" },
                          { text: "B-36 Alwar [BRBA036]", value: "BRBA036" },
                          { text: "D-160", value: "BRBAD116" },
                        ]}
                        placeholder="Check Location"
                        value={allData.tobranch}
                        onChange={async (e) => {
                          setAllData((prev) => ({ ...prev, tobranch: e }));
                          await handleBranchSelection(e);
                        }}
                      />
                    </td>
                    <td style={{ width: "14vw" }}>
                      <Select
                        style={{ width: "100%" }}
                        options={locDataTo}
                        value={allData.locationTo}
                        placeholder="Location"
                        onChange={(e) =>
                          setAllData((allData) => {
                            return { ...allData, locationTo: e };
                          })
                        }
                      />
                    </td>
                    <td style={{ width: "12vw", textAlign: "center" }}>
                      <Input disabled value={qty?.avr_rate} />
                    </td>
                  </tr>
                </table>
              </div>
            </Col>
            {allData.locationTo && (
              <Col span={24}>
                <TextArea disabled value={locationName} />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
      <NavFooter
        nextLabel="Transfer"
        submitFunction={saveRmToRm}
        resetFunction={reset}
        loading={loading}
      />
    </div>
  );
}

export default RmtoRm;