import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button, Spin, Drawer } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import {
  createWorkOrderReturnChallan,
  createWorkOrderShipmentChallan,
  getClientOptions,
  getWorkOrderRC,
  getWorkOrderShipment,
  getdetailsOfReturnChallan,
} from "./components/api";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Loading from "../../Components/Loading";
import { toast } from "react-toastify";
import { Form, Modal } from "antd/es";
import { imsAxios } from "../../axiosInterceptor";
import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import MyButton from "../../Components/MyButton";
import { Cancel, Edit, Search, Visibility } from "@mui/icons-material";
import CustomButton from "../../new/components/reuseable/CustomButton";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
const WoShipment = () => {
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [detaildata, setDetailData] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [selected, setSelected] = useState([]);
  const [cancelRemark, setCancelRemark] = useState("");
  const [editShipment, setEditShipment] = useState("");
  const [viewRtnChallan, setViewRtnChallan] = useState([]);
  const [rtData, setRtData] = useState([]);
  const [challantype, setchallantype] = useState(challanoptions[0].value);
  const [ModalForm] = Form.useForm();
  const showSubmitConfirmationModal = (f, type) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Cancel the Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm}>
          <Form.Item name="remark">
            <Input placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await cancelwochallan(f, type);
      },
    });
  };
  const showCreateShipmentModal = (f) => {
    Modal.confirm({
      title: "Are you sure you want to create this Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm} layout="vertical">
          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={4} placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await createShipmentChallan(cancelRemark);
      },
    });
  };
  const clearForm = () => {
    ModalForm.resetFields();
  };
  const cancelwochallan = async (row, type) => {
    const values = await ModalForm.validateFields();
    // console.log("rowwo", cancelRemark);
    // console.log("values", values);
    var wo = row.woTransaction_Id;
    var shipId = row.shipmentId;
    let obj = { wo_id: wo, shipment_id: shipId, remark: values.remark };
    // console.log("remark", remark);
    // return;
    let link;
    if (type === "return") {
      link = "/wo_challan/woReturnShipmentCancel";
    } else {
      link = "/wo_challan/woShipmentCancel";
    }
    const response = await imsAxios.post(link, obj);
    console.log("Repinse=>", response);
    const { data } = response;
    if (data.code === 200) {
      toast.success(data.message);
      setCancelRemark("");
    } else {
      toast.error(data.message);
    }
    setCancelRemark("");
    getRows();
    clearForm();
  };
  useEffect(() => {
    if (viewRtnChallan.shipmentId) {
      getRtnDetails(viewRtnChallan.shipmentId);
    }
  }, [viewRtnChallan]);

  const getRtnDetails = async (shipWoid) => {
    // console.log("shipWoid", shipWoid);
    let arr = await getdetailsOfReturnChallan(shipWoid);
    let a = arr.map((r) => {
      return { ...r };
    });
    setRtData(a);
  };
  const drawerColumns = [
    {
      headerName: "#",
      field: "id",
      width: 30,
    },
    {
      headerName: "Part Code",
      field: "part_code",
      width: 100,
    },
    {
      headerName: "Part Name",
      field: "part_name",
      width: 300,
    },
    {
      headerName: "Price",
      field: "price",
      width: 90,
    },
    {
      headerName: "Qty",
      field: "qty",
      width: 90,
    },
    {
      headerName: "HSN",
      field: "hsn",
      width: 150,
    },
    {
      headerName: "Remark",
      field: "remark",
      width: 200,
    },
  ];
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) =>
      challantype === "RM Challan"
        ? [
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                setViewRtnChallan(row);
              }}
              label="View Return"
            />,
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                setDetailData(row);
                setShowCreateChallanModal(true);
                setEditShipment("editReturn");
              }}
              label="Edit Return"
            />,
            <GridActionsCellItem
              showInMenu
              onClick={() => {
                setDetailData(row);
                showSubmitConfirmationModal(row, "return");
              }}
              label="Cancel"
            />,
          ]
        : [
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                setDetailData(row);
                setShowCreateChallanModal(true);
                setEditShipment("Shipment");
              }}
              label="Edit Shipment"
            />,
            <GridActionsCellItem
              showInMenu
              onClick={() => {
                setDetailData(row);
                showSubmitConfirmationModal(row, "Shipment");
              }}
              label="Cancel Shipment"
            />,
          ],
  };

  const getRows = async () => {
    // setRows(newarray);
    try {
      setLoading("fetch");
      // setLoading("fetch");
      let arr;
      if (challantype === "RM Challan") {
        arr = await getWorkOrderRC(wise, searchInput);
      } else {
        arr = await getWorkOrderShipment(wise, searchInput);
      }

      // console.log("arr ->", arr);
      let newarr = arr.filter(
        (row) =>
          row.del_challan_status === "NOT CREATED" &&
          row.shipment_status === "A"
      );
      // console.log("newarr", newarr);
      setRows(arr);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCancelRemark(cancelRemark);
  }, [cancelRemark]);

  const createShipmentChallan = async (cancelRemark) => {
    const values = await ModalForm.validateFields();
    let mins = selected.map((row) => rows.filter((r) => r.id == row)[0]);
    if (challantype === "RM Challan") {
      let payload = {
        client_id: mins[0].clientCode,
        client_address_id: mins[0].clientAddId,
        billing_id: mins[0].billingId,
        dispatch_id: mins[0].dispatchId,
        shipment_id: mins.map((r) => r.shipmentId),
        wo_transaction_id: mins.map((r) => r.woTransaction_Id),
        remark: values.remark,
      };
      const arr = await createWorkOrderReturnChallan(payload);
      getRows();
      clearForm();
    } else {
      let shipment = mins.map((r) => r.shipmentId);
      let woTransaction = mins.map((r) => r.woTransaction_Id);

      let payload = {
        client_id: mins[0].clientCode,
        client_address_id: mins[0].client_add_id,
        billing_id: mins[0].billing_id,
        dispatch_id: mins[0].dispatchId,
        shipment_id: shipment,
        wo_transaction_id: woTransaction,
        remark: values.remark,
        challan_id: values.challanID,
      };

      const arr = await createWorkOrderShipmentChallan(payload);
      getRows();
      clearForm();
    }
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
  const close = () => {
    setShowCreateChallanModal(false);
  };
  //
  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);

  const table = useMaterialReactTable({
    columns: challantype === "RM Challan" ? rtnColumns : columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    enableRowSelection: true,
    renderRowActions: ({ row }) =>
      challantype === "RM Challan" ? (
        <div>
          <Tooltip title="Cancel Return">
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setDetailData(row);
                showSubmitConfirmationModal(row, "return");
              }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Return">
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setDetailData(row);
                setShowCreateChallanModal(true);
                setEditShipment("editReturn");
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Return">
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setViewRtnChallan(row);
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <div>
          <Tooltip title="Cancel Shipment">
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setDetailData(row);
                showSubmitConfirmationModal(row, "Shipment");
              }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>{" "}
          <Tooltip title="Edit Shipment">
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setDetailData(row);
                setShowCreateChallanModal(true);
                setEditShipment("Shipment");
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading ? (
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
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  useEffect(() => {
    const selectedRows = table
      .getSelectedRowModel()
      .flatRows.map((r) => r.original);
    setSelected(selectedRows);
  }, [rowSelection, table]);
  return (
    <div style={{ height: "90%", margin: 12 }}>
      {loading === "fetch" && <Loading />}
      <Drawer
        title={`${viewRtnChallan?.shipmentId}`}
        // right
        placement="right"
        open={viewRtnChallan?.shipmentId}
        onClose={() => setViewRtnChallan(false)}
        width={1050}
      >
        <MyDataTable columns={drawerColumns} data={rtData} />
      </Drawer>
      <Col span={24}>
        <Row>
          <Col>
            <div
              style={{
                paddingBottom: "10px",
                justifyContent: "space-between",
                display: "flex",
              }}
            >
              <div>
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

                  <CustomButton
                    size="small"
                    title={"Search"}
                    starticon={<Search fontSize="small" />}
                    loading={loading === "fetch"}
                    onclick={getRows}
                  />
                </Space>
              </div>
              <div style={{ marginLeft: 8 }}>
                <CustomButton
                  size="small"
                  title={"Create Challan"}
                  disabled={rowSelection.length === 0}
                  onclick={showCreateShipmentModal}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Col>
      <div style={{ height: "calc(100% - 60px)" }}>
     
        <MaterialReactTable table={table} />
      </div>

      {showCreateChallanModal && (
        <CreateChallanModal
          editShipment={editShipment}
          setEditShipment={setEditShipment}
          show={showCreateChallanModal}
          data={detaildata}
          setDetailData={setDetailData}
          close={close}
        />
      )}
    </div>
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
    header: "#",
    accessorKey: "id",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "shipmentDt",
    size: 150,
  },
  {
    header: "Client",
    accessorKey: "client",
    size: 300,
    flex: 1,
  },
  {
    header: "Transaction Id",
    accessorKey: "woTransaction_Id",
    size: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.woTransaction_Id} copy={true} />
    ),
  },
  {
    header: "Shipment Id",
    accessorKey: "woshipmentId",
    size: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.woshipmentId} copy={true} />
    ),
  },
  {
    header: "Product",
    accessorKey: "wo_sku_name",
    size: 350,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.wo_sku_name} copy={true} />
    ),
  },
  {
    header: "SKU",
    accessorKey: "skuCode",
    size: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.skuCode} copy={true} />,
  },
  {
    header: "Qty",
    accessorKey: "wo_order_qty",
    size: 150,
  },
];
const rtnColumns = [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "shipmentDt",
    size: 150,
  },
  {
    header: "Client",
    accessorKey: "client",
    size: 300,
    flex: 1,
  },
  {
    header: "Transaction Id",
    accessorKey: "woTransaction_Id",
    size: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.woTransaction_Id} copy={true} />
    ),
  },
  {
    header: "Product",
    accessorKey: "wo_sku_name",
    size: 350,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.wo_sku_name} copy={true} />
    ),
  },
  {
    header: "SKU",
    accessorKey: "skuCode",
    size: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.skuCode} copy={true} />,
  },
];

export default WoShipment;
const challanoptions = [
  { text: "Delivery Challan", value: "Delivery Challan" },
  { text: "Return Challan", value: "RM Challan" },
];
