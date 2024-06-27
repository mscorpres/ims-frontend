import { ProcessDetailsType } from "@/Pages/Production/mes/qca/scan/types";
import { Card, Flex, Typography } from "antd";
import React from "react";

type Props = { details?: ProcessDetailsType };

const LocationDetails = ({ details }: Props) => {
  return (
    <Card size={"small"} title="Location Details">
      <Flex gap={5}>
        <Typography.Text strong>Testing Location</Typography.Text>
        <Typography.Text>{details?.location.process.label}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Passed Location</Typography.Text>
        <Typography.Text>{details?.location.pass.label}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Failed Location</Typography.Text>
        <Typography.Text>{details?.location.fail.label}</Typography.Text>
      </Flex>
    </Card>
  );
};

export default LocationDetails;
