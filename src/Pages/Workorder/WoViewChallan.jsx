import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button, Modal, Form } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { Link } from "react-router-dom";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import {
  downloadAllViewChallan,
  fetchReturnChallanDetails,
  getClientOptions,
  getReturnRowsInViewChallan,
  getScrapeInViewChallan,
  getViewChallan,
  printreturnChallan,
} from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import printFunction, {
  downloadExcel,
  downloadFunction,
} from "../../Components/printFunction";
import { Drawer } from "antd/es";
import { useNavigate } from "react-router";
import CustomButton from "../../new/components/reuseable/CustomButton";
import {
  Cancel,
  Create,
  Download,
  Edit,
  Print,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
const WoViewChallan = () => {
  const [wise, setWise] = useState(wiseOptions[1].value);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [detaildata, setDetailData] = useState("");
  const [challantype, setchallantype] = useState(challanoptions[0].value);
  const [cancelRemark, setCancelRemark] = useState("");
  const [allChallanType, setAllChallanType] = useState("");
  const [viewChallan, setViewChallan] = useState(false);
  const [viewChallanData, setViewChallanData] = useState([]);
  const [scrapeChallan, setScrapeChallan] = useState("");
  const navigate = useNavigate();
  const [cancelform] = Form.useForm();
  const showSubmitConfirmationModal = (f) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Cancel the Challan?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={cancelform}>
          <Form.Item name="remark">
            <Input placeholder="Please input the cancel Reason" />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await cancelwochallan(f);
      },
    });
  };

  const printwoChallan = async (row) => {
    setLoading("fetch");
    let challanAllType = row.challan_type;
    if (challantype === "RM Challan" || challanAllType == "return") {
      let payload = {
        challan_id: row.challan_id,
        ref_id: "--",
      };
      const arr = await printreturnChallan(payload);
      printFunction(arr.data.buffer.data);
      setLoading(false);
    } else if (
      challantype === "Delivery Challan" ||
      challanAllType == "delivery"
    ) {
      const response = await imsAxios.post(
        "/wo_challan/printWorkorderDeliveryChallan",
        {
          challan_id: row.challan_id,
          ref_id: "--",
        }
      );
      printFunction(response.data.data.buffer.data);
      setLoading(false);
    } else {
      const response = await imsAxios.post("/wo_challan/printScrapChallan", {
        challan_id: row.challan_id,
        ref_id: "--",
      });
      printFunction(response.data.data.buffer.data);
      setLoading(false);
    }
  };

  const downloadwochallan = async (row) => {
    let challanAllType = row.challan_type;
    if (challantype === "RM Challan" || challanAllType == "return") {
      let payload = {
        challan_id: row.challan_id,
        ref_id: "--",
      };
      const arr = await printreturnChallan(payload);
      downloadFunction(arr.data.buffer.data, row.challan_id);
      setLoading(false);
    } else if (
      challantype === "Delivery Challan" ||
      challanAllType == "delivery"
    ) {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/wo_challan/printWorkorderDeliveryChallan",
        {
          challan_id: row.challan_id,
          ref_id: "--",
        }
      );
      downloadFunction(response.data.data.buffer.data, row.challan_id);
      setLoading(false);
    } else {
      setLoading("fetch");
      const response = await imsAxios.post("/wo_challan/printScrapChallan", {
        challan_id: row.challan_id,
        ref_id: "--",
      });
      downloadFunction(response.data.data.buffer.data, row.challan_id);
      setLoading(false);
    }
  };

  const cancelwochallan = async (f) => {
    const values = await cancelform.validateFields();
    try {
      setLoading("select" / "fetch");
      console.log("challanoptions", challanoptions);
      console.log("cancelRemark", cancelRemark);
      console.log("f", f);
      let link;
      if (challantype === "Scrape Challan" || f.challan_type == "scrape") {
        link = "/wo_challan/woScrapChallanCancel";
      }
      const response = await imsAxios.post(link, {
        challan_id: f.challan_id,
        remark: values.remark,
      });
      toast.success(response.data.message);
      cancelform.resetFields();
      getAllRows();
      // toast.error
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (scrapeChallan) {
      navigate(`/wocreatescrapechallan?challan=${scrapeChallan}`);
    }
  }, [scrapeChallan]);
  

  const getRows = async () => {
    getAllRows(challantype);
    return;
  };
  const getScrapeRows = async () => {
    setRows([]);
    setLoading("fetch");
    let arr = await getScrapeInViewChallan(wise, searchInput);

    setRows(arr);
    setLoading(false);
  };
  const getAllRows = async (challantype) => {
    // setRows([]);
    setLoading("fetch");
    let arr = await getViewChallan(challantype, wise, searchInput);
    setRows(arr);
    setLoading(false);
  };
  const getdownloadedAllRows = async () => {
    // setRows([]);
    setLoading("download");
    let response = await downloadAllViewChallan(challantype, wise, searchInput);
    let { data } = response;
    if (response.success) {
      downloadExcel(data.data, "Challan List");
      setLoading(false);
    }
    setLoading(false);
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
        client: row.client,
        delivery_challan_dt: row.delivery_challan_dt,
        client_code: row.client_code,
        clientaddress: row.clientaddress,
        billingaddress: row.billingaddress,
        shippingaddress: row.shippingaddress,
        challan_id: row.challan_id,
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
    // console.log("row", row);
    let challanID = row.challan_id;
    let challantype = row.challan_type;
    setAllChallanType(row.challan_type);
    let response;
    let arr;
    if (challantype === "RM Challan" || challantype == "return") {
      setLoading("fetch");

      let arr = await fetchReturnChallanDetails(challanID);
      arr = arr.map((row, index) => ({
        id: index + 1,
        ...row,
      }));
      // console.log("arrrrr", arr);
      setViewChallanData(arr);
      setLoading(false);
    } else if (
      challantype === "Delivery Challan" ||
      challantype == "delivery"
    ) {
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
    } else {
      setLoading("fetch");

      response = await imsAxios.post("/wo_challan/fetchScrapChallanDetails", {
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
      setLoading(false);
    }
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
    // {
    //   headerName: "Qty",
    //   field: "wo_order_qty",
    //   width: 150,
    // },
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
  const scrapecolms = [
    {
      headerName: "#",
      field: "id",
      width: 5,
    },
    {
      headerName: "Part Name",
      field: "part_name",
      width: 300,
    },
    {
      headerName: "Part Code",
      field: "part_code",
      width: 100,
    },

    {
      headerName: "Qty",
      field: "qty",
      width: 100,
    },
    {
      headerName: "Price",
      field: "price",
      width: 100,
    },
    {
      headerName: "Remark",
      field: "remark",
      width: 100,
    },
  ];
  const closeDrawer = () => {
    setViewChallan(false);
    setViewChallanData([]);
    setAllChallanType("");
  };
  useEffect(() => {
    if (challantype) {
      setRows([]);
    }
  }, [challantype]);
  useEffect(() => {
    if (allChallanType) {
      
      if (allChallanType) {
        
        setViewChallanData([]);
      }
    }
  }, [allChallanType]);


  const table = useMaterialReactTable({
    columns: allColm,
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
        height:
          loading === "fetch" ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
      challantype === "Scrape Challan"
        ? [
            <MRT_ActionMenuItem
              icon={<Visibility fontSize="small" />}
              key="view"
              label="View"
              onClick={() => {
                closeMenu?.();
                setViewChallan(row?.original);
                viewChallanRow(row?.original);
                // printwoChallan(row);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Edit fontSize="small" />}
              key="edit"
              label="Edit"
              onClick={() => {
                closeMenu?.();
                setScrapeChallan(row?.original?.challan_id);
              }}
              table={table}
            />,

            <MRT_ActionMenuItem
              icon={<Download fontSize="small" />}
              key="download"
              label="Download"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                downloadwochallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Print fontSize="small" />}
              key="print"
              label="Print"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                printwoChallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Create fontSize="small" />}
              key="ewaybill"
              label="Create E-Way Bill"
              onClick={() => {
                closeMenu?.();
                const url = `/warehouse/e-way/scrape-wo/${row?.original?.challan_id.replaceAll(
                  "/",
                  "_"
                )}`;
                window.open(url, "_blank");
              }}
              table={table}
            />,
          ]
        : challantype === "RM Challan"
        ? [
            <MRT_ActionMenuItem
              icon={<Visibility fontSize="small" />}
              key="view"
              label="View"
              onClick={() => {
                closeMenu?.();
                setViewChallanData([]);
                setViewChallan(row?.original);
                viewChallanRow(row?.original);
                // printwoChallan(row);
              }}
              table={table}
            />,

            <MRT_ActionMenuItem
              icon={<Download fontSize="small" />}
              key="download"
              label="Download"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                downloadwochallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Print fontSize="small" />}
              key="print"
              label="Print"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                printwoChallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Create fontSize="small" />}
              key="ewaybill"
              label="Create E-Way Bill"
              onClick={() => {
                closeMenu?.();
                const url = `/warehouse/e-way/wo/${row?.original?.challan_id.replaceAll(
                  "/",
                  "_"
                )}`;
                window.open(url, "_blank");
              }}
              table={table}
            />,
          ]
        : row.challan_type == "scrape"
        ? [
            <MRT_ActionMenuItem
              icon={<Visibility fontSize="small" />}
              key="view"
              label="View"
              onClick={() => {
                closeMenu?.();
                setViewChallan(row?.original);
                viewChallanRow(row?.original);
                // printwoChallan(row);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Edit fontSize="small" />}
              key="edit"
              label="Edit"
              onClick={() => {
                closeMenu?.();
                setScrapeChallan(row?.original?.challan_id);
              }}
              table={table}
            />,

            <MRT_ActionMenuItem
              icon={<Download fontSize="small" />}
              key="download"
              label="Download"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                downloadwochallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Print fontSize="small" />}
              key="print"
              label="Print"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                printwoChallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Cancel fontSize="small" />}
              key="close"
              label="Cancel Challan"
              onClick={() => {
                setDetailData(row?.original);
                showSubmitConfirmationModal(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Create fontSize="small" />}
              key="ewaybill"
              label="Create E-Way Bill"
              onClick={() => {
                closeMenu?.();
                const url = `/warehouse/e-way/scrape-wo/${row?.original?.challan_id.replaceAll(
                  "/",
                  "_"
                )}`;
                window.open(url, "_blank");
              }}
              table={table}
            />,
          ]
        : [
           <MRT_ActionMenuItem
              icon={<Visibility fontSize="small" />}
              key="view"
              label="View"
              onClick={() => {
                closeMenu?.();
                 setViewChallan(row?.original);
                viewChallanRow(row?.original);
                // printwoChallan(row);
              }}
              table={table}
            />,

            <MRT_ActionMenuItem
              icon={<Download fontSize="small" />}
              key="download"
              label="Download"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                downloadwochallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Print fontSize="small" />}
              key="print"
              label="Print"
              onClick={() => {
                closeMenu?.();
                setDetailData(row?.original);
                printwoChallan(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Create fontSize="small" />}
              key="ewaybill"
              label="Create E-Way Bill"
              onClick={() => {
                closeMenu?.();
                const url = `/warehouse/e-way/wo/${row?.original?.challan_id.replaceAll(
                  "/",
                  "_"
                )}`;
                window.open(url, "_blank");
              }}
              table={table}
            />,
        ],
  });

  return (
    <>
      <div style={{ height: "90%", margin: "12px" }}>
        <Col span={24}>
          <Row>
            <Col>
              <div
                style={{
                  paddingBottom: "10px",
                }}
              >
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
                    <MyDatePicker
                      setDateRange={setSearchInput}
                      select="This Month"
                    />
                  )}
                  <CustomButton
                    size="small"
                    title={"Search"}
                    starticon={<Search fontSize="small" />}
                    loading={loading === "fetch"}
                    onclick={() => getAllRows(challantype)}
                  />

                  <CommonIcons
                    action="downloadButton"
                    type="primary"
                    disabled={!rows.length}
                    onClick={getdownloadedAllRows}
                    loading={loading === "download"}
                  />
                </Space>
              </div>
            </Col>
          </Row>
        </Col>
        <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
          <MaterialReactTable table={table} />
        </div>

        <CreateChallanModal
          show={showCreateChallanModal}
          data={detaildata}
          close={() => setShowCreateChallanModal(false)}
        />
      </div>
      <Drawer
        title={
          challantype === "Scrape Challan" || allChallanType == "scrape"
            ? "Scrape Challan"
            : `${viewChallanData[0]?.client}`
        }
        // right
        placement="right"
        open={viewChallan}
        onClose={() => closeDrawer()}
        width={950}
      >
        {challantype === "Delivery Challan" || allChallanType == "delivery" ? (
          <MyDataTable
            loading={loading === "fetch"}
            data={viewChallanData}
            columns={colms}
          />
        ) : challantype === "RM Challan" || allChallanType == "return" ? (
          <MyDataTable
            loading={loading === "fetch"}
            data={viewChallanData}
            columns={returncolms}
          />
        ) : (
          <MyDataTable
            loading={loading === "fetch"}
            data={viewChallanData}
            columns={scrapecolms}
          />
        )}
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
const scrapeColumns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Challan Date",
    field: "challan_dt",
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
const allColm = [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },

  {
    header: "Challan ID",
    accessorKey: "challan_id",
    size: 150,
    render: ({ row }) => <ToolTipEllipses text={row.challan_id} copy={true} />,
  },
  {
    header: "Client",
    accessorKey: "client",
    size: 220,

    render: ({ row }) => <ToolTipEllipses text={row.client} />,
  },
  {
    header: "Client Code",
    accessorKey: "client_code",
    size: 80,
  },
  {
    header: "Delivery Challan Date",
    accessorKey: "delivery_challan_dt",
    size: 230,
  },
  {
    header: "Item Name",
    accessorKey: "item_name",
    size: 250,

    render: ({ row }) => <ToolTipEllipses text={row.item_name} />,
  },
  {
    header: "Item Qty",
    accessorKey: "item_qty",
    size: 100,
  },
  {
    header: "Item Rate",
    accessorKey: "item_rate",
    size: 100,
  },
  {
    header: "Item Value",
    accessorKey: "item_value",
    size: 100,
  },

  {
    header: "Eway Bill Status",
    accessorKey: "ewaybillStatus",
    size: 250,
  },

  {
    header: "Eway Bill Number",
    accessorKey: "ewaybill_no",
    size: 250,
  },

  // {
  //   header: "Product",
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
];

const challanoptions = [
  { text: "All", value: "All" },
  { text: "Delivery Challan", value: "Delivery Challan" },
  { text: "Return Challan", value: "RM Challan" },
  { text: "Scrape Challan", value: "Scrape Challan" },
];

export default WoViewChallan;
