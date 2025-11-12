import { useState } from "react";
import {
  Tooltip,
  Col,
  Collapse,
  Divider,
  Form,
  Row,
  Typography,
} from "antd";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import { getComponentOptions } from "../../api/general.ts";
import useApi from "../../hooks/useApi.ts";
import CustomFieldBox from "../../new/components/reuseable/CustomFieldBox.jsx";
import { Search } from "@mui/icons-material";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback.jsx";
const initialSummaryData = [
  { title: "Component", description: "--" },
  { title: "Part Code", description: "--" },
  {
    title: "Closing",
    description: "--",
  },
  {
    title: "Last In (Date)",
    description: "--",
  },
  { title: "Last Rate", description: "--" },
  { title: "Last Vendor", description: "--" },
  { title: "Last Entry By", description: "--" },
  { title: "Last Entry Date", description: "--" },
  { title: "Last Remark", description: "--" },
];

export default function ItemLocationLog() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [bomDetails, setBomDetails] = useState([]);
  const [altDetails, setAltDetails] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [summaryData, setSummaryData] = useState(initialSummaryData);
  const { executeFun, loading: loading1 } = useApi();
  // initializing searh form
  const [searchForm] = Form.useForm();
  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    getData(response);
  };

  // getting location options
  const getLocatonOptions = async (search) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };

  // getting data from response for setting async options for async select
  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    }
  };
  const getDetails = async (values) => {
    setLoading(true);
    const response = await imsAxios.post("/report/common/altpartDetails", {
      component: values.component,
      location: values.location,
    });
    const { data } = response;
    if (response.success) {
      setAltDetails(data);
      setLoading(false);
    }
    setLoading(false);
  };
  // getting rows
  const getRows = async (values) => {
    try {
      setLoading("fetch");
      setSummaryData(initialSummaryData);
      setRows([]);

      const response = await imsAxios.post("/itemQueryL", {
        location: values.location,
        part_code: values.component,
      });
      getDetails(values);
      const { data } = response;
      const {
        header,
        bom_details,
        body,
        last_physical_entry_by,
        last_physical_entry_dt,
        last_remark,
      } = data.data;
      console.log("this is the header", header);
      if (data) {
        if (data.code === 200) {
          const bomDetails = bom_details;
          const arr = body.map((row, index) => ({
            index: index + 1,
            id: v4(),
            qty_in_rate: row.qty_in_rate ?? "-",
            weightedPurchaseRate: row.weightedPurchaseRate ?? "-",
            weightedPurchaseRateCurrency:
              row.weightedPurchaseRateCurrency ?? "-",
            ...row,
          }));
          let bomDetailsArr = [];
          for (const key in bomDetails) {
            let obj = {
              sku: key,
              bom: bomDetails[key].map((row) => ({
                name: row.bom_name,
                qty: row.bom_qty,
              })),
              product: bomDetails[key].map((row) => row.product),
            };
            bomDetailsArr = [...bomDetailsArr, obj];
          }
          setBomDetails(bomDetailsArr);
          setRows(arr);
          setSummaryData([
            { title: "Component", description: header.component },
            { title: "Part Code", description: header?.partno },
            { title: "Attribute Code", description: header?.unique_id },
            { title: "MFG Code", description: header?.mfgCode },
            {
              title: "Closing",
              description: header.closingqty + " " + header.uom,
            },
            {
              title: "Last In (Date)",
              description: header.last_date ?? "--",
            },
            { title: "Last Rate", description: header.lastRate },
            { title: "Last Vendor", description: header.lastVendor },
            { title: "Last Entry By", description: last_physical_entry_by },
            { title: "Last Entry Date", description: last_physical_entry_dt },
            { title: "Last Remark", description: last_remark },
          ]);
        } else {
          setBomDetails([]);
          setRows([]);
          setSummaryData(initialSummaryData);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // columns
  let columns = [
    {
      header: "#",
      accessorKey: "index",
      size: 30,
    },
    {
      header: "Date",
      accessorKey: "date",
      size: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
    },
    {
      header: "Type",
      accessorKey: "transaction_type",
      size: 30,
      renderCell: ({ row }) => (
        <div
          style={{
            height: "15px",
            size: "15px",
            borderRadius: "50px",
            backgroundColor:
              row.transaction_type === "CONSUMPTION"
                ? "#678983"
                : row.transaction_type === "INWARD"
                ? "#59CE8F"
                : row.transaction_type === "TRANSFER"
                ? "#FFB100"
                : row.transaction_type === "ISSUE"
                ? "#DD5353"
                : row.transaction_type === "JOBWORK"
                ? "#DD5353"
                : row.transaction_type === "CANCELLED" && "#36454F",
          }}
        />
      ),
    },
    {
      header: "Transaction",
      accessorKey: "transaction",
      size: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction} copy={true} />
      ),
    },
    {
      header: "Qty In",
      accessorKey: "qty_in",
      size: 120,
    },
    {
      header: "Qty Out",
      accessorKey: "qty_out",
      size: 120,
    },
    {
      header: "Qty In Rate",
      accessorKey: "qty_in_rate",
      size: 120,
    },
    {
      header: "Out Rate",
      accessorKey: "out_rate",
      size: 120,
    },

    {
      header: "Weighted Average Rate",
      accessorKey: "weightedPurchaseRate",
      size: 120,
      renderCell: ({ row }) => (
        <Tooltip title={row.weightedPurchaseRateCurrency}>
          {row.weightedPurchaseRate}
        </Tooltip>
      ),
    },
    {
      header: "Method",
      accessorKey: "mode",
      size: 120,
    },
    {
      header: "Loc In",
      accessorKey: "location_in",
      size: 120,
    },
    {
      header: "Loc Out",
      accessorKey: "location_out",
      size: 120,
    },
    {
      header: "Doc Type",
      accessorKey: "vendortype",
      size: 120,
    },
    {
      header: "Vendor",
      accessorKey: "vendorname",
      size: 150,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendorname} />,
    },
    {
      header: "Vendor Code",
      accessorKey: "vendorcode",
      size: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendorcode} copy={true} />
      ),
    },
    {
      header: "Created/Approved By",
      accessorKey: "doneby",
      size: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.doneby} />,
    },
    {
      header: "Remark",
      accessorKey: "remark",
      size: 400,
    },
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
        height:
          loading === "fetch" ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
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
    <Row gutter={6} style={{ margin: 12, height: "calc(100vh - 180px)" }}>
      <Col
        span={6}
        style={{ height: "calc(100vh - 120px)", overflowY: "auto" }}
      >
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <CustomFieldBox title="Filters">
              <Form
                onFinish={getRows}
                form={searchForm}
                initialValues={initialValues}
                layout="vertical"
              >
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label="Component"
                      rules={rules.component}
                      name="component"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getComponentOption}
                        optionsState={asyncOptions}
                        selectLoading={loading1("select")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Location"
                      rules={rules.location}
                      name="location"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getLocatonOptions}
                        optionsState={asyncOptions}
                        selectLoading={loading === "select"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={6}>
                      <Col span={20}>
                        <CustomButton
                          size="small"
                          title={"Search"}
                          starticon={<Search fontSize="small" />}
                          loading={loading === "fetch"}
                          htmlType="submit"
                        />
                      </Col>
                      <Col span={4}>
                        <CommonIcons
                          disabled={rows.length === 0}
                          onClick={() =>
                            downloadCSV(rows, columns, "Item Location Log")
                          }
                          action="downloadButton"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
            </CustomFieldBox>
          </Col>
          <Col span={24}>
            <SummaryCard
              title="Component Stock"
              loading={loading === "fetch"}
              summary={summaryData}
            />
          </Col>
          <Col style={{ height: "100%", overflow: "auto" }} span={24}>
            <CustomFieldBox title={"BOM Details"}>
              <Collapse>
                {bomDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.product} | ${row.sku} | BOM Count : ${row.bom.length}`}
                    key={row.key}
                  >
                    {row.bom?.length === 0 && (
                      <Row key={row.name} justify="space-between">
                        <Col>
                          <Typography.Text
                            style={{ fontSize: "0.8rem" }}
                            type="secondary"
                          >
                            No BOM found for this SKU
                          </Typography.Text>
                        </Col>
                      </Row>
                    )}
                    {row.bom?.length &&
                      row.bom?.map((bom) => (
                        <Row key={row.name} justify="space-between">
                          <Col>
                            <Typography.Text
                              style={{ fontSize: "0.8rem" }}
                              strong
                            >
                              BOM: {bom.name}
                            </Typography.Text>
                          </Col>
                          <Col>
                            <Typography.Text
                              style={{ fontSize: "0.8rem" }}
                              strong
                            >
                              Qty: {bom.qty}
                            </Typography.Text>
                          </Col>
                          <Divider style={{ margin: 5 }} />
                        </Row>
                      ))}
                  </Collapse.Panel>
                ))}
              </Collapse>
            </CustomFieldBox>
            <CustomFieldBox title={"Similar Components"}>
              <Collapse loading={loading}>
                {altDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.partName} `}
                    key={row.partName}
                  >
                    <Row key={row.partName} justify="space-between">
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Part: {row.partNo}
                        </Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Cat Part: {row.newPartNo}
                        </Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Closing: {row.closingQty + " " + row.uom}
                        </Typography.Text>
                      </Col>
                      <Divider style={{ margin: 5 }} />
                    </Row>
                    {/* // ))} */}
                  </Collapse.Panel>
                ))}
              </Collapse>
            </CustomFieldBox>
          </Col>
        </Row>
      </Col>
      <Col span={18}>
      
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
}

// initial form values
const initialValues = {
  component: "",
  location: "",
};

// form rules
const rules = {
  component: [{ required: true, message: "Please select a component" }],
  location: [{ required: true, message: "Please select a location" }],
};
