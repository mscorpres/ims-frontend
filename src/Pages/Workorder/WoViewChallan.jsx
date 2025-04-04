import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button, Modal, Form } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SelectChallanTypeModal from "./components/WoCreateChallan/SelectChallanTypeModal";
import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { Link } from "react-router-dom";
import { downloadCSV } from "../../Components/exportToCSV";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import {
  createWorkOrderShipmentChallan,
  downloadAllViewChallan,
  fetchReturnChallanDetails,
  getClientOptions,
  getReturnRowsInViewChallan,
  getScrapeInViewChallan,
  getViewChallan,
  getWorkOrderAnalysis,
  getdetailsOfReturnChallan,
  printreturnChallan,
} from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { DownloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import printFunction, {
  downloadExcel,
  downloadFunction,
} from "../../Components/printFunction";
import { responsiveArray } from "antd/es/_util/responsiveObserver";
import { Drawer } from "antd/es";
import MyButton from "../../Components/MyButton";
import { Navigate, useNavigate } from "react-router";
const WoViewChallan = () => {
  const [wise, setWise] = useState(wiseOptions[1].value);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
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
    // console.log("for proitn", row);
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
      // console.log("console.log(response);", arr);
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
      // console.log(response);
      setLoading(false);
    } else {
      setLoading("fetch");
      const response = await imsAxios.post("/wo_challan/printScrapChallan", {
        challan_id: row.challan_id,
        ref_id: "--",
      });
      downloadFunction(response.data.data.buffer.data, row.challan_id);
      // console.log(response);
      setLoading(false);
    }
  };

  const cancelwochallan = async (f) => {
    const values = await cancelform.validateFields();
    console.log("here", values);
    try {
      setLoading("select" / "fetch");
      console.log("challanoptions", challanoptions);
      console.log("cancelRemark", cancelRemark);
      console.log("f", f);
      let link;
      // return;
      if (challantype === "Scrape Challan" || f.challan_type == "scrape") {
        link = "/wo_challan/woScrapChallanCancel";
      }
      const response = await imsAxios.post(
        link,
        {
          // wo_id: woid,
          challan_id: f.challan_id,
          remark: values.remark,
        }
        // const response = await imsAxios.post(
        //   challantype === "Delivery Challan"
        //     ? "wo_challan/woDeliveryChallanCancel"
        //     : "wo_challan/woReturnChallanCancel",
        //   {
        //     wo_id: woid,
        //     challan_id: cid,
        //     remark: cancelRemark,
        //   }
      );
      console.log("response", response);
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
  console.log("allChallanType", allChallanType);

  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",

    getActions: ({ row }) =>
      challantype === "Scrape Challan"
        ? [
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
                // setViewChallan/(row);
                setScrapeChallan(row.challan_id);
                // printwoChallan(row);
              }}
              label="Edit"
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
            <GridActionsCellItem
              showInMenu
              // disabled={loading
              onClick={() => {
                setDetailData(row);
                showSubmitConfirmationModal(row);
              }}
              label="Cancel Challan"
            />,
            <GridActionsCellItem
            showInMenu
            label={
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/warehouse/e-way/scrape-wo/${row.challan_id.replaceAll("/", "_")}`}
                target="_blank"
              >
                Create E-Way Bill
              </Link>
            }
          />,
          ]
        : challantype === "RM Challan"
        ? [
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                setViewChallanData([]);
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
            <GridActionsCellItem
            showInMenu
            label={
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/warehouse/e-way/wo/${row.challan_id.replaceAll("/", "_")}`}
                target="_blank"
              >
                Create E-Way Bill
              </Link>
            }
          />,
          ]
        : row.challan_type == "scrape"
        ? [
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
                // setViewChallan/(row);
                setScrapeChallan(row.challan_id);
                // printwoChallan(row);
              }}
              label="Edit"
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
            <GridActionsCellItem
              showInMenu
              // disabled={loading
              onClick={() => {
                setDetailData(row);
                showSubmitConfirmationModal(row);
              }}
              label="Cancel Challan"
            />,
            <GridActionsCellItem
            showInMenu
            label={
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/warehouse/e-way/scrape-wo/${row.challan_id.replaceAll("/", "_")}`}
                target="_blank"
              >
                Create E-Way Bill
              </Link>
            }
          />,
          ]
        : [
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
            <GridActionsCellItem
            showInMenu
            label={
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/warehouse/e-way/wo/${row.challan_id.replaceAll("/", "_")}`}
                target="_blank"
              >
                Create E-Way Bill
              </Link>
            }
          />,
          ],
          
  };

  const getRows = async () => {
    // challantype

    getAllRows(challantype);
    return;
    if (challantype === "Delivery Challan") {
      getDeliveryRows();
    } else if (challantype === "RM Challan") {
      getReturnRows();
    } else {
      //scapre challan added
      getScrapeRows();
    }
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
  // console.log("allChallanType", allChallanType);
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
      let arr = [];
      if (allChallanType) {
        console.log("here");
        setViewChallanData([]);
      }
    }
  }, [allChallanType]);

  useEffect(() => {
    if (searchInput) {
      getAllRows(challantype);
    }
  }, [searchInput]);

  return (
    <>
      <div style={{ height: "90%", paddingRight: 10, paddingLeft: 10 }}>
        <Col span={24}>
          <Row>
            <Col>
              <div
                style={{
                  paddingBottom: "10px",
                  paddingTop: "10px",
                  paddingLeft: "2px",
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
                  {/* {wise === wiseOptions[2].value && (
                    <div style={{ width: 270 }}>
                      <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                  )} */}

                  <MyButton
                    variant="search"
                    onClick={() => getAllRows(challantype)}
                    loading={loading === "fetch"}
                    type="primary"
                  >
                    Fetch
                  </MyButton>
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
          {/* {challantype === "Scrape Challan" ? (
            <MyDataTable
              loading={loading === "fetch"}
              data={rows}
              columns={[actionColumn, ...scrapeColumns]}
            />
          ) : (
            <MyDataTable
              loading={loading === "fetch"}
              data={rows}
              columns={[actionColumn, ...columns]}
            />

          )} */}
          <MyDataTable
            loading={loading === "fetch"}
            data={rows}
            columns={[actionColumn, ...allColm]}
          />
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
        // centered
        // confirmLoading={submitLoading}
        open={viewChallan}
        onClose={() => closeDrawer()}
        width={950}
        // width={450}
        // title="Map Invoice"
        // placement="right"
        // onClose={setViewChallan}
        // open={viewChallan}
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
    headerName: "#",
    field: "id",
    width: 30,
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
    minWidth: 220,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.client} />,
  },
  {
    headerName: "Client Code",
    field: "client_code",
    minWidth: 80,
    flex: 1,
  },
  {
    headerName: "Delivery Challan Date",
    field: "delivery_challan_dt",
    minWidth: 130,
    flex: 1,
  },
  {
    headerName: "Item Name",
    field: "item_name",
    minWidth: 250,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.item_name} />,
  },
  {
    headerName: "Item Qty",
    field: "item_qty",
    minWidth: 100,
    flex: 1,
  },
  {
    headerName: "Item Rate",
    field: "item_rate",
    minWidth: 100,
    flex: 1,
  },
  {
    headerName: "Item Value",
    field: "item_value",
    minWidth: 100,
    flex: 1,
  },

  {
    headerName:"Eway Bill Status",
    field:"ewaybillStatus",
    minWidth:250,
    flex:1,
  },

  {
    headerName:"Eway Bill Number",
    field:"ewaybill_no",
    minWidth:250,
    flex:1,
  }

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
