import { Card, Form, Input, Col, Row } from "antd";
import React, { useState, useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import MySelect from "../../../../Components/MySelect";

const DispatchDetailsCard = ({
  form,
  code,
  setaddid,
  addoptions,
  rtnchallan,
}) => {
  const [loading, setLoading] = useState([]);

  const handleaddress = (e) => {
    console.log(e);
    setaddid(true);
    addoptions.map((item) => {
      if (item.value === e) {
        form.setFieldValue("shippingaddress", item.address);
        form.setFieldValue("dispatchfrompincode", item.pincode);
        form.setFieldValue("dispatchfromgst", item.gst);
      }
    });
  };
  //
  ///////
  return (
    <Col span={24}>
      <Card
        size="small"
        title="Dispatch Details"
        style={{ height: "100%", overflow: "hidden" }}
        bodyStyle={{ overflow: "auto", height: "98%" }}
      >
        <Form.Item
          name="dispatchid"
          label="Select Dispatch Address"
          rules={[
            { required: true, message: "Please select Dispatch Address!" },
          ]}
        >
          <MySelect
            options={addoptions}
            onChange={(e) => {
              handleaddress(e);
            }}
          />
        </Form.Item>
        <Form.Item
          name="shippingaddress"
          label="Complete Address"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} disabled />
        </Form.Item>
        {rtnchallan && (
          <>
            <Form.Item
              name="dispatchfrompincode"
              label="Shipping Pin"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="dispatchfromgst"
              label="Shipping GST"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          </>
        )}
      </Card>
    </Col>
  );
};

export default DispatchDetailsCard;
