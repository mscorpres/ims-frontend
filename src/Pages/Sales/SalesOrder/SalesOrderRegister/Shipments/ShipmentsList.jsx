import { useEffect, useState } from "react";
import MyDatePicker from "../../../../../Components/MyDatePicker";
import { Col, Form, Input, Modal, Row, Space, Card } from "antd";
import useApi from "../../../../../hooks/useApi.ts";
import {
  cancelChallanFromSo,
  createChallanFromSo,
  listOfShipment,
} from "../../../../../api/sales/salesOrder";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import { GridActionsCellItem } from "@mui/x-data-grid";
import CreateShipment from "../CreateShipment/CreateShipment";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import ShipmentDetails from "./ShipmentDetails";
import { downloadCSV } from "../../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import { toast } from "react-toastify";
import MySelect from "../../../../../Components/MySelect";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import { getClientsOptions } from "../../../../../api/finance/clients";
import MyButton from "../../../../../Components/MyButton";
import CustomFieldBox from "../../../../../new/components/reuseable/CustomFieldBox.jsx";
import { Add, Search } from "@mui/icons-material";
import CustomButton from "../../../../../new/components/reuseable/CustomButton.jsx";
import EmptyRowsFallback from "../../../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";

const initialValues = {
  data: "",
  wise: "clientwise",
};

const wiseOptions = [
  { text: "Date Wise", value: "datewise" },
  { text: "Client Wise", value: "clientwise" },
  { text: "SO ID Wise", value: "so_id_wise" },
];

const rules = {
  data: [
    {
      required: true,
      message: "This field is required",
    },
  ],
  wise: [
    {
      required: true,
      message: "This field is required",
    },
  ],
};

function ShipmentsList() {
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [updateShipmentRow, setUpdateShipmentRow] = useState("");
  const [selectedPo, setSelectedPo] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showDetails, setShowDetails] = useState(null);
  const [createRemark, setCreateRemark] = useState("");
  const { executeFun, loading } = useApi();
  const [ModalForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const wise = Form.useWatch("wise", filterForm);

  const getRows = async () => {
    const values = await filterForm.validateFields();
    setRows([]);
    const response = await executeFun(
      () => listOfShipment(values.data, values.wise),
      "fetch"
    );
    const { data } = response;
    if (response.success) {
      if (data.length > 0) {
        let arr = data.map((row, index) => ({
          ...row,
          id: index + 1,
          billingId: row.billing_id,
          billingAddress: row.billingaddress,
          client: row.client,
          clientAddressId: row.client_add_id,
          clientCode: row.client_code,
          clientAddress: row.clientaddress,
          challanStatus: row.del_challan_status,
          date: row.shipment_dt,
          shipmentId: row.shipment_id,
          status: row.shipment_status === "A" ? "Active" : "Close",
          shippingId: row.shipping_id,
          shippingAddress: row.shippingaddress,
          orderId: row.so_id,
        }));
        setRows(arr);
      } else {
        toast.error(data.message);
      }
    }
  };
  const sendUpdate = (row) => {
    setUpdateShipmentRow(row);
  };

  const createChallan = async (singleRow) => {
    Modal.confirm({
      title: "Are you sure you want to create this Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm} layout="vertical">
          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={3} placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await createShipmentChallan(singleRow);
      },
    });
  };

  const cancelShipment = async (singleRow) => {
    Modal.confirm({
      title: "Are you sure you want to cancel this Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm} layout="vertical">
          <Form.Item
            name="remark"
            label="Remark"
            rules={[
              {
                required: true,
                message: "This field is required",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await confirmCancelShipment(singleRow);
      },
    });
  };
  const confirmCancelShipment = async (singleRow) => {
    const values = await ModalForm.validateFields();

    let remark = values.remark;
    console.log("remark", remark);
    const response = await executeFun(
      () => cancelChallanFromSo(singleRow, remark),
      "select"
    );
    if (response.success) {
      // setCreateRemark("");
      ModalForm.setFieldValue("remark", "");
      getRows();
    }
  };
  const createShipmentChallan = async (singleRow) => {
    let mins = [];
    if (singleRow) {
      mins = [singleRow].map((row) => rows.filter((r) => r.id === row.id)[0]);
    } else if (singleRow === undefined) {
      mins = selectedRows.map((row) => rows.filter((r) => r.id === row)[0]);
    }
    const values = await ModalForm.validateFields();
    let remark = values.remark;

    const response = await executeFun(
      () => createChallanFromSo(mins, remark),
      "select"
    );

    if (response.success) {
      setCreateRemark("");
      ModalForm.setFieldValue("remark", "");
      getRows();
    }
  };

  const handleExcelDownload = () => {
    downloadCSV(rows, columns, "SO Shipments Report");
  };

  const handleFetchClientOptions = async (search) => {
    const response = await executeFun(
      () => getClientsOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data.data, "name", "code");
    }
    setAsyncOptions(arr);
  };

  useEffect(() => {
    if (wise === "so_id_wise" || wise === "clientwise") {
      filterForm.setFieldValue("data", "");
    }
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
    enableRowSelection: true,

    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 190px)"
          : "calc(100vh - 240px)",
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

    renderRowActionMenuItems: ({ row, table, closeMenu }) =>
      row.del_challan_status === "Y"
        ? [
            <MRT_ActionMenuItem
              key="update"
              label="Update"
              onClick={() => {
                sendUpdate(row);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              key="view"
              label="View"
              onClick={() => {
                setShowDetails(row);
              }}
              table={table}
            />,

            <MRT_ActionMenuItem
              icon={<Cancel />}
              key="cancel"
              label="Cancel Shipment"
              onClick={() => {
                cancelShipment(row);
              }}
              table={table}
            />,
          ]
        : [
            <MRT_ActionMenuItem
              key="update"
              label="Update"
              onClick={() => {
                sendUpdate(row);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              key="create"
              label="Create Challan"
              onClick={() => {
                createChallan(row);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              key="view"
              label="View"
              onClick={() => {
                setShowDetails(row);
              }}
              table={table}
            />,

            <MRT_ActionMenuItem
              icon={<Cancel />}
              key="cancel"
              label="Cancel Shipment"
              onClick={() => {
                cancelShipment(row);
              }}
              table={table}
            />,
          ],
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  useEffect(() => {
    const selectedRows = table
      .getSelectedRowModel()
      .flatRows.map((r) => r.original);
    setSelectedPo(selectedRows);
  }, [rowSelection, table]);

  return (
    <Row gutter={6} style={{ height: "95%", padding: 12 }}>
      <Col span={6}>
        <CustomFieldBox title={"Filters"}>
          <Form
            form={filterForm}
            layout="vertical"
            initialValues={initialValues}
          >
            <Form.Item name="wise" label="Filter Wise" rules={rules.wise}>
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item
              name="data"
              rules={rules.data}
              label={
                wise === "datewise"
                  ? "Period"
                  : wise === "clientwise"
                  ? "Client"
                  : "Sales Order ID Wise"
              }
            >
              {wise === "datewise" && (
                <MyDatePicker
                  setDateRange={(value) =>
                    filterForm.setFieldValue("data", value)
                  }
                />
              )}
              {wise === "so_id_wise" && <Input />}
              {wise === "clientwise" && (
                <MyAsyncSelect
                  optionsState={asyncOptions}
                  loadOptions={handleFetchClientOptions}
                  onBlur={() => setAsyncOptions([])}
                  selectLoading={loading("select")}
                />
              )}
            </Form.Item>
          </Form>
          <Row gutter={[6, 6]} justify="end">
            <Col>
              <Space>
                <CommonIcons
                  action="downloadButton"
                  onClick={handleExcelDownload}
                />

                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={getRows}
                />
              </Space>
            </Col>
            {wise === "clientwise" && (
              <Col>
                <Space>
                  <CustomButton
                    size="small"
                    title={"Create Shipment"}
                    variant="outlined"
                    starticon={<Add fontSize="small" />}
                    onclick={() => createChallan()}
                  />
                </Space>
              </Col>
            )}
          </Row>
        </CustomFieldBox>
      </Col>
      <Col span={18}>
       
        <MaterialReactTable table={table} />
      </Col>
      <CreateShipment
        open={updateShipmentRow?.shipment_id}
        setUpdateShipmentRow={setUpdateShipmentRow}
        updateShipmentRow={updateShipmentRow}
        hide={() => setUpdateShipmentRow(null)}
      />
      <ShipmentDetails open={showDetails} hide={() => setShowDetails(null)} />
    </Row>
  );
}

export default ShipmentsList;
const columns = [
  {
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Shipment Id",
    size: 150,
    accessorKey: "shipmentId",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.shipmentId} copy={true} />
    ),
  },
  {
    header: "Shipment Date",
    size: 150,
    accessorKey: "date",
  },
  {
    header: "SO ID",
    // minsize: 120,
    size: 130,
    accessorKey: "orderId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.orderId} copy={true} />,
  },

  {
    header: "Client Code",
    size: 120,
    accessorKey: "clientCode",
    renderCell: ({ row }) => <ToolTipEllipses text={row.clientCode} />,
  },
  {
    header: "Client",
    size: 150,
    accessorKey: "client",
    renderCell: ({ row }) => <ToolTipEllipses text={row.client} />,
  },

  {
    header: "Client Address",
    size: 200,
    accessorKey: "clientAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.clientAddress} />,
  },
  {
    header: "Billing Id",
    size: 120,
    accessorKey: "billingId",
  },
  {
    header: "Billing Address",
    size: 200,
    accessorKey: "billingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingAddress} />,
  },

  {
    header: "Shipping Id",
    size: 150,
    accessorKey: "shippingId",
  },
  {
    header: "Shipping Address",
    size: 200,
    accessorKey: "shippingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
  },
  {
    header: "Challan Created",
    size: 100,
    accessorKey: "challanStatus",
  },
  {
    header: "Status",
    size: 80,
    accessorKey: "status",
  },
];
