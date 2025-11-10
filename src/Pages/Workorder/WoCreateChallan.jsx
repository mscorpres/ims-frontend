import { useState, useEffect } from "react";
import { Col, Input, Row, Space, Button, Spin, Form } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SelectChallanTypeModal from "./components/WoCreateChallan/SelectChallanTypeModal";
import CreateChallanModal from "./components/WoCreateChallan/CreateChallanModal";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { getClientOptions, getWorkOrderAnalysis } from "./components/api";
import Loading from "../../Components/Loading";
import MyButton from "../../Components/MyButton";
import CustomButton from "../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
const WoCreateChallan = () => {
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [detaildata, setDetailData] = useState("");

  const [rtnchallan, setRtnChallan] = useState(false);
  const [challanForm] = Form.useForm();
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          setDetailData(row);
          setShowTypeSelect(true);
        }}
        label="Create"
      />,
    ],
  };

  const getRows = async () => {
    try {
      setLoading("fetch");
      const arr = await getWorkOrderAnalysis(wise, searchInput);
      setRows(arr);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

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
  const close = () => {
    setShowCreateChallanModal(false);
    challanForm.resetFields();
    setRtnChallan(false);
  };
  //
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
    <div style={{ height: "90%", margin:12 }}>
      {loading === "fetch" && <Loading />}
      <Col span={24}>
        <Row>
          <Col>
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
          </Col>
        </Row>
      </Col>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        {/* <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={[actionColumn, ...columns]}
        /> */}
        <MaterialReactTable table={table} />
      </div>

      <SelectChallanTypeModal
        type={showCreateChallanModal}
        setType={setShowCreateChallanModal}
        show={showTypeSelect}
        close={() => setShowTypeSelect(false)}
        typeOptions={typeOptions}
      />
      <CreateChallanModal
        show={showCreateChallanModal}
        data={detaildata}
        close={close}
        challanForm={challanForm}
        setRtnChallan={setRtnChallan}
        rtnchallan={rtnchallan}
        setDetailData={setDetailData}
      />
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
const typeOptions = [
  {
    text: "Create shipment",
    value: "shipment",
  },
  {
    text: "Return Challan",
    value: "return",
  },
];
const columns = [
  {
    header: "#",
    accessorKey: "index",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 150,
  },
  {
    header: "Client",
    accessorKey: "client",
    size: 150,
  },
  {
    header: "Client WO ID",
    accessorKey: "transactionId",
    size: 150,

    render: ({ row }) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    header: "Product",
    accessorKey: "product",
    size: 250,

    render: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    size: 250,
    render: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    header: "Qty",
    accessorKey: "requiredQty",
    size: 150,
  },
];

export default WoCreateChallan;
