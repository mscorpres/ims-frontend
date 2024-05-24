import { Button, Card, Col, Flex, Form, Row, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import useApi from "../../../hooks/useApi.ts";
import { getMINOptions } from "../../../api/general.ts";
import {
  downloadConsumptionList,
  getMINLabelRows,
  printMIN,
} from "../../../api/store/material-in";
import MyButton from "../../../Components/MyButton";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import { PrinterFilled } from "@ant-design/icons";
import LabelDrawer from "./LabelDrawer";

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
  const actionColumns = [
    {
      headerName: "#",
      field: "id",
      width: 30,
    },
    {
      headerName: "",
      type: "actions",
      field: "action",
      width: 20,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // icon={<CloudDownloadOutlined className="view-icon" />}
          onClick={() => handlePrintMIN(row.minId, "download")}
          disabled={row.invoiceStatus == false}
          label="Download Attachement"
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={row.invoiceStatus == false}
          // icon={<PrinterFilled className="view-icon" />}
          onClick={() => handlePrintMIN(row.minId)}
          label="Print MIN"
        />,
        <GridActionsCellItem
          showInMenu
          disabled={row.consumptionStatus == false}
          // icon={<PrinterFilled className="view-icon" />}
          onClick={() => handleDownloadConsumptionList(row.minId)}
          label="Consumption List"
        />,
        <GridActionsCellItem
          showInMenu
          // icon={<PrinterFilled className="view-icon" />}
          onClick={() => {
            setShowLabelDrawer(true);
            setPreselected({
              label: row.minId,
              text: row.minId,
              value: row.minId,
            });
          }}
          label="Print Labels"
        />,
      ],
    },
  ];

  useEffect(() => {
    if (selectedWise === "minwise") {
      form.setFieldValue("value", undefined);
    }
  }, [selectedWise]);
  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <LabelDrawer
        open={showLabelDrawer}
        hide={() => setShowLabelDrawer(false)}
        handleFetchMINOptions={handleFetchMINOptions}
        selectLoading={loading("select")}
        preSelected={preselected}
      />
      <Col span={4}>
        <Card size="small">
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

              <MyButton
                variant="search"
                loading={loading("fetch")}
                onClick={handleFetchRows}
              />
            </Flex>
          </Form>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading("fetch") || loading("print")}
          columns={[...actionColumns, ...columns]}
          data={rows}
        />
      </Col>
    </Row>
  );
};

export default ViewMIN;

const columns = [
  {
    headerName: "MIN Date / Time",
    field: "createdDate",
    width: 150,
  },
  {
    headerName: "MIN ID",
    field: "minId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.minId} copy={true} />,
    width: 170,
  },
  {
    headerName: "Invoice ID",
    field: "invoice",
    width: 150,
  },
  {
    headerName: "Vendor",
    field: "vendor",
    //   width: 200,
    flex: 1,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 130,
  },
  {
    headerName: "In Qty",
    field: "qty",
    width: 100,
  },
  {
    headerName: "In Loc",
    field: "location",
    width: 120,
  },
  {
    headerName: "In By",
    field: "createdBy",
    width: 150,
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
