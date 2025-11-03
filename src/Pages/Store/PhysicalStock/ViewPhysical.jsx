import { useEffect, useState } from "react";
import {
  Col,
  Divider,
  Flex,
  Form,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import MySelect from "../../../Components/MySelect";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general.ts";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { getLogs, getVerifiedStocks } from "../../../api/store/physical-stock";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { convertSelectOptions } from "../../../utils/general.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { Search, ViewAgenda } from "@mui/icons-material";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import VisibilityIcon from "@mui/icons-material/Visibility";

function ViewPhysical() {
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
      arr = response.data.data.map((row, index) => ({
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
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="View Logs">
          <IconButton
            onClick={() => {
              setShowLogs(true);
              setSelectedAudit(row?.original);
            }}
            color="inherit"
            size="small"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
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
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Logs
        open={showLogs}
        hide={hideLogs}
        selectedAudit={selectedAudit}
        columns={columns}
        logs={logs}
        setLogs={setLogs}
      />
      <Col span={4}>
        <CustomFieldBox title="Filter">
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
                  onclick={handleFetchRows}
                  loading={loading("fetchRows")}
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
      <Col span={20}>
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
}

export default ViewPhysical;

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
    flex: 1,
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

  const table = useMaterialReactTable({
    columns: columns,
    data: logs || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 200px)"
          : "calc(100vh - 460px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") ? (
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
    <Modal
      size="small"
      open={open}
      onCancel={hide}
      width={"80%"}
      title="Physical Logs"
      extra={"hello"}
      footer={null}
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
        <Col
          span={24}
          style={{ height: "calc(100vh - 340px)", overflow: "auto" }}
        >
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </Modal>
  );
};

const logsColumns = [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "auditDate",
    size: 150,
  },
  {
    header: "IMS Stock",
    accessorKey: "imsQty",
    size: 120,
  },
  {
    header: "Physical Stock",
    accessorKey: "auditStock",
    size: 120,
  },
  {
    header: "Verified By",
    accessorKey: "auditBy",
    size: 120,
  },
  {
    header: "Updated On",
    accessorKey: "updatedOn",
    size: 180,
  },
  {
    header: "Updated By",
    accessorKey: "updatedBy",
    size: 180,
  },
  {
    header: "Remark",
    accessorKey: "remark",

    size: 180,
    flex: 1,
  },
];
