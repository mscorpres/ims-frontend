import { PPRDetailsType } from "@/Pages/Production/mes/qca/scan/types";
import { Card, Flex, Typography } from "antd";
import React from "react";

type Props = {
  details: PPRDetailsType;
};

const CustomerName = ({ details }: Props) => {
  return (
    <Card size={"small"} title="Customer Details">
      <Flex gap={5}>
        <Typography.Text strong>Customer Name</Typography.Text>
        <Typography.Text>{details.customer}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Product Name</Typography.Text>
        <Typography.Text>{details.product.label}</Typography.Text>
      </Flex>
    </Card>
  );
};

export default CustomerName;
