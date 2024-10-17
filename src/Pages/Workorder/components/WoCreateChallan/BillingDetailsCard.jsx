import { Card, Form, Input, Col, Row } from "antd";
import React, { useState, useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";

const BillingDetailsCard = ({ form, code, setaddid, addoptions }) => {
  const [shippingaddressoptions, setShippingAddressOptions] = useState([]);
  const [shippingaddressdata, setShippingAddData] = useState([]);
  const [loading, setLoading] = useState([]);

  const handleaddress = (e) => {
    setaddid(true);
    addoptions.map((item) => {
      if (item.value === e) {
        // console.log("");
        form.setFieldValue("billingaddress", item.address);
      }
    });
  };
  return (
    <Col span={24}>
      <Card
        size="small"
        title="Billing Details"
        style={{ height: "100%", overflow: "hidden" }}
        bodyStyle={{ overflow: "auto", height: "98%" }}
      >
        <Form.Item
          name="billingid"
          label="Select billing Address"
          rules={[
            { required: true, message: "Please select billing Address!" },
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
          name="billingaddress"
          label="Complete Address"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Card>
    </Col>
  );
};

export default BillingDetailsCard;
