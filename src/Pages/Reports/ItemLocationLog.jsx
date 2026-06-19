import { useState } from "react";
import {
  Tooltip,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Pagination,
  Row,
  Typography,
} from "antd";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios, getSessionFromStorage } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import socket from "../../Components/socket";
import { getComponentOptions } from "../../api/general.ts";
import useApi from "../../hooks/useApi.ts";
import MyButton from "../../Components/MyButton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../Features/loginSlice/loginSlice";
const initialSummaryData = [
  { title: "Component", description: "--" },
  { title: "Part Code", description: "--" },
  // { title: "Opening", description: "--" },
  {
    title: "Closing",
    description: "--",
  },
  {
    title: "Last In (Date)",
    description: "--",
  },
  { title: "Last Rate", description: "--" },
  { title: "Last Vendor", description: "--" },
  { title: "Last Entry By", description: "--" },
  { title: "Last Entry Date", description: "--" },
  { title: "Last Remark", description: "--" },
];

export default function ItemLocationLog() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [bomDetails, setBomDetails] = useState([]);
  const [altDetails, setAltDetails] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [summaryData, setSummaryData] = useState(initialSummaryData);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.login);
  const { executeFun, loading: loading1 } = useApi();
  // initializing searh form
  const [searchForm] = Form.useForm();
  const selectedComponent = Form.useWatch("component", searchForm);
  const selectedLocation = Form.useWatch("location", searchForm);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);

  //getting components options
  const getComponentOption = async (search) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select",
    );
    getData(response);
  };

  // getting location options
  const getLocatonOptions = async (search) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };

  // getting data from response for setting async options for async select
  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    }
  };
  const getDetails = async (values) => {
    setLoading(true);
    const response = await imsAxios.post("/report/common/altpartDetails", {
      component: values.component,
      location: values.location,
    });
    const { data } = response;
    if (response.success) {
      setAltDetails(data);
      setLoading(false);
    }
    setLoading(false);
  };
  // getting rows
  const getRows = async (values, page = 1, limit = pageSize) => {
    try {
      setLoading("fetch");
      setSummaryData(initialSummaryData);
      setRows([]);

      const response = await imsAxios.get("/q2/view", {
        params: {
          location: values.location,
          key: values.component,
          page,
          limit,
        },
      });
      getDetails(values);
      const payload =
        response?.data?.header || response?.data?.body
          ? response
          : response?.data;

      if (payload?.status === "error") {
        toast.error(payload?.message?.msg || payload?.message);
        setLoading(false);
        return;
      }

      const header = payload?.data?.header;
      const body = payload?.data?.body ?? [];
      const bomDetails = header?.bomDetails ?? payload?.data?.bom_details ?? {};

      if (payload) {
        if (payload?.success || payload?.status === "success" || payload?.code === 200) {
          const arr = body.map((row) => ({
            index: row.serialNo,
            id: v4(),
            qtyInRate: row.qtyInRate ?? "-",
            weightedPurchaseRate: row.weightedPurchaseRate ?? "-",
            weightedPurchaseRateCurrency:
              row.weightedPurchaseRateCurrency ?? "-",
            ...row,
          }));
          let bomDetailsArr = [];
          for (const key in bomDetails) {
            // console.log("key", key);
            // console.log("bomDetails", bomDetails);
            let obj = {
              // product: key[0].product,
              sku: key,
              bom: bomDetails[key].map((row) => ({
                name: row.bom_name,
                qty: row.bom_qty,
              })),
              product: bomDetails[key].map((row) => row.product),
            };
            bomDetailsArr = [...bomDetailsArr, obj];
          }
          // console.log("bomDetailsArr", bomDetailsArr);
          setBomDetails(bomDetailsArr);
          setRows(arr);
          if (payload?.pagination) {
            setCurrentPage(payload.pagination.currentPage);
            setPageSize(payload.pagination.limit);
            setTotalRecords(payload.pagination.totalRecords);
          }
          setSummaryData([
            { title: "Component", description: header?.partName ?? "--" },
            { title: "Part Code", description: header?.partNo ?? "--" },
            { title: "Attribute Code", description: header?.uniqueID ?? "--" },
            { title: "MFG Code", description: header?.mfgCode },
            // {
            //   title: "Opening",
            //   description: header.openingBalance + " " + header.uom,
            // },
            {
              title: "Closing",
              description: `${header?.closingqty ?? "--"} ${header?.uom ?? ""}`,
            },
            {
              title: "Last In (Date)",
              description: header?.lastInDate ?? "--",
            },
            { title: "Last Rate", description: header?.lastRate ?? "--" },
            { title: "Last Vendor", description: header?.lastVendor ?? "--" },
            { title: "Last Entry By", description: header?.lastEntryBy ?? "--" },
            {
              title: "Last Entry Date",
              description: header?.lastEntryDate ?? "--",
            },
            { title: "Last Remark", description: header?.lastRemark ?? "--" },
          ]);
        } else {
          setBomDetails([]);
          setRows([]);
          setSummaryData(initialSummaryData);
          setTotalRecords(0);
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message?.msg ||
          error?.message ||
          "Error fetching item location log",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, limit) => {
    setCurrentPage(page);
    setPageSize(limit);
    getRows(searchForm.getFieldsValue(), page, limit);
  };

  const handleFormSubmit = (values) => {
    setCurrentPage(1);
    getRows(values, 1, pageSize);
  };

  const handleDownloadReport = async () => {
    try {
      const values = await searchForm.validateFields(["component", "location"]);
      const newId = v4();
      // let arr = notifications;
      // arr = [{ notificationId: newId, loading: true, type: "file" }, ...arr];
      // dispatch(setNotifications(arr));

      setDownloadLoading(true);
      socket.emit("q2Report", {
        location: values.location,
        component: values.component,
        session: getSessionFromStorage(),
        notificationId: newId,
      });
      toast.success(
        "Item Location Log report generation started. You will be notified when it is ready.",
      );
    } catch (error) {
      if (error?.errorFields) return;
      toast.error("Error initiating report generation");
    } finally {
      setDownloadLoading(false);
    }
  };

  // columns
  let columns = [
    {
      headerName: "#",
      field: "index",
      width: 30,
    },
    {
      headerName: "Date",
      field: "transactionDate",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.transactionDate} />,
    },
    {
      headerName: "Type",
      field: "transactionType",
      width: 30,
      renderCell: ({ row }) => (
        <div
          style={{
            height: "15px",
            width: "15px",
            borderRadius: "50px",
            backgroundColor:
              row.transactionType === "CONSUMPTION"
                ? "#678983"
                : row.transactionType === "INWARD"
                  ? "#59CE8F"
                  : row.transactionType === "TRANSFER"
                    ? "#FFB100"
                    : row.transactionType === "ISSUE"
                      ? "#DD5353"
                      : row.transactionType === "JOBWORK"
                        ? "#DD5353"
                        : row.transactionType === "CONVERSION"
                          ? "#ff9bb9"
                          : row.transactionType === "CANCELLED" && "#36454F",
          }}
        />
      ),
    },
    {
      headerName: "Transaction",
      field: "transactionID",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transactionID} copy={true} />
      ),
    },
    {
      headerName: "Qty In",
      field: "qtyIn",
      width: 120,
    },
    {
      headerName: "Qty Out",
      field: "qtyOut",
      width: 120,
    },
    // {
    //   headerName: "Qty In Rate",
    //   field: "qtyInRate",
    //   width: 120,
    // },
    // {
    //   headerName: "Out Rate",
    //   field: "outRate",
    //   width: 120,
    // },
    {
      headerName: "Rate",
      field: "rate",
      width: 120,
    },
    // {
    //   headerName: "Weighted Average Rate",
    //   field: "weightedPurchaseRate",
    //   width: 120,
    //   renderCell: ({ row }) => (
    //     <Tooltip title={row.weightedPurchaseRateCurrency}>
    //       {row.weightedPurchaseRate}
    //     </Tooltip>
    //   ),
    // },
    {
      headerName: "Weighted Average Rate",
      field: "tbl_weighted_rate",
      width: 120,
    },
    {
      headerName: "Method",
      field: "transactionMode",
      width: 120,
    },
    {
      headerName: "Loc In",
      field: "locationIn",
      width: 120,
    },
    {
      headerName: "Loc Out",
      field: "locationOut",
      width: 120,
    },
    {
      headerName: "Doc Type",
      field: "vendorType",
      width: 120,
    },
    {
      headerName: "Vendor",
      field: "vendorName",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendorName} />,
    },
    {
      headerName: "Vendor Code",
      field: "vendorCode",
      minWidth: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendorCode} copy={true} />
      ),
    },
    {
      headerName: "Created/Approved By",
      field: "transactionBy",
      minWidth: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.transactionBy} />,
    },
    {
      headerName: "Remark",
      field: "remark",
      width: 400,
    },
  ];

  return (
    <Row gutter={6} style={{ padding: "0px 5px", height: "90%" }}>
      <Col span={4} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
              <Form
                onFinish={handleFormSubmit}
                form={searchForm}
                initialValues={initialValues}
                layout="vertical"
              >
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label="Component"
                      rules={rules.component}
                      name="component"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getComponentOption}
                        optionsState={asyncOptions}
                        selectLoading={loading1("select")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Location"
                      rules={rules.location}
                      name="location"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getLocatonOptions}
                        optionsState={asyncOptions}
                        selectLoading={loading === "select"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={6}>
                      <Col span={20}>
                        <MyButton
                          variant="search"
                          loading={loading === "fetch"}
                          htmlType="submit"
                          block
                          type="primary"
                        >
                          Fetch
                        </MyButton>
                      </Col>
                      <Col span={4}>
                        <CommonIcons
                          disabled={
                            !selectedComponent ||
                            !selectedLocation ||
                            downloadLoading || rows.length === 0
                          }
                          onClick={handleDownloadReport}
                          action="downloadButton"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col span={24}>
            <SummaryCard
              title="Component Stock"
              loading={loading === "fetch"}
              summary={summaryData}
            />
          </Col>
          <Col style={{ height: "100%", overflow: "auto" }} span={24}>
            <Card title="BOM Details" size="small">
              <Collapse>
                {bomDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.product} | ${row.sku} | BOM Count : ${row.bom.length}`}
                    key={row.key}
                  >
                    {row.bom?.length === 0 && (
                      <Row key={row.name} justify="space-between">
                        <Col>
                          <Typography.Text
                            style={{ fontSize: "0.8rem" }}
                            type="secondary"
                          >
                            No BOM found for this SKU
                          </Typography.Text>
                        </Col>
                      </Row>
                    )}
                    {row.bom?.length &&
                      row.bom?.map((bom) => (
                        <Row key={row.name} justify="space-between">
                          <Col>
                            <Typography.Text
                              style={{ fontSize: "0.8rem" }}
                              strong
                            >
                              BOM: {bom.name}
                            </Typography.Text>
                          </Col>
                          <Col>
                            <Typography.Text
                              style={{ fontSize: "0.8rem" }}
                              strong
                            >
                              Qty: {bom.qty}
                            </Typography.Text>
                          </Col>
                          <Divider style={{ margin: 5 }} />
                        </Row>
                      ))}
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Card>
            <Card title="Similar Components" size="small">
              <Collapse loading={loading}>
                {altDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.partName} `}
                    key={row.partName}
                  >
                    {/* {altDetails?.length === 0 && (
                      <Row key={row.name} justify="space-between">
                        <Col>
                          <Typography.Text
                            style={{ fontSize: "0.8rem" }}
                            type="secondary"
                          >
                            No Data found.
                          </Typography.Text>
                        </Col>
                      </Row>
                    )} */}
                    {/* {altDetails &&
                      altDetails?.map((row) => ( */}
                    <Row key={row.partName} justify="space-between">
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Part: {row.partNo}
                        </Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Cat Part: {row.newPartNo}
                        </Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Closing: {row.closingQty + " " + row.uom}
                        </Typography.Text>
                      </Col>
                      <Divider style={{ margin: 5 }} />
                    </Row>
                    {/* // ))} */}
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={20}>
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div style={{ flex: 1, overflow: "auto" }}>
            <MyDataTable
              loading={loading === "fetch"}
              data={rows}
              columns={columns}
            />
          </div>
          {rows.length > 0 && (
            <div
              style={{
                padding: "16px",
                textAlign: "right",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalRecords}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
                pageSizeOptions={[10, 25, 50, 100, 200]}
                disabled={loading === "fetch"}
              />
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
}

// initial form values
const initialValues = {
  component: "",
  location: "",
};

// form rules
const rules = {
  component: [{ required: true, message: "Please select a component" }],
  location: [{ required: true, message: "Please select a location" }],
};
