import { Button, Col, Flex, Form, Row, Tooltip } from "antd";
import  { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import useApi from "../../../hooks/useApi.ts";
import { getMINOptions } from "../../../api/general.ts";
import {
  downloadAttachement,
  downloadConsumptionList,
  getMINLabelRows,
  printMIN,
} from "../../../api/store/material-in";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import { PrinterFilled } from "@ant-design/icons";
import LabelDrawer from "./LabelDrawer";
import { downloadFromLink } from "../../../utils/general.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";

//to redeploy

const ViewMIN = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showLabelDrawer, setShowLabelDrawer] = useState(false);
  const [preselected, setPreselected] = useState(null);
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const selectedWise = Form.useWatch("wise", form);

  const handleFetchMINOptions = async (search, setOptions) => {
    const response = await executeFun(() => getMINOptions(search), "select");
    if (setOptions) {
      setOptions(response.data);
      return;
    }
    setAsyncOptions(response.data);
  };

  const handleFetchRows = async () => {
    const values = await form.validateFields();
    setRows([]);
    const response = await executeFun(
      () => getMINLabelRows(values.wise, values.value),
      "fetch"
    );

    setRows(response.data);
  };

  const handlePrintMIN = async (minId, action) => {
    await executeFun(() => printMIN(minId, action), "print");
  };

  const handleDownloadConsumptionList = async (minId) => {
    await executeFun(
      () => downloadConsumptionList(minId, consuptionColumns),
      "print"
    );
  };
  const handleDownloadAttachement = async (transactionId) => {
    // console.log("transactionId", transactionId);

    const response = await executeFun(
      () => downloadAttachement(transactionId),
      "download"
    );
    if (response.success) {
      downloadFromLink(response.data.url);
      // window.open(response.data.url, "_blank", "noreferrer");
    }
  };

  useEffect(() => {
    if (selectedWise === "minwise") {
      form.setFieldValue("value", undefined);
    }
  }, [selectedWise]);

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
        height:
          loading("fetch") || loading("print")
            ? "calc(100vh - 190px)"
            : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") || loading("print") ? (
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
        onClick={() => {
          closeMenu?.();
          handleDownloadAttachement(row?.original?.minId);
        }}
        disabled={row?.original?.invoiceStatus == false}
        key="downloadattachement"
        label="Download Attachement"
        table={table}
      />,

      <MRT_ActionMenuItem
        key="print"
        label="Print MIN"
        onClick={() => {
          closeMenu?.();
          handlePrintMIN(row?.original?.minId);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="list"
        disabled={row?.original?.consumptionStatus == false}
        onClick={() => {
          closeMenu?.();
          handleDownloadConsumptionList(row?.original?.minId);
        }}
        label="Consumption List"
        table={table}
      />,
      <MRT_ActionMenuItem
        key="labels"
        onClick={() => {
          closeMenu?.();
          setShowLabelDrawer(true);
          setPreselected({
            label: row?.original?.minId,
            text: row?.original?.minId,
            value: row?.original?.minId,
          });
        }}
        label="Print Labels"
        table={table}
      />,
    ],
  });
  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <LabelDrawer
        open={showLabelDrawer}
        hide={() => setShowLabelDrawer(false)}
        handleFetchMINOptions={handleFetchMINOptions}
        selectLoading={loading("select")}
        preSelected={preselected}
      />
      <Col span={6}>
        <CustomFieldBox title="Filter">
          <Form
            form={form}
            layout="vertical"
            initialValues={initialFilterValues}
          >
            <Form.Item name="wise" label="Select Wise" rules={rules.wise}>
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item
              name="value"
              label={selectedWise === "datewise" ? "Select Date" : "Select MIN"}
              rules={selectedWise === "datewise" ? rules.date : rules.minId}
            >
              {selectedWise === "datewise" && (
                <SingleDatePicker
                  setDate={(value) => form.setFieldValue("value", value)}
                />
              )}
              {selectedWise === "minwise" && (
                <MyAsyncSelect
                  selectLoading={loading("select")}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={handleFetchMINOptions}
                  optionsState={asyncOptions}
                />
              )}
            </Form.Item>
            <Flex justify="end" gap={8}>
              <Tooltip title="Download Labels">
                <Button
                  onClick={() => setShowLabelDrawer(true)}
                  shape="circle"
                  icon={<PrinterFilled />}
                />
              </Tooltip>
              <CommonIcons
                action="downloadButton"
                onClick={() => downloadCSV(rows, columns, "MIN Report")}
              />

              <CustomButton
                size="small"
                title={"Search"}
                onclick={handleFetchRows}
                starticon={<Search fontSize="small" />}
                loading={loading("fetch")}
              />
            </Flex>
          </Form>
        </CustomFieldBox>
      </Col>
      <Col span={18}>
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
};

export default ViewMIN;

const columns = [
  {
    header: "MIN Date / Time",
    accessorKey: "createdDate",
    size: 150,
  },
  {
    header: "MIN ID",
    accessorKey: "minId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.minId} copy={true} />,
    size: 170,
  },
  {
    header: "Invoice ID",
    accessorKey: "invoice",
    size: 150,
  },
  {
    header: "Vendor",
    accessorKey: "vendor",
    size: 200,
  },
  {
    header: "Part Code",
    accessorKey: "partCode",
    size: 130,
  },
  {
    header: "In Qty",
    accessorKey: "qty",
    size: 100,
  },
  {
    header: "In Loc",
    accessorKey: "location",
    size: 120,
  },
  {
    header: "In By",
    accessorKey: "createdBy",
    size: 150,
  },
];

const consuptionColumns = [
  {
    headerName: "MIN Date / Time",
    field: "date",
  },

  {
    headerName: "Components",
    field: "partName",
  },
  {
    headerName: "Part Code",
    field: "partCode",
  },
  {
    headerName: "Cat PartCode",
    field: "catPartCode",
  },
  {
    headerName: "Qty",
    field: "qty",
  },
  {
    headerName: "Invoice Number",
    field: "invNo",
  },
  {
    headerName: "JW Id",
    field: "jwID",
  },
  {
    headerName: "UoM",
    field: "uom",
  },
];

const wiseOptions = [
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "MIN Wise",
    value: "minwise",
  },
];

const initialFilterValues = {
  wise: "datewise",
};

const rules = {
  date: [{ required: true, message: "Date is required" }],
  minId: [{ required: true, message: "MIN ID is required" }],
  wise: [{ required: true, message: "This is required" }],
};
