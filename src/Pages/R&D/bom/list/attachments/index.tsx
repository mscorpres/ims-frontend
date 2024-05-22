import { ModalType } from "@/types/general";
import { BOMTypeExtended } from "@/types/r&d";
import { Card, Drawer, Flex, Modal, Typography } from "antd";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";

interface PropTypes extends ModalType {
  bom: BOMTypeExtended;
}
const Attachments = (props: PropTypes) => {
  const handleDownloadDoc = async (url: string) => {
    window.open(url, "_blank", "noreferrer");
  };
  return (
    <Drawer title="Attachments" open={props.show} onClose={props.hide}>
      <Flex vertical gap={3} style={{ marginBottom: 10 }}>
        <Typography.Text strong>BOM Name</Typography.Text>
        <Typography.Text>{props.bom.name}</Typography.Text>
      </Flex>

      <Flex vertical gap={5}>
        {props.bom.documents.map((row) => (
          <Card size="small">
            <Flex align="center" justify={"space-between"}>
              <Typography.Text strong>{row.fileName}</Typography.Text>
              <CommonIcons
                onClick={() => handleDownloadDoc(row.url)}
                action="downloadButton"
              />
            </Flex>
          </Card>
        ))}
      </Flex>
    </Drawer>
  );
};

export default Attachments;
