import { Button, Col, Form, Input, Row, Upload } from "antd";
import UploadDocs from "../../Store/MaterialIn/MaterialInWithPO/UploadDocs";

export default function SingleProduct({
  index,
  field,
  fields,
  add,
  remove,
  form,
  setFiles,
  files,
  // allTdsOptions,
  // tdsArray,
  // optionState,
  // setOptionState,
}) {
  console.log("Upload event:");
  const component =
    Form.useWatch(["components", field.name, "component"], form) ?? 0;
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <Row
      style={{
        // background: "#f5f5f58f",
        padding: "5px 15px",
        borderRadius: 10,
        marginTop: 5,
        maxHeight: "50%",
        height: "50%",
        overflowY: "scroll",
      }}
      gutter={[6, 10]}
      key={field.key}
    >
      <Col span={6}>
        {" "}
        <Form.Item label="Document Name" name={[field.name, "documentName"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item
          name={[field.name, "file"]}
          label="Upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false} name="logo">
            <Button>Click to upload</Button>
          </Upload>
        </Form.Item>
        {/* <Form.Item
          label="File"
          name={[field.name, "file"]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <UploadDocs setFiles={setFiles} files={files} />

        </Form.Item> */}
      </Col>
      <Col span={12}>
        <Row justify="end" align="middle" style={{ height: "100%" }}>
          {fields.length > 1 && (
            <Button
              onClick={() => remove(field.name)}
              danger
              type="text"
              size="small"
            >
              - Remove Document
            </Button>
          )}
          <Button size="small" type="link" onClick={() => add()}>
            + Add Document
          </Button>
        </Row>
      </Col>
    </Row>
  );
}
const gstRateOptions = [
  { value: "0", text: "00%" },
  { value: "5", text: "05%" },
  { value: "12", text: "12%" },
  { value: "18", text: "18%" },
  { value: "28", text: "28%" },
];
