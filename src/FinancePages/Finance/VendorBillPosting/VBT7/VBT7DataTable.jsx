import { Input, InputNumber } from "antd";
import MySelect from "../../../../Components/MySelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import FormTable from "../../../../Components/FormTable";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
// fun = name,value,id
export default function VBT1DataTable({
  rows,
  inputHandler,
  removeRows,
  gstGlOptions,
  gstOtions,
}) {
  const VBT7 = [
    {
      headerName: "Actions",
      width: 40,
      renderCell: ({ row }) =>
        rows.length > 1 && (
          <CommonIcons action="removeRow" onClick={() => removeRows(row?.id)} />
        ),
    },
    {
      headerName: "MIN ID",
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <ToolTipEllipses text={row.min_id} />
        </div>
      ),
    },
    {
      headerName: "Part Code",
      renderCell: ({ row }) => (
        <div style={{ width: 70 }}>
          <ToolTipEllipses text={row.c_part_no} />
        </div>
      ),
    },
    {
      headerName: "Part Name",
      renderCell: ({ row }) => (
        <div style={{ width: 120 }}>
          <ToolTipEllipses text={row.c_name} />
        </div>
      ),
      // width: 120,
    },
    {
      headerName: "Billing Qty",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          suffix={row.uom}
          value={row.bill_qty}
          onChange={(e) => inputHandler("bill_qty", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Qty",
      width: 120,
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          suffix={row.uom}
          disabled
          value={row.qty}
        />
      ),
    },
    {
      headerName: "In Rate",
      width: 90,
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("in_po_rate", e.target.value, row.id)}
          value={row?.in_po_rate}
        />
      ),
    },
    {
      headerName: "Value",
      width: 150,
      renderCell: ({ row }) => (
        <Input style={{ width: "100%" }} disabled={true} value={row?.value} />
      ),
    },
    {
      headerName: "HSN/SAC",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          onChange={(e) => inputHandler("in_hsn_code", e.target.value, row.id)}
          value={row.in_hsn_code}
        />
      ),
      width: 120,
    },
    {
      headerName: "GST Type",
      renderCell: ({ row }) => (
        // <Input
        //   disabled={true}
        //   value={row.in_gst_type}
        //   onChange={(e) => inputHandler("in_gst_type", e.target.value, row.id)}
        // />
        <MySelect
          onChange={(value) => inputHandler("in_gst_type", value, row.id)}
          options={gstOtions}
          value={row.in_gst_type}
        />
      ),
      width: 150,
    },
    {
      headerName: "GST Rate",
      renderCell: ({ row }) => (
        <Input
          // disabled={true}
          onChange={(e) => inputHandler("in_gst_rate", e.target.value, row.id)}
          value={row.in_gst_rate}
        />
      ),
      width: 80,
    },
    {
      headerName: "Freight",
      renderCell: ({ row }) => (
        <InputNumber
          keyboard={true}
          value={row.freight}
          onChange={(value) => inputHandler("freight", value, row.id)}
        />
      ),
      width: 90,
    },
    {
      headerName: "Freight G/L",
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <ToolTipEllipses text={row.freightGl} />
        </div>
      ),
    },
    {
      headerName: "GST Ass. Value",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          disabled={true}
          onChange={(e) =>
            inputHandler("gstAssetValue", e.target.value, row.id)
          }
          value={row.gstAssetValue}
        />
      ), //freight + value
      width: 150,
    },
    {
      headerName: "CGST G/L",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          {/* <ToolTipEllipses text={row.CGSTGL} /> */}
          <MySelect
            disabled={row.in_gst_type === "Interstate" ?? true}
            onChange={(value) => inputHandler("CGSTGL", value, row.id)}
            options={gstGlOptions}
            value={row.CGSTGL}
          />
        </div>
      ),
      width: 150,
    },
    {
      headerName: "CGST",
      renderCell: ({ row }) => (
        <Input
          disabled={row.in_gst_type === "Interstate"}
          style={{ width: "100%" }}
          onChange={(e) => inputHandler("in_gst_cgst", e.target.value, row.id)}
          value={Number(row.in_gst_cgst).toFixed(2)}
        />
      ),
      width: 100,
    },
    {
      headerName: "SGST G/L",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          {/* <ToolTipEllipses text={row.CGSTGL} /> */}
          <MySelect
            disabled={row.in_gst_type === "Interstate" ?? true}
            options={gstGlOptions}
            onChange={(value) => inputHandler("SGSTGL", value, row.id)}
            value={row.SGSTGL}
          />
        </div>
      ),
      width: 150,
    },
    {
      headerName: "SGST",
      renderCell: ({ row }) => (
        <Input
          disabled={row.in_gst_type === "Interstate"}
          style={{ width: "100%" }}
          // disabled={true}
          value={Number(row.in_gst_sgst).toFixed(2)}
          onChange={(e) => inputHandler("in_gst_sgst", e.target.value, row.id)}
        />
      ),
      width: 100,
    },
    {
      headerName: "IGST G/L",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          {/* <ToolTipEllipses text={row.CGSTGL} /> */}
          <MySelect
            disabled={row.in_gst_type === "Local" ?? true}
            options={gstGlOptions}
            onChange={(value) => inputHandler("IGSTGL", value, row.id)}
            value={row.IGSTGL}
          />
        </div>
      ),
      width: 150,
    },
    {
      headerName: "IGST",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          disabled={row.in_gst_type === "Local"}
          value={row.in_gst_igst}
          onChange={(e) => inputHandler("in_gst_igst", e.target.value, row.id)}
        />
      ),
      width: 100,
    },

    {
      headerName: "Purchase G/L Code",
      renderCell: ({ row }) => (
        <MySelect
          // labelInValue
          options={row.glCodes}
          onChange={(value) => inputHandler("glCodeValue", value, row.id)}
          value={row.glCodeValue}
        />
      ),
      width: 150,
    },
    {
      headerName: "TDS Code",
      renderCell: ({ row }) => (
        <MySelect
          options={row.tdsCodes}
          onChange={(value) => inputHandler("tdsCodeValue", value, row.id)}
          value={row.tdsCodeValue}
        />
      ),
      width: 200,
    },
    {
      headerName: "TDS GL",
      renderCell: ({ row }) => <Input disabled={true} value={row.tdsGl} />,
      width: 150,
    },
    {
      headerName: "TDS Ass. Value",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          inputHandler
          onChange={(e) =>
            inputHandler("tdsassetvalue", e.target.value, row.id)
          }
          value={Number(row.tdsAssetValue).toFixed(2)}
        />
      ),
      width: 150,
    },
    {
      headerName: "TDS Amount",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          onChange={(e) => inputHandler("tdsAmount", e.target.value, row.id)}
          value={row.tdsAmount}
        />
      ),
      width: 150,
    },
    {
      headerName: "Ven Amount",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          disabled
          value={Number(row.vendorAmount).toFixed(2)}
        />
      ),
      width: 150,
    },
    {
      headerName: "Description",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          onChange={(e) =>
            inputHandler("item_description", e.target.value, row.id)
          }
          value={row.item_description}
        />
      ),
      width: 150,
    },
  ];
  return <FormTable hideHeaderMenu data={rows} columns={VBT7} />;
}
