import { useState } from "react";
import {
  Select,
  Checkbox,
  Tag,
  TimePicker,
  Space,
  Radio,
} from "antd";
import { toast } from "react-toastify";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";

// ─── Report configurations (R1–R37) ──────────────────────────────────────────
const REPORT_CONFIGS = {
  R1: {
    label: "R1 - BOM Wise Report",
    columns: ["SKU", "Part No", "Cat Part Code", "Component", "Category", "Status", "Alternate Of", "BOM Qty", "UoM", "Opening", "Inward", "Outward", "Closing", "Weighted Avg Rate", "Order In Transit", "Last Purchase Price", "Currency"],
    filters: [
      { key: "product", name: "Product", options: ["SKU001 - LED White 3mm", "SKU002 - DC Socket", "SKU003 - SMD RES 1K"] },
      { key: "bom", name: "BOM", options: ["BOM WEF 23012026", "BOM WEF 01012025", "BOM WEF 15062024"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter", "Last Quarter"] },
    ],
  },
  R2: {
    label: "R2 - Stock Summary Report",
    columns: ["SKU", "Part No", "Component", "Opening Stock", "Inward", "Outward", "Closing Stock", "UoM", "Warehouse", "Category"],
    filters: [
      { key: "warehouse", name: "Warehouse", options: ["WH-Main", "WH-Secondary", "WH-FG", "WH-Consignment"] },
      { key: "category", name: "Category", options: ["Electronics", "Mechanical", "PCB", "Assembly", "Packaging"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "Custom"] },
    ],
  },
  R3: {
    label: "R3 - GRN Report",
    columns: ["GRN No", "GRN Date", "Vendor", "PO No", "Item Code", "Item Name", "UoM", "Ordered Qty", "Received Qty", "Pending Qty", "Rate", "Amount"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C", "Vendor D"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
      { key: "status", name: "Status", options: ["Pending", "Completed", "Partial"] },
    ],
  },
  R4: {
    label: "R4 - MIN Report",
    columns: ["MIN No", "MIN Date", "Vendor", "Item Code", "Item Name", "Inward Qty", "Rate", "Amount", "Location", "Batch No"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C"] },
      { key: "location", name: "Location", options: ["Store-1", "Store-2", "Cons021", "FG Store"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R5: {
    label: "R5 - MRN Report",
    columns: ["MRN No", "MRN Date", "Department", "Item Code", "Item Name", "Requested Qty", "Issued Qty", "UoM", "Location", "Status"],
    filters: [
      { key: "department", name: "Department", options: ["Production", "Stores", "Quality", "Maintenance"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
      { key: "status", name: "Status", options: ["Pending", "Approved", "Issued", "Rejected"] },
    ],
  },
  R6: {
    label: "R6 - Purchase Order Report",
    columns: ["PO No", "PO Date", "Vendor", "Item Code", "Item Name", "Ordered Qty", "Rate", "Amount", "Delivery Date", "Status"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C", "Vendor D"] },
      { key: "status", name: "PO Status", options: ["Open", "Closed", "Cancelled", "Partial"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R7: {
    label: "R7 - Inventory Aging Report",
    columns: ["Item Code", "Item Name", "Category", "UoM", "0-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Total Qty", "Total Value"],
    filters: [
      { key: "category", name: "Category", options: ["Electronics", "Mechanical", "PCB", "Assembly"] },
      { key: "warehouse", name: "Warehouse", options: ["WH-Main", "WH-FG", "WH-Consignment"] },
      { key: "date", name: "As Of Date", options: ["Today", "End of Last Month", "End of Last Quarter"] },
    ],
  },
  R8: {
    label: "R8 - Work Order Report",
    columns: ["WO No", "WO Date", "Product SKU", "Product Name", "Planned Qty", "Produced Qty", "Pending Qty", "Status", "BOM", "Cost Center"],
    filters: [
      { key: "product", name: "Product", options: ["FG-SKU001", "FG-SKU002", "FG-SKU003"] },
      { key: "status", name: "Status", options: ["Open", "In Progress", "Completed", "Cancelled"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R9: {
    label: "R9 - Vendor Performance Report",
    columns: ["Vendor Code", "Vendor Name", "PO Count", "On Time Delivery %", "Quality Rejection %", "Total PO Value", "Pending PO Value"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C"] },
      { key: "date_range", name: "Date Range", options: ["This Quarter", "Last Quarter", "This Year"] },
    ],
  },
  R10: {
    label: "R10 - Stock Valuation Report",
    columns: ["Item Code", "Item Name", "Category", "UoM", "Closing Stock", "Weighted Avg Rate", "Last Purchase Rate", "Total Value", "Location"],
    filters: [
      { key: "category", name: "Category", options: ["Electronics", "Mechanical", "PCB"] },
      { key: "location", name: "Location", options: ["Store-1", "Store-2", "FG Store"] },
      { key: "date", name: "As Of Date", options: ["Today", "End of Last Month", "End of Last Quarter"] },
    ],
  },
  R11: {
    label: "R11 - Daily Transaction Report",
    columns: ["Date", "Transaction Type", "Transaction No", "Item Code", "Item Name", "Qty", "Rate", "Amount", "Location", "Reference"],
    filters: [
      { key: "transaction_type", name: "Transaction Type", options: ["GRN", "MIN", "MRN", "Transfer", "Adjustment"] },
      { key: "location", name: "Location", options: ["Store-1", "Store-2", "FG Store", "Cons021"] },
      { key: "date_range", name: "Date Range", options: ["Today", "This Week", "This Month"] },
    ],
  },
  R12: {
    label: "R12 - Location Wise Stock Report",
    columns: ["Location", "Item Code", "Item Name", "Category", "UoM", "Opening", "Inward", "Outward", "Closing", "Value"],
    filters: [
      { key: "location", name: "Location", options: ["Store-1", "Store-2", "FG Store", "Cons021", "Vendor Location"] },
      { key: "category", name: "Category", options: ["Electronics", "Mechanical", "PCB", "Packaging"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R13: {
    label: "R13 - Challan Report",
    columns: ["Challan No", "Challan Date", "Vendor", "JW PO No", "Item Code", "Item Name", "Qty", "UoM", "Status"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R14: {
    label: "R14 - FG Inward Report",
    columns: ["FG MIN No", "Date", "Product SKU", "Product Name", "Qty", "Location", "WO No", "BOM", "Cost Center"],
    filters: [
      { key: "product", name: "Product", options: ["FG-SKU001", "FG-SKU002", "FG-SKU003"] },
      { key: "cost_center", name: "Cost Center", options: ["CC-Production", "CC-Assembly", "CC-Packaging"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R15: {
    label: "R15 - Pending PO Report",
    columns: ["PO No", "PO Date", "Vendor", "Item Code", "Item Name", "Ordered Qty", "Received Qty", "Pending Qty", "Expected Delivery", "Overdue Days"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C"] },
      { key: "overdue", name: "Overdue Filter", options: ["All", "Overdue Only", "Not Overdue"] },
    ],
  },
  R16: {
    label: "R16 - Material Transfer Report",
    columns: ["Transfer No", "Date", "From Location", "To Location", "Item Code", "Item Name", "Qty", "UoM", "Remarks"],
    filters: [
      { key: "from_location", name: "From Location", options: ["Store-1", "Store-2", "FG Store"] },
      { key: "to_location", name: "To Location", options: ["Store-1", "Store-2", "FG Store", "Cons021"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R17: {
    label: "R17 - Quality Control Report",
    columns: ["QC No", "Date", "Vendor", "GRN No", "Item Code", "Item Name", "Inspected Qty", "Accepted Qty", "Rejected Qty", "Remarks"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["Vendor A", "Vendor B", "Vendor C"] },
      { key: "result", name: "QC Result", options: ["Passed", "Failed", "Partial Pass"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month"] },
    ],
  },
  R18: {
    label: "R18 - Scrap Report",
    columns: ["Scrap No", "Date", "Item Code", "Item Name", "Category", "Qty", "UoM", "Location", "Remarks", "Approved By"],
    filters: [
      { key: "category", name: "Category", options: ["Electronics", "Mechanical", "PCB"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R19: {
    label: "R19 - Job Work PO Report",
    columns: ["JW PO No", "Date", "Vendor", "Product SKU", "Product Name", "Ordered Qty", "Processed Qty", "Pending Qty", "Status", "Due Date"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["ASCENT ENTERPRISES", "Vendor B", "Vendor C"] },
      { key: "status", name: "Status", options: ["Created", "In Progress", "Completed", "Cancelled"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R20: {
    label: "R20 - Batch Wise Report",
    columns: ["Batch No", "Item Code", "Item Name", "Manufacture Date", "Expiry Date", "Opening Qty", "Inward", "Outward", "Closing Qty", "Location"],
    filters: [
      { key: "location", name: "Location", options: ["Store-1", "Store-2", "FG Store"] },
      { key: "expiry_status", name: "Expiry Status", options: ["Valid", "Expiring Soon", "Expired"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month"] },
    ],
  },
  R21: {
    label: "R21 - Cost Center Wise Report",
    columns: ["Cost Center", "Item Code", "Item Name", "Issued Qty", "Rate", "Amount", "Department", "Project"],
    filters: [
      { key: "cost_center", name: "Cost Center", options: ["CC-Production", "CC-Assembly", "CC-R&D", "CC-Packaging"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R22: {
    label: "R22 - PPR Analysis Report",
    columns: ["PPR No", "Date", "Project", "Product SKU", "BOM", "Planned Qty", "Actual Qty", "Variance", "Cost Variance"],
    filters: [
      { key: "project", name: "Project", options: ["Project Alpha", "Project Beta", "Project Gamma"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R24: {
    label: "R24 - Component Consumption Report",
    columns: ["Date", "WO No", "Product SKU", "Component Code", "Component Name", "BOM Qty", "Consumed Qty", "Variance", "UoM"],
    filters: [
      { key: "product", name: "Product", options: ["FG-SKU001", "FG-SKU002", "FG-SKU003"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R25: {
    label: "R25 - Vendor RM Issue Report",
    columns: ["Issue No", "Date", "Vendor", "JW PO No", "Item Code", "Item Name", "Issued Qty", "Rate", "Amount", "Location"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["ASCENT ENTERPRISES", "Vendor B", "Vendor C"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R26: {
    label: "R26 - Reorder Level Report",
    columns: ["Item Code", "Item Name", "Category", "UoM", "Current Stock", "Reorder Level", "Min Stock", "Max Stock", "Status"],
    filters: [
      { key: "category", name: "Category", options: ["Electronics", "Mechanical", "PCB"] },
      { key: "status", name: "Stock Status", options: ["Below Reorder", "At Reorder", "Above Reorder"] },
    ],
  },
  R27: {
    label: "R27 - ABC Analysis Report",
    columns: ["Item Code", "Item Name", "Annual Consumption Value", "% of Total Value", "Cumulative %", "ABC Class"],
    filters: [
      { key: "date_range", name: "Date Range", options: ["This Year", "Last Year", "Last 6 Months"] },
      { key: "abc_class", name: "ABC Class", options: ["A", "B", "C"] },
    ],
  },
  R28: {
    label: "R28 - Reconciliation Report",
    columns: ["Item Code", "Item Name", "Book Stock", "Physical Stock", "Variance", "Variance %", "Location", "Remarks"],
    filters: [
      { key: "location", name: "Location", options: ["Store-1", "Store-2", "FG Store"] },
      { key: "date", name: "Audit Date", options: ["Today", "Yesterday", "Custom"] },
    ],
  },
  R29: {
    label: "R29 - JW RM Consumption Report",
    columns: ["Consumption No", "Date", "Vendor", "JW PO No", "Challan No", "Item Code", "Item Name", "Qty", "Rate", "Amount"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["ASCENT ENTERPRISES", "Vendor B", "Vendor C"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R30: {
    label: "R30 - Pending Dispatch Report",
    columns: ["SO No", "SO Date", "Customer", "Item Code", "Item Name", "Ordered Qty", "Dispatched Qty", "Pending Qty", "Expected Date"],
    filters: [
      { key: "customer", name: "Customer", options: ["Customer A", "Customer B", "Customer C"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month"] },
    ],
  },
  R31: {
    label: "R31 - Vendor RM Consumption Report",
    columns: ["Date", "Vendor", "JW ID", "Challan No", "Item Code", "Item Name", "Consumption Qty", "Rate", "Amount", "Location"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["ASCENT ENTERPRISES", "Vendor B", "Vendor C"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R32: {
    label: "R32 - Cost Center Transaction Report",
    columns: ["Transaction No", "Date", "Cost Center", "Transaction Type", "Item Code", "Item Name", "Qty", "Rate", "Amount", "Project"],
    filters: [
      { key: "cost_center", name: "Cost Center", options: ["CC-Production", "CC-Assembly", "CC-R&D"] },
      { key: "transaction_type", name: "Transaction Type", options: ["Issue", "Return", "Transfer"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R33: {
    label: "R33 - MIS Date Wise Report",
    columns: ["Date", "GRN Count", "MIN Count", "MRN Count", "Transfer Count", "Total Inward Value", "Total Outward Value", "Net Movement"],
    filters: [
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R34: {
    label: "R34 - FG Return Report (NG)",
    columns: ["Return No", "Date", "Product SKU", "Product Name", "Returned Qty", "Reason", "Location", "WO No", "Status"],
    filters: [
      { key: "product", name: "Product", options: ["FG-SKU001", "FG-SKU002", "FG-SKU003"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R35: {
    label: "R35 - SKU Raw Material Transaction Reco",
    columns: ["SKU", "Component Code", "Component Name", "BOM Qty", "Issued Qty", "Variance", "Date", "WO No", "Location"],
    filters: [
      { key: "product", name: "Product SKU", options: ["FG-SKU001", "FG-SKU002", "FG-SKU003"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
  R37: {
    label: "R37 - Job Work Inventory Report",
    columns: ["Vendor", "Item Code", "Item Name", "Issued Qty", "Returned Qty", "Consumed Qty", "Balance Qty", "Value", "JW PO No", "Date"],
    filters: [
      { key: "vendor", name: "Vendor", options: ["ASCENT ENTERPRISES", "Vendor B", "Vendor C"] },
      { key: "date_range", name: "Date Range", options: ["This Month", "Last Month", "This Quarter"] },
    ],
  },
};

const REPORT_OPTIONS = Object.entries(REPORT_CONFIGS).map(([key, cfg]) => ({
  value: key,
  label: cfg.label,
}));

const SCHEDULE_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div style={{ borderTop: "1px solid #e8e8e8" }}>
    <div style={{ padding: "14px 24px 0 24px" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#444",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ paddingBottom: 16 }}>{children}</div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ReportExportConfig = () => {
  const [reportType, setReportType] = useState(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState(null);
  const [emailConfirmation, setEmailConfirmation] = useState("no");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filterRows, setFilterRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const config = reportType ? REPORT_CONFIGS[reportType] : null;

  // When report type changes, reset columns & filters
  const handleReportChange = (val) => {
    setReportType(val);
    const cfg = REPORT_CONFIGS[val];
    setSelectedColumns(cfg ? [...cfg.columns] : []);
    setFilterRows(
      cfg
        ? cfg.filters.map((f) => ({ ...f, enabled: true, selected: [] }))
        : []
    );
  };

  // ── Column chip toggle ──────────────────────────────────────────────────────
  const toggleAll = (checked) => {
    setSelectedColumns(checked ? [...(config?.columns ?? [])] : []);
  };

  const toggleColumn = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const allSelected =
    config && selectedColumns.length === config.columns.length;

  // ── Filter row helpers ──────────────────────────────────────────────────────
  const toggleAllFilters = (checked) => {
    setFilterRows((rows) => rows.map((r) => ({ ...r, enabled: checked })));
  };

  const toggleFilter = (key) => {
    setFilterRows((rows) =>
      rows.map((r) => (r.key === key ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const setFilterValue = (key, val) => {
    setFilterRows((rows) =>
      rows.map((r) => (r.key === key ? { ...r, selected: val } : r))
    );
  };

  const allFiltersEnabled =
    filterRows.length > 0 && filterRows.every((r) => r.enabled);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleCreateExport = async () => {
    if (!reportType) {
      toast.error("Please choose a report type");
      return;
    }
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column");
      return;
    }

    const payload = {
      reportType,
      columns: selectedColumns,
      filters: filterRows
        .filter((r) => r.enabled && r.selected.length > 0)
        .map((r) => ({ name: r.key, values: r.selected })),
      schedule: scheduleEnabled
        ? {
            frequency: scheduleFreq,
            time: scheduleTime ? scheduleTime.format("HH:mm") : null,
          }
        : null,
      emailConfirmation: emailConfirmation,
    };

    try {
      setSubmitting(true);
      // Dummy API — replace with real endpoint when backend is ready
      const response = await imsAxios
        .post("/report/export/create", payload)
        .catch(() => ({ success: true, message: "Export job created successfully [DEMO-EXP-001]" }));

      if (response?.success !== false) {
        toast.success(
          response?.message || "Export job created successfully"
        );
        // reset
        setReportType(null);
        setSelectedColumns([]);
        setFilterRows([]);
        setScheduleEnabled(false);
        setEmailConfirmation("no");
      } else {
        toast.error(response?.message || "Failed to create export");
      }
    } catch {
      toast.error("Failed to create export job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%", paddingBottom: 80 }}>
      {/* Page title */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid #e8e8e8",
          fontSize: 13,
          color: "#555",
        }}
      >
        Export Configurations
      </div>

      {/* ── CHOOSE REPORT TYPE ── */}
      <Section title="CHOOSE REPORT TYPE">
        <Select
          style={{ width: 380 }}
          placeholder="Select Report Type"
          options={REPORT_OPTIONS}
          value={reportType}
          onChange={handleReportChange}
          showSearch
          filterOption={(input, opt) =>
            opt.label.toLowerCase().includes(input.toLowerCase())
          }
          allowClear
          onClear={() => {
            setReportType(null);
            setSelectedColumns([]);
            setFilterRows([]);
          }}
        />
      </Section>

      {/* ── REPORT SCHEDULE ── */}
      <Section title="REPORT SCHEDULE">
        <Checkbox
          checked={scheduleEnabled}
          onChange={(e) => setScheduleEnabled(e.target.checked)}
        >
          Schedule the Report
        </Checkbox>

        {scheduleEnabled && (
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <Select
              style={{ width: 140 }}
              value={scheduleFreq}
              options={SCHEDULE_FREQUENCIES}
              onChange={setScheduleFreq}
            />
            <TimePicker
              format="HH:mm"
              value={scheduleTime}
              onChange={setScheduleTime}
              placeholder="Select Time"
              style={{ width: 140 }}
            />
          </div>
        )}
      </Section>

      {/* ── CHOOSE COLUMNS ── */}
      <Section title="CHOOSE COLUMNS">
        {!config ? (
          <span style={{ color: "#aaa", fontSize: 13 }}>
            Select a report type to see available columns
          </span>
        ) : (
          <Space size={[8, 10]} wrap>
            {/* All chip */}
            <Tag
              onClick={() => toggleAll(!allSelected)}
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 13,
                userSelect: "none",
                background: allSelected ? "#04b0a8" : "#f0f0f0",
                color: allSelected ? "#fff" : "#555",
                border: allSelected ? "1px solid #04b0a8" : "1px solid #d9d9d9",
              }}
            >
              {allSelected && (
                <span style={{ marginRight: 4, fontSize: 12 }}>✓</span>
              )}
              All
            </Tag>

            {config.columns.map((col) => {
              const active = selectedColumns.includes(col);
              return (
                <Tag
                  key={col}
                  onClick={() => toggleColumn(col)}
                  style={{
                    cursor: "pointer",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 13,
                    userSelect: "none",
                    background: active ? "#04b0a8" : "#f0f0f0",
                    color: active ? "#fff" : "#555",
                    border: active ? "1px solid #04b0a8" : "1px solid #d9d9d9",
                  }}
                >
                  {active && (
                    <span style={{ marginRight: 4, fontSize: 12 }}>✓</span>
                  )}
                  {col}
                </Tag>
              );
            })}
          </Space>
        )}
      </Section>

      {/* ── FILTERS ── */}
      <Section title="FILTERS">
        {!config ? (
          <span style={{ color: "#aaa", fontSize: 13 }}>
            Select a report type to see available filters
          </span>
        ) : filterRows.length === 0 ? (
          <span style={{ color: "#aaa", fontSize: 13 }}>No filters available</span>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{
                    width: 48,
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <Checkbox
                    checked={allFiltersEnabled}
                    indeterminate={
                      filterRows.some((r) => r.enabled) && !allFiltersEnabled
                    }
                    onChange={(e) => toggleAllFilters(e.target.checked)}
                  />
                </th>
                <th
                  style={{
                    padding: "8px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "1px solid #e8e8e8",
                    width: 220,
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "8px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "1px solid #e8e8e8",
                  }}
                >
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {filterRows.map((row) => (
                <tr key={row.key}>
                  <td
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #e8e8e8",
                      textAlign: "center",
                    }}
                  >
                    <Checkbox
                      checked={row.enabled}
                      onChange={() => toggleFilter(row.key)}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      border: "1px solid #e8e8e8",
                      fontSize: 13,
                      color: "#555",
                    }}
                  >
                    {row.name}
                  </td>
                  <td style={{ padding: "8px 16px", border: "1px solid #e8e8e8" }}>
                    <Select
                      mode="multiple"
                      style={{ width: "100%", maxWidth: 480 }}
                      placeholder={`Select ${row.name}`}
                      value={row.selected}
                      onChange={(val) => setFilterValue(row.key, val)}
                      disabled={!row.enabled}
                      options={row.options.map((o) => ({ value: o, label: o }))}
                      tagRender={({ label, closable, onClose }) => (
                        <Tag
                          color="#04b0a8"
                          closable={closable}
                          onClose={onClose}
                          style={{ marginRight: 4 }}
                        >
                          {label}
                        </Tag>
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* ── EMAIL CONFIRMATION ── */}
      <Section title="EMAIL CONFIRMATION">
        <Radio.Group
          value={emailConfirmation}
          onChange={(e) => setEmailConfirmation(e.target.value)}
        >
          <Radio value="yes">Yes</Radio>
          <Radio value="no">No</Radio>
        </Radio.Group>
      </Section>

      {/* ── Footer ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: 0,
          background: "#fff",
          borderTop: "1px solid #e8e8e8",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <MyButton
          variant="submit"
          type="primary"
          size="large"
          loading={submitting}
          onClick={handleCreateExport}
          text="Create Export"
        />
      </div>
    </div>
  );
};

export default ReportExportConfig;
