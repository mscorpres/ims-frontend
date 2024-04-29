import { Button, Col, Form, Input, Modal, Row } from "antd";
import React, { useState } from "react";
import MySelect from "../../../../Components/MySelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import dayjs from "dayjs";
import useApi from "../../../../hooks/useApi.ts";
import {
  addTransaction,
  updateTransaction,
} from "../../../../api/finance/vendor-reco";
import TransnactionTable from "./TransnactionTable";

const ManualTransactions = ({
  open,
  hide,
  vendor,
  handleFetchManualTransactions,
  manualTransactions,
  handleDelete,
  deleteLoading,
}) => {
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleAddingTransaction = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      vendor,
    };

    const response = await executeFun(() => addTransaction(payload), "submit");
    if (response.success) {
      handleFetchManualTransactions();
      form.resetFields();
      // hide();
    }
  };

  const handleSetUpdateTransaction = (transaction) => {
    setUpdating(transaction.transactionId);
    const obj = {
      date: transaction.invoiceDate,
      impact: transaction.impact,
      type: transaction.transactionType,
      invoice: transaction.invoiceNumber,
      amount: transaction.amount,
      description: transaction.description,
    };
    form.setFieldsValue(obj);
  };

  const handleUpdatingTransaction = async () => {
    const values = await form.validateFields();
    const payload = {
      vendor,
      invoiceNo: values.invoice,
      invoiceDate: values.date,
      amount: values.amount,
      type: values.type,
      description: values.description,
      impactOn: values.impact,
      transactionID: updating,
    };

    const response = await executeFun(
      () => updateTransaction(payload),
      "submit"
    );

    if (response.success) {
      form.resetFields();
      handleFetchManualTransactions();
      setUpdating(null);
    }
  };
  return (
    <Modal
      open={open}
      width={1100}
      onCancel={hide}
      title="Add Transaction"
      okText="Add"
      confirmLoading={loading("submit")}
      footer={<div></div>}
    >
      <Row gutter={6}>
        <Col span={6}>
          <Form layout="vertical" form={form} initialValues={initialValues}>
            <Form.Item name="date" label="Date" rules={rules.date}>
              <SingleDatePicker
                setDate={(value) => {
                  form.setFieldValue("date", value);
                }}
                value={form.getFieldValue("date")}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item name="impact" label="Impact On" rules={rules.impact}>
              <MySelect options={impactOptions} />
            </Form.Item>
            <Form.Item name="type" label="Transaction Type" rules={rules.type}>
              <MySelect options={typeOptions} />
            </Form.Item>
            <Form.Item name="invoice" label="Invoice No." rules={rules.invoice}>
              <Input />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={rules.amount}>
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={rules.description}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Row justify="end">
              <Button
                type="primary"
                loading={loading("submit")}
                onClick={
                  updating ? handleUpdatingTransaction : handleAddingTransaction
                }
              >
                Save
              </Button>
            </Row>
          </Form>
        </Col>
        <TransnactionTable
          rows={manualTransactions}
          loading={deleteLoading}
          handleDelete={handleDelete}
          handleSetUpdateTransaction={handleSetUpdateTransaction}
        />
      </Row>
    </Modal>
  );
};

export default ManualTransactions;

const initialValues = {
  impact: "ims",
  type: "debit",
  amount: "",
  description: "",
  date: dayjs().format("YYYY-MM-DD"),
};

const impactOptions = [
  {
    text: "IMS",
    value: "ims",
  },
  {
    text: "Vendor",
    value: "vendor",
  },
];

const typeOptions = [
  {
    text: "Credit",
    value: "credit",
  },
  {
    text: "Debit",
    value: "debit",
  },
];

const rules = {
  date: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
  impact: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
  type: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
  invoice: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
  amount: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
  description: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
};
