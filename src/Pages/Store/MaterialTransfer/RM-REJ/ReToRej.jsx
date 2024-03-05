import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import NavFooter from "../../../../Components/NavFooter";
import { getComponentOptions } from "../../../../api/general";
import useApi from "../../../../hooks/useApi";
const { TextArea } = Input;

function ReToRej() {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allDataRej, setAllDataRej] = useState({
    locationFrom: "",
    comment: "",
    component: "",
    qty1: "",
    locationTo: "",
  });
  console.log(allDataRej);
  const [locationFrom, setLocationFrom] = useState([]);
  const [branch, setBranch] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const [qty, setQty] = useState([]);
  const [locationName, setLocationName] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  // console.log(allDataRej);
  // console.log(branch);

  // function start here
  const getLocationFunction = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationForRM2REJ_from");

    let v = [];
    data.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setLocationFrom(v);
  };

  const branchInfoFunction = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_from", {
      location_key: allDataRej.locationFrom,
    });
    // console.log(data.data);
    setBranch(data.data);
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
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const getQtyFuction = async () => {
    const { data } = await imsAxios.post("/godown/godownStocks", {
      component: allDataRej.component,
      location: allDataRej.locationFrom,
    });

    setQty(data.data);
  };

  const getLocationFunctionTo = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationForRM2REJ_to");

    let v = [];
    data.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionDataTo(v);
  };

  const saveRmToRej = async () => {
    if (allDataRej.locationFrom == allDataRej.locationTo) {
      toast.error("Drop Location Same");
    } else if (allDataRej.qty1 == "") {
      toast.error("Please Add Quantity");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/godown/transferRM2REJ", {
        // companybranch: "BRMSC012",
        comment: allDataRej?.comment,
        fromlocation: allDataRej?.locationFrom,
        component: [allDataRej?.component],
        tolocation: [allDataRej?.locationTo],
        qty: [allDataRej?.qty1],
        type: "RM2REJ",
      });
      // console.log(data);
      if (data.code == 200) {
        // toast.error(data.message?.msg?.toString()?.replaceAll("<br/>", ""));
        toast.success(data.message.toString()?.replaceAll("<br/>", ""));
        setAllDataRej({
          locationFrom: "",
          comment: "",
          component: "",
          qty1: "",
          locationTo: "",
        });
        setBranch("");
        setQty("");
        // toast.success(
        //   `This Component Transfer ${allDataRej.locationFrom.label} -> ${allDataRej.locationTo.label}`
        // );
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const getLocationName = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: allDataRej?.locationTo,
    });
    setLocationName(data.data);
  };

  const reset = async () => {
    setAllDataRej({
      locationFrom: "",
      comment: "",
      component: "",
      qty1: "",
      locationTo: "",
    });
    setBranch("");
    setQty("");
  };
  useEffect(() => {
    getLocationFunction();
    getLocationFunctionTo();
  }, []);

  useEffect(() => {
    if (allDataRej.locationFrom) {
      branchInfoFunction();
    }
  }, [allDataRej.locationFrom]);

  useEffect(() => {
    if (allDataRej.locationFrom && allDataRej.component) {
      // console.log("first")
      getQtyFuction();
    }
  }, [allDataRej.locationFrom, allDataRej.component]);

  useEffect(() => {
    if (allDataRej.locationTo) {
      getLocationName();
    }
  }, [allDataRej.locationTo]);
  return (
    <div style={{ height: "100%" }}>
      {/* <InternalNav links={MainREJ} /> */}

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
                options={locationFrom}
                value={allDataRej.locationFrom}
                onChange={(e) =>
                  setAllDataRej((allDataRej) => {
                    return { ...allDataRej, locationFrom: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "10px" }}>
              <TextArea rows={2} disabled value={branch} />
            </Col>
            <Col span={24} style={{ marginTop: "10px" }}>
              <TextArea
                rows={2}
                placeholder="Comment Optional"
                value={allDataRej.comment}
                onChange={(e) =>
                  setAllDataRej((allDataRej) => {
                    return { ...allDataRej, comment: e.target.value };
                  })
                }
              />
            </Col>
          </Row>
        </Col>

        <Col span={18}>
          <Row gutter={10}>
            <Col span={24}>
              <table>
                <tr>
                  <th className="an">Component/Part No.</th>
                  <th className="an">STOCK QUANTITY</th>
                  <th className="an">TRANSFERING QTY</th>
                  <th className="an">DROP (+) Loc</th>
                </tr>
                <tr>
                  <td>
                    <MyAsyncSelect
                      style={{ width: "100%" }}
                      loadOptions={getComponentList}
                      onInputChange={(e) => setSearch(e)}
                      onBlur={() => setAsyncOptions([])}
                      placeholder="Part Name/Code"
                      optionsState={asyncOptions}
                      value={allDataRej.component}
                      onChange={(e) =>
                        setAllDataRej((allDataRej) => {
                          return { ...allDataRej, component: e };
                        })
                      }
                    />
                  </td>
                  <td>
                    <Input
                      suffix={qty?.unit}
                      disabled
                      value={
                        qty?.available_qty
                          ? `${qty?.available_qty} ${qty?.unit}`
                          : "0"
                      }
                    />
                  </td>
                  <td>
                    <Input
                      suffix={qty?.unit}
                      value={allDataRej?.qty1}
                      onChange={(e) =>
                        setAllDataRej((allDataRej) => {
                          return { ...allDataRej, qty1: e.target.value };
                        })
                      }
                    />
                  </td>
                  <td>
                    <Select
                      style={{ width: "100%" }}
                      options={locDataTo}
                      value={allDataRej.locationTo}
                      onChange={(e) =>
                        setAllDataRej((allDataRej) => {
                          return { ...allDataRej, locationTo: e };
                        })
                      }
                    />
                  </td>
                </tr>
              </table>
            </Col>
            {allDataRej.locationTo && (
              <Col span={24}>
                <TextArea disabled value={locationName} />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
      <NavFooter
        nextLabel="Transfer"
        submitFunction={saveRmToRej}
        resetFunction={reset}
        loading={loading}
        // disabled={allDataRej.qty1 == "" ? false : true}
      />
      {/* <Row style={{ padding: "5px" }}>
        <Col span={24}>
          <div style={{ textAlign: "end" }}>
            <Button
              style={{
                backgroundColor: "red",
                color: "white",
                marginRight: "5px",
              }}
              onClick={reset}
            >
              Reset
            </Button>
            <Button type="primary" onClick={saveRmToRej}>
              Transfer
            </Button>
          </div>
        </Col>
      </Row> */}
    </div>
  );
}

export default ReToRej;
