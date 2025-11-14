import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Row, Space, Form, Drawer } from "antd";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { downloadCSV } from "../../../Components/exportToCSV";
import { DownloadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect } from "react";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import Loading from "../../../Components/Loading";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction from "../../../Components/printFunction";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Print, Search, Visibility } from "@mui/icons-material";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";

function MesQcaReport() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState();
  const [loading, setLoading] = useState(false);
  const [processOptions, setProcessOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [showViewModel, setShowViewModal] = useState(false);
  const [detailData, setDetailData] = useState([]);

  const [qcReportForm] = Form.useForm();
  const ppr = Form.useWatch("ppr", qcReportForm);
  const status = Form.useWatch("status", qcReportForm);

  const Generateqrforlot = async (row) => {
    try {
      var ltype;
      const pname = qcReportForm.getFieldValue("process");
      {
        status === "A" ? (ltype = "PASS") : (ltype = "FAIL");
      }
      const generateqrdata = {
        Lot_Number: row.lot,
        Lot_qty: row.barcodes.length,
        Lot_type: ltype,
        PPR_No: ppr,
        Sku: row.sku,
        Process: pname.label,
      };
      setLoading("fetch");
      const response = await imsAxios.post(
        "qcalable/generateQcaLableforlot",
        generateqrdata
      );
      printFunction(response.data.data.buffer.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };


  const statusOptions = [
    { text: "Pass", value: "A" },
    { text: "Fail", value: "R" },
  ];
  const getPprOptions = async (search) => {
    try {
      setLoading("select");
      const response = await imsAxios.post("/createqca/getPprNo", {
        searchTerm: search,
      });
      const { data } = response;
      if (data) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getPPRDetails = async (ppr) => {
    try {
      setLoading("fetch");
      let sku;
      // getting sku from ppr
      const response = await imsAxios.post("/createqca/fetchPprDetails", {
        ppr_no: ppr,
      });
      const { data } = response;
      if (data) {
        sku = data.data[0].product_sku;
      }

      // getting process list from sku
      const processResponse = await imsAxios.post(
        "/qaProcessmaster/fetchQAProcess",
        {
          sku,
        }
      );

      const { data: processData } = processResponse;
      if (processData) {
        const arr = processData.data.map((row) => ({
          text: row.process.name,
          value: row.process.key,
        }));

        setProcessOptions(arr);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  const getRows = async () => {
    try {
      setRows([]);
      const values = await qcReportForm.validateFields();
      let url = "";
      if (values.status === "A") {
        url = "/createqca/fetchPassedPCB";
      } else if (values.status === "R") {
        url = "/createqca/fetchFailedPCB";
      }
      setLoading("rows");
      const response = await imsAxios.post(url, {
        qca_ppr: values.ppr,
        qca_process: values.process.value,
        data: values.date,
      });
      const { data } = response;
      if (data.status === "error") {
        toast.error(data.message);
      } else if (data.status === "success") {
        if (data.response.data) {
          const arr = data.response.data.map((row, index) => {
            const date = row.barcode[0].insert_dt.split(" ");
            const qty = row.barcode.length;
            return {
              key: index,
              id: index,
              qty: qty,
              index: index + 1,
              bomId: row.bom_id,
              bomName: row.bom_name,
              failReason: row.fail_reason ?? "--",
              sku: row.sku,
              locId: row.to_loc ?? "",
              locName: row.to_loc ?? "",
              barcodes: row.barcode,
              product: row.product_name,
              processLevel: row.process_level,
              lot: row.lot_no,
              processLoc: row.process_loc,
              sfg: row.sfg,
              date: date[0],
            };
          });
          setRows(arr);
        }
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ppr) {
      getPPRDetails(ppr);
    }
  }, [ppr]);
  const extraColumn = {
    headerName: "Fail reason",
    width: 350,
    field: "failReason",
    renderCell: ({ row }) => <ToolTipEllipses text={row.failReason} />,
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
      <div>
        <Tooltip title="View">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              setDetailData(row);
              setShowViewModal(true);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print lot qr ">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              Generateqrforlot(row);
            }}
          >
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    ),
    muiTableContainerProps: {
      sx: {
        height: searchLoading ? "calc(100vh - 270px)" : "calc(100vh - 320px)",
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
    <>
      <div style={{ height: "90%", margin: 12 }}>
        <Row justify="space-between">
          {loading === "fetch" && <Loading />}
          <Form
            form={qcReportForm}
            layout="vertical"
            initialValues={defaultValues}
          >
            <div>
              <Space>
                <div style={{ width: 200 }}>
                  <Form.Item name="ppr" label="PPR Number" rules={rules.ppr}>
                    <MyAsyncSelect
                      loadOptions={getPprOptions}
                      onBlur={() => setAsyncOptions([])}
                      selectLoading={loading === "select"}
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </div>
                <div style={{ width: 200 }}>
                  <Form.Item
                    name="process"
                    label="Select Process"
                    rules={rules.process}
                  >
                    <MySelect labelInValue options={processOptions} />
                  </Form.Item>
                </div>
                <div style={{ width: 200 }}>
                  <Form.Item name="status" label="Status" rules={rules.status}>
                    <MySelect options={statusOptions} />
                  </Form.Item>
                </div>
                <div style={{ width: 240 }}>
                  <Form.Item name="date" label="Date" rules={rules.date}>
                    <MyDatePicker
                      setDateRange={(value) =>
                        qcReportForm.setFieldValue("date", value)
                      }
                    />
                  </Form.Item>
                </div>
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading === "rows"}
                  onclick={getRows}
                />
              </Space>
            </div>
          </Form>
          <Space>
            <Button
              type="primary"
              onClick={() =>
                downloadCSV(
                  rows,
                  status === "R" ? [...columns, extraColumn] : columns,
                  "Final QC Report"
                )
              }
              shape="circle"
              icon={<DownloadOutlined />}
              disabled={rows.length == 0}
            />
          </Space>
        </Row>
        <div style={{ height: "80%" }}>
          {/* <MyDataTable
            columns={[actionColumn, ...columns]}
            data={rows}
            loading={searchLoading}
          /> */}
          <MaterialReactTable table={table} />
        </div>
      </div>
      <ViewModal
        show={showViewModel}
        setshow={setShowViewModal}
        detaildata={detailData}
        status={status}
      />
    </>
  );
}
const columns = [
  {
    header: "#",
    width: 50,
    accessorKey: "index",
  },
  {
    header: "Lot Size",
    width: 100,
    accessorKey: "qty",
  },
  {
    header: "Date",
    width: 100,
    accessorKey: "date",
  },
  {
    header: "Lot No.",
    width: 180,
    accessorKey: "lot",
    render: ({ row }) => <ToolTipEllipses text={row.lot} />,
  },
  {
    header: "SKU",
    width: 180,
    accessorKey: "sku",
    render: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    header: "Product",
    flex: 1,
    minWidth: 200,
    accessorKey: "product",
    render: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    header: "BOM",
    flex: 1,
    minWidth: 200,
    accessorKey: "bomName",
    render: ({ row }) => <ToolTipEllipses text={row.bomName} />,
  },
  {
    header: "SFG",
    width: 150,
    accessorKey: "sfg",
    render: ({ row }) => <ToolTipEllipses text={row.sfg} />,
  },
  {
    header: "Process Location",
    width: 120,
    accessorKey: "processLoc",
    render: ({ row }) => <ToolTipEllipses text={row.processLoc} />,
  },
  {
    header: "Process Level",
    width: 120,
    accessorKey: "processLevel",
    render: ({ row }) => <ToolTipEllipses text={row.processLevel} />,
  },
  {
    header: "To Location",
    flex: 1,
    accessorKey: "locName",
    // renderCell: ({ row }) => <ToolTipEllipses text={row.locName} />,
  },
];

const defaultValues = {
  ppr: "",
  process: "",
  status: "A",
};

const rules = {
  ppr: [{ required: true, message: "Please select PPR Number" }],
  process: [{ required: true, message: "Please select Process" }],
  status: [{ required: true, message: "Please select Status" }],
  date: [{ required: true, message: "Please select Date" }],
};

export default MesQcaReport;

const ViewModal = ({ show, setshow, detaildata, status }) => {
  var arr = detaildata.barcodes?.map((row, index) => ({
    id: index,
    index: index + 1,
    barcode: row.barcode,
    lot: row.insert_dt,
    failReason: row.fail_reason,
  }));

  console.log(arr);

  const viewcolumns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
    },
    {
      headerName: "QR No.",
      width: 180,
      field: "barcode",
    },
    {
      headerName: "Date and Time",
      width: 180,
      field: "lot",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.barcodes.insert_dt} />,
    },
  ];
  const extraColumn = {
    headerName: "Fail reason",
    width: 350,
    field: "failReason",
    // renderCell: ({ row }) => <ToolTipEllipses />,
  };
  return (
    <Drawer
      width="50vw"
      title={`Lot QR Scanned ${detaildata.lot}`}
      onClose={() => {
        setshow(false);
      }}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() =>
              downloadCSV(
                arr,
                status === "R"
                  ? [...viewcolumns, extraColumn]
                  : [...viewcolumns],
                "Lot Report"
              )
            }
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={arr?.length == 0}
          />
        </Space>
      }
      open={show}
      bodyStyle={{ paddingTop: 5 }}
    >
      <MyDataTable
        columns={
          status === "R" ? [...viewcolumns, extraColumn] : [...viewcolumns]
        }
        data={arr}
      />
    </Drawer>
  );
};
