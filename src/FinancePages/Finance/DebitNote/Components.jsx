import { useLocation } from "react-router";
import SingleComponent from "./SingleComponent";
import { Col, Form, Row, Typography } from "antd";
import { useState } from "react";

const Components = ({
  form,
  freightGlOptions,
  setFreightGlOptions,
  allTdsOptions,
  tdsArray,
  // addRateDiff,
  // setAddRateDiff,
  vbtType,
}) => {
  const location = useLocation();
  const [addRateDiff, setAddRateDiff] = useState(false);
  return (
    <div style={{ flex: 1 }}>
      <Form.List name="components">
        {(fields, { add, remove }) => (
          <>
            <Col>
              {fields.map((field, index) => (
                <Form.Item noStyle>
                  <SingleComponent
                    fields={fields}
                    field={field}
                    index={index}
                    add={add}
                    form={form}
                    remove={remove}
                    freightGlOptions={freightGlOptions}
                    setFreightGlOptions={setFreightGlOptions}
                    allTdsOptions={allTdsOptions}
                    tdsArray={tdsArray}
                    addRateDiff={addRateDiff}
                    setAddRateDiff={setAddRateDiff}
                    vbtType={vbtType}
                  />
                </Form.Item>
              ))}
              <Row justify="center">
                <Typography.Text type="secondary">
                  ----End of the List----
                </Typography.Text>
              </Row>
            </Col>
          </>
        )}
      </Form.List>
    </div>
  );
};

export default Components;
