import { useEffect, useState } from "react";
import { Col, Divider, Flex, Form, Modal, Row, Space, Typography } from "antd";
import MySelect from "@/Components/MySelect";
import useApi from "@/hooks/useApi.ts";
import { getComponentOptions } from "@/api/general.ts";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
import MyDatePicker from "@/Components/MyDatePicker";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import MyDataTable from "@/Components/MyDataTable";
import { getLogs, getVerifiedStocks } from "@/api/production/physical-stock";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { downloadCSV } from "@/Components/exportToCSV";
import { convertSelectOptions } from "@/utils/general.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

function ViewPhysicalProduction() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  const wise = Form.useWatch("wise", form);

  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "fetchComponent"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const handleFetchRows = async () => {
    const values = await form.validateFields();
    const response = await executeFun(
      () => getVerifiedStocks(values.wise, values.data),
      "fetchRows"
    );
    let arr = [];
    if (response.success) {
      arr = response.data.map((row, index) => ({
        id: index + 1,
        component: row.name,
        partCode: row.part,
        date: row.dt,
        uom: row.uom,
        imsStock: row.cl,
        auditStock: row.rm,
        verifiedBy: row.by,
        remark: row.remark,
        auditKey: row.audit_key,
        location: row.location,
      }));
    }
    setRows(arr);
  };

  const handleDownloadExcel = () => {
    downloadCSV(rows, columns, "Verified Physical Stock");
  };

  const hideLogs = () => {
    setShowLogs(false);
    setSelectedAudit(null);
  };
  useEffect(() => {
    form.setFieldValue("data", "");
  }, [wise]);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <CustomButton
        size="small"
        variant="text"
        title={"update"}
        onclick={() => {
          setSelectedAudit(row?.original);
          setShowUpdateModal(true);
        }}
      />
    ),
    muiTableContainerProps: {
      sx: {
        height: loading("fetchRows")
          ? "calc(100vh - 200px)"
          : "calc(100vh - 250px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetchRows") ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });

  return (
    <Row gutter={6} style={{ height: "95%", margin: 12 }}>
      <Logs
        open={showLogs}
        hide={hideLogs}
        selectedAudit={selectedAudit}
        columns={columns}
        logs={logs}
        setLogs={setLogs}
      />
      <Col span={6}>
        <CustomFieldBox title={"Filters"}>
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item name="wise" label="Select Filter">
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item
              name="data"
              label={`Select ${
                wise === "datewise"
                  ? "Date"
                  : wise === "partwise"
                  ? "Component"
                  : ""
              }`}
            >
              {wise === "partwise" && (
                <MyAsyncSelect
                  optionsState={asyncOptions}
                  selectLoading={loading("fetchComponent")}
                  loadOptions={handleFetchComponentOptions}
                  onBlur={() => setAsyncOptions([])}
                />
              )}
              {wise === "datewise" && (
                <MyDatePicker
                  setDateRange={(value) => form.setFieldValue("data", value)}
                />
              )}
            </Form.Item>

            <Row justify="end">
              <Space>
                <CustomButton
                  size="small"
                  title={"search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetchRows")}
                  onclick={handleFetchRows}
                />
                <CommonIcons
                  action="downloadButton"
                  onClick={handleDownloadExcel}
                />
              </Space>
            </Row>
          </Form>
        </CustomFieldBox>
      </Col>
      <Col span={18}>
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
}

export default ViewPhysicalProduction;

const wiseOptions = [
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Component Wise",
    value: "partwise",
  },
];

const initialValues = {
  wise: "datewise",
  data: "",
};

const columns = [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 150,
  },
  {
    header: "Component",
    accessorKey: "component",
    size: 150,
    flex: 1,
  },
  {
    header: "Part Code",
    accessorKey: "partCode",
    size: 100,
  },
  {
    header: "UoM",
    accessorKey: "uom",
    size: 70,
  },
  {
    header: "Location",
    accessorKey: "location",
    size: 70,
  },
  {
    header: "IMS Stock",
    accessorKey: "imsStock",
    size: 120,
  },
  {
    header: "Physical Stock",
    accessorKey: "auditStock",
    size: 120,
  },

  {
    header: "Verified By",
    accessorKey: "verifiedBy",
    size: 120,
  },
  {
    header: "Remark",
    accessorKey: "remark",
    size: 180,
  },
];

const Logs = ({ open, hide, selectedAudit, logs, setLogs }) => {
  const { executeFun, loading } = useApi();

  const handleFetchLogs = async (auditKey) => {
    const response = await executeFun(() => getLogs(auditKey), "fetch");

    let arr = [];
    if (response.success) {
      arr = response.data.data.map((row, index) => ({
        id: index + 1,
        auditBy: row.audit_by,
        auditDate: row.audit_dt,
        auditStock: row.audit_qty,
        imsQty: row.ims_qty,
        remark: row.remark,
        updatedOn: row.update_date,
        updatedBy: row.update_user,
      }));
    }
    setLogs(arr);
  };

  const handleDownloadExcel = () => {
    downloadCSV(
      logs,
      logsColumns,
      `Verified Physical Stock logs - ${selectedAudit.component}`
    );
  };

  useEffect(() => {
    if (selectedAudit) {
      handleFetchLogs(selectedAudit.auditKey);
    }
  }, [selectedAudit]);
  return (
    <Modal
      size="small"
      open={open}
      onCancel={hide}
      width={1200}
      title="Physical Logs"
      extra={"hello"}
      footer={<div></div>}
    >
      <Row gutter={[0, 6]}>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text strong>Remarks:</Typography.Text>
            <Typography.Text>
              {selectedAudit?.remark === "" ? "--" : selectedAudit?.remark}
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Row justify="end">
            <CommonIcons
              action="downloadButton"
              onClick={handleDownloadExcel}
            />
          </Row>
        </Col>
        <Divider />
        <Col span={24} style={{ height: 500, overflow: "auto" }}>
          <MyDataTable
            columns={logsColumns}
            data={logs}
            loading={loading("fetch")}
          />
        </Col>
      </Row>
    </Modal>
  );
};

const logsColumns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "auditDate",
    width: 150,
  },
  {
    headerName: "IMS Stock",
    field: "imsQty",
    width: 120,
  },
  {
    headerName: "Physical Stock",
    field: "auditStock",
    width: 120,
  },
  {
    headerName: "Verified By",
    field: "auditBy",
    width: 120,
  },
  {
    headerName: "Updated On",
    field: "updatedOn",
    width: 180,
  },
  {
    headerName: "Updated By",
    field: "updatedBy",
    width: 180,
  },
  {
    headerName: "Remark",
    field: "remark",
    minWidth: 180,
    flex: 1,
  },
];
