import { useState, useEffect } from "react";
import {
  Select,
  Checkbox,
  Tag,
  TimePicker,
  Space,
  Radio,
  DatePicker,
  Input,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { imsAxios } from "../../axiosInterceptor";
import socket from "../../Components/socket";
import { setNotifications } from "../../Features/loginSlice/loginSlice";
import MyButton from "../../Components/MyButton";

const SCHEDULE_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const formatDateRange = (selected) => {
  const [start, end] = selected ?? [];
  if (!start || !end) return "";
  return `${dayjs(start).format("DD-MM-YYYY")} - ${dayjs(end).format("DD-MM-YYYY")}`;
};

const formatTimer = (scheduleEnabled, scheduleTime) => {
  if (!scheduleEnabled || !scheduleTime) return "";
  return `${dayjs().format("DD-MM-YY")} ${scheduleTime.format("HH:mm")}`;
};

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
  const dispatch = useDispatch();
  const { user, notifications } = useSelector((state) => state.login);
  const [reportType, setReportType] = useState(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState(null);
  const [emailConfirmation, setEmailConfirmation] = useState("no");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filterRows, setFilterRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportOptions, setReportOptions] = useState([]);
  const [reportCols, setReportCols] = useState([]);

  const REPORT_OPTIONS = (reportOptions ?? []).map((item) => ({
    value: item.report_key,
    label: item.report_name,
  }));

  const fetchReportOptions = async () => {
    setLoading(true);
    try {
      const response = await imsAxios.get("reports/getReportName");
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      setReportOptions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error?.message ?? "Error fetching report options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportOptions();
  }, []);

  useEffect(() => {
    if (!reportType) return;

    let cancelled = false;

    const fetchReportDetails = async () => {
      setLoading(true);
      try {
        const response = await imsAxios.get(
          `reports/getColsbyName/${reportType}`,
        );
        if (cancelled) return;
        if (!response.success) {
          toast.error(response.message);
          return;
        }
        const cols = response.data?.report_cols ?? [];
        const wise = (response.data?.wise ?? []).map((item) => ({
          label: item.label,
          value: item.value,
          enabled: false,
          selected: null,
        }));
        setReportCols(cols);
        setSelectedColumns(cols);
        setFilterRows(wise);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.message ?? "Error fetching report details");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReportDetails();

    return () => {
      cancelled = true;
    };
  }, [reportType]);

  const handleReportChange = (val) => {
    setReportType(val);
    setSelectedColumns([]);
    setFilterRows([]);
    setReportCols([]);
  };

  // ── Column chip toggle ──────────────────────────────────────────────────────
  const toggleAll = (checked) => {
    setSelectedColumns(checked ? [...(reportCols ?? [])] : []);
  };

  const toggleColumn = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const allSelected =
    reportCols && selectedColumns.length === reportCols?.length;

  // ── Filter row helpers ──────────────────────────────────────────────────────
  const toggleAllFilters = (checked) => {
    setFilterRows((rows) =>
      rows.map((r) => ({
        ...r,
        enabled: checked,
        selected: checked ? r.selected : null,
      })),
    );
  };

  const toggleFilter = (key) => {
    setFilterRows((rows) =>
      rows.map((r) =>
        r.value === key
          ? {
              ...r,
              enabled: !r.enabled,
              selected: r.enabled ? null : r.selected,
            }
          : r,
      ),
    );
  };

  const setFilterValue = (key, val) => {
    setFilterRows((rows) =>
      rows.map((r) => (r.value === key ? { ...r, selected: val } : r)),
    );
  };

  const allFiltersEnabled =
    filterRows.length > 0 && filterRows.every((r) => r.enabled);

  const someFiltersEnabled = filterRows.some((r) => r.enabled);

  const renderFilterValue = (row) => {
    const isDateWise = String(row.value).toLowerCase().includes("date");
    if (isDateWise) {
      return (
        <DatePicker.RangePicker
          style={{ width: "100%", maxWidth: 400 }}
          disabled={!row.enabled}
          value={row.selected}
          onChange={(dates) => setFilterValue(row.value, dates)}
        />
      );
    }
    return (
      <Input
        placeholder={`Enter ${row.label}`}
        disabled={!row.enabled}
        value={row.selected ?? ""}
        style={{ width: "100%", maxWidth: 400 }}
        onChange={(e) => setFilterValue(row.value, e.target.value)}
      />
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleCreateExport = () => {
    if (!reportType) {
      toast.error("Please choose a report type");
      return;
    }
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column");
      return;
    }
    if (scheduleEnabled && !scheduleTime) {
      toast.error("Please select schedule time");
      return;
    }

    const activeFilter = filterRows.find((row) => {
      if (!row.enabled) return false;
      if (Array.isArray(row.selected)) return row.selected.length > 0;
      return Boolean(row.selected);
    });

    if (filterRows.length > 0 && !activeFilter) {
      toast.error("Please enable a filter and provide its value");
      return;
    }

    const isDateFilter = activeFilter
      ? String(activeFilter.value).toLowerCase().includes("date")
      : false;

    let dateValue = "";
    if (activeFilter) {
      if (isDateFilter) {
        dateValue = formatDateRange(activeFilter.selected);
        if (!dateValue) {
          toast.error("Please select a valid date range");
          return;
        }
      } else {
        dateValue = activeFilter.selected;
      }
    }

    const notificationId = v4();
    const otherdata = {
      date: dateValue,
      branch: user?.company_branch,
      wise: activeFilter.value,
      columns: selectedColumns,
      sendEmail: emailConfirmation === "yes",
      isSchedule: scheduleEnabled,
      timer: formatTimer(scheduleEnabled, scheduleTime),
    };

    // dispatch(
    //   setNotifications([
    //     { notificationId, loading: true, type: "file" },
    //     ...notifications,
    //   ]),
    // );

    socket.emit("custom_trans_in", {
      otherdata,
      notificationId,
    });

    toast.success("Export job created successfully");

    setReportType(null);
    setSelectedColumns([]);
    setFilterRows([]);
    setReportCols([]);
    setScheduleEnabled(false);
    setScheduleFreq("daily");
    setScheduleTime(null);
    setEmailConfirmation("no");
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%", paddingBottom: 80 }}>
  
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

      <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
        <Spin spinning={loading}>
          <div style={{ minHeight: 200 }}>
        
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
                  setReportCols([]);
                }}
              />
            </Section>

     
            <Section title="REPORT SCHEDULE">
              <Checkbox
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
              >
                Schedule the Report
              </Checkbox>

              {scheduleEnabled && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
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

      
            <Section title="CHOOSE COLUMNS">
              {!reportType ? (
                <span style={{ color: "#aaa", fontSize: 13 }}>
                  Select a report type to see available columns
                </span>
              ) : reportCols.length === 0 ? (
                <span style={{ color: "#aaa", fontSize: 13 }}>
                  No columns available
                </span>
              ) : (
                <Space size={[8, 10]} wrap>
           
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
                      border: allSelected
                        ? "1px solid #04b0a8"
                        : "1px solid #d9d9d9",
                    }}
                  >
                    {allSelected && (
                      <span style={{ marginRight: 4, fontSize: 12 }}>✓</span>
                    )}
                    All
                  </Tag>

                  {reportCols.map((col) => {
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
                          border: active
                            ? "1px solid #04b0a8"
                            : "1px solid #d9d9d9",
                        }}
                      >
                        {active && (
                          <span style={{ marginRight: 4, fontSize: 12 }}>
                            ✓
                          </span>
                        )}
                        {col}
                      </Tag>
                    );
                  })}
                </Space>
              )}
            </Section>

      
            <Section title="FILTERS">
              {!reportType ? (
                <span style={{ color: "#aaa", fontSize: 13 }}>
                  Select a report type to see available filters
                </span>
              ) : filterRows.length === 0 ? (
                <span style={{ color: "#aaa", fontSize: 13 }}>
                  No filters available
                </span>
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
                            someFiltersEnabled && !allFiltersEnabled
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
                      <tr key={row.value}>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #e8e8e8",
                            textAlign: "center",
                          }}
                        >
                          <Checkbox
                            checked={row.enabled}
                            onChange={() => toggleFilter(row.value)}
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
                          {row.label}
                        </td>
                        <td
                          style={{
                            padding: "8px 16px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          {renderFilterValue(row)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>

            <Section title="EMAIL CONFIRMATION">
              <Radio.Group
                value={emailConfirmation}
                onChange={(e) => setEmailConfirmation(e.target.value)}
              >
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Section>
          </div>
        </Spin>
      </div>

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
          disabled={loading}
          onClick={handleCreateExport}
          text="Create Export"
        />
      </div>
    </div>
  );
};

export default ReportExportConfig;
