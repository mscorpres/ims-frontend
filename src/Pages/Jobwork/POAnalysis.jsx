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
  Checkbox,
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
import { downloadCSV } from "../../Components/exportToCSV.jsx";
import CustomFieldBox from "../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import { Search, Visibility } from "@mui/icons-material";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";

const POAnalysis = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalInfo, setUpdateModalInfo] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [advancedDate, setAdvancedDate] = useState("");

  const [filterForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const wise = Form.useWatch("wise", filterForm);

  const getRows = async () => {
    const values = await filterForm.validateFields();
    const payload = {
      data: values.value,
      wise: wise.value,
      advanced: advancedFilter,
      dateRange: advancedDate,
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
          project_description: row.project_description,
          project_name: row.project_name,
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
    header: "",
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
    ],
  };

  const selectedWise = filterForm.getFieldValue("wise");
  const table = useMaterialReactTable({
    columns: columns,
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
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 250px)",
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        icon={<Edit />}
        key="edit"
        label="Edit"
        onClick={() => {
          closeMenu?.();
          setUpdateModalInfo({ selType: wise.value, row });
        }}
        table={table}
        disabled={row.recipeStatus === "PENDING"}
      />,
      <MRT_ActionMenuItem
        icon={<Visibility fontSize="small" />}
        key="view"
        label="View"
        onClick={() => {
          closeMenu?.();
          setViewModalOpen(row);
        }}
        table={table}
        disabled={row.recipeStatus === "PENDING"}
      />,
      <MRT_ActionMenuItem
        icon={<Download />}
        key="download"
        label="Download"
        onClick={() => {
          closeMenu?.();
          handlePrint(row.jwId, "download");
        }}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Print />}
        key="print"
        label="Print"
        onClick={() => {
          closeMenu?.();
          handlePrint(row.jwId, "print");
        }}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Cancel />}
        key="close"
        label="Close"
        onClick={() => {
          closeMenu?.();
          setCloseModalOpen({ seltype: wise.value, row });
        }}
        table={table}
      />,
    ],
  });

  return (
    <Row gutter={6} style={{ height: "90%", padding: 10 }}>
      <Col span={6}>
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <CustomFieldBox title={"Filter"}>
              <Form
                initialValues={initialValues}
                layout="vertical"
                form={filterForm}
              >
                <Form.Item label="Select Wise" name="wise">
                  <MySelect options={wiseOptions} labelInValue />
                </Form.Item>
                {valueInput(wise, filterForm)}

                <Form.Item
                  label="Advanced Filter"
                  name="advancedFilter"
                  className=""
                >
                  <Checkbox
                    onChange={(e) => setAdvancedFilter(e.target.checked)}
                  />
                </Form.Item>

                {selectedWise?.value !== "datewise" && advancedFilter && (
                  <MyDatePicker
                    setDateRange={(value) => setAdvancedDate(value)}
                  />
                )}
              </Form>
              <Row justify="end">
                <Space>
                  <CommonIcons
                    action="downloadButton"
                    onClick={() =>
                      downloadCSV(rows, columns, "PO Analysis Report")
                    }
                    disabled={rows.length == 0}
                  />
                </Space>
                <Space>
                  {wise?.value === "vendorwise" && (
                    <CommonIcons
                      action="downloadButton"
                      onClick={handleSocketDownload}
                    />
                  )}{" "}
                  <CustomButton
                    size="small"
                    title={"Search"}
                    starticon={<Search fontSize="small" />}
                    onclick={getRows}
                  />
                </Space>
              </Row>
            </CustomFieldBox>
          </Col>
        </Row>
      </Col>
      <Col span={18}>
        <MaterialReactTable table={table} />
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
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
  },
  {
    header: "Jobwork ID",
    accessorKey: "jwId",
    size: 200,
    renderCell: ({ row }) => <ToolTipEllipses text={row.jwId} copy={true} />,
  },
  {
    header: "Vendor",
    accessorKey: "vendor",
    minsize: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    size: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    header: "Product",
    accessorKey: "product",
    minsize: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    header: "Required Qty",
    accessorKey: "reqQty",
    size: 150,
  },
  {
    header: "Project ID",
    accessorKey: "project_name",
    size: 200,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.project_name} copy={true} />
    ),
  },
  {
    header: "Project Description",
    accessorKey: "project_description",
    size: 200,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.project_description} copy={true} />
    ),
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
