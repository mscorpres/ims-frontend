import { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import UpdateSellStatus from "./UpdateSellStatus";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { Drawer, Form, Input, Modal, Row, Space } from "antd/es";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Button, Col, Select } from "antd";
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
import MyButton from "../../../../Components/MyButton";
import dayjs from "dayjs";
import { getStringDate } from "../../../../utils/general.ts";
function SalesORderRegister() {
  // const [loading, setLoading] = useState(false);
  const [componentList, setComponentList] = useState(false);
  const [showShipmentDrawer, setShowShipmentDrawer] = useState(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [modalVals, setModalVals] = useState([]);
  const [wise, setWise] = useState("DATE");
  const [searchTerm, setSearchTerm] = useState(
    `${dayjs().startOf("month").format("DD-MM-YYYY")}-${dayjs().format(
      "DD-MM-YYYY"
    )}`
  );
  const [cancelRowSelected, setCancelRowSelected] = useState([]);
  const [openShipmentList, setOpenShipmentList] = useState("false");
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const navigate = useNavigate();

  const handleFetchRows = async () => {
    console.log("this is the search term", searchTerm);
    const response = await executeFun(
      () => getSalesOrders(wise, searchTerm),
      "fetch"
    );
    let arr = [];
    let { data } = response;
    // console.log("data", data);
    if (response.success) {
      arr = data.map((row, index) => ({
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
        status: row.status,
      }));
    }

    setRows(arr);

    // setLoading(true);
    // const response = await imsAxios.post("/sellRequest/fetchSellRequestList", {
    //   wise: wise,
    //   data: searchTerm,
    // });
    // const { data } = response;
    // if (data.code === 200) {
    //   let arr = data.message;
    //   arr = arr.map((row, index) => ({
    //     id: index + 1,
    //     ...row,
    //   }));
    //   setRows(arr);
    // }
    // setLoading(false);
    // // setOpen(true);
  };
  const cancelTheSelected = async (values) => {
    // const response = await imsAxios.post("/sellRequest/CancelSO", {
    //   so: values.so,
    //   remark: values.remarks,
    // });
    // const { data } = response;
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
    let arr = response.message;
    if (response.success) {
      arr = arr.map((row, index) => ({
        id: index + 1,
        ...row,
      }));
      loading(false);
    }
    setComponentList(arr);
  };
  // const getShipment = async (row) => {
  //   const response = await imsAxios.post(
  //     "/sellRequest/fetchSellRequestDetails",
  //     {
  //       req_id: row.salesId,
  //     }
  //   );
  //   const { data } = response;
  //   let arr = data.message;
  //   if (data.code === 200) {
  //     arr = arr.map((row, index) => ({
  //       id: index + 1,
  //       ...row,
  //     }));
  //     loading(false);
  //   }
  //   setShipmentList(arr);
  // };
  const handlePrintOrder = async (orderId) => {
    const response = await executeFun(() => printOrder(orderId), "print");
    if (response.success) {
      printFunction(response.data.buffer.data, response.data.filename);
    }
  };

  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          navigate(`/sales/order/${row.salesId.replaceAll("/", "_")}/edit`);
        }}
        label="Update"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => setCancelRowSelected(row)}
        label="Cancel"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          // setOpen(true);
          getComponentsList(row);
        }}
        label="Components list"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          // setOpen(true);
          setShowShipmentDrawer(row.salesId);
        }}
        label="Create Shipment"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          // setOpen(true);
          handlePrintOrder(row.salesId);
        }}
        label="Print"
      />,
    ],
  };
  const columnsdrawer = [
    {
      headerName: "Item Name",
      flex: 1,
      field: "item_name",
    },
    {
      headerName: "Code",
      // minWidth: 120,
      flex: 1,
      field: "item_code",
      renderCell: ({ row }) => <ToolTipEllipses text={row.item_code} />,
    },
    {
      headerName: "Pending Qty",
      flex: 1,
      field: "pending_qty",
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
  const getShipmentList = () => {
    navigate("/sales/order/shipments");
  };
  useEffect(() => {
    if (wise !== "DATE") {
      // const arr = [dayjs().startOf("month"), dayjs()]
      setSearchTerm(``);
    } else {
      setSearchTerm(getStringDate("month"));
    }
  }, [wise]);
  useEffect(() => {
    if (!cancelRowSelected) {
      form.resetFields();
    }
  }, [cancelRowSelected]);

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
      <div style={{ height: "90%", padding: 5 }}>
        <Row justify="space-between" style={{ marginBottom: 5 }}>
          <Col span={24}>
            <Row justify="space-between" style={{}}>
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
                    {wise == "DATE" && searchTerm !== "" && (
                      <MyDatePicker
                        setDateRange={setSearchTerm}
                        value={searchTerm}
                      />
                    )}
                    {wise === "SONO" && (
                      <Input
                        placeholder="Invoice Number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    )}
                  </Col>
                  {/* <Space> */}
                  <div>
                    <MyButton
                      variant="search"
                      disabled={!setSearchTerm}
                      type="primary"
                      loading={loading("fetch")}
                      onClick={handleFetchRows}
                    >
                      Search
                    </MyButton>
                  </div>
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
          bodyStyle={{ overflow: "hidden" }}
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
        {/* <Drawer
          onClose={() => setShipmentList(false)}
          open={shipmentList}
          width="100vw"
          bodyStyle={{ overflow: "hidden", padding: 0 }}
          className="message-modal"
          // closable={false}
          destroyOnClose={true}
          title={`Component List `}
        >
          {/* <MyDataTable
            loading={loading("fetch")}
            columns={columnsdrawer}
            data={componentList}
          /> */}
        {/* </Drawer> */}
        <CreateShipment
          open={showShipmentDrawer}
          hide={() => setShowShipmentDrawer(null)}
        />
        {/* <Row style={{ padding: 5, paddingTop: 0 }}></Row> */}
        <div style={{ height: "100%" }}>
          <MyDataTable
            loading={loading("fetch") || loading("print")}
            columns={[actionColumn, ...columns]}
            data={rows}
          />
        </div>
      </div>
    </>
  );
}

export default SalesORderRegister;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },

  {
    headerName: "Sale Request ID",
    minWidth: 150,
    flex: 1,
    field: "salesId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.salesId} copy={true} />,
  },
  {
    headerName: "Sale  Customer",
    minWidth: 150,
    field: "customer",
    flex: 1,
  },
  // {
  //   headerName: "Sale Project Id",
  //   width: 150,
  //   field: "project",
  // },
  {
    headerName: "Sale Cost Center",
    width: 150,
    field: "costCenter",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.sell_cost_center} copy={true} />
    ),
  },
  {
    headerName: "Sale Delivery Term",
    width: 150,
    field: "deliveryTerm",
  },
  {
    headerName: "Sale Payment Term",
    width: 100,
    field: "paymentTerm",
  },
  {
    headerName: "Order type",
    width: 100,
    field: "type",
  },
  {
    headerName: "Status",
    width: 100,
    field: "status",
  },

  {
    headerName: "Create By",
    width: 150,
    field: "createdBy",
  },
  {
    headerName: "Create By",
    width: 150,
    field: "createdDate",
  },
];
