import { Space, Row, Form, Card, Col, Modal, Divider } from "antd";
import React, { useState } from "react";
import MyDatePicker from "../../../../../Components/MyDatePicker";
import { getChallanList } from "../../../../../api/sales/salesOrder";
import useApi from "../../../../../hooks/useApi.ts";
import MyDataTable from "../../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import { downloadCSV } from "../../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ChallanDetails from "./ChallanDetails";
import MySelect from "../../../../../Components/MySelect";
import MyButton from "../../../../../Components/MyButton";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import {
  convertSelectOptions,
  getStringDate,
} from "../../../../../utils/general.ts";
import { imsAxios } from "../../../../../axiosInterceptor.tsx";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  getClientsOptions,
  getCourierOptions,
} from "../../../../../api/finance/clients.js";
import { toast } from "react-toastify";
import { useEffect } from "react";

const wiseOptions = [
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Client Wise",
    value: "clientwise",
  },
];

const initialValues = {
  data: getStringDate("month"),
  wise: "datewise",
};

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
function Challan() {
  const [showDetails, setShowDetails] = useState(null);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [createAllocation, setCreateAllocation] = useState(false);
  const [filterForm] = Form.useForm();
  const [ModalForm] = Form.useForm();
  const wise = Form.useWatch("wise", filterForm);
  const selectedData = Form.useWatch("data", filterForm);

  const { executeFun, loading } = useApi();

  const getRows = async () => {
    const values = await filterForm.validateFields();
    const response = await executeFun(
      () => getChallanList(values.wise, values.data),
      "fetch"
    );
    const { data } = response;
    setRows(data);
  };
  const handleCourierOptions = async (search) => {
    const response = await executeFun(
      () => getCourierOptions(search),
      "select"
    );
    let arr;
    if (response.success == true) {
      // console.log("response.data", response.data);
      // let arr = response.data.map((r) => {
      //   return { id: r.value, text: r.text };
      // });
      arr = convertSelectOptions(response.data, "text", "value");
      // console.log("arr---", arr);
    }
    setAsyncOptions(arr);
  };
  const handleExcelDownload = () => {
    downloadCSV(rows, columns, "SO Challan Report");
  };

  const handleFetchClientOptions = async (search) => {
    const response = await executeFun(
      () => getClientsOptions(search),
      "select"
    );
    let arr = [];
    // console.log("arr---", arr);
    if (response.success) {
      arr = convertSelectOptions(response.data.data, "name", "code");
    }
    // console.log("arr---", arr);
    setAsyncOptions(arr);
  };
  // const createAllocation = async (row) => {
  //   Modal.confirm({
  //     title: "Are you sure you want to allocate this Challan?",
  //     icon: <ExclamationCircleOutlined />,
  //     content: (
  //       <Form form={ModalForm} layout="vertical">
  //         <Form.Item
  //           name="courier"
  //           label="Select Courier"
  //           rules={[
  //             {
  //               required: true,
  //               message: "This field is required",
  //             },
  //           ]}
  //         >
  //           <MyAsyncSelect
  //             optionsState={asyncOptions}
  //             loadOptions={handleCourierOptions}
  //             onBlur={() => setAsyncOptions([])}
  //             selectLoading={loading("select")}
  //           />
  //         </Form.Item>
  //       </Form>
  //     ),
  //     okText: "Yes",
  //     cancelText: "No",
  //     onOk: async () => {
  //       await allocatingChallan(row);
  //     },
  //   });
  // };
  const allocatingChallan = async (row) => {
    // console.log("row", row);
    const values = await ModalForm.validateFields();
    // console.log("values", values);
    const response = await imsAxios.post(
      "/so_challan_shipment/allocateCourier",
      {
        invoice_no: row.challanId,
        courier_name: values.courier,
      }
    );
    if (response.success) {
      toast.success(response.message);
      reset();
    } else {
      toast.error(response.message);
    }
  };
  const reset = () => {
    ModalForm.resetFields();
    filterForm.resetFields();
    setCreateAllocation(false);
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
          setCreateAllocation(row);
        }}
        label="Allocate"
      />,
    ],
  };
  useEffect(() => {
    if (!createAllocation) {
      ModalForm.resetFields();
    }
  }, [createAllocation]);

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
              label={wise === "datewise" ? "Period" : "Client"}
            >
              {wise === "datewise" && selectedData !== "" && (
                <MyDatePicker
                  setDateRange={(value) =>
                    filterForm.setFieldValue("data", value)
                  }
                />
              )}
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
          <Row justify="end">
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
      {createAllocation && (
        <Modal
          open={createAllocation}
          onOk={() => allocatingChallan(createAllocation)}
          onCancel={() => setCreateAllocation(false)}
          title="Allocate this Challan"
        >
          <Form form={ModalForm} layout="vertical">
            <Divider />
            <Form.Item
              name="courier"
              label="Select Courier"
              rules={[
                {
                  required: true,
                  message: "This field is required",
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
        </Modal>
      )}
    </Row>
  );
}

export default Challan;
const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Date",
    width: 180,
    field: "date",
  },
  {
    headerName: "Invoice Id",
    width: 180,
    field: "challanId",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.challanId} copy={true} />
    ),
  },
  {
    headerName: "Client Code",
    width: 130,
    field: "clientCode",
  },
  {
    headerName: "Client",
    minWidth: 200,
    flex: 1,
    field: "client",
  },

  {
    headerName: "Billing Address",
    minWidth: 200,
    flex: 1,
    field: "billingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.billingAddress} />,
  },
  {
    headerName: "Shipping Address",
    minWidth: 200,
    flex: 1,
    field: "shippingAddress",
    renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
  },
];
