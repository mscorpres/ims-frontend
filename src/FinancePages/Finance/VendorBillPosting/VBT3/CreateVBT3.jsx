import React, { useState } from "react";
import "../../../Accounts/accounts.css";
import { useEffect } from "react";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";
import { v4 } from "uuid";
import VBT3DataTable from "./VBT3DataTable";
import TaxModal from "../../../../Components/TaxModal";
import { toast } from "react-toastify";
import { Button, Col, Drawer, Modal, Row } from "antd";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import HeaderDetails from "./HeaderDetails";

export default function CreateVBT3({ editingVBT, setEditingVBT, setVBTData }) {
  const [glCodes, setGlCodes] = useState([]);
  const [vendorData, setVendorData] = useState({});
  const [vbt, setVBT] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [valuesChanged, setValuesChanged] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [totalValues, setTotalValues] = useState([
    { label: "Net Amount", sign: "", values: [] },
    { label: "cgst", sign: "+", values: [] },
    { label: "sgst", sign: "+", values: [] },
    { label: "igst", sign: "+", values: [] },
    { label: "freight", sign: "+", values: [] },
    { label: "Round Off", sign: "+", values: [] },
  ]);

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
  const [addFreightCalc, setAddFreightCalc] = useState(false);
  const [addInsuranceCalc, setAddInsuranceCalc] = useState(false);
  const removeRows = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.id != id);
    setRows(arr);
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
    ).toFixed(2);

    let sgstTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "sgst")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(2);

    let igstTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "igst")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(2);
    let freightTotal = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "freight")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(2);
    let valueTotalData = Number(
      totalValues
        .filter((row) => row.label.toLowerCase() == "net amount")[0]
        ?.values.reduce((partialSum, a) => {
          return partialSum + Number(a);
        }, 0)
    ).toFixed(2);

    let totalValidatingData =
      Number(cgstTotalData) +
      Number(sgstTotalData) +
      Number(igstTotalData) +
      Number(freightTotal) +
      Number(valueTotalData);
    // if (roundOffSign == "-") {
    //   totalValidatingData = totalValidatingData - Number(roundOffValue);
    // } else if (roundOffSign == "+") {
    //   totalValidatingData = totalValidatingData + Number(roundOffValue);
    // }
    totalValidatingData = Number(totalValidatingData).toFixed(2);
    totalValidatingData = Number(totalValidatingData).toFixed(2);
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
      vbt_gstin: vendorData.vbt_gstin.value ?? vendorData.vbt_gstin,
      bill_amount: vendorData?.bill_amount,
      port_code: vendorData.port_code,
      port_name: vendorData.port_name,
      boe_no: vendorData.boe_no,
      boe_date: vendorData.boe_date,
      cha: vendorData.cha,
      hawb_no: vendorData.hawb_no,
      mawb_no: vendorData.mawb_no,
      component: [],
      in_qtys: [],
      in_rates: [],
      taxable_values: [],
      part_code: [],
      hsn_code: [],
      in_gst_types: [],
      freight: [],
      gst_ass_vals: [],
      // cgsts: [],
      // sgsts: [],
      igsts: [],
      g_l_codes: [],
      // tds_codes: [],
      // tds_gl_code: [],
      // tds_ass_vals: [],
      // tds_amounts: [],
      ven_amounts: [],
      vbp_gst_rate: [],
      currency: [],
      exchangeRate: [],
      item_description: [],
      // round_type: roundOffSign,
      // round_value: roundOffValue,
    };
    let compData = {
      component: [],
      in_qtys: [],
      in_rates: [],
      taxable_values: [],
      part_code: [],
      hsn_code: [],
      in_gst_types: [],
      freight: [],
      gst_ass_vals: [],
      // cgsts: [],
      // sgsts: [],
      igsts: [],
      g_l_codes: [],
      // tds_codes: [],
      // tds_gl_code: [],
      // tds_ass_vals: [],
      // tds_amounts: [],
      ven_amounts: [],
      vbp_gst_rate: [],
      min_key: [],
      bill_qty: [],
      effective_date: "",
      currency: [],
      exchange: [],
      misc: [],
      insurance: [],
      custom_duty: [],
      sws: [],
      other_charges: [],
      item_description: [],
    };
    let validation = true;
    rows.map((row) => {
      if (!row.glCodeValue) {
        validation = false;
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
        freight: [...compData.freight, row.freight],
        gst_ass_vals: [...compData.gst_ass_vals, row.gstAssetValue],
        // cgsts: [...compData.cgsts, Number(row.in_gst_cgst).toFixed(3)],
        // sgsts: [...compData.sgsts, Number(row.in_gst_sgst).toFixed(3)],
        igsts: [...compData.igsts, Number(row.in_gst_igst).toFixed(2)],
        g_l_codes: [...compData.g_l_codes, row.glCodeValue],
        // tds_codes: [...compData.tds_codes, row.tdsCode ? row.tdsCode : "--"],
        // tds_gl_code: [
        //   ...compData.tds_gl_code,
        //   row.tdsGL?.tds_gl_code ? row.tdsGL?.tds_gl_code : "--",
        // ],
        // tds_ass_vals: [...compData.tds_ass_vals, row.tdsAssetValue],
        // tds_amounts: [
        //   ...compData.tds_amounts,
        //   Number(row.tdsAmount).toFixed(3),
        // ],
        ven_amounts: [...compData.ven_amounts, Number(totalVendor).toFixed(2)],
        vbp_gst_rate: [...compData.vbp_gst_rate, row.in_gst_rate],
        min_key: [...compData.min_key, row.min_id],
        currency: [...compData.currency, row.currency],
        exchange: [...compData.exchange, row.exchangeRate],
        insurance: [...compData.insurance, row.insurance],
        custom_duty: [...compData.custom_duty, row.customDuty],
        sws: [...compData.sws, row.sws],
        other_charges: [...compData.other_charges, row.otherDuty],
        misc: [...compData.misc, row.misc],
      };
    });
    if (!validation) {
      return toast.error("Please check your entries...");
    }
    finalObj = { ...finalObj, ...compData };
    // console.log("finalObj", finalObj);
    setLoading(true);
    const response = await imsAxios.post("/tally/vbt03/add_vbt03", {
      ...finalObj,
      vbt_gstin: finalObj?.vbt_gstin.value ?? finalObj?.vbt_gstin,
    });
    setLoading(false);
    const { data } = response;
    if (response.status == 200) {
      toast.success(data);
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
    const { data } = await imsAxios.get("/tally/vbt03/vbt03_gl_options");
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
        return obj;
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  const calculateFinal = () => {
    let arr = rows;

    let totalVendorAmount = arr.map(
      (row) =>
        +row.bill_qty * +row.in_po_rate * +Number(row.exchangeRate).toFixed(2)
    );
    totalVendorAmount = totalVendorAmount.reduce((partialSum, a) => {
      return partialSum + Number(a);
    }, 0);
    arr = arr.map((row) => {
      let obj = row;

      let value =
        +obj.bill_qty * +obj.in_po_rate * +Number(obj.exchangeRate).toFixed(2);
      value = +Number(value).toFixed(2);
      let foreignValue =
        row.currency === "364907247" ? 0 : +obj.bill_qty * +obj.in_po_rate;
      foreignValue = +Number(foreignValue).toFixed(2);
      // console.log("addFreight", addFreight);

      let addFreight;
      // console.log("obj.misc", obj.misc);
      if (obj.misc == 0) {
        console.log("here in misc if");
        addFreight = value;
        // console.log("addFreight- value>", addFreight);
      } else {
        // console.log("value", value);
        // console.log("obj.misc", obj.misc);
        addFreight = value + obj.misc;

        // console.log("addFreight->", addFreight);
      }
      let freightInclude;
      if (addFreightCalc) {
        console.log("addFreight->", addFreight);
        console.log("addFreight- * 20", addFreight * 20);
        addFreight = (addFreight * 20) / 100;
        freightInclude = +Number(addFreight).toFixed(2);
        console.log("freightInclude- * 20", freightInclude);
      } else {
        freightInclude = obj.freight;
        addFreight = 0;
        console.log("freightInclude", freightInclude);
      }
      let cifAmount =
        value +
        +Number(freightInclude).toFixed(2) +
        +Number(obj.insurance).toFixed(2) +
        +Number(obj.misc).toFixed(2);

      let gstAssValue =
        cifAmount +
        +Number(obj.customDuty).toFixed(2) +
        +Number(obj.sws).toFixed(2) +
        +Number(obj.otherDuty).toFixed(2);
      let taxPercentage =
        obj.in_gst_type?.toLowerCase() == "local"
          ? +Number(+obj.in_gst_rate / 2).toFixed(2)
          : +obj.in_gst_rate;
      let taxAmount = +Number((gstAssValue * taxPercentage) / 100).toFixed(2);
      if (obj.in_gst_type.toLowerCase() === "local") {
        taxAmount = taxAmount * 2;
      }
      let amountAfterTax = gstAssValue + taxAmount;

      // let tdsApplied =
      //   obj.tdsCodeValue &&
      //   obj.tdsData.filter((row) => row.tds_key === obj.tdsCodeValue)[0];
      // let tdsPercent = tdsApplied ? +Number(tdsApplied?.tds_percent) : 0;
      // let tdsAmount = +Number((amountWithFreight * tdsPercent) / 100).toFixed(
      //   2
      // );
      // let valueAfterTDS = amountAfterTax - tdsAmount;
      console.log(taxAmount);
      obj = {
        ...obj,
        value,
        gstAssetValue: gstAssValue,
        in_gst_igst: taxAmount,
        cif: cifAmount,
        addFreight: addFreight,
        vendorAmount: value,
        foreignValue: foreignValue,

        currencySymbol: currencies.filter(
          (row) => row.value === obj.currency
        )[0].text,
        // in_gst_cgst:
        //   obj.in_gst_type?.toLowerCase() == "local" ? taxAmount / 2 : 0,
        // in_gst_sgst:
        //   obj.in_gst_type?.toLowerCase() == "local" ? taxAmount / 2 : 0,
      };
      // console.log("obj", obj);
      return obj;
    });
    console.log("arr===========", arr);
    setRows(arr);
    setValuesChanged(false);
  };
  const calculateOtherValues = (name) => {
    let arr = rows;

    let totalVendorAmount = arr.map(
      (row) =>
        +row.bill_qty * +row.in_po_rate * +Number(row.exchangeRate).toFixed(2)
    );
    totalVendorAmount = totalVendorAmount.reduce((partialSum, a) => {
      return partialSum + Number(a);
    }, 0);
    arr = arr.map((row) => {
      let obj = row;
      let value =
        +obj.bill_qty * +obj.in_po_rate * +Number(obj.exchangeRate).toFixed(2);
      value = +Number(value).toFixed(2);
      if (name === "freight") {
        let freight =
          (+vendorData.totalFreight * Number(value)) /
          +Number(totalVendorAmount).toFixed(2);
        freight = +Number(freight).toFixed(2);
        return {
          ...obj,
          freight: freight,
        };
      } else if (name === "misc") {
        let misc =
          (+vendorData.totalMisc * +Number(value).toFixed(2)) /
          +Number(totalVendorAmount).toFixed(2);
        misc = +Number(misc).toFixed(2);
        return {
          ...obj,
          misc: misc,
        };
      } else if (name === "insurance") {
        let insurance =
          ((+Number(obj.misc).toFixed(2) + +Number(value).toFixed(2)) * 1.125) /
          100;
        insurance = +Number(insurance).toFixed(2);
        return {
          ...obj,
          insurance: insurance,
        };
      } else if (name === "sws") {
        let sws = (+Number(obj.customDuty).toFixed(2) * 10) / 100;
        sws = +Number(sws).toFixed(2);
        return {
          ...obj,
          sws: sws,
        };
      } else if (name === "insuranceCharge") {
        // let foreignValue =
        //   row.currency === "364907247" ? 0 : +obj.bill_qty * +obj.in_po_rate;
        let value =
          +obj.bill_qty *
          +obj.in_po_rate *
          +Number(obj.exchangeRate).toFixed(2);
        value = +Number(value).toFixed(2);
        //
        let insuranceInput = vendorData.insuranceCharge;
        let totalInsurance =
          (+Number(insuranceInput) * +Number(value)) /
          +Number(vendorData?.bill_amount);
        totalInsurance = +Number(totalInsurance).toFixed(2);
        console.log("totalInsurance -", totalInsurance);
        return {
          ...obj,
          insurance: totalInsurance,
        };
      }
    });
    setRows(arr);
  };
  const getCurrencies = async () => {
    const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
    let arr = [];
    arr = data.data.map((d) => {
      return {
        text: d.currency_symbol,
        value: d.currency_id,
        notes: d.currency_notes,
      };
    });
    setCurrencies(arr);
  };
  const copyToAllRows = (name) => {
    let arr = rows;
    arr = arr.map((row) => ({
      ...row,
      [name]: arr[0][name],
    }));
    setRows(arr);
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
    getCurrencies();
    if (editingVBT?.length > 0) {
      let gstOptions = [];
      gstOptions = editingVBT[0]?.gstin_option.map((r) => {
        return { text: r, value: r };
      });
      gstOptions = gstOptions.filter(
        (item, index) => gstOptions.indexOf(item) === index
      );
      setVendorData({
        in_vendor_addr: editingVBT[0]?.in_vendor_addr,
        invoice_date: editingVBT[0]?.invoiceDate ?? "",
        effective_date: editingVBT[0]?.invoiceDate,
        invoice_id: editingVBT[0]?.invoice_id,
        gstinOptions: gstOptions,
        bill_amount: "",
        // vbt_gstin: gstOptions[0],
        vbt_gstin: "999999999999999",
        comment: `Being import on inv ${editingVBT[0]?.invoice_id} dt ${
          editingVBT[0]?.invoiceDate ?? ""
        } of amt `,
        port_code: "INDEL4",
        port_name: "Delhi Air Cargo",
        boe_no: "",
        boe_date: "",
        cha: "LINKERS INDIA LOGISTICS PV",
        hawb_no: "",
        mawb_no: "",
        totalFreight: 0,
        totalMisc: 0,
      });
      setVBT(editingVBT[0]);
      let arr = editingVBT?.map((row, index) => {
        // let tdsC = row.ven_tds.map((r) => {
        //   return { text: r.tds_name, value: r.tds_key };
        // });
        let id = v4();
        return {
          id: id,
          index: index,
          min_id: row.min_id,
          c_name: row.c_name,
          qty: row.qty,
          uom: row.comp_unit,
          maxQty: row.qty,
          c_part_no: row.c_part_no,
          comp_unit: row.comp_unit,
          // in_gst_cgst:
          //   row.in_gst_cgst == "--" ? 0 : Number(row.in_gst_cgst).toFixed(3),
          in_gst_igst:
            row.in_gst_igst == "--" ? 0 : Number(row.in_gst_igst).toFixed(2),
          // in_gst_sgst:
          //   row.in_gst_sgst == "--" ? 0 : +Number(row.in_gst_sgst).toFixed(3),
          in_gst_rate: row.in_gst_rate,
          in_gst_type: row.in_gst_type,
          in_hsn_code: row.in_hsn_code,
          in_po_rate: row.in_po_rate,
          freight: 0,
          bill_qty: row.qty,
          freightGl: "Freight Inward - Import (6030105)",
          gstAssetValue: row.value,
          IGSTGL: "IGST INPUT (Import)(2040108)",
          glCodeValue: "TP889514899393",
          glCodes: glCodes,
          // tdsAmount: 0,
          // tdsPercent: 0,
          // tdsAssetValue: row.value,
          vendorAmount:
            row.in_gst_type == "Local"
              ? (
                  Number(row.value) +
                  Number(Number(row.in_gst_cgst).toFixed(2)) +
                  Number(Number(row.in_gst_sgst).toFixed(2))
                ).toFixed(2)
              : Number(row.value) + +Number(row.in_gst_igst).toFixed(2),

          //vendor amount is equal to gst asset value - tds amount
          // tdsCodes: [{ text: "--", value: "--" }, ...tdsC],
          // tdsData: row.ven_tds,
          // tdsGL: "",
          value: row.value,
          comp_unit: row.comp_unit,
          foreignValue: 0,
          insurance: 0,
          misc: 0,
          cif: 0,
          customDuty: 0,
          sws: 0,
          otherDuty: 0,
          exchangeRate: 1,
          currency: "28567096",
          currencySymbol: "$",
          item_description: row.item_description,
        };
      });
      setRows(arr);
      if (editingVBT[0].invoice_id && editingVBT[0].ven_code) {
        checkInvoice(editingVBT[0].invoice_id, editingVBT[0].ven_code);
      }
    }
  }, [editingVBT]);
  useEffect(() => {
    // let totalVendorAmount = rows.map(
    //   (row) => Number(row.value)
    //   // Number(row.in_gst_cgst) +
    //   // Number(row.in_gst_sgst) +
    //   // Number(row.in_gst_igst) +
    //   // Number(row.freight) -
    //   // Number(row.tdsAmount)
    // );
    // let totalVendorAmountWithRoundOff;
    // if (roundOffSign == "-") {
    //   totalVendorAmountWithRoundOff = Number(
    //     Number(totalVendorAmount) - Number(roundOffValue)
    //   ).toFixed(3);
    // } else if (roundOffSign == "+") {
    //   totalVendorAmountWithRoundOff = Number(
    //     Number(totalVendorAmount) + Number(roundOffValue)
    //   ).toFixed(3);
    // }
    let arr = [
      {
        label: "Net Amount",
        sign: "",
        values: rows.map((row) => Number(row.value)?.toFixed(2)),
      },
      // {
      //   label: "CGST",
      //   sign: "+",
      //   values: rows.map((row) =>
      //     row.in_gst_cgst == "--" ? 0 : Number(row.in_gst_cgst)?.toFixed(3)
      //   ),
      // },
      // {
      //   label: "SGST",
      //   sign: "+",
      //   values: rows.map((row) =>
      //     row.in_gst_sgst == "--" ? 0 : Number(row.in_gst_sgst).toFixed(3)
      //   ),
      // },
      {
        label: "IGST",
        sign: "+",
        values: rows.map((row) =>
          row.in_gst_igst == "--" ? 0 : Number(row.in_gst_igst).toFixed(2)
        ),
      },
      {
        label: "Freight",
        sign: "+",
        values: rows.map((row) => Number(row.freight)?.toFixed(2)),
      },
      {
        label: "Insurance",
        sign: "+",
        values: rows.map((row) => Number(row.insurance)?.toFixed(2)),
      },
      {
        label: "Misc. Charges",
        sign: "+",
        values: rows.map((row) => Number(row.misc)?.toFixed(2)),
      },
      {
        label: "Custom Duty",
        sign: "+",
        values: rows.map((row) => Number(row.customDuty)?.toFixed(2)),
      },
      {
        label: "SWS",
        sign: "+",
        values: rows.map((row) => Number(row.sws)?.toFixed(2)),
      },
      {
        label: "Other Duty",
        sign: "+",
        values: rows.map((row) => Number(row.otherDuty)?.toFixed(2)),
      },
      // {
      //   label: "TDS Amount",
      //   sign: "-",
      //   values: rows.map((row) => Number(row.tdsAmount)?.toFixed(3)),
      // },
      // {
      //   label: "Round Off",
      //   sign: roundOffSign.toString(),
      //   values: [Number(roundOffValue).toFixed(3)],
      // },
      {
        label: "Vendor Amount",
        sign: "",
        values: rows.map((row) => Number(row.value)?.toFixed(2)),
      },
    ];
    setTotalValues(arr);
  }, [rows]);

  return (
    <Drawer
      title={"Vendor : " + vbt?.ven_name + " : " + vbt?.ven_code}
      bodyStyle={{ padding: 5 }}
      width="100vw"
      onClose={() => setEditingVBT(null)}
      open={editingVBT}
    >
      {loading && <Loading />}
      <Row style={{ height: "93%" }} gutter={6}>
        <Col span={6} style={{ height: "100%", overflowY: "scroll" }}>
          <HeaderDetails
            vendorData={vendorData}
            setVendorData={setVendorData}
            calculateOtherValues={calculateOtherValues}
            addFreightCalc={addFreightCalc}
            setAddFreightCalc={setAddFreightCalc}
            setAddInsuranceCalc={setAddInsuranceCalc}
            addInsuranceCalc={addInsuranceCalc}
          />
        </Col>
        <Col span={18} style={{ height: "100%" }}>
          <VBT3DataTable
            removeRows={removeRows}
            inputHandler={inputHandler}
            rows={rows}
            copyToAllRows={copyToAllRows}
            currencies={currencies}
            calculateOtherValues={calculateOtherValues}
          />
        </Col>

        {editingVBT && (
          <NavFooter
            additional={additional}
            loading={loading}
            backFunction={backFunction}
            nextLabel="Submit"
            nextDisabled={valuesChanged}
            submitFunction={submitFunction}
          />
        )}
        <TaxModal bottom={-155} visibleBottom={190} totalValues={totalValues} />
      </Row>
    </Drawer>
  );
}
