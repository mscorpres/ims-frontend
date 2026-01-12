import {
  Col,
  Row,
  Space,
  Button,
  Card,
  Typography,
  Divider,
  Skeleton,
} from "antd";
import { useEffect, useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";
import MySelect from "../../../Components/MySelect";

const Q3 = () => {
  const [searchInput, setSearchInput] = useState("");
  const [location, setLocation] = useState("");
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const getLocations = async () => {
    const { data } = await imsAxios.get("/ppr/mfg_locations");
    const arr = [];
    data.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationOptions(arr);
  };

  useEffect(() => {
    getLocations();
  }, []);

  const getProductOptions = async (search) => {
    try {
      let arr = [];
      setLoading("select");
      const { data } = await imsAxios.post("/backend/getProductByNameAndNo", {
        search,
      });
      setLoading(false);
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } catch (error) {
      setAsyncOptions([]);
    }
  };
  const removeHtml = (value) => {
    return value.replace(/<[^>]*>/g, " ");
  };
  const getRows = async () => {
    try {
      setLoading("fetch");
      setDetails({});
      setRows([]);
      const { data } = await imsAxios.post("/skuQueryA/fetchSKU_logs", {
        sku_code: searchInput,
        location: location,
      });
      if (data) {
        const { data1, data2 } = data.response;
        const detailsObj = {
          stock: data1.closingqty,
          product: data1.product,
          pending: data1.pendingfgReturnQty,
          sku: data1.sku,
          uom: data1.uom,
        };

        const arr = data2.map((row, index) => ({
          ...row,
          id: index + 1,
          txn: removeHtml(row.txn),
        }));
        setRows(arr);

        setDetails(detailsObj);
      }
    } catch (error) {
      console.log("Some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ height: "92%" }}>
      <Row justify="end" style={{ padding: 8, paddingTop: 0 }}>
        <CommonIcons
          action="downloadButton"
          type="primary"
          onClick={() => downloadCSV(rows, columns, "Q3 Report")}
        />
      </Row>

      <Row style={{ height: "90%",  }} gutter={8}>
        <Col span={6} style={{ height: "100%", overflow: "auto" }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Filters */}
            <Card size="small" title="Filters">
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div>
                  <Typography.Text type="secondary">
                    Product Name
                  </Typography.Text>
                  <MyAsyncSelect
                    placeholder="Enter Product Name"
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={getProductOptions}
                    optionsState={asyncOptions}
                    onChange={setSearchInput}
                    selectLoading={loading === "select"}
                    value={searchInput}
                  />
                </div>

                <div>
                  <Typography.Text type="secondary">Location</Typography.Text>
                  <MySelect
                    value={location}
                    onChange={setLocation}
                    options={locationOptions}
                  />
                </div>

                <MyButton
                  variant="search"
                  loading={loading === "fetch"}
                  disabled={!searchInput}
                  onClick={getRows}
                  type="primary"
                  block
                >
                  Fetch
                </MyButton>
              </Space>
            </Card>

            {/* Stock Details */}
            <Card size="small" title="Stock Details">
              <Row gutter={[0, 6]}>
                <Col span={24}>
                  <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                    Product:
                  </Typography.Text>
                  <br />
                  {loading !== "fetch" ? (
                    <Typography.Text style={{ fontSize: "0.8rem" }}>
                      {details.product ?? "--"} - {details.sku ?? "--"}
                    </Typography.Text>
                  ) : (
                    <Skeleton.Input size="small" block active />
                  )}
                </Col>

                <Divider />

                <Col span={24}>
                  <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                    Closing Stock:
                  </Typography.Text>
                  <br />
                  {loading !== "fetch" ? (
                    <Typography.Text style={{ fontSize: "0.8rem" }}>
                      {details.stock ?? "--"} {details.uom ?? "--"}
                    </Typography.Text>
                  ) : (
                    <Skeleton.Input size="small" block active />
                  )}
                </Col>

                <Divider />

                <Col span={24}>
                  <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                    Not Okay Pending Stock:
                  </Typography.Text>
                  <br />
                  {loading !== "fetch" ? (
                    <Typography.Text style={{ fontSize: "0.8rem" }}>
                      {details.pending ?? "--"} {details.uom ?? "--"}
                    </Typography.Text>
                  ) : (
                    <Skeleton.Input size="small" block active />
                  )}
                </Col>

                <Divider />

                <Col span={24}>
                  <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                    Opening Stock:
                  </Typography.Text>
                  <br />
                  <Typography.Text style={{ fontSize: "0.8rem" }}>
                    --
                  </Typography.Text>
                </Col>

                <Col span={24}>
                  <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                    Last Rate:
                  </Typography.Text>
                  <br />
                  <Typography.Text style={{ fontSize: "0.8rem" }}>
                    --
                  </Typography.Text>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>

        {/* RIGHT COLUMN – TABLE */}
        <Col span={18}>
          <MyDataTable
            loading={loading === "fetch"}
            columns={columns}
            data={rows}
          />
        </Col>
      </Row>
    </div>
  );
};

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 150,
  },
  {
    headerName: "Type",
    field: "transaction_type",
    width: 150,
    renderCell: (a) =>
      a.row.type ==
      '<span class="d-inline-block radius-round p-2 bgc-red"></span>' ? (
        <div
          style={{
            height: "15px",
            width: "15px",
            borderRadius: "50px",
            backgroundColor: "#FF0032",
          }}
        ></div>
      ) : (
        <div
          style={{
            height: "15px",
            width: "15px",
            borderRadius: "50px",
            backgroundColor: "#227C70",
          }}
        ></div>
      ),
  },
  {
    headerName: "Transaction",
    field: "txn",
    renderCell: ({ row }) => <ToolTipEllipses text={row.txn} />,
    width: 250,
  },
  {
    headerName: "Qty IN",
    field: "qty_in",
    width: 200,
  },
  {
    headerName: "Qty out",
    field: "qty_out",
    width: 200,
  },
  {
    headerName: "IN Rate",
    field: "qty_in_rate",
    width: 200,
  },
  {
    headerName: "Out Rate",
    field: "out_rate",
    width: 200,
  },
  {
    headerName: "Weighted Average",
    field: "weightedSKURate",
    width: 200,
  },
  {
    headerName: "Method",
    field: "method",
    width: 200,
    renderCell: ({ row }) => <ToolTipEllipses text={"--"} />,
  },
  {
    headerName: "Location IN",
    field: "location_in",
    width: 200,
    renderCell: ({ row }) => <ToolTipEllipses text={"--"} />,
  },
  {
    headerName: "Location OUT",
    field: "location_out",
    width: 200,
    renderCell: ({ row }) => <ToolTipEllipses text={"--"} />,
  },
  {
    headerName: "UoM",
    field: "uom",
    width: 70,
  },
  {
    headerName: "Created / Approved By",
    field: "doneby",
    minWidth: 250,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={`${row.created_by} / ${row.approved_by}`} />
    ),
    flex: 1,
  },

  {
    headerName: "Remarks",
    field: "remark",
    minWidth: 180,
    renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
    flex: 1,
  },
];

export default Q3;
