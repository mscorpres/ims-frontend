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
    const data = await imsAxios.get(
      `/tally/vbt/checkInvoice?vbtInvoiceNo=${checkInvoiceId}&vendor=${vendorCode}`,
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
      setEditVBTCode(arr);
      setVbtComponent(arr);
      Vbt01.setFieldValue("components", arr);
      setLoading(false);
    }
  };
  const getVBTDetail = async (minIdArr) => {
    setLoading(true);

    let link;
    const type = minIdArr?.[0]?.type;
    const typeQuery =
      type != null && String(type).trim() !== ""
        ? `?type=${encodeURIComponent(type)}`
        : "";
    if (editVbtDrawer) {
      let apiLink = getApiUrl(editVbtDrawer);

      link = `/tally/${apiLink}/fetch_multi_min_data${typeQuery}`;
    } else {
      link = `/tally/${apiUrl}/fetch_multi_min_data${typeQuery}`;
    }
    const response = await imsAxios.post(link, {
      mins: minIdArr.map((row) => row?.transaction ?? row.min_transaction),
    });

    const { data } = response;
    if (data.code === 200) {
      setVbtComponent(data?.data);
      const arr = data.data.map((row) => ({
        ...row,
        minId: row.transaction ?? row.min_transaction,
        poNumber: row.poNumber,
        projectID: row.projectID,
        partCode: row.itemCode,
        partName: row.itemName,
        vbtBillQty: row.qty,
        vbtInQty: row.qty,
        taxableValue: row.value,
        vbtInRate: row.rate,
        hsnCode: row.hsnCode,
        gstRate: row.gstRate,
        cgstAmount: row.cgst,
        sgstAmount: row.sgst,
        igstAmount: row.igst,
        venAddress: row.venAddress,
        igstAmount: row.igst,
        ven_name: row.venName,

        tdsName: {
          label: row.ven_tds?.tds_name,
          value: row?.ven_tds?.tds_key,
        },
        unit: row.uom,

        gstType: row.gstType === "L" ? "L" : "I",

        cgst: "TP274965899340",
        sgst: "TP385675494002",
        igst: "TP486973272469",

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
      const venTds = data.data[0]?.tds ? [...data.data[0].tds] : [];
      venTds.push({
        ladger_name: "--",
        ledger_key: "--",
        tds_code: "--",
        tds_key: "--",
        tds_name: "--",
        tds_gl_code: "--",
        tds_percent: "0",
      });
      setAllTdsOptions(venTds);
      setTdsArray(
        venTds.map((r) => ({
          text: r.tds_name,
          value: r.tds_key,
        })),
      );
      Vbt01.setFieldValue("components", arr);
      const partCodeArr = arr.map((row) => row.itemCode);
      if (arr[0]?.venCode) {
        getLastPrice(arr[0]?.venCode, partCodeArr);
      }
      if (arr[0].invoiceId && arr[0].venCode) {
        checkInvoice(arr[0].invoiceId, arr[0].venCode);
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

  const getFreightGlOptions = async (vbtCode) => {
    try {
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
    } catch (error) {
      console.log("Some error occured while fetching freight Gls", error);
    } finally {
      // setLoading(false);
    }
  };

  const getGl = async () => {
    let link;
    if (editVbtDrawer) {
      let apiLink = getApiUrl(editVbtDrawer);
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
    if (isCreate) {
      const roundarr = values.components.map(
        (component) => component.venAmmount,
      );

      let a;
      let val = roundarr[roundarr.length - 1];
      val = +Number(val);
      if (roundOffSign.toString() === "+") {
        a = val + +Number(roundOffValue.toString());
      } else if (roundOffSign.toString() === "-") {
        a = val -= +Number(roundOffValue.toString());
      } else {
        a = val;
      }
      const modifiedArray =
        roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;

      let finalObj = {
        bill_amount: values.billAmmount,
        bill_qty: values.components.map((component) => component.vbtBillQty),
        cgst_gl: values.components.map((component) =>
          component?.gstType === "L"
            ? component.cgst.value
              ? component.cgst.value
              : component.cgst
            : "--",
        ),
        cgsts: values.components.map((component) => component.cgstAmount),
        comment: values.comment,
        component: values.components.map((component) => component.partName),
        eff_date: values.effectiveDate,
        freight: values.components.map((component) => component.freightAmount),
        g_l_codes: values.components.map((component) =>
          component?.glCodeValue && component.glCodeValue?.key
            ? component.glCodeValue.value
            : component.glCodeValue,
        ),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue,
        ),

        hsn_code: values.components.map((component) => component.hsnCode),
        igst_gl: values.components.map((component) =>
          component?.gstType === "I"
            ? component.igst.value
              ? component.igst.value
              : component.igst
            : "--",
        ),
        igsts: values.components.map((component) => component.igstAmount),
        in_gst_types: values.components.map((component) => component.gstType),
        in_qtys: values.components.map((component) => component.vbtInQty),
        in_rates: values.components.map((component) => component.vbtInRate),
        invoice_date: values.invoiceDate,
        invoice_no: values.invoiceNo,
        // invoice_no: values.components.map((component) => component.invoiceNo),
        item_description: values.components.map(
          (component) => component.itemDescription,
        ),
        min_key: values.components.map((component) => component.minId),
        part_code: values.components.map((component) => component.partCode),
        sgst_gl: values.components.map((component) =>
          component?.gstType === "L"
            ? component.sgst.value
              ? component.sgst.value
              : component.sgst
            : "--",
        ),
        sgsts: values.components.map((component) => component.sgstAmount),

        taxable_values: values.components.map(
          (component) => component.taxableValue,
        ),
        tds_amounts: values.components.map((component) => component.tdsAmount),
        tds_ass_vals: values.components.map(
          (component) => component.tdsAssValue ?? "--",
        ),
        tds_codes: values.components.map(
          (component) => component.tds_key ?? "--",
        ),
        tds_gl_code: values.components.map(
          (component) => component.tds_gl_code ?? "--",
        ),
        vbp_gst_rate: values.components.map((component) => component.gstRate),
        vbt_gstin: values.gst,
        acknowledgeIRN: values.ackNum,
        ven_address: values.venAddress,
        ven_amounts: modifiedArray,

        ven_code: values.components[0]?.venCode,
        cifValue: values.components.map((component) => component.cifValue),
        cifPrice: values.components.map((component) => component.cifPrice),
        inrPrice: values.components.map((component) => component.inrPrice),
      };
      const finalData = {
        ...finalObj,
        round_type: roundOffSign.toString(),
        round_value: roundOffValue.toString(),
      };
      const typeFromEditing =
        Array.isArray(editingVBT) && editingVBT.length > 0
          ? editingVBT[0]?.type
          : undefined;
      const typeFromComponent = values.components?.[0]?.type;
      const typeParam = typeFromEditing || typeFromComponent || "";

      addVbt(finalData, typeParam);
    } else {
      const values = await Vbt01.validateFields();

      const roundarr = values.components.map(
        (component) => component.venAmmount,
      );
      let a;
      if (roundOffSign.toString() === "+") {
        a = roundarr[roundarr.length - 1] + +Number(roundOffValue.toString());
      } else if (roundOffSign.toString() === "-") {
        a = roundarr[roundarr.length - 1] -= +Number(roundOffValue.toString());
      } else {
        a = roundarr[roundarr.length - 1];
      }
      const editmodifiedArray =
        roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;

      const tdsCodes = values.components.filter(
        (component) =>
          !component.tds_key ||
          component.tds_key === "" ||
          component.tds_key === "--",
      )[0]
        ? undefined
        : values.components.map((component) => component.tds_key);
      const tdsGlCodes = values.components.filter(
        (component) =>
          !component.glCode ||
          component.glCode === "" ||
          component.glCode === "--",
      )[0]
        ? undefined
        : values.components.map((component) => component.glCode);

      let finalObj = {
        bill_amount: values.billAmmount,
        bill_qty: values.components.map((component) => component.vbtBillQty),
        cgst_gl: values.components.map((component) =>
          component?.gstType === "L" ? (component.cgst?.value ?? "--") : "--",
        ),
        cgsts: values.components.map((component) => component.cgstAmount),
        comment: values.comment,
        component: values.components.map((component) => component.partName),
        eff_date: values.effectiveDate,
        freight: values.components.map((component) => component.freightAmount),
        g_l_codes: values.components.map(
          (component) => component.purchase_gl.value,
        ),
        // g_l_codes: values.components.map((component) =>
        //   apiUrl === "vbt01" || apiUrl === "vbt06"
        //     ? component.purchase_gl
        //     : editApiUrl === "vbt02"
        //     ? component.purchase_gl.value
        //     : component.purchase_gl.value
        // ),
        gst_ass_vals: values.components.map(
          (component) => component.gstAssValue,
        ),
        hsn_code: values.components.map((component) => component.hsnCode),
        igst_gl: values.components.map((component) =>
          component?.gstType === "I" ? (component.igst?.value ?? "--") : "--",
        ),
        igsts: values.components.map((component) => component.igstAmount),
        in_gst_types: values.components.map((component) => component.gstType),
        in_qtys: values.components.map((component) => component.vbtInQty),
        in_rates: values.components.map((component) => component.vbtInRate),
        invoice_date: values.invoiceDate,
        invoice_no: values.invoiceNo,
        // invoice_no: values.components.map((component) => component.invoiceNo),
        item_description: values.components.map(
          (component) => component.itemDescription,
        ),
        min_key: values.components.map((component) => component.minId),
        part_code: values.components.map((component) => component.partCode),
        sgst_gl: values.components.map((component) =>
          component?.gstType === "L" ? (component.sgst?.value ?? "--") : "--",
        ),
        sgsts: values.components.map((component) => component.sgstAmount),
        taxable_values: values.components.map(
          (component) => component.taxableValue,
        ),
        tds_amounts: values.components.map((component) => component.tdsAmount),
        tds_ass_vals: values.components.map(
          (component) => component.tdsAssValue,
        ),
        tds_codes: values.components.map(
          (component) => component.tdsName?.value ?? "--",
        ),

        tds_gl_code: values.components.map(
          (component) => component.tds_gl_code ?? "--",
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
        acknowledgeIRN: values.ackNum,
      };
      updateVbt(finalObj);
    }
  };

  const updateVbt = async (finalData) => {
    setLoading(true);
    let vbtCodeForEdit = getApiUrl(editVbtDrawer);
    let link = `/tally/${vbtCodeForEdit}/update`;
    const response = await imsAxios.put(link, finalData);
    if (response.status === 200) {
      toast.success(response.data);
      setEditVbtDrawer(null);
      setLoading(false);
    } else {
      toast.error(response.data);
      setLoading(false);
    }
  };
  const addVbt = async (finalData, type) => {
    setLoading(true);
    const response = await imsAxios.post(
      `/tally/${apiUrl}/add_${apiUrl}?type=${type}`,
      finalData,
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
      },
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
      const txn = editingVBT[0]?.transaction ?? editingVBT[0]?.min_transaction;
      let editUrl = txn?.split("/");
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
      0,
    );
    setBillam(billvalues);
    const values = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.taxableValue).toFixed(2),
      0,
    );

    const value = +Number(values).toFixed(2);
    const freight = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.freightAmount).toFixed(2),
      0,
    );
    const cgsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.cgstAmount).toFixed(2),
      0,
    );
    const cgst = +Number(cgsts).toFixed(2);
    const sgsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.sgstAmount).toFixed(2),
      0,
    );
    const sgst = +Number(sgsts).toFixed(2);
    const igsts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.igstAmount).toFixed(2),
      0,
    );
    const igst = +Number(igsts).toFixed(2);

    let vendorAmounts = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(2),
      0,
    );
    var vendorAmount = +Number(vendorAmounts).toFixed(2);
    const tds = components?.reduce(
      (a, b) => a + +Number(b.tdsAmount ?? 0).toFixed(0),
      0,
    );

    if (isCreate) {
      if (roundOffSign === "+") {
        let newven =
          vendorAmount + +Number(roundOffValue.toString()).toFixed(2);
        vendorAmount = newven.toFixed(2);
      }
      if (roundOffSign.toString() === "-") {
        let newven = (vendorAmount -= +Number(roundOffValue.toString()).toFixed(
          2,
        ));
        vendorAmount = newven.toFixed(2);
      }
    } else {
      if (roundOffSign.toString() === "+") {
        let newven =
          vendorAmount + +Number(roundOffValue.toString()).toFixed(2);
        vendorAmount = newven.toFixed(2);
      }
      if (roundOffSign.toString() === "-") {
        let newven = (vendorAmount -= +Number(roundOffValue.toString()).toFixed(
          2,
        ));
        vendorAmount = newven.toFixed(2);
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
          ? vbtComponent?.length > 0 &&
            `${vbtComponent?.[0]?.venName} | ${vbtComponent?.[0]?.venCode}`
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
