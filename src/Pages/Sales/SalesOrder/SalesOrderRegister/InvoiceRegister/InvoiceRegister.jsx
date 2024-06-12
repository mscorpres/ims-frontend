import { useEffect, useState } from "react";
import { imsAxios } from "../../../../../axiosInterceptor.tsx";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses.jsx";
import { Drawer, Form, Input, Modal, Row, Space } from "antd/es";
import MyDataTable from "../../../../../Components/MyDataTable.jsx";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Button, Col, Select } from "antd";
import MySelect from "../../../../../Components/MySelect.jsx";
import MyDatePicker from "../../../../../Components/MyDatePicker.jsx";
import useApi from "../../../../../hooks/useApi.ts";
// import {
//   cancelTheSelectedSo,
//   getSalesOrders,
//   printOrder}
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import printFunction from "../../../../../Components/printFunction.jsx";

import MyButton from "../../../../../Components/MyButton/index.jsx";
import dayjs from "dayjs";
import {
  convertSelectOptions,
  getStringDate,
} from "../../../../../utils/general.ts";
import {
  cancelTheSelectedSo,
  canceleInv,
  canceleway,
  fetchEInv,
  fetchEwayBill,
  getSalesOrders,
  printEwayBill,
  printOrder,
  printOrderForChallan,
} from "../../../../../api/sales/salesOrder.js";
import { getClientsOptions } from "../../../../../api/finance/clients.js";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect.jsx";
function InvoiceRegister() {
  // const [loading, setLoading] = useState(false);
  const [componentList, setComponentList] = useState(false);
  const [showShipmentDrawer, setShowShipmentDrawer] = useState(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [modalVals, setModalVals] = useState([]);
  const [wise, setWise] = useState("date");
  const [type, setType] = useState("eInvoice");
  const [searchTerm, setSearchTerm] = useState(
    `${dayjs().startOf("month").format("DD-MM-YYYY")}-${dayjs().format(
      "DD-MM-YYYY"
    )}`
  );
  const [cancelRowSelected, setCancelRowSelected] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [openShipmentList, setOpenShipmentList] = useState("false");
  const [form] = Form.useForm();
  const selectedType = Form.useWatch("type", form);

  const { executeFun, loading } = useApi();
  const options = [
    { text: "E-Invoice", value: "eInvoice" },
    { text: "E-way Bill", value: "eway" },
  ];
  const wiseOptionsEway = [
    { text: "Date", value: "date" },
    { text: "Invoice Number", value: "invoice" },
  ];
  const wiseOptions = [
    { text: "Date", value: "date" },
    { text: "Client", value: "client" },
    { text: "Invoice Number", value: "invoice" },
  ];
  const getData = () => {
    if (type == "eway") {
      getEwayBillData();
    } else {
      getEinvData();
    }
  };

  const getEwayBillData = async () => {
    console.log("this is the search term", searchTerm);
    const response = await executeFun(
      () => fetchEwayBill(wise, searchTerm),
      "fetch"
    );
    let arr = [];
    let { data } = response;
    console.log("response", response);
    if (response.success) {
      arr = data.map((row, index) => ({
        id: index + 1,
        invoiceDate: row.invoice_date,
        challanId: row.challanId,
        supplyType: row.supply_type,
        subSupplyType: row.sub_supply_type,
        doctype: row.document_type,
        transType: row.transaction_type,
        dFromName: row.dispatchfrom_name,
        dFromAdd: row.dispatchfrom_address,
        dFromgst: row.dispatchfrom_gstin,
        dFromplace: row.dispatchfrom_place,
        dFromState: row.dispatchfrom_state,
        dFrompin: row.dispatchfrom_pincode,
        sFromName: row.shipto_name,
        sFromGST: row.shipto_gstin,
        sFromPlace: row.shipto_place,
        sFromState: row.shipto_state,
        sFrompin: row.shipto_pincode,
        transportId: row.transporter_id,
        trnasName: row.transporter_name,
        transDocDate: row.trans_doc_no,
        docDate: row.trans_doc_date,
        vehicle: row.vehicle_no,
        transMode: row.trans_mode,
        eBillnum: row.eway_bill_no,
        generatedDate: row.generated_dt,
        ewatStatus: row.ewaybill_status,
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
  const getEinvData = async () => {
    console.log("this is the search term", searchTerm);
    const response = await executeFun(
      () => fetchEInv(wise, searchTerm),
      "fetch"
    );
    let arr = [];
    let { data } = response;
    console.log("response", response);
    if (response.success) {
      arr = data.map((row, index) => ({
        id: index + 1,
        deliveryChallanDate: row.delivery_challan_dt,
        challanId: row.so_challan_id,
        client: row.client,
        clientCode: row.client_code,
        clientAddress: row.clientaddress,
        billingaddress: row.billingaddress,
        shippingAddress: row.shippingaddress,
        invoiceno: row.invoiceNo,
        invoicedate: row.invoiceDate,
        irnNo: row.irnno,
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
  const handleFetchClientOptions = async (search) => {
    const response = await executeFun(
      () => getClientsOptions(search),
      "clientSelect"
    );
    if (response.success) {
      const arr = convertSelectOptions(response.data.data, "name", "code");
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const cancelTheSelected = async (values) => {
    let response;
    let payload;
    // const response = await imsAxios.post("/sellRequest/CancelSO", {
    //   so: values.so,
    //   remark: values.remarks,
    // });
    // const { data } = response;

    // return;
    if (type == "eway") {
      console.log("cancelRowSelected", cancelRowSelected);
      payload = { ewayBillNo: cancelRowSelected?.eBillnum };
      // canceleway();
      response = await executeFun(() => canceleway(payload), "cancel");
    } else {
      payload = { invoice_no: cancelRowSelected?.challanId };
      response = await executeFun(() => canceleInv(payload), "cancel");
    }
    if (response.success) {
      getData();
      // toast.success(response.message);
      setCancelRowSelected(false);
      form.resetFields();
      handleFetchRows();
    } else {
      toast.error(response.data);
      setCancelRowSelected(false);
    }
    // console.log("here");
    getData();
  };
  const validate = async () => {
    const values = await form.validateFields();
    cancelTheSelected(values);
    // getData();
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
  useEffect(() => {
    if (type) {
      setRows([]);
    }
  }, [type]);

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
    let response;
    if (type == "eway") {
      response = await executeFun(
        () => printEwayBill(orderId.eBillnum),
        "print"
      );
    } else {
      response = await executeFun(
        () => printOrderForChallan(orderId.challanId),
        "print"
      );
    }
    console.log("order", orderId);

    let { data } = response;
    if (response.success) {
      // console.log("response", data.buffer.data);
      printFunction(data.buffer.data, data.buffer.filename);
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
        onClick={() => setCancelRowSelected(row)}
        label="Cancel"
      />,

      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          // setOpen(true);
          handlePrintOrder(row);
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

  const getShipmentList = () => {
    navigate("/sales/order/shipments");
  };
  useEffect(() => {
    if (wise !== "date") {
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
  console.log("wise", wise);
  return (
    <>
      <Modal
        title={
          type == "eway"
            ? `Are you sure you want to cancel this Eway Bill ${cancelRowSelected?.eBillnum}`
            : `Are you sure you want to cancel E-
            Invoice ${cancelRowSelected?.challanId}`
        }
        open={cancelRowSelected?.challanId}
        width={420}
        confirmLoading={loading("cancel")}
        onCancel={() => setCancelRowSelected(false)}
        onOk={() => validate()}
        okText="Yes"
        cancelText="No"
      >
        {/* <>
          <Form
            form={form}
            style={{ width: "100%" }}
            layout="vertical"
            initialValues={{
              remarks: "",
            }}
          >
            {/* <Form.Item
              label="SO Id"
              name="so"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item> */}
        {/* <Form.Item
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
          </Form> */}
        {/* </> */}
      </Modal>
      <div style={{ height: "90%", padding: 5 }}>
        <Row justify="space-between" style={{ marginBottom: 5 }}>
          <Col span={24}>
            <Row justify="space-between" style={{}}>
              <Col>
                <Space>
                  <div style={{ width: 120 }}>
                    <MySelect
                      options={options}
                      value={type}
                      onChange={setType}
                    />
                  </div>
                  {type === "eway" ? (
                    <div style={{ width: 150 }}>
                      <MySelect
                        options={wiseOptionsEway}
                        value={wise}
                        onChange={setWise}
                      />
                    </div>
                  ) : (
                    <div style={{ width: 150 }}>
                      <MySelect
                        options={wiseOptions}
                        value={wise}
                        onChange={setWise}
                      />
                    </div>
                  )}

                  <Col>
                    {wise == "date" && searchTerm !== "" && (
                      <MyDatePicker
                        setDateRange={setSearchTerm}
                        value={searchTerm}
                      />
                    )}
                    {wise === "invoice" && (
                      <Input
                        placeholder="Invoice Number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    )}
                    {wise === "client" && (
                      <div style={{ width: 270 }}>
                        <MyAsyncSelect
                          style={{ width: 250 }}
                          selectLoading={loading("clientSelect")}
                          labelInValue
                          onBlur={() => setAsyncOptions([])}
                          optionsState={asyncOptions}
                          loadOptions={handleFetchClientOptions}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.value)}
                        />
                      </div>
                    )}
                  </Col>

                  {/* <Space> */}
                  <div>
                    <MyButton
                      variant="search"
                      disabled={!setSearchTerm}
                      type="primary"
                      loading={loading("fetch")}
                      onClick={getData}
                    >
                      Search
                    </MyButton>
                  </div>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* {open && (
          <UpdateSellStatus
            setOpen={setOpen}
            open={open}
            modalVals={modalVals}
            setModalVals={setModalVals}
          />
        )} */}
        <Drawer
          onClose={() => setComponentList(false)}
          open={componentList}
          width="100vw"
          bodyStyle={{ overflow: "hidden" }}
          className="message-modal"
          // closable={false}
          destroyOnClose={true}
          title={`Material List `}
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
        {/* <CreateShipment
          open={showShipmentDrawer}
          hide={() => setShowShipmentDrawer(null)}
        /> */}
        {/* <Row style={{ padding: 5, paddingTop: 0 }}></Row> */}
        {type == "eway" ? (
          <div style={{ height: "100%" }}>
            <MyDataTable
              loading={loading("fetch") || loading("print")}
              columns={[actionColumn, ...ewaycolumns]}
              data={rows}
            />
          </div>
        ) : (
          <div style={{ height: "100%" }}>
            <MyDataTable
              loading={loading("fetch") || loading("print")}
              columns={[actionColumn, ...ewInvcolumns]}
              data={rows}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default InvoiceRegister;

const ewaycolumns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },

  {
    headerName: "Invoice Date",
    minWidth: 150,
    flex: 1,
    field: "Invoice Date",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.invoiceDate} copy={true} />
    ),
  },
  {
    headerName: "Invoice Number",
    minWidth: 150,
    field: "challanId",
    flex: 1,
  },
  {
    headerName: "Supply Type",
    minWidth: 150,
    field: "supplyType",
    flex: 1,
  },
  {
    headerName: "Sub Supply Type",
    minWidth: 150,
    field: "subSupplyType",
    flex: 1,
  },
  {
    headerName: "Doc Type",
    minWidth: 150,
    field: "doctype",
    flex: 1,
  },
  {
    headerName: "Trans Type",
    minWidth: 150,
    field: "transType",
    flex: 1,
  },
  {
    headerName: "Dispatch Name",
    minWidth: 150,
    field: "dFromName",
    flex: 1,
  },
  {
    headerName: "Dispatch Address",
    minWidth: 150,
    field: "dFromAdd",
    flex: 1,
  },
  {
    headerName: "Dispatch GST",
    minWidth: 150,
    field: "dFromgst",
    flex: 1,
  },
  {
    headerName: "Dispatch From",
    minWidth: 150,
    field: "dFromplace",
    flex: 1,
  },
  {
    headerName: "Dispatch State",
    minWidth: 150,
    field: "dFromState",
    flex: 1,
  },
  {
    headerName: "Dispatch Pincode",
    minWidth: 150,
    field: "dFrompin",
    flex: 1,
  },
  {
    headerName: "Shipping Name",
    minWidth: 150,
    field: "sFromName",
    flex: 1,
  },
  {
    headerName: "Shipping GST",
    minWidth: 150,
    field: "sFromGST",
    flex: 1,
  },
  {
    headerName: "Shipping Place",
    minWidth: 150,
    field: "sFromPlace",
    flex: 1,
  },
  {
    headerName: "Shipping State",
    minWidth: 150,
    field: "sFromState",
    flex: 1,
  },
  {
    headerName: "Shipping Pincode",
    minWidth: 150,
    field: "sFrompin",
    flex: 1,
  },
  {
    headerName: "Transport Id",
    minWidth: 150,
    field: "transportId",
    flex: 1,
  },
  {
    headerName: "Trans Name",
    minWidth: 150,
    field: "trnasName",
    flex: 1,
  },
  {
    headerName: "Trans Doc Date",
    minWidth: 150,
    field: "transDocDate",
    flex: 1,
  },
  {
    headerName: "Doc Date",
    minWidth: 150,
    field: "trans_doc_date",
    flex: 1,
  },
  {
    headerName: "Vehicle",
    minWidth: 150,
    field: "vehicle",
    flex: 1,
  },
  {
    headerName: "Trans Mode",
    minWidth: 150,
    field: "transMode",
    flex: 1,
  },
  {
    headerName: "E-way Bill Number",
    minWidth: 150,
    field: "eBillnum",
    flex: 1,
  },
  {
    headerName: "Generated Date",
    minWidth: 150,
    field: "generatedDate",
    flex: 1,
  },
  {
    headerName: "Eway Status",
    minWidth: 150,
    field: "ewatStatus",
    flex: 1,
  },
];
const ewInvcolumns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },

  {
    headerName: "Invoice Date",
    minWidth: 150,
    flex: 1,
    field: "deliveryChallanDate",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.deliveryChallanDate} copy={true} />
    ),
  },
  {
    headerName: "Invoice Number",
    minWidth: 150,
    field: "challanId",
    flex: 1,
  },
  {
    headerName: "Client",
    minWidth: 150,
    field: "client",
    flex: 1,
  },
  {
    headerName: "Client Code",
    minWidth: 150,
    field: "clientCode",
    flex: 1,
  },
  {
    headerName: "E-Invoice No",
    minWidth: 150,
    field: "invoiceno",
    flex: 1,
  },
  {
    headerName: "E-Invoice Date",
    minWidth: 150,
    field: "invoicedate",
    flex: 1,
  },
  {
    headerName: "Irn No",
    minWidth: 250,
    field: "irnNo",
    flex: 1,
  },
  {
    headerName: "Client Address",
    minWidth: 250,
    field: "clientAddress",
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.clientAddress} copy={true} />
    ),
  },
  {
    headerName: "Billing address",
    minWidth: 250,
    field: "billingaddress",
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.billingaddress} copy={true} />
    ),
  },
  {
    headerName: "Shipping Address",
    minWidth: 250,
    field: "shippingAddress",
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.shippingAddress} copy={true} />
    ),
  },
];
