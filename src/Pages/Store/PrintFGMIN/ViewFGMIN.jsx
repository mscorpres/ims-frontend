import { Button, Card, Col, Flex, Form, Row, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect.jsx";
import SingleDatePicker from "../../../Components/SingleDatePicker.jsx";
import MyAsyncSelect from "../../../Components/MyAsyncSelect.jsx";
import useApi from "../../../hooks/useApi.ts";
import { getFGMINOptions, getMINOptions } from "../../../api/general.ts";
import { toast } from "react-toastify";
import {
  downloadAttachement,
  downloadConsumptionList,
  getFGMINLabelRows,
  printFGMIN,
} from "../../../api/store/material-in.js";
import MyButton from "../../../Components/MyButton/index.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
import MyDataTable from "../../../Components/MyDataTable.jsx";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import { downloadCSV } from "../../../Components/exportToCSV.jsx";
import { PrinterFilled } from "@ant-design/icons";
import LabelDrawer from "../MINLabel/LabelDrawer";
import { downloadFromLink } from "../../../utils/general.ts";

//to redeploy

const ViewFGMIN = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showLabelDrawer, setShowLabelDrawer] = useState(false);
  const [preselected, setPreselected] = useState(null);
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { executeFun, loading } = useApi();

  const selectedWise = Form.useWatch("wise", form);

  const handleFetchMINOptions = async (search, setOptions) => {
    const response = await executeFun(() => getFGMINOptions(search), "select");
    if (setOptions) {
      setOptions(response.data);
      return;
    }
    setAsyncOptions(response.data);
  };

  const handleFetchRows = async () => {
    setIsLoading(true);
    const values = await form.validateFields();
    setRows([]);
    const response =  await  getFGMINLabelRows(values.wise, values.value)


    if (response.status === "success") {
  
      setRows(response.data);
          setIsLoading(false);
    } else {
      toast.error(response.message);
      setIsLoading(false);
    }

    
  };

  const handlePrintMIN = async (minId, action) => {
    await executeFun(() => printFGMIN(minId, action), "print");
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
  const actionColumns = [
    {
      headerName: "",
      type: "actions",
      field: "action",
      width: 20,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
       
          onClick={() => handleDownloadAttachement(row.transaction)}
          disabled={row.invoiceStatus == false}
          label="Download Attachement"
        />,
        <GridActionsCellItem
          showInMenu
   
          onClick={() => handlePrintMIN(row.transaction)}
          label="Print MIN"
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
    <Row style={{ height: "calc(100vh - 100px)", padding: 10 }} gutter={6}>
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
          

              <MyButton
                variant="search"
                loading={loading("fetch") || isLoading}
                onClick={handleFetchRows}
                
              />
            </Flex>
          </Form>
        </Card>
      </Col>
      <Col span={20} style={{ height: "calc(100vh - 130px)", marginTop: 10 }}>
        <MyDataTable
          loading={loading("fetch") || loading("print") || isLoading}
          columns={[...actionColumns, ...columns]}
          data={rows}
        />
      </Col>
    </Row>
  );
};

export default ViewFGMIN;

const columns = [
  {
    headerName: "Date / Time",
    field: "datetime",
    width: 150,
  },
  {
    headerName: "Transaction ID",
    field: "transaction",
    renderCell: ({ row }) => <ToolTipEllipses text={row.transaction} copy={true} />,
    width: 170,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 150,
  },
  {
    headerName: "Invoice ID",
    field: "invoice",
    width: 150,
  },
  {
    headerName: "Vendor",
    field: "vendorname",
    //   width: 200,
    flex: 1,
  },

  {
    headerName: "In Qty",
    field: "inqty",
    width: 100,
  },
  {
    headerName: "Location",
    field: "location",
    width: 120,
  },
  {
    headerName: "In By",
    field: "inby",
    width: 150,
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
