import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button, Modal } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SelectChallanTypeModal from "./components/WoCreateChallan/SelectChallanTypeModal";
import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import {
  createWorkOrderShipmentChallan,
  fetchReturnChallanDetails,
  getClientOptions,
  getReturnRowsInViewChallan,
  getWorkOrderAnalysis,
  getdetailsOfReturnChallan,
  printreturnChallan,
} from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import { responsiveArray } from "antd/es/_util/responsiveObserver";
import { Drawer } from "antd/es";
const WoViewChallan = () => {
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [detaildata, setDetailData] = useState("");
  const [challantype, setchallantype] = useState(challanoptions[0].value);
  const [cancelRemark, setCancelRemark] = useState("");
  const [viewChallan, setViewChallan] = useState(false);
  const [viewChallanData, setViewChallanData] = useState([]);

  const showSubmitConfirmationModal = (f) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Cancel the Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Input
          onChange={(e) => {
            setCancelRemark(e.target.value);
          }}
          placeholder="please input the cancel Reason"
        />
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await cancelwochallan(f.challanId, f.transactionId);
      },
    });
  };

  const printwoChallan = async (row) => {
    setLoading("fetch");
    // console.log("challamTypw", challantype);
    if (challantype === "RM Challan") {
      let payload = {
        challan_id: row.challan_id,
        ref_id: "--",
      };
      const arr = await printreturnChallan(payload);
      // console.log("console.log(response);", arr.data.buffer.data);
      printFunction(arr.data.buffer.data);
      setLoading(false);
    } else {
      const response = await imsAxios.post(
        "/wo_challan/printWorkorderDeliveryChallan",
        {
          challan_id: row.challan_id,
          ref_id: "--",
        }
      );
      console.log("console.log(response);", response.data.data.buffer.data);
      printFunction(response.data.data.buffer.data);
      setLoading(false);
    }
  };

  const downloadwochallan = async (row) => {
    if (challantype === "RM Challan") {
      let payload = {
        challan_id: row.challan_id,
        ref_id: "--",
      };
      const arr = await printreturnChallan(payload);
      // console.log("console.log(response);", arr);
      downloadFunction(arr.data.buffer.data, row.challan_id);
      setLoading(false);
    } else {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/wo_challan/printWorkorderDeliveryChallan",
        {
          challan_id: row.challan_id,
          ref_id: "--",
        }
      );
      downloadFunction(response.data.data.buffer.data, row.challan_id);
      console.log(response);
      setLoading(false);
    }
  };

  const cancelwochallan = async (cid, woid) => {
    try {
      setLoading("select" / "fetch");
      console.log(challanoptions);
      const response = await imsAxios.post(
        challantype === "Delivery Challan"
          ? "wo_challan/woDeliveryChallanCancel"
          : "wo_challan/woReturnChallanCancel",
        {
          wo_id: woid,
          challan_id: cid,
          remark: cancelRemark,
        }
      );
      toast.success(response.data.message);
      // toast.error
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
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
          setViewChallan(row);
          viewChallanRow(row);
          // printwoChallan(row);
        }}
        label="View"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          setDetailData(row);
          printwoChallan(row);
        }}
        label="Print"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          setDetailData(row);
          downloadwochallan(row);
        }}
        label="Download"
      />,
      // <GridActionsCellItem
      //   showInMenu
      //   // disabled={loading}
      //   onClick={() => {
      //     setDetailData(row);
      //     showSubmitConfirmationModal(row);
      //   }}
      //   label="Cancel Challan"
      // />,
    ],
  };
  // const getRows = async () => {
  //   try {
  //     setLoading("fetch");
  //     if (challantype === "Delivery Challan") {
  //       const response = await imsAxios.post(
  //         "/wo_challan/getWorkOrderDeliveryChallan",
  //         {
  //           wise: wise,
  //           data: searchInput,
  //         }
  //       );
  //       const { data } = response;
  //       if (data.code === 200) {
  //         const arr = data.data.map((row, index) => ({
  //           id: index + 1,
  //           date: row.received_challan_rm_dt,
  //           client: row.client,
  //           requiredQty: row.wo_order_qty,
  //           challanId: row.challan_id,
  //           sku: row.sku_code,
  //           productId: row.sku,
  //           product: row.wo_sku_name,
  //           transactionId: row.wo_transaction_id,
  //           challantype: challantype,
  //           clientCode: row.client_code,
  //           shipaddress: row.shippingaddress,
  //           billaddress: row.billingaddress,
  //           clientaddress: row.clientaddress,
  //         }));
  //         setRows(arr);
  //       } else {
  //         toast.error(data.message.msg);
  //       }
  //     } else {
  //       const response = await imsAxios.post(
  //         "/wo_challan/getWorkOrderReturnChallan",
  //         {
  //           wise: wise,
  //           data: searchInput,
  //         }
  //       );
  //       const { data } = response;
  //       console.log(response);
  //       if (data.code === 200) {
  //         const arr = data.data.map((row, index) => ({
  //           id: index + 1,
  //           date: row.received_challan_rm_dt,
  //           client: row.client,
  //           requiredQty: row.wo_order_qty,
  //           challanId: row.challan_id,
  //           sku: row.sku_code,
  //           product: row.wo_sku_name,
  //           transactionId: row.wo_transaction_id,
  //           challantype: challantype,
  //           clientCode: row.client_code,
  //           shipaddress: row.shippingaddress,
  //           billaddress: row.billingaddress,
  //           clientaddress: row.clientaddress,
  //         }));
  //         setRows(arr);
  //       } else {
  //         toast.error(data.message.msg);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("some error occured while fetching rows", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const getRows = async () => {
    // challantype
    if (challantype === "Delivery Challan") {
      getDeliveryRows();
    } else {
      getReturnRows();
    }
  };
  const getReturnRows = async () => {
    setRows([]);
    setLoading("fetch");
    let arr = await getReturnRowsInViewChallan(wise, searchInput);

    setRows(arr);
    setLoading(false);
  };
  const getDeliveryRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/wo_challan/fetchDeliveryChallan", {
      wise: wise,
      data: searchInput,
    });
    const { data } = response;
    if (data.code === 200) {
      const arr = data.data.map((row, index) => ({
        id: index + 1,
        // ...rows,
        //  date: row.received_challan_rm_dt,
        client: row.client,
        //  //  requiredQty: row.wo_order_qty,
        //  //  challanId: row.challan_id,
        //  //  sku: row.sku_code,
        //  //  productId: row.sku,
        //  //  product: row.wo_sku_name,
        //  //  transactionId: row.wo_transaction_id,
        //  //  challantype: challantype,
        //  //  clientCode: row.client_code,
        //  //  shipaddress: row.shippingaddress,
        //  //  billaddress: row.billingaddress,
        //  //  clientaddress: row.clientaddress,

        delivery_challan_dt: row.delivery_challan_dt,
        client_code: row.client_code,
        clientaddress: row.clientaddress,
        billingaddress: row.billingaddress,
        shippingaddress: row.shippingaddress,
        challan_id: row.challan_id,
        //  challan_id.row,
        //  date: row.received_challan_rm_dt,
      }));
      setLoading(false);
      setRows(arr);
    } else {
      toast.error(data.message.msg);

      setLoading(false);
    }
    setLoading(false);
  };
  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getClientOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const viewChallanRow = async (row) => {
    let challanID = row.challan_id;
    let response;
    let arr;
    if (challantype === "RM Challan") {
      setLoading("fetch");
      let arr = await fetchReturnChallanDetails(challanID);
      arr = arr.map((row, index) => ({
        id: index + 1,
        ...row,
      }));
      setViewChallanData(arr);
      setLoading(false);
    } else {
      setLoading("fetch");
      response = await imsAxios.post("/wo_challan/getDeliveryChallanDetails", {
        challan_id: challanID,
      });
      const { data } = response;
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          id: index + 1,
          ...row,
        }));
        setViewChallanData(arr);
        // console.log("arrrrr", arr);
        setLoading(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);
  useEffect(() => {
    if (viewChallan) {
    }
  }, [viewChallan]);

  const colms = [
    {
      headerName: "#",
      field: "id",
      width: 5,
    },
    {
      headerName: "Product",
      field: "wo_sku_name",
      width: 300,
    },
    {
      headerName: "Qty",
      field: "wo_order_qty",
      width: 150,
    },
    {
      headerName: "SKU Code",
      field: "sku_code",
      width: 100,
    },
    {
      headerName: "Transaction Id",
      field: "wo_transaction_id",
      width: 150,
    },
    {
      headerName: "Shipment Id",
      field: "wo_shipment_id",
      width: 150,
    },

    {
      headerName: "Qty",
      field: "wo_order_qty",
      width: 100,
    },
    {
      headerName: "Rate",
      field: "wo_order_rate",
      width: 100,
    },
  ];
  const returncolms = [
    {
      headerName: "#",
      field: "id",
      width: 5,
    },
    {
      headerName: "Component",
      field: "wo_part_name",
      width: 300,
    },
    {
      headerName: "Part Code",
      field: "wo_part_no",
      width: 100,
    },
    {
      headerName: "Transaction Id",
      field: "wo_transaction_id",
      width: 150,
    },
    {
      headerName: "Shipment Id",
      field: "wo_shipment_id",
      width: 150,
    },
    {
      headerName: "Qty",
      field: "wo_order_qty",
      width: 100,
    },
    {
      headerName: "Rate",
      field: "wo_order_rate",
      width: 100,
    },
  ];

  return (
    <>
      <div style={{ height: "90%", paddingRight: 10, paddingLeft: 10 }}>
        <Col span={24}>
          <Row>
            <Col>
              <div style={{ paddingBottom: "10px" }}>
                <Space>
                  <div style={{ width: 200 }}>
                    <MySelect
                      options={challanoptions}
                      value={challantype}
                      onChange={(e) => {
                        setchallantype(e);
                      }}
                    />
                  </div>
                  <div style={{ width: 200 }}>
                    <MySelect
                      onChange={setWise}
                      options={wiseOptions}
                      value={wise}
                      placeholder="Select Wise"
                    />
                  </div>
                  {wise === wiseOptions[0].value && (
                    <div style={{ width: 270 }}>
                      <MyAsyncSelect
                        selectLoading={loading === "select"}
                        optionsState={asyncOptions}
                        onBlur={() => setAsyncOptions([])}
                        value={searchInput}
                        onChange={setSearchInput}
                        loadOptions={handleClientOptions}
                      />
                    </div>
                  )}
                  {wise === wiseOptions[1].value && (
                    <MyDatePicker setDateRange={setSearchInput} />
                  )}
                  {/* {wise === wiseOptions[2].value && (
                    <div style={{ width: 270 }}>
                      <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                  )} */}

                  <Button
                    onClick={getRows}
                    loading={loading === "fetch"}
                    type="primary"
                  >
                    Fetch
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Col>
        <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
          <MyDataTable
            loading={loading === "fetch"}
            data={rows}
            columns={[actionColumn, ...columns]}
          />
        </div>

        <CreateChallanModal
          show={showCreateChallanModal}
          data={detaildata}
          close={() => setShowCreateChallanModal(false)}
        />
      </div>
      <Drawer
        title={`${viewChallanData[0]?.client}`}
        // right
        placement="right"
        // centered
        // confirmLoading={submitLoading}
        open={viewChallan}
        onClose={() => setViewChallan(false)}
        width={950}
        // width={450}
        // title="Map Invoice"
        // placement="right"
        // onClose={setViewChallan}
        // open={viewChallan}
      >
        {challantype === "Delivery Challan" ? (
          <MyDataTable
            loading={loading === "fetch"}
            data={viewChallanData}
            columns={colms}
          />
        ) : (
          <MyDataTable
            loading={loading === "fetch"}
            data={viewChallanData}
            columns={returncolms}
          />
        )}

        {/* <>
          <div style={{ height: "100%" }}>
            <MyDataTable data={allBranch} columns={coloums} />
          </div>
          <EditBranchModel
            setBranchModal={setBranchModal}
            branchModal={branchModal}
            setBranchId={setBranchId}
            branchId={branchId}
            allBranch={allBranch}
          />
        </> */}
      </Drawer>
    </>
  );
};

const wiseOptions = [
  {
    text: "Client Wise",
    value: "clientwise",
  },
  {
    text: "Date Wise",
    value: "datewise",
  },
  // {
  //   text: "Work Order Wise",
  //   value: "wo_transaction_wise",
  // },
];
const typeOptions = [
  {
    text: "Delivery Challan",
    value: "delivery",
  },
  {
    text: "Return Challan",
    value: "return",
  },
];
const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Challan Date",
    field: "delivery_challan_dt",
    width: 100,
  },
  {
    headerName: "Challan ID",
    field: "challan_id",
    minWidth: 150,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.challan_id} copy={true} />
    ),
  },
  {
    headerName: "Client",
    field: "client",
    minWidth: 180,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.client} />,
  },
  {
    headerName: "Client Code",
    field: "client_code",
    minWidth: 100,
    flex: 1,
  },
  {
    headerName: "Client Address",
    field: "clientaddress",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.clientaddress} />,
  },
  {
    headerName: "Billing Address",
    field: "billingaddress",
    minWidth: 150,
    flex: 1,

    renderCell: ({ row }) => <ToolTipEllipses text={row.billingaddress} />,
  },
  {
    headerName: "Shipping Address",
    field: "shippingaddress",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingaddress} />,
  },

  // {
  //   headerName: "Product",
  //   field: "product",
  //   minWidth: 250,
  //   flex: 1,
  // },
  // {
  //   headerName: "SKU",
  //   field: "sku",
  //   width: 150,
  // },
  // {
  //   headerName: "Qty",
  //   field: "requiredQty",
  //   width: 150,
  // },
];

const challanoptions = [
  { text: "Delivery Challan", value: "Delivery Challan" },
  { text: "Return Challan", value: "RM Challan" },
];

export default WoViewChallan;
