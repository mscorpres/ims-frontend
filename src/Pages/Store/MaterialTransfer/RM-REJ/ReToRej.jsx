import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input, Card } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import NavFooter from "../../../../Components/NavFooter";
import { getComponentOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
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
  const [rows, setRows] = useState([
    {
      component: "",
      qty1: "",
      locationTo: "",
      restDetail: {},
      address: "",
    },
  ]);
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

  const getRowQtyFunction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allDataRej.locationFrom || !component) return;
    const { data } = await imsAxios.post("/godown/godownStocks", {
      component,
      location: allDataRej.locationFrom,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], restDetail: data.data };
      return updated;
    });
  };

  const getLocationFunctionTo = async () => {
    const { data } = await imsAxios.post("/godown/fetchLocationForRM2REJ_to");

    let v = [];
    data.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionDataTo(v);
  };

  const saveRmToRej = async () => {
    if (!allDataRej.locationFrom)
      return toast.error("Please select Pick Location");
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.component)
        return toast.error(`Row ${i + 1}: Please select Component`);
      if (!r.qty1) return toast.error(`Row ${i + 1}: Please add Quantity`);
      if (!r.locationTo)
        return toast.error(`Row ${i + 1}: Please select Drop Location`);
      if (r.locationTo == allDataRej.locationFrom)
        return toast.error(`Row ${i + 1}: Drop Location Same`);
    }
    setLoading(true);
    const components = rows.map((r) => r.component);
    const tolocations = rows.map((r) => r.locationTo);
    const qtys = rows.map((r) => r.qty1);
    const { data } = await imsAxios.post("/godown/transferRM2REJ", {
      comment: allDataRej?.comment,
      fromlocation: allDataRej?.locationFrom,
      component: components,
      tolocation: tolocations,
      qty: qtys,
      type: "RM2REJ",
    });
    if (data.code == 200) {
      toast.success(data.message.toString()?.replaceAll("<br/>", ""));
      setAllDataRej({
        locationFrom: "",
        comment: "",
        component: "",
        qty1: "",
        locationTo: "",
      });
      setBranch("");
      setRows([
        {
          component: "",
          qty1: "",
          locationTo: "",
          restDetail: {},
          address: "",
        },
      ]);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const getRowLocationName = async (rowIndex, locationToValue) => {
    const row = rows[rowIndex];
    const locationTo = locationToValue ?? row?.locationTo;
    if (!locationTo) return;
    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: locationTo,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], address: data.data };
      return updated;
    });
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
    setRows([
      { component: "", qty1: "", locationTo: "", restDetail: {}, address: "" },
    ]);
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

  // refresh each row stock when pick location changes
  useEffect(() => {
    if (allDataRej.locationFrom) {
      rows.forEach((_, idx) => getRowQtyFunction(idx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataRej.locationFrom]);

  // Note: per-row changes trigger API calls in onChange handlers
  return (
    <div style={{ height: "100%" }}>
      {/* <InternalNav links={MainREJ} /> */}

      <Row gutter={10} style={{ padding: "10px", height: "79vh" }}>
        <Col span={6}>
          <Card>
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
          </Card>
        </Col>

        <Col span={18}>
          <Row gutter={10}>
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 10,
                }}
              >
                <Button
                  type="primary"
                  onClick={() =>
                    setRows((prev) => [
                      ...prev,
                      {
                        component: "",
                        qty1: "",
                        locationTo: "",
                        restDetail: {},
                        address: "",
                      },
                    ])
                  }
                >
                  Add Row
                </Button>
              </div>
              <div style={{ overflowX: "auto", overflowY: "hidden" }}>
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
                      DROP (+) Loc
                    </th>
                    <th className="an" style={{ width: "12vw" }}>
                      Weighted Average Rate
                    </th>
                    <th className="an" style={{ width: "22vw" }}>
                      Address
                    </th>
                    <th className="an" style={{ width: "10vw" }}>
                      Actions
                    </th>
                  </tr>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ width: "18vw" }}>
                        <div
                          style={{
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <MyAsyncSelect
                            style={{ width: "100%" }}
                            loadOptions={getComponentList}
                            onInputChange={(e) => setSearch(e)}
                            onBlur={() => setAsyncOptions([])}
                            placeholder="Part Name/Code"
                            optionsState={asyncOptions}
                            value={r.component}
                            onChange={async (e) => {
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  component: e,
                                };
                                return updated;
                              });
                              await getRowQtyFunction(idx, e);
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ width: "12vw" }}>
                        <Input
                          suffix={r?.restDetail?.unit}
                          disabled
                          value={
                            r?.restDetail?.available_qty
                              ? `${r?.restDetail?.available_qty} ${r?.restDetail?.unit}`
                              : "0"
                          }
                        />
                      </td>
                      <td style={{ width: "12vw" }}>
                        <Input
                          suffix={r?.restDetail?.unit}
                          value={r.qty1}
                          onChange={(e) =>
                            setRows((prev) => {
                              const updated = [...prev];
                              updated[idx] = {
                                ...updated[idx],
                                qty1: e.target.value,
                              };
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td style={{ width: "14vw" }}>
                        <Select
                          style={{ width: "100%" }}
                          options={locDataTo}
                          value={r.locationTo}
                          onChange={async (e) => {
                            setRows((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], locationTo: e };
                              return updated;
                            });
                            await getRowLocationName(idx, e);
                          }}
                        />
                      </td>
                      <td style={{ width: "12vw" }}>
                        <Input disabled value={r?.restDetail?.avr_rate} />
                      </td>
                      <td style={{ width: "22vw" }}>
                        <TextArea
                          rows={2}
                          disabled
                          value={r.address}
                          style={{ resize: "none" }}
                        />
                      </td>
                      <td style={{ width: "10vw" }}>
                        <Button
                          danger
                          onClick={() =>
                            setRows((prev) => prev.filter((_, i) => i !== idx))
                          }
                          disabled={rows.length === 1}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </table>
              </div>
            </Col>
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
