import { Card, Col, Form, Input, Row } from "antd";
import MyAsyncSelect from "../../../../../../Components/MyAsyncSelect";
import MySelect from "../../../../../../Components/MySelect";
import SingleDatePicker from "../../../../../../Components/SingleDatePicker";

const ClientDetailsSection = ({
  challanForm,
  asyncOptions,
  setAsyncOptions,
  getClientOptions,
  getclientDetials,
  ClientBranchOptions,
  getAddInfo,
  uplaodType,
  editScrapeChallan,
}) => (
  <Col span={24}>
    <Card size="small" title="Client Details">
      <Form.Item
        name="clientname"
        label="Client Name"
        rules={[{ required: true, message: "Please select Client!" }]}
      >
        <MyAsyncSelect
          size="default"
          labelInValue
          onBlur={() => setAsyncOptions([])}
          optionsState={asyncOptions}
          loadOptions={getClientOptions}
          onChange={(value) => getclientDetials(value.value)}
        />
      </Form.Item>
      <Form.Item
        name="clientbranch"
        label="Client Branch"
        rules={[{ required: true, message: "Please select client branch!" }]}
      >
        <MySelect
          options={ClientBranchOptions}
          onChange={(e) => getAddInfo(e)}
          size="default"
          placeholder="Select Client Branch!"
        />
      </Form.Item>
      {uplaodType === "table" && (
        <>
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item name="nature" label="E-way Bill Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pd" label="Ship Doc. Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="vn" label="Vehicle Number">
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
            <Input />
          </Form.Item>
          {!editScrapeChallan && (
            <Form.Item
              label="Insert Date"
              name="insertDate"
              rules={[
                { required: true, message: "Please Enter Insert Date" },
              ]}
            >
              <SingleDatePicker
                setDate={(value) =>
                  challanForm.setFieldValue("insertDate", value)
                }
              />
            </Form.Item>
          )}
        </>
      )}
    </Card>
  </Col>
);

export default ClientDetailsSection;
