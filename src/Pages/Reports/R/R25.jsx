import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import Loading from "../../../Components/Loading";
import { set } from "lodash";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";

const R25 = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [filterForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [selectLoading, setSelectLoading] = useState(false);
  const [addedComponents, setAddedComponents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const getProductOptions = async (search) => {
    // let link = "/backend/getComponentByNameAndNo";

    // setSelectLoading(true);
    // const { data } = await imsAxios.post(link, {
    //   search: search,
    // });
    // setSelectLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const fetchReportName = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/report25/fetchR25ReportName", {
      search: search,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => ({
        text: row.report_name,
        value: row.report_id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const getRows = async () => {
    try {
      const values = await filterForm.validateFields();
      setLoading("fetch");
      const response = await imsAxios.post("/report25", {
        // skucode: values.sku,
        report_id: values.report?.value,
        product_fg_qty: values?.qty,
      });
      const { data } = response;
      if (data.code === 200) {
        let arr = data.data;
        arr = arr.map((row, index) => ({
          id: index + 1,
          component: row.components,
          partCode: row.partno,
          currentStock: row.currentStock,
          requiredStock: row.reqStock,
          unit: row.uom,
          bomQty: row.bomqty,
          sfStock: row.sf_qty,
          pprQty: row.ppr_qty,
          poTransitQty: row.po_intransit,
          orderQty: row.new_order_qty,
          freeQty: row.free_qty,
        }));
        setRows(arr);
      }
    } catch (error) {
      console.log("some error occured while fetching report", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadHandler = () => {
    const newRow = {
      id: " ",
      component: " ",
      partCode: " ",
      unit: " ",
      bomQty: "",
      requiredStock: "B",
      currentStock: "C",
      sfStock: "D",
      pprQty: "A",
      poTransitQty: "E",
      freeQty: "(G=(C+D+E-A))",
      orderQty: "(F=(B-G))",
    };
    console.log(rows);

    downloadCSV(rows, columns, `R25 Report`, [newRow]);
  };
  const reset = () => {
    filterForm.resetFields();
  };
  const toggleEdit = () => {
    const values = filterForm.getFieldsValue();
    setIsEditing(values.report.value);
    getReportDetails(values.report.value);
  };
  const cancelEditing = () => {
    setIsEditing(false);
    setAddedComponents([]);
    reportForm.setFieldValue("name", "");
  };
  const addToComponentList = async () => {
    const values = await reportForm.validateFields(["component", "qty"]);
    let arr = addedComponents;
    arr = [
      ...arr,
      {
        id: arr.length + 1,
        component: values.component.label,
        componentKey: values.component.value,
        qty: values.qty,
      },
    ];

    reportForm.setFieldValue("component", null);
    reportForm.setFieldValue("qty", "");
    setAddedComponents(arr);
  };
  const deleteAddedComponent = (id) => {
    let arr = addedComponents;
    arr = arr.filter((row) => row.id != id);
    setAddedComponents(arr);
  };
  const getReportDetails = async (reportId) => {
    setLoading("fetchDetails");
    const response = await imsAxios.post("/report25/editR25Report", {
      report_id: reportId,
    });
    setLoading(false);

    let obj = {};
    let components = [];
    let arr = [];
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        obj = {
          name: data.data.report.label,
          id: data.data.report.value,
        };
        arr = data.data.parts.map((row, index) => ({
          component: row.text,
          componentKey: row.id,
          id: row.id,
          qty: data.data.qty[index],
        }));
      } else {
        obj = {};
        arr = [];
      }
    }
    reportForm.setFieldsValue(obj);
    setAddedComponents(arr);
  };

  const submitHandler = async (payload) => {
    const url = isEditing
      ? "/report25/updateR25Report"
      : "/report25/createR25Report";
    setLoading("submit");
    const response = await imsAxios.post(url, payload);
    setLoading(false);
    const { data } = response;
    if (response.status === 200) {
      toast.success(data.message.msg);
      setAddedComponents([]);
      reportForm.setFieldValue("component", null);
      reportForm.setFieldValue("qty", "");
      reportForm.setFieldValue("name", "");
      setIsEditing(false);
    }
  };
  const validataData = async () => {
    const values = await reportForm.validateFields(["name"]);
    console.log(values);

    let payload = {
      report_name: values.name,
      report_id: isEditing,
      parts: addedComponents.map((row) => row.componentKey),
      qty: addedComponents.map((row) => row.qty),
    };

    Modal.confirm({
      title: "Are you sure you want to submit this Report",
      content: "",
      onOk() {
        submitHandler(payload);
      },
    });
  };

  return (
    <Row gutter={6} style={{ height: "90%", padding: 10, paddingTop: 0 }}>
      <Col span={5} style={{ height: "100%", overflow: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small" title="Filters">
              <Form form={filterForm} layout="vertical">
                <Form.Item label="Report" name="report">
                  <MyAsyncSelect
                    onBlur={() => setAsyncOptions([])}
                    labelInValue
                    loadOptions={fetchReportName}
                    optionsState={asyncOptions}
                    selectLoading={selectLoading}
                    placeholder="Enter Report"
                  />
                </Form.Item>
                <Form.Item label="Planning Qty" name="qty">
                  <Input placeholder="Enter Qty" />
                </Form.Item>
                <Row justify="end">
                  <Space>
                    <CommonIcons
                      action="downloadButton"
                      onClick={downloadHandler}
                      disabled={rows.length === 0}
                    />
                    <CommonIcons
                      loading={loading === "fetchDetails"}
                      action="editButton"
                      disabled={rows.length === 0}
                      onClick={toggleEdit}
                    />
                    <MyButton variant="search" onClick={getRows} type="primary">
                      Fetch
                    </MyButton>
                  </Space>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col span={24}>
            <Card
              size="small"
              title={`${isEditing ? "Edit" : "Add New"} Report`}
              extra={
                <Space>
                  {isEditing && <Button onClick={cancelEditing}>Cancel</Button>}
                  <Button
                    loading={loading === "submit"}
                    type="primary"
                    onClick={validataData}
                  >
                    Save Report
                  </Button>
                </Space>
              }
            >
              <Form
                initialValues={{
                  name: "",
                  component: null,
                  qty: "",
                }}
                form={reportForm}
                layout="vertical"
              >
                {loading === "fetchDetails" && <Loading />}
                <Form.Item
                  rules={addReportRules.name}
                  label="Report Name"
                  name="name"
                >
                  <Input />
                </Form.Item>
                <Row justify="space-between" aign="middle" gutter={6}>
                  <Typography.Text strong>Add Component</Typography.Text>
                  <Button onClick={addToComponentList}>+ Add</Button>
                </Row>
                <Row gutter={6}>
                  <Col span={18}>
                    <Form.Item
                      label="Component"
                      rules={addReportRules.component}
                      name="component"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        labelInValue
                        loadOptions={getProductOptions}
                        optionsState={asyncOptions}
                        selectLoading={loading1("select")}
                        // placeholder="Enter Report"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="BOM Qty"
                      name="qty"
                      rules={addReportRules.qty}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Input
                    placeholder="Filter"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <Col span={24}>
                    <Row gutter={6} justify="space-between">
                      <Col span={1}>
                        <Typography.Text strong>#</Typography.Text>
                      </Col>
                      <Col span={18}>
                        <Typography.Text strong>Component</Typography.Text>
                      </Col>
                      <Col span={4}>
                        <Typography.Text strong>Qty</Typography.Text>
                      </Col>
                      <Col span={1}></Col>
                    </Row>
                  </Col>
                  {addedComponents
                    .filter((row) =>
                      row.component
                        .toString()
                        .toLowerCase()
                        .includes(filterText.toLowerCase())
                    )
                    .map((row, index) => (
                      <Col span={24}>
                        <Row gutter={6} justify="space-between">
                          <Col span={1}>{index + 1}</Col>
                          <Col span={18}>
                            <Typography.Text>{row.component}</Typography.Text>
                          </Col>
                          <Col span={4}>
                            <Typography.Text>{row.qty}</Typography.Text>
                          </Col>
                          <Col span={1}>
                            <CommonIcons
                              loading={loading === row.value}
                              onClick={() => deleteAddedComponent(row.id)}
                              action="deleteButton"
                            />
                          </Col>
                        </Row>
                      </Col>
                    ))}
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={19}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
      </Col>
    </Row>
  );
};

export default R25;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },

  {
    headerName: "Component",
    minWidth: 200,
    flex: 1,
    field: "component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Part Code",
    width: 150,
    field: "partCode",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partCode} copy={true} />
    ),
  },
  {
    headerName: "UoM",
    width: 80,
    field: "unit",
  },
  {
    headerName: "BOM Qty",
    width: 100,
    field: "bomQty",
  },
  {
    headerName: "PPR Qty",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        PPR Qty <br /> (A)
      </Typography.Text>
    ),

    width: 140,
    field: "pprQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.pprQty} />,
  },

  {
    headerName: "Required Stock",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        Required Stock <br /> (B)
      </Typography.Text>
    ),

    width: 140,
    field: "requiredStock",
    renderCell: ({ row }) => <ToolTipEllipses text={row.requiredStock} />,
  },
  {
    headerName: "Current Stock",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        Current Stock <br /> (C)
      </Typography.Text>
    ),
    width: 140,
    field: "currentStock",
    renderCell: ({ row }) => <ToolTipEllipses text={row.currentStock} />,
  },
  {
    headerName: "SF Stock",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        SF Stock <br /> (D)
      </Typography.Text>
    ),
    headerAlign: "center",
    width: 140,
    field: "sfStock",
    renderCell: ({ row }) => <ToolTipEllipses text={row.sfStock} />,
  },
  {
    headerName: "PO Qty(Transit)",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        PO Qty(Transit) <br /> (E)
      </Typography.Text>
    ),

    width: 140,
    field: "poTransitQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.poTransitQty} />,
  },
  {
    headerName: "Free Qty",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        Free Qty <br /> (G=(C+D+E-A))
      </Typography.Text>
    ),

    width: 140,
    field: "freeQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.freeQty} />,
  },
  {
    headerName: "PO Qty(New)",
    renderHeader: () => (
      <Typography.Text
        style={{
          fontSize: 12,

          width: "100%",
          display: "block",
          textAlign: "center",
        }}
      >
        PO Qty(New) <br /> (F=(B-G))
      </Typography.Text>
    ),

    width: 140,
    field: "orderQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.orderQty} />,
  },
];

const addReportRules = {
  name: [{ required: true, message: "Please Enter Report Name" }],
  component: [{ required: true, message: "Please Enter Component" }],
  qty: [{ required: true, message: "Please Enter Qty" }],
};
