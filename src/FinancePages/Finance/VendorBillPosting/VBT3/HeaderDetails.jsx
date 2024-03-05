import MySelect from "../../../../Components/MySelect";
import { Button, Card, Checkbox, Col, Form, Input, Row, Tooltip } from "antd";
import InputMask from "react-input-mask";
import { CalculatorOutlined } from "@ant-design/icons";

function HeaderDetails({
  setVendorData,
  vendorData,
  calculateOtherValues,
  addFreightCalc,
  setAddFreightCalc,
  setAddInsuranceCalc,
  addInsuranceCalc,
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
    <Card size="small" title="VBT3 Import">
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
                    name="due_date[]"
                    value={vendorData?.effective_date}
                    onChange={(e) =>
                      vendorInputHandler("effective_date", e.target.value)
                    }
                    className="input-date"
                    mask="99-99-9999"
                    placeholder="__-__-____"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <Col span={24}>
          <Form.Item label="Invoice Number">
            <Input
              size="default"
              name="termscondition"
              value={vendorData?.invoice_id}
              onChange={(e) => vendorInputHandler("invoice_id", e.target.value)}
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
          <Checkbox
            checked={addFreightCalc}
            onChange={(e) => setAddFreightCalc(e.target.checked)}
          >
            Enable Add Freight
          </Checkbox>
        </Col>
        <Col span={24}>
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item label="Freight">
                <Input
                  size="default"
                  name="totalFreight"
                  value={vendorData?.totalFreight}
                  suffix={
                    <Tooltip title="Calculate Freight Charges">
                      <Button
                        size="small"
                        type="text"
                        onClick={() => calculateOtherValues("freight")}
                        icon={<CalculatorOutlined />}
                      />
                    </Tooltip>
                  }
                  onChange={(e) =>
                    vendorInputHandler("totalFreight", e.target.value)
                  }
                  style={{ paddingRight: 0 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Misc.">
                <Input
                  size="default"
                  name="totalMisc"
                  value={vendorData?.totalMisc}
                  onChange={(e) =>
                    vendorInputHandler("totalMisc", e.target.value)
                  }
                  suffix={
                    <Tooltip title="Calculate Misc. Charges">
                      <Button
                        size="small"
                        type="text"
                        onClick={() => calculateOtherValues("misc")}
                        icon={<CalculatorOutlined />}
                      />
                    </Tooltip>
                  }
                  style={{ paddingRight: 0 }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Checkbox
                checked={addInsuranceCalc}
                onChange={(e) => setAddInsuranceCalc(e.target.checked)}
              >
                Enable Custom Insurance
              </Checkbox>
            </Col>
            {/* {addInsuranceCalc && ( */}
            <Col style={{ margin: "10px 0px" }} span={24}>
              <Input
                disabled={!addInsuranceCalc}
                value={vendorData?.insuranceCharge}
                onChange={(e) =>
                  vendorInputHandler("insuranceCharge", e.target.value)
                }
                suffix={
                  <Tooltip title="Calculate Insurance Charges">
                    <Button
                      size="small"
                      type="text"
                      onClick={() => calculateOtherValues("insuranceCharge")}
                      icon={<CalculatorOutlined />}
                    />
                  </Tooltip>
                }
              />
            </Col>
            {/* )} */}
          </Row>
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
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item label="Port Code">
                <Input
                  size="default"
                  name="port_code"
                  value={vendorData?.port_code}
                  onChange={(e) =>
                    vendorInputHandler("port_code", e.target.value)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Port Name">
                <Input
                  size="default"
                  name="port_name"
                  value={vendorData?.port_name}
                  onChange={(e) =>
                    vendorInputHandler("port_name", e.target.value)
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item label="BOE Date">
                <InputMask
                  name="boe_date"
                  value={vendorData?.boe_date}
                  onChange={(e) =>
                    vendorInputHandler("boe_date", e.target.value)
                  }
                  className="input-date"
                  mask="99-99-9999"
                  placeholder="__-__-____"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="BOE No.">
                <Input
                  size="default"
                  name="boe_no"
                  value={vendorData?.boe_no}
                  onChange={(e) => vendorInputHandler("boe_no", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item label="HAWB No.">
                <Input
                  size="default"
                  name="hawb_no"
                  value={vendorData?.hawb_no}
                  onChange={(e) =>
                    vendorInputHandler("hawb_no", e.target.value)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="MAWB No.">
                <Input
                  size="default"
                  name="mawb_no"
                  value={vendorData?.mawb_no}
                  onChange={(e) =>
                    vendorInputHandler("mawb_no", e.target.value)
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Form.Item label="CHA">
            <Input
              size="default"
              name="cha"
              value={vendorData?.cha}
              onChange={(e) => vendorInputHandler("cha", e.target.value)}
            />
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
        {/* <Col span={24}>
    <Form.Item
      label={
        <span
          style={{
            fontSize: window.innerWidth < 1600 && "0.7rem",
          }}
        >
          Round Off
        </span>
      }
    >
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
  </Col> */}
      </Form>
    </Card>
  );
}

export default HeaderDetails;
