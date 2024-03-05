import { Card, Col, Drawer, Form, Input, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import SingleProduct from "./SingleProduct";
import VBTHeaders from "./VBTHeaders";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function EditVBTReport({ editVbtDrawer, setEditVbtDrawer }) {
  const [editVbt] = Form.useForm();
  const [vbtComponent, setVbtComponent] = useState([]);
  const [taxDetails, setTaxDetails] = useState([]);
  const [roundOffSign, setRoundOffSign] = useState("+");
  const [roundOffValue, setRoundOffValue] = useState(0);
  const [tdsArray, setTdsArray] = useState([]);
  const [allTdsOptions, setAllTdsOptions] = useState([]);
  const [optionState, setOptionState] = useState([]);
  const [glstate, setglState] = useState([]);
  const components = Form.useWatch("components", {
    form: editVbt,
    preserve: true,
  });

  const backFunction = () => {
    setEditVbtDrawer(null);
  };

  const getEditVbtDetails = async (vbtCode) => {
    const response = await imsAxios.get(
      `/tally/vbt/getData?vbtKey=${vbtCode}`
    );
    if (response.status == 200) {
      const { data } = response;

      setVbtComponent(data);
      getGl();
      let tdsName = {
        label: data[0]?.tds?.glName,
        Value: data[0]?.tds?.tdsGlKey,
      };

      const arr = data.map((row) => ({
        ...row,
        poNumber: row.poNumber,
        projectID: row.projectID,
        partCode: row.part.partCode,
        partName: row.part.partName,
        glName: row.tds?.tdsName,
        glCode: row?.tds?.tdsGlKey,
        tdsName: {
          label: row.tds?.tdsName,
          value: row?.tds?.tdsKey,
        },
        tdsPercent: row?.tds?.tdsPercent,

        gstType: row.gstType === "L" ? "L" : "I",
        insertDate: row.insertDate,
        insertBy: row.insertBy,
        roundOffSigns: row.roundOffSign,
        roundOffValue: row.roundOffValue,
      }));
      editVbt.setFieldValue("components", arr);
      getTdsOptions(response.data[0]?.minId);
    }
  };
  const getTdsOptions = async (minId) => {
    const response = await imsAxios.post("/tally/vbt01/fetch_minData", {
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
    // console.log("data===========", data.data[0].ven_tds[0]);
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
      setOptionState(arr);
    }
    console.log("setOptionState", optionState);
  };

  const submitFunction = async () => {
    const values = await editVbt.validateFields();
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
        !component.tds_gl_code ||
        component.tds_gl_code === "" ||
        component.tds_gl_code === "--"
    )[0]
      ? undefined
      : values.components.map((component) => component.tds_gl_code);
    let finalObj = {
      bill_amount: values.venAmmount,
      bill_qty: values.components.map((component) => component.vbtBillQty),
      cgst_gl: values.components.map((component) => component.cgst?.value),
      cgsts: values.components.map((component) => component.cgstAmount),
      comment: values.comment,
      component: values.components.map((component) => component.partName),
      eff_date: values.effectiveDate,
      freight: values.components.map((component) => component.freightAmount),
      g_l_codes: values.components.map(
        (component) => component.purchase_gl.value
      ),
      gst_ass_vals: values.components.map((component) => component.gstAssValue),
      hsn_code: values.components.map((component) => component.hsnCode),
      igst_gl: values.components.map((component) => component.igst?.value),
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
      sgst_gl: values.components.map((component) => component.sgst?.value),
      sgsts: values.components.map((component) => component.sgstAmount),
      taxable_values: values.components.map(
        (component) => component.taxableValue
      ),
      
      tds_amounts: values.components.map((component) => component.tdsAmount),
      tds_ass_vals: values.components.map((component) => component.tdsAssValue),
      tds_codes: tdsCodes,

      tds_gl_code: tdsGlCodes,
      vbp_gst_rate: values.components.map((component) => component.gstRate),
      vbt_gstin: values.gst,
      ven_address: values.venAddress,
      ven_amounts: values.components.map((component) => component.venAmmount),
      ven_code: values.components[0]?.venCode,
      poNumber: values.components.map((component) => component.poNumber),
      projectID: values.components.map((component) => component.projectID),
      vbtKey: editVbtDrawer,
      insertDate: values.components[0]?.insertDate,
      insertBy: values.components[0]?.insertBy,
    };
    console.log(finalObj);
    const finalData = {
      ...finalObj,
      roundOffSign: roundOffSign,
      roundOffValue: roundOffValue,
    };
    //
    updateVbt(finalData);
  };
  const updateVbt = async (finalData) => {
    const response = await imsAxios.put("/tally/vbt01/update", finalData);
    const { data } = response;
    console.log("data", response);
    if (response.status === 200) {
      toast.success(response.data);
      setEditVbtDrawer(null);
    } else {
      toast.error(response.data);
    }
  };
  const resetForm = () => {
    setEditVbtDrawer(null);
  };
  const showCofirmModal = () => {
    Modal.confirm({
      okText: "Save",
      title: "Are you sure you want to submit the Edited details",
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitFunction();
      },
    });
  };

  useEffect(() => {
    if (editVbtDrawer) {
      getEditVbtDetails(editVbtDrawer);
    }
  }, [editVbtDrawer]);
  useEffect(() => {
    const value = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.taxableValue).toFixed(3),
      0
    );
    const freight = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.freightAmount).toFixed(3),
      0
    );
    const cgst = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.cgstAmount).toFixed(3),
      0
    );
    const sgst = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.sgstAmount).toFixed(3),
      0
    );
    const igst = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.igstAmount).toFixed(3),
      0
    );
    let vendorAmount = components?.reduce(
      (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(3),
      0
    );
    const tds = components?.reduce(
      (a, b) => a + +Number(b.tdsAmount ?? 0).toFixed(3),
      0
    );

    if (roundOffSign === "+") {
      vendorAmount = vendorAmount + +Number(roundOffValue).toFixed(3);
    }
    if (roundOffSign === "-") {
      vendorAmount -= +Number(roundOffValue).toFixed(3);
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
      width="100vw"
      onClose={backFunction}
      open={editVbtDrawer}
      title={` ${editVbtDrawer}`}
    >
      <Form
        style={{ height: "100%" }}
        form={editVbt}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={5} style={{ height: "100%" }}>
          <Col span={6} style={{ overflow: "hidden", height: "90%" }}>
            <VBTHeaders
              taxDetails={taxDetails}
              form={editVbt}
              vbtComponent={vbtComponent}
              editVbtDrawer={editVbtDrawer}
              setEditVbtDrawer={setEditVbtDrawer}
              roundOffSign={roundOffSign}
              roundOffValue={roundOffValue}
              setRoundOffSign={setRoundOffSign}
              setRoundOffValue={setRoundOffValue}
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
                        <SingleProduct
                          fields={fields}
                          field={field}
                          index={index}
                          add={add}
                          form={editVbt}
                          remove={remove}
                          tdsArray={tdsArray}
                          allTdsOptions={allTdsOptions}
                          setOptionState={setOptionState}
                          optionState={optionState}
                          glstate={glstate}
                          setglState={setglState}
                          // getGl={getGl}
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
        resetFunction={resetForm}
      />
    </Drawer>
  );
}

export default EditVBTReport;
const initialValues = {
  minId: "",
};
