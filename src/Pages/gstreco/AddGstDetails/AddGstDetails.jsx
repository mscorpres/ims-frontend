import React, { useState } from "react";
import { Button, Form, Input, Space, Select, Upload } from "antd";
import {  Divider } from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Row, Col } from "antd";
import { CheckOutlined, UploadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";

const { Option } = Select;

const AddGstDetails = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("uploadfile", fileList[0]);

    setUploading(true);

    try {
      const response = await imsAxios.post(`/gst/uploadgstfile`, formData);

      if (response.status === 201) {
        setFileList([]);
        toast.success("Upload successful.");
      } else {
        toast.error("Upload failed.");
      }
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await imsAxios.post(`/gst/postgstdata`, formData);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        gstForm.resetFields();
      } else {
        toast.error(" Error in submitted Form!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [gstForm] = Form.useForm();

  return (
    <>
      <Col style={{ paddingLeft: "20px", paddingRight: "20px" }}>
        <hr style={{ border: "1px solid #D3D3D3" , marginTop:"10px", marginBottom:'10px' }} />

        <Form
          form={gstForm}
          name="validateOnly"
          layout="vertical"
          autoComplete="off"
          onFinish={handleFormSubmit}
        >
          <Row gutter={[10, 10]}>
            <Col span={4}>
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
                  <Option value="Jan">Jan</Option>
                  <Option value="Feb">Feb</Option>
                  <Option value="Mar">Mar</Option>
                  <Option value="Apr">Apr</Option>
                  <Option value="May">May</Option>
                  <Option value="Jun">Jun</Option>
                  <Option value="Jul">Jul</Option>
                  <Option value="Aug">Aug</Option>
                  <Option value="Sept">Sept</Option>
                  <Option value="Oct">Oct</Option>
                  <Option value="Nov">Nov</Option>
                  <Option value="Dec">Dec</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
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
            <Col span={5}>
              <Form.Item
                name="Suppliername"
                label="Supplier Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter suppliername" />
              </Form.Item>
            </Col>

            <Col span={5}>
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

            <Col span={5}>
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
          </Row>

          <Row gutter={[10, 10]}>
            <Col span={4}>
              <Form.Item
                name="InvoiceDate"
                label="Invoice Date"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input type="date" placeholder="Enter Invoice Date" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                name="InvoiceValue"
                label="Invoice Value"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter Invoice Value" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                name="PlaceOfSupply"
                label="Place of Supply"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter Place of Supply" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                name="RateOfTax"
                label="Rate of Tax"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter Rate of Tax" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name="TaxableValue"
                label="Taxable Value"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter Taxable Value" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10}>
            <Col span={4}>
              <Form.Item
                name="IGST"
                label="IGST "
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter IGST" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                name="CGST"
                label="CGST"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter CGST" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                name="SGST"
                label="SGST"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Enter SGST" />
              </Form.Item>
            </Col>
          </Row>

          <Row style={{ justifyContent: "right" }}>
            <Col>
              <Form.Item>
                <Space>
                  <Button
                    htmlType="reset"
                    style={{ color: "#04B0A8", borderColor: "#04B0A8" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.52754 0.204726C3.65863 0.335983 3.73227 0.513906 3.73227 0.699415C3.73227 0.884924 3.65863 1.06285 3.52754 1.1941L2.38882 2.33282H8.16641C9.32018 2.33282 10.448 2.67495 11.4074 3.31596C12.3667 3.95696 13.1144 4.86804 13.5559 5.93399C13.9975 6.99994 14.113 8.17288 13.8879 9.30449C13.6628 10.4361 13.1072 11.4755 12.2914 12.2914C11.4755 13.1072 10.4361 13.6628 9.30449 13.8879C8.17288 14.113 6.99994 13.9975 5.93399 13.5559C4.86804 13.1144 3.95696 12.3667 3.31596 11.4074C2.67495 10.448 2.33282 9.32018 2.33282 8.16641C2.33282 7.98075 2.40657 7.80269 2.53785 7.67141C2.66914 7.54013 2.84719 7.46638 3.03285 7.46638C3.21851 7.46638 3.39657 7.54013 3.52785 7.67141C3.65913 7.80269 3.73288 7.98075 3.73288 8.16641C3.73288 9.04328 3.9929 9.90046 4.48007 10.6295C4.96723 11.3586 5.65965 11.9269 6.46977 12.2625C7.27989 12.598 8.17133 12.6858 9.03135 12.5147C9.89137 12.3437 10.6813 11.9214 11.3014 11.3014C11.9214 10.6813 12.3437 9.89137 12.5147 9.03135C12.6858 8.17133 12.598 7.27989 12.2625 6.46977C11.9269 5.65965 11.3586 4.96723 10.6295 4.48007C9.90046 3.9929 9.04328 3.73288 8.16641 3.73288H2.38882L3.52754 4.8716C3.65119 5.0043 3.71851 5.17982 3.71531 5.36117C3.71211 5.54253 3.63864 5.71556 3.51039 5.84382C3.38213 5.97208 3.20909 6.04555 3.02774 6.04875C2.84638 6.05195 2.67086 5.98463 2.53816 5.86097L0.204726 3.52754C0.0736335 3.39628 0 3.21836 0 3.03285C0 2.84734 0.0736335 2.66942 0.204726 2.53816L2.53816 0.204726C2.66942 0.0736335 2.84734 0 3.03285 0C3.21836 0 3.39628 0.0736335 3.52754 0.204726Z"
                        fill="#04B0A8"
                      />
                    </svg>
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ background: "#355958", color: "white" }}
                  >
                    <CheckOutlined /> Submit
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Col>
      <Col style={{paddingLeft: '20px', paddingRight:'20px'}}>
        <Divider>Or</Divider>
        <h3>Bulk GST Upload</h3>
        <div
          className="uploadgst-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Upload {...props}>
            <Button
              icon={<UploadOutlined />}
              style={{ width: "15rem ", height: "3rem" }}
            >
              Select File
            </Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{
              marginTop: "2rem",
              width: "15rem ",
              height: "3rem",
              background: "#355958",
              color: "white",
            }}
          >
            {uploading ? "Uploading" : "Start Upload"}
          </Button>
        </div>
      </Col>
    </>
  );
};

export default AddGstDetails;