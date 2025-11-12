import { Col, Row, Space, Typography, Divider, Skeleton } from "antd";
import { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

const Q3 = () => {
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

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
    <div style={{ height: "90%", margin: 12 }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ width: 250 }}>
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

            <CustomButton
              size="small"
              title={"Search"}
              starticon={<Search fontSize="small" />}
              loading={loading === "fetch"}
              disabled={!searchInput || searchInput.length === 0}
              onclick={getRows}
            />
          </Space>
        </Col>
        <CommonIcons
          action="downloadButton"
          type="primary"
          onClick={() => downloadCSV(rows, columns, "Q3 Report")}
        />
      </Row>
      <Row style={{ height: "95%", marginTop: 12 }} gutter={6}>
        <Col span={6}>
          <Row>
            <Col span={24}>
              <CustomFieldBox title={"Stock Details"}>
                <Row gutter={[0, 6]}>
                  <Col span={24}>
                    <Row>
                      <Col span={24}>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Product :
                        </Typography.Text>
                      </Col>
                      <Col span={24}>
                        {loading !== "fetch" && (
                          <Typography.Text style={{ fontSize: "0.8rem" }}>
                            {details.product} - {details.sku}
                          </Typography.Text>
                        )}
                        {loading === "fetch" && (
                          <Skeleton.Input size="small" block active />
                        )}
                      </Col>
                    </Row>
                  </Col>
                  <Divider style={{ marginTop: 5, marginBottom: 5 }} />
                  <Col span={24}>
                    <Row>
                      <Col span={24}>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Closing Stock :
                        </Typography.Text>
                      </Col>
                      <Col span={24}>
                        {loading !== "fetch" && (
                          <Typography.Text style={{ fontSize: "0.8rem" }}>
                            {details.stock} {details.uom}
                          </Typography.Text>
                        )}
                        {loading === "fetch" && (
                          <Skeleton.Input size="small" block active />
                        )}
                      </Col>
                    </Row>
                    <Divider style={{ marginTop: 5, marginBottom: 5 }} />
                    <Row>
                      <Col span={24}>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Not Okay Pending Stock :
                        </Typography.Text>
                      </Col>
                      <Col span={24}>
                        {loading !== "fetch" && (
                          <Typography.Text style={{ fontSize: "0.8rem" }}>
                            {details.pending} {details.uom}
                          </Typography.Text>
                        )}
                        {loading === "fetch" && (
                          <Skeleton.Input size="small" block active />
                        )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CustomFieldBox>
            </Col>
          </Row>
        </Col>
        <Col span={18}>
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
};

const columns = [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 150,
  },
  {
    header: "Type",
    accessorKey: "transaction_type",
    size: 50,
    renderCell: (a) =>
      a.row.type ==
      '<span class="d-inline-block radius-round p-2 bgc-red"></span>' ? (
        <div
          style={{
            height: "15px",
            size: "15px",
            borderRadius: "50px",
            backgroundColor: "#FF0032",
          }}
        ></div>
      ) : (
        <div
          style={{
            height: "15px",
            size: "15px",
            borderRadius: "50px",
            backgroundColor: "#227C70",
          }}
        ></div>
      ),
  },
  {
    header: "Qty",
    accessorKey: "qty",
    size: 100,
  },

  {
    header: "UoM",
    accessorKey: "uom",
    size: 70,
  },
  {
    header: "Created / Approved By",
    accessorKey: "doneby",
    size: 180,
    renderCell: ({ row }) => <ToolTipEllipses text={row.doneby} />,
    flex: 1,
  },

  {
    header: "Remarks",
    accessorKey: "remark",
    size: 180,
    renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
    flex: 1,
  },
  {
    header: "Transaction",
    accessorKey: "txn",
    renderCell: ({ row }) => <ToolTipEllipses text={row.txn} />,
    size: 250,
  },
];

export default Q3;
