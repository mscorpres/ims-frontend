import React from "react";
import { ModalType } from "@/types/general";
import { ProductType } from "@/types/r&d";
import { Card, Divider, Drawer, Flex, Image, Typography } from "antd";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";

interface DrawerProps extends ModalType {
  product: ProductType;
}
const ProductDocuments = (props: DrawerProps) => {
  console.log("selected", props.product);
  const handleDownloadDoc = async (url: string) => {
    window.open(url, "_blank", "noreferrer");
  };
  return (
    <Drawer
      width={650}
      open={props.show}
      onClose={props.hide}
      title={props.product?.name}
    >
      <Typography.Title level={5}>Product Images</Typography.Title>
      {/* <Typography.Title level={5}>Product Images</Typography.Title> */}

      <Flex wrap="wrap" gap={10}>
        {props.product.images?.map((row, index) => (
          <Image height={200} width={200} src={row.url} />
        ))}
      </Flex>
      <Divider style={{ marginTop: 15 }} />
      <Typography.Title level={5}>Product Docs</Typography.Title>

      <Flex wrap="wrap" gap={10}>
        {props.product.documents?.map((row, index) => (
          <Card size="small" style={{ width: "100%" }}>
            <Flex gap={10} justify="space-between" align="center">
              <Typography.Text strong type="secondary">
                {row.fileName}
              </Typography.Text>
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

export default ProductDocuments;
