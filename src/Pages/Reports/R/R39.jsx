import React, { useState } from "react";
import { Col, Row, Space, Table } from "antd";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { getProjectOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";

const R39 = () => {
  document.title = "Report 39 - Production PPR";
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [project, setProject] = useState("");
  const [projectAsyncOptions, setProjectAsyncOptions] = useState([]);
  const { executeFun, loading: loadingSelect } = useApi();

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(() => getProjectOptions(search), "select");
    setProjectAsyncOptions(response?.data ?? []);
  };

  const fetchReport = async () => {
    setLoading(true);
    setRows([]);
    try {
      const { data } = await imsAxios.post("/report39", {
        project_name:
          project != null && String(project).trim() !== ""
            ? String(project).trim()
            : "",
      });
      if (data?.code === 200 && data?.response?.data) {
        const arr = data.response.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(arr);
        if (arr.length === 0) {
          toast.info("No data found");
        }
      } else {
        const msg =
          data?.message?.msg ?? data?.message ?? "Failed to load report";
        toast.error(typeof msg === "string" ? msg : String(msg));
      }
    } catch {
      toast.error("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  // Month columns should follow component-level execution, not SKU-level.
  const componentMonthLabels = Array.from(
    new Set(
      rows.flatMap((row) =>
        Array.isArray(row.components)
          ? row.components.flatMap((component) =>
              Array.isArray(component?.month_exec)
                ? component.month_exec
                    .map((m) => m?.month)
                    .filter((m) => Boolean(m))
                : [],
            )
          : [],
      ),
    ),
  );

  const baseColumns = [
    { field: "id", headerName: "#", width: 60 },
    {
      field: "project_id",
      headerName: "Project ID",
      minWidth: 140,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.project_id} copy={true} />
      ),
    },
    {
      field: "project_name",
      headerName: "Project Name",
      minWidth: 140,
      renderCell: ({ row }) => <ToolTipEllipses text={row.project_name} />,
    },
    {
      field: "ppr_no",
      headerName: "PPR No",
      minWidth: 110,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.ppr_no} copy={true} />
      ),
    },
    {
      field: "product_sku_code",
      headerName: "Product SKU Code",
      minWidth: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.product_sku_code} copy={true} />
      ),
    },
    {
      field: "bom",
      headerName: "BOM",
      minWidth: 140,
      renderCell: ({ row }) => <ToolTipEllipses text={row.bom} />,
    },
    { field: "bom_qty", headerName: "BOM Qty", width: 90 },
  ];

  const tailColumns = [
    {
      field: "planned_month",
      headerName: "Planned Month",
      minWidth: 110,
    },
    { field: "project_plan_qty", headerName: "Project Plan Qty", width: 130 },
    {
      field: "project_executed_qty",
      headerName: "Project Executed Qty",
      width: 140,
    },
    {
      field: "project_pending_qty",
      headerName: "Project Pending Qty",
      width: 140,
    },
  ];

  const columns = [...baseColumns, ...tailColumns];

  // Project-level rows; components neeche detail table me dikhayenge
  const displayRows = rows.map((row, rowIndex) => ({
    ...row,
    id: row.id ?? rowIndex + 1,
  }));

  return (
    <div style={{ height: "90%", padding: "10px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <Space wrap>
            <div style={{ width: 320 }}>
              <MyAsyncSelect
                loadOptions={handleFetchProjectOptions}
                onBlur={() => setProjectAsyncOptions([])}
                placeholder="Filter by Project (optional)"
                optionsState={projectAsyncOptions}
                selectLoading={loadingSelect("select")}
                value={project || undefined}
                onChange={(v) => setProject(v ?? "")}
              />
            </div>
            <MyButton
              variant="search"
              type="primary"
              loading={loading}
              onClick={fetchReport}
            >
              Fetch
            </MyButton>
          </Space>
        </Col>
        <Col>
          <CommonIcons
            action="downloadButton"
            disabled={rows.length === 0}
            onClick={() => {
              const flatForCsv = rows.flatMap((row) => {
                if (!Array.isArray(row.components) || !row.components.length) {
                  return [{ ...row }];
                }

                return row.components.map((c) => {
                  const compMonthMap = {};
                  if (Array.isArray(c.month_exec)) {
                    c.month_exec.forEach((m) => {
                      if (m?.month) compMonthMap[m.month] = m.qty ?? 0;
                    });
                  }
                  const compMonthFields = componentMonthLabels.reduce(
                    (acc, label, index) => {
                      acc[`component_month_${index}`] = compMonthMap[label] ?? 0;
                      return acc;
                    },
                    {},
                  );

                  return {
                  ...row,
                  ...compMonthFields,
                  component_part_no: c.part_no,
                  component_name: c.name,
                  component_bom_qty: c.bom_qty,
                  component_unit: c.unit,
                  component_ppr_plan_qty: c.ppr_plan_qty,
                  component_ppr_executed_qty: c.ppr_executed_qty,
                  component_ppr_pending_qty: c.ppr_pending_qty,
                  };
                });
              });

              const exportColumns = [
                ...baseColumns,
                ...tailColumns,
                {
                  field: "component_part_no",
                  headerName: "Part No",
                  minWidth: 120,
                },
                {
                  field: "component_name",
                  headerName: "Component",
                  minWidth: 180,
                },
                ...componentMonthLabels.map((label, index) => ({
                  field: `component_month_${index}`,
                  headerName: `Comp ${label}`,
                  width: 130,
                })),
              ];

              downloadCSV(
                flatForCsv,
                exportColumns,
                "Report39 Production PPR",
              );
            }}
          />
        </Col>
      </Row>
      <div style={{ height: "80%" }}>
        <Table
          loading={loading}
          size="small"
          rowKey={(record) => record.id}
          dataSource={displayRows}
          columns={[
            { title: "#", dataIndex: "id", width: 50 },
            {
              title: "Project ID",
              dataIndex: "project_id",
              render: (text) => (
                <ToolTipEllipses text={text} copy={true} />
              ),
            },
            {
              title: "Project Name",
              dataIndex: "project_name",
              render: (text) => <ToolTipEllipses text={text} />,
            },
            {
              title: "PPR No",
              dataIndex: "ppr_no",
              render: (text) => (
                <ToolTipEllipses text={text} copy={true} />
              ),
            },
            {
              title: "Product SKU Code",
              dataIndex: "product_sku_code",
              render: (text) => (
                <ToolTipEllipses text={text} copy={true} />
              ),
            },
            { title: "BOM", dataIndex: "bom" },
            { title: "BOM Qty", dataIndex: "bom_qty" },
            { title: "Planned Month", dataIndex: "planned_month" },
            { title: "Project Plan Qty", dataIndex: "project_plan_qty" },
            { title: "Project Executed Qty", dataIndex: "project_executed_qty" },
            { title: "Project Pending Qty", dataIndex: "project_pending_qty" },
          ]}
          expandable={{
            expandedRowRender: (record) => {
              const comps = Array.isArray(record.components)
                ? record.components
                : [];
              if (!comps.length) {
                return (
                  <div style={{ padding: 8, fontSize: 12, color: "#999" }}>
                    No component data available.
                  </div>
                );
              }
              const formattedComps = comps.map((c, idx) => {
                const monthMap = {};
                if (Array.isArray(c.month_exec)) {
                  c.month_exec.forEach((m) => {
                    if (m?.month) monthMap[m.month] = m.qty ?? 0;
                  });
                }
                const monthFields = componentMonthLabels.reduce(
                  (acc, label, index) => {
                    acc[`month_${index}`] = monthMap[label] ?? 0;
                    return acc;
                  },
                  {},
                );
                return { key: idx + 1, ...c, ...monthFields };
              });

              return (
                <div style={{ padding: 8 }}>
                  <div style={{ marginBottom: 6, fontSize: 12 }}>
                    <strong>Components for:</strong> {record.project_id} -{" "}
                    {record.project_name} &nbsp; | &nbsp;
                    <strong>PPR:</strong> {record.ppr_no} &nbsp; | &nbsp;
                    <strong>SKU:</strong> {record.product_sku_code}
                  </div>
                  <Table
                    size="small"
                    rowKey={(row) => row.component_id || row.part_no}
                    pagination={false}
                    dataSource={formattedComps}
                    columns={[
                      {
                        title: "Part No",
                        dataIndex: "part_no",
                        render: (text) => (
                          <ToolTipEllipses text={text} copy={true} />
                        ),
                      },
                      {
                        title: "Component",
                        dataIndex: "name",
                        render: (text) => <ToolTipEllipses text={text} />,
                      },
                      { title: "UoM", dataIndex: "unit" },
                      { title: "BOM Qty", dataIndex: "bom_qty" },
                      { title: "PPR Plan Qty", dataIndex: "ppr_plan_qty" },
                      {
                        title: "PPR Executed Qty",
                        dataIndex: "ppr_executed_qty",
                      },
                      {
                        title: "PPR Pending Qty",
                        dataIndex: "ppr_pending_qty",
                      },
                      ...componentMonthLabels.map((label, index) => ({
                        title: label,
                        dataIndex: `month_${index}`,
                      })),
                    ]}
                  />
                </div>
              );
            },
            rowExpandable: (record) =>
              Array.isArray(record.components) && record.components.length > 0,
          }}
        />
      </div>
    </div>
  );
};

export default R39;
