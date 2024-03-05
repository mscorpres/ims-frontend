import { useState, useEffect } from "react";
import { Col, Descriptions, Input, Row, Form, Divider, Switch } from "antd";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { imsAxios } from "../../axiosInterceptor";
import SingleDatePicker from "../../Components/SingleDatePicker";

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
        padding: "0vh 20px",
      }}
    >
      <Row gutter={12}>
        <Col span={4}>
          <Descriptions size="small" title="Client Details">
            <Descriptions.Item
              contentStyle={{
                fontSize: window.innerWidth < 1600 && "0.7rem",
              }}
            >
              Provide Client Details
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={20}>
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item name="client" label="Client" rules={rules.client}>
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  loadOptions={getClientOptions}
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  labelInValue
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label="Location"
                name="location"
                rules={rules.location}
              >
                <MySelect
                  options={locationArr}
                  placeholder="Select Location"
                  labelInValue
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="City"
                name="billingCity"
                rules={rules.billingCity}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label="Email"
                name="billingEmail"
                rules={rules.billingEmail}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="Mobile"
                name="billingMobile"
                rules={rules.billingMobile}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item
                label="GSTIN"
                name="billingGst"
                rules={rules.billingGst}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Address"
                name="billingAddress"
                rules={rules.billingAddress}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="PAN" name="billingPan" rules={rules.billingPan}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <Row gutter={12}>
        <Col span={4}>
          <Descriptions size="small" title="Transport Details">
            <Descriptions.Item
              contentStyle={{
                fontSize: window.innerWidth < 1600 && "0.7rem",
              }}
            >
              Provide Transport Details
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={20}>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item name="modeOfTransport" label="Mode Of Transport">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="destination" label="Destination of Supply">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="transportCompany" label="Transport Company">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="roadPermit" label="G.R No. & Date (Road Permit)">
                <Input />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="deliveryNote" label="Delivery Note">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item name="deliveryNoteDate" label="Delivery Note Date">
                <SingleDatePicker
                  // value={deliveryNoteDate}
                  setDate={(value) =>
                    form.setFieldValue("deliveryNoteDate", value)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="vehicleNo" label="Vehicle Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="dispatchDocNo" label="Dispatch Doc. Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="termsDelivery" label="Terms Of Delivery">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="salesPerson" label="Sales Person">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <Row gutter={12}>
        <Col span={4}>
          <Descriptions size="small" title=" Buyer Details">
            <Descriptions.Item
              contentStyle={{
                fontSize: window.innerWidth < 1600 && "0.7rem",
              }}
            >
              Provide Buyer Details
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={4}>
          <Form.Item name="buyerOrderNo" label="Buyer's Order Number.">
            <Input />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="buyerOrderDate" label="Buyer's Order Date">
            <SingleDatePicker
              // value={invoiceDate}
              setDate={(value) => form.setFieldValue("buyerOrderDate", value)}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="modeOfPayment" label="Mode Of Payment">
            <Input />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="ponumber" label="Po Number & Date">
            <Input />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="otherReferences" label="Other References">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={4}>
          <Descriptions size="small" title="Shiping Details">
            <Descriptions.Item
              contentStyle={{
                fontSize: window.innerWidth < 1600 && "0.7rem",
              }}
            >
              <Col span={24}>
                Same as Billing address{" "}
                <Switch disabled={!client} onChange={handleToggleCheck} />
              </Col>
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Row gutter={12}>
          <Col span={4}>
            <Form.Item name="shippingName" label="Name">
              <Input disabled={toggleCheck} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="shippingState" label="State">
              <MySelect
                labelInValue
                disabled={toggleCheck}
                options={stateOptions}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="shippingCity" label="City">
              <Input disabled={toggleCheck} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="shippingPin" label="PinCode">
              <Input disabled={toggleCheck} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="shippingGst" label="GST">
              <Input disabled={toggleCheck} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="shippingPan" label="Pan">
              <Input disabled={toggleCheck} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="shippingAddress" label="Address">
              <Input.TextArea disabled={toggleCheck} />
            </Form.Item>
          </Col>
        </Row>
      </Row>
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
