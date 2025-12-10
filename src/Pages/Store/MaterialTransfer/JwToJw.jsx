import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Row, Select, Button, Input, Modal, Spin, Tooltip } from "antd";
import { DeleteOutlined, FileExcelOutlined, CheckOutlined, ClearOutlined, PlusOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { v4 } from "uuid";
import Spreadsheet from "react-spreadsheet";
const { TextArea } = Input;

function JwToJw() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    jwVendor: "",
    jwPo: "",
    locationFrom: "202102201753",
    locationTo: "",
    remark: "",
  });

  const [rows, setRows] = useState([
    {
      id: v4(),
      component: null,
      qty1: "",
      stockQty: "",
      unit: "",
    },
  ]);

  const [jwVendorOptions, setJwVendorOptions] = useState([]);
  const [jwPoOptions, setJwPoOptions] = useState([]);
  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [vendorAsyncOptions, setVendorAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showExcelWarning, setShowExcelWarning] = useState(false);
  const [addRowCount, setAddRowCount] = useState("");
  
  // react-spreadsheet data format: array of rows, each row is array of cell objects with { value: "" }
  const createEmptySpreadsheetData = (rowCount = 10) => {
    return Array(rowCount).fill(null).map(() => [
      { value: "" },
    ]);
  };
  const [spreadsheetData, setSpreadsheetData] = useState(createEmptySpreadsheetData(10));
  const columnLabels = ["Part Code"];

  // Check if any row has qty exceeding stock
  const hasQtyExceeded = rows.some(
    (row) =>
      row.qty1 &&
      row.stockQty &&
      Number(row.qty1) > Number(row.stockQty)
  );

  // Add row functionality
  const addRow = () => {
    setRows((prev) => [
      {
        id: v4(),
        component: null,
        qty1: "",
        stockQty: "",
        unit: "",
      },
      ...prev,
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

  const getJwVendorOptions = async (search) => {
    if (search?.length > 2) {
      try {
        const response = await imsAxios.post("/backend/vendorList", {
          search: search,
        });
        let v = [];
        if (response?.data && Array.isArray(response.data)) {
          response.data.map((ad) => v.push({ text: ad.text, value: ad.id }));
        }
        setVendorAsyncOptions(v);
      } catch (error) {
        console.error("Error fetching JW Vendor list:", error);
      }
    }
  };

  const getJwPoOptions = async (vendorId) => {
    try {
      const response = await imsAxios.get(`/godown/transfer/jw-jw/po/${vendorId}`);
      let v = [];
      if (response?.data && Array.isArray(response.data)) {
        response.data.map((ad) =>
          v.push({
            label: (
              <div>
                <div>{ad.jobworkID}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {ad.createdDate}
                </div>
              </div>
            ),
            value: ad.jobworkID,
            title: ad.jobworkID,
            searchText: `${ad.jobworkID} ${ad.createdDate}`,
          })
        );
      }
      setJwPoOptions(v);
    } catch (error) {
      console.error("Error fetching JW PO list:", error);
    }
  };

  const getLocationFunction = async () => {
    // Default pick location for JW to JW
    setloctionData([{ label: "JW001", value: "202102201753" }]);
  };

  const getLocationFunctionTo = async (vendorId) => {
    const response = await imsAxios.get(`/backend/fetchVendorJWLocation?vendor=${vendorId}`);
    let v = [];
    if (response?.data && Array.isArray(response.data)) {
      response.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    }
    setloctionDataTo(v);
  };

  const getComponentList = async (e) => {
    if (e?.length > 2 && allData.jwPo) {
      try {
        const response = await imsAxios.post("/godown/transfer/jw-jw/stock", {
          part: e,
          jw: allData.jwPo,
        });
        
        if (response?.success && response?.data) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          const arr = data.map((d) => ({
            text: `(${d.component_name}) ${d.part_no}`,
            value: d.component_key,
            unit: d.uom || "",
            stockQty: d.pending_with_jw || 0,
          }));
          setAsyncOptions(arr);
        }
      } catch (err) {
        console.error("Error fetching components:", err);
      }
    }
  };

  const saveJwToJw = async () => {
    // Validations
    if (!allData.jwVendor) {
      return toast.error("Please select JW Vendor");
    }

    if (!allData.jwPo) {
      return toast.error("Please select JW PO");
    }

    if (!allData.locationFrom) {
      return toast.error("Please select Pick Location");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const componentValue = row.component?.value || row.component;
      if (!componentValue) {
        return toast.error(`Row ${i + 1}: Please select Component`);
      }
      if (!row.qty1) {
        return toast.error(`Row ${i + 1}: Please enter Qty`);
      }
      if (!allData.locationTo) {
        return toast.error("Please select Drop Location");
      }
      if (allData.locationTo == allData.locationFrom) {
        return toast.error("Both Location Same");
      }
    }

    setLoading(true);

    // Prepare arrays for payload - extract value from object if needed
    const components = rows.map((row) => row.component?.value || row.component);
    const qtys = rows.map((row) => row.qty1);

    const response = await imsAxios.post("/godown/transferJW2JW", {
      jw_vendor: allData.jwVendor,
      jw_po: allData.jwPo,
      fromlocation: allData.locationFrom,
      component: components,
      tolocation: allData.locationTo,
      qty: qtys,
      remark: allData.remark,
      type: "JW2JW",
    });

    if (response.success) {
      toast.success(response.message.toString()?.replaceAll("<br/>", ""));
      // Reset form
      setAllData({
        jwVendor: "",
        jwPo: "",
        locationFrom: "202102201753",
        locationTo: "",
        remark: "",
      });
      setJwPoOptions([]);
      setRows([
        {
          id: v4(),
          component: null,
          qty1: "",
          stockQty: "",
          unit: "",
        },
      ]);
      setLoading(false);
    } else {
      toast.error(response?.message);
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setAllData({
      jwVendor: "",
      jwPo: "",
      locationFrom: "202102201753",
      remark: "",
    });
    setJwPoOptions([]);
    setRows([
      {
        id: v4(),
        component: null,
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
      },
    ]);
  };

  useEffect(() => {
    getLocationFunction();
    // getLocationFunctionTo();
  }, []);

  // Add more rows to spreadsheet
  const addSpreadsheetRows = () => {
    const count = addRowCount ? parseInt(addRowCount, 10) : 1;
    if (isNaN(count) || count < 1) {
      setSpreadsheetData((prev) => [...prev, ...createEmptySpreadsheetData(1)]);
    } else {
      setSpreadsheetData((prev) => [...prev, ...createEmptySpreadsheetData(count)]);
    }
    setAddRowCount("");
  };

  // Clear spreadsheet
  const clearSpreadsheetData = () => {
    setSpreadsheetData(createEmptySpreadsheetData(10));
    setAddRowCount("");
  };

  // Delete spreadsheet row
  const deleteSpreadsheetRow = (rowIndex) => {
    if (spreadsheetData.length <= 1) {
      toast.error("At least one row is required");
      return;
    }
    setSpreadsheetData((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // Process spreadsheet data and create rows
  const processSpreadsheetData = async () => {
    // Validate JW Vendor and JW PO selection
    if (!allData.jwVendor) {
      toast.error("Please select JW Vendor first");
      return;
    }
    if (!allData.jwPo) {
      toast.error("Please select JW PO first");
      return;
    }

    // Filter rows that have part code
    const validRows = spreadsheetData.filter(
      (row) => row[0]?.value?.trim()
    );

    if (validRows.length === 0) {
      toast.error("No valid data found. Please enter Part Code.");
      return;
    }

    setCsvUploading(true);

    try {
      // Extract part codes from spreadsheet
      const partCodes = validRows.map((row) => row[0]?.value?.trim());

      // Call stock API with part codes
      const response = await imsAxios.post("/godown/transfer/jw-jw/stock", {
        part: partCodes,
        jw: allData.jwPo,
      });

      if (response?.success && response?.data) {
        // Handle both single and array response
        const stockData = Array.isArray(response.data) 
          ? response.data 
          : [response.data];

        if (stockData.length === 0) {
          toast.error("No valid components found");
          setCsvUploading(false);
          return;
        }

        // Create rows from response data
        const newRows = stockData.map((item) => ({
          id: v4(),
          component: {
            value: item.component_key,
            label: `(${item.component_name}) ${item.part_no}`,
          },
          qty1: "",
          stockQty: item.pending_with_jw || "0",
          unit: item.uom || "",
        }));

        setRows(newRows);
        setShowCsvModal(false);
        clearSpreadsheetData();
        toast.success(`Successfully loaded ${newRows.length} rows`);
      } else {
        toast.error(response?.message || "Failed to process part codes");
      }
    } catch (err) {
      console.error("Error processing spreadsheet:", err);
      toast.error("An error occurred while processing data");
    }

    setCsvUploading(false);
  };

  return (
    <div style={{ height: "95%", position: "relative" }}>
      {csvUploading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#047780", fontWeight: 500 }}>
            Processing data...
          </p>
        </div>
      )}

      {/* Main UI */}
          <Row gutter={10} style={{ padding: "10px", height: "79vh" }}>
            <Col span={6}>
              <Row gutter={10} style={{ margin: "5px" }}>
                <Col span={24} style={{ marginBottom: "10px", width: "100%" }}>
                  <span>SELECT JW VENDOR</span>
                </Col>
                <Col span={24}>
                  <MyAsyncSelect
                    placeholder="Type to search vendor..."
                    style={{ width: "100%" }}
                    optionsState={vendorAsyncOptions}
                    loadOptions={getJwVendorOptions}
                    onBlur={() => setVendorAsyncOptions([])}
                    value={allData.jwVendor || undefined}
                    onChange={(e) => {
                      setAllData((allData) => {
                        return { ...allData, jwVendor: e, jwPo: "" };
                      });
                      getJwPoOptions(e);
                      getLocationFunctionTo(e);
                    }}
                  />
                </Col>
                <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
                  <span>SELECT JW PO</span>
                </Col>
                <Col span={24}>
                  <Select
                    placeholder="Please Select JW PO"
                    style={{ width: "100%" }}
                    options={jwPoOptions}
                    showSearch
                    optionLabelProp="title"
                    filterOption={(input, option) =>
                      (option?.searchText ?? option?.value ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={allData.jwPo || undefined}
                    disabled={!allData.jwVendor}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, jwPo: e };
                      })
                    }
                  />
                </Col>
                <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
                  <span>SELECT PICK LOCATION</span>
                </Col>
                <Col span={24}>
                  <Select
                    placeholder="Please Select Location"
                    style={{ width: "100%" }}
                    options={locData}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    value={allData.locationFrom || undefined}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, locationFrom: e };
                      })
                    }
                  />
                </Col>
                <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
                  <span>REMARK</span>
                </Col>
                <Col span={24}>
                  <TextArea
                    rows={4}
                    placeholder="Enter remark..."
                    value={allData.remark}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, remark: e.target.value };
                      })
                    }
                  />
                </Col>
                <Col span={24} style={{ marginTop: "15px", marginBottom: "10px" }}>
                  <span>SELECT DROP LOCATION</span>
                </Col>
                <Col span={24}>
                  <Select
                    style={{ width: "100%" }}
                    options={locDataTo}
                    value={allData.locationTo || undefined}
                    placeholder="Select Location"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(e) => {
                      setAllData((allData) => {
                        return { ...allData, locationTo: e };
                      });
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
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Button
                      icon={<FileExcelOutlined />}
                      onClick={() => setShowExcelWarning(true)}
                    >
                      Open Excel Grid
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
                        minWidth: 900,
                      }}
                    >
                      <thead>
                        <tr>
                          <th className="an" style={{ width: "5vw" }}>
                            Action
                          </th>
                          <th className="an" style={{ width: "25vw" }}>
                            Component/Part No.
                          </th>
                          <th className="an" style={{ width: "15vw" }}>
                            STOCK QUANTITY
                          </th>
                          <th className="an" style={{ width: "15vw" }}>
                            TRANSFERING QTY
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={row.id}>
                            <td style={{ width: "5vw", textAlign: "center" }}>
                              {index === 0 ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                  <Tooltip title="Delete Row">
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => removeRow(row.id)}
                                      disabled={rows.length === 1}
                                    />
                                  </Tooltip>
                                  <span style={{ color: "#ccc" }}>|</span>
                                  <Tooltip title="Add Row">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<PlusOutlined />}
                                      onClick={addRow}
                                      style={{ color: "#047780" }}
                                    />
                                  </Tooltip>
                                </div>
                              ) : (
                                <Tooltip title="Delete Row">
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeRow(row.id)}
                                    disabled={rows.length === 1}
                                  />
                                </Tooltip>
                              )}
                            </td>
                            <td style={{ width: "25vw" }}>
                              <MyAsyncSelect
                                style={{ width: "100%" }}
                                loadOptions={getComponentList}
                                onBlur={() => setAsyncOptions([])}
                                onInputChange={(e) => setSearch(e)}
                                placeholder="Part Name/Code"
                                value={row.component}
                                optionsState={asyncOptions}
                                labelInValue={true}
                                disabled={!allData.jwPo}
                                onChange={(selected) => {
                                  // Find selected option to get unit and stock
                                  const selectedOption = asyncOptions.find(
                                    (opt) => opt.value === selected?.value
                                  );
                                  setRows((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      component: selected,
                                      unit: selectedOption?.unit || "",
                                      stockQty: selectedOption?.stockQty || "0",
                                    };
                                    return updated;
                                  });
                                }}
                              />
                            </td>
                            <td style={{ width: "15vw" }}>
                              <Input
                                disabled
                                value={row.stockQty || "0"}
                                suffix={row.unit || ""}
                              />
                            </td>
                            <td style={{ width: "15vw" }}>
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
                                suffix={row.unit || ""}
                                style={{
                                  backgroundColor:
                                    row.qty1 &&
                                    row.stockQty &&
                                    Number(row.qty1) > Number(row.stockQty)
                                      ? "#ffcccc"
                                      : undefined,
                                }}
                              />
                            </td>
                          </tr>
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
        submitFunction={saveJwToJw}
        resetFunction={reset}
        loading={loading}
        nextDisabled={hasQtyExceeded}
      />

      {/* Excel Warning Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#faad14" }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span>Warning</span>
          </div>
        }
        open={showExcelWarning}
        onCancel={() => setShowExcelWarning(false)}
        footer={[
          <Button key="no" onClick={() => setShowExcelWarning(false)}>
            No
          </Button>,
          <Button
            key="yes"
            type="primary"
            style={{ background: "#047780" }}
            onClick={() => {
              setShowExcelWarning(false);
              setShowCsvModal(true);
            }}
          >
            Yes
          </Button>,
        ]}
        centered
        width={450}
      >
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#333", marginBottom: 10 }}>
            Your manual input data (if any) will be deleted.
          </p>
          <p style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>
            Are you sure you want to proceed with the spreadsheet?
          </p>
        </div>
      </Modal>

      {/* CSV/Excel Modal with react-spreadsheet */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileExcelOutlined style={{ color: "#217346", fontSize: 20 }} />
            <span>Paste Data from Excel</span>
          </div>
        }
        open={showCsvModal}
        onCancel={() => setShowCsvModal(false)}
        width="50%"
        closable={false}
        maskClosable={false}
        keyboard={false}
        styles={{
          body: {
            maxHeight: "60vh",
            overflow: "hidden",
          },
        }}
        footer={csvUploading ? null : [
          <div
            key="footer-content"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Left side - Add Row controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Input
                placeholder="1"
                value={addRowCount}
                onChange={(e) => setAddRowCount(e.target.value.replace(/\D/g, ""))}
                style={{ width: 60, textAlign: "center" }}
                onPressEnter={addSpreadsheetRows}
              />
              <Tooltip title="Add Row">
                <Button icon={<PlusOutlined />} onClick={addSpreadsheetRows} />
              </Tooltip>
            </div>
            {/* Right side - Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <Tooltip title="Clear All">
                <Button icon={<ClearOutlined />} onClick={clearSpreadsheetData} />
              </Tooltip>
              <Button onClick={() => setShowCsvModal(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={processSpreadsheetData}
                disabled={!allData.jwVendor || !allData.jwPo}
                style={{ background: "#047780" }}
              >
                Process Data
              </Button>
            </div>
          </div>,
        ]}
      >
        {csvUploading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
            }}
          >
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#047780", fontWeight: 500 }}>
              Processing Part Codes...
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: "#666", marginBottom: 8 }}>
                Copy Part Codes from Excel and paste here (Ctrl+V).
              </p>
              {(!allData.jwVendor || !allData.jwPo) && (
                <p style={{ color: "#ff4d4f", fontSize: 13 }}>
                  ⚠ Please select JW Vendor and JW PO first before processing.
                </p>
              )}
            </div>

            <div className="spreadsheet-container">
              <div style={{ display: "flex" }}>
                {/* Delete & Add buttons column */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* Header with Delete and Add icons */}
                  <div
                    style={{
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "#f5f5f5",
                      borderBottom: "1px solid #e8e8e8",
                      borderRight: "1px solid #e8e8e8",
                      position: "sticky",
                      top: 0,
                      zIndex: 11,
                      minWidth: 70,
                    }}
                  >
                    <Tooltip title="Delete">
                      <DeleteOutlined style={{ color: "#999", fontSize: 12 }} />
                    </Tooltip>
                    <span style={{ color: "#ccc" }}>|</span>
                    <Tooltip title="Add Row">
                      <PlusOutlined
                        style={{ color: "#047780", fontSize: 12, cursor: "pointer" }}
                        onClick={() => addSpreadsheetRows()}
                      />
                    </Tooltip>
                  </div>
                  {/* Delete buttons for each row */}
                  {spreadsheetData.map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "1px solid #e8e8e8",
                        borderRight: "1px solid #e8e8e8",
                        minWidth: 70,
                      }}
                    >
                      <Tooltip title="Delete Row">
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => deleteSpreadsheetRow(rowIndex)}
                          style={{ color: "#ff4d4f" }}
                          disabled={spreadsheetData.length <= 1}
                        />
                      </Tooltip>
                    </div>
                  ))}
                </div>
                {/* Spreadsheet */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <Spreadsheet
                    data={spreadsheetData}
                    onChange={setSpreadsheetData}
                    columnLabels={columnLabels}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 10,
                background: "#f0f9f0",
                borderRadius: 6,
                fontSize: 12,
                color: "#555",
              }}
            >
              <strong>Tip:</strong> Select Part Codes in Excel, press Ctrl+C, then click inside a cell and press Ctrl+V to paste.
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default JwToJw;
