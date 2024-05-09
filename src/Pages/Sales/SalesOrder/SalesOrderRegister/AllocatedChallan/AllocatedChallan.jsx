import { Space, Row, Form, Card, Col, Modal } from "antd";
import React, { useState } from "react";
import MyDatePicker from "../../../../../Components/MyDatePicker";
import {
  getChallanList,
  getCourierList,
} from "../../../../../api/sales/salesOrder";
import useApi from "../../../../../hooks/useApi.ts";
import MyDataTable from "../../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import { downloadCSV } from "../../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ChallanDetails from "../Challan/ChallanDetails.jsx";
import MySelect from "../../../../../Components/MySelect.jsx";
import MyButton from "../../../../../Components/MyButton/index.jsx";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect.jsx";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import {
  getClientsOptions,
  getCourierOptions,
} from "../../../../../api/finance/clients.js";
import { imsAxios } from "../../../../../axiosInterceptor.tsx";
import { ExclamationCircleOutlined } from "@ant-design/icons";


const initialValues = {
  data: "",
  wise: "clientwise",
};


function AllocatedChallan() {
  const [showDetails, setShowDetails] = useState(null);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [filterForm] = Form.useForm();
  const wise = Form.useWatch("wise", filterForm);

  const { executeFun, loading } = useApi();

  const getRows = async () => {
    const values = await filterForm.validateFields();
    const response = await executeFun(() => getCourierList(values), "fetch");
    const { data } = response;
    setRows(data);
  };

  const handleExcelDownload = () => {
    downloadCSV(rows, columns, "SO Challan Report");
  };

  const handleCourierOptions = async (search) => {
    const response = await executeFun(
      () => getCourierOptions(search),
      "select"
    );
    let arr = [];
    // console.log("res", response);
    if (response.success) {
      arr = convertSelectOptions(response.data, "text", "value");
    }
    setAsyncOptions(arr);
  };

  const allocatingChallan = async (row) => {
    // console.log("row", row);
    const response = await imsAxios.post(
      "/so_challan_shipment/allocateCourier",
      {
        invoice_no: row.challanId,
        courier_name: row.clientCode,
      }
    );
    // console.log("response", response);
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
          setShowDetails(row?.challanId);
        }}
        label="View"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          createAllocation(row);
        }}
        label="Allocate"
      />,
    ],
  };

  return (
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Col span={4}>
        <Card size="small" title="Filters">
          <Form
            form={filterForm}
            layout="vertical"
            initialValues={initialValues}
          >
            <Form.Item
              name="courier"
              label="Courier"
              rules={[
                {
                  required: true,
                  message: "Please Enter Courier Name!",
                },
              ]}
            >
              <MyAsyncSelect
                optionsState={asyncOptions}
                loadOptions={handleCourierOptions}
                onBlur={() => setAsyncOptions([])}
                selectLoading={loading("select")}
              />
            </Form.Item>
          </Form>
          <Row justify="end">
            <Space>
              {/* <CommonIcons
                action="downloadButton"
                onClick={handleExcelDownload}
              /> */}
              <MyButton
                variant="search"
                loading={loading("fetch")}
                onClick={getRows}
              />
            </Space>
          </Row>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading("fetch")}
          columns={[actionColumn, ...columns]}
          data={rows}
        />
      </Col>
      <ChallanDetails open={showDetails} hide={() => setShowDetails(null)} />
    </Row>
  );
}

export default AllocatedChallan;
const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Courier Name",
    flex: 1,
    field: "courierName",
  },

  {
    headerName: "Delivery Challan Date",
    minWidth: 200,
    flex: 1,
    field: "deliveryChallanDt",
    renderCell: ({ row }) => <ToolTipEllipses text={row.deliveryChallanDt} />,
  },
  {
    headerName: "So Challan Id",
    minWidth: 200,
    flex: 1,
    field: "soChallanId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.soChallanId} />,
  },
  {
    headerName: "Billing Address",
    flex: 1,
    field: "billingaddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingaddress} />,
  },

  {
    headerName: "Client Address",
    flex: 1,
    field: "clientaddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.clientaddress} />,
  },

  {
    headerName: "Shipping Address",
    flex: 1,
    field: "shippingaddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
  },
];
