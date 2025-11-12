import { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import UpdateSellStatus from "./UpdateSellStatus";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { Drawer, Form, Input, Modal, Row, Space } from "antd/es";
import MyDataTable from "../../../../Components/MyDataTable";
import { Col} from "antd";
import MySelect from "../../../../Components/MySelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import useApi from "../../../../hooks/useApi.ts";
import {
  cancelTheSelectedSo,
  getSalesOrders,
  printOrder,
} from "../../../../api/sales/salesOrder";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import printFunction from "../../../../Components/printFunction";
import CreateShipment from "./CreateShipment/CreateShipment";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";
function SalesORderRegister() {
  // const [loading, setLoading] = useState(false);
  const [componentList, setComponentList] = useState(false);
  const [showShipmentDrawer, setShowShipmentDrawer] = useState(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [modalVals, setModalVals] = useState([]);
  const [wise, setWise] = useState("DATE");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelRowSelected, setCancelRowSelected] = useState([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const navigate = useNavigate();

  const handleFetchRows = async () => {
    const response = await executeFun(
      () => getSalesOrders(wise, searchTerm),
      "fetch"
    );
    let arr = [];

    if (response.success) {
      arr = response.data.data.map((row, index) => ({
        id: index + 1,
        constCenter: row.cost_center,
        createdBy: row.create_by,
        createdDate: row.create_dt,
        customer: row.customer,
        deliveryTerm: row.delivery_term,
        paymentTerm: row.payment_term,
        project: row.project_id,
        salesId: row.req_id,
        type: row.type,
      }));
    }

    setRows(arr);
  };
  const cancelTheSelected = async (values) => {
    const response = await executeFun(
      () => cancelTheSelectedSo(values),
      "fetch"
    );
    if (response.code === 200) {
      toast.success(response.message);
      setCancelRowSelected(false);
      form.resetFields();
    } else {
      toast.error(response.data);
    }
  };
  const validate = async () => {
    const values = await form.validateFields();
    cancelTheSelected(values);
  };
  const getComponentsList = async (row) => {
    const response = await imsAxios.post(
      "/sellRequest/fetchSellRequestDetails",
      {
        req_id: row.salesId,
      }
    );
    const { data } = response;
    let arr = data.message;
    if (data.code === 200) {
      arr = arr.map((row, index) => ({
        id: index + 1,
        ...row,
      }));
      loading(false);
    }
    setComponentList(arr);
  };

  const handlePrintOrder = async (orderId) => {
    const response = await executeFun(() => printOrder(orderId), "print");
    if (response.success) {
      printFunction(
        response.data.data.buffer.data,
        response.data.data.filename
      );
    }
  };

 
  const columnsdrawer = [
    {
      headerName: "Item Name",
      flex: 1,
      field: "item_name",
    },
    {
      headerName: "Code",
      flex: 1,
      field: "item_code",
      renderCell: ({ row }) => <ToolTipEllipses text={row.item_code} />,
    },
    {
      headerName: "Qty",
      flex: 1,
      field: "qty",
    },

    {
      headerName: "GST Rate",
      flex: 1,
      field: "gst_rate",
    },
    {
      headerName: "Price",
      flex: 1,
      field: "price",
      renderCell: ({ row }) => <ToolTipEllipses text={row.price} />,
    },

    {
      headerName: "HSN SAC",
      flex: 1,
      field: "hsn_sac",
    },

    {
      headerName: "Remark",
      flex: 1,
      field: "remark",
    },
  ];
  const options = [
    { text: "Date Wise", value: "DATE" },
    { text: "SO(s) Wise", value: "SONO" },
  ];
  useEffect(() => {
    setSearchTerm("");
  }, [wise]);
  useEffect(() => {
    if (!cancelRowSelected) {
      form.resetFields();
    }
  }, [cancelRowSelected]);

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
    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 240px)"
          : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Sales Orders Found" />
    ),

    renderTopToolbar: () =>
      loading("fetch") || loading("print") ? (
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        key="update"
        label="Update"
        onClick={() => {
          navigate(`/sales/order/${row.salesId.replaceAll("/", "_")}/edit`);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="shipment"
        label="Create Shipment"
        onClick={() => {
          setShowShipmentDrawer(row.salesId);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="list"
        label="Components list"
        onClick={() => {
          getComponentsList(row);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="print"
        label="Print"
        onClick={() => {
          handlePrintOrder(row.salesId);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="cancel"
        label="Cancel"
        onClick={() => setCancelRowSelected(row)}
        table={table}
      />,
    ],
  });

  return (
    <>
      <Modal
        title={`Are you sure you want to cancel this SO ${cancelRowSelected?.salesId}`}
        open={cancelRowSelected?.salesId}
        width={400}
        onCancel={() => setCancelRowSelected(false)}
        onOk={() => validate()}
      >
        <>
          <Form
            form={form}
            style={{ width: "100%" }}
            layout="vertical"
            initialValues={{
              remarks: "",
            }}
          >
            <Form.Item
              label="SO Id"
              name="so"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input value={cancelRowSelected?.req_id} />
            </Form.Item>
            <Form.Item
              label="Remarks"
              name="remarks"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </>
      </Modal>
      <div style={{ height: "calc(100vh - 140px)", margin: 12 }}>
        <Row justify="space-between" style={{ paddingBottom: 5 }}>
          <Col span={24}>
            <Row justify="space-between" style={{ paddingBottom: 5 }}>
              <Col>
                <Space>
                  <div style={{ width: 250 }}>
                    <MySelect
                      options={options}
                      value={wise}
                      onChange={setWise}
                    />
                  </div>
                  <Col>
                    {wise == "DATE" && (
                      <MyDatePicker setDateRange={setSearchTerm} />
                    )}
                    {wise === "SONO" && (
                      <Input
                        placeholder="Invoice Number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    )}
                  </Col>
                  <Space>
                    <CustomButton
                      size="small"
                      title={"Search"}
                      starticon={<Search fontSize="small" />}
                      loading={loading("fetch")}
                      disabled={!setSearchTerm}
                      onclick={handleFetchRows}
                    />
                  </Space>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
        {open && (
          <UpdateSellStatus
            setOpen={setOpen}
            open={open}
            modalVals={modalVals}
            setModalVals={setModalVals}
          />
        )}
        <Drawer
          onClose={() => setComponentList(false)}
          open={componentList}
          width="100vw"
          bodyStyle={{ overflow: "hidden", padding: 0 }}
          className="message-modal"
          // closable={false}
          destroyOnClose={true}
          title={`Component List `}
        >
          <MyDataTable
            loading={loading("fetch")}
            columns={columnsdrawer}
            data={componentList}
          />
        </Drawer>
        <CreateShipment
          open={showShipmentDrawer}
          hide={() => setShowShipmentDrawer(null)}
        />

        <div style={{ height: "95%" }}>
          <MaterialReactTable table={table} />
        </div>
      </div>
    </>
  );
}

export default SalesORderRegister;

const columns = [
  {
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Order type",
    size: 100,
    accessorKey: "type",
  },
  {
    header: "Sale Request ID",
    size: 150,

    accessorKey: "salesId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.salesId} copy={true} />,
  },
  {
    header: "Sale  Customer",
    size: 150,
    accessorKey: "customer",
  },
  {
    header: "Sale Project Id",
    size: 150,
    accessorKey: "project",
  },
  {
    header: "Sale Cost Center",
    size: 150,
    accessorKey: "costCenter",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.sell_cost_center} copy={true} />
    ),
  },
  {
    header: "Sale Delivery Term",
    size: 150,
    accessorKey: "deliveryTerm",
  },
  {
    header: "Sale Payment Term",
    size: 100,
    accessorKey: "paymentTerm",
  },

  {
    header: "Create By",
    size: 150,
    accessorKey: "createdBy",
  },
  {
    header: "Create By",
    size: 150,
    accessorKey: "createdDate",
  },
];
