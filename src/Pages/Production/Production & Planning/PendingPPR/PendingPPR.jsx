import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Input, Row, Space } from "antd";
import MySelect from "../../../../Components/MySelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import { v4 } from "uuid";
import ClosePPR from "./ClosePPR";
import EditPPR from "./EditPPR";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import ExecutePPR from "./ExecutePPR";
import ViewComponents from "./ViewComponents";
import MyButton from "../../../../Components/MyButton";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { original } from "@reduxjs/toolkit";
import CustomButton from "../../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";

const PendingPPR = () => {
  const [cancelPPR, setsCancelPPR] = useState(null);
  const [executePPR, setExcecutePPR] = useState(null);
  const [editPPR, setEditPPR] = useState(null);
  const [viewComponents, setViewComponents] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("pprno");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const pprWiseOptions = [
    { text: "New", value: "new" },
    { text: "Repair", value: "repair" },
    { text: "Testing", value: "testing" },
    { text: "Packing", value: "packing" },
  ];

  const wiseOptions = [
    { text: "PPR No.", value: "pprno" },
    { text: "Date Wise", value: "datewise" },
    { text: "Product Wise", value: "skuwise" },
    { text: "PPR Status", value: "pprtype" },
  ];

  const getProducts = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/fetchAllProduct", {
        searchTerm: e,
      });
      setSelectLoading(true);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getRows = async () => {
    setSearchLoading(true);
    if (searchInput != "") {
      const { data } = await imsAxios.post("/ppr/fetchPendingPpr", {
        searchBy: wise,
        searchValue: searchInput.value ?? searchInput,
      });

      setSearchLoading(false);
      if (data.code == 200) {
        const arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            serial_no: index + 1,
          };
        });
        setRows(arr);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setRows([]);
      }
    }
  };

  const columns = [
    { header: "#", size: 30, accessorKey: "serial_no" },
    {
      header: "PPR No.",
      minsize: 160,
      accessorKey: "prod_transaction",
      render: ({ row }) => (
        <ToolTipEllipses text={row.prod_transaction} copy={true} />
      ),
    },
    { header: "Type", size: 100, accessorKey: "prod_type" },
    {
      header: "Project",
      size: 150,
      accessorKey: "prod_project",
      render: ({ row }) => <ToolTipEllipses text={row.prod_project} />,
    },
    {
      header: "Customer",
      size: 120,
      accessorKey: "prod_customer",
      render: ({ row }) => <ToolTipEllipses text={row.prod_customer} />,
    },
    {
      header: "Create By",
      size: 150,
      accessorKey: "prod_insert_by",
      render: ({ row }) => <ToolTipEllipses text={row.prod_insert_by} />,
    },
    {
      header: "Req Data/Time",
      size: 150,
      accessorKey: "prod_insert_dt",
      render: ({ row }) => <ToolTipEllipses text={row.prod_insert_dt} />,
    },
    {
      header: "Product SKU",
      size: 120,
      accessorKey: "prod_product_sku",
    },
    {
      header: "Product Name",
      minsize: 150,
      flex: 1,
      accessorKey: "prod_name",
      render: ({ row }) => <ToolTipEllipses text={row.prod_name} />,
    },
    {
      header: "Planned Qty",
      size: 100,
      accessorKey: "prod_planned_qty",
    },
    { header: "Due Date", size: 120, accessorKey: "prod_due_date" },
    { header: "Exceuted Qty", size: 100, accessorKey: "totalConsumption" },
    { header: "Qty Remaining", size: 120, accessorKey: "consumptionRemaining" },
  ];
  const columnsdownld = [
    // { headerName: "#", width: 30, field: "serial_no" },
    {
      headerName: "Req No.",
      minWidth: 160,
      field: "prod_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.prod_transaction} copy={true} />
      ),
    },
    { headerName: "Type", width: 100, field: "prod_type" },
    {
      headerName: "Project",
      width: 150,
      field: "prod_project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_project} />,
    },
    {
      headerName: "Customer",
      width: 120,
      field: "prod_customer",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_customer} />,
    },
    {
      headerName: "Create By",
      width: 150,
      field: "prod_insert_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_insert_by} />,
    },
    {
      headerName: "Req Data/Time",
      width: 150,
      field: "prod_insert_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_insert_dt} />,
    },
    {
      headerName: "Product SKU",
      width: 120,
      field: "prod_product_sku",
    },
    {
      headerName: "Product Name",
      minWidth: 150,
      flex: 1,
      field: "prod_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_name} />,
    },
    {
      headerName: "Planned Qty",
      width: 100,
      field: "prod_planned_qty",
    },
    { headerName: "Due Date", width: 120, field: "prod_due_date" },
    { headerName: "Exceuted Qty", width: 100, field: "totalConsumption" },
    { headerName: "Qty Remaining", width: 120, field: "consumptionRemaining" },
  ];
  useEffect(() => {
    if (wise == "pprtype") {
      setSearchInput("new");
    } else {
      setSearchInput("");
    }
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
    muiTableContainerProps: {
      sx: {
        height: searchLoading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Pending PPR Found" />
    ),

    renderTopToolbar: () =>
      searchLoading ? (
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
        key="execute"
        label="Execute PPR"
        onClick={() => {
          closeMenu?.();
          setExcecutePPR(row?.original);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="edit"
        label="Edit PPR"
        onClick={() => {
          closeMenu?.();
          setEditPPR({
            ppr: row?.original?.prod_transaction,
            skucode: row?.original?.prod_product_sku,
          });
        }}
        table={table}
      />,

      <MRT_ActionMenuItem
        key="view"
        disabled={!row?.original?.rqd_status}
        label="View Components"
        onClick={() => {
          closeMenu?.();
          setViewComponents({
            ppr: row?.original?.prod_transaction,
            sku: row?.original?.prod_product_sku,
            server: row?.original?.rqd_status[0]?.server,
            client: row?.original?.rqd_status[0]?.client,
            project: row?.original?.prod_project,
            product: row?.original?.prod_name,
            executedQty: row?.original?.totalConsumption,
            plannedQty: row?.original?.prod_planned_qty,
            remainingQty: row?.original?.consumptionRemaining,
          });
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="cancel"
        label="Cancel PPR"
        onClick={() => {
          closeMenu?.();
          setsCancelPPR(row?.original);
        }}
        table={table}
      />,
    ],
  });
  return (
    <div style={{ height: "90%", margin: 12 }}>
      <ClosePPR
        setsCancelPPR={setsCancelPPR}
        cancelPPR={cancelPPR}
        getRows={getRows}
      />
      <ExecutePPR
        getRows={getRows}
        editPPR={executePPR}
        setEditPPR={setExcecutePPR}
      />
      <EditPPR editPPR={editPPR} setEditPPR={setEditPPR} />
      <ViewComponents
        viewComponents={viewComponents}
        setViewComponents={setViewComponents}
      />
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  value={searchInput}
                />
              ) : wise == "skuwise" ? (
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={getProducts}
                  optionsState={asyncOptions}
                  placeholder="Select Product..."
                />
              ) : wise == "pprtype" ? (
                <MySelect
                  options={pprWiseOptions}
                  value={searchInput}
                  labelInValue
                  onChange={(value) => setSearchInput(value)}
                />
              ) : (
                wise == "pprno" && (
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                )
              )}
            </div>

            <CustomButton
              size="small"
              title={"Search"}
              onclick={getRows}
              loading={searchLoading}
              disabled={!searchInput ? true : false}
              starticon={<Search fontSize="small" />}
            />
          </Space>
        </div>
        <Space>
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(rows, columnsdownld, "Pending PPR Report")
            }
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "95%", margin: "12px" }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default PendingPPR;
