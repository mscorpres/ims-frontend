
import React from 'react'
import './sideform.css'
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
import { imsAxios } from '../../../axiosInterceptor';

const{Option} = Select;






const SideForm = ({ onClose, selectedRowData }) => {
  const [open, setOpen] = useState(true);
    const [bookForm] = Form.useForm();
    const [monvalue,setmonvalue] = useState()
    
      // const showDrawer = () => {
      //   setOpen(true);
      // };
        // const onClose = () => {
        //   setOpen(false);
        // };
    
useEffect(() => {
  if (selectedRowData) {

    let fieldValues = {
      
      CGST: selectedRowData.CGST || "",
      GSTINUIN: selectedRowData.GSTINUIN || "",
      IGST: selectedRowData.IGST || "",
      INVDate: moment(selectedRowData.INVDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      InvoiceNo: selectedRowData.InvoiceNo || "",
      InvoiceValue: selectedRowData.InvoiceValue || "",
      Month: selectedRowData.Month ||undefined,
      POS: selectedRowData.POS || "",
      RCM: selectedRowData.RCM || "",
      Reconciled: selectedRowData.Reconciled || "",
      SGST: selectedRowData.SGST || "",
      Status: selectedRowData.Status || "",
      SupplierName: selectedRowData.SupplierName || "",
      SupplyType: selectedRowData.SupplyType || "",
      TaxableValue: selectedRowData.TaxableValue || "",
      Type: selectedRowData.Type || "",
      UpdatedInvNo: selectedRowData.UpdatedInvNo || "",
      VchDate:moment(selectedRowData.VchDate,'DD-MM-YYYY').format('YYYY-MM-DD') ,
      VchNo: selectedRowData.VchNo || "",
      VchType: selectedRowData.VchType || "",
      id: selectedRowData.id || "",
     
    };

    setmonvalue(fieldValues.Month)
    bookForm.setFieldsValue(fieldValues);
    
  }
}, [selectedRowData, bookForm]);


const handleFormSubmit = async () => {

  try{
    let id = selectedRowData.id;
    let data = bookForm.getFieldsValue();
    const response =  await imsAxios.post(`/book/updatebook/${id}`,data);

    if(response.status === 200){
      onClose();
      toast.success('updated successfully!');
      bookForm.resetFields();
    }
    else{
      toast.error(' Error in Updating Form!');
    }
  }
  catch(error){
    toast.error(error)
  }
   
};




  return (
    <div>
        <Col className="sidebarForm">
        <Drawer 
        title="Edit book record"
        width={720}
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
           form={bookForm}
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

               <Select value={monvalue} placeholder="Select a month">
                  <Option value="January">Jan</Option>
                  <Option value="February">Feb</Option>
                  <Option value="March">Mar</Option>
                  <Option value="April">Apr</Option>
                  <Option value="May">May</Option>
                  <Option value="June">Jun</Option>
                  <Option value="July">Jul</Option>
                  <Option value="August">Aug</Option>
                  <Option value="September">Sep</Option>
                  <Option value="October">Oct</Option>
                  <Option value="November">Nov</Option>
                  <Option value="December">Dec</Option>
                  </Select> 


                <Option/>
              </Form.Item >
            </Col>
            <Col span={8}>
              <Form.Item
                name="SupplierName"
                label="Supplier Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input  placeholder='Enter Supplier Name'/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="GSTINUIN"
                label="GSTIN/UIN"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input  placeholder='Enter GST Number'/>
              </Form.Item>
            </Col>

            </Row>

            <Row gutter={10}>

              
            <Col span={8}>
              <Form.Item
                name="VchNo"
                label="VchNo"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter Voucher Number'/>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="VchDate"
                label="Vch Date"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
             <Input type="date" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="VchType"
                label="Vch Type"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter Voucher Type' />
              </Form.Item>
            </Col>
           
            </Row>



          <Row gutter={10}>
          <Col  span={8}>
              <Form.Item
                name="InvoiceNo"
                label="Invoice Number"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter Invoice Number' /> 
              </Form.Item>
            </Col>
         

            <Col span={8}>
              <Form.Item
                name="INVDate"
                label="Inv Date"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
             <Input type="date"/>
              </Form.Item>
            </Col>

            <Col  span={8}>
              <Form.Item
                name="InvoiceValue"
                label="Invoice Value"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input  placeholder='Enter Invoice Value'/>
              </Form.Item>
            </Col>


          </Row>

          <Row gutter={10}>
            
          <Col  span={8}>
              <Form.Item
                name="SupplyType"
                label="Supply Type"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter Supply Type' />
              </Form.Item>
            </Col>
            

            <Col span={8} >
              <Form.Item
                name="TaxableValue"
                label="Taxable Value"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter Taxable Value'/>
              </Form.Item>
            </Col>

            <Col  span={8}>
              <Form.Item
                name="IGST"
                label="IGST"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter IGST'/>
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={10}>
          <Col span={8}>
              <Form.Item
                name="CGST"
                label="CGST"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter CGST'/>
              </Form.Item>
            </Col>
            <Col span={8} >
              <Form.Item
                name="SGST"
                label="SGST"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder='Enter SGST'/>
              </Form.Item>
            </Col>
          </Row>
        </Form> 
       </Drawer>
    </Col>
     
    </div>
  )
}

export default SideForm