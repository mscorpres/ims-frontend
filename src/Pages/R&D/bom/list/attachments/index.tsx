import { ModalType } from "@/types/general";
import { BOMTypeExtended } from "@/types/r&d";
import { Card, Divider, Drawer, Flex, Modal, Typography } from "antd";
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
        <Divider />
      </Flex>

      {props.bom.documents.length === 0 && (
        <Flex justify="center" style={{ marginTop: 200 }}>
          <Typography.Text strong type="secondary">
            No attachments found for this BOM!
          </Typography.Text>
        </Flex>
      )}
      {props.bom.documents?.length > 0 && (
        <Flex vertical gap={5}>
          <Flex justify={"space-between"}>
            <Typography.Text strong>Attachements:</Typography.Text>
            <Typography.Text>
              {props.bom.documents.length} found
            </Typography.Text>
          </Flex>
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
      )}
    </Drawer>
  );
};

export default Attachments;
