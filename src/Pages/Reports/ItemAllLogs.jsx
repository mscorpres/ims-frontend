//updated code
import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Pagination,
  Modal,
  Divider,
} from "antd"; // CHANGE: Added Pagination
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import socket from "../../Components/socket";
import { toast } from "react-toastify";
// CHANGE: Removed MyDatePicker import as date range is no longer needed
// import MyDatePicker from "../../Components/MyDatePicker";
import { FileImageOutlined } from "@ant-design/icons";
import ComponentImages from "../Master/Components/material/ComponentImages";
import useApi from "../../hooks/useApi.ts";
import { getComponentOptions } from "../../api/general.ts";
import MyButton from "../../Components/MyButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu as MuiMenu, MenuItem } from "@mui/material";

export default function ItemAllLogs() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [summaryData, setSummaryData] = useState([
    { title: "Component", description: "" },
    // { title: "Closing Stock", description: "" },
    { title: "Last In (Date)", description: "" },
    { title: "Last Rate", description: "" },
  ]);
  const [showImages, setShowImages] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();

  // CHANGE: Added pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [contextMenu, setContextMenu] = useState({ anchor: null, row: null });
  const [cancelReqRow, setCancelReqRow] = useState(null);
  const [cancelRemark, setCancelRemark] = useState("");
  const [cancelReqLoading, setCancelReqLoading] = useState(false);

  // initializing search form
  const [searchForm] = Form.useForm();
  const selectedComonents = Form.useWatch("component", searchForm);

  //getting components options
  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select",
    );
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

  // CHANGE: Updated getRows function to accept page and limit parameters
  const getRows = async (values, page = 1, limit = pageSize) => {
    setLoading("fetch");
    setSummaryData([
      { title: "Component", description: "" },
      // { title: "Closing Stock", description: "" },
      { title: "Last In (Date)", description: "" },
      { title: "Last Rate", description: "" },
    ]);
    setRows([]);

    // CHANGE: Send filters as query params
    const response = await imsAxios.get("/q1/view", {
      params: {
        wise: "C",
        data: values.component,
        page: page,
        limit: limit,
      },
    });
    console.log(response);
    setLoading(false);

    if (response.success) {
      // CHANGE: Updated to use serial_no from backend instead of index
      const arr = response.data.body.map((row) => ({
        index: row.serial_no, // CHANGED: Use serial_no from backend
        id: v4(),
        ...row,
      }));
      setRows(arr);

      // CHANGE: Updated pagination state from response
      if (response.data.pagination) {
        setCurrentPage(response.data.pagination.currentPage);
        setTotalRecords(response.data.pagination.totalRecords);
      }

      setSummaryData([
        { title: "Component", description: response.data.header.partName },
        { title: "Part Code", description: response.data.header.partCode },
        { title: "Unique Id", description: response.data.header.uniqueID },
        // {
        //   title: "Closing",
        //   description:
        //     data.response.data1.closingqty + " " + data.response.data1.uom,
        // },
        {
          title: "Last In (Date)",
          description: response.data.header.lastIN ?? "--",
        },
        { title: "Last Rate", description: response.data.header.lastRate },
      ]);
    }
  };

  // CHANGE: Added pagination change handler
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    const values = searchForm.getFieldsValue();
    getRows(values, page, pageSize);
  };

  // CHANGE: Added function to handle initial form submission
  const handleFormSubmit = (values) => {
    setCurrentPage(1); // Reset to first page on new search
    getRows(values, 1, pageSize);
  };

  const handleDownloadReport = async () => {
    try {
      const values = await searchForm.validateFields(["component"]);
      const newId = v4();
      // let arr = notifications;
      // arr = [{ notificationId: newId, loading: true, type: "file" }, ...arr];
      // dispatch(setNotifications(arr));

      setDownloadLoading(true);
      socket.emit("q1Report", {
        partcode: values.component,
        searchBy: "C",
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


  const handleCancelRequest = async () => {
    if (!cancelRemark.trim()) {
      toast.error("Please enter a remark for the cancellation request");
      return;
    }
    const payload = {
      transactionNo: cancelReqRow?.transactionID,
      reason: cancelRemark,
      transType: cancelReqRow?.transactionType,
    };
    setCancelReqLoading(true);
    try {
      const response = await imsAxios.post("/cancelRequest/raise", payload);

      if (response.data?.status === "success") {
        toast.success(response.data?.message?.msg ?? "Cancellation request submitted");
        setCancelReqRow(null);
        setCancelRemark("");
      } else {

        toast.error(response.data?.message?.msg ?? "Error submitting cancellation request");
      }
    } catch (error) {
      toast.error(error.message ?? "Error submitting cancellation request");
    } finally {
      setCancelReqLoading(false);
    }
  };

  // columns
  let columns = [
    {
      headerName: "Actions",
      field: "actions",
      width: 120,
      renderCell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => setContextMenu({ anchor: e.currentTarget, row })}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      headerName: "#",
      field: "serialNo",
      width: 80,
    },

    {
      headerName: "Date",
      field: "transactionDate",
      width: 120,
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
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transactionID} copy={true} />
      ),
    },
    {
      headerName: "In Qty",
      field: "qtyIn",
      width: 120,
    },
    {
      headerName: "Out Qty",
      field: "qtyOut",
      width: 120,
    },
    // {
    //   headerName: "In Rate",
    //   field: "inRate",
    //   width: 120,
    // },
    // {
    //   headerName: "Out Rate",
    //   field: "outRate",
    //   width: 120,
    // },
    // {
    //   field: "weightedPurchaseRate",
    //   headerName: "Weighted Average Rate",
    //   width: 180,
    // },
    {
      headerName: "Rate",
      field: "rate",
      width: 120,
    },
    {
      headerName: "Weighted Average Rate",
      field: "tbl_weighted_rate",
      width: 180,
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
  ];

  return (
    <Row gutter={6} style={{ padding: "0px 5px", height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <Col span={4} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
              {/* CHANGE: Updated Form onFinish to use new handler */}
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

                  {/* CHANGE: Removed Date Range Field */}
                  {/* <Col span={24}>
                    <Form.Item
                      label="Date Range"
                      rules={rules.date}
                      name="date"
                    >
                      <MyDatePicker
                        setDateRange={(value) =>
                          searchForm.setFieldValue("date", value)
                        }
                        size="default"
                      />
                    </Form.Item>
                  </Col> */}

                  <Col span={24}>
                    <Row gutter={6}>
                      <Space>
                        <MyButton
                          variant="search"
                          loading={loading === "fetch"}
                          block
                          htmlType="submit"
                          type="primary"
                        >
                          Fetch
                        </MyButton>

                        <CommonIcons
                          disabled={
                            !selectedComonents ||
                            downloadLoading ||
                            rows.length === 0
                          }
                          onClick={handleDownloadReport}
                          action="downloadButton"
                        />
                        <Button
                          type="primary"
                          shape="circle"
                          disabled={!selectedComonents}
                          icon={<FileImageOutlined />}
                          onClick={() => {
                            setShowImages({
                              partNumber: selectedComonents,
                            });
                          }}
                        />
                      </Space>
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
        </Row>
      </Col>
      <Col span={20}>
        {/* CHANGE: Wrapped MyDataTable with pagination */}
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

          {/* CHANGE: Added Pagination Component */}
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

      <MuiMenu
        anchorEl={contextMenu.anchor}
        open={Boolean(contextMenu.anchor)}
        onClose={() => setContextMenu({ anchor: null, row: null })}
      >
        <MenuItem
          onClick={() => {
            setCancelReqRow(contextMenu.row);
            setContextMenu({ anchor: null, row: null });
          }}
        >
          Cancellation Request
        </MenuItem>
      </MuiMenu>

      <Modal
        title={`Cancellation Request - Transaction # ${cancelReqRow?.transactionID}`}
        open={!!cancelReqRow}
        onOk={handleCancelRequest}
        confirmLoading={cancelReqLoading}
        onCancel={() => {
          setCancelReqRow(null);
          setCancelRemark("");
        }}
        okText="Submit Request"
        cancelText="Cancel"
      >
        <Divider />
        <p>
          Are you sure you want to request cancellation for transaction{" "}
          <strong>{cancelReqRow?.transactionID}</strong>?
        </p>
        <Form.Item label="Remark" required style={{ marginTop: 16 }}>
          <Input.TextArea
            rows={3}
            placeholder="Enter reason for cancellation request..."
            value={cancelRemark}
            onChange={(e) => setCancelRemark(e.target.value)}
          />
        </Form.Item>
        <Divider />
      </Modal>
    </Row>
  );
}

// initial form values
const initialValues = {
  component: "",
  // date: "", // CHANGE: Removed date from initial values
};

// form rules
const rules = {
  component: [{ required: true, message: "Please select a component" }],
  // date: [{ required: true, message: "Please select a date range" }], // CHANGE: Removed date validation
};
