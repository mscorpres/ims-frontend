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
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search, Visibility } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";

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
      header: "Sr No.",
      accessorKey: "index",
      width: 80,
    },
    {
      header: "Invoice ID",
      accessorKey: "invoiceID",
      render: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 140,
    },
    {
      header: "Invoice Date",
      accessorKey: "invoiceDate",
      render: ({ row }) => <ToolTipEllipses text={row.invoiceDate} />,
      width: 100,
    },
    {
      header: "Ref Date",
      render: ({ row }) => <ToolTipEllipses text={row.refDate} />,
      accessorKey: "refDate",
      width: 100,
    },

    {
      header: "Client Code",
      accessorKey: "clientCode",
      render: ({ row }) => <ToolTipEllipses text={row.clientCode} />,
      width: 80,
    },
    {
      header: "Client Name",
      accessorKey: "clientName",
      render: ({ row }) => <ToolTipEllipses text={row.clientName} />,
      width: 180,
    },
    {
      header: "Client Address",
      accessorKey: "clientAddress",
      render: ({ row }) => <ToolTipEllipses text={row.clientAddress} />,
      width: 250,
    },
    {
      header: "Shipping Name",
      accessorKey: "shippingName",
      render: ({ row }) => <ToolTipEllipses text={row.shippingName} />,
      width: 150,
    },
    {
      header: "Shipping Address",
      accessorKey: "shippingAddress",
      render: ({ row }) => <ToolTipEllipses text={row.shippingAddress} />,
      width: 250,
    },
    {
      header: "Shipping State",
      accessorKey: "shippingState",
      render: ({ row }) => <ToolTipEllipses text={row.shippingState} />,
      width: 150,
    },
    {
      header: "Shipping Gst",
      accessorKey: "shippingGst",
      render: ({ row }) => <ToolTipEllipses text={row.shippingGst} />,
      width: 150,
    },
    {
      header: "Shipping Pan",
      accessorKey: "shippingPan",
      render: ({ row }) => <ToolTipEllipses text={row.shippingPan} />,
      width: 120,
    },
    {
      header: "Shippping City",
      accessorKey: "shipppingCity",
      render: ({ row }) => <ToolTipEllipses text={row.shipppingCity} />,
      width: 150,
    },
    {
      header: "Shipping PinCode",
      accessorKey: "shippingPinCode",
      render: ({ row }) => <ToolTipEllipses text={row.shippingPinCode} />,
      width: 100,
    },

    {
      header: "Payment Terms",
      accessorKey: "paymentTerms",
      render: ({ row }) => <ToolTipEllipses text={row.paymentTerms} />,
      width: 80,
    },
    {
      header: "Invoice Type",
      accessorKey: "invoiceType",
      render: ({ row }) => <ToolTipEllipses text={row.invoiceType} />,
      width: 130,
    },

    {
      header: "Destination",
      accessorKey: "destination",
      render: ({ row }) => <ToolTipEllipses text={row.destination} />,
      width: 80,
    },
    {
      header: "Product Name",
      accessorKey: "name",
      render: ({ row }) => <ToolTipEllipses text={row.name} />,
      width: 250,
    },
    {
      header: "SKU",
      accessorKey: "sku",
      width: 80,
    },
    {
      header: "Qty",
      accessorKey: "qty",
      // render: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 100,
    },
    {
      header: "UOM",
      accessorKey: "uom",
      // render: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 80,
    },
    {
      header: "Rate",
      accessorKey: "rate",
      width: 80,
    },
    {
      header: "HSN",
      accessorKey: "hsn",
      // render: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 140,
    },
    {
      header: "GST Rate",
      accessorKey: "gstRate",
      // render: ({ row }) => <ToolTipEllipses text={row.invoiceID} />,
      width: 80,
    },
    {
      header: "GST Type",
      accessorKey: "gstType",
      width: 120,
    },
    {
      header: "SGST",
      accessorKey: "sgst",
      render: ({ row }) => (
        <ToolTipEllipses text={row.sgst == "" ? 0 : row.sgst} />
      ),
      width: 80,
    },
    {
      header: "CGST",
      accessorKey: "cgst",
      render: ({ row }) => (
        <ToolTipEllipses text={row.cgst == "" ? 0 : row.cgst} />
      ),
      width: 80,
    },
    {
      header: "IGST",
      accessorKey: "igst",
      render: ({ row }) => (
        <ToolTipEllipses text={row.igst == "" ? 0 : row.igst} />
      ),
      width: 80,
    },
    {
      header: "Invoice Total",
      accessorKey: "invoiceTotal",
      render: ({ row }) => <ToolTipEllipses text={row.invoiceTotal} />,
      width: 100,
    },

    {
      header: "Inserted By",
      accessorKey: "insertedBy",
      render: ({ row }) => <ToolTipEllipses text={row.insertedBy} />,
      width: 100,
    },
    {
      header: "Insert Date",
      accessorKey: "insertDate",
      render: ({ row }) => <ToolTipEllipses text={row.insertDate} />,
      width: 140,
    },
    {
      header: "Transport Mode",
      accessorKey: "transportMode",
      render: ({ row }) => <ToolTipEllipses text={row.transportMode} />,
      width: 150,
    },
    {
      header: "Vehicle No",
      accessorKey: "vehicleNo",
      render: ({ row }) => <ToolTipEllipses text={row.vehicleNo} />,
      width: 120,
    },
    {
      header: "Delivery Terms",
      accessorKey: "deliveryTerms",
      render: ({ row }) => <ToolTipEllipses text={row.deliveryTerms} />,
      width: 200,
    },
    {
      header: "Transport Company",
      accessorKey: "transportCompany",
      render: ({ row }) => <ToolTipEllipses text={row.transportCompany} />,
      width: 150,
    },
    {
      header: "Delivery Note",
      render: ({ row }) => <ToolTipEllipses text={row.deliveryNote} />,
      accessorKey: "deliveryNote",
      width: 150,
    },
  ];

  useEffect(() => {
    setSearchTerm("");
  }, [wise]);

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
    enableRowSelection: true,
    renderRowActions: ({ row }) => (
      <Tooltip title="View">
        <IconButton
          color="inherit"
          size="small"
          onClick={() => {
            () => getDetials(row);
          }}
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
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
  });

  return (
    <div style={{ height: "90%",margin:12 }}>
      <Row
        justify="space-between"
       
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
         
          >
            <Col>
              <Space>
                <div style={{ width: 250 }}>
                  <MySelect
                    options={wiseOptions}
                    // onBlur={() => setAsyncOptions([])}
                    value={wise}
                    onChange={setWise}
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
                  <CustomButton
                    size="small"
                    title={"Search"}
                    starticon={<Search fontSize="small" />}
                    loading={loading}
                    onclick={getData}
                  />
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
      <div style={{ height: "95%", marginTop: 12 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

export default SalesRegister;
