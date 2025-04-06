import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Space,
} from "antd";
import { imsAxios } from "../../axiosInterceptor";
import MyDataTable from "../../Components/MyDataTable";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import ViewModal from "./Modal/ViewModal";
import { GridActionsCellItem } from "@mui/x-data-grid";
import CloseModal from "./Modal/CloseModal";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import UpdateModal from "./Modal/UpdateModal";
import { v4 } from "uuid";
import socket from "../../Components/socket";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import MyButton from "../../Components/MyButton";

const POAnalysis = () => {
  const { executeFun, loading: loading1 } = useApi();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalInfo, setUpdateModalInfo] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");

  const [filterForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const wise = Form.useWatch("wise", filterForm);

  const getRows = async () => {
    const values = await filterForm.validateFields();
    const payload = {
      data: values.value,
      wise: wise.value,
    };
    setLoading("fetch");
    const response = await imsAxios.post("/jobwork/jw_analysis", payload);
    setLoading(false);
    const { data } = response;
    let arr = [];
    if (data) {
      if (data.code === 200) {
        arr = data.data.map((row, index) => ({
          id: index + 1,
          date: row.date,
          jwId: row.po_sku_transaction,
          vendor: row.vendor,
          sku: row.skucode,
          product: row.skuname,
          reqQty: row.requiredqty,
          status: row.po_status,
          recipeStatus: row.bom_recipe,
          poStatus: row.po_status,
          skuKey: row.sku,
        }));
      } else {
        toast.error(data.message.msg);
      }
    } else {
    }
    setRows(arr);
  };

  const handleSocketDownload = async () => {
    const values = await filterForm.validateFields();
    const payload = {
      vendor: values.value,
      notificationId: v4(),
    };
    socket.emit("jw_analysis", payload);
  };
  const handlePrint = async (jwId, action) => {
    const payload = {
      transaction: jwId,
    };
    setLoading("print");
    const response = await imsAxios.post("/jobwork/print_jw_analysis", payload);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (action === "print") {
        printFunction(data.data.buffer.data);
      } else {
        downloadFunction(data.data.buffer.data, jwId);
      }
    } else {
      toast.error(data.message.msg);
    }
  };
  const askPassword = () => {
    // <Modal
  };
  const vendorLogin = async () => {
    setConfirmLoading(true);
    const values = await passwordForm.validateFields();
    let vencode = selectedRow.vendor.split("( ")[1].split(" )")[0];
    const response = await imsAxios.post("/auth/redirectVendor", {
      currentPassword: values.password,
      vendorCode: vencode,
    });
    const { data } = response;
    setConfirmLoading(true);
    if (response.status === 200) {
      const link = `https://oakter.vendor.mscorpres.co.in/requests/pending?token=${data.redirectToken}`;
      window.open(link, "_blank");
      setConfirmLoading(false);
      setOpen(false);
      passwordForm.resetFields();
    } else {
      toast.error(response.data);
      setConfirmLoading(false);
    }
    // navigate("");
  };
  useEffect(() => {
    if (wise !== "datewise") {
      filterForm.setFieldValue("value", "");
    }
  }, [wise]);
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        disabled={row.recipeStatus === "PENDING"}
        label="View"
        onClick={() => setViewModalOpen(row)}
      />,
      <GridActionsCellItem
        showInMenu
        disabled={row.recipeStatus !== "PENDING"}
        label="Edit"
        onClick={() => setUpdateModalInfo({ selType: wise.value, row })}
      />,
      <GridActionsCellItem
        showInMenu
        disabled={Row.poStatus === "C"}
        label="Close"
        onClick={() => setCloseModalOpen({ seltype: wise.value, row })}
      />,
      <GridActionsCellItem
        showInMenu
        label="Print"
        onClick={() => handlePrint(row.jwId, "print")}
      />,
      <GridActionsCellItem
        showInMenu
        label="Download"
        onClick={() => handlePrint(row.jwId, "download")}
      />,
      // <GridActionsCellItem
      //   showInMenu
      //   label="Vendor Login"
      //   onClick={() => getRowinModal(row)}
      // />,
    ],
  };
  const getRowinModal = (row) => {
    setOpen(true);
    setSelectedRow(row);
  };

  return (
    <Row gutter={6} style={{ height: "90%", padding: 10 }}>
      <Col span={4}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small" title="Filters">
              <Form
                initialValues={initialValues}
                layout="vertical"
                form={filterForm}
              >
                <Form.Item label="Select Wise" name="wise">
                  <MySelect options={wiseOptions} labelInValue />
                </Form.Item>

                {valueInput(wise, filterForm)}
              </Form>
              <Row justify="end">
                <Space>
                  {wise?.value === "vendorwise" && (
                    <CommonIcons
                      action="downloadButton"
                      onClick={handleSocketDownload}
                    />
                  )}{" "}
                  <MyButton variant="search" type="primary" onClick={getRows}>
                    Fetch
                  </MyButton>
                </Space>
              </Row>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading === "fetch" || loading === "print"}
          columns={[actionColumn, ...columns]}
          data={rows}
        />
      </Col>
      <ViewModal
        setViewModalOpen={setViewModalOpen}
        viewModalOpen={viewModalOpen}
      />
      <CloseModal
        closeModalOpen={closeModalOpen}
        setCloseModalOpen={setCloseModalOpen}
        getRows={getRows}
      />
      <UpdateModal
        setUpdateModalInfo={setUpdateModalInfo}
        updateModalInfo={updateModalInfo}
        getRows={getRows}
      />
      <Modal
        title="Confirm Password"
        open={open}
        onOk={() => vendorLogin()}
        onCancel={() => setOpen(false)}
        okText="Okay"
        cancelText="Back"
        confirmLoading={confirmLoading}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="password" label="Current Password">
            <Input.Password placeholder="Enter you Current Password" />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default POAnalysis;
const wiseOptions = [
  {
    text: "Date",
    value: "datewise",
  },
  {
    text: "JobWork ID",
    value: "jw_transaction_wise",
  },
  {
    text: "SKU",
    value: "jw_sfg_wise",
  },
  {
    text: "Vendor",
    value: "vendorwise",
  },
];

const initialValues = {
  wise: {
    label: "JobWork ID",
    value: "jw_transaction_wise",
  },
};

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Date",
    field: "date",
    width: "150",
    renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
  },
  {
    headerName: "Jobwork ID",
    field: "jwId",
    width: "200",
    renderCell: ({ row }) => <ToolTipEllipses text={row.jwId} copy={true} />,
  },
  {
    headerName: "Vendor",
    field: "vendor",
    minWidth: "150",
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: "150",
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: "150",
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    headerName: "Required Qty",
    field: "reqQty",
    width: "150",
  },
];

const valueInput = (wise, form) => {
  if (wise?.value === "datewise") {
    return <DateWise form={form} wise={wise} />;
  } else if (wise?.value === "jw_transaction_wise") {
    return <JWIDInput wise={wise} />;
  } else if (wise?.value === "jw_sfg_wise") {
    return <SKUSelect wise={wise} />;
  } else if (wise?.value === "vendorwise") {
    return <VendorSelect wise={wise} useApi={useApi} />;
  }
};

const DateWise = ({ form, wise }) => (
  <Form.Item label={wise?.label} name="value">
    <MyDatePicker
      setDateRange={(value) => form.setFieldValue("value", value)}
    />
  </Form.Item>
);
const JWIDInput = ({ wise }) => (
  <Form.Item label={wise?.label} name="value">
    <Input />
  </Form.Item>
);
const SKUSelect = ({ wise }) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSkuOptions = async (search) => {
    const payload = {
      search,
    };
    setLoading(true);
    const response = await imsAxios.post(
      "/backend/getProductByNameAndNo",
      payload
    );
    setLoading(false);
    let arr = [];
    const { data } = response;
    if (data && data.length > 0) {
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
    }
    setAsyncOptions(arr);
  };

  return (
    <Form.Item label={wise?.label} name="value">
      <MyAsyncSelect
        loadOptions={getSkuOptions}
        optionsState={asyncOptions}
        onBlur={() => setAsyncOptions([])}
        selectLoading={loading}
      />
    </Form.Item>
  );
};
const VendorSelect = ({ wise, useApi }) => {
  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSkuOptions = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  return (
    <Form.Item label={wise?.label} name="value">
      <MyAsyncSelect
        loadOptions={getSkuOptions}
        optionsState={asyncOptions}
        onBlur={() => setAsyncOptions([])}
      />
    </Form.Item>
  );
};
