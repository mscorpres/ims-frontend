import { Button, Card, Col, Flex, Row, Skeleton, Typography } from "antd";
import React from "react";
import MyButton from "../../Components/MyButton";
import { useNavigate } from "react-router";
import MyDatePicker from "../../Components/MyDatePicker";

const MasterSummary = ({
  loading,
  summary,
  title,
  summaryLength,
  subTitle,
}) => {
  const navigate = useNavigate();
  const goToDetails = (link) => {
    navigate(link);
  };
  return (
    <Col span={24}>
      <Row gutter={[6, 6]}>
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <Typography.Title
                level={4}
                type="secondary"
                style={{ marginBottom: 8 }}
              >
                {title}
              </Typography.Title>
            </Col>
            {subTitle && (
              <Col>
                <Typography.Text type="secondary" style={{ marginBottom: 8 }}>
                  {subTitle}
                </Typography.Text>
              </Col>
            )}
          </Row>
        </Col>
        {summary.map((item, index) => (
          <SummaryItem
            title={item.title}
            value={item.value}
            link={item.link}
            date={item.date}
            index={index}
            key={index}
            goToDetails={goToDetails}
            loading={loading}
            summaryLength={summaryLength}
          />
        ))}
      </Row>
    </Col>
  );
};

export default MasterSummary;

const SummaryItem = ({
  title,
  value,
  link,
  index,
  goToDetails,
  loading,
  summaryLength,
  date,
}) => {
  return (
    <Col key={index} span={summaryLength ? 24 / summaryLength : 6}>
      <Card size="small">
        <Flex vertical justify="justify-between" align="stretch">
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Typography.Title level={5}>{title}</Typography.Title>
              </Col>
              {link && (
                <Col>
                  <MyButton
                    onClick={() => goToDetails(link)}
                    text="Details"
                    type="primary"
                    variant="next"
                  />
                </Col>
              )}
            </Row>
          </Col>
          <Col span={24}>
            <Row align="bottom" justify="space-between">
              <Col>
                {loading && <Skeleton.Input active />}
                {!loading && (
                  <Typography.Title level={3}>{value}</Typography.Title>
                )}
              </Col>
              <Col>
                {loading && <Skeleton.Input active />}
                {!loading && (
                  <Typography.Text style={{ fontSize: 14 }} type="secondary">
                    {date}
                  </Typography.Text>
                )}
              </Col>
            </Row>
          </Col>
        </Flex>
      </Card>
    </Col>
  );
};
