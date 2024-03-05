import React, { useState } from "react";
import "../../../Accounts/accounts.css";
import { useEffect } from "react";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";
import { v4 } from "uuid";
import VBT6DataTable from "./VBT6DataTable";
import TaxModal from "../../../../Components/TaxModal";
import { toast } from "react-toastify";
import { Button, Col, Drawer, Modal, Row, Typography } from "antd";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import HeaderDetails from "./HeaderDetails";

export default function CreateVBT6({ editingVBT, setEditingVBT, setVBTData }) {
  const [glCodes, setGlCodes] = useState([]);
  const [vendorData, setVendorData] = useState({});
  const [vbt, setVBT] = useState(null);
  const [rows, setRows] = useState([]);
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [valuesChanged, setValuesChanged] = useState(true);
  const [gstGlOptions, setGstGlOptions] = useState([]);
  const [totalValues, setTotalValues] = useState([
    { label: "Net Amount", sign: "", values: [] },
    { label: "cgst", sign: "+", values: [] },
    { label: "sgst", sign: "+", values: [] },
    { label: "igst", sign: "+", values: [] },
    { label: "freight", sign: "+", values: [] },
    { label: "Round Off", sign: "+", values: [] },
  ]);
  const removeRows = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.id != id);
    setRows(arr);
  };
  const checkInvoice = async (checkInvoiceId, vendorCode) => {
    const data = await imsAxios.get(
      `/tally/vbt/checkInvoice?vbtInvoiceNo=${checkInvoiceId}&vendor=${vendorCode}`
    );
    if (data.status === 200 || data.status === "200") {
      let arr = data.data;
      if (arr.checkInvoice == true) {
        // setConfirmModal(true);

        Modal.confirm({
          okText: "Continue",
          cancelText: "Go Back",
          title:
            "Invoice of this vbt has already been created, Are you sure you want to continue?",
          onOk() {
            //  submitHandler(values);
          },
          onCancel() {
            setEditingVBT(null);
          },
        });
      }
    } else {
      toast.error(data.message.msg);
      // setEditingVBT(null);
    }
  };
  const backFunction = () => {
    setEditingVBT(null);
  };
  const submitFunction = async () => {
    let cgstTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "cgst")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(3);

    let sgstTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "sgst")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(3);

    let igstTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "igst")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(3);
    // let freightTotal = Number(
    //   totalValues
    //     .filter((row) => row.label.toLowerCase() == "freight")[0]
    //     ?.values.reduce((partialSum, a) => {
    //       return partialSum + Number(a);
    //     }, 0)
    // ).toFixed(3);
    let freightTotal = rows.filter((row) => row.freight)[0]?.vendorAmount;
    let valueTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "net amount")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(3);

    let totalValidatingData =
      Number(cgstTotalData) +
      Number(sgstTotalData) +
      Number(igstTotalData) +
      Number(freightTotal) +
      Number(valueTotalData);
    if (roundOffSign == "-") {
      totalValidatingData = totalValidatingData - Number(roundOffValue);
    } else if (roundOffSign == "+") {
      totalValidatingData = totalValidatingData + Number(roundOffValue);
    }
    totalValidatingData = Number(totalValidatingData).toFixed(3);
    totalValidatingData = Number(totalValidatingData).toFixed(3);
    // if (Number(vendorData.bill_amount).toFixed(3) != totalValidatingData) {
    //   return toast.error("Bill Amount and total Vendor Amount are not equal");
    // }

    let finalObj = {
      ven_code: vbt?.ven_code,
      ven_address: vendorData.in_vendor_addr,
      invoice_no: vendorData.invoice_id,
      invoice_date: vendorData.invoice_date,
      eff_date: vendorData.effective_date,
      comment: vendorData.comment,
      vbt_gstin: vendorData.vbt_gstin,
      bill_ammount: vendorData?.bill_amount,
      component: [],
      in_qtys: [],
      in_rates: [],
      taxable_values: [],
      part_code: [],
      hsn_code: [],
      in_gst_types: [],
      // freight: [freightTotal],
      gst_ass_vals: [],
      cgsts: [],
      sgsts: [],
      igsts: [],
      igst_gl: [],
      cgst_gl: [],
      sgst_gl: [],
      g_l_codes: [],
      tds_codes: [],
      tds_gl_code: [],
      tds_ass_vals: [],
      tds_amounts: [],
      ven_amounts: [],
      vbp_gst_rate: [],
      round_type: roundOffSign,
      round_value: roundOffValue,
      item_description: [],
    };
    let compData = {
      component: [],
      in_qtys: [],
      in_rates: [],
      taxable_values: [],
      part_code: [],
      hsn_code: [],
      in_gst_types: [],
      // freight: [],
      gst_ass_vals: [],
      cgsts: [],
      sgsts: [],
      igsts: [],
      igst_gl: [],
      cgst_gl: [],
      sgst_gl: [],
      g_l_codes: [],
      tds_codes: [],
      tds_gl_code: [],
      tds_ass_vals: [],
      tds_amounts: [],
      ven_amounts: [],
      vbp_gst_rate: [],
      min_key: [],
      bill_qty: [],
      effective_date: "",
      item_description: [],
    };
    let arr = rows;
    arr.map((row) => {
      if (!row.glCodeValue) {
        return toast.error("Please select a GL for all of the components");
      }
      let a = Number(row.vendorAmount);
      let totalVendor = 0;

      if (row.tdsAmount == "0" || row.tdsAmount == "--") {
        totalVendor =
          row.tdsAmount == "--" || "0" ? Number(row.vendorAmount) : a;
      } else {
        totalVendor = a;
      }

      compData = {
        item_description: [...compData.item_description, row.item_description],
        component: [...compData.component, row.c_name],
        in_qtys: [...compData.in_qtys, row.qty],
        bill_qty: [...compData.bill_qty, row.bill_qty],
        in_rates: [...compData.in_rates, row.in_po_rate],
        taxable_values: [...compData.taxable_values, row.value],
        part_code: [...compData.part_code, row.c_part_no],
        hsn_code: [...compData.hsn_code, row.in_hsn_code],
        in_gst_types: [
          ...compData.in_gst_types,
          row.in_gst_type == "Inter State" ? "I" : "L",
        ],
        // freight: [...compData.freight, row.freight],
        gst_ass_vals: [...compData.gst_ass_vals, row.gstAssetValue],
        cgsts: [...compData.cgsts, Number(row.in_gst_cgst).toFixed(3)],
        sgsts: [...compData.sgsts, Number(row.in_gst_sgst).toFixed(3)],
        igsts: [...compData.igsts, Number(row.in_gst_igst).toFixed(3)],
        igst_gl: [...compData.igst_gl, row.IGSTGL],
        cgst_gl: [...compData.cgst_gl, row.CGSTGL],
        sgst_gl: [...compData.sgst_gl, row.SGSTGL],
        g_l_codes: [...compData.g_l_codes, row.glCodeValue],
        tds_codes: [
          ...compData.tds_codes,
          row.tdsCodeValue ? row.tdsCodeValue : "--",
        ],
        tds_gl_code: [
          ...compData.tds_gl_code,
          row.tdsGlCode?.tds_gl_code
            ? row.tdsGL?.tds_gl_code
            : row.tdsGlCode
            ? row.tdsGlCode
            : "--",
        ],
        tds_ass_vals: [...compData.tds_ass_vals, row.tdsAssetValue],
        tds_amounts: [
          ...compData.tds_amounts,
          Number(row.tdsAmount).toFixed(3),
        ],
        ven_amounts: [...compData.ven_amounts, Number(totalVendor).toFixed(3)],
        vbp_gst_rate: [...compData.vbp_gst_rate, row.in_gst_rate],
        min_key: [...compData.min_key, row.min_id],
      };
    });

    finalObj = { ...finalObj, ...compData, freight: [freightTotal] };

    setLoading(true);
    const { data } = await imsAxios.post("/tally/vbt06/add_vbt06", {
      ...finalObj,
      vbt_gstin: finalObj?.vbt_gstin.value ?? finalObj?.vbt_gstin,
    });
    setLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      setTimeout(() => {
        setEditingVBT(null);
      }, 2000);
      setVBTData([]);
    } else {
      setLoading(false);
      validateResponse(data);
    }
  };
  const getGl = async () => {
    const { data } = await imsAxios.get("/tally/vbt06/vbt06_gl_options");
    let arr = [];
    if (data.length > 0) {
      arr = data.map((d) => {
        return {
          text: d.text,
          value: d.id,
        };
      });
      setGlCodes(arr);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = rows;
    setValuesChanged(true);
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;

        obj = {
          ...obj,
          [name]: value,
        };
        // }
        return obj;
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  const calculateFinal = (id) => {
    let arr = rows;
    arr = arr.map((row) => {
      let obj = row;
      if (row.id === id) {
        obj = {
          ...obj,
          updatedTDSAssAmount: +Number(obj.tdsAssetValue).toFixed(2),
        };
      }
      let value = +obj.bill_qty * +Number(obj.in_po_rate).toFixed(3);
      let amountWithFreight = value;
      amountWithFreight = +Number(amountWithFreight).toFixed(3);
      let taxAmount = +Number(
        (amountWithFreight * +obj.in_gst_rate) / 100
      ).toFixed(3);
      let amountAfterTax = amountWithFreight + taxAmount;
      let tdsApplied =
        obj.tdsCodeValue &&
        obj.tdsData.filter((row) => row.tds_key === obj.tdsCodeValue)[0];
      let tdsGlCode =
        obj.tdsCodeValue &&
        obj.tdsData.filter((row) => row.tds_key === obj.tdsCodeValue)[0]
          ?.tds_gl_code;
      let tdsPercent = tdsApplied ? +Number(tdsApplied?.tds_percent) : 0;
      let tdsAmount = +Number(
        ((obj.updatedTDSAssAmount ?? amountWithFreight) * tdsPercent) / 100
      ).toFixed(2);
      tdsAmount = +Number(tdsAmount).toFixed(0);
      let valueAfterTDS = amountAfterTax - tdsAmount;
      obj = {
        ...obj,
        value: value.toFixed(3),
        gstAssetValue: amountWithFreight,
        in_gst_cgst:
          obj.in_gst_type?.toLowerCase() == "local" ? taxAmount / 2 : 0,
        in_gst_sgst:
          obj.in_gst_type?.toLowerCase() == "local" ? taxAmount / 2 : 0,
        in_gst_igst: obj.in_gst_type?.toLowerCase() != "local" ? taxAmount : 0,
        tdsGl: tdsApplied ? tdsApplied.tds_name : "--",
        tdsAssetValue: obj.updatedTDSAssAmount ?? amountWithFreight,
        tdsAmount: tdsAmount,
        tdsGlCode: tdsGlCode,
        vendorAmount: valueAfterTDS,
      };
      return obj;
    });
    setRows(arr);
    setValuesChanged(false);
  };
  const getGstGlOptions = async () => {
    const response = await imsAxios.get("/tally/vbt/fetch_gst_ledger");
    const { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({ value: row.id, text: row.text }));
        console.log(arr);
        setGstGlOptions(arr);
      }
    }
  };
  const additional = [
    () => (
      <Button type="primary" onClick={calculateFinal}>
        Calculate
      </Button>
    ),
  ];
  useEffect(() => {
    getGl();
    if (editingVBT?.length > 0) {
      getGstGlOptions();
      let gstOptions = [];
      setRoundOffValue(0);
      setRoundOffSign("+");
      gstOptions = editingVBT[0]?.gstin_option.map((r) => {
        return { text: r, value: r };
      });
      setVendorData({
        in_vendor_addr: editingVBT[0]?.in_vendor_addr,
        invoice_date: "",
        effective_date: "",
        invoice_id: editingVBT[0]?.invoice_id,
        gstinOptions: gstOptions,
        bill_amount: "",
        vbt_gstin: "",
        comment: `Being jobwork charges due of challan no: ---- on inv ${editingVBT[0]?.invoice_id} dt: ---- of amount: ----  tds: ---- payable amt: ----`,
      });
      setVBT(editingVBT[0]);
      let tdsC = editingVBT[0].ven_tds.map((r) => {
        return { text: r.tds_name, value: r.tds_key };
      });
      let arr = editingVBT?.map((row) => {
        let id = v4();
        return {
          id: id,
          min_id: row.min_id,
          c_name: row.c_name,
          qty: row.qty,
          uom: row.comp_unit,
          maxQty: row.qty,
          c_part_no: row.c_part_no,
          comp_unit: row.comp_unit,
          in_gst_cgst:
            row.in_gst_cgst == "--" ? 0 : Number(row.in_gst_cgst).toFixed(3),
          in_gst_igst:
            row.in_gst_igst == "--" ? 0 : Number(row.in_gst_igst).toFixed(3),
          in_gst_sgst:
            row.in_gst_sgst == "--" ? 0 : +Number(row.in_gst_igst).toFixed(3),
          in_gst_rate: row.in_gst_rate,
          in_gst_type: row.in_gst_type,
          in_hsn_code: row.in_hsn_code,
          in_po_rate: row.in_po_rate,
          freight: 0,
          bill_qty: row.qty,
          freightGl: "(Freight Inward)800105",
          gstAssetValue: row.value, // value + freight
          CGSTGL: "TP274965899340",
          SGSTGL: "TP385675494002",
          IGSTGL: "TP486973272469",
          glCodeValue: "TP672531876660",
          glCodes: glCodes,
          tdsAmount: 0,
          tdsPercent: 0,
          tdsAssetValue: row.value,
          vendorAmount:
            row.in_gst_type == "Local"
              ? (
                  Number(row.value) +
                  Number(Number(row.in_gst_cgst).toFixed(3)) +
                  Number(Number(row.in_gst_cgst).toFixed(3))
                ).toFixed(3)
              : Number(row.value) + +Number(row.in_gst_igst).toFixed(3),
          // tds amount is equal to percentage of tds asset value
          //vendor amount is equal to gst asset value - tds amount
          tdsCodes: [{ text: "--", value: "--" }, ...tdsC],
          tdsData: row.ven_tds,
          tdsGL: { label: "", value: "" },
          value: row.value,
          comp_unit: row.comp_unit,
          item_description: row.item_description,
        };
      });
      let freightRow = {
        min_id: "",
        c_name: "Freight",
        qty: 1,
        uom: 0,
        maxQty: 1,
        c_part_no: "Ser002",
        comp_unit: 0,
        in_gst_cgst: 0,
        in_gst_igst: 0,
        in_gst_sgst: 0,
        in_gst_rate: 0,
        in_gst_type: editingVBT[0].in_gst_type,
        in_hsn_code: 0,
        in_po_rate: 0,
        freight: 0,
        bill_qty: 1,
        freightGl: "(Freight Inward)800105",
        gstAssetValue: 0, // value + freight
        CGSTGL: "TP274965899340",
        SGSTGL: "TP385675494002",
        IGSTGL: "TP486973272469",
        glCodeValue: "TP550175734290",
        glCodes: glCodes,
        tdsAmount: 0,
        tdsPercent: 0,
        tdsAssetValue: 0,
        vendorAmount: 0,
        // tds amount is equal to percentage of tds asset value
        //vendor amount is equal to gst asset value - tds amount
        tdsCodes: [{ text: "--", value: "--" }, ...tdsC],
        tdsData: editingVBT[0].ven_tds,
        tdsGL: { label: "", value: "" },
        value: 0,
        comp_unit: "",
        freight: true,
      };
      arr = [...arr, freightRow];
      setRows(arr);
      if (editingVBT[0].invoice_id && editingVBT[0].ven_code) {
        checkInvoice(editingVBT[0].invoice_id, editingVBT[0].ven_code);
      }
    }
  }, [editingVBT]);
  useEffect(() => {
    let totalVendorAmount = [];
    let freightValue = rows.filter((row) => row.freight)[0]?.value;

    totalVendorAmount = rows.map(
      (row) =>
        Number(row.value) +
        Number(row.in_gst_cgst) +
        Number(row.in_gst_sgst) +
        Number(row.in_gst_igst) +
        -Number(row.tdsAmount)
    );

    totalVendorAmount = totalVendorAmount.reduce((partialSum, a) => {
      return partialSum + Number(a);
    }, 0);
    let totalVendorAmountWithRoundOff;
    if (roundOffSign == "-") {
      totalVendorAmountWithRoundOff = Number(
        Number(totalVendorAmount) - Number(roundOffValue)
      ).toFixed(3);
    } else if (roundOffSign == "+") {
      totalVendorAmountWithRoundOff = Number(
        Number(totalVendorAmount) + Number(roundOffValue)
      ).toFixed(3);
    }
    let arr = [
      {
        label: "Net Amount",
        sign: "",
        values: rows
          .filter((row) => !row.freight)
          ?.map((row) => Number(row.value)?.toFixed(3)),
      },
      {
        label: "CGST",
        sign: "+",
        values: rows.map((row) =>
          row.in_gst_cgst == "--" ? 0 : Number(row.in_gst_cgst)?.toFixed(3)
        ),
      },
      {
        label: "SGST",
        sign: "+",
        values: rows.map((row) =>
          row.in_gst_sgst == "--" ? 0 : Number(row.in_gst_sgst).toFixed(3)
        ),
      },
      {
        label: "IGST",
        sign: "+",
        values: rows.map((row) =>
          row.in_gst_igst == "--" ? 0 : Number(row.in_gst_igst).toFixed(3)
        ),
      },
      {
        label: "Freight",
        sign: "+",
        values: [freightValue],
      },
      {
        label: "TDS Amount",
        sign: "-",
        values: rows.map((row) => Number(row.tdsAmount)?.toFixed(3)),
      },
      {
        label: "Round Off",
        sign: roundOffSign.toString(),
        values: [Number(roundOffValue).toFixed(3)],
      },
      {
        label: "Vendor Amount",
        sign: "",
        values: [totalVendorAmountWithRoundOff],
      },
    ];
    setTotalValues(arr);
  }, [rows, roundOffSign, roundOffValue]);

  return (
    <Drawer
      title={"Vendor : " + vbt?.ven_name + " : " + vbt?.ven_code}
      bodyStyle={{ padding: 5 }}
      width="100vw"
      extra={
        <Typography.Title style={{ whiteSpace: "nowrap", margin: 0 }} level={5}>
          {rows?.length + " Components"}
        </Typography.Title>
      }
      onClose={() => setEditingVBT(null)}
      open={editingVBT}
    >
      {loading && <Loading />}

      <Row gutter={6} style={{ height: "93%" }}>
        <Col span={6} style={{ overflow: "auto", height: "100%" }}>
          <HeaderDetails
            vendorData={vendorData}
            setVendorData={setVendorData}
            setRoundOffSign={setRoundOffSign}
            setRoundOffValue={setRoundOffValue}
            roundOffValue={roundOffValue}
          />
        </Col>
        <Col span={18} style={{ height: "100%" }}>
          <VBT6DataTable
            gstGlOptions={gstGlOptions}
            removeRows={removeRows}
            inputHandler={inputHandler}
            rows={rows}
            calculateFinal={calculateFinal}
          />
        </Col>
        {editingVBT && (
          <NavFooter
            loading={loading}
            backFunction={backFunction}
            nextDisabled={valuesChanged}
            nextLabel="Submit"
            submitFunction={submitFunction}
            additional={additional}
          />
        )}
      </Row>

      <TaxModal bottom={-140} visibleBottom={165} totalValues={totalValues} />
    </Drawer>
  );
}
