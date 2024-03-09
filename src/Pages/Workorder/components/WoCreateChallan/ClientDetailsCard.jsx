import {
  Card,
  Form,
  Input,
  Col,
  Row,
  Radio,
  Button,
  Space,
  Typography,
} from "antd";
import React from "react";
import MySelect from "../../../../Components/MySelect";
import UploadFile from "../../../Master/Bom/CreateBom/UploadFile";
///
const ClientDetailsCard = ({
  setUploadType,
  uplaodType,
  uploadTypeOptions,
  toggleInputType,
  submitHandler,
  validateHandler,
  stage,
  previewuploaData,
  rtnchallan,
}) => {
  return (
    <Col span={24}>
      <Card size="small" title="Client Details">
        {rtnchallan ? (
          ""
        ) : (
          <Col span={24}>
            <Radio.Group
              onChange={toggleInputType}
              value={uplaodType}
              options={uploadTypeOptions}
            />
            {/* </Form.Item> */}
          </Col>
        )}

        <Form.Item
          name="clientname"
          label="Client Name"
          rules={[{ required: true, message: "Please select Client!" }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="clientbranch"
          label="Client Branch"
          rules={[{ required: false, message: "Please select client branch!" }]}
        >
          <Input disabled />
        </Form.Item>
        {uplaodType === "table" && (
          <>
            <Row gutter={6}>
              <Col span={12}>
                <Form.Item
                  name="nature"
                  label="E-way Bill Number"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please input Nature of processing!",
                  //   },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="pd" label="Ship Doc. Number">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="vn"
              label="Vehicle Number"
              // rules={[{ required: true, message: "Please input Vechile Number!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="or" label="Other References">
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="Client Address"
              rules={[
                { required: false, message: "Please input select address!" },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </>
        )}
        {uplaodType === "file" && (
          <Col span={24} style={{ marginBottom: 10 }}>
            <Typography.Text type="secondary" strong>
              Note: <br />
              Kindly don't do any changes with columns of the sample file, it
              can lead to errors.
            </Typography.Text>
          </Col>
        )}
        {uplaodType === "file" && (
          <>
            {" "}
            <Col span={24}>
              <UploadFile rules={rules.file} />
            </Col>
            <Col span={24}>
              <Row justify="end">
                <Space>
                  {uplaodType === "file" && (
                    <Button
                      href="https://media.mscorpres.net/oakterIms/other/shipment_sample.csv
"
                      type="link"
                    >
                      Download Sample File
                    </Button>
                  )}
                  <Button
                    onClick={previewuploaData}
                    // loading={loading === "submit"}
                    type="primary"
                  >
                    Preview
                  </Button>
                </Space>
              </Row>
            </Col>
          </>
        )}
      </Card>
    </Col>
  );
};

export default ClientDetailsCard;
const rules = {
  file: [
    {
      required: true,
      message: "Please select a file to upload",
    },
  ],
};
