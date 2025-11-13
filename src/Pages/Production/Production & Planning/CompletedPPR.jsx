import { Row, Space, Input } from "antd";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

const CompletedPPR = () => {
  const [wise, setWise] = useState("skuwise");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const wiseOptions = [
    { text: "Product SKU Wise  ", value: "skuwise" },
    { text: "PRR Status", value: "pprtype" },
    { text: "PRR No.", value: "pprno" },
  ];

  const selOpt = [
    { text: "New", value: "new" },
    { text: "Repair", value: "repair" },
    { text: "Testing", value: "testing" },
    { text: "Packing", value: "packing" },
  ];

  const getProductDataFromType = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/fetchAllProduct", {
        searchTerm: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const getRows = async () => {
    setSearchLoading(true);
    const { data } = await imsAxios.post("ppr/fetchCompletePpr", {
      searchBy: wise,
      searchValue: searchInput,
    });
    setSearchLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      setRows([]);
      toast.error(data.message.msg);
    }
  };

  const columns = [
    { header: "Serial No.", size: 100, accessorKey: "index" },
    { header: "Type", size: 70, accessorKey: "prod_type" },
    { header: "Req No.", accessorKey: "prod_transaction" },
    {
      header: "Project",
      size: 150,
      accessorKey: "prod_project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_project} />,
    },
    { header: "Customer", accessorKey: "prod_customer" },
    { header: "Create By", accessorKey: "prod_insert_by" },
    { header: "Req Data/Time", accessorKey: "prod_insert_dt" },
    { header: "Product SKU", accessorKey: "prod_product_sku" },
    { header: "Product Name", accessorKey: "prod_name" },
    { header: "Planned Qty", accessorKey: "prod_planned_qty" },
    { header: "Due Date", accessorKey: "prod_due_date" },
    { header: "Qty Excuted", accessorKey: "totalConsumption" },
    { header: "Qty Remained", accessorKey: "consumptionRemaining" },
  ];
  useEffect(() => {
    setSearchInput("");
    if (wise == "pprtype") {
      setSearchInput("new");
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

    muiTableContainerProps: {
      sx: {
        height: searchLoading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No completed PPR Found" />
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
  });

  return (
    <div style={{ height: "90%", margin: 12 }}>
      <Row justify="space-between">
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size={"default"}
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "skuwise" ? (
                <div>
                  <MyAsyncSelect
                    size="default"
                    selectLoading={selectLoading}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={(value) => setSearchInput(value)}
                    loadOptions={getProductDataFromType}
                    optionsState={asyncOptions}
                    placeholder="Product SKU wise"
                  />
                </div>
              ) : wise == "pprtype" ? (
                <MySelect
                  options={selOpt}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                />
              ) : (
                wise == "pprno" && (
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                )
              )}{" "}
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
            onClick={() => downloadCSV(rows, columns, "Completed PPR Report")}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "95%", marginTop: 12 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default CompletedPPR;
