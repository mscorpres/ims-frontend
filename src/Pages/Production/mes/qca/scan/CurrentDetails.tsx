import { currentScanDetails } from "@/Pages/Production/mes/qca/scan/types";
import { Flex, Typography } from "antd";
//@ts-ignore
import CustomFieldBox from "../../../../../new/components/reuseable/CustomFieldBox";

type Props = {
  details: currentScanDetails;
};

const CurrentDetails = ({ details }: Props) => {
  return (
    <CustomFieldBox title="Current Scan Details">
      <Flex gap={5}>
        <Typography.Text strong>Current Scanned</Typography.Text>
        <Typography.Text>{details.currentScanned}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Passed Qty</Typography.Text>
        <Typography.Text>{details.passed}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Failed Qty</Typography.Text>
        <Typography.Text>{details.failed}</Typography.Text>
      </Flex>
      <Flex gap={5}>
        <Typography.Text strong>Total Lot Scanned</Typography.Text>
        <Typography.Text>{details.total}</Typography.Text>
      </Flex>
    </CustomFieldBox>
  );
};

export default CurrentDetails;
