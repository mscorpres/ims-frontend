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

  return (
    <div style={{ height: "90%", paddingRight: 10, paddingLeft: 10 }}>
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
          </Col>
        </Row>
      </Col>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={[actionColumn, ...columns]}
        />
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
    headerName: "#",
    field: "index",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 150,
  },
  {
    headerName: "Client",
    field: "client",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Client WO ID",
    field: "transactionId",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 250,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 250,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Qty",
    field: "requiredQty",
    width: 150,
  },
];

export default WoCreateChallan;
