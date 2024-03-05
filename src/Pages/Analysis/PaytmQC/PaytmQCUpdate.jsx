import React, { useState, useEffect } from "react";
import Input from "antd/lib/input/Input";
import { Button, Col, Drawer, Form, Modal, Row } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";
import validateResponse from "../../../Components/validateResponse";

export default function PaytmQCUpdate({ setUpdatingQC, updatingQC, getRows }) {
  const [imeiNumber, setImeiNumber] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [qcData, setQCData] = useState({});
  const [resetQcData, setResetQCData] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const defectsTypeOptions = [
    { text: "Vendor", value: "V" },
    { text: "Manufacturing", value: "M" },
  ];
  const actialProblemsOptions = [
    {
      value: "Battery connector wire not fixed",
      text: "Battery connector wire not fixed",
    },
    { value: "Battery Damaged", text: "Battery Damaged" },
    { value: "Battery Discharged", text: "Battery Discharged" },
    { value: "Body Scratched", text: "Body Scratched" },
    { value: "Capacitor broken in PCB", text: "Capacitor broken in PCB" },
    { value: "Device not ON", text: "Device not ON" },
    { value: "Extra Grommet", text: "Extra Grommet" },
    { value: "Extra Screw", text: "Extra Screw" },
    { value: "Green Light Issue in PCB", text: "Green Light Issue in PCB" },
    { value: "Grommet Not Proper Fixed", text: "Grommet Not Proper Fixed" },
    {
      value: "Helpdesk Sticker was not proper fitment",
      text: "Helpdesk Sticker was not proper fitment",
    },
    { value: "IMEI Number Scratched", text: "IMEI Number Scratched" },
    {
      value: "Keypad Key Not Proper Fixed",
      text: "Keypad Key Not Proper Fixed",
    },
    { value: "LED Pipe Missed", text: "LED Pipe Missed" },
    { value: "Metal Blade Damaged", text: "Metal Blade Damaged" },
    { value: "Molding Problem", text: "Molding Problem" },
    { value: "Network problem in PCB", text: "Network problem in PCB" },
    { value: "Paytm sticker scratched", text: "Paytm sticker scratched" },
    { value: "PCB Not Proper Fixed", text: "PCB Not Proper Fixed" },
    { value: "PCB Problem", text: "PCB Problem" },
    { value: "Power On/Off Button broken", text: "Power On/Off Button broken" },
    { value: "QR Broken", text: "QR Broken" },
    { value: "SD Card Not Proper Fixed", text: "SD Card Not Proper Fixed" },
    { value: "Side Gapping", text: "Side Gapping" },
    { value: "Sim Jack Broken", text: "Sim Jack Broken" },
    { value: "Sim lock Missed", text: "Sim lock Missed" },
    { value: "Sim lock not fixed", text: "Sim lock not fixed" },
    { value: "Sound Problem", text: "Sound Problem" },
    { value: "Speaker Closer Damaged", text: "Speaker Closer Damaged" },
    {
      value: "Speaker connector not proper fitment",
      text: "Speaker connector not proper fitment",
    },
    { value: "Speaker Damaged", text: "Speaker Damaged" },
    { value: "Speaker not proper fixed", text: "Speaker not proper fixed" },
    { value: "Speaker Wire not Connected", text: "Speaker Wire not Connected" },
    { value: "USB Jack Broken", text: "USB Jack Broken" },
    { value: "USB jack not fixed", text: "USB jack not fixed" },
    { value: "Validation fail", text: "Validation fail" },
  ];
  const correctionOptions = [
    { value: "Battery Changed", text: "Battery Changed" },
    { value: "Battery Re-charge", text: "Battery Re-charge" },
    { value: "Button Changed", text: "Button Changed" },
    { value: "Frontcloser Changed", text: "Frontcloser Changed" },
    { value: "Grommet Proper Fitment", text: "Grommet Proper Fitment" },
    { value: "Grommet Removed", text: "Grommet Removed" },
    { value: "Maincloser Changed", text: "Maincloser Changed" },
    { value: "Metal Blade Changed", text: "Metal Blade Changed" },
    { value: "Molding Problem", text: "Molding Problem" },
    { value: "Paytm Sticker Changed", text: "Paytm Sticker Changed" },
    { value: "Pin Removed", text: "Pin Removed" },
    { value: "Pipe Fitment", text: "Pipe Fitment" },
    { value: "Proper fitment", text: "Proper fitment" },
    { value: "Restart", text: "Restart" },
    { value: "Screw Removed", text: "Screw Removed" },
    { value: "SD Card Changed", text: "SD Card Changed" },
    { value: "SD Card Proper Fitment", text: "SD Card Proper Fitment" },
    { value: "Sim lock Fitment", text: "Sim lock Fitment" },
    { value: "Sim lock Proper Fitment", text: "Sim lock Proper Fitment" },
    { value: "Speaker Changed", text: "Speaker Changed" },
    { value: "Speaker Closer Changed", text: "Speaker Closer Changed" },
  ];
  const statusAfterCorrection = [
    { value: "NO", text: "Not OK" },
    { value: "NR", text: "Not Received" },
    { value: "OK", text: "OK" },
    { value: "P", text: "Pending" },
  ];
  const getSearchResults = async () => {
    setSearchLoading(true);
    const { data } = await imsAxios.post("/paytmQc/editPaytmQc", {
      imei_no: updatingQC,
    });
    setSearchLoading(false);
    if (data.code == 200) {
      setQCData(data.data);
      setResetQCData(data.data);
    } else {
      toast.error(data.message.msg);
    }
  };
  const validateData = () => {
    if (!qcData.imei_no || qcData.imei_no == "") {
      return toast.error("Please Provide IMEI Number");
    } else if (!qcData.defects_type || qcData.defects_type == "") {
      return toast.error("Please select a defect type");
    } else if (!qcData.actual_problems || qcData.actual_problems == "") {
      return toast.error("Please select the actual problem");
    } else if (!qcData.correction_by || qcData.correction_by == "") {
      return toast.error("Please select the correction action performed");
    } else if (!qcData.correction_by || qcData.correction_by == "") {
      return toast.error("Please select the status after correction");
    }
    let final = {
      imei_no: qcData.imei_no,
      defects_type: qcData.defects_type,
      actual_problems: qcData.actual_problems,
      correction_by: qcData.correction_by,
      after_correction_status: qcData.after_correction_status,
      remark: qcData.remark,
    };
    setShowSubmitConfirm(final);
  };
  const updateFunction = async () => {
    if (showSubmitConfirm) {
      setSubmitLoading(true);
      const { data } = await imsAxios.post(
        "/paytmQc/updatePaytmQc",
        showSubmitConfirm
      );
      setSubmitLoading(false);
      setShowSubmitConfirm(false);
      const validateData = validateResponse(data);
      toast.success(validateData.message);
      setUpdatingQC(false);
      getRows();
    }
  };

  const inputHandler = (name, value) => {
    let obj = qcData;
    obj = {
      ...obj,
      [name]: value,
    };
    setQCData(obj);
  };
  const resetFunction = () => {
    setQCData(resetQcData);
    setShowResetConfirm(false);
  };
  useEffect(() => {
    if (updatingQC) {
      console.log(getSearchResults);
      getSearchResults();
    }
  }, [updatingQC]);
  return (
    <Drawer
      onClose={() => setUpdatingQC(false)}
      open={updatingQC}
      title={`Update Paytm QC Record IMEI: ${updatingQC}`}
      width="40vw"
    >
      {/* reset confirm modal */}
      <Modal
        title="Confirm Reset!"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to reset details of this Paytm QC Analysis?</p>
      </Modal>
      {/* submit confirm modal */}
      <Modal
        title="Confirm Update!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={updateFunction}
          >
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to update this Paytm QC Analysis?</p>
      </Modal>

      <div style={{ padding: "0px 10px", height: "100%" }}>
        <Form size="small" layout="vertical">
          <Col span={24}>
            <Row gutter={4}>
              <Col span={12}>
                <Form.Item label="QC Result">
                  <Input disabled value={qcData?.qc_result} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Category">
                  <Input disabled value={qcData?.category} />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row gutter={4}>
              <Col span={12}>
                <Form.Item label=" Issue Observe">
                  <Input disabled value={qcData?.issue_observe} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="SKU Code">
                  <Input value={qcData?.sku_code} />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row gutter={4}>
              <Col span={12}>
                <Form.Item label="Device Type">
                  <Input disabled value={qcData?.device_type} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Reason of accurance">
                  <Input
                    value={qcData?.remark}
                    onChange={(e) => {
                      inputHandler("remark", e.target.value);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row gutter={4}>
              <Col span={12}>
                <Form.Item label="Defect Type">
                  <MySelect
                    options={defectsTypeOptions}
                    value={qcData.defects_type}
                    onChange={(value) => inputHandler("defects_type", value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Actual Problem">
                  <MySelect
                    options={actialProblemsOptions}
                    value={qcData?.actual_problems}
                    onChange={(value) => inputHandler("actual_problems", value)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row gutter={4}>
              <Col span={12}>
                <Form.Item label="Correction by RIOT">
                  <MySelect
                    options={correctionOptions}
                    value={qcData?.correction_by}
                    onChange={(value) => inputHandler("correction_by", value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Status after Correction">
                  <MySelect
                    options={statusAfterCorrection}
                    onChange={(value) =>
                      inputHandler("after_correction_status", value)
                    }
                    value={qcData?.after_correction_status}
                    // onChange={(value) =>
                    //   inputHandler("after_correction_status", value)
                    // }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={23}>
            <Row gutter={8} justify="end">
              <Col>
                <Button
                  size="default"
                  onClick={() => setShowResetConfirm(true)}
                >
                  Reset
                </Button>
              </Col>
              <Col>
                <Button type="primary" size="default" onClick={validateData}>
                  Update
                </Button>
              </Col>
            </Row>
          </Col>
        </Form>
      </div>
    </Drawer>
  );
}
