import React, { useState, useEffect, useRef } from "react";
import { Col, Row, Input, Typography, Card, Button } from "antd";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { UploadOutlined } from "@ant-design/icons";
const { paragraph } = Typography;

const { TextArea } = Input;
function MaterialTransfer({ type }) {
  // console.log(type)
  type == "sftorej"
    ? (document.title = "SF to REJ")
    : (document.title = "SF to SF");

  const [allData, setAllData] = useState({
    locationSel: "",
    dropBranch: "",
    dropLoc: "",
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
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

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
      if (
        r.rejLoc == allData.locationSel &&
        allData.dropBranch ==
          JSON.parse(localStorage.getItem("otherData"))?.company_branch
      )
        return toast.error(`Row ${i + 1}: Both Location Same`);
    }

    const components = rows.map((r) => r.componentName);
    const qtys = rows.map((r) => r.qty);
    const comments = rows.map((r) => r.comment || "");

    setLoading(true);
    const response = await imsAxios.post(
      type == "sftorej" ? "/godown/transferSF2REJ" : "/godown/transferSF2SF",
      {
        pickLocation: allData.locationSel,
        component: components,
        remark: comments,
        qty: qtys,
        type: type == "sftorej" ? "SF2REJ" : "SF2SF",
        dropLocation: allData.dropLoc,
      }
    );

    if (response.success) {
      setAllData({
        locationSel: "",
        dropBranch: "",
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
      toast.success(response.message);
    } else{
      toast.error(response.message);
      setLoading(false);
    }
  };

  const reset = () => {
    setAllData({
      locationSel: "",
      dropBranch: "",
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

  const handleBranchSelection = async (branchCode) => {
    try {
      const { data } = await imsAxios.post("/location/fetchLocationBranch", {
        branch: branchCode,
      });
      let arr = [];
      const list = data?.data ?? data; // support both shapes
      if (Array.isArray(list)) {
        list.map((a) => arr.push({ text: a.text, value: a.id }));
      }
      // Update global location options and reset all row locations
      setLocRejDetail(arr);
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          rejLoc: "", // Reset location when branch changes
        }))
      );
    } catch (error) {
      console.error("Error fetching locations for branch", error);
      toast.error("Failed to fetch drop locations for selected branch");
    }
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate pick location is selected
    if (!allData.locationSel) {
      toast.error("Please select a Pick Location first");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await imsAxios.post(
        `/godown/validate/csv?type=sf-sf&pickLocation=${allData.locationSel}`,
        formData
      );

      if (response.success || response.status === "success") {
        toast.success(response.message || "File uploaded successfully");
        // Process the uploaded data and populate rows
        if (response.data && Array.isArray(response.data)) {
          // Populate component options for the select to display names
          const componentOptions = response.data.map((item) => ({
            text: `[${item.partCode}] ${item.name}`,
            value: item.key || "",
          }));
          setAsyncOptions(componentOptions);

          // Map the response data to row structure based on actual API response
          // We already have all stock details from the API, no need to call getRowComponentDetail
          const uploadedRows = response.data.map((item) => ({
            componentName: item.key || "",
            qty: item.transferQty || "",
            rejLoc: allData.dropLoc || "",
            restDetail: {
              available_qty: item.available_qty || 0,
              avr_rate: item.avr_rate || "0",
              unit: item.unit || "",
            },
            address: "",
            comment: item.remark || "",
          }));
          setRows(uploadedRows);

          // Only fetch drop location details if drop location is selected
          // No need to call getRowComponentDetail as we already have stock data
          if (allData.dropLoc) {
            for (let index = 0; index < uploadedRows.length; index++) {
              await getRowDropLocationDetail(index, allData.dropLoc);
            }
          }
        }
      } else {
        toast.error(
          response.message || response.data?.message || "Upload failed"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message?.msg ||
          error.message ||
          "Failed to upload file"
      );
    } finally {
      setUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    if (!allData.locationSel) {
      toast.error("Please select a Pick Location first");
      return;
    }
    fileInputRef.current?.click();
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
    <div style={{ height: "90vh" }}>
      <Row gutter={10} style={{ margin: "10px" }}>
        <Col span={6}>
          <Card>
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
                <span>DROP Location</span>
                <MySelect
                  options={locRejDetail}
                  placeholder="Location"
                  value={allData.dropLoc}
                  onChange={async (e) => {
                    setAllData((prev) => ({ ...prev, dropLoc: e }));
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={18} style={{ height: "50vh" }}>
          <Card style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
                gap: 10,
              }}
            >
              <Button
                onClick={() =>
                  window.open("http://oakter.msc-route.info/uploads/samples/Sample-GodownTransfer.csv", "_blank")
                }
                type="link"
              >
                Download Sample File
              </Button>
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={handleUploadClick}
                loading={uploadLoading}
              >
                Upload Excel
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
              />
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
                className="table table-hover"
                style={{ tableLayout: "fixed", width: "100%", minWidth: 1200 }}
              >
                <thead style={{ backgroundColor: "grey", color: "white" }}>
                  <tr>
                    <th style={{ width: "20vw" }}>Component/Part</th>
                    <th style={{ width: "14vw" }}>In Stock Qty</th>
                    <th style={{ width: "14vw" }}>Transfer Qty</th>
                    <th style={{ width: "14vw" }}>Weighted Average Rate</th>
                    <th style={{ width: "24vw" }}>Address</th>
                    <th style={{ width: "24vw" }}>Comment</th>
                    <th style={{ width: "10vw" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ width: "20vw" }}>
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
                      <td style={{ textAlign: "center", width: "14vw" }}>
                        <paragraph>
                          {r?.restDetail?.available_qty
                            ? `${r?.restDetail?.available_qty} ${r?.restDetail?.unit}`
                            : "0"}
                        </paragraph>
                      </td>
                      <td style={{ width: "14vw" }}>
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
                        <Input disabled value={r?.restDetail?.avr_rate} />
                      </td>
                      <td style={{ width: "24vw" }}>
                        <TextArea
                          disabled
                          value={r.address}
                          style={{ resize: "none" }}
                        />
                      </td>
                      <td style={{ width: "24vw" }}>
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
                          danger
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
          </Card>
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
