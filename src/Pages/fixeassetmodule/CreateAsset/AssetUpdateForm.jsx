import React from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  InputNumber,
  Upload,
} from "antd";
import { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
const  api = "http://localhost:8070";


const SidebarForm = ({ onClose, selectedRowData }) => {
  const [open, setOpen] = useState(true);
  const [form] = Form.useForm();

  console.log(selectedRowData)

  console.log(form.data)


  useEffect(() => {
    if (selectedRowData) {
      const fieldValues = {
        asset_id: selectedRowData.asset_id || "--",
        asset_name: selectedRowData.asset_name || "--",
        asset_categories: selectedRowData.asset_categories || "--",
        type_of_asset:selectedRowData.type_of_asset || "--",
        invoice_date: moment(selectedRowData.invoice_date).format("YYYY-MM-DD")|| "--",
        useFullLife : selectedRowData.useFullLife || "--",
        purchase_platform: selectedRowData.purchase_platform||"--",
        use_date: moment(selectedRowData.use_date).format("YYYY-MM-DD")||"--",
        cost_of_acquisition: selectedRowData.cost_of_acquisition  || "--",
        invoice_number: selectedRowData.invoice_number || "--",
        warranty: selectedRowData.warranty || "--",
        depreciation: selectedRowData.depreciation || "--",
        warranty_info:selectedRowData.warranty_info || "--",
        salvage_value:selectedRowData.salvage_value || "--",
        usefull_life:selectedRowData.usefull_life || "--",
        asset_status:selectedRowData.asset_status || "--",
        responsible_department:selectedRowData.responsible_department || "--",
        location:selectedRowData.location || "--",
        responsibleDepartment:selectedRowData.responsibleDepartment || "--",
        contact_person:selectedRowData.contact_person || "--",
        contact_number:selectedRowData.contact_number || "--",
        manufacturer:selectedRowData.manufacturer || "--",
        serial_number:selectedRowData.serial_number || "--",
        technical_contact:selectedRowData.technical_contact || "--",

      };
      form.setFieldsValue(fieldValues);
    }
  }, [selectedRowData, form]);

  const handleSubmitUpdateData=  async ()=>{
    try{

      let data = form.getFieldsValue();
      console.log(data)

       const response = axios.post(`${api}/updateAsset`,{data})
        toast.success('Asset Updated successfully!');
        setOpen(false)
        form.resetFields();

    }catch(error){
      toast.error('Error in Updating data!')

    }

  }
  

  return (
    <>
      <Drawer
      title="Edit Asset Details"
        width={"55vw"}
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
            <Button  type="primary" onClick={handleSubmitUpdateData}>
              Update
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} >

            <Row gutter={20}>

            <Col span={8}>
              <Form.Item label="Invoice Number" name="invoice_number">
                <Input placeholder="Enter Invoice Number" />
              </Form.Item>
              </Col>

              <Col span={8}> 
              <Form.Item label="Invoice Date" name="invoice_date">
                <Input type="date" />
              </Form.Item>
              </Col>

             <Col span={8}> 
               <Form.Item label="Purchase Platform" name="purchase_platform">
                <Select>
                  <Select.Option value="Online">Online</Select.Option>
                  <Select.Option value="Offline">Offline</Select.Option>
                </Select>
              </Form.Item>
              </Col>
            </Row>

            <Row gutter={20}>

            <Col span={8}>
              <Form.Item label="Type of Asset" name="type_of_asset">
                <Select>
                  <Select.Option value="Tangible">Tangible</Select.Option>
                  <Select.Option value="In-Tangible">In-Tangible</Select.Option>
                </Select>
              </Form.Item>
              </Col>

              <Col span={8}>
              <Form.Item label="Asset Categories" name="asset_categories">
                <Select>
                  <Select.Option value="Computer and Printers">
                    Computer and Printers
                  </Select.Option>
                  <Select.Option value="Computer and Software">
                    Computer and Software
                  </Select.Option>
                  <Select.Option value="Furniture and Fixtures">
                    Furniture and Fixtures
                  </Select.Option>
                  <Select.Option value="Motor Vehicles ">
                    Motor Vehicles{" "}
                  </Select.Option>
                  <Select.Option value="Office Equipments">
                    Office Equipments
                  </Select.Option>
                  <Select.Option value="Plant & Machinery">
                    Plant & Machinery
                  </Select.Option>
                  <Select.Option value="Temporary Construction">
                    Temporary Construction
                  </Select.Option>
                </Select>
              </Form.Item>
              </Col>

              <Col span={8}>
              <Form.Item label="Asset Id" name="asset_id">
                <Input type="text" placeholder="Asset Id" />
              </Form.Item>
              </Col>
              

            </Row>
            <Row gutter={20}>

            <Col span={8} >
              <Form.Item label="Asset Name" name="asset_name">
                <Input type="text" placeholder="Asset Name" />
              </Form.Item>
              </Col>
           
              <Col span={8}>
              <Form.Item label="Use Date" name="use_date">
                <Input type="date" placeholder="Date of Use" />
              </Form.Item>
              </Col>

              <Col span={8}>
              <Form.Item label="Cost Of Acquisition" name="cost_of_acquisition">
                <Input placeholder="Enter Total bill amount" />
              </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={20}>
              
              <Col span={8}>
              <Form.Item label="Warranty" name="warranty">
                <Select>
                  <Select.Option value="Yes">Yes</Select.Option>
                  <Select.Option value="No">No</Select.Option>
                </Select>
              </Form.Item>
              </Col>

              <Col span={8}>
              <Form.Item label="Warranty Information" name="warranty_info">
                <Input type="text" placeholder="Warranty Information" />
              </Form.Item>
              </Col>

              <Col span={8}>
              <Form.Item label="Salvage value" name="salvage_value">
                <Input placeholder="Salvage value" />
              </Form.Item>
              </Col>
            </Row>

            <Row gutter={20}>
              
              <Col span={8}>
              <Form.Item label="UseFull Life" name="usefull_life">
                <Input type="text" placeholder="UseFull Life" suffix="Year" />
              </Form.Item>
              </Col>

              <Col span={8}>
              <Form.Item label="Asset Status" name="asset_status">
              <Select>
             <Select.Option value="Active">Active</Select.Option>
             <Select.Option value="InActive">In Active</Select.Option>
             </Select> 
            </Form.Item>
            </Col>

            <Col span={8}>
             <Form.Item  label="Manufacturer Name" name = "manufacturer">
            <Input type="text"placeholder="Manufacturer Name"/>
            </Form.Item>
            </Col>

            </Row>

            <Row gutter={20}>

            <Col span={8}>
            <Form.Item label="Serial Number" name='serial_number'>
              <Input type="text" placeholder="Serial Number"/>
            </Form.Item>
            </Col>

            <Col span={8}>
            <Form.Item label="Technical Contact" name="technical_contact">
              <Input  type="text" placeholder="Technical Contact" prefix="+91"/>
            </Form.Item>
            </Col>

            <Col span={8}>
            <Form.Item label="Location" name="location">
              <Input  type="text" placeholder="Location"/>
            </Form.Item>
            </Col>

            </Row>
          
            <Row gutter={20}>

            <Col span={8}>            
            <Form.Item label="Responsible Department" name="responsible_department">
          <Select  >
          <Select.Option value="Hr">HR</Select.Option>
          <Select.Option value="Finance">Finance</Select.Option>
          <Select.Option value="IT">IT</Select.Option>
          <Select.Option value="Accounts">Accounts</Select.Option>
          <Select.Option value="Legal">Legal</Select.Option>
          <Select.Option value="Production">Production</Select.Option>
          <Select.Option value="R&D">R&D</Select.Option>
          <Select.Option value="Quality">Quality</Select.Option>
          <Select.Option value="Maintenance">Maintenance</Select.Option>
          <Select.Option value="Admin">Admin</Select.Option>
          </Select>
            </Form.Item>
            </Col>

            <Col span={8}>
            <Form.Item label="Contact Person" name="contact_person">
              <Input type="text" placeholder="Contact Person"/>
            </Form.Item>
            </Col>

            <Col span={8}>
            <Form.Item label="Contact Number" name="contact_number">
              <Input  type="text" placeholder="Contact Number" prefix="+91"/>
            </Form.Item>
            </Col>
            </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default SidebarForm;
