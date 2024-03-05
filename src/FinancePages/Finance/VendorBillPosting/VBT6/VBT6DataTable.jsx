import React from "react";
import { Input, Tooltip, Button, Card } from "antd";
import { CalculatorOutlined } from "@ant-design/icons";
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
  calculateFinal,
}) {
  console.log(rows);
  const gstTypes = [
    { text: "Local", value: "local" },
    { text: "Interstate", value: "interstate" },
  ];
  const VBT1 = [
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
        <div style={{ width: 110 }}>
          {row.freight ? "--" : <ToolTipEllipses text={row.min_id} />}
        </div>
      ),
    },
    {
      headerName: "Part Code",
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
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
      headerName: "Billing Qty", //add uom in here,
      renderCell: ({ row }) => (
        <div style={{ width: 85 }}>
          <Input
            keyboard={true}
            suffix={row.uom}
            value={row.bill_qty}
            onChange={(e) => inputHandler("bill_qty", e.target.value, row.id)}
          />
        </div>
      ),
    },
    {
      headerName: "Qty", //add uom in here
      renderCell: ({ row }) => (
        <div style={{ width: 85 }}>
          <Input
            keyboard={true}
            disabled
            suffix={row.uom}
            value={row.qty}
            onChange={(e) => {
              Number(e.target.value) <= Number(row.maxQty) &&
                inputHandler("qty", e.target.value, row.id);
            }}
          />
        </div>
      ),
    },
    {
      headerName: "In Rate",
      renderCell: ({ row }) => (
        <div style={{ width: 70 }}>
          <Input
            style={{ width: "100%" }}
            keyboard={true}
            // disabled={!row.freight && true}
            onChange={(e) => inputHandler("in_po_rate", e.target.value, row.id)}
            value={row?.in_po_rate}
          />
        </div>
      ),
    },
    {
      headerName: "Value",
      renderCell: ({ row }) => (
        <div style={{ width: 120 }}>
          <Input
            style={{ width: "100%" }}
            disabled={true}
            onChange={(e) => inputHandler("value", e.target.value, row.id)}
            value={row?.value}
          />
        </div>
      ),
    },
    {
      headerName: "HSN/SAC",
      renderCell: ({ row }) => (
        <div style={{ width: 85 }}>
          <Input
            onChange={(e) =>
              inputHandler("in_hsn_code", e.target.value, row.id)
            }
            value={row.in_hsn_code}
          />
        </div>
      ),
    },
    {
      headerName: "GST Type",
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <MySelect
            options={gstTypes}
            bordered={false}
            // disabled={true}
            value={row.in_gst_type}
            onChange={(value) => inputHandler("in_gst_type", value, row.id)}
          />
        </div>
      ),
    },
    {
      headerName: "GST Rate",
      renderCell: ({ row }) => (
        <div style={{ width: 80 }}>
          <Input
            style={{ width: "100%" }}
            onChange={(e) =>
              inputHandler("in_gst_rate", e.target.value, row.id)
            }
            value={row.in_gst_rate}
          />
        </div>
      ),
    },
    // {
    //   headerName: "Freight",
    //   sortable: false,
    //   renderCell: ({ row }) => (
    //     <Input
    //       keyboard={true}
    //       value={row.freight}
    //       onChange={(value) => inputHandler("freight", value, row.id)}
    //     />
    //   ), //ask
    //   width: 90,
    // },
    // {
    //   headerName: "Freight G/L",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.freightGl} />,
    //   sortable: false,
    //   width: 150,
    // },
    {
      headerName: "GST Ass. Value",
      renderCell: ({ row }) => (
        <div style={{ width: 150 }}>
          <Input
            style={{ width: "100%" }}
            disabled={true}
            onChange={(e) =>
              inputHandler("gstAssetValue", e.target.value, row.id)
            }
            value={row.gstAssetValue}
          />
        </div>
      ), //freight + value
    },
    {
      headerName: "CGST",
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          disabled={true}
          onChange={(e) => inputHandler("in_gst_cgst", e.target.value, row.id)}
          value={Number(row.in_gst_cgst).toFixed(2)}
        />
      ),
      width: 80,
    },
    {
      headerName: "CGST G/L",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          {/* <ToolTipEllipses text={row.CGSTGL} /> */}
          <MySelect
            onChange={(value) => inputHandler("CGSTGL", value, row.id)}
            options={gstGlOptions}
            value={row.CGSTGL}
          />
        </div>
      ),
    },
    {
      headerName: "SGST",
      renderCell: ({ row }) => (
        <div style={{ width: 85 }}>
          <Input
            keyboard={true}
            disabled={true}
            value={Number(row.in_gst_sgst).toFixed(2)}
            onChange={(e) =>
              inputHandler("in_gst_sgst", e.target.value, row.id)
            }
          />
        </div>
      ),
    },
    {
      headerName: "SGST G/L",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          {/* <ToolTipEllipses text={row.CGSTGL} /> */}
          <MySelect
            options={gstGlOptions}
            onChange={(value) => inputHandler("SGSTGL", value, row.id)}
            value={row.SGSTGL}
          />
        </div>
      ),
    },
    {
      headerName: "IGST",
      renderCell: ({ row }) => (
        <div style={{ width: 85 }}>
          <Input
            keyboard={true}
            disabled={true}
            value={row.in_gst_igst}
            onChange={(e) =>
              inputHandler("in_gst_igst", e.target.value, row.id)
            }
          />
        </div>
      ),
    },
    {
      headerName: "IGST G/L",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          {/* <ToolTipEllipses text={row.CGSTGL} /> */}
          <MySelect
            options={gstGlOptions}
            onChange={(value) => inputHandler("IGSTGL", value, row.id)}
            value={row.IGSTGL}
          />
        </div>
      ),
    },
    {
      headerName: "Jobwork G/L Code",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <MySelect
            options={row.glCodes}
            onChange={(value) => inputHandler("glCodeValue", value, row.id)}
            value={row.glCodeValue}
          />
        </div>
      ),
    },
    {
      headerName: "TDS Code",
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <MySelect
            options={row.tdsCodes}
            onChange={(value) => inputHandler("tdsCodeValue", value, row.id)}
            value={row.tdsCodeValue}
          />
        </div>
      ),
    },
    {
      headerName: "TDS GL",
      renderCell: ({ row }) => (
        <div style={{ width: 120 }}>
          <Input disabled={true} value={row.tdsGl} />
        </div>
      ),
    },
    {
      headerName: "TDS Ass. Value",
      sortable: false,
      renderCell: ({ row }) => (
        <div style={{ width: 150 }}>
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
        </div>
      ),
    },
    {
      headerName: "TDS Amount",
      sortable: false,
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <Input
            style={{ width: "100%" }}
            keyboard={true}
            onChange={(e) => inputHandler("tdsAmount", e.target.value, row.id)}
            value={row.tdsAmount}
          />
        </div>
      ),
    },
    {
      headerName: "Ven Amount",
      sortable: false,
      renderCell: ({ row }) => (
        <div style={{ width: 100 }}>
          <Input
            disabled
            style={{ width: "100%" }}
            value={Number(row.vendorAmount).toFixed(2)}
          />
        </div>
      ),
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
    // {
    //   headerName: "Action",
    //   renderCell: (row, index) => (
    //     <>
    //       {index != 0 && (
    //         <div className="delete-icon" onClick={() => removeRows(row.id)}>
    //           <FaRegTrashAlt />
    //         </div>
    //       )}
    //     </>
    //   ),
    // flex: 1,
    // },
  ];
  return (
    <Card
      size="small"
      bodyStyle={{ padding: 0, height: "100%" }}
      style={{ height: "100%" }}
    >
      <FormTable hideHeaderMenu data={rows} columns={VBT1} />
    </Card>
  );
}
