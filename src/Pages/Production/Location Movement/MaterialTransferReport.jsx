import { useState } from "react";
import { Row, Space } from "antd";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
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

export default function MaterialTransferReport({ type }) {
  const [wise, setWise] = useState("datewise");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [rows, setRows] = useState([]);

  const wiseOptions = [{ text: "Date Wise", value: "datewise" }];
  const getRows = async () => {
    console.log("cliked");
    let link = "";
    if (type == "sftosf") {
      link = "/godown/report_rmsf_same";
    } else if ((type = "sftorej")) {
      link = "/godown/report_sf_rej";
    }
    setSearchLoading(true);
    const { data } = await imsAxios.post(link, {
      data: searchDateRange,
      wise: wise,
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
      toast.error(data.message.msg);
      setRows([]);
    }
  };
  const columns = [
    { header: "Sr. No.", accessorKey: "index", size: 80 },
    { header: "Date", accessorKey: "date", flex: 1 },
    { header: "Part Code", accessorKey: "part", size: 80 },
    { header: "Cat Part Code", accessorKey: "cat_part", size: 120 },
    {
      header: "Component",
      accessorKey: "name",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    },
    { header: "Out Loc.", accessorKey: "out_location", flex: 1 },
    { header: "In Loc.", accessorKey: "in_location", flex: 1 },
    {
      header: "Weighted average rate",
      accessorKey: "weightedPurchaseRate",
      flex: 1,
    },
    {
      header: "Weighted total cost",
      accessorKey: "weightedTotalCost",
      flex: 1,
    },
    { header: "Qty", accessorKey: "qty", flex: 1 },
    { header: "UoM", accessorKey: "uom", flex: 1 },
    { header: "TXN ID", accessorKey: "transaction", flex: 1 },
    { header: "Shifted By", accessorKey: "completed_by", flex: 1 },
    { header: "Remarks", accessorKey: "remark", flex: 1 },
  ];

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
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

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
            {wise === "datewise" && (
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
            )}{" "}
          </div>
          <CustomButton
            size="small"
            disabled={
              wise === "datewise" && searchDateRange === "" ? true : false
            }
            title="Search"
            starticon={<Search fontSize="small" />}
            loading={searchLoading}
            onclick={getRows}
          />
        </Space>

        <div className="right search-type">
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(
                rows,
                columns,
                `SF To ${type == "sftosf" ? "SF" : "REJ"} Report`
              )
            }
          />
        </div>
      </Row>
      <div style={{ height: "95%", marginTop: 12 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
