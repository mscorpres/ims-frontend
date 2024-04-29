import { useState } from "react";
import { Row, Col, Divider, Form, Input, Typography, Button, Flex } from "antd";
import useApi from "../../hooks/useApi.ts";
import Loading from "../../Components/Loading";
import { addNote } from "../../api/finance/vendor-reco";

const initialValues = {
  note: "",
};

const Notes = ({ notes, fetchLoading, handleFetchNotes, filterForm }) => {
  const [searchString, setSearchString] = useState("");

  const { executeFun, loading } = useApi();

  const [form] = Form.useForm();

  const submitHandler = async () => {
    const values = await form.validateFields();
    console.log("validated notes field", values);
    const filterValues = await filterForm.validateFields();
    const response = await executeFun(
      () =>
        addNote({
          vendor: filterValues.vendor.value,
          note: values.note,
        }),
      "submit"
    );
    if (response.success) {
      form.resetFields();
      handleFetchNotes();
    }
  };

  return (
    <Row gutter={[0, 6]}>
      <Col span={24}>
        <Form form={form} layout="vertical" initialValues={initialValues}>
          <Form.Item label="Note" name="note">
            <Input.TextArea rows={3} placeholder="Enter note..." />
          </Form.Item>

          <Row justify="end">
            <Button
              type="primary"
              loading={loading("submit")}
              onClick={submitHandler}
            >
              Save
            </Button>
          </Row>
        </Form>
      </Col>
      <Col span={24}>
        <div>{fetchLoading && <Loading />}</div>
      </Col>
      <Divider />
      <Col span={24}>
        <Flex justify="space-between" align="center" vertical gap={6}>
          <div>
            <Typography.Text strong>Previous Notes</Typography.Text>
          </div>
          {/* <div> */}
          <Input
            placeholder="Search Notes"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
          {/* </div> */}
        </Flex>
      </Col>
      <Col span={24}>
        <Row style={{ maxHeight: 400, overflowY: "auto", overflowX: "hidden" }}>
          {notes
            ?.filter(
              (row) =>
                row.date.includes(searchString) ||
                row.note.includes(searchString)
            )

            .map((note) => (
              <Col span={24}>
                <Row gutter={6}>
                  <Col span={24} style={{ fontSize: 14 }}>
                    <Typography.Text type="secondary" strong>
                      {note.date}
                    </Typography.Text>
                  </Col>
                </Row>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {note.note}
                  </Typography.Text>
                </Col>
                <Divider />
              </Col>
            ))}
        </Row>
      </Col>

      {!notes?.length === 0 && (
        <Col span={24} style={{ padding: 20 }}>
          <Typography.Text strong>No notes found...</Typography.Text>
        </Col>
      )}
    </Row>
  );
};

export default Notes;
