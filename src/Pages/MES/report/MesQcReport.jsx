import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button, Row, Space, Tooltip, Popover, Form, Drawer } from "antd";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { DownloadOutlined, MessageOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { set } from "lodash";
import { useEffect } from "react";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import Loading from "../../../Components/Loading";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MyButton from "../../../Components/MyButton";

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
  const processName = Form.useWatch("process", qcReportForm);
  const [searchInput, setSearchInput] = useState("");

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
          setShowViewModal(true);
        }}
        label="View"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          Generateqrforlot(row);
        }}
        label="Print Lot QR"
      />,
    ],
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
  return (
    <>
      <div style={{ height: "90%" }}>
        <Row
          justify="space-between"
          style={{ padding: "0px 10px", marginBottom: -15 }}
        >
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

                <MyButton
                  variant="search"
                  type="primary"
                  loading={loading === "rows"}
                  onClick={getRows}
                  id="submit"
                >
                  Search
                </MyButton>
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
        <div style={{ height: "93%", padding: "0px 10px" }}>
          <MyDataTable
            columns={[actionColumn, ...columns]}
            data={rows}
            loading={searchLoading}
          />
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
    headerName: "#",
    width: 50,
    field: "index",
  },
  {
    headerName: "Lot Size",
    width: 100,
    field: "qty",
  },
  {
    headerName: "Date",
    width: 100,
    field: "date",
  },
  {
    headerName: "Lot No.",
    width: 180,
    field: "lot",
    renderCell: ({ row }) => <ToolTipEllipses text={row.lot} />,
  },
  {
    headerName: "SKU",
    width: 180,
    field: "sku",
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Product",
    flex: 1,
    minWidth: 200,
    field: "product",
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    headerName: "BOM",
    flex: 1,
    minWidth: 200,
    field: "bomName",
    renderCell: ({ row }) => <ToolTipEllipses text={row.bomName} />,
  },
  {
    headerName: "SFG",
    width: 150,
    field: "sfg",
    renderCell: ({ row }) => <ToolTipEllipses text={row.sfg} />,
  },
  {
    headerName: "Process Location",
    width: 120,
    field: "processLoc",
    renderCell: ({ row }) => <ToolTipEllipses text={row.processLoc} />,
  },
  {
    headerName: "Process Level",
    width: 120,
    field: "processLevel",
    renderCell: ({ row }) => <ToolTipEllipses text={row.processLevel} />,
  },
  {
    headerName: "To Location",
    flex: 1,
    field: "locName",
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
