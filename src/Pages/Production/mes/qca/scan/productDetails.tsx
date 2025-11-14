import { PPRDetailsType } from "@/Pages/Production/mes/qca/scan/types";
import { Flex, Typography } from "antd";
//@ts-ignore
import CustomFieldBox from "../../../../../new/components/reuseable/CustomFieldBox";

type Props = {
  details: PPRDetailsType;
};

const ProductDetails = ({ details }: Props) => {
  return (
    <CustomFieldBox title="Product Details">
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
    </CustomFieldBox>
  );
};

export default ProductDetails;
