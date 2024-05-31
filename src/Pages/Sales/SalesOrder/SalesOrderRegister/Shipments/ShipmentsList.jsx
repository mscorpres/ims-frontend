import { useEffect, useState } from "react";
import MyDatePicker from "../../../../../Components/MyDatePicker";
import { Col, Form, Input, Modal, Row, Space, Card } from "antd";
import useApi from "../../../../../hooks/useApi.ts";
import {
  cancelChallanFromSo,
  createChallanFromSo,
  listOfShipment,
} from "../../../../../api/sales/salesOrder";
import MyDataTable from "../../../../gstreco/myDataTable";
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
import {
  convertSelectOptions,
  getStringDate,
} from "../../../../../utils/general.ts";
import { getClientsOptions } from "../../../../../api/finance/clients";
import MyButton from "../../../../../Components/MyButton";
import { useNavigate } from "react-router-dom";

const initialValues = {
  data: getStringDate("month"),
  wise: "datewise",
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [createRemark, setCreateRemark] = useState("");
  const { executeFun, loading } = useApi();
  const [ModalForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [showCreateshipment, setShowCreateShipment] = useState();
  const wise = Form.useWatch("wise", filterForm);
  const selectedData = Form.useWatch("data", filterForm);
  const navigate = useNavigate();
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
          billingId: row.billing_name,
          billingAddress: row.billingaddress,
          client: row.client,
          clientAddressId: row.client_add_id,
          clientCode: row.client_code,
          clientAddress: row.clientaddress,
          challanStatus: row.del_challan_status,
          date: row.shipment_dt,
          shipmentId: row.shipment_id,
          soId: row.so_id,
          status: row.shipment_status === "A" ? "Active" : "Close",
          shippingId: row.shipping_id,
          shippingAddress: row.shippingaddress,
          // orderId: row.so_id,
          itemPartNo: row.item_part_no,
          itemName: row.item_name,
          itemQty: row.item_qty,
          itemRate: row.item_rate,
        }));

        setRows(arr);
      }
    }
  };
  const sendUpdate = (row) => {
    setUpdateShipmentRow(row.shipment_id);
  };

  const createChallan = async (singleRow) => {
    Modal.confirm({
      title: "Are you sure you want to create this Invoice?",
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
      title: "Are you sure you want to cancel this Shipment?",
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
    ModalForm.resetFields();
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
    if (updateShipmentRow) {
      // console.log("here", updateShipmentRow);
      navigate(
        `/sales/order/createShipment/edit:${updateShipmentRow
          ?.replaceAll("-", "=")
          .replaceAll("/", "_")}`
      );
    }
  }, [updateShipmentRow]);

  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) =>
      row.del_challan_status === "Y"
        ? [
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                sendUpdate(row);
              }}
              label="Update"
            />,
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                setShowDetails(row);
              }}
              label="View"
            />,

            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                cancelShipment(row);
              }}
              label="Cancel Shipment"
            />,
          ]
        : [
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                sendUpdate(row);
                // navigate(
                //   `/sales/order/createShipment/edit:${row?.shipment_id
                //     ?.replaceAll("-", "=")
                //     .replaceAll("/", "_")}`
                // );
              }}
              label="Update"
            />,
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                setShowDetails(row);
              }}
              label="View"
            />,
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                createChallan(row);
              }}
              label="Create Invoice"
            />,
            <GridActionsCellItem
              showInMenu
              // disabled={loading}
              onClick={() => {
                cancelShipment(row);
              }}
              label="Cancel Shipment"
            />,
          ],
  };
  useEffect(() => {
    if (wise === "so_id_wise" || wise === "clientwise") {
      filterForm.setFieldValue("data", "");
    } else if (wise === "datewise") {
      filterForm.setFieldValue("data", getStringDate("month"));
    }
  }, [wise]);

  return (
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Col span={4}>
        <Card size="small" title="Filters">
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
              {wise === "datewise" && selectedData !== "" && (
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
          <Row gutter={[0, 6]} justify="end">
            <Col>
              <Space>
                <CommonIcons
                  action="downloadButton"
                  onClick={handleExcelDownload}
                />
                <MyButton
                  variant="search"
                  loading={loading("fetch")}
                  onClick={getRows}
                />
              </Space>
            </Col>
            {wise === "clientwise" && (
              <Col>
                <Space>
                  <MyButton
                    disabled={selectedRows.length === 0}
                    onClick={() => createChallan()}
                    variant="add"
                    text="Create Shipment"
                    type="default"
                  />
                </Space>
              </Col>
            )}
          </Row>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading("fetch")}
          columns={[actionColumn, ...columns]}
          data={rows}
          checkboxSelection={wise === "clientwise"}
          isRowSelectable={(params) => params.row.del_challan_status === "N"}
          onSelectionModelChange={(newSelectionModel) => {
            setSelectedRows(newSelectionModel);
          }}
        />
      </Col>
      {showCreateshipment && (
        <CreateShipment
          open={updateShipmentRow?.shipment_id}
          setUpdateShipmentRow={setUpdateShipmentRow}
          updateShipmentRow={updateShipmentRow}
          hide={() => setUpdateShipmentRow(null)}
        />
      )}
      <ShipmentDetails open={showDetails} hide={() => setShowDetails(null)} />
    </Row>
  );
}

export default ShipmentsList;
const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Shipment Id",
    width: 150,
    field: "shipmentId",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.shipmentId} copy={true} />
    ),
  },
  {
    headerName: "SO Id",
    width: 150,
    field: "soId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.soId} copy={true} />,
  },
  {
    headerName: "Item Part Code",
    // minWidth: 120,
    width: 130,
    field: "itemPartNo",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.itemPartNo} copy={true} />
    ),
  },
  {
    headerName: "Item Part Name",
    // minWidth: 120,
    width: 300,
    field: "itemName",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.itemName} copy={true} />
    ),
  },
  {
    headerName: "Item Qty",
    // minWidth: 120,
    width: 100,
    field: "itemQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.itemQty} />,
  },
  {
    headerName: "Item Rate",
    // minWidth: 120,
    width: 130,
    field: "itemRate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.itemRate} />,
  },
  {
    headerName: "Shipment Date",
    width: 150,
    field: "date",
  },

  {
    headerName: "Client Code",
    width: 120,
    field: "clientCode",
    renderCell: ({ row }) => <ToolTipEllipses text={row.clientCode} />,
  },
  {
    headerName: "Client",
    width: 150,
    field: "client",
    renderCell: ({ row }) => <ToolTipEllipses text={row.client} />,
  },

  {
    headerName: "Client Address",
    width: 200,
    field: "clientAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.clientAddress} />,
  },
  {
    headerName: "Billing Name",
    width: 120,
    field: "billingId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingId} />,
  },
  {
    headerName: "Billing Address",
    width: 200,
    field: "billingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingAddress} />,
  },

  {
    headerName: "Shipping Name",
    width: 150,
    field: "shippingId",
  },
  {
    headerName: "Shipping Address",
    width: 200,
    field: "shippingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
  },
  // {
  //   headerName: "Invoice Created",
  //   width: 100,
  //   field: "challanStatus",
  // },
  {
    headerName: "Status",
    width: 80,
    field: "status",
  },
];
