import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SelectChallanTypeModal from "./components/WoCreateChallan/SelectChallanTypeModal";
import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { getClientOptions } from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import MyButton from "../../Components/MyButton";
//
const WoCompleted = () => {
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => printwocompleted(row)}
        label="Print"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          downloadwocompleted(row);
        }}
        label="Download"
      />,
    ],
  };
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

                <MyButton
                  variant="search"
                  onClick={getRows}
                  loading={loading === "fetch"}
                  type="primary"
                >
                  Fetch
                </MyButton>
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
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={[actionColumn, ...columns]}
        />
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

// id: index + 1,
//         date: row.date,
//         requiredQty: row.ord_qty,
//         sku: row.sku_name,
//         product: row.sku_code,
//         transactionId:
const columns = [
  {
    headerName: "#",
    flex: 1,
    field: "id",
  },
  {
    headerName: "Date",
    flex: 1,
    field: "date",
  },
  {
    headerName: "SKU",
    flex: 1,
    field: "sku",
  },
  {
    headerName: "Product",
    flex: 1,
    field: "product",
  },
  {
    headerName: "Wo Number",
    flex: 1,
    field: "transactionId",
  },
  {
    headerName: "Quantity",
    flex: 1,
    field: "requiredQty",
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
