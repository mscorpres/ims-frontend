import { useState, useEffect } from "react";
import { Col, Drawer, Form, Modal, Row, Typography } from "antd";
import { imsAxios } from "../../../../../axiosInterceptor";
import VBTHeaders from "./VBTHeaders";
import { toast } from "react-toastify";
import NavFooter from "../../../../../Components/NavFooter";
import validateResponse from "../../../../../Components/validateResponse";
import Loading from "../../../../../Components/Loading";
import SingleComponent from "./SingleProduct";

function VBT01Report({
  editingVBT,
  setEditingVBT,
  apiUrl,
  editVbtDrawer,
  setEditVbtDrawer,
}) {
  const [Vbt01] = Form.useForm();
  const [vbtComponent, setVbtComponent] = useState([]);
  const [taxDetails, setTaxDetails] = useState([]);
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [tdsArray, setTdsArray] = useState([]);
  const [allTdsOptions, setAllTdsOptions] = useState([]);
  const [glCodes, setGlCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editVBTCode, setEditVBTCode] = useState([]);
  const [isCreate, setIsCreate] = useState(false);
  const [editApiUrl, setEditApiUrl] = useState("");
  const [freightGlOptions, setFreightGlOptions] = useState([]);
  const [glstate, setglState] = useState([]);
  const [billam, setBillam] = useState([]);
  const [lastRateArr, setLastRateArr] = useState([]);

  const components = Form.useWatch("components", {
    form: Vbt01,
    preserve: true,
  });
  const backFunction = () => {
    if (editingVBT) {
      setEditingVBT(null);
      setIsCreate(false);
      // resetForm();
    } else {
      setEditVbtDrawer(null);
    }
    resetForm();
    setRoundOffSign("+");
    setRoundOffValue(0);
  };
  //checkinvoice fn
  const checkInvoice = async (checkInvoiceId, vendorCode) => {
    // console.log("here in checkinvoice");
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
  //edit vbt fn
  const getEditVbtDetails = async (vbtCode) => {
    setLoading(true);
    const response = await imsAxios.get(`/tally/vbt/getData?vbtKey=${vbtCode}`);

    if (response.status == 200) {
      const { data } = response;
      getGl();

      const arr = data.map((row) => ({
        ...row,
        tdsAssValue: row.tdsAssValue,
        venAmmount: row.venAmmount,
        poNumber: row.poNumber,
        projectID: row.projectID,
        partCode: row.part.partCode,
        partName: row.part.partName,
        glName: row.tds?.tdsName,
        tds_gl_code: row?.tds?.tdsGlKey,
        tdsName: {
          label: row.tds?.tdsName,
          value: row?.tds?.tdsKey,
        },
        tds_key: row?.tds?.tdsKey,
        tdsPercent: row?.tds?.tdsPercent,
        tdsAmount: row.tdsAmount,
        gstType: row.gstType === "L" ? "L" : "I",
        insertDate: row.insertDate,
        insertBy: row.insertBy,
        roundOffSigns: row.roundOffSign,
        roundOffValue: row.roundOffValue,
        purchase_gl: row?.purchase_gl,
        billAmm: row?.taxableValue,
        // billAmount: row?.billAmount,
      }));
      console.log("this is the details of vbt", arr);
      // console.log("arrarr", arr[0].billAmount);
      setEditVBTCode(arr);
      setVbtComponent(arr);
      Vbt01.setFieldValue("components", arr);
      getTdsOptions(response.data[0]?.minId);
      setLoading(false);
      // Vbt01.setFieldValue("billAmount", arr[0].billAmount);
    }
  };
  const getVBTDetail = async (minIdArr) => {
    // console.log("min id arrr here", minIdArr);
    // console.log("minIdArr", minIdArr);
    // return;
    setLoading(true);
    // console.log("this iwas the min id", minId);
    // const response = await imsAxios.post(`/tally/${apiUrl}/fetch_minData`, {
    //   min_id: minId,
    // });
    let link;
    if (editVbtDrawer) {
      let apiLink = getApiUrl(editVbtDrawer);
      link = `/tally/${apiLink}/fetch_multi_min_data`;
    } else {
      link = `/tally/${apiUrl}/fetch_multi_min_data`;
    }
    // console.log("apiurl", apiUrl);
    const response = await imsAxios.post(link, {
      mins: minIdArr.map((row) => row),
    });
    const { data } = response;
    if (data.code === 200) {
      setVbtComponent(data);
      const arr = data.data.map((row) => ({
        ...row,
        minId: row.min_id,
        poNumber: row.poNumber,
        projectID: row.projectID,
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
        // gstType: row.in_gst_type,

        // tdsAssValue:row.value,
        // glName: row.tds?.tdsName,
        // glCode: row?.tds?.tdsGlKey,
        tdsName: {
          label: row.ven_tds?.tds_name,
          value: row?.ven_tds?.tds_key,
        },
        unit: row.comp_unit,
        // tdsPercent: row?.tds?.tdsPercent,

        gstType: row.in_gst_type === "L" ? "L" : "I",
        // insertDate: row.insertDate,
        // insertBy: row.insertBy,
        // roundOffSigns: row.roundOffSign,
        // roundOffValue: row.roundOffValue,
        // CGSTGLValue: "TP274965899340",
        // SGSTGLValue: "TP385675494002",
        // IGSTGLValue: "TP486973272469",
        cgst: "TP274965899340",
        sgst: "TP385675494002",
        igst: "TP486973272469",
        // cgst: "CGST Input(400501)",
        // sgst: "SGST Input (400516)",
        // igst: "IGST Input(400511)",
        glCodeValue:
          apiUrl === "vbt01"
            ? "TP821753548513"
            : apiUrl === "vbt06"
            ? "TP672531876660"
            : "",
        glCode: glCodes,
        freight: "(Freight Inward)800105",
        freightAmount: 0,
      }));
      getGl();
      getTdsOptions(minIdArr[0]);
      Vbt01.setFieldValue("components", arr);
      const partCodeArr = arr.map((row) => row.c_part_no);
      // console.log("vbtComponent?.data[0]", vbtComponent?.data[0], partCodeArr);
      if (arr[0]?.ven_code) {
        getLastPrice(arr[0]?.ven_code, partCodeArr);
      }
      if (arr[0].invoice_id && arr[0].ven_code) {
        checkInvoice(arr[0].invoice_id, arr[0].ven_code);
      }
    } else {
      toast.error(data.message.msg);
      setEditingVBT(null);
    }
    setLoading(false);
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
  const getTdsOptions = async (minId) => {
    let link;
    if (editVbtDrawer) {
      let apiLink = getApiUrl(editVbtDrawer);
      link = `/tally/${apiLink}/fetch_minData`;
    } else {
      link = `/tally/${apiUrl}/fetch_minData`;
    }
    const response = await imsAxios.post(link, {
      min_id: minId,
    });
    const { data } = response;
    data.data[0].ven_tds.push({
      ladger_name: "--",
      ledger_key: "--",
      tds_code: "--",
      tds_key: "--",
      tds_name: "--",
      tds_gl_code: "--",
      tds_percent: "0",
    });
    if (data.code === 200) {
      let arr = data.data;
      setAllTdsOptions(arr[0].ven_tds);

      let tdsC = arr[0].ven_tds.map((r) => {
        return {
          text: r.tds_name,
          value: r.tds_key,
        };
      });
      setTdsArray(tdsC);
    } else {
      toast.error(data.message.msg);
    }
  };
  const getFreightGlOptions = async (vbtCode) => {
    // const vbtType = vbtCodes[0].split("/")[0].toLowerCase;
    try {
      // setLoading("fetch");
      const response = await imsAxios.post("/tally/vbt/fetch_freight_group", {
        search: vbtCode,
      });
      const { data } = response;
      let arr = [];
      if (data.length) {
        arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setFreightGlOptions(arr);
      }
      // console.log("arr", arr);
    } catch (error) {
      // toast.error("Some error occured while fetching freight Gls");
      console.log("Some error occured while fetching freight Gls", error);
    } finally {
      // setLoading(false);
    }
  };

  const getGl = async () => {
    let link;
    if (editVbtDrawer) {
      let apiLink = getApiUrl(editVbtDrawer);
      console.log("apilink", apiLink);
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
      console.log("arr=>", arr);
      setGlCodes(arr);
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
  // sumbit for both the edot and create fn
  const submitFunction = async () => {
    const values = await Vbt01.validateFields();
    console.log("values", values);
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
      }
      const modifiedArray =
        roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;
      // return;
      // const tdsCodes = values.components.filter(
      //   (component) =>
      //     !component.tds_key ||
      //     component.tds_key === "" ||
      //     component.tds_key === "--"
      // )[0]
      //   ? undefined
      //   : values.components.map((component) => component.tds_key);
      // const tdsGlCodes = values.components.filter(
      //   (component) =>
      //     !component.tds_gl_code ||
      //     component.tds_gl_code === "" ||
      //     component.tds_gl_code === "--"
      // )[0]
      //   ? undefined
      //   : values.components.map((component) => component.tds_gl_code);
      //Adding the round off to vendor amount
      // let roundarr = values.components.map((component) =>
      //   component.venAmmount && values.components?.venAmmount?.length > 1
      //     ? [
      //         ...component.venAmmount.slice(0, -1),
      //         component.venAmmount[component.venAmmount.length - 1](
      //           roundOffSign
      //         )(roundOffValue),
      //       ]
      //     : component.venAmmount
      // );

      let finalObj = {
        bill_amount: values.billAmmount,
        bill_qty: values.components.map((component) => component.vbtBillQty),
        cgst_gl: values.components.map((component) =>
          component?.gstType === "L"
            ? component.cgst.value
              ? component.cgst.value
              : component.cgst
            : "--"
        ),
        cgsts: values.components.map((component) => component.cgstAmount),
        comment: values.comment,
        component: values.components.map((component) => component.partName),
        eff_date: values.effectiveDate,
        freight: values.components.map((component) => component.freightAmount),
        ///condition added for create
        // apiUrl === "vbt04" ||
        // apiUrl === "vbt05"
        // g_l_codes: values.components.map((component) =>
        //   apiUrl === "vbt01" || apiUrl === "vbt06"
        //     ? component.glCodeValue
        //     : component.glCodeValue
        // ),
        g_l_codes: values.components.map((component) =>
          component?.glCodeValue && component.glCodeValue?.key
            ? component.glCodeValue.value
            : component.glCodeValue
        ),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue
        ),

        hsn_code: values.components.map((component) => component.hsnCode),
        igst_gl: values.components.map((component) =>
          component?.gstType === "I"
            ? component.igst.value
              ? component.igst.value
              : component.igst
            : "--"
        ),
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
        sgst_gl: values.components.map((component) =>
          component?.gstType === "L"
            ? component.sgst.value
              ? component.sgst.value
              : component.sgst
            : "--"
        ),
        sgsts: values.components.map((component) => component.sgstAmount),

        taxable_values: values.components.map(
          (component) => component.taxableValue
        ),
        tds_amounts: values.components.map((component) => component.tdsAmount),
        tds_ass_vals: values.components.map(
          (component) => component.tdsAssValue ?? "--"
        ),
        tds_codes: values.components.map(
          (component) => component.tds_key ?? "--"
        ),
        tds_gl_code: values.components.map(
          (component) => component.tds_gl_code ?? "--"
        ),
        vbp_gst_rate: values.components.map((component) => component.gstRate),
        vbt_gstin: values.gst,
        ven_address: values.venAddress,
        // ven_amounts: values.components.map((component) => component.venAmmount),
        ven_amounts: modifiedArray,

        ven_code: values.components[0]?.ven_code,
        cifValue: values.components.map((component) => component.cifValue),
        cifPrice: values.components.map((component) => component.cifPrice),
        inrPrice: values.components.map((component) => component.inrPrice),
        // vbt_gstin: values.components[0]?.gstin_option[0],
        // poNumber: values.components.map((component) => component.poNumber),
        // projectID: values.components.map((component) => component.projectID),
        // // vbtKey: editVbtDrawer,
        // insertDate: values.components[0]?.insertDate,
      };
      const finalData = {
        ...finalObj,
        round_type: roundOffSign.toString(),
        round_value: roundOffValue.toString(),
        // if(apiUrl) {
        //   vbt_gstin: finalObj?.vbt_gstin.value ?? finalObj?.vbt_gstin;
        // },
      };
      console.log("finalObj", finalObj);
      // return;
      addVbt(finalData);
    } else {
      const values = await Vbt01.validateFields();
      console.log("values", values);

      const roundarr = values.components.map(
        (component) => component.venAmmount
      );
      let a;
      if (roundOffSign.toString() === "+") {
        a = roundarr[roundarr.length - 1] + +Number(roundOffValue.toString());
        // console.log("a", a);
      } else if (roundOffSign.toString() === "-") {
        a = roundarr[roundarr.length - 1] -= +Number(roundOffValue.toString());
      } else {
        a = roundarr[roundarr.length - 1];
        // console.log("a- with out any roundoff", a);
      }
      const editmodifiedArray =
        roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;
      // console.log("modifiedArray", editmodifiedArray);
      // console.log("roundarr", roundarr);
      // console.log("a", a);
      // return;
      const tdsCodes = values.components.filter(
        (component) =>
          !component.tds_key ||
          component.tds_key === "" ||
          component.tds_key === "--"
      )[0]
        ? undefined
        : values.components.map((component) => component.tds_key);
      const tdsGlCodes = values.components.filter(
        (component) =>
          !component.glCode ||
          component.glCode === "" ||
          component.glCode === "--"
      )[0]
        ? undefined
        : values.components.map((component) => component.glCode);

      let finalObj = {
        bill_amount: values.billAmmount,
        bill_qty: values.components.map((component) => component.vbtBillQty),
        cgst_gl: values.components.map((component) =>
          component?.gstType === "L" ? component.cgst?.value ?? "--" : "--"
        ),
        cgsts: values.components.map((component) => component.cgstAmount),
        comment: values.comment,
        component: values.components.map((component) => component.partName),
        eff_date: values.effectiveDate,
        freight: values.components.map((component) => component.freightAmount),
        g_l_codes: values.components.map(
          (component) => component.purchase_gl.value
        ),
        // g_l_codes: values.components.map((component) =>
        //   apiUrl === "vbt01" || apiUrl === "vbt06"
        //     ? component.purchase_gl
        //     : editApiUrl === "vbt02"
        //     ? component.purchase_gl.value
        //     : component.purchase_gl.value
        // ),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue
        ),
        hsn_code: values.components.map((component) => component.hsnCode),
        igst_gl: values.components.map((component) =>
          component?.gstType === "I" ? component.igst?.value ?? "--" : "--"
        ),
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
        sgst_gl: values.components.map((component) =>
          component?.gstType === "L" ? component.sgst?.value ?? "--" : "--"
        ),
        sgsts: values.components.map((component) => component.sgstAmount),
        taxable_values: values.components.map(
          (component) => component.taxableValue
        ),
        tds_amounts: values.components.map((component) => component.tdsAmount),
        tds_ass_vals: values.components.map(
          (component) => component.tdsAssValue
        ),
        tds_codes: values.components.map(
          (component) => component.tdsName?.value ?? "--"
        ),

        tds_gl_code: values.components.map(
          (component) => component.tds_gl_code ?? "--"
        ),
        vbp_gst_rate: values.components.map((component) => component.gstRate),
        vbt_gstin: values.gst,
        ven_address: values.venAddress,
        ven_amounts: editmodifiedArray,
        // ven_amounts: values.components.map((component) => component.venAmmount),
        ven_code: values.components[0]?.venCode,
        poNumber: values.components.map((component) => component.poNumber),
        projectID: values.components.map((component) => component.projectID),
        vbtKey: editVbtDrawer,
        insertDate: values.components[0]?.insertDate,
        insertBy: values.components[0]?.insertBy,

        roundOffSign: roundOffSign.toString(),
        roundOffValue: roundOffValue.toString(),
        cifValue: values.components.map((component) => component.cifValue),
        cifPrice: values.components.map((component) => component.cifPrice),
        inrPrice: values.components.map((component) => component.inrPrice),
      };

      console.log("this is the finalData", finalObj);
      updateVbt(finalObj);
    }
  };

  const updateVbt = async (finalData) => {
    setLoading(true);
    let vbtCodeForEdit = getApiUrl(editVbtDrawer);
    // console.log("vbtCodeForEdit", vbtCodeForEdit);
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
  const addVbt = async (finalData) => {
    setLoading(true);
    const response = await imsAxios.post(
      `/tally/${apiUrl}/add_${apiUrl}`,
      finalData
    );
    const { data } = response;
    if (data.code == 200) {
      toast.success(data.message);
      // setTimeout(() => {

      setEditingVBT(null);
      // }, 2000);

      // setVBTData([]);
      backFunction();
    } else {
      setLoading(false);
      validateResponse(data);
    }
    // setEditingVBT(null);
    // }, 2000);
    // setVBTData([]);
  };
  const resetForm = () => {
    Vbt01.resetFields();
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

  //   if (editVbtDrawer) {
  //     getEditVbtDetails(editVbtDrawer);
  //   }
  // }, [editVbtDrawer]);
  useEffect(() => {
    if (editingVBT?.length > 0) {
      getVBTDetail(editingVBT);
      setIsCreate(true);
      let editUrl = editingVBT[0].split("/");
      editUrl = editUrl[0];
      getFreightGlOptions(editUrl.toLowerCase());
      getGstGlOptions();
    }
  }, [editingVBT]);

  useEffect(() => {
    if (editVbtDrawer) {
      getEditVbtDetails(editVbtDrawer);
      let editUrl = editVbtDrawer.split("/");
      editUrl = editUrl[0];
      getFreightGlOptions(editUrl.toLowerCase());
      getGstGlOptions();
      Vbt01.setFields([
        {
          name: "components",
          touched: false,
        },
      ]);
      // setApiUrl(editUrl);
    }
  }, [editVbtDrawer]);
  useEffect(() => {
    //total
    var billvalues = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.totalBilAmm).toFixed(2),
      0
    );
    // console.log("billvalues ->", billvalues);
    setBillam(billvalues);
    const values = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.taxableValue).toFixed(2),
      0
    );

    const value = +Number(values).toFixed(2);
    // console.log("v", value);
    const freight = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.freightAmount).toFixed(2),
      0
    );
    const cgsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.cgstAmount).toFixed(2),
      0
    );
    const cgst = +Number(cgsts).toFixed(2);
    // console.log("cgst", cgst);
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

    let vendorAmounts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(2),
      0
    );
    var vendorAmount = +Number(vendorAmounts).toFixed(2);
    // console.log("vendorAmount-------------------", vendorAmount);
    const tds = components?.reduce(
      (a, b) => a + +Number(b.tdsAmount ?? 0).toFixed(0),
      0
    );

    if (isCreate) {
      // console.log("isCreate", roundOffValue);
      if (roundOffSign === "+") {
        let newven =
          // vendorAmount =
          vendorAmount + +Number(roundOffValue.toString()).toFixed(2);
        vendorAmount = newven.toFixed(2);
        // console.log("vendorAmount-------------------", vendorAmount);
      }
      if (roundOffSign.toString() === "-") {
        let newven = (vendorAmount -= +Number(roundOffValue.toString()).toFixed(
          2
        ));
        vendorAmount = newven.toFixed(2);
        // console.log("vendorAmount-------------------", vendorAmount);
      }
    } else {
      // console.log("isCreate", isCreate);
      // console.log("roundOffValue in VBT report", roundOffValue);
      // console.log("roundOffSign in VBT report", roundOffSign);
      if (roundOffSign.toString() === "+") {
        let newven =
          vendorAmount + +Number(roundOffValue.toString()).toFixed(2);
        vendorAmount = newven.toFixed(2);
        // console.log("vendorAmount-------------------", vendorAmount);
        // console.log(
        //   "vendorAmount + +Number(roundOffValue.toString()",
        //   vendorAmount
        // );
      }
      if (roundOffSign.toString() === "-") {
        let newven = (vendorAmount -= +Number(roundOffValue.toString()).toFixed(
          2
        ));
        vendorAmount = newven.toFixed(2);
        // console.log("vendorAmount-------------------", vendorAmount);
        // console.log(
        //   "vendorAmount roundOffSign.toString() === " + "",
        //   vendorAmount
        // );
      }
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
  return (
    <Drawer
      bodyStyle={{ padding: 5 }}
      loading={loading}
      width="100vw"
      onClose={backFunction}
      open={editingVBT || editVbtDrawer}
      title={
        isCreate
          ? vbtComponent?.data &&
            `${vbtComponent?.data[0]?.ven_name} | ${vbtComponent?.data[0]?.ven_code}`
          : `${editVbtDrawer}`
      }
    >
      {loading && <Loading />}
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
              editVBTCode={editVBTCode}
              setEditVBTCode={setEditVBTCode}
              roundOffSign={roundOffSign}
              roundOffValue={roundOffValue}
              setRoundOffSign={setRoundOffSign}
              setRoundOffValue={setRoundOffValue}
              apiUrl={apiUrl}
              components={components}
              // billvalues={billvalues}
              billam={billam}
              // fields={fields}
              // field={field}
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
                          getGl={getGl}
                          glCodes={glCodes}
                          setGlCodes={setGlCodes}
                          apiUrl={apiUrl}
                          isCreate={isCreate}
                          setIsCreate={setIsCreate}
                          loading={loading}
                          setEditApiUrl={setEditApiUrl}
                          editApiUrl={editApiUrl}
                          freightGlOptions={freightGlOptions}
                          setFreightGlOptions={freightGlOptions}
                          setglState={setglState}
                          glstate={glstate}
                          getGstGlOptions={getGstGlOptions}
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

export default VBT01Report;
const initialValues = {
  minId: "",
};

// get the lowercase value of vbt
const getApiUrl = (vbtCode) => {
  return vbtCode.split("/")[0].toLowerCase();
};
