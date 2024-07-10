import { useEffect, useState } from "react";
import { Form, Row, Col, Modal, Drawer } from "antd";
import HeaderDetails from "../HeaderDetails";
import Components from "../Components";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";

const CreateDebitNote = ({ setDebitNoteDrawer, debitNoteDrawer }) => {
  const [vendorDetails, setVendorDetails] = useState({});
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [freightGlOptions, setFreightGlOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [debitNoteForm] = Form.useForm();
  const components = Form.useWatch("components", debitNoteForm);

  const getTDSData = async () => {
    const response = await imsAxios.get("/tally/tds/nature_of_tds");
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data;

        return arr;
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const getDetails = async (vbtCodes) => {
    const vbtType = vbtCodes[0].split("/")[0].toLowerCase();
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/tally/vbt01/vbt_edit", {
        vbt_code: vbtCodes,
      });

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const tdsOptions = await getTDSData();
          let tdsPerc = tdsOptions.filter(
            (tds) => tds.tds_key === data.data[0].tds_code
          )[0];
          let tdsPercentage;
          if (tdsPerc) {
            tdsPercentage = +Number(tdsPerc.percentage)?.toFixed(2) ?? 0;
            tdsPercentage = tdsPercentage + "%";
          }

          let arr = data.data.map((row) => {
            const value = +Number(
              +Number(row.inrate).toFixed(3) * +Number(row.vbt_qty).toFixed(3)
            ).toFixed(3);
            return {
              minId: row.min_id,
              invoiceDate: row.invoice_date,
              invoiceNo: row.invoice_no,
              partCode: row.item_code,
              componentId: row.item,
              hsnCode: row.hsn_code,
              component: row.item_name,
              billingQty: row.vbt_qty,
              qty: "",
              rate: row.inrate,
              value,
              freight: 0,
              freightGl: "",
              editable_qty: row.pending_qty ?? 0,
              freight_gl: "",
              gstAssValue: row.gst_ass_value,
              glName: row.gl_name,
              glCode: row.gl_code,
              gstRate: row.gst_rate,
              gstType: row.gst_type === "L" ? "Local" : "Interstate",
              cgst: row.cgst,
              sgst: row.sgst,
              igst: row.igst,
              // tdsCode: row.tds_code,
              // tdsGL: row.tds_gl,
              // tdsName: row.tds_gl_name,
              // tdsPercentage: tdsPercentage,
              tdsAssValue: row.tds_ass_val,
              vendorAmount: row.ven_ammount,
              vbtKey: row.vbt_key,
            };
          });
          debitNoteForm.setFieldValue("components", arr);
          const vendorObj = {
            name: data.data[0].ven_name,
            gstin: data.data[0].gstin,
            address: data.data[0].ven_address,
            vendorCode: data.data[0].ven_code,
          };

          setVendorDetails(vendorObj);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
      toast.error("Some error occured while fetching the data");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getFreightGlOptions = async (vbtCodes) => {
    const vbtType = vbtCodes[0].split("/")[0].toLowerCase();
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/tally/vbt/fetch_freight_group", {
        vbt_key: vbtType,
      });

      const { data } = response;
      if (data) {
        const arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));

        setFreightGlOptions(arr);
      }
    } catch (error) {
      toast.error("Some error occured while fetching freight Gls");
      console.log("Some error occured while fetching freight Gls", error);
    } finally {
      setLoading(false);
    }
  };

  const validatehandler = async () => {
    const values = await debitNoteForm.validateFields();
    const tdsCodes = values.components.filter(
      (component) =>
        !component.tdsCode ||
        component.tdsCode === "" ||
        component.tdsCode === "--"
    )[0]
      ? [0]
      : values.components.map((component) => component.tdsCode);
    const tdsGlCodes = values.components.filter(
      (component) =>
        !component.tdsglCode ||
        component.tdsglCode === "" ||
        component.tdsglCode === "--"
    )[0]
      ? [0]
      : values.components.map((component) => component.tdsglCode);
    const finalObj = {
      bill_qty: getArrayValues("qty", values.components),
      cgsts: getArrayValues("cgst", values.components),
      comment: values.comment,
      component: getArrayValues("componentId", values.components),
      eff_date: values.effectiveDate?.replaceAll("-", "/"),
      freight: getArrayValues("freight", values.components),
      freight_gl: getArrayValues("freightGl", values.components),
      g_l_codes: getArrayValues("glCode", values.components),
      gst_ass_vals: getArrayValues("gstAssValue", values.components),
      hsn_code: getArrayValues("hsnCode", values.components),
      igsts: getArrayValues("igst", values.components),
      in_gst_types: getArrayValues("gstType", values.components),
      in_qtys: getArrayValues("billingQty", values.components),
      in_rates: getArrayValues("rate", values.components),
      invoice_date: getArrayValues("invoiceDate", values.components),
      invoice_no: getArrayValues("invoiceNo", values.components),
      min_key: getArrayValues("minId", values.components),
      sgsts: getArrayValues("sgst", values.components),
      taxable_values: getArrayValues("value", values.components),
      tds_amounts: getArrayValues("tdsAmount", values.components),
      tds_ass_vals: getArrayValues("tdsAssValue", values.components),
      totalRateDifference: getArrayValues("rateDifference", values.components),
      tds_codes: tdsCodes,
      tds_gl_code: tdsGlCodes,
      vbp_gst_rate: values.components.map((row) =>
        row["gstRate"].toString().replaceAll("%", "")
      ),
      vbt_code: getArrayValues("vbtKey", values.components),
      vbt_gstin: vendorDetails.gstin,
      ven_address: vendorDetails.address,
      ven_amounts: getArrayValues("vendorAmount", values.components),
      ven_code: vendorDetails.vendorCode,
      round_type: roundOffSign,
      round_value: roundOffValue,
    };
    // showing a submit confirm
    Modal.confirm({
      title: "Are you sure you want to submit this debit Note?",
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitHandler(finalObj);
      },
      onCancel() {},
    });
  };

  const submitHandler = async (values) => {
    try {
      setLoading("submit");
      const respose = await imsAxios.post(`/tally/vbt01/debit/create`, values);
      const { data } = respose;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setDebitNoteDrawer(null);
        } else {
          setLoading(false);
          toast.error(data.message.msg ?? data);
        }
      }
    } catch (error) {
      toast.error("Some error occured while creating this debit note");
      console.log("Some error occured while creating this debit note", error);
    }
    // finally {
    //   setLoading(false);
    //   navigate("/tally/vendorbillposting/report");
    // }
  };

  useEffect(() => {
    if (debitNoteDrawer) {
      if (debitNoteDrawer?.length >= 1) {
        getDetails([debitNoteDrawer[0]]);
        getFreightGlOptions([debitNoteDrawer[0]]);
      } else {
        getDetails([debitNoteDrawer.vbt_code]);
        getFreightGlOptions(
          debitNoteDrawer.vbt_code.split("/")[0].toLowerCase()
        );
      }
    }
  }, [debitNoteDrawer]);
  return (
    <Drawer
      onClose={() => setDebitNoteDrawer(null)}
      open={debitNoteDrawer}
      width="100vw"
      title={
        debitNoteDrawer?.length >= 1
          ? `VBT Number: ${debitNoteDrawer}`
          : `VBT Number: ${debitNoteDrawer?.vbt_code}`
      }
      destroyOnClose={true}
    >
      {/* <div style={{ height: "100%", paddingRight: 5, paddingLeft: 5 }}> */}
      <Form
        initialValues={defaultValues}
        form={debitNoteForm}
        layout="vertical"
        style={{ height: "100%" }}
      >
        {loading === "fetch" && <Loading />}
        <Row gutter={6} style={{ height: "100%", overlfowY: "hidden" }}>
          <Col span={4} style={{ height: "95%", overflowY: "auto" }}>
            <HeaderDetails
              vendorDetails={vendorDetails}
              components={components}
              roundOffSign={roundOffSign}
              setRoundOffSign={setRoundOffSign}
              roundOffValue={roundOffValue}
              setRoundOffValue={setRoundOffValue}
              form={debitNoteForm}
              // addRateDiff={addRateDiff}
              // setAddRateDiff={setAddRateDiff}
            />
          </Col>
          <Col span={20} style={{ height: "92%", overflowY: "auto" }}>
            <Components
              form={debitNoteForm}
              freightGlOptions={freightGlOptions}
              setFreightGlOptions={setFreightGlOptions}
              // addRateDiff={addRateDiff}
              vbtType={
                debitNoteDrawer?.length
                  ? debitNoteDrawer[0].split("/")[0]?.toLowerCase()
                  : debitNoteDrawer?.type?.toLowerCase()
              }
            />
          </Col>
        </Row>
      </Form>

      <NavFooter
        submitFunction={validatehandler}
        nextLabel="Submit"
        backFunction={() => setDebitNoteDrawer(null)}
        backLabel="Back"
        loading={loading === "submit"}
      />
      {/* </div> */}
    </Drawer>
  );
};
const getArrayValues = (name, arr) => {
  return arr.map((row) => row[name]);
};
const defaultValues = {
  date: "",
  comment: "",
  components: [
    {
      minId: "",
      invoiceDate: "",
      invoiceNo: "",
      partCode: "",
      component: "",
      billingQty: "",
      qty: "",
      rate: "",
      value: "",
      freight: "",
      freightGl: "",
      gstAssValue: "",
      glName: "",
      gstRate: "",
      gstType: "",
      cgst: "",
      sgst: "",
      igst: "",
      tdsCode: "",
      tdsPercentage: "",
      tdsAssValue: "",
      vendorAmount: "",
    },
  ],
};

export default CreateDebitNote;
