import React, { useState, useEffect } from "react";
import { Col, Row, Input, Typography } from "antd";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { Button } from "@mui/material";
const { paragraph } = Typography;

const { TextArea } = Input;
function MaterialTransfer({ type }) {
  // console.log(type)
  type == "sftorej"
    ? (document.title = "SF to REJ")
    : (document.title = "SF to SF");

  const [allData, setAllData] = useState({
    locationSel: "",

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
  const [locRejDetail, setLocRejDetail] = useState("");

  const [rows, setRows] = useState([
    {
      componentName: "",
      qty: "",
      rejLoc: "",
      restDetail: {},
      address: "",
      comment: "",
    },
  ]);

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

  const getRowComponentDetail = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.componentName;
    if (!allData.locationSel || !component) return;
    const { data } = await imsAxios.post("/godown/godownStocks", {
      component,
      location: allData.locationSel,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], restDetail: data.data };
      return updated;
    });
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

  const getRowDropLocationDetail = async (rowIndex, rejLocValue) => {
    const row = rows[rowIndex];
    const rejLoc = rejLocValue ?? row?.rejLoc;
    if (!rejLoc) return;
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: rejLoc,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], address: data.data };
      return updated;
    });
  };

  const submitHandler = async () => {
    // validations
    if (!allData?.locationSel)
      return toast.error("Please select a Pick Location");
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.componentName)
        return toast.error(`Row ${i + 1}: Please select Component`);
      if (!r.qty) return toast.error(`Row ${i + 1}: Please enter Qty`);
      if (!r.rejLoc)
        return toast.error(`Row ${i + 1}: Please select Drop Location`);
      if (r.rejLoc == allData.locationSel)
        return toast.error(`Row ${i + 1}: Both Location Same`);
    }

    const components = rows.map((r) => r.componentName);
    const tolocations = rows.map((r) => r.rejLoc);
    const qtys = rows.map((r) => r.qty);
    const comments = rows.map((r) => r.comment || "");

    setLoading(true);
    const { data } = await imsAxios.post(
      type == "sftorej" ? "/godown/transferSF2REJ" : "/godown/transferSF2SF",
      {
        comments: comments,
        fromlocation: allData.locationSel,
        component: components,
        tolocation: tolocations,
        qty: qtys,
        type: type == "sftorej" ? "SF2REJ" : "SF2SF",
      }
    );

    if (data.code == 200) {
      setAllData({
        locationSel: "",
        componentName: "",
        qty: "",
        rejLoc: "",
      });
      setRows([
        {
          componentName: "",
          qty: "",
          rejLoc: "",
          restDetail: {},
          address: "",
          comment: "",
        },
      ]);
      setLocDetail("");
      setLoading(false);
      toast.success(data.message);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const reset = () => {
    setAllData({
      locationSel: "",
      componentName: "",
      qty: "",
      rejLoc: "",
    });
    setRows([
      {
        componentName: "",
        qty: "",
        rejLoc: "",
        restDetail: {},
        address: "",
        comment: "",
      },
    ]);
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        componentName: "",
        qty: "",
        rejLoc: "",
        restDetail: {},
        address: "",
        comment: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
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

  // when pick location changes, refresh each row's stock detail (if component selected)
  useEffect(() => {
    if (allData?.locationSel) {
      rows.forEach((_, idx) => getRowComponentDetail(idx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData?.locationSel]);
  return (
    <div style={{ height: "90vh", margin: 12 }}>
      <Row gutter={10}>
        <Col span={6}>
          <CustomFieldBox title={"Pick location"}>
            <Row>
              <Col span={24} style={{ padding: "5px" }}>
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
            </Row>
          </CustomFieldBox>
        </Col>
        <Col span={18} style={{ height: "calc(100vh - 300px)" }}>
          <CustomFieldBox>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
              }}
            >
              <CustomButton size="small" title={"Add"} onclick={addRow} />
            </div>
            <div
              style={{
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "calc(100vh - 300px)",
                minHeight: "calc(100vh - 300px)",
              }}
            >
              <table
                className="table table-hover"
                style={{ tableLayout: "fixed", width: "100%", minWidth: 1200 }}
              >
                <thead style={{ backgroundColor: "grey", color: "white" }}>
                  <tr>
                    <th style={{ width: "18vw" }}>Component/Part</th>
                    <th style={{ width: "12vw" }}>In Stock Qty</th>
                    <th style={{ width: "12vw" }}>Transfer Qty</th>
                    <th style={{ width: "14vw" }}>DROP (+) Loc</th>
                    <th style={{ width: "12vw" }}>Weighted Average Rate</th>
                    <th style={{ width: "22vw" }}>Address</th>
                    <th style={{ width: "22vw" }}>Comment</th>
                    <th style={{ width: "10vw" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ width: "18vw" }}>
                        <MyAsyncSelect
                          loadOptions={getComponent}
                          optionsState={asyncOptions}
                          value={r.componentName}
                          selectLoading={loading1("select")}
                          onChange={async (e) => {
                            setRows((prev) => {
                              const updated = [...prev];
                              updated[idx] = {
                                ...updated[idx],
                                componentName: e,
                              };
                              return updated;
                            });
                            await getRowComponentDetail(idx, e);
                          }}
                        />
                      </td>
                      <td style={{ textAlign: "center", width: "12vw" }}>
                        <paragraph>
                          {r?.restDetail?.available_qty
                            ? `${r?.restDetail?.available_qty} ${r?.restDetail?.unit}`
                            : "0"}
                        </paragraph>
                      </td>
                      <td style={{ width: "12vw" }}>
                        <Input
                          value={r.qty}
                          onChange={(e) =>
                            setRows((prev) => {
                              const updated = [...prev];
                              updated[idx] = {
                                ...updated[idx],
                                qty: e.target.value,
                              };
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td style={{ width: "14vw" }}>
                        <MySelect
                          options={locRejDetail}
                          placeholder="Check Location"
                          value={r.rejLoc}
                          onChange={async (e) => {
                            setRows((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], rejLoc: e };
                              return updated;
                            });
                            await getRowDropLocationDetail(idx, e);
                          }}
                        />
                      </td>
                      <td style={{ width: "12vw" }}>
                        <Input disabled value={r?.restDetail?.avr_rate} />
                      </td>
                      <td style={{ width: "22vw" }}>
                        <TextArea
                          disabled
                          value={r.address}
                          style={{ resize: "none" }}
                        />
                      </td>
                      <td style={{ width: "22vw" }}>
                        <TextArea
                          rows={2}
                          value={r.comment}
                          onChange={(e) =>
                            setRows((prev) => {
                              const updated = [...prev];
                              updated[idx] = {
                                ...updated[idx],
                                comment: e.target.value,
                              };
                              return updated;
                            })
                          }
                          style={{ resize: "none" }}
                        />
                      </td>
                      <td style={{ width: "10vw" }}>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => removeRow(idx)}
                          disabled={rows.length === 1}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CustomFieldBox>
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
