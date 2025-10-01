import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
const { TextArea } = Input;

function RmtoRm() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    locationFrom: "",
    companyBranch: "",
    dropBranch: "",
  });

  // Convert to multiple rows structure
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty1: "",
      locationTo: "",
      stockQty: "",
      unit: "",
      avrRate: "",
      address: "",
      comment: "",
    },
  ]);

  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [branchName, setbBanchName] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const { executeFun, loading: loading1 } = useApi();

  // Add row functionality
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
        avrRate: "",
        address: "",
        comment: "",
      },
    ]);
  };

  // Remove row functionality
  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    } else {
      toast.error("At least one row is required");
    }
  };

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

  const getQtyFuction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allData.locationFrom || !component) return;

    const { data } = await imsAxios.post("/godown/godownStocks", {
      component: component,
      location: allData.locationFrom,
    });

    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        stockQty: data.data?.available_qty || "0",
        unit: data.data?.unit || "",
        avrRate: data.data?.avr_rate || "",
      };
      return updated;
    });
  };

  const saveRmToRm = async () => {
    // Validations
    if (!allData.locationFrom) {
      return toast.error("Please select a Pick Location");
    }

    if (!allData.dropBranch) {
      return toast.error("Please select Drop Branch");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.component) {
        return toast.error(`Row ${i + 1}: Please select Component`);
      }
      if (!row.qty1) {
        return toast.error(`Row ${i + 1}: Please enter Qty`);
      }
      if (!row.locationTo) {
        return toast.error(`Row ${i + 1}: Please select Drop Location`);
      }
      if (row.locationTo == allData.locationFrom) {
        return toast.error(`Row ${i + 1}: Both Location Same`);
      }
    }

    setLoading(true);

    // Prepare arrays for payload
    const components = rows.map((row) => row.component);
    const tolocations = rows.map((row) => row.locationTo);
    const qtys = rows.map((row) => row.qty1);
    const comments = rows.map((row) => row.comment || "");

    const { data } = await imsAxios.post("/godown/transferRM2RM", {
      comment: comments,
      fromlocation: allData.locationFrom,
      component: components,
      tolocation: tolocations,
      qty: qtys,
      type: "RM2RM",
      tobranch: allData.dropBranch,
    });

    if (data.code == 200) {
      toast.success(data.message.toString()?.replaceAll("<br/>", ""));
      // Reset form
      setAllData({
        locationFrom: "",
        companyBranch: "",
        dropBranch: "",
      });
      setRows([
        {
          id: v4(),
          component: "",
          qty1: "",
          locationTo: "",
          stockQty: "",
          unit: "",
          avrRate: "",
          address: "",
          comment: "",
        },
      ]);
      setbBanchName("");
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
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

      // Update global location options and reset all row locations
      setloctionDataTo(arr);
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          locationTo: "", // Reset location when branch changes
        }))
      );
    } catch (error) {
      console.error("Error fetching locations for branch", error);
      toast.error("Failed to fetch drop locations for selected branch");
    }
  };

  const getLocationName = async (rowIndex, locationValue) => {
    const row = rows[rowIndex];
    const location = locationValue ?? row?.locationTo;
    if (!location) return;

    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: location,
    });

    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        address: data.data,
      };
      return updated;
    });
  };

  const reset = async (e) => {
    e.preventDefault();
    setAllData({
      locationFrom: "",
      companyBranch: "",
      dropBranch: "",
    });
    setRows([
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
        avrRate: "",
        address: "",
        comment: "",
      },
    ]);
    setbBanchName("");
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
              <span>DROP BRANCH</span>
            </Col>
            <Col span={24}>
              <MySelect
                options={[
                  { text: "A-21 [BRMSC012]", value: "BRMSC012" },
                  { text: "B-29 [BRMSC029]", value: "BRMSC029" },
                  {
                    text: "B-36 Alwar [BRBA036]",
                    value: "BRBA036",
                  },
                  { text: "D-160", value: "BRBAD116" },
                ]}
                placeholder="Select Drop Branch"
                value={allData.dropBranch}
                onChange={async (e) => {
                  setAllData((prev) => ({ ...prev, dropBranch: e }));
                  await handleBranchSelection(e);
                }}
              />
            </Col>
          </Row>
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
                <Button type="primary" onClick={addRow}>
                  Add Row
                </Button>
              </div>
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
                  <thead>
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
                      <th className="an" style={{ width: "16vw" }}>
                        DROP (+) Loc
                      </th>
                      <th className="an" style={{ width: "12vw" }}>
                        Weighted Average Rate
                      </th>
                      <th className="an" style={{ width: "16vw" }}>
                        Comment
                      </th>
                      <th className="an" style={{ width: "2vw" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <tr>
                          <td style={{ width: "18vw" }}>
                            <MyAsyncSelect
                              style={{ width: "100%" }}
                              loadOptions={getComponentList}
                              onBlur={() => setAsyncOptions([])}
                              onInputChange={(e) => setSearch(e)}
                              placeholder="Part Name/Code"
                              value={row.component}
                              optionsState={asyncOptions}
                              onChange={(e) => {
                                setRows((prev) => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    component: e,
                                  };
                                  return updated;
                                });
                                getQtyFuction(index, e);
                              }}
                            />
                          </td>
                          <td style={{ width: "12vw" }}>
                            <Input
                              suffix={row.unit}
                              disabled
                              value={
                                row.stockQty
                                  ? `${row.stockQty} ${row.unit}`
                                  : "0"
                              }
                            />
                          </td>
                          <td style={{ width: "12vw" }}>
                            <Input
                              value={row.qty1}
                              onChange={(e) => {
                                setRows((prev) => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    qty1: e.target.value,
                                  };
                                  return updated;
                                });
                              }}
                              suffix={row.unit}
                            />
                          </td>
                          <td style={{ width: "16vw" }}>
                            <Select
                              style={{ width: "100%" }}
                              options={locDataTo}
                              value={row.locationTo}
                              placeholder="Location"
                              onChange={(e) => {
                                setRows((prev) => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    locationTo: e,
                                  };
                                  return updated;
                                });
                                getLocationName(index, e);
                              }}
                            />
                          </td>
                          <td style={{ width: "12vw", textAlign: "center" }}>
                            <Input disabled value={row.avrRate} />
                          </td>
                          <td style={{ width: "16vw" }}>
                            <TextArea
                              rows={2}
                              value={row.comment}
                              placeholder="Comment Optional"
                              onChange={(e) => {
                                setRows((prev) => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    comment: e.target.value,
                                  };
                                  return updated;
                                });
                              }}
                            />
                          </td>
                          <td style={{ width: "2vw", textAlign: "center" }}>
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => removeRow(row.id)}
                              disabled={rows.length === 1}
                              title="Delete Row"
                            />
                          </td>
                        </tr>
                        {row.locationTo && row.address && (
                          <tr>
                            <td colSpan="7" style={{ padding: "8px" }}>
                              <TextArea
                                disabled
                                value={row.address}
                                placeholder={`Row ${
                                  index + 1
                                } - Location Address`}
                                rows={2}
                                style={{ width: "100%" }}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
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