import { PPRDetailsType } from "@/Pages/Production/mes/qca/scan/types";
import { Card, Flex, Typography } from "antd";
import React from "react";

type Props = {
  details: PPRDetailsType;
};

const ProductDetails = ({ details }: Props) => {
  return (
    <Card size={"small"} title="Product Details">
      <Flex gap={5}>
        <Typography.Text strong>Scanning Qty</Typography.Text>
        <Typography.Text>{details.summaryQty.scanned}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Passed Qty</Typography.Text>
        <Typography.Text>{details.summaryQty.passed}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Failed Qty</Typography.Text>
        <Typography.Text>{details.summaryQty.failed}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Remaining Qty</Typography.Text>
        <Typography.Text>{details.summaryQty.remaining}</Typography.Text>
      </Flex>
    </Card>
  );
};

export default ProductDetails;
