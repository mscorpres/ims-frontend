import React from "react";
import { Button, Input, Row, Tooltip } from "antd";
import MySelect from "../../../../Components/MySelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import FormTable from "../../../../Components/FormTable";
import { CopyOutlined, CalculatorOutlined } from "@ant-design/icons";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";

export default function VBT3DataTable({
  rows,
  inputHandler,
  removeRows,
  copyToAllRows,
  currencies,
  calculateOtherValues,
}) {
  const VBT3 = [
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
      width: 130,
      renderCell: ({ row }) => <ToolTipEllipses text={row.min_id} />,
    },
    {
      headerName: "Part Code",
      width: 90,
      renderCell: ({ row }) => <ToolTipEllipses text={row.c_part_no} />,
    },
    {
      headerName: "Part Name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.c_name} />,
      width: 120,
    },
    {
      headerName: "HSN/SAC",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("in_hsn_code", e.target.value, row.id)}
          value={row.in_hsn_code}
        />
      ), //ask
      width: 90,
    },
    {
      headerName: "Billing Qty", //add uom in here
      width: 150,
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
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
      width: 120,
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          // min={1}
          disabled
          // max={Number(row.maxQty)}

          suffix={row.uom}
          value={row.qty}
          onChange={(e) => {
            Number(e.target.value) <= Number(row.maxQty) &&
              inputHandler("qty", e.target.value, row.id);
          }}
        />
      ),
    },
    {
      headerName: "In Rate $",
      width: 90,
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          onChange={(e) => inputHandler("in_po_rate", e.target.value, row.id)}
          value={row?.in_po_rate}
        />
      ), //ask
    },
    {
      headerName: "Foreign Value",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          disabled={true}
          suffix={row?.currencySymbol}
          // onChange={(value) => inputHandler("value", value, row.id)}
          value={row?.foreignValue}
        />
      ),
    },
    // {
    //   headerName: "Custom Insurance",
    //   width: 150,
    //   renderCell: ({ row }) => (
    //     <Input
    //       keyboard={true}
    //       disabled={true}
    //       // suffix={row?.currencySymbol}
    //       // onChange={(value) => inputHandler("value", value, row.id)}
    //       value={row?.customInsuranceValue}
    //     />
    //   ),
    // },
    {
      headerName: "Currency/Rate",

      width: 150,
      renderCell: ({ row }) => (
        <Input.Group compact>
          {row.index === 0 && (
            <div style={{ width: "20%" }}>
              <Tooltip title="Copy currency rate in all rows">
                <Button
                  onClick={() => copyToAllRows("exchangeRate")}
                  block
                  icon={<CopyOutlined style={{ fontSize: "0.8rem" }} />}
                />
              </Tooltip>
            </div>
          )}
          <Input
            style={{ width: row.index === 0 ? "45%" : "65%" }}
            disabled={row.currency === "364907247"}
            value={row.exchangeRate}
            onChange={(e) =>
              inputHandler("exchangeRate", e.target.value, row.id)
            }
          />
          <div style={{ width: "35%" }}>
            <MySelect
              options={currencies}
              value={row.currency}
              onChange={(value) => inputHandler("currency", value, row.id)}
            />
          </div>
        </Input.Group>
      ),
    },
    {
      headerName: "INR Value",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          disabled={true}
          onChange={(e) => inputHandler("value", e.target.value, row.id)}
          value={row?.value}
          suffix="₹"
        />
      ),
    },

    {
      headerName: "Misc. Charges",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("misc", e.target.value, row.id)}
          value={row.misc}
        />
      ), //ask
      width: 130,
    },
    {
      headerName: "Add Freight",
      renderCell: ({ row }) => (
        <Input
          // disabled={true}
          value={row.addFreight}
          //onChange={(e) => inputHandler("addFreight", e.target.value, row.id)}
        />
      ), //ask
      width: 110,
    },
    {
      headerName: "Freight",
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          value={row.freight}
          onChange={(e) => inputHandler("freight", e.target.value, row.id)}
        />
      ), //ask
      width: 110,
    },
    {
      headerName: "Insurance",
      renderCell: ({ row }) => (
        <Input.Group compact>
          <Input
            style={{ width: row.index === 0 && "75%" }}
            onChange={(e) => inputHandler("insurance", e.target.value, row.id)}
            value={row.insurance}
          />
          {row.index === 0 && (
            <div style={{ width: "25%" }}>
              <Tooltip title="Calculate Insrance for all rows">
                <Button
                  onClick={() => calculateOtherValues("insurance")}
                  block
                  icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
                />
              </Tooltip>
            </div>
          )}
        </Input.Group>
      ), //ask
      width: 110,
    },

    {
      headerName: "Custom Duty",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("customDuty", e.target.value, row.id)}
          value={row.customDuty}
        />
      ), //ask
      width: 110,
    },
    {
      headerName: "SWS",
      renderCell: ({ row }) => (
        <Input.Group compact>
          <Input
            style={{ width: row.index === 0 && "75%" }}
            onChange={(e) => inputHandler("sws", e.target.value, row.id)}
            value={row.sws}
          />
          {row.index === 0 && (
            <div style={{ width: "25%" }}>
              <Tooltip title="Calculate SWS for all rows">
                <Button
                  onClick={() => calculateOtherValues("sws")}
                  block
                  icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
                />
              </Tooltip>
            </div>
          )}
        </Input.Group>
      ), //ask
      width: 110,
    },
    {
      headerName: "Other Duty",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("otherDuty", e.target.value, row.id)}
          value={row.otherDuty}
        />
      ), //ask
      width: 110,
    },
    // {
    //   headerName: "CIF",
    //   renderCell: ({ row }) => (
    //     <Input
    //       disabled={true}
    //       onChange={(e) => inputHandler("cif", e.target.value, row.id)}
    //       value={row.cif}
    //     />
    //   ), //ask
    //   width: 110,
    // },
    // {
    //   headerName: "GST Type",
    //   renderCell: ({ row }) => (
    //     <Input
    //       disabled={true}
    //       value={row.in_gst_type}
    //       onChange={(e) => inputHandler("in_gst_type", e.target.value, row.id)}
    //     />
    //   ),
    //   width: 150,
    // },
    {
      headerName: "GST Rate",
      renderCell: ({ row }) => (
        <Input.Group compact>
          <Input
            style={{ width: row.index === 0 && "70%" }}
            keyboard={true}
            onChange={(e) =>
              inputHandler("in_gst_rate", e.target.value, row.id)
            }
            value={row.in_gst_rate}
          />
          {row.index === 0 && (
            <div style={{ width: "30%" }}>
              <Tooltip title="Copy GST rate in all rows">
                <Button
                  onClick={() => copyToAllRows("in_gst_rate")}
                  block
                  icon={<CopyOutlined style={{ fontSize: "0.8rem" }} />}
                />
              </Tooltip>
            </div>
          )}
        </Input.Group>
      ),
      width: 90,
    },
    {
      headerName: "Freight G/L",
      renderCell: ({ row }) => <ToolTipEllipses text={row.freightGl} />,
      width: 150,
    },
    {
      headerName: "CIF / GST Ass. Value",
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          disabled={true}
          onChange={(e) =>
            inputHandler("gstAssetValue", e.target.value, row.id)
          }
          value={row.gstAssetValue}
        />
      ), //freight + value
      width: 180,
    },
    // {
    //   headerName: "CGST",
    //   renderCell: ({ row }) => (
    //     <Input
    //       keyboard={true}
    //       disabled={true}
    //       onChange={(value) => inputHandler("in_gst_cgst", value, row.id)}
    //       value={Number(row.in_gst_cgst).toFixed(2)}
    //     />
    //   ),
    //   width: 100,
    // },
    // {
    //   headerName: "CGST G/L",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.CGSTGL} />,
    //   width: 150,
    // },
    // {
    //   headerName: "SGST",
    //   renderCell: ({ row }) => (
    //     <Input
    //       keyboard={true}
    //       disabled={true}
    //       value={Number(row.in_gst_sgst).toFixed(2)}
    //       onChange={(value) => inputHandler("in_gst_sgst", value, row.id)}
    //     />
    //   ),
    //   width: 100,
    // },
    // {
    //   headerName: "SGST G/L",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.SGSTGL} />,
    //   width: 150,
    // },
    {
      headerName: "IGST",
      renderCell: ({ row }) => (
        <Input
          keyboard={true}
          disabled={true}
          value={row.in_gst_igst}
          // onChange={(value) => inputHandler("in_gst_igst", value, row.id)}
        />
      ),
      width: 100,
    },
    {
      headerName: "IGST G/L",
      renderCell: ({ row }) => <ToolTipEllipses text={row.IGSTGL} />,
      width: 150,
    },
    {
      headerName: "Purchase G/L Code",
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
  return <FormTable hideHeaderMenu data={rows} columns={VBT3} />;
}
