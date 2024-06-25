import { Card, Flex, Typography } from "antd";
import React from "react";

type Props = {};

const CurrentDetails = (props: Props) => {
  return (
    <Card size={"small"} title="Current Scan Details">
      <Flex gap={5}>
        <Typography.Text strong>Current Scanned</Typography.Text>
        <Typography.Text>1000</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Passed Qty</Typography.Text>
        <Typography.Text>400</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Failed Qty</Typography.Text>
        <Typography.Text>300</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Total Lot Scanned</Typography.Text>
        <Typography.Text>300</Typography.Text>
      </Flex>
    </Card>
  );
};

export default CurrentDetails;
