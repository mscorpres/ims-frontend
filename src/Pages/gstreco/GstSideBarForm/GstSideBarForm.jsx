import React from "react";
import { Form, Input, Space , Select, Button,
  Drawer, Row, Col,InputNumber
  } 
  from "antd";
import { useState, useEffect } from "react";
// import axios  from "axios";
// import api from "../config";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment'; 
import { imsAxios } from "../../../axiosInterceptor";


const GstSideBarForm = ({ onClose, selectedGstRowData }) => {
  const [open, setOpen] = useState(true);
  const [gstForm] = Form.useForm();

  const { Option } = Select;

  useEffect(() => {
    if (selectedGstRowData) {
      let fieldValues = {
       Month :  selectedGstRowData.Month,
       Gstin : selectedGstRowData.Gstin,
       Suppliername: selectedGstRowData.Suppliername,
       InvoiceNumber:selectedGstRowData.InvoiceNumber,
       InvoiceType:selectedGstRowData.InvoiceType,
       InvoiceDate: moment(selectedGstRowData.InvoiceDate,'DD-MM-YYYY').format('YYYY-MM-DD'),
       InvoiceValue:selectedGstRowData.InvoiceValue,
       PlaceOfSupply:selectedGstRowData.PlaceOfSupply,
       RateOfTax:selectedGstRowData.RateOfTax,
       TaxableValue:selectedGstRowData.TaxableValue,
       IGST:selectedGstRowData.IGST,
       CGST:selectedGstRowData.CGST,
       SGST:selectedGstRowData.SGST
      };
      gstForm.setFieldsValue(fieldValues);
    }
  }, [selectedGstRowData, gstForm]);


  const handleFormSubmit = async () => {
    try {
      let id = selectedGstRowData.id;
      let data = gstForm.getFieldsValue();
      const response =  await imsAxios.post(`/gst/updategst/${id}`,data);
      if(response.status === 200){
        toast.success("updated successfully!");
        gstForm.resetFields();
        onClose();
      }
      else{
        toast.error(" Error in Updating Form!");
      }

    } catch (error) {
      toast.error(error)
  
    }
   
  };

  return (
    <div>
      <div className="gstsidebarForm">
        <Drawer
          title="Edit gst record"
          width='40vw'
          onClose={() => {
            setOpen(false);
            onClose();
          }}
          open={open}
          styles={{
            body: {
              paddingBottom: 80,
            },
          }}
          extra={
            <Space>
              {/* <Button onClick={onClose}>Cancel</Button> */}
              <Button onClick={handleFormSubmit} type="primary">
                Update
              </Button>
            </Space>
          }
        >
          <Form
            form={gstForm}
            name="validateOnly"
            layout="vertical"
            autoComplete="off"
            onFinish={handleFormSubmit}
          >
            <Row gutter={10}>
              <Col span={8}>
                <Form.Item
                  name="Month"
                  label="Month"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select placeholder="Select a month">
                    <Option value="January">January</Option>
                    <Option value="February">February</Option>
                    <Option value="March">March</Option>
                    <Option value="April">April</Option>
                    <Option value="May">May</Option>
                    <Option value="June">June</Option>
                    <Option value="July">July</Option>
                    <Option value="August">August</Option>
                    <Option value="September">September</Option>
                    <Option value="October">October</Option>
                    <Option value="November">November</Option>
                    <Option value="December">December</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="Gstin"
                  label="GSTIN"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter GST Number" />
                </Form.Item>
              </Col>
              <Col  span={8}>
                <Form.Item
                  name="Suppliername"
                  label="Supplier Name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter Supplier name" />
                </Form.Item>
              </Col>

            </Row>

            <Row gutter={10}>
              
            <Col span={8} >
                <Form.Item
                  name="InvoiceNumber"
                  label="Invoice Number"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter Invoice Number" />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="InvoiceType"
                  label="Invoice Type"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter Invoice Type" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="InvoiceDate"
                  label="Invoice Date"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>

              </Row>

              <Row gutter={10}>

              <Col span={8}>
                <Form.Item
                  name="RateOfTax"
                  label="Rate of Tax"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input  placeholder="Enter Rate of Tax"/>
                </Form.Item>
              </Col>



              <Col>
                <Form.Item
                  name="PlaceOfSupply"
                  label="Place of Supply"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input  placeholder="Enter Place of Supply"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="InvoiceValue"
                  label="Invoice Value"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input  placeholder="Enter invoice Value"/>
                </Form.Item>
              </Col>
              

         
              </Row>
          

            <Row gutter={10}>
              
            <Col  span={8}>
                <Form.Item
                  name="TaxableValue"
                  label="Taxable Value"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter Taxable Value"/>
                </Form.Item>
              </Col>

              
          
              <Col span={8} >
                <Form.Item
                  name="IGST"
                  label="IGST "
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input  placeholder="Enter IGST" />
                </Form.Item>
              </Col>

              <Col span={8} >
                <Form.Item
                  name="CGST"
                  label="CGST"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input  placeholder="Enter CGST" />
                </Form.Item>
              </Col>

              
            </Row>

            <Row gutter={10}>
            <Col span={8}>
                <Form.Item
                  name="SGST"
                  label="SGST"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input  placeholder="Enter SGST"/>
                </Form.Item>
              </Col>


            </Row>

          </Form>
        </Drawer>
      </div>
    </div>
  );
};

export default GstSideBarForm;