import { useEffect, useState } from "react";
import {
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import SingleDatePicker from "../../../Components/SingleDatePicker";

const HeaderDetails = ({
  vendorDetails,
  components,
  roundOffSign,
  setRoundOffSign,
  roundOffValue,
  setRoundOffValue,
  form,
  addRateDiff,
  setAddRateDiff,
}) => {
  const [taxDetails, setTaxDetails] = useState([]);
  useEffect(() => {
    const value = components?.reduce(
      (a, b) => a + +Number(b.value).toFixed(3),
      0
    );
    const cgst = components?.reduce(
      (a, b) => a + +Number(b.cgst).toFixed(3),
      0
    );
    const sgst = components?.reduce(
      (a, b) => a + +Number(b.sgst).toFixed(3),
      0
    );
    const igst = components?.reduce(
      (a, b) => a + +Number(b.igst).toFixed(3),
      0
    );
    const freight = components?.reduce(
      (a, b) => a + +Number(b.freight).toFixed(3),
      0
    );
    const tds = components?.reduce(
      (a, b) => a + +Number(b.tdsAmount ?? 0).toFixed(3),
      0
    );
    let vendorAmount = components?.reduce(
      (a, b) => a + +Number(b.vendorAmount).toFixed(3),
      0
    );
    if (roundOffSign === "+") {
      vendorAmount = vendorAmount + +Number(roundOffValue).toFixed(3);
    } else {
      vendorAmount = vendorAmount - +Number(roundOffValue).toFixed(3);
    }
    vendorAmount = +Number(vendorAmount).toFixed(3);
    setTaxDetails([
      { name: "Total Value", value: value },
      { name: "Freight", value: freight },
      { name: "CGST", value: cgst },
      { name: "SGST", value: sgst },
      { name: "IGST", value: igst },
      { name: "TDS", value: tds },
      {
        name: "Round Off",
        value: `${roundOffSign} ${roundOffValue === "" ? 0 : roundOffValue}`,
      },
      { name: "Vendor Amount", value: vendorAmount },
    ]);
  }, [components, roundOffValue, roundOffSign]);
  return (
    <Row gutter={[0, 6]}>
      {/* header details input */}
      <Col span={24}>
        <Card size="small" title="Header Details">
          <Form.Item
            rules={formRules.effectiveDate}
            name="effectiveDate"
            label="Effective Date"
          >
            <SingleDatePicker
              setDate={(value) => form.setFieldValue("effectiveDate", value)}
            />
          </Form.Item>
          <Form.Item name="comment" rules={formRules.comments} label="Comments">
            <Input.TextArea />
          </Form.Item>
          <Typography.Text style={{ fontSize: "0.8rem" }}>
            Round Off
          </Typography.Text>
          <div style={{ display: "flex" }}>
            <div style={{ width: 40 }}>
              <RoundOffSelect
                roundOffSign={roundOffSign}
                setRoundOffSign={setRoundOffSign}
              />
            </div>
            <Input
              value={roundOffValue}
              onChange={(e) => setRoundOffValue(e.target.value)}
            />
          </div>
        
        </Card>
      </Col>

      {/* tax details */}
      <Col span={24}>
        <Card size="small">
          <Row>
            {taxDetails.map((row) => (
              <Col span={24}>
                <Row>
                  <Col span={12}>
                    <Typography.Text
                      strong
                      level={5}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {row.name}
                    </Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Row justify="end">
                      <Typography.Text style={{ fontSize: "0.8rem" }} level={5}>
                        {row.value}
                      </Typography.Text>
                    </Row>
                  </Col>
                  <Divider style={{ marginBottom: 5, marginTop: 5 }} />
                </Row>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      {/* vendor details */}
      <Col span={24}>
        <Card size="small">
          <Row>
            <Col span={24}>
              <Typography.Text strong level={5} style={{ fontSize: "0.8rem" }}>
                Vendor Name
              </Typography.Text>
            </Col>
            <Divider style={{ marginBottom: 5, marginTop: 5 }} />
            <Col span={24}>
              <Typography.Text style={{ fontSize: "0.8rem" }} level={5}>
                {vendorDetails.name}
              </Typography.Text>
            </Col>
            <Divider style={{ marginBottom: 5, marginTop: 5 }} />
            <Col span={24}>
              <Typography.Text style={{ fontSize: "0.8rem" }} strong level={5}>
                GSTN
              </Typography.Text>
            </Col>
            <Divider style={{ marginBottom: 5, marginTop: 5 }} />
            <Col span={24}>
              <Typography.Text style={{ fontSize: "0.8rem" }} level={5}>
                {vendorDetails.gstin}
              </Typography.Text>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

// form rules
const formRules = {
  effectiveDate: [
    { required: true, message: "Please select an effective Date." },
  ],
  comments: [{ required: true, message: "Please mentaion comment." }],
};
export default HeaderDetails;

const RoundOffSelect = ({ roundOffSign, setRoundOffSign }) => {
  return (
    <select
      style={{
        height: 30,
        border: "1px lightgray solid",
        borderRadius: 5,
        outline: "none",
      }}
      value={roundOffSign}
      onInput={(value) => setRoundOffSign(value.target.value)}
    >
      <option value="+">+</option>
      <option value="-">-</option>
    </select>
  );
};
