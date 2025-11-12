import { useState, useEffect } from "react";
import { Col, Input, Row, Space } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { getClientOptions } from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import CustomButton from "../../new/components/reuseable/CustomButton";
import { Download, Print, Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, IconButton, LinearProgress } from "@mui/material";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
//
const WoCompleted = () => {
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);

  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getClientOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const printwocompleted = async (row) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/print_wo_completed_list",
        {
          transaction: row.transactionId,
        }
      );
      const { data } = response;
      printFunction(response.data.data.buffer.data);
      toast.success(data.message);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadwocompleted = async (row) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/print_wo_completed_list",
        {
          transaction: row.transactionId,
        }
      );
      const { data } = response;
      downloadFunction(response.data.data.buffer.data);
      toast.success(data.message);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/fetch_wo_completed_list",
        {
          wise: wise,
          data: searchInput,
        }
      );
      const { data } = response;
      const arr = data.data.map((row, index) => ({
        id: index + 1,
        date: row.date,
        requiredQty: row.ord_qty,
        sku: row.sku_code,
        product: row.sku_name,
        transactionId: row.transaction_id,
      }));
      setRows(arr);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
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
    renderRowActions: ({ row }) => {
      <div>
        <IconButton color="inhert" onClick={() => printwocompleted(row)}>
          <Print fontSize="small" />
        </IconButton>
        <IconButton
          color="inhert"
          onClick={() => {
            downloadwocompleted(row);
          }}
        >
          <Download fontSize="small" />
        </IconButton>
      </div>;
    },

    muiTableContainerProps: {
      sx: {
        height:
          loading === "fetch" ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
    <div style={{ height: "90%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }} justify="space-between">
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <div style={{ width: 200 }}>
                  <MySelect
                    onChange={setWise}
                    options={wiseOptions}
                    value={wise}
                    placeholder="Select Wise"
                  />
                </div>
                {wise === wiseOptions[0].value && (
                  <div style={{ width: 270 }}>
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={setSearchInput}
                      loadOptions={handleClientOptions}
                    />
                  </div>
                )}
                {wise === wiseOptions[1].value && (
                  <MyDatePicker setDateRange={setSearchInput} />
                )}
                {wise === wiseOptions[2].value && (
                  <div style={{ width: 270 }}>
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                )}

                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading === "fetch"}
                  onclick={getRows}
                />
              </Space>
            </div>
          </Space>
        </Col>
        <CommonIcons
          action="downloadButton"
          type="primary"
          onClick={() => {
            downloadCSV(rows, downldcolumns, "Challan Report");
          }}
        />
      </Row>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

const wiseOptions = [
  {
    text: "Client Wise",
    value: "clientwise",
  },
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Work Order Wise",
    value: "wo_sfg_wise",
  },
];

const columns = [
  {
    header: "#",

    accessorKey: "id",
  },
  {
    header: "Date",

    accessorKey: "date",
  },
  {
    header: "SKU",

    accessorKey: "sku",
  },
  {
    header: "Product",

    accessorKey: "product",
  },
  {
    header: "Wo Number",

    accessorKey: "transactionId",
  },
  {
    header: "Quantity",

    accessorKey: "requiredQty",
  },
];
const downldcolumns = [
  {
    headerName: "Date",
    Width: 130,
    field: "date",
  },
  {
    headerName: "SKU",
    width: 100,
    field: "sku",
  },
  {
    headerName: "Product",
    width: 200,
    field: "product",
  },
  {
    headerName: "Wo Number",
    width: 200,
    field: "transactionId",
  },
  {
    headerName: "Quantity",
    width: 150,
    field: "requiredQty",
  },
];

export default WoCompleted;
