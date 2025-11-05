import { useState } from "react";
import { toast } from "react-toastify";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import {  Col, Input, Row, Space } from "antd";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import  {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import { Download, Print, Search } from "@mui/icons-material";
import CustomButton from "../../../new/components/reuseable/CustomButton";

export default function ManageGatePass() {
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [searchDateRange, setSearchDateRange] = useState();
  const [rows, setRows] = useState([]);
  const [searchLoading, serSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "GP ID Wise", value: "gpwise" },
    { text: "Mobile / Email Wise", value: "mobemailwise" },
  ];
  const columns = [
    {
      header: "Serial No.",
      accessorKey: "index",
      size: 100,
    },
    {
      header: "Jounral ID",
      accessorKey: "transaction_id",
      size: 100,
    },
    {
      header: "To (Name)",
      accessorKey: "recipient",
      size: 100,
    },
    {
      header: "Created Date/Time",
      accessorKey: "gp_reg_date",
      size: 100,
    },
  ];
  const downloadFun = async (id) => {
    setLoading(true);
    let filename = `Gatepass ${id}`;
    const { data } = await imsAxios.post("/gatepass/printGP", {
      transaction: id,
    });
    setLoading(false);
    if (data.code == 200) {
      downloadFunction(data.data.buffer.data, filename);
    } else {
      toast.error(
        data.message.msg ? data.message.msg : data.message && data.message
      );
    }
  };
  const printFun = async (id) => {
    setLoading(true);
    const { data } = await imsAxios.post("/gatepass/printGP", {
      transaction: id,
    });
    setLoading(false);
    if (data.code == 200) {
      printFunction(data.data.buffer.data);
    } else {
      toast.error(
        data.message.msg ? data.message.msg : data.message && data.message
      );
    }
  };
  const getRows = async () => {
    serSearchLoading(true);
    const { data } = await imsAxios.post("/gatepass/fetchAllGP", {
      data: wise == "datewise" ? searchDateRange : searchInput,
      wise: wise,
    });
    serSearchLoading(false);
    if (data.code == 200) {
      const arr = data.response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      toast.error(
        data.message.msg ? data.message.msg : data.message && data.message
      );
    }
  };

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
    renderRowActions: ({ row }) => (
      <div className="space-x-4">
        <Tooltip title="Print">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              printFun(row?.original?.transaction_id);
            }}
          >
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton
            size="small"
            color="inherit"
            onClick={() => {
              downloadFun(row?.original?.transaction_id);
            }}
          >
            <Download fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    ),

    muiTableContainerProps: {
      sx: {
        height:
          loading || searchLoading
            ? "calc(100vh - 240px)"
            : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading || searchLoading ? (
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
    <div style={{ position: "relative", height: "95%" }}>
      <Row
        justify="space-between"
        style={{ padding: "12px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <div style={{ width: 300 }}>
                  <MyDatePicker
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                    size="default"
                  />
                </div>
              ) : wise === "gpwise" ? (
                <div style={{ width: 300 }}>
                  <Input
                    type="text"
                    // className="form-control w-100 "
                    placeholder="Enter GP ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              ) : (
                wise === "mobemailwise" && (
                  <div style={{ width: 300 }}>
                    <Input
                      type="text"
                      // className="form-control w-100 "
                      placeholder="Enter Email / Phone Number"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                )
              )}
            </div>

            <CustomButton
              size="small"
              title={"Search"}
              starticon={<Search fontSize="small" />}
              loading={searchLoading}
              disabled={
                wise === "datewise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              onclick={getRows}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "GatePass Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div
        style={{
          height: "90%",
          padding: "0px 10px",
        }}
      >
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
