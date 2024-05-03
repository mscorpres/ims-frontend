import { Button, Input, Row, Space } from "antd";
import { CloudDownloadOutlined, PrinterFilled } from "@ant-design/icons";
import React, { useState } from "react";
import { useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MySelect from "../../../../Components/MySelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { toast } from "react-toastify";
import errorToast from "../../../../Components/errorToast";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import { GridActionsCellItem } from "@mui/x-data-grid";
import useApi from "../../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import { getVendorOptions } from "../../../../api/general.ts";
import MyButton from "../../../../Components/MyButton";

function DebitNoteReport() {
  const [wise, setWise] = useState("effectivewise");
  const [searchTerm, setSearchTerm] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Effective Date Wise", value: "effectivewise" },
    { text: "Create Date Wise", value: "datewise" },
    { text: "Vendor Wise", value: "vendorwise" },
    { text: "MIN Wise", value: "minwise" },
    { text: "VBT Wise", value: "vbtwise" },
  ];
  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/tally/vbt_report/vbt_debit_report", {
      wise: wise,
      data: searchTerm,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          id: v4(),
          index: index + 1,
          ...row,
        }));

        setRows(arr);
      } else {
        // toast.error(data.message.msg);
        toast.error(errorToast(data.message));
        setRows([]);
      }
    }
  };
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const handleCSVDownload = () => {
    downloadCSV(rows, columns, "Debit Note Report");
  };
  const handleSingleDownload = async (id) => {
    setLoading("tableLoading");
    let link = "/tally/vbt_report/print_vbt_debit_report";
    let filename = id;

    const { data } = await imsAxios.post(link, {
      debit_code: id,
    });

    downloadFunction(data.buffer.data, filename);
    setLoading(false);
  };
  const handleSinblePrint = async (id) => {
    setLoading("tableLoading");
    const { data } = await imsAxios.post(
      "/tally/vbt_report/print_vbt_debit_report",
      {
        debit_code: id,
      }
    );
    printFunction(data.buffer.data);
    setLoading(false);
  };
  const columns = [
    {
      headerName: "Actions",
      field: "actions",
      width: 200,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          disabled={loading === "tableLoading"}
          icon={<PrinterFilled className="view-icon" />}
          onClick={() => handleSinblePrint(row.debitNo)}
          label="Print"
        />,
        <GridActionsCellItem
          disabled={loading === "tableLoading"}
          icon={<CloudDownloadOutlined className="view-icon" />}
          onClick={() => {
            handleSingleDownload(row.debitNo);
          }}
          label="Delete"
        />,
      ],
    },
    {
      headerName: "Sr. No",
      field: "index",

      width: 80,
    },
    {
      headerName: "VBT Code",
      field: "vbt_code",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vbt_code} copy={true} />
      ),
      width: 200,
    },
    {
      headerName: "Debit Code",
      field: "debitNo",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.debitNo} copy={true} />
      ),
      width: 200,
    },
    {
      headerName: "Effective Date",
      field: "eff_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.eff_dt} />,
      width: 200,
    },

    {
      headerName: "MIN ID",
      field: "min_id",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.min_id} copy={true} />
      ),
    },
    {
      headerName: "PO ID",
      field: "po_id",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_id} copy={true} />,
    },
    {
      headerName: "PROJECT ID",
      field: "project_id",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.project_id} copy={true} />
      ),
    },
    // {
    //   headerName: "VBT Status",
    //   field: "status",
    //   renderCell: ({ row }) => (
    //     <span style={{ color: row.status == "Deleted" && "red" }}>
    //       {row.status}
    //     </span>
    //   ),
    //   width: 100,
    // },
    {
      headerName: "VBT Type",
      field: "type",
      width: 80,
    },
    {
      headerName: "Invoice No.",
      field: "invoice_no",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_no} />,
      width: 100,
    },
    {
      headerName: "Vendor Name",
      field: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
      width: 150,
    },
    {
      headerName: "Vendor Code",
      field: "ven_code",
      width: 100,
    },
    // {
    //   headerName: "Vendor Address",
    //   field: "ven_address",
    //   renderCell: ({ row }) => (
    //     <Tooltip title={row.ven_address}>
    //       <span>{row.ven_address}</span>
    //     </Tooltip>
    //   ),
    //   width: 120,
    // },
    {
      headerName: "Item Name",
      field: "part",
      renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
      width: 120,
    },
    {
      headerName: "Part Code",
      field: "part_code",
      width: 100,
    },
    {
      headerName: "Pending Quantity",
      field: "act_qty",
      width: 100,
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 80,
    },
    {
      headerName: "Taxable Value",
      renderCell: ({ row }) => <ToolTipEllipses text={row.taxable_value} />,
      field: "taxable_value",
      width: 100,
    },
    {
      headerName: "CGST",
      field: "cgst",
      width: 100,
    },
    {
      headerName: "SGST",
      field: "sgst",
      width: 100,
    },
    {
      headerName: "IGST",
      field: "igst",
      width: 100,
    },
    {
      headerName: "TDS",
      field: "vbt_tds_amount",
      width: 100,
    },
    {
      headerName: "Custom",
      field: "custum",
      width: 100,
    },
    {
      headerName: "Freight",
      field: "freight",
      width: 100,
    },
    {
      headerName: "Ven. Bill Amount",
      field: "ven_bill_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ven_bill_amm} />,
      width: 100,
    },
    {
      headerName: "Purchase GL",
      field: "vbt_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vbt_gl} />,
      width: 120,
    },
    {
      headerName: "CGST GL",
      field: "cgst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cgst_gl} />,
      width: 120,
    },
    {
      headerName: "SGST GL",
      field: "sgst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.sgst_gl} />,
      width: 120,
    },
    {
      headerName: "IGST GL",
      field: "igst_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.igst_gl} />,
      width: 120,
    },
    {
      headerName: "TDS GL",
      field: "tds_gl",
      renderCell: ({ row }) => <ToolTipEllipses text={row.tds_gl} />,
      width: 180,
    },
  ];
  useEffect(() => {
    setSearchTerm("");
  }, [wise]);
  useEffect(() => {
    getVendorOption(searchTerm);
  }, [searchTerm]);
  return (
    <div style={{ height: "90%", padding: 5, paddingTop: 0 }}>
      <Row justify="space-between" style={{ padding: "0px 0px" }}>
        <Space>
          <div style={{ width: 250 }}>
            <MySelect onChange={setWise} options={wiseOptions} value={wise} />
          </div>
          <div style={{ width: 250 }}>
            {wise === "effectivewise" && (
              <MyDatePicker setDateRange={setSearchTerm} />
            )}
            {wise === "datewise" && (
              <MyDatePicker setDateRange={setSearchTerm} />
            )}
            {wise === "vendorwise" && (
              <MyAsyncSelect
                value={searchTerm}
                loadOptions={getVendorOption}
                onChange={setSearchTerm}
                optionsState={asyncOptions}
                loading={loading1("select")}
              />
            )}
            {(wise === "minwise" || wise === "vbtwise") && (
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          </div>
          <MyButton
            disabled={searchTerm.length === 0 || !wise}
            type="primary"
            loading={loading === "fetch"}
            onClick={getRows}
            variant="search"
          >
            Fetch
          </MyButton>
        </Space>
        <Space>
          <CommonIcons
            onClick={handleCSVDownload}
            action="downloadButton"
            disabled={rows.length === 0}
          />
        </Space>
      </Row>
      <div style={{ height: "95%", paddingTop: 5 }}>
        <MyDataTable
          columns={columns}
          rows={rows}
          loading={loading === "fetch" || loading === "tableLoading"}
        />
      </div>
    </div>
  );
}

export default DebitNoteReport;
