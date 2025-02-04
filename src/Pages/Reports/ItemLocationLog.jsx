import { useState } from "react";
import {
  Tooltip,
  Card,
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
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import { getComponentOptions } from "../../api/general.ts";
import useApi from "../../hooks/useApi.ts";
import MyButton from "../../Components/MyButton";
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

  //getting components options
  const getComponentOption = async (search) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    // setLoading(false);
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
            weightedPurchaseRateCurrency: row.weightedPurchaseRateCurrency ?? "-",
            ...row,
          }));
          let bomDetailsArr = [];
          for (const key in bomDetails) {
            // console.log("key", key);
            // console.log("bomDetails", bomDetails);
            let obj = {
              // product: key[0].product,
              sku: key,
              bom: bomDetails[key].map((row) => ({
                name: row.bom_name,
                qty: row.bom_qty,
              })),
              product: bomDetails[key].map((row) => row.product),
            };
            bomDetailsArr = [...bomDetailsArr, obj];
          }
          // console.log("bomDetailsArr", bomDetailsArr);
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
      headerName: "#",
      field: "index",
      width: 30,
    },
    {
      headerName: "Date",
      field: "date",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
    },
    {
      headerName: "Type",
      field: "transaction_type",
      width: 30,
      renderCell: ({ row }) => (
        <div
          style={{
            height: "15px",
            width: "15px",
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
      headerName: "Transaction",
      field: "transaction",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction} copy={true} />
      ),
    },
    {
      headerName: "Qty In",
      field: "qty_in",
      width: 120,
    },
    {
      headerName: "Qty Out",
      field: "qty_out",
      width: 120,
    },
    {
      headerName: "Qty In Rate",
      field: "qty_in_rate",
      width: 120,
    },
    {
      headerName: "Weighted Purchase Rate",
      field: "weightedPurchaseRate",
      width: 180,
      renderCell: ({ row }) => (
        <Tooltip
          title={row.weightedPurchaseRateCurrency}
        >
          {row.weightedPurchaseRate}
        </Tooltip>
      ),
    },
    {
      headerName: "Method",
      field: "mode",
      width: 120,
    },
    {
      headerName: "Loc In",
      field: "location_in",
      width: 120,
    },
    {
      headerName: "Loc Out",
      field: "location_out",
      width: 120,
    },
    {
      headerName: "Doc Type",
      field: "vendortype",
      width: 120,
    },
    {
      headerName: "Vendor",
      field: "vendorname",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendorname} />,
    },
    {
      headerName: "Vendor Code",
      field: "vendorcode",
      minWidth: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendorcode} copy={true} />
      ),
    },
    {
      headerName: "Created/Approved By",
      field: "doneby",
      minWidth: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.doneby} />,
    },
    {
      headerName: "Remark",
      field: "remark",
      width: 400,
    },
  ];

  return (
    <Row gutter={6} style={{ padding: "0px 5px", height: "90%" }}>
      <Col span={4} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
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
                        <MyButton
                          variant="search"
                          loading={loading === "fetch"}
                          htmlType="submit"
                          block
                          type="primary"
                        >
                          Fetch
                        </MyButton>
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
            </Card>
          </Col>
          <Col span={24}>
            <SummaryCard
              title="Component Stock"
              loading={loading === "fetch"}
              summary={summaryData}
            />
          </Col>
          <Col style={{ height: "100%", overflow: "auto" }} span={24}>
            <Card title="BOM Details" size="small">
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
            </Card>
            <Card title="Similar Components" size="small">
              <Collapse loading={loading}>
                {altDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.partName} `}
                    key={row.partName}
                  >
                    {/* {altDetails?.length === 0 && (
                      <Row key={row.name} justify="space-between">
                        <Col>
                          <Typography.Text
                            style={{ fontSize: "0.8rem" }}
                            type="secondary"
                          >
                            No Data found.
                          </Typography.Text>
                        </Col>
                      </Row>
                    )} */}
                    {/* {altDetails &&
                      altDetails?.map((row) => ( */}
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
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
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
