import { useState, useEffect } from "react";
import {  Input, Form, } from "antd";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { imsAxios } from "../../axiosInterceptor";
import SingleDatePicker from "../../Components/SingleDatePicker";
import CustomFieldBox from "../../new/components/reuseable/CustomFieldBox";

const HeaderDetails = ({ form, setTcsOptions, loading, setLoading }) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [locationArr, setLocationArr] = useState([]);
  const [toggleCheck, setToggleCheck] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);

  const client = Form.useWatch("client", form);
  const location = Form.useWatch("location", form);
  const deliveryNoteDate = Form.useWatch("deliveryNoteDate", form);
  const billingState = Form.useWatch("billingState", {
    form: form,
    preserve: true,
  });

  const handleToggleCheck = (value) => {
    if (client) {
      setToggleCheck(value);
      if (value) {
        copyAddress();
      } else {
        resetAddress();
      }
    }
  };
  const getStateOptions = async () => {
    try {
      setLoading("fetching");
      const response = await imsAxios.get("/tally/backend/states");
      const { data } = response;
      if (data) {
        const arr = data.data.map((row) => ({
          text: row.name,
          value: row.code.toString(),
        }));
        setStateOptions(arr);
      }
    } catch (error) {
      console.log("there was some error in fetching state", error);
    } finally {
      setLoading(false);
    }
  };
  const getClientOptions = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.get(`/client/getClient?name=${search}`);
    setSelectLoading(false);
    let arr = [];
    arr = data?.data?.map((d) => {
      return { text: d.name, value: d.code };
    });
    setAsyncOptions(arr);
    if (data.code == 500) {
      setAsyncOptions(arr);
    }
  };
  const copyAddress = () => {
    const billingValues = form.getFieldsValue([
      "billingState",
      "billingCity",
      "billingName",
      "billingPin",
      "billingGst",
      "billingPan",
      "billingAddress",
      "billingEmail",
    ]);

    form.setFieldValue("shippingName", billingValues.billingName);
    form.setFieldValue("shippingState", billingValues?.billingState);
    form.setFieldValue("shippingCity", billingValues.billingCity);
    form.setFieldValue("shippingPin", billingValues.billingGst);
    form.setFieldValue("shippingGst", billingValues.billingPin);
    form.setFieldValue("shippingAddress", billingValues.billingAddress);
    form.setFieldValue("shippingPan", billingValues.billingPan);
  };
  const getFunctionClientName = async () => {
    const { data } = await imsAxios.get(
      `/client/getClient?code=${client.value}`
    );
    form.setFieldValue("billingEmail", data.data[0].email);
  };
  const getBranchDetails = async (locationId) => {
    try {
      setLoading("fetching");
      const { data } = await imsAxios.get(
        `/client/getClientDetail?addressID=${locationId}`
      );
      form.setFieldValue("billingState", {
        label: data[0].state.name,
        value: data[0].state.code,
      });
      form.setFieldValue("billingCity", data[0].city);
      form.setFieldValue("billingName", data[0].name);
      form.setFieldValue("billingPin", data[0].pinCode);
      form.setFieldValue("billingGst", data[0].gst);
      form.setFieldValue("billingPan", data[0].panNo);
      form.setFieldValue("billingMobile", data[0].phoneNo);
      form.setFieldValue("billingAddress", data[0].address);

      if (data.length) {
        const arr = data;
        setTcsOptions(
          arr[0].tcsOption.map((row) => ({
            text: row.tcs_name,
            value: row.tcs_key,
            tcsGl: row.tcs_gl_code,
            tcsGlName: row.ladger_name,
            tcsPercentage: row.tcs_percent,
          }))
        );
      }
    } catch (error) {
      console.log("error in getting location details", error);
    } finally {
      setLoading(false);
    }
  };
  const getLocation = async (clientId) => {
    try {
      setLoading("fetching");
      const { data } = await imsAxios.get(
        `/client/branches?clientCode=${clientId}`
      );
      let arr = data.data.map((row) => ({
        text: row.city.name,
        value: row.city.id,
      }));
      form.setFieldValue("location", arr[0]);
      setLocationArr(arr);
    } catch (error) {
      console.log("error in getting client location", error);
    } finally {
      setLoading(false);
    }
  };

  const resetAddress = () => {
    form.setFieldValue("shippingName", "");
    form.setFieldValue("shippingState", "");
    form.setFieldValue("shippingCity", "");
    form.setFieldValue("shippingPin", "");
    form.setFieldValue("shippingGst", "");
    form.setFieldValue("shippingPan", "");
    form.setFieldValue("shippingAddress", "");
  };
  useEffect(() => {
    if (client) {
      getLocation(client.value);
      getFunctionClientName(client.value);
    }
  }, [client]);
  useEffect(() => {
    if (location?.value && client?.value) {
      getBranchDetails(location.value);
    }
  }, [location]);
  useEffect(() => {
    if (billingState && toggleCheck) {
      copyAddress();
    }
  }, [billingState]);
  useEffect(() => {
    getStateOptions();
  }, []);
  return (
    <div
      style={{
        height: "100%",
        overflowY: "scroll",
        overflowX: "hidden",
        padding: "2px 12px",
      }}
    >
      <div className="grid grid-cols-2" style={{ gap: 12 }}>
        <CustomFieldBox title={"Client Details"}>
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <Form.Item name="client" label="Client" rules={rules.client}>
              <MyAsyncSelect
                selectLoading={selectLoading}
                loadOptions={getClientOptions}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                labelInValue
              />
            </Form.Item>{" "}
            <Form.Item label="Location" name="location" rules={rules.location}>
              <MySelect
                options={locationArr}
                placeholder="Select Location"
                labelInValue
              />
            </Form.Item>{" "}
            <Form.Item
              label="City"
              name="billingCity"
              rules={rules.billingCity}
            >
              <Input disabled />
            </Form.Item>{" "}
            <Form.Item
              label="Email"
              name="billingEmail"
              rules={rules.billingEmail}
            >
              <Input disabled />
            </Form.Item>{" "}
            <Form.Item
              label="Mobile"
              name="billingMobile"
              rules={rules.billingMobile}
            >
              <Input disabled />
            </Form.Item>{" "}
            <Form.Item label="GSTIN" name="billingGst" rules={rules.billingGst}>
              <Input disabled />
            </Form.Item>{" "}
            <Form.Item
              label="Address"
              name="billingAddress"
              rules={rules.billingAddress}
            >
              <Input disabled />
            </Form.Item>{" "}
            <Form.Item label="PAN" name="billingPan" rules={rules.billingPan}>
              <Input disabled />
            </Form.Item>
          </div>
        </CustomFieldBox>
        <CustomFieldBox title={"Transport Details"}>
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <Form.Item name="modeOfTransport" label="Mode Of Transport">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="destination" label="Destination of Supply">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="transportCompany" label="Transport Company">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="roadPermit" label="G.R No. & Date (Road Permit)">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="deliveryNote" label="Delivery Note">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="deliveryNoteDate" label="Delivery Note Date">
              <SingleDatePicker
                // value={deliveryNoteDate}
                setDate={(value) =>
                  form.setFieldValue("deliveryNoteDate", value)
                }
              />
            </Form.Item>{" "}
            <Form.Item name="vehicleNo" label="Vehicle Number">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="dispatchDocNo" label="Dispatch Doc. Number">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="termsDelivery" label="Terms Of Delivery">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="salesPerson" label="Sales Person">
              <Input />
            </Form.Item>
          </div>
        </CustomFieldBox>
        <CustomFieldBox title={"Buyer Details"}>
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <Form.Item name="buyerOrderNo" label="Buyer's Order Number.">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="buyerOrderDate" label="Buyer's Order Date">
              <SingleDatePicker
                // value={invoiceDate}
                setDate={(value) => form.setFieldValue("buyerOrderDate", value)}
              />
            </Form.Item>{" "}
            <Form.Item name="modeOfPayment" label="Mode Of Payment">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="ponumber" label="Po Number & Date">
              <Input />
            </Form.Item>{" "}
            <Form.Item name="otherReferences" label="Other References">
              <Input />
            </Form.Item>
          </div>
        </CustomFieldBox>
        <CustomFieldBox title={"Same as Billing address"}>
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <Form.Item name="shippingName" label="Name">
              <Input disabled={toggleCheck} />
            </Form.Item>{" "}
            <Form.Item name="shippingState" label="State">
              <MySelect
                labelInValue
                disabled={toggleCheck}
                options={stateOptions}
              />
            </Form.Item>{" "}
            <Form.Item name="shippingCity" label="City">
              <Input disabled={toggleCheck} />
            </Form.Item>{" "}
            <Form.Item name="shippingPin" label="PinCode">
              <Input disabled={toggleCheck} />
            </Form.Item>{" "}
            <Form.Item name="shippingGst" label="GST">
              <Input disabled={toggleCheck} />
            </Form.Item>{" "}
            <Form.Item name="shippingPan" label="Pan">
              <Input disabled={toggleCheck} />
            </Form.Item>
          </div>
          <Form.Item name="shippingAddress" label="Address">
            <Input.TextArea disabled={toggleCheck} />
          </Form.Item>
        </CustomFieldBox>
      </div>
    </div>
  );
};

const rules = {
  client: [
    {
      required: true,
      message: "Please select a location",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a location",
    },
  ],
};
export default HeaderDetails;
