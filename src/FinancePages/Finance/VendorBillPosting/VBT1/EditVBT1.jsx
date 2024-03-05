import React, { useState } from "react";
import "../../../Accounts/accounts.css";
import { useEffect } from "react";
import NavFooter from "../../../../Components/NavFooter";
import InputMask from "react-input-mask";
import Loading from "../../../../Components/Loading";
import axios from "axios";
import { v4 } from "uuid";
import VBT1DataTable from "./VBT1DataTable";
import TaxModal from "../../../../Components/TaxModal";
import { toast } from "react-toastify";
import MySelect from "../../../../Components/MySelect";
import { Col, Drawer, Form, Input, Row, Tabs } from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
export default function EditVBT1({ editingVBT, setEditingVBT }) {
  const [glCodes, setGlCodes] = useState([]);
  const [vendorData, setVendorData] = useState({});
  const [vbt, setVBT] = useState(null);
  const [rows, setRows] = useState([]);
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();
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
    arr = arr.filter((row) => row.rowId != id);
    setRows(arr);
  };
  const backFunction = () => {
    setEditingVBT(null);
  };
  const getOptions = async () => {
    let arr = [];
    arr = vbt?.gstin_option.map((o) => {
      return { value: o, text: o };
    });
    return arr;
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
    console.log(valueTotalData, sgstTotalData, freightTotal);
    if (roundOffSign == "-") {
      totalValidatingData = totalValidatingData - Number(roundOffValue);
    } else if (roundOffSign == "+") {
      totalValidatingData = totalValidatingData + Number(roundOffValue);
      console.log(roundOffValue);
      console.log(totalValidatingData);
    }
    totalValidatingData = Number(totalValidatingData).toFixed(2);
    totalValidatingData = Number(totalValidatingData).toFixed(2);
    if (Number(vendorData.bill_amount).toFixed(2) != totalValidatingData) {
      return toast.error("Bill Amount and total Vendor Amount are not equal");
    }

    let finalObj = {
      ven_code: vbt?.ven_code,
      ven_address: vendorData.in_vendor_addr,
      invoice_no: vendorData.invoice_id,
      invoice_date: vendorData.invoice_date,
      eff_date: vendorData.effective_date,
      comment: vendorData.comment,
      vbt_gstin: vendorData.vbt_gstin,
      bill_amount: vendorData.bill_amount,
      component: [],
      in_qtys: [],
      in_rates: [],
      taxable_values: [],
      part_code: [],
      hsn_code: [],
      in_gst_types: [],
      freight: [],
      gst_ass_vals: [],
      cgsts: [],
      sgsts: [],
      igsts: [],
      g_l_codes: [],
      tds_codes: [],
      tds_gl_code: [],
      tds_ass_vals: [],
      tds_amounts: [],
      ven_amounts: [],
      vbp_gst_rate: [],
      round_type: roundOffSign,
      round_value: roundOffValue,
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
      cgsts: [],
      sgsts: [],
      igsts: [],
      g_l_codes: [],
      tds_codes: [],
      tds_gl_code: [],
      tds_ass_vals: [],
      tds_amounts: [],
      ven_amounts: [],
      vbp_gst_rate: [],
      min_key: [],
      bill_qty: [],
      item_description: [],
      effective_date: "",
    };
    rows.map((row) => {
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
        component: [...compData.component, row.c_name],
        item_description: [...compData.item_description, row.item_description],
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
        cgsts: [...compData.cgsts, Number(row.in_gst_cgst).toFixed(2)],
        sgsts: [...compData.sgsts, Number(row.in_gst_sgst).toFixed(2)],
        igsts: [...compData.igsts, Number(row.in_gst_igst).toFixed(2)],
        g_l_codes: [...compData.g_l_codes, row.glCodeValue],
        tds_codes: [...compData.tds_codes, row.tdsCode ? row.tdsCode : "--"],
        tds_gl_code: [
          ...compData.tds_gl_code,
          row.tdsGL?.tds_gl_code ? row.tdsGL?.tds_gl_code : "--",
        ],
        tds_ass_vals: [...compData.tds_ass_vals, row.tdsAssetValue],
        tds_amounts: [
          ...compData.tds_amounts,
          Number(row.tdsAmount).toFixed(2),
        ],
        ven_amounts: [...compData.ven_amounts, Number(totalVendor).toFixed(2)],
        vbp_gst_rate: [...compData.vbp_gst_rate, row.in_gst_rate],
        min_key: [...compData.min_key, row.min_id],
      };
    });

    finalObj = { ...finalObj, ...compData };

    setLoading(true);
    const { data } = await imsAxios.post("/tally/vbt01/add_vbt01", {
      ...finalObj,
      vbt_gstin: finalObj?.vbt_gstin,
    });
    setLoading(false);
    if (data.code == 200) {
      toast.success(data.message.msg);
      setTimeout(() => {
        setEditingVBT(null);
      }, 2000);
      routeChange();
    } else {
      setLoading(false);
      for (const key in data.message) {
        if (data.message.hasOwnProperty(key)) {
          return toast.error(data.message[key][0]);
        }
      }
    }
  };
  const routeChange = () => {
    let path = `/tally/vendorbillposting/report`;
    navigate(path);
  };

  const getGl = async () => {
    const { data } = await imsAxios.get("/tally/vbt01/vbt01_gl_options");
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

    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        let tdsPercent = obj.tdsGL?.tds_percent ? obj.tdsGL?.tds_percent : 0;

        if (name == "bill_qty") {
          let amountWithFreight =
            Number(value) * Number(obj.in_po_rate) + Number(obj.freight);
          let amountPercentage =
            (amountWithFreight.toFixed(2) * tdsPercent) / 100;
          let tax;
          if (obj.in_gst_type.toLowerCase() == "local") {
            tax =
              parseFloat(
                +obj.in_gst_rate.toFixed(2) * amountWithFreight
              ).toFixed(2) / 200;
            tax = parseFloat(tax).toFixed(2) * 2;
          } else {
            tax =
              parseFloat(obj.in_gst_rate * amountWithFreight).toFixed(2) / 100;
          }
          tax = +Number(tax).toFixed(2);
          let taxAmount =
            Number(value) * +Number(obj.in_po_rate).toFixed(2) + tax;
          let vendorAmount =
            Number(taxAmount).toFixed(2) +
            obj.freight -
            Number(amountPercentage).toFixed(2);
          // let vendorAmount = taxAmount + obj.freight;

          obj = {
            ...obj,
            bill_qty: value,
            vendorAmount: vendorAmount,
            tdsAmount: Number(amountPercentage).toFixed(2),
            value: (Number(value) * Number(obj.in_po_rate)).toFixed(2),
            gstAssetValue: Number(amountWithFreight).toFixed(2),
            tdsAssetValue: Number(amountWithFreight).toFixed(2),
            in_gst_cgst:
              obj.in_gst_type.toLowerCase() == "local"
                ? ((obj.in_gst_rate * amountWithFreight) / 200).toFixed(2)
                : 0,
            in_gst_sgst:
              obj.in_gst_type.toLowerCase() == "local"
                ? ((obj.in_gst_rat * amountWithFreight) / 200).toFixed(2)
                : 0,
            in_gst_igst:
              obj.in_gst_type.toLowerCase() != "local"
                ? ((obj.in_gst_rate * amountWithFreight) / 100).toFixed(2)
                : 0,
          };
        } else if (name == "freight") {
          let amountWithFreight = (Number(value) + Number(obj.value)).toFixed(
            2
          );
          let amountPercentage = (amountWithFreight * tdsPercent) / 100;
          let tax = (obj.in_gst_rate * amountWithFreight) / 100;
          let taxAmount = Number(obj.value) + tax;
          let vendorAmount = taxAmount + Number(value) - amountPercentage;
          // let vendorAmount = taxAmount + Number(value);
          obj = {
            ...obj,
            freight: value,
            vendorAmount: Number(vendorAmount).toFixed(2),
            tdsAmount: Number(amountPercentage).toFixed(2),
            gstAssetValue: Number(amountWithFreight).toFixed(2),
            tdsAssetValue: Number(amountWithFreight).toFixed(2),
            in_gst_cgst:
              obj.in_gst_type.toLowerCase() == "local"
                ? (Number(obj.in_gst_rate) *
                    (Number(value) + Number(obj.value)).toFixed(2)) /
                  (200).toFixed(2)
                : 0,
            in_gst_sgst:
              obj.in_gst_type.toLowerCase() == "local"
                ? (Number(obj.in_gst_rate) *
                    (Number(value) + Number(obj.value)).toFixed(2)) /
                  (200).toFixed(2)
                : 0,
            in_gst_igst:
              obj.in_gst_type.toLowerCase() == "inter state"
                ? (Number(obj.in_gst_rate) *
                    (Number(value) + Number(obj.value)).toFixed(2)) /
                  (100).toFixed(2)
                : 0,
          };
        } else if (name == "tdsCodeValue") {
          let tdsPercent =
            value == "--"
              ? 0
              : obj.tdsData?.filter((tds) => tds.tds_key == value)[0]
                  .tds_percent;
          let amountWithFreight = Number(obj.value) + Number(obj.freight);
          let amountPercentage = (amountWithFreight * tdsPercent) / 100;

          let tax;
          if (obj.in_gst_type.toLowerCase() == "local") {
            tax =
              parseFloat(
                +obj.in_gst_rate.toFixed(2) * amountWithFreight
              ).toFixed(2) / 200;
            tax = parseFloat(tax).toFixed(2) * 2;
          } else {
            tax =
              parseFloat(
                +obj.in_gst_rate.toFixed(2) * amountWithFreight
              ).toFixed(2) / 100;
          }

          let taxAmount = Number(obj.value) + tax;
          let vendorAmount = taxAmount + Number(obj.freight) - amountPercentage;
          // let vendorAmount = taxAmount + Number(obj.freight);
          obj = {
            ...obj,
            tdsCodeValue: value,
            vendorAmount: Number(vendorAmount).toFixed(2),
            tdsGL: obj.tdsData?.filter((tds) => tds.tds_key == value)[0],
            tdsPercent: Number(tdsPercent).toFixed(2),
            tdsCode:
              value == "--"
                ? "--"
                : obj.tdsData?.filter((tds) => tds.tds_key == value)[0].tds_key,
            tdsAmount: Number(amountPercentage).toFixed(2),
          };
        } else if (name == "tdsAmount") {
          let amountWithFreight = Number(obj.value) + Number(obj.freight);
          let tax;
          if (obj.in_gst_type.toLowerCase() == "local") {
            tax =
              parseFloat +
              (obj.in_gst_rate.toFixed(2) * amountWithFreight).toFixed(2) / 200;
            tax = parseFloat(tax).toFixed(2) * 2;
          } else {
            tax =
              parseFloat(
                +obj.in_gst_rate.toFixed(2) * amountWithFreight
              ).toFixed(2) / 100;
          }

          let taxAmount = Number(obj.value) + tax;
          let vendorAmount = taxAmount + Number(obj.freight) - Number(value);
          // let vendorAmount = Number(value) - taxAmount;
          obj = {
            ...obj,
            vendorAmount: Number(vendorAmount).toFixed(2),
            tdsAmount: value,
          };
        } else if (name == "tdsassetvalue") {
          let amountWithFreight = Number(obj.value) + Number(obj.freight);
          let amountPercentage = (value * obj.tdsPercent) / 100;
          let tax;
          if (obj.in_gst_type.toLowerCase() == "local") {
            tax = parseFloat(amountWithFreight).toFixed(2) / 200;
            tax = parseFloat(tax).toFixed(2) * 2;
          } else {
            tax = parseFloat(amountWithFreight).toFixed(2) / 100;
          }

          let taxAmount = Number(obj.value) + tax;
          let vendorAmount = taxAmount + Number(obj.freight) - amountPercentage;
          // let vendorAmount = taxAmount + Number(value);
          obj = {
            ...obj,
            tdsAssetValue: value,
            tdsAmount: Number(amountPercentage).toFixed(2),
            vendorAmount: Number(vendorAmount).toFixed(2),
          };
        } else if (name == "glCodes") {
          obj = {
            ...obj,
            glCodeValue: value,
          };
        } else {
          obj = {
            ...obj,
            [name]: value,
          };
        }
        return obj;
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  const vendorInputHandler = (name, value) => {
    setVendorData((vendorData) => {
      return {
        ...vendorData,
        [name]: value,
      };
    });
  };

  useEffect(() => {
    getGl();
    if (editingVBT?.length > 0) {
      setVendorData({
        in_vendor_addr: editingVBT[0]?.ven_address,
        invoice_date: editingVBT[0]?.invoice_date,
        effective_date: editingVBT[0]?.effective_date,
        invoice_id: editingVBT[0]?.invoice_no,
        gstinOptions: editingVBT[0]?.gstin_option?.map((r) => {
          return { text: r, value: r };
        }),
        bill_amount: "",
        vbt_gstin: editingVBT[0]?.gstin,
        comment: editingVBT[0].comment,
      });
      setVBT(editingVBT[0]);
      let arr = editingVBT?.map((row) => {
        let tdsC = row.ven_tds?.map((r) => {
          return { text: r.tds_name, value: r.tds_key };
        });
        let id = v4();
        return {
          id: id,
          min_id: row.min_id,
          c_name: row.item_name,
          qty: row.inqty,
          uom: row.comp_unit,
          bill_qty: row.bill_qty,
          maxQty: row.qty,
          c_part_no: row.item,
          comp_unit: row.comp_unit,
          in_gst_cgst: row.cgst == "--" ? 0 : row.cgst,
          in_gst_igst: row.igst == "--" ? 0 : row.igst,
          in_gst_sgst: row.sgst == "--" ? 0 : row.sgst,
          in_gst_rate: row.gst_rate,
          in_gst_type:
            row.gst_type == "L"
              ? "Local"
              : (row.gst_type = "I" && "Inter State"),
          in_hsn_code: row.in_hsn_code,
          in_po_rate: row.inrate,
          freight: 0,
          freightGl: "(Freight Inward)800105",
          gstAssetValue: row.gst_ass_value, // value + freight
          CGSTGL: "CGST Input(400501)",
          SGSTGL: "SGST Input (400516)",
          IGSTGL: "IGST Input(400511)",
          glCodeValue: "TP821753548513",
          glCodes: glCodes,
          tdsAmount: row.tds_amount,
          tdsPercent: 0,
          tdsAssetValue: row.tds_ass_val,
          vendorAmount:
            row.in_gst_type == "Local"
              ? Number(row.taxable_value) + Number(row.cgst) + Number(row.sgst)
              : Number(row.taxable_value) + Number(row.igst),
          // tds amount is equal to percentage of tds asset value
          //vendor amount is equal to gst asset value - tds amount
          // tdsCodes: [{ text: "--", value: "--" }, ...tdsC],
          tdsCodes: [{ text: "--", value: "--" }],
          tdsData: row.ven_tds,
          tdsGL: { label: "", value: "" },
          value: row.taxable_value,
          comp_unit: row.comp_unit,
          item_description: row.item_description,
        };
      });
      setRows(arr);
    }
  }, [editingVBT]);

  useEffect(() => {
    let freightexist = false;
    let totalVendorAmount = [];
    totalVendorAmount = rows.map(
      (row) =>
        Number(row.value) +
        Number(row.in_gst_cgst) +
        Number(row.in_gst_sgst) +
        Number(row.in_gst_igst) +
        Number(row.freight) -
        Number(row.tdsAmount)
    );

    // let totalVendorAmount = rows.map((row) => {
    //   Number(
    //     Number(row.in_gst_igst) +
    //       Number(row.in_gst_sgst) +
    //       Number(row.in_gst_cgst) +
    //       Number(row.vendorAmount)
    //   );
    // });
    totalVendorAmount = totalVendorAmount.reduce((partialSum, a) => {
      return partialSum + Number(a);
    }, 0);
    let totalVendorAmountWithRoundOff;
    if (roundOffSign == "-") {
      totalVendorAmountWithRoundOff = Number(
        Number(totalVendorAmount) - Number(roundOffValue)
      ).toFixed(2);
    } else if (roundOffSign == "+") {
      totalVendorAmountWithRoundOff = Number(
        Number(totalVendorAmount) + Number(roundOffValue)
      ).toFixed(2);
    }

    let arr = [
      {
        label: "Net Amount",
        sign: "",
        values: rows.map((row) => Number(row.value)?.toFixed(2)),
      },
      {
        label: "CGST",
        sign: "+",
        values: rows.map((row) =>
          row.in_gst_cgst == "--" ? 0 : Number(row.in_gst_cgst)?.toFixed(2)
        ),
      },
      {
        label: "SGST",
        sign: "+",
        values: rows.map((row) =>
          row.in_gst_sgst == "--" ? 0 : Number(row.in_gst_sgst).toFixed(2)
        ),
      },
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
        label: "TDS Amount",
        sign: "-",
        values: rows.map((row) => Number(row.tdsAmount)?.toFixed(2)),
      },
      {
        label: "Round Off",
        sign: roundOffSign.toString(),
        values: [Number(roundOffValue).toFixed(2)],
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
      title={`MIN: ${vbt?.min_id}`}
      extra={
        <p style={{ whiteSpace: "nowrap" }}>
          {"Vendor :" + vbt?.ven_name + " : " + vbt?.ven_code}
        </p>
      }
      width="100vw"
      onClose={() => setEditingVBT(null)}
      open={editingVBT}
    >
      {loading && <Loading />}
      <div style={{ height: "95%" }}>
        <Tabs style={{ height: "100%" }} type="card" size="small">
          <Tabs.TabPane tab="Header" key="1">
            <Row gutter={16}>
              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Vendor Address
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      name="termscondition"
                      value={vendorData?.in_vendor_addr?.replaceAll(
                        "<br>",
                        " "
                      )}
                      onChange={(e) =>
                        vendorInputHandler("in_vendor_addr", e.target.value)
                      }
                      placeholder="Vendor Address"
                    />
                  </Form.Item>
                </Form>
              </Col>

              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Invoice Date
                      </span>
                    }
                  >
                    <InputMask
                      name="due_date[]"
                      value={vendorData?.invoice_date}
                      onChange={(e) =>
                        vendorInputHandler("invoice_date", e.target.value)
                      }
                      className="input-date"
                      mask="99-99-9999"
                      placeholder="__-__-____"
                      //   style={{ width: "12vh" }}
                    />
                  </Form.Item>
                </Form>
              </Col>

              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Effective Date
                      </span>
                    }
                  >
                    <InputMask
                      name="due_date[]"
                      value={vendorData?.effective_date}
                      onChange={(e) =>
                        vendorInputHandler("effective_date", e.target.value)
                      }
                      style={{
                        height: 33,
                        width: "100%",
                        padding: "0 10px",
                        borderRadius: 2,
                        border: "1px solid #D9D9D9",
                      }}
                      className="input"
                      mask="99-99-9999"
                      placeholder="__-__-____"

                      // defaultValue="00-00-0000"
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Invoice Number
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      name="termscondition"
                      value={vendorData?.invoice_id}
                      onChange={(e) =>
                        vendorInputHandler("invoice_id", e.target.value)
                      }
                      placeholder="Invoice Number"
                    />
                  </Form.Item>
                </Form>
              </Col>

              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Bill Amount
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      name="termscondition"
                      value={vendorData?.bill_amount}
                      onChange={(e) =>
                        vendorInputHandler("bill_amount", e.target.value)
                      }
                      placeholder="Bill Amount"
                    />
                  </Form.Item>
                </Form>
              </Col>

              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        GSTIN Number
                      </span>
                    }
                  >
                    <MySelect
                      options={
                        vendorData?.gstinOptions ? vendorData?.gstinOptions : []
                      }
                      value={vendorData?.vbt_gstin}
                      onChange={(value) => {
                        vendorInputHandler("vbt_gstin", value);
                      }}
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Comments
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      name="termscondition"
                      value={vendorData?.comment}
                      onChange={(e) =>
                        vendorInputHandler("comment", e.target.value)
                      }
                      placeholder="Comments"
                    />
                  </Form.Item>
                </Form>
              </Col>

              <Col span={8}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Round Off
                      </span>
                    }
                  >
                    <div style={{ display: "flex" }}>
                      <select onChange={(e) => setRoundOffSign(e.target.value)}>
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <Input
                        size="default"
                        name="termscondition"
                        value={roundOffValue}
                        onChange={(e) => setRoundOffValue(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ height: "95%" }}
            tab="Particulars"
            key="2"
            className="remove-table-footer remove-cell-border"
          >
            <VBT1DataTable
              removeRows={removeRows}
              inputHandler={inputHandler}
              rows={rows}
            />

            {editingVBT && (
              <NavFooter
                loading={loading}
                backFunction={backFunction}
                nextLabel="Submit"
                submitFunction={submitFunction}
              />
            )}
          </Tabs.TabPane>
        </Tabs>
        <TaxModal bottom={-140} visibleBottom={165} totalValues={totalValues} />
      </div>
    </Drawer>
  );
}
