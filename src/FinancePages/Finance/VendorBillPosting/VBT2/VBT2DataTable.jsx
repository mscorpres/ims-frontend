import React from "react";
import { Input, Tooltip, Button } from "antd";
import { CalculatorOutlined } from "@ant-design/icons";
import MySelect from "../../../../Components/MySelect";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import FormTable from "../../../../Components/FormTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
// fun = name,value,id
export default function VBT2DataTable({
  rows,
  inputHandler,
  removeRows,
  gstGlOptions,
  calculateFinal,
}) {
  // console.log(rows);
  const gstTypes = [
    { text: "Local", value: "local" },
    { text: "Interstate", value: "interstate" },
  ];

  const VBT2 = [
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
      width: 120,
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <ToolTipEllipses text={row.min_id} />
        </div>
      ),
    },
    {
      headerName: "Part Code",
      width: 90,
      renderCell: ({ row }) => (
        <div style={{ width: 70 }}>
          <ToolTipEllipses text={row.c_part_no} />
        </div>
      ),
    },
    {
      headerName: "Part Name",
      renderCell: ({ row }) => (
        <div style={{ width: 70 }}>
          <ToolTipEllipses text={row.c_part_no} />
        </div>
      ),
    },
    {
      headerName: "Billing Qty", //add uom in here
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
      headerName: "Qty", //add uom in here
      width: 120,
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          suffix={row.uom}
          disabled
          value={row.qty}
          onChange={(e) => {
            Number(e.target.value) <= Number(row.maxQty) &&
              inputHandler("qty", e.target.value, row.id);
          }}
        />
      ),
    },
    {
      headerName: "In Rate",
      width: 90,
      renderCell: ({ row }) => (
        <Input
          // disabled={true}
          onChange={(e) => inputHandler("in_po_rate", e.target.value, row.id)}
          value={row?.in_po_rate}
        />
      ),
    },
    {
      headerName: "Value",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          keyboard={true}
          disabled={true}
          onChange={(e) => inputHandler("value", e.target.value, row.id)}
          value={row?.value}
        />
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
      width: 90,
    },
    {
      headerName: "GST Type",
      renderCell: ({ row }) => (
        <MySelect
          options={gstTypes}
          value={row.in_gst_type}
          onChange={(value) => inputHandler("in_gst_type", value, row.id)}
        />
      ),
      width: 150,
    },
    {
      headerName: "GST Rate",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("in_gst_rate", e.target.value, row.id)}
          value={row.in_gst_rate}
        />
      ),
      width: 90,
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
      headerName: "CGST",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          disabled={true}
          value={Number(row.in_gst_cgst).toFixed(2)}
          onChange={(e) => inputHandler("in_gst_cgst", e.target.value, row.id)}
        />
      ),
      width: 100,
    },
    {
      headerName: "CGST G/L",
      width: 100,
      renderCell: ({ row }) => (
        <MySelect
          onChange={(value) => inputHandler("CGSTGL", value, row.id)}
          options={gstGlOptions}
          value={row.CGSTGL}
        />
      ),
    },
    {
      headerName: "SGST",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          disabled={true}
          value={Number(row.in_gst_sgst).toFixed(2)}
          onChange={(e) => inputHandler("in_gst_sgst", e.target.value, row.id)}
        />
      ),
      width: 100,
    },
    {
      headerName: "SGST G/L",
      width: 100,
      renderCell: ({ row }) => (
        <MySelect
          options={gstGlOptions}
          onChange={(value) => inputHandler("SGSTGL", value, row.id)}
          value={row.SGSTGL}
        />
      ),
    },
    {
      headerName: "IGST",
      renderCell: ({ row }) => (
        <Input
          style={{ width: "100%" }}
          disabled={true}
          value={row.in_gst_igst}
          onChange={(e) => inputHandler("in_gst_igst", e.target.value, row.id)}
        />
      ),
      width: 100,
    },
    {
      headerName: "IGST G/L",
      width: 100,
      renderCell: ({ row }) => (
        <MySelect
          options={gstGlOptions}
          onChange={(value) => inputHandler("IGSTGL", value, row.id)}
          value={row.IGSTGL}
        />
      ),
    },
    {
      headerName: "Service G/L Code",
      renderCell: ({ row }) => (
        <MySelect
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
        <Input.Group compact>
          <Input
            style={{ width: "74%" }}
            inputHandler
            onChange={(e) =>
              inputHandler("tdsAssetValue", e.target.value, row.id)
            }
            value={Number(row.tdsAssetValue).toFixed(2)}
          />

          <div style={{ width: "25%", marginTop: -1 }}>
            <Tooltip title="Calculate TDS Asses. Value">
              <Button
                style={{ color: row.updatedTDSAssAmount && "blue" }}
                onClick={() => calculateFinal(row.id)}
                block
                icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
              />
            </Tooltip>
          </div>
        </Input.Group>
      ),
      width: 150,
    },
    {
      headerName: "TDS Amount",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("tdsAmount", e.target.value, row.id)}
          value={row.tdsAmount}
        />
      ),
      width: 150,
    },
    {
      headerName: "Ven Amount",
      renderCell: ({ row }) => (
        <Input disabled value={Number(row.vendorAmount).toFixed(2)} />
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
  return <FormTable data={rows} columns={VBT2} />;
}
