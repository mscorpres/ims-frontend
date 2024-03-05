import MySelect from "../../../../Components/MySelect";
import { Card, Col, Form, Input, Row } from "antd";
import InputMask from "react-input-mask";

function HeaderDetails({
  vendorData,
  setVendorData,
  setRoundOffSign,
  roundOffValue,
  setRoundOffValue,
}) {
  const vendorInputHandler = (name, value) => {
    if (name == "invoice_date") {
      let com = vendorData.comment;
      com = com.replaceAll(" dt " + vendorData.invoice_date, " dt " + value);
      setVendorData((vendorData) => {
        return {
          ...vendorData,
          comment: com,
          [name]: value,
        };
      });
    } else if (name == "bill_amount") {
      let com = vendorData.comment;
      com = com.replaceAll(" amt " + vendorData.bill_amount, " amt " + value);

      console.log(value);
      setVendorData((vendorData) => {
        return {
          ...vendorData,
          comment: com,
          [name]: value,
        };
      });
    }
    setVendorData((vendorData) => {
      return {
        ...vendorData,
        [name]: value,
      };
    });
    setVendorData((vendorData) => {
      return {
        ...vendorData,
        [name]: value,
      };
    });
  };
  return (
    <Card size="small" title="VBT1 Purchase to Goods">
      <Form layout="vertical">
        <Row>
          <Col span={24}>
            <Row gutter={4}>
              <Col span={12}>
                <Form.Item label="Invoice Date">
                  <InputMask
                    name="due_date[]"
                    value={vendorData?.invoice_date}
                    onChange={(e) =>
                      vendorInputHandler("invoice_date", e.target.value)
                    }
                    className="input-date"
                    mask="99-99-9999"
                    placeholder="__-__-____"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Effective Date">
                  <InputMask
                    value={vendorData?.effective_date}
                    onChange={(e) =>
                      vendorInputHandler("effective_date", e.target.value)
                    }
                    className="date-text-input"
                    mask="99-99-9999"
                    placeholder="__-__-____"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Form.Item label="Invoice Number">
              <Input
                size="default"
                name="termscondition"
                value={vendorData?.invoice_id}
                onChange={(e) =>
                  vendorInputHandler("invoice_id", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Bill Amount">
              <Input
                size="default"
                name="termscondition"
                value={vendorData?.bill_amount}
                onChange={(e) =>
                  vendorInputHandler("bill_amount", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="GSTIN Number">
              <MySelect
                options={vendorData?.gstinOptions}
                value={vendorData?.vbt_gstin}
                onChange={(value) => {
                  vendorInputHandler("vbt_gstin", value);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label=" Round Off">
              <div style={{ display: "flex" }}>
                <select onChange={(e) => setRoundOffSign(e.target.value)}>
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                <Input
                  size="default"
                  name="termscondition"
                  value={roundOffValue}
                  onChange={(e) => setRoundOffValue(e.target.value)}
                  placeholder="0"
                />
              </div>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Comments">
              <Input.TextArea
                rows={4}
                size="default"
                name="termscondition"
                value={vendorData?.comment}
                onChange={(e) => vendorInputHandler("comment", e.target.value)}
                placeholder="Comments"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Vendor Address">
              <Input.TextArea
                rows={4}
                size="default"
                name="termscondition"
                value={vendorData?.in_vendor_addr?.replaceAll("<br>", " ")}
                onChange={(e) =>
                  vendorInputHandler("in_vendor_addr", e.target.value)
                }
                placeholder="Vendor Address"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default HeaderDetails;
