import React, { useState, useEffect } from "react";
import { Col, Row, Input, Typography } from "antd";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useSelector } from "react-redux";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
const { paragraph } = Typography;

const { TextArea } = Input;
function MaterialTransfer({ type }) {
  // console.log(type)
  type == "sftorej"
    ? (document.title = "SF to REJ")
    : (document.title = "SF to SF");

  const [allData, setAllData] = useState({
    locationSel: "",
    detail: "",

    componentName: "",
    qty: "",
    rejLoc: "",
  });
  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  // console.log(allData)
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locationData, setLocationData] = useState([]);

  const [locDetail, setLocDetail] = useState("");
  const [restDetail, setRestDetail] = useState("");
  const [locRejDetail, setLocRejDetail] = useState("");

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  // console.log(restDetail)

  const getLocation = async () => {
    let link = "";
    console.log("nothing");
    if (type == "sftorej") {
      console.log("rejection goes on here");
      link = "/godown/fetchLocationForSF2REJ_from";
    } else {
      console.log("rejection does not goes on here");
      link = "/godown/fetchLocationForSF2SF_from";
    }
    const { data } = await imsAxios.post(link);
    let arr = [];
    data.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationData(arr);
  };

  const getLocationDetail = async () => {
    const { data } = await imsAxios.post("godown/fetchLocationDetail_from", {
      location_key: allData.locationSel,
    });
    // console.log(data.data)
    setLocDetail(data.data);
  };

  const getComponent = async (e) => {
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
    }
  };

  const getAllDetailComponent = async () => {
    const { data } = await imsAxios.post("/godown/godownStocks", {
      component: allData.componentName,
      location: allData.locationSel,
    });
    // console.log(data.data)
    setRestDetail(data.data);
  };

  const getDropLoc = async () => {
    if (type == "sftorej") {
      const { data } = await imsAxios.post("/godown/fetchLocationForSF2REJ_to");

      let arr = [];
      data.data.map((a) => arr.push({ text: a.text, value: a.id }));
      setLocRejDetail(arr);
    } else {
      const { data } = await imsAxios.post("/godown/fetchLocationForSF2SF_to");

      let arr = [];
      data.data.map((a) => arr.push({ text: a.text, value: a.id }));
      setLocRejDetail(arr);
    }
  };

  const getMoreDetail = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: allData.rejLoc,
    });
    // console.log(data)
    setAddress(data.data);
  };

  const submitHandler = async () => {
    if (allData?.rejLoc == allData?.locationSel) {
      return toast.error("Both Location Same ");
    } else if (allData?.componentName == "") {
      return toast.error("Please Select a location first");
    } else if (allData?.qty == "") {
      return toast.error("Please select add qty");
    } else if (allData?.rejLoc == "") {
      return toast.error("Please select Drop Location");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post(
        type == "sftorej" ? "/godown/transferSF2REJ" : "/godown/transferSF2SF",
        {
          comment: allData.detail,
          fromlocation: allData.locationSel,
          component: [allData.componentName],
          tolocation: [allData.rejLoc],
          qty: [allData.qty],
          type: type == "sftorej" ? "SF2REJ" : "SF2SF",
        }
      );

      if (data.code == 200) {
        setAllData({
          locationSel: "",
          detail: "",
          componentName: "",
          qty: "",
          rejLoc: "",
        });
        setRestDetail({
          available_qty: "",
        });
        setAddress("");
        setLocDetail("");
        setLoading(false);
        toast.success(data.message);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
        // setLoading(false);
      }
    }
  };

  const reset = () => {
    setAllData({
      locationSel: "",
      detail: "",
      componentName: "",
      qty: "",
      rejLoc: "",
    });
    setRestDetail({
      available_qty: "",
    });
    setAddress("");
  };

  useEffect(() => {
    getLocation();
    getDropLoc();
  }, []);

  useEffect(() => {
    if (allData.locationSel) {
      getLocationDetail();
    }
  }, [allData.locationSel]);

  useEffect(() => {
    if (allData?.locationSel && allData?.componentName) {
      getAllDetailComponent();
    }
  }, [allData?.locationSel && allData?.componentName]);

  useEffect(() => {
    if (allData?.rejLoc) {
      getMoreDetail();
    }
  }, [allData?.rejLoc]);

  useEffect(() => {
    if (allData?.locationSel) {
      if (allData?.locationSel && allData?.componentName) {
        getAllDetailComponent();
      }
    }
  }, [allData?.locationSel]);
  return (
    <div style={{ height: "90vh" }}>
      <Row gutter={10} style={{ margin: "10px" }}>
        <Col span={6}>
          <Row>
            <Col span={24} style={{ padding: "5px" }}>
              <span>PICK LOCATION</span>
              <MySelect
                options={locationData}
                placeholder="Check Location"
                value={allData.locationSel}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, locationSel: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ padding: "5px" }}>
              <TextArea disabled value={locDetail} />
            </Col>
            <Col span={24} style={{ padding: "5px" }}>
              <TextArea
                value={allData.detail}
                placeholder="Add Description"
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, detail: e.target.value };
                  })
                }
              />
            </Col>
          </Row>
        </Col>
        <Col span={18} style={{ border: "0.3px solid grey", height: "50vh" }}>
          <table className="table table-hover">
            <thead style={{ backgroundColor: "grey", color: "white" }}>
              <tr>
                <th style={{ width: "8vw" }}>Component/Part</th>
                <th style={{ width: "4vw" }}>In Stock Qty</th>
                <th style={{ width: "3vw" }}>Transfer Qty</th>
                <th style={{ width: "3vw" }}>DROP (+) Loc</th>
                <th style={{ width: "10vw" }}>Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: "8vw" }}>
                  <MyAsyncSelect
                    loadOptions={getComponent}
                    optionsState={asyncOptions}
                    value={allData.componentName}
                    selectLoading={loading1("select")}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, componentName: e };
                      })
                    }
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <paragraph>
                    {restDetail?.available_qty
                      ? `${restDetail?.available_qty} ${restDetail?.unit}`
                      : "0"}
                  </paragraph>
                </td>
                <td>
                  <Input
                    value={allData.qty}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, qty: e.target.value };
                      })
                    }
                    // suffix={restDetail?.available_qty ? `${restDetail?.available_qty} ${restDetail?.unit}` : "0"}
                  />
                </td>
                <td>
                  <MySelect
                    options={locRejDetail}
                    placeholder="Check Location"
                    value={allData.rejLoc}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, rejLoc: e };
                      })
                    }
                  />
                </td>
                <td>
                  <TextArea disabled value={address} />
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <NavFooter
        submitFunction={submitHandler}
        nextLabel="Transfer"
        loading={loading}
        resetFunction={reset}
      />
    </div>
  );
}

export default MaterialTransfer;
