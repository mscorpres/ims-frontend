import { Button, Col, Drawer, Input, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  EyeFilled,
  EyeInvisibleFilled,
  EyeInvisibleOutlined,
  EyeInvisibleTwoTone,
  EyeOutlined,
} from "@ant-design/icons";

function SalesRegister() {
  const [wise, setWise] = useState("created_date_wise");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [modalVals, setModalVals] = useState([]);
  const [open, setOpen] = useState([]);
  const wiseOptions = [
    { value: "created_date_wise", text: "Created Date Wise" },
    { value: "invoice_date_wise", text: "Invoice Date wise" },
    { value: "invoice_no_wise", text: "Invoice Wise" },
    { value: "customer_wise", text: "Customer Wise" },
  ];

  const getData = async () => {
    setLoading(true);
    const response = await imsAxios.get(
      `/invoice/register?wise=${wise}&data=${searchTerm}`
    );
    // console.log("response", response);
    const { data } = response;
    if (response.status === 200) {
      let arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
      setLoading(true);
    }
    setLoading(false);
  };
  // useEffect(() => {
  //   getData();
  // }, []);
  const getDetials = async (row) => {
    setOpen(row);
    setLoading(true);
    console.log("row", row);
    const response = await imsAxios.post("/invoice/getSalesData", {
      invoiceID: row.invoiceID,
    });
    // console.log("response", response);
    if (response.status == 200) {
      let arr = response.data;
      arr = arr.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setModalVals(arr);
      setLoading(false);
    }
    setLoading(false);
  };
  const modalcol = [
    {
      headerName: "Sr No.",
      field: "index",
      width: 80,
    },
    {
      headerName: "Product Name",
      field: "name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
      width: 250,
    },
    {
      headerName: "SKU",
      field: "sku",
      width: 80,
    },
    {
      headerName: "Qty",
      field: "qty",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 100,
    },
    {
      headerName: "UOM",
      field: "uom",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 80,
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 80,
    },
    {
      headerName: "HSN",
      field: "hsn",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 140,
    },
    {
      headerName: "GST Rate",
      field: "gstRate",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 80,
    },
    {
      headerName: "GST Type",
      field: "gstType",
      width: 120,
    },
    {
      headerName: "SGST",
      field: "sgst",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.sgst == "" ? 0 : row.sgst} />
      ),
      width: 80,
    },
    {
      headerName: "CGST",
      field: "cgst",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.cgst == "" ? 0 : row.cgst} />
      ),
      width: 80,
    },
    {
      headerName: "IGST",
      field: "igst",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.igst == "" ? 0 : row.igst} />
      ),
      width: 80,
    },
  ];
  const columns = [
    {
      headerName: "",

      type: "actions",
      field: "action",
      width: 65,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // icon={<EyeOutlined />}
          onClick={() => getDetials(row)}
          label="View"
        />,
      ],
    },
    {
      headerName: "Sr No.",
      field: "index",
      width: 80,
    },
    {
      headerName: "Invoice ID",
      field: "invoiceID",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 140,
    },
    {
      headerName: "Invoice Date",
      field: "invoiceDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceDate} />,
      width: 100,
    },
    {
      headerName: "Ref Date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.refDate} />,
      field: "refDate",
      width: 100,
    },

    {
      headerName: "Client Code",
      field: "clientCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clientCode} />,
      width: 80,
    },
    {
      headerName: "Client Name",
      field: "clientName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clientName} />,
      width: 180,
    },
    {
      headerName: "Client Address",
      field: "clientAddress",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clientAddress} />,
      width: 250,
    },
    {
      headerName: "Shipping Name",
      field: "shippingName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shippingName} />,
      width: 150,
    },
    {
      headerName: "Shipping Address",
      field: "shippingAddress",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
      width: 250,
    },
    {
      headerName: "Shipping State",
      field: "shippingState",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shippingState} />,
      width: 150,
    },
    {
      headerName: "Shipping Gst",
      field: "shippingGst",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shippingGst} />,
      width: 150,
    },
    {
      headerName: "Shipping Pan",
      field: "shippingPan",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shippingPan} />,
      width: 120,
    },
    {
      headerName: "Shippping City",
      field: "shipppingCity",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shipppingCity} />,
      width: 150,
    },
    {
      headerName: "Shipping PinCode",
      field: "shippingPinCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.shippingPinCode} />,
      width: 100,
    },

    {
      headerName: "Payment Terms",
      field: "paymentTerms",
      renderCell: ({ row }) => <ToolTipEllipses text={row.paymentTerms} />,
      width: 80,
    },
    {
      headerName: "Invoice Type",
      field: "invoiceType",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceType} />,
      width: 130,
    },

    {
      headerName: "Destination",
      field: "destination",
      renderCell: ({ row }) => <ToolTipEllipses text={row.destination} />,
      width: 80,
    },
    {
      headerName: "Product Name",
      field: "name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
      width: 250,
    },
    {
      headerName: "SKU",
      field: "sku",
      width: 80,
    },
    {
      headerName: "Qty",
      field: "qty",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 100,
    },
    {
      headerName: "UOM",
      field: "uom",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 80,
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 80,
    },
    {
      headerName: "HSN",
      field: "hsn",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 140,
    },
    {
      headerName: "GST Rate",
      field: "gstRate",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 80,
    },
    {
      headerName: "GST Type",
      field: "gstType",
      width: 120,
    },
    {
      headerName: "SGST",
      field: "sgst",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.sgst == "" ? 0 : row.sgst} />
      ),
      width: 80,
    },
    {
      headerName: "CGST",
      field: "cgst",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.cgst == "" ? 0 : row.cgst} />
      ),
      width: 80,
    },
    {
      headerName: "IGST",
      field: "igst",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.igst == "" ? 0 : row.igst} />
      ),
      width: 80,
    },
    {
      headerName: "Invoice Total",
      field: "invoiceTotal",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceTotal} />,
      width: 100,
    },

    {
      headerName: "Inserted By",
      field: "insertedBy",
      renderCell: ({ row }) => <ToolTipEllipses text={row.insertedBy} />,
      width: 100,
    },
    {
      headerName: "Insert Date",
      field: "insertDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row.insertDate} />,
      width: 140,
    },
    {
      headerName: "Transport Mode",
      field: "transportMode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.transportMode} />,
      width: 150,
    },
    {
      headerName: "Vehicle No",
      field: "vehicleNo",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vehicleNo} />,
      width: 120,
    },
    {
      headerName: "Delivery Terms",
      field: "deliveryTerms",
      renderCell: ({ row }) => <ToolTipEllipses text={row.deliveryTerms} />,
      width: 200,
    },
    {
      headerName: "Transport Company",
      field: "transportCompany",
      renderCell: ({ row }) => <ToolTipEllipses text={row.transportCompany} />,
      width: 150,
    },
    {
      headerName: "Delivery Note",
      renderCell: ({ row }) => <ToolTipEllipses text={row.deliveryNote} />,
      field: "deliveryNote",
      width: 150,
    },
  ];

  useEffect(() => {
    setSearchTerm("");
  }, [wise]);
  return (
    <div style={{ height: "90%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Drawer
          open={open?.invoiceID}
          title={`Invoice ${open?.invoiceID}`}
          width={1800}
          onClose={() => setOpen(false)}
        >
          <div style={{ height: "95%", padding: "0px 5px" }}>
            <MyDataTable
              // loading={loading === "fetch"}
              data={modalVals}
              columns={modalcol}
              loading={loading}
            />
          </div>
        </Drawer>
        <Col span={24}>
          <Row
            justify="space-between"
            style={{ padding: "0px 10px", paddingBottom: 5 }}
          >
            <Col>
              <Space>
                <div style={{ width: 250 }}>
                  <MySelect
                    options={wiseOptions}
                    // onBlur={() => setAsyncOptions([])}
                    value={wise}
                    // selectLoading={selectLoading}
                    // placeholder="Select Ledger"
                    // labelInValue
                    onChange={setWise}
                    // loadOptions={getLedgerOptions}
                    // optionsState={asyncOptions}
                  />
                </div>
                <Col>
                  {wise === "created_date_wise" && (
                    <MyDatePicker
                      size="default"
                      setDateRange={setSearchTerm}
                      // setDateRange={setSearchDateRange}
                      // dateRange={searchDateRange}
                      // value={searchDateRange}
                    />
                  )}
                  {wise === "invoice_date_wise" && (
                    <MyDatePicker
                      size="default"
                      setDateRange={setSearchTerm}
                      // setDateRange={setSearchDateRange}
                      // dateRange={searchDateRange}
                      // value={searchDateRange}
                    />
                  )}
                  {wise === "invoice_no_wise" && (
                    <Input
                      placeholder="Invoice Number"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  )}
                  {wise === "customer_wise" && (
                    <Input
                      placeholder="Customer Number"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  )}
                </Col>
                <Space>
                  <MyButton
                    variant="search"
                    disabled={!setSearchTerm}
                    type="primary"
                    loading={loading}
                    // loading={searchLoading}
                    onClick={getData}
                  >
                    Search
                  </MyButton>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <CommonIcons
                  action="downloadButton"
                  onClick={() =>
                    downloadCSV(rows, columns, "Sales Register Report")
                  }
                  disabled={rows.length == 0}
                />
              </Space>
            </Col>
          </Row>
        </Col>
        <CommonIcons
        // disabled={ledgerData?.rows.length == 0}
        // action={"downloadButton"}
        // onClick={downloadFun}
        />
      </Row>
      <div style={{ height: "95%", padding: "0px 5px" }}>
        <MyDataTable
          // loading={loading === "fetch"}
          data={rows}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default SalesRegister;
