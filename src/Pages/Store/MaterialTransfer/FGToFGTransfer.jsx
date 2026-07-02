import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect.jsx";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor.js";
import NavFooter from "../../../Components/NavFooter.jsx";
import { getComponentOptions, getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
const { TextArea } = Input;

function FGToFGTransfer() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    locationFrom: "",
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
  const navigate = useNavigate();

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
    const { data } = await imsAxios.get("/skuQueryA/q3Location");

    let v = [];
    data.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionData(v);
  };
  const getLocationFunctionTo = async () => {
    const { data } = await imsAxios.get("/skuQueryA/q3Location");

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
      const response = await executeFun(() => getProductsOptions(e), "select");
      const data = response?.data;
      const arr = Array.isArray(data)
        ? data.map((d) => ({ text: d.text, value: d.value ?? d.id }))
        : [];
      setAsyncOptions(arr);
    }
  };

  const getQtyFuction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allData.locationFrom || !component) return;

    try {
      const { data } = await imsAxios.post("/godown/godownStocksProduct", {
        product: component,
        location: allData.locationFrom,
      });
      
      const stockData = data?.data ?? data;
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          stockQty: stockData?.available_qty ?? "0",
          unit: stockData?.unit ?? "",
          avrRate: stockData?.avr_rate ?? "",
        };
        return updated;
      });
    } catch (err) {
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          stockQty: "0",
          unit: "",
          avrRate: "",
        };
        return updated;
      });
    }
  };

  const saveFgToFg = async () => {
    if (!allData.locationFrom) {
      return toast.error("Please select a Pick Location");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.component) {
        return toast.error(`Row ${i + 1}: Please select Product`);
      }
      if (!row.qty1) {
        return toast.error(`Row ${i + 1}: Please enter Qty`);
      }
      if (!row.locationTo) {
        return toast.error(`Row ${i + 1}: Please select Drop Location`);
      }
      if (row.locationTo === allData.locationFrom) {
        return toast.error(`Row ${i + 1}: Pick and Drop location cannot be same`);
      }
    }

    setLoading(true);

    
    const byDrop = {};
    rows.forEach((row) => {
      const loc = row.locationTo;
      if (!byDrop[loc]) byDrop[loc] = [];
      byDrop[loc].push(row);
    });

    try {
      const successMessages = [];
      for (const dropLocation of Object.keys(byDrop)) {
        const group = byDrop[dropLocation];
        const product = group.map((r) => r.component);
        const qty = group.map((r) => r.qty1);
        const remark = group.map((r) => (r.comment || "").trim() || "--");

        const res = await imsAxios.post("/godown/transferFG2FG", {
          pickLocation: allData.locationFrom,
          dropLocation,
          product,
          qty,
          remark,
        });

        // Interceptor returns response.data when success is present, so res is already the body
        const body = res && typeof res === "object" && "success" in res ? res : res?.data ?? res;

        if (body?.success !== true && body?.status !== "success") {
          toast.error(body?.message || "Transfer failed");
          setLoading(false);
          return;
        }
        if (body?.message) successMessages.push(body.message);
      }

      toast.success(
        successMessages.length ? successMessages.join("\n") : "FG to FG transfer completed."
      );
      setAllData({ locationFrom: "" });
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
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Transfer failed");
    } finally {
      setLoading(false);
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

  
  useEffect(() => {
    if (!allData.locationFrom) return;
    rows.forEach((row, index) => {
      if (row.component) {
        getQtyFuction(index, row.component);
      }
    });
  }, [allData?.locationFrom]);

  return (
    <div style={{ height: "95%" }}>
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
                        Product/Sku Code.
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
                              type="number"
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
        submitFunction={saveFgToFg}
        resetFunction={reset}
        loading={loading}
      />
    </div>
  );
}

export default FGToFGTransfer;