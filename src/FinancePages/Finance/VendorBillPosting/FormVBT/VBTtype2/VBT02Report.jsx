import { Card, Col, Drawer, Form, Input, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { imsAxios } from "../../../../../axiosInterceptor";
import { useEffect } from "react";
import SingleComponent from "./SingleProduct";
// import SingleProduc
import VBTHeaders from "./VBTHeaders";
// import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import NavFooter from "../../../../../Components/NavFooter";
import validateResponse from "../../../../../Components/validateResponse";
function VBT02Report({
  editingVBT,
  setEditingVBT,
  setVBTData,
  apiUrl,
  setApiUrl,
  editVbtDrawer,
  isFromEdit,
  setEditVbtDrawer,
}) {
  const [Vbt01] = Form.useForm();
  const [vbtComponent, setVbtComponent] = useState([]);
  const [taxDetails, setTaxDetails] = useState([]);
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [tdsArray, setTdsArray] = useState([]);
  const [allTdsOptions, setAllTdsOptions] = useState([]);
  const [optionState, setOptionState] = useState([]);
  const [glCodes, setGlCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [addFreightCalc, setAddFreightCalc] = useState(false);
  const [addMiscCalc, setAddMiscCalc] = useState(false);
  const [addInsurCalc, setAddInsurCalc] = useState(false);
  const [allRowInsurance, setAllRowInsurance] = useState(false);
  const [allRowFreight, setAllRowFreight] = useState(false);
  const [allRowSws, setAllRowSws] = useState(false);
  // ---
  const [editVBTCode, setEditVBTCode] = useState([]);
  const [editApiUrl, setEditApiUrl] = useState("");
  const [isCreate, setIsCreate] = useState(false);
  const [glstate, setglState] = useState([]);
  const components = Form.useWatch("components", {
    form: Vbt01,
    preserve: true,
  });

  const [lastRateArr, setLastRateArr] = useState([]);
  const resetForm = () => {
    Vbt01.resetFields();
  };
  const getApiUrl = (vbtCode) => {
    return vbtCode.split("/")[0].toLowerCase();
  };
  const backFunction = () => {
    if (editingVBT) {
      setEditingVBT(null);
      setIsCreate(false);

      // resetForm();
    } else {
      setEditVbtDrawer(null);
      Vbt01.setFields([
        {
          name: "components",
          touched: false,
        },
      ]);
    }

    resetForm();
    setRoundOffSign("+");
    setRoundOffValue(0);
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

  // const getTdsOptions = async (minId) => {
  //   const response = await imsAxios.post(`/tally/${apiUrl}/fetch_minData`, {
  //     min_id: minId,
  //   });
  //   const { data } = response;
  //   data.data[0].ven_tds.push({
  //     ladger_name: "--",
  //     ledger_key: "--",
  //     tds_code: "--",
  //     tds_key: "--",
  //     tds_name: "--",
  //     tds_gl_code: "--",
  //     tds_percent: "0",
  //   });
  //   if (data.code === 200) {
  //     let arr = data.data;
  //     setAllTdsOptions(arr[0].ven_tds);

  //     let tdsC = arr[0].ven_tds.map((r) => {
  //       return {
  //         text: r.tds_name,
  //         value: r.tds_key,
  //       };
  //     });
  //     setTdsArray(tdsC);
  //   } else {
  //     toast.error(data.message.msg);
  //   }
  // };
  const getGl = async () => {
    let link;
    if (editVbtDrawer) {
      let apiLink = getApiUrl(editVbtDrawer);
      // console.log("apilink", apiLink);
      setEditApiUrl(apiLink);
      link = `/tally/${apiLink}/${apiLink}_gl_options`;
    } else {
      link = `/tally/${apiUrl}/${apiUrl}_gl_options`;
    }
    const { data } = await imsAxios.get(link);
    let arr = [];
    if (data.length > 0) {
      arr = data.map((d) => {
        return {
          text: d.text,
          value: d.id,
        };
      });
      // console.log("arr=>", arr);
      setGlCodes(arr);
    }
  };

  const submitFunction = async () => {
    const values = await Vbt01.validateFields();

    if (isCreate) {
      const roundarr = values.components.map(
        (component) => component.venAmmount
      );
      let a;
      if (roundOffSign.toString() === "+") {
        a = roundarr[roundarr.length - 1] + +Number(roundOffValue.toString());
      } else if (roundOffSign.toString() === "-") {
        a = roundarr[roundarr.length - 1] -= +Number(roundOffValue.toString());
      } else {
        a = roundarr[roundarr.length - 1];
        // console.log("a- with out any roundoff", a);
      }
      const modifiedArray =
        roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;
      let finalObj = {
        bill_amount: values.billAmmount,
        bill_qty: values.components.map((component) => component.vbtBillQty),
        // cgst_gl: values.components.map((component) => component.CGSTGLValue),
        // cgsts: values.components.map((component) => component.cgstAmount),
        comment: values.comment,
        component: values.components.map((component) => component.partName),
        eff_date: values.effectiveDate,
        freight: values.components.map((component) =>
          component.freightAmount.toString()
        ),
        g_l_codes: values.components.map((component) => component.glCodeValue),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue
        ),
        hsn_code: values.components.map((component) => component.hsnCode),
        igst_gl: values.components.map((component) => component.IGSTGLValue),
        igsts: values.components.map((component) => component.igstAmount),
        in_gst_types: values.components.map((component) => component.gstType),
        in_qtys: values.components.map((component) => component.vbtInQty),
        in_rates: values.components.map((component) => component.vbtInRate),
        invoice_date: values.invoiceDate,
        invoice_no: values.invoiceNo,
        // invoice_no: values.components.map((component) => component.invoiceNo),
        item_description: values.components.map(
          (component) => component.itemDescription
        ),
        min_key: values.components.map((component) => component.minId),
        part_code: values.components.map((component) => component.partCode),
        // sgst_gl: values.components.map((component) => component.CGSTGLValue),
        // sgsts: values.components.map((component) => component.sgstAmount),

        taxable_values: values.components.map(
          (component) => component.taxableValue
        ),
        // tds_amounts: values.components.map((component) => component.tdsAmount),
        // tds_ass_vals: values.components.map((component) => component.tdsAssValue),
        // tds_codes: values.components.map((component) => component.tds_key),
        // tds_gl_code: values.components.map((component) => component.tds_gl_code),
        vbp_gst_rate: values.components.map((component) => component.gstRate),
        vbt_gstin: "999999999999999",
        ven_address: values.venAddress,
        ven_amounts: modifiedArray,
        ven_code: values.components[0]?.ven_code,
        // vbt_gstin: values.components[0]?.gstin_option[0],
        // poNumber: values.components.map((component) => component.poNumber),
        // projectID: values.components.map((component) => component.projectID),
        // // vbtKey: editVbtDrawer,
        // insertDate: values.components[0]?.insertDate,
        // insertBy: values.components[0]?.insertBy,
        ////////
        port_code: values.portCode,
        port_name: values.portName,
        boe_no: values.boeNo,
        boe_date: values.boeDate,
        cha: values.cha,
        hawb_no: values.hawbNo,
        mawb_no: values.mawbNo,
        currency: values.components.map((component) => component.currency),
        custom_duty: values.components.map((component) => component.customDuty),
        exchange: values.components.map((component) => component.currencyRate),
        freight: values.components.map((component) => component.freightAmount),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue
        ),
        insurance: values.components.map((component) =>
          component.insurance.toString()
        ),
        misc: values.components.map((component) =>
          component.miscCharges.toString()
        ),
        other_charges: values.components.map(
          (component) => component.otherDuty
        ),
        sws: values.components.map((component) => component.sws),
        cifValue: values.components.map((component) => component.cifValue),
        cifPrice: values.components.map((component) => component.cifPrice),
        inrPrice: values.components.map((component) => component.inrPrice),
        customAssValue: values.components.map(
          (component) => component.customAssVal
        ),

        // misc: values.components.map((component) => component.miscCharges),
      };

      const finalData = {
        ...finalObj,
        round_type: roundOffSign.toString(),
        round_value: roundOffValue.toString(),
      };
      // console.log("finalData", finalData);
      addVbt(finalData);
    } else {
      const roundarr = values.components.map(
        (component) => component.venAmmount
      );
      // console.log("roundarr", roundarr);
      // console.log("roundOffValue", roundOffValue);
      // console.log("roundOffSign", roundOffSign);
      let a;
      if (roundOffSign.toString() === "+") {
        a = roundarr[roundarr.length - 1] + +Number(roundOffValue.toString());
        // console.log("a", a);
      } else if (roundOffSign.toString() === "-") {
        a = roundarr[roundarr.length - 1] -= +Number(roundOffValue.toString());
        // console.log("a", a);
      } else {
        a = roundarr[roundarr.length - 1];
        // console.log("a- with out any roundoff", a);
      }
      const editmodifiedArray =
        roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;
      let finalObj = {
        bill_amount: values.billAmmount,
        bill_qty: values.components.map((component) => component.vbtBillQty),
        // cgst_gl: values.components.map((component) => component.CGSTGLValue),
        // cgsts: values.components.map((component) => component.cgstAmount),
        comment: values.comment,
        component: values.components.map((component) => component.partName),
        eff_date: values.effectiveDate,
        freight: values.components.map((component) =>
          component.freightAmount.toString()
        ),
        g_l_codes: values.components.map((component) => component.glCodeValue),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue
        ),
        hsn_code: values.components.map((component) => component.hsnCode),
        igst_gl: values.components.map((component) => component.IGSTGL.value),
        igsts: values.components.map((component) => component.igstAmount),
        in_gst_types: values.components.map((component) => component.gstType),
        in_qtys: values.components.map((component) => component.vbtInQty),
        in_rates: values.components.map((component) => component.vbtInRate),
        invoice_date: values.invoiceDate,
        invoice_no: values.invoiceNo,
        // invoice_no: values.components.map((component) => component.invoiceNo),
        item_description: values.components.map(
          (component) => component.itemDescription
        ),
        min_key: values.components.map((component) => component.minId),
        part_code: values.components.map((component) => component.partCode),
        // sgst_gl: values.components.map((component) => component.CGSTGLValue),
        // sgsts: values.components.map((component) => component.sgstAmount),

        taxable_values: values.components.map(
          (component) => component.taxableValue
        ),
        // tds_amounts: values.components.map((component) => component.tdsAmount),
        // tds_ass_vals: values.components.map((component) => component.tdsAssValue),
        // tds_codes: values.components.map((component) => component.tds_key),
        // tds_gl_code: values.components.map((component) => component.tds_gl_code),
        vbp_gst_rate: values.components.map((component) => component.gstRate),
        vbt_gstin: "999999999999999",
        ven_address: values.venAddress,
        ven_amounts: editmodifiedArray,
        ven_code: values.components[0]?.venCode,
        // vbt_gstin: values.components[0]?.gstin_option[0],
        // poNumber: values.components.map((component) => component.poNumber),
        // projectID: values.components.map((component) => component.projectID),
        // // vbtKey: editVbtDrawer,
        // insertDate: values.components[0]?.insertDate,
        // insertBy: values.components[0]?.insertBy,
        ////////
        port_code: values.portCode,
        port_name: values.portName,
        boe_no: values.boeNo,
        boe_date: values.boeDate,
        cha: values.cha,
        hawb_no: values.hawbNo,
        mawb_no: values.mawbNo,
        currency: values.components.map((component) => component.currency),
        custom_duty: values.components.map((component) => component.customDuty),
        exchange: values.components.map((component) => component.currencyRate),
        freight: values.components.map((component) => component.freightAmount),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue
        ),
        insurance: values.components.map((component) =>
          component.insurance.toString()
        ),
        misc: values.components.map((component) =>
          component.miscCharges.toString()
        ),
        other_charges: values.components.map(
          (component) => component.otherDuty
        ),
        sws: values.components.map((component) => component.sws),
        // misc: values.components.map((component) => component.miscCharges),
        vbtKey: editVbtDrawer,
        insertDate: values.components[0]?.insertDate,
        insertBy: values.components[0]?.insertBy,
        poNumber: values.components.map((component) => component.poNumber),
        projectID: values.components.map((component) => component.projectID),
        cifValue: values.components.map((component) => component.cifValue),
        cifPrice: values.components.map((component) => component.cifPrice),
        inrPrice: values.components.map((component) => component.inrPrice),
        customAssValue: values.components.map(
          (component) => component.customAssVal
        ),
      };
      const finalData = {
        ...finalObj,
        roundOffSign: roundOffSign.toString(),
        roundOffValue: roundOffValue.toString(),
      };
      // console.log("finalData for update", finalData);
      updateVbt(finalData);
    }
    // con
  };

  const addVbt = async (finalData) => {
    setLoading(true);
    const response = await imsAxios.post(
      `/tally/${apiUrl}/add_${apiUrl}`,
      finalData
    );
    const { data } = response;
    // console.log("response", response);
    if (response.status == 200) {
      toast.success(data);
      setTimeout(() => {
        setEditingVBT(null);
      }, 2000);
      // setVBTData([]);
      setLoading(false);
      backFunction();
    } else {
      setLoading(false);
      validateResponse(data);
    }
    setLoading(false);
  };
  const updateVbt = async (finalData) => {
    let vbtCodeForEdit = getApiUrl(editVbtDrawer);
    // console.log("vbtCodeForEdit", vbtCodeForEdit);
    // return;
    let link = `/tally/${vbtCodeForEdit}/update`;
    const response = await imsAxios.put(link, finalData);
    const { data } = response;
    // console.log("data", response);
    if (response.status === 200) {
      toast.success(response.data);
      setEditVbtDrawer(null);
      setLoading(false);
    } else {
      toast.error(response.data);
      setLoading(false);
    }
  };
  const showCofirmModal = () => {
    Modal.confirm({
      okText: "Save",
      title: isCreate
        ? "Are you sure you want to add this VBT"
        : "Are you sure you want to submit the Edited details",
      content: isCreate
        ? "Please make sure that the values are correct."
        : "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitFunction();
      },
    });
  };
  //edit vbt fn
  const getEditVbtDetails = async (vbtCode) => {
    setLoading(true);
    const response = await imsAxios.get(`/tally/vbt/getData?vbtKey=${vbtCode}`);

    if (response.status == 200) {
      const { data } = response;
      // console.log("response", response);
      let newMin = response.data[0].minId;
      // console.log("newMin", newMin); // setVbtComponent(data);
      getGl();
      let tdsName = {
        label: data[0]?.tds?.glName,
        Value: data[0]?.tds?.tdsGlKey,
      };

      const arr = data.map((row) => ({
        ...row,

        tdsAssValue: row.tdsAssValue,
        venAmmount: row.venAmmount,
        poNumber: row.poNumber,
        projectID: row.projectID,
        partCode: row.part.partCode,
        partName: row.part.partName,
        glName: row.tds?.tdsName,
        glCode: row?.tds?.tdsGlKey,
        // tdsName: {
        //   label: row.tds?.tdsName,
        //   value: row?.tds?.tdsKey,
        // },
        // tds_key: row?.tds?.tdsKey,
        // tdsPercent: row?.tds?.tdsPercent,
        // tdsAmount: row.tdsAmount,
        // gstType: row.gstType === "L" ? "L" : "I",
        insertDate: row.insertDate,
        insertBy: row.insertBy,
        roundOffSigns: row.roundOffSign,
        roundOffValue: row.roundOffValue,
        // purchaseGl: row?.purchase_gl,
        billAmm: row?.taxableValue,
        currencyRate: row?.exchangeRate,
        miscCharges: row?.misc,
        insurance: row?.insuranceValue,
        freightAmount: row?.freightAmount,
        otherDuty: row?.otherCharges,
        IGSTGL: row?.igst,
        igstAmount: row?.igstAmount,
        vbtOtherData: row?.vbtOtherData,
        currency: row?.currencyType,
        currency: row?.currencyType,
        // gstAssValue,
        // igstAmount: row.igsts,
        // miscCharges: row.misc,
        gstAssValue: row?.gstAssValue,
        glCodeValue: row?.purchase_gl.value,
      }));

      // setEditingVBT(arr);
      setEditVBTCode(arr);
      setVbtComponent(arr);
      Vbt01.setFieldValue("components", arr);
      // getTdsOptions(response.data[0]?.minId);
      setLoading(false);
    }
  };
  const getGstGlOptions = async () => {
    const response = await imsAxios.get("/tally/vbt/fetch_gst_ledger");
    const { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({ value: row.id, text: row.text }));
        setglState(arr);
      }
    }
  };
  const getVBTDetail = async (minIdArr) => {
    // return;
    // setLoading(true);
    // console.log("this iwas the min id", minId);
    // const response = await imsAxios.post(`/tally/${apiUrl}/fetch_minData`, {
    //   min_id: minId,
    // });
    const response = await imsAxios.post(
      `/tally/${apiUrl}/fetch_multi_min_data`,
      {
        mins: minIdArr.map((row) => row),
      }
    );
    const { data } = response;
    if (data.code === 200) {
      setVbtComponent(data);
      const arr = data.data.map((row) => ({
        ...row,
        minId: row.min_id,
        // poNumber: row.poNumber,
        // projectID: row.projectID,
        partCode: row.c_part_no,
        partName: row.c_name,
        vbtBillQty: row.qty,
        vbtInQty: row.qty,
        taxableValue: row.value,
        vbtInRate: row.in_po_rate,
        hsnCode: row.in_hsn_code,
        gstRate: row.in_gst_rate,
        cgstAmount: row.in_gst_cgst,
        sgstAmount: row.in_gst_sgst,
        igstAmount: row.in_gst_igst,
        venAddress: row.in_vendor_addr,
        igstAmount: row.in_gst_igst,
        ven_name: row.in_gst_igst,
        // glName: row.tds?.tdsName,
        // glCode: row?.tds?.tdsGlKey,
        tdsName: {
          label: row.ven_tds?.tds_name,
          value: row?.ven_tds?.tds_key,
        },
        unit: row.comp_unit,
        // tdsPercent: row?.tds?.tdsPercent,

        gstType: row.gstType === "L" ? "L" : "I",
        insertDate: row.insertDate,
        insertBy: row.insertBy,
        roundOffSigns: row.roundOffSign,
        roundOffValue: row.roundOffValue,
        // CGSTGLValue: "TP274965899340",
        // SGSTGLValue: "TP385675494002",
        IGSTGLValue: "TP486973272469",
        // IGSTGLValue: "TP486973272469",

        // CGSTGL: "CGST Input(400501)",
        // SGSTGL: "SGST Input (400516)",
        IGSTGL: "IGST Input (2040109)",
        glCodeValue: "TP889514899393",
        glCode: glCodes,
        freight: "Freight Inward - Import (6030105)",

        value: row.value,
        currencyRate: 1,
        cif: 0,
        currency: "28567096",
        miscCharges: 0,
        totalMisc: 0,
        misc: 0,
        totalInsurance: 0,
        insurance: 0,
        sws: 0,
        customDuty: 0,
        otherDuty: 0,
        freightAmount: 0,
        // totalFreight: 0,
        // totalMisc: 0,
        freight: 0,
        // portCode: "INDEL4",
        // portName: "Delhi Air Cargo",
        // boeNo: "",
        // boeDate: "",
        // cha: "LINKERS INDIA LOGISTICS PV",
        // hawbNo: "",
        // mawbNo: "",
      }));
      getGl();
      getCurrencies();
      // getTdsOptions(minIdArr[0]);
      Vbt01.setFieldValue("components", arr);
      Vbt01.setFieldValue("portCode", "INDEL4");
      Vbt01.setFieldValue("gst", "999999999999999");
      Vbt01.setFieldValue("totalFreight", 0);
      Vbt01.setFieldValue("totalMisc", 0);
      // Vbt01.setFieldValue("portCode", "INDEL4");
      Vbt01.setFieldValue("portName", "Delhi Air Cargo");
      Vbt01.setFieldValue("cha", "LINKERS INDIA LOGISTICS PV");
      const partCodeArr = arr.map((row) => row.c_part_no);
      if (arr[0]?.ven_code) {
        getLastPrice(arr[0]?.ven_code, partCodeArr);
      }
      // if (isEditVBT) {
      //   const arr = data.data;
      //   setEditingVBT([...arr]);
      //   editExistingVbt(vbtKey);
      // }
    } else {
      toast.error(data.message.msg);
      setEditingVBT(null);
    }
    // setLoading(false);
  };
  const getLastPrice = async (venCode, partArr) => {
    const response = await imsAxios.post(
      // `/tally/vbt/lastOptions?vendorCode=${venCode}&partCode=${partCode}`
      "/tally/vbt/lastOptions",
      {
        partCode: partArr,
        vendorCode: venCode,
      }
    );
    const { data } = response;
    if (typeof data === "object" && data?.length) {
      setLastRateArr(data);
    } else {
      setLastRateArr([]);
    }
  };

  // useEffect(() => {
  //   if (editVbtDrawer) {
  //     getEditVbtDetails(editVbtDrawer);
  //   }
  // }, [editVbtDrawer]);
  useEffect(() => {
    if (editingVBT?.length > 0) {
      getVBTDetail(editingVBT);
      setIsCreate(true);
      // console.log("editingVBT", editingVBT);
      // let editUrl = editingVBT[0].split("/");
      // editUrl = editUrl[0];
      // getFreightGlOptions(editUrl.toLowerCase());
      getGstGlOptions();
    }
  }, [editingVBT]);

  useEffect(() => {
    if (editVbtDrawer) {
      // console.log("editVBTdrawees", editVbtDrawer);
      getEditVbtDetails(editVbtDrawer);
      getCurrencies();
      getGstGlOptions();
      Vbt01.setFields([
        {
          name: "components",
          touched: false,
        },
      ]);
    }
  }, [editVbtDrawer]);

  useEffect(() => {
    const values = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.taxableValue).toFixed(2),
      0
    );
    const value = +Number(values).toFixed(2);
    const freight = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.freightAmount).toFixed(2),
      0
    );
    const cgsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.cgstAmount).toFixed(2),
      0
    );
    const cgst = +Number(cgsts).toFixed(2);
    const sgsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.sgstAmount).toFixed(2),
      0
    );
    const sgst = +Number(sgsts).toFixed(2);
    // console.log("sgst", sgst);
    const igsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.igstAmount).toFixed(2),
      0
    );

    const igst = +Number(igsts).toFixed(2);
    // console.log("igst", igst);

    let vendorAmounts;
    vendorAmounts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(2),
      0
    );
    var vendorAmount = +Number(vendorAmounts).toFixed(2);
    // console.log("vendorAmount", vendorAmount);
    const tds = components?.reduce(
      (a, b) => a + +Number(b.tdsAmount ?? 0).toFixed(2),
      0
    );

    if (roundOffSign === "+") {
      vendorAmounts = vendorAmount + +Number(roundOffValue).toFixed(2);
      vendorAmount = +Number(vendorAmounts).toFixed(2);
    }
    if (roundOffSign === "-") {
      vendorAmounts -= +Number(roundOffValue).toFixed(2);
      vendorAmount = +Number(vendorAmounts).toFixed(2);
    }

    const arr = [
      {
        title: "Value",
        description: value,
      },
      {
        title: "Freight",
        description: freight,
      },
      {
        title: "CGST",
        description: cgst,
      },
      {
        title: "SGST",
        description: sgst,
      },
      {
        title: "IGST",
        description: igst,
      },
      { title: "TDS", description: tds },
      {
        title: "Round Off",
        description:
          roundOffSign.toString() + [Number(roundOffValue).toFixed(2)],
      },
      {
        title: "Vendor Amount",
        description: vendorAmount,
      },
    ];
    setTaxDetails(arr);
  }, [components, roundOffSign, roundOffValue]);
  useEffect(() => {}, [components]);
  // console.log("editingVBt", vbtComponent);
  return (
    <Drawer
      bodyStyle={{ padding: 5 }}
      width="100vw"
      onClose={backFunction}
      open={editingVBT || editVbtDrawer}
      destroyOnClose={true}
      title={
        isCreate
          ? vbtComponent?.data &&
            `${vbtComponent?.data[0]?.ven_name} | ${vbtComponent?.data[0]?.ven_code}`
          : `${editVbtDrawer}`
      }
    >
      <Form
        style={{ height: "100%" }}
        form={Vbt01}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={5} style={{ height: "100%" }}>
          <Col span={6} style={{ overflow: "hidden", height: "90%" }}>
            <VBTHeaders
              taxDetails={taxDetails}
              form={Vbt01}
              vbtComponent={vbtComponent}
              setVbtComponent={setVbtComponent}
              editingVBT={editingVBT}
              setEditingVBT={setEditingVBT}
              roundOffSign={roundOffSign}
              roundOffValue={roundOffValue}
              setRoundOffSign={setRoundOffSign}
              setRoundOffValue={setRoundOffValue}
              addFreightCalc={addFreightCalc}
              setAddFreightCalc={setAddFreightCalc}
              addMiscCalc={addMiscCalc}
              setAddMiscCalc={setAddMiscCalc}
              setAddInsurCalc={setAddInsurCalc}
              addInsurCalc={addInsurCalc}
              allRowInsurance={allRowInsurance}
              setAllRowInsurance={setAllRowInsurance}
              allRowFreight={allRowFreight}
              setAllRowFreight={setAllRowFreight}
              setAllRowSws={setAllRowSws}
              allRowSws={allRowSws}
              editVBTCode={editVBTCode}
              glstate={glstate}
            />
          </Col>

          <Col
            span={18}
            style={{
              height: "90%",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <Form.List name="components">
              {(fields, { add, remove }) => (
                <>
                  <Col>
                    {fields.map((field, index) => (
                      <Form.Item noStyle>
                        <SingleComponent
                          fields={fields}
                          field={field}
                          index={index}
                          add={add}
                          form={Vbt01}
                          remove={remove}
                          tdsArray={tdsArray}
                          allTdsOptions={allTdsOptions}
                          // setOptionState={setOptionState}
                          optionState={optionState}
                          // glstate={glstate}
                          // setglState={setglState}
                          getGl={getGl}
                          glCodes={glCodes}
                          setGlCodes={setGlCodes}
                          apiUrl={apiUrl}
                          currencies={currencies}
                          setCurrencie={setCurrencies}
                          addFreightCalc={addFreightCalc}
                          setAddFreightCalc={setAddFreightCalc}
                          addMiscCalc={addMiscCalc}
                          setAddMiscCalc={setAddMiscCalc}
                          setAddInsurCalc={setAddInsurCalc}
                          addInsurCalc={addInsurCalc}
                          allRowInsurance={allRowInsurance}
                          setAllRowInsurance={setAllRowInsurance}
                          allRowFreight={allRowFreight}
                          setAllRowFreight={setAllRowFreight}
                          setAllRowSws={setAllRowSws}
                          allRowSws={allRowSws}
                          loading={loading}
                          setEditApiUrl={setEditApiUrl}
                          isCreate={isCreate}
                          setIsCreate={setIsCreate}
                          setglState={setglState}
                          getGstGlOptions={getGstGlOptions}
                          glstate={glstate}
                          lastRateArr={lastRateArr}
                        />
                      </Form.Item>
                    ))}
                    <Row justify="center">
                      <Typography.Text type="secondary">
                        ----End of the List----
                      </Typography.Text>
                    </Row>
                  </Col>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
      </Form>
      <NavFooter
        nextLabel="Submit"
        submitFunction={() => {
          showCofirmModal();
        }}
        resetFunction={backFunction}
        loading={loading}
      />
    </Drawer>
  );
}

export default VBT02Report;
const initialValues = {
  minId: "",
};
