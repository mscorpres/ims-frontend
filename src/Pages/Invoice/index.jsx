import { useState, useEffect } from "react";
import { Button, Form, Tabs } from "antd";
import HeaderDetails from "./HeaderDetails";
import Products from "./Products";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import NavFooter from "../../Components/NavFooter";
import MapModal from "./MapModal";
import Loading from "../../Components/Loading";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const currentStateCode = "9";

const CreateInvoice = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [showMapInvoice, setShowMapInvoice] = useState(false);
  const [tcsOptions, setTcsOptions] = useState([]);
  const [gstType, setGstType] = useState("");
  const [loading, setLoading] = useState(false);
  const [stateCode, setStateCode] = useState("");
  const navigate = useNavigate();

  let params = useParams();

  const [invoiceForm] = Form.useForm();
  const shippingState = Form.useWatch("shippingState", invoiceForm);
  const shippingCity = Form.useWatch("shippingCity", invoiceForm);
  const shippingPin = Form.useWatch("shippingPin", invoiceForm);

  const components = Form.useWatch("components", {
    form: invoiceForm,
    preserve: true,
  });

  const onChangeTab = (key) => {
    setActiveTab(key);
  };
  const submitHandler = async (obj) => {
    const { data } = await imsAxios.post("/invoice/create", obj);
    if (data) {
      toast.success(data);
      // reset();
      resetForm();
      setActiveTab("1");
    }
  };
  const sendFormData = async () => {
    const values = await invoiceForm.validateFields();
    const invoiceTotal = components.reduce(
      (a, b) => a + +Number(b?.totalAmount).toFixed(3),
      0
    );

    const obj = {
      clientID: values.client.value,
      buyerOrderDate: values.buyerOrderDate,
      buyerOrderNo: values.buyerOrderNo,
      clientBranch: values.location.value,
      deliveryNote: values.deliveryNote,
      deliveryNoteDate: values.deliveryNoteDate,
      deliveryTerms: values.termsDelivery,
      destination: values.destination,
      dispatchDocNo: values.dispatchDocNo,
      transportMode: values.modeOfTransport,
      transportCompany: values.transportCompany,
      otherReferences: values.otherReferences,
      paymentTerms: values.modeOfPayment,
      ponumber: values.ponumber,
      roadPermit: values.roadPermit,
      salesperson: values.salesPerson,
      shippingAddress: values.shippingAddress,
      shippingCity: values,
      shippingGst: values.shippingGst,
      shippingName: values.shippingName,
      shippingPanNo: values.shippingPan,
      shippingPinCode: values.shippingPin,
      shippingState: values.shippingState?.value,

      // invoiceDate: "this one",
      invoiceDate: dayjs(values.invoiceDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      refDate: dayjs(values.refDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      // refDate: values.refDate,

      vehicleNo: values.vehicleNo,
      productID: values.components.map((component) => component.product?.value),
      taxableValue: values.components.map((component) => component.value),
      hsnsac: values.components.map((component) => component.hsnCode),
      quantity: values.components.map((component) => component.qty),
      rate: values.components.map((component) => component.rate),
      freight: values.components.map((component) => component.freight),
      glCode: values.components.map((component) => component.glCode),
      gstType: values.components.map((component) => gstType.toUpperCase()),
      gstAssValue: values.components.map((component) => component.gstassValue),
      remark: values.components.map((component) => component.remark),
      invoiceType: "goodsAndServices",
      gstRate: values.components.map(
        (component) => component.gstRate?.replaceAll("%", "") ?? 0
      ),
      sgst:
        gstType === "local"
          ? values.components.map(
              (component) => +Number(component.gstAmount).toFixed(3) / 2
            )
          : undefined,
      cgst:
        gstType === "local"
          ? values.components.map(
              (component) => +Number(component.gstAmount).toFixed(3) / 2
            )
          : undefined,
      igst:
        gstType === "interstate"
          ? values.components.map(
              (component) => +Number(component.gstAmount).toFixed(3)
            )
          : undefined,
      sgstGl:
        gstType === "local"
          ? values.components.map((component) => component.sgstGl)
          : undefined,
      cgstGl:
        gstType === "local"
          ? values.components.map((component) => component.cgstGl)
          : undefined,
      igstGl:
        gstType === "interstate"
          ? values.components.map((component) => component.igstGl)
          : undefined,
      tcsAmount: values.components.map((component) => component.tcsAmount),
      tcsGl: values.components.map((component) => component.tcsGlCode),
      tcsCode: values.components.map((component) => component.tcs),
      customerAmount: values.components.map(
        (component) => component.totalAmount
      ),
      invoiceTotal: +Number(invoiceTotal).toFixed(3),
    };
    // obj;
    // console.log("this the final obj", obj);
    submitHandler(obj);
  };
  const moveToNextFormPage = async () => {
    // setStateCode(shippingState.value);
    setActiveTab("2");
  };
  const moveToLastFormPage = async () => {
    setActiveTab("1");
  };
  const resetForm = () => {
    invoiceForm.resetFields();
  };
  // will run if there is a invoice id in the params
  const getInvoiceDetails = async (invoiceId) => {
    try {
      setLoading("fetching");

      let { data: headerData } = await imsAxios.get(
        `/invoice/getInvoice?invoiceID=${invoiceId}`
      );
      headerData = headerData[0];
      const { data: componentData } = await imsAxios.get(
        `/invoice/getInvoiceProducts?invoiceID=${invoiceId}`
      );

      const finalObj = {
        client: { label: headerData.clientName, value: headerData.clientID },
        location: headerData.clientBranch,
        modeOfTransport: headerData.transportMode,
        destination: headerData.destination,
        transportCompany: headerData.transportCompany,
        roadPermit: headerData.roadPermit,
        deliveryNote: headerData.deliveryNote,
        deliveryNoteDate: headerData.deliveryNoteDate,
        vehicleNo: headerData.vehicleNo,
        dispatchDocNo: headerData.dispatchDocNo,
        termsDelivery: headerData.deliveryTerms,
        salesPerson: headerData.salesperson,
        buyerOrderNo: headerData.buyerOrderNo,
        buyerOrderDate: headerData.buyerOrderDate,
        modeOfPayment: headerData.paymentTerms,
        ponumber: headerData.ponumber,
        otherReferences: headerData.otherReferences,
        shippingName: headerData.shippingName,
        shippingState: headerData.shippingState,
        shippingCity: headerData.shippingCity,
        shippingPin: headerData.shippingPinCode,
        shippingGst: headerData.shippingGst,
        shippingPan: headerData.shippingPanNo,
        shippingAddress: headerData.shippingAddress,
        invoiceDate: headerData.invoiceDate,
        refDate: headerData.refDate,
        components: componentData.map((component) => ({
          product: { label: component.productName, value: component.productID },
          qty: component.quantity,
          uom: component.uom,
          rate: component.rate,
          hsnCode: component.hsnsac,
          gstRate: component.gstRate + "%",
          freight: component.freight,
          glCode: component.glCode,
          sgstGl: component.sgstGl,
          cgstGl: component.cgstGl,
          igstGl: component.igstGl,
          tcs: component.tcs_name
            ? { label: component.tcs_name, value: component.tcsCode }
            : "",
          tcsGlName: component.tcsGl,
          remark: component.remark,
        })),
      };
      invoiceForm.setFieldsValue(finalObj);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // cancel edit invoice
  const cancelEditInvoice = () => {
    navigate("/draft-invoices");
  };
  useEffect(() => {
    if (
      shippingState && shippingState?.value
        ? shippingState?.value?.toString()
        : shippingState?.toString() !== currentStateCode
    ) {
      setGstType("local");
    } else if (
      shippingState && shippingState?.value
        ? shippingState?.value?.toString()
        : shippingState?.toString() !== currentStateCode
    ) {
      setGstType("interstate");
    }
  }, [shippingState]);

  useEffect(() => {
    if (params?.invoiceId) {
      getInvoiceDetails(params.invoiceId.replaceAll("_", "/"));
    }
  }, [params.invoiceId]);
  return (
    <div
      style={{
        height: "90%",
      }}
    >
      <MapModal open={showMapInvoice} close={() => setShowMapInvoice(false)} />
      {loading === "fetching" && <Loading />}
      <Form
        style={{ height: "100%" }}
        form={invoiceForm}
        layout="vertical"
        initialValues={initialValues}
      >
        <Tabs
          style={{
            padding: "0 5px",
            height: "100%",
          }}
          activeKey={activeTab}
          size="small"
          onChange={(e) => onChangeTab(e)}
          tabBarExtraContent={
            <Button type="primary" onClick={() => setShowMapInvoice(true)}>
              Map Invoice
            </Button>
          }
        >
          <Tabs.TabPane tab="Billing Details" key="1" style={{ height: "95%" }}>
            <HeaderDetails
              setTcsOptions={setTcsOptions}
              form={invoiceForm}
              loading={loading}
              setLoading={setLoading}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Product Details" style={{ height: "95%" }} key="2">
            <Products
              gstType={gstType}
              form={invoiceForm}
              tcsOptions={tcsOptions}
              loading={loading}
              setLoading={setLoading}
              setGstType={setGstType}
              setStateCode={setStateCode}
              stateCode={stateCode}
            />
          </Tabs.TabPane>
        </Tabs>
      </Form>
      <NavFooter
        nextDisabled={!shippingState || !shippingCity || !shippingPin}
        nextLabel={activeTab === "1" ? "Next" : "Submit"}
        submitFunction={() => {
          activeTab === "1" ? moveToNextFormPage() : sendFormData();
        }}
        resetFunction={resetForm}
        backFunction={
          params.invoiceId && activeTab === "1"
            ? cancelEditInvoice
            : activeTab === "2" && moveToLastFormPage
        }
        loading={loading === "submit"}
      />
    </div>
  );
};

const initialValues = {
  client: "",
  location: "",
  modeOfTransport: "",
  destination: "",
  roadPermit: "",
  deliveryNote: "",
  deliveryNoteDate: "",
  vehicleNo: "",
  dispatchDocNo: "",
  termsDelivery: "",
  salesPerson: "",
  buyerOrderNo: "",
  buyerOrderDate: "",
  modeOfPayment: "",
  ponumber: "",
  otherReferences: "",
  shippingName: "",
  shippingState: "",
  shippingCity: "",
  shippingPin: "",
  shippingGst: "",
  shippingPan: "",
  shippingAddress: "",
  billingCity: "",
  billingName: "",
  billingState: "",
  billingPin: "",
  billingGst: "",
  billingPan: "",
  billingAddress: "",
  components: [
    {
      product: "",
    },
  ],
};

export default CreateInvoice;
