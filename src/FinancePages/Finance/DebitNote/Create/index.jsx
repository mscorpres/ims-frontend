import { useEffect, useState } from "react";
import { Form, Row, Col, Modal, Drawer, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import HeaderDetails from "../HeaderDetails";
import Components from "../Components";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";
import MyButton from "../../../../Components/MyButton";
import { downloadExcel } from "../../../../Components/printFunction";

const CreateDebitNote = ({ setDebitNoteDrawer, debitNoteDrawer }) => {
  const [vendorDetails, setVendorDetails] = useState({});
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [freightGlOptions, setFreightGlOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excelUploadOpen, setExcelUploadOpen] = useState(false);

  const [debitNoteForm] = Form.useForm();
  const [excelUploadForm] = Form.useForm();
  const components = Form.useWatch("components", debitNoteForm);

  const resetFormValues = () => {
    debitNoteForm.resetFields();
    excelUploadForm.resetFields();
    setVendorDetails({});
    setRoundOffSign("+");
    setRoundOffValue(0);
    setFreightGlOptions([]);
    setExcelUploadOpen(false);
    setLoading(false);
  };

  // const getTDSData = async () => {
  //   const response = await imsAxios.get("/tally/tds/nature_of_tds");
  //   const { data } = response;
  //   if (data) {
  //     if (data.code === 200) {
  //       let arr = data.data;

  //       return arr;
  //     } else {
  //       toast.error(data.message.msg);
  //     }
  //   }
  // };

  const getDetails = async (vbtCodes) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/tally/vbt01/vbt_edit", {
        vbt_code: vbtCodes,
      });

      const { data } = response;
      if (data) {
        if (data.code === 200) {
        
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

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const excelUploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    beforeUpload: () => false,
  };

  const downloadSampleFile = async () => {
    const vbtNo =
      debitNoteDrawer?.length >= 1
        ? debitNoteDrawer[0]
        : debitNoteDrawer?.vbt_code;
    try {
      setLoading("sample");
      const response = await imsAxios.get(
        "/tally/debitNote/downloadSample",
        { params: { type: "vbt", vbt_code: vbtNo } }
      );
      const { data } = response;
      if (data && data.code === 200) {
        downloadExcel(data.data.buffer.data, "Debit Note Sample");
      } else {
        toast.error(data?.message?.msg ?? "Unable to download sample file");
      }
    } catch (error) {
      toast.error("Some error occured while downloading the sample file");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    const values = excelUploadForm.getFieldsValue();
    const file = values.files?.[0]?.originFileObj;
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading("mapping");
      const response = await imsAxios.post("/tally/dv/upload/item", formData);
      const { data } = response;
      if (data && data.code === 200) {
        const rows = data.data?.rows ?? [];
        const currentComponents =
          debitNoteForm.getFieldValue("components") ?? [];
        let matchedCount = 0;
        const updatedComponents = currentComponents.map((component) => {
          const matchedRow = rows.find(
            (row) => row.partCode === component.partCode
          );
          if (!matchedRow) return component;
          matchedCount += 1;
          return {
            ...component,
            qty: matchedRow.billingQty,
            rate: matchedRow.inRate,
            freight: matchedRow.freight,
            freightGl: matchedRow.freightGl?.key ?? component.freightGl,
            gstRate: matchedRow.gstRate,
            tdsName: matchedRow.tdsCode
              ? { value: matchedRow.tdsCode.key, label: matchedRow.tdsCode.name }
              : component.tdsName,
            tdsCode: matchedRow.tdsCode?.key ?? component.tdsCode,
            tdsglName: matchedRow.tdsCode?.gl_code ?? component.tdsglName,
            tdsglCode: matchedRow.tdsCode?.gl_key ?? component.tdsglCode,
          };
        });
        debitNoteForm.setFieldValue("components", updatedComponents);
        if (matchedCount === 0) {
          toast.error("No matching part codes found for this VBT");
        } else {
          toast.success(
            `Mapped ${matchedCount} of ${rows.length} row(s) from the excel`
          );
        }
        setExcelUploadOpen(false);
        excelUploadForm.resetFields();
      } else {
        toast.error(data?.message?.msg ?? data?.message ?? "Excel validation failed");
      }
    } catch (error) {
      toast.error("Some error occured while uploading the excel");
      console.log("Some error occured while uploading the excel", error);
    } finally {
      setLoading(false);
    }
  };

  const validatehandler = async () => {
    const values = await debitNoteForm.validateFields();

    const roundarr = getArrayValues("vendorAmount", values.components);
    // console.log("roundarr ->", roundarr);

    let a;
    let val = roundarr[roundarr.length - 1];
    // val = +Number(val).toFixed(3);
    // console.log("val", val);
    if (roundOffSign.toString() === "+") {
      a = val + +Number(roundOffValue.toString());

      // console.log("roundoff", a);
    } else if (roundOffSign.toString() === "-") {
      a = val -= +Number(roundOffValue.toString());

      // console.log("roundoff", a);
    } else {
      a = val;
      // console.log("roundoff", a);
    }
    // console.log("a", a);
    // console.log("val.toFixed(2)", a.toFixed(3));
    a = +Number(a).toFixed(3);
    const modifiedArray =
      roundarr.length > 0 ? [...roundarr.slice(0, -1), a] : roundarr;
    // console.log("modifiedArray", modifiedArray);

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
      ven_amounts: modifiedArray,
      ven_code: vendorDetails.vendorCode,
      round_type: roundOffSign,
      round_value: roundOffValue,
    };
    // console.log("finalObj", finalObj);
    // showing a submit confirm
    // return;
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
          resetFormValues();
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
      onClose={() => {
        setDebitNoteDrawer(null);
        resetFormValues();
      }}
      open={debitNoteDrawer}
      width="100vw"
      title={
        debitNoteDrawer?.length >= 1
          ? `VBT Number: ${debitNoteDrawer}`
          : `VBT Number: ${debitNoteDrawer?.vbt_code}`
      }
      destroyOnClose={true}
      extra={
        <MyButton
          variant="upload"
          text="Upload Excel"
          onClick={() => setExcelUploadOpen(true)}
        />
      }
    >
      {/* <div style={{ height: "100%", paddingRight: 5, paddingLeft: 5 }}> */}
      <Form
        initialValues={defaultValues}
        form={debitNoteForm}
        layout="vertical"
        style={{ height: "100%" }}
      >
        {(loading === "fetch" || loading === "mapping") && <Loading />}
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
        backFunction={() => {
          setDebitNoteDrawer(null);
          resetFormValues();
        }}
        backLabel="Back"
        loading={loading === "submit"}
      />

      <Modal
        title="Upload Excel"
        open={excelUploadOpen}
        onCancel={() => {
          setExcelUploadOpen(false);
          excelUploadForm.resetFields();
        }}
        footer={[
          <MyButton
            key="cancel"
            onClick={() => {
              setExcelUploadOpen(false);
              excelUploadForm.resetFields();
            }}
            variant="reset"
            text="Cancel"
          />,
          <MyButton
            key="upload"
            type="primary"
            variant="upload"
            text="Upload"
            loading={loading === "mapping"}
            onClick={handleExcelUpload}
          />,
        ]}
      >
        {(loading === "mapping" || loading === "sample") && <Loading />}
        <Form form={excelUploadForm} layout="vertical">
          <Form.Item
            name="files"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            noStyle
          >
            <Upload.Dragger name="file" {...excelUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag excel file to this area to upload
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Row justify="end" style={{ marginTop: 5 }}>
            <MyButton
              variant="downloadSample"
              loading={loading === "sample"}
              onClick={downloadSampleFile}
            />
          </Row>
        </Form>
      </Modal>
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
