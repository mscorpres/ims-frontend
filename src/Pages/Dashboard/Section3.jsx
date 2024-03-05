import React, { useState } from "react";
import { Card, Col, Divider, Row, Typography } from "antd";
import MyDatePicker from "../../Components/MyDatePicker";

const Section3 = ({ columns, rows, title, date, setDate }) => {
  console.log("section3 rows", rows);
  return (
    <Col span={12} style={{ minHeight: "100%" }}>
      <Card
        style={{ minHeight: "100%" }}
        bodyStyle={{ minHeight: "100%" }}
        size="small"
      >
        <Row>
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Typography.Title type="secondary" level={5}>
                  {title}
                </Typography.Title>
              </Col>
              {/* <Col>
                <MyDatePicker setDateRange={setDate} startingDate={true} />
              </Col> */}
            </Row>
          </Col>
          <Col span={24}>
            {rows.length === 0 && (
              <Row justify="center" style={{ margin: 50 }}>
                <Typography.Text type="secondary">
                  No Data Found
                </Typography.Text>
              </Row>
            )}
            {rows.length > 0 && (
              <table style={{ width: "100%" }}>
                {columns.map((col, colIndex) => (
                  <td>
                    <Typography.Text strong>{col.headerName}</Typography.Text>
                  </td>
                ))}

                {rows.map((row, rowIndex) => (
                  <tr style={{ borderBottom: "1px solid red" }}>
                    {columns.map((col, colIndex) => (
                      <td>{row[col.field]}</td>
                    ))}
                  </tr>
                ))}
              </table>
            )}
          </Col>
        </Row>
      </Card>
    </Col>
  );
};
export default Section3;
