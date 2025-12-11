import React from "react";
import { Row, Col, Card, Form, Typography } from "antd";
import MySelect from "../../Components/MySelect";
import SingleDatePicker from "../../Components/SingleDatePicker";
import MyButton from "../../Components/MyButton";
import { convertDate } from "../../utils/general.ts";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { downloadGSTReport } from "../../socketEvents/finance";
dayjs.extend(quarterOfYear);

const reportTypeOptions = [
  {
    text: "GSTR 1",
    value: "1",
  },
  {
    text: "GSTR 3B",
    value: "2",
  },
];

const datePickerTypeOptions = [
  {
    text: "Monthly",
    value: "month",
  },
  {
    text: "Quaterly",
    value: "quarter",
  },
  {
    text: "Yearly",
    value: "year",
  },
];

const initialValues = {
  reportType: "1",
  pickerType: "month",
};

const GstReport = () => {
  const [form] = Form.useForm();

  const pickerType = Form.useWatch("pickerType", form);

  const handleDownloadReport = async () => {
    let format = "DD-MM-YYYY";
    const values = await form.validateFields();
    let timePeriod = convertDate(values.timePeriod);

    let startDate = dayjs(timePeriod, format)
      .startOf(pickerType)
      .format(format);

    let endDate = dayjs(timePeriod, format).endOf(pickerType).format(format);

    const timeString = `${startDate}-${endDate}`;
    values.timePeriod = timeString;

    downloadGSTReport(values.reportType, values.timePeriod);
  };
  return (
    <Row

      style={{ height: "95%", padding: 10, paddingTop: 150 }}
    >
      <Col span={4}>
        <Card size="small">
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item
              name="reportType"
              label="Report"
              rules={rules.reportType}
            >
              <MySelect options={reportTypeOptions} />
            </Form.Item>
            <Form.Item
              name="pickerType"
              label="Time Period Selection"
              rules={rules.selectionType}
            >
              <MySelect options={datePickerTypeOptions} />
            </Form.Item>
            <Form.Item name="timePeriod" label="Time Period" rules={rules.date}>
              <SingleDatePicker
                setDate={(value) => form.setFieldValue("timePeriod", value)}
                pickerType={pickerType}
              />
            </Form.Item>
            <Row justify="center" style={{ marginBottom: 5 }}>
              <Typography.Text
                style={{
                  fontSize: 13,
                  textAlign: "center",
                }}
                strong
                type="secondary"
              >
                The report will be sent to your E-mail Id
              </Typography.Text>
            </Row>
            <Row>
              <MyButton
                onClick={handleDownloadReport}
                block
                variant="download"
              />
            </Row>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default GstReport;

const rules = {
  date: [
    {
      required: true,
      message: "Please select a time period",
    },
  ],
  selectionType: [
    {
      required: true,
      message: "Please select a time period selection type",
    },
  ],
  reportType: [
    {
      required: true,
      message: "Please select which report you want to download",
    },
  ],
};
