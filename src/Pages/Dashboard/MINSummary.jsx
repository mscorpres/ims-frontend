import { Card, Col, Flex, Row, Skeleton, Typography } from "antd";
import SummarySection from "./SummarySection";
import { Pie } from "@ant-design/plots";
import MyDatePicker from "../../Components/MyDatePicker";
import MyButton from "../../Components/MyButton";

const MINSummary = ({ minSummary, setMINDate, loading }) => {
  const data = [
    {
      type: "分类一",
      value: 27,
    },
    {
      type: "分类二",
      value: 25,
    },
    {
      type: "分类三",
      value: 18,
    },
    {
      type: "分类四",
      value: 15,
    },
    {
      type: "分类五",
      value: 10,
    },
    {
      type: "其他",
      value: 5,
    },
  ];

  const totalMin = minSummary.reduce((prev, curr) => +prev + +curr.value, 0);

  const config = {
    appendPadding: 0,
    padding: 0,
    data: minSummary,
    angleField: "value",
    colorField: "title",
    radius: 1,
    legend: false,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: "element-selected",
      },
      {
        type: "element-active",
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: 16,
        },
        content: `Total MIN: ${totalMin}`,
      },
    },
  };
  return (
    <Col span={12}>
      <Card>
        <Row align="middle">
          <Col span={24}>
            <Row align="middle" justify="space-between">
              <Col>
                <Typography.Title
                  level={4}
                  type="secondary"
                  style={{ marginBottom: 8 }}
                >
                  MIN Summary
                </Typography.Title>
              </Col>
              <Col>
                {/* <MyDatePicker setDateRange={setMINDate} startingDate={true} /> */}
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={6}>
              {minSummary.map((item, index) => (
                <SummaryItem
                  title={item.title}
                  value={item.value}
                  link={item.link}
                  date={item.date}
                  index={index}
                  key={index}
                  // goToDetails={goToDetails}
                  loading={loading}
                />
              ))}
            </Row>
          </Col>
          {/*  <Col span={12}>
            <Pie {...config} />
          </Col>
          */}
        </Row>
        {/* </Row> */}
      </Card>
    </Col>
  );
};

export default MINSummary;
const SummaryItem = ({
  title,
  value,
  link,
  index,
  goToDetails,
  loading,
  date,
}) => {
  return (
    <Col key={index} span={8}>
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
