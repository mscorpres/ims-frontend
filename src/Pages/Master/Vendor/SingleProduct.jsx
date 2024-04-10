import { Button, Col, Form, Input, Row } from "antd";
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
  const component =
    Form.useWatch(["components", field.name, "component"], form) ?? 0;
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  let a = normFile;
  console.log("norma", a);

  return (
    <Row
      style={{
        // background: "#f5f5f58f",
        padding: "5px 15px",
        borderRadius: 10,
        marginTop: 5,
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
          label="File"
          name={[field.name, "file"]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <UploadDocs setFiles={setFiles} files={files} />
        </Form.Item>
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
              - Remove Component
            </Button>
          )}
          <Button size="small" type="link" onClick={() => add()}>
            + Add Component
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
