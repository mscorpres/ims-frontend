import { useEffect, useState } from "react";
import {
  Button,
  Card,
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
import useApi from "../../../hooks/useApi";
import { getComponentOptions } from "../../../api/general";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { SearchOutlined } from "@ant-design/icons";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../Components/MyDataTable";
import { getLogs, getVerifiedStocks } from "../../../api/store/physical-stock";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { convertSelectOptions } from "../../../utils/general";

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
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // show logs icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label={"View Logs"}
        onClick={() => {
          setShowLogs(true);
          setSelectedAudit(row);
        }}
      />,
    ],
  };
  useEffect(() => {
    form.setFieldValue("data", "");
  }, [wise]);

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
        <Card size="small" title="Filters">
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
                <Button
                  onClick={handleFetchRows}
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={loading("fetchRows")}
                >
                  Fetch
                </Button>
                <CommonIcons
                  action="downloadButton"
                  onClick={handleDownloadExcel}
                />
              </Space>
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          data={rows}
          columns={[actionColumn, ...columns]}
          loading={loading("fetchRows")}
        />
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
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 150,
  },
  {
    headerName: "Component",
    field: "component",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 100,
  },
  {
    headerName: "UOM",
    field: "uom",
    width: 70,
  },
  {
    headerName: "IMS Stock",
    field: "imsStock",
    width: 120,
  },
  {
    headerName: "Physical Stock",
    field: "auditStock",
    width: 120,
  },

  {
    headerName: "Verified By",
    field: "verifiedBy",
    width: 120,
  },
  {
    headerName: "Remark",
    field: "remark",
    minWidth: 180,
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
