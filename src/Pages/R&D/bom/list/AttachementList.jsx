import { Button, Card, Divider, Drawer, Flex, Modal, Typography } from "antd";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import React, { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import { v4 } from "uuid";
import { toast } from "react-toastify";
const AttachementList = ({
  attachlist,
  setAttachLsit,
  showDocs,
  setShowDocs,
}) => {
  const [rows, setRows] = useState([]);
  const [documentRow, setDocumentRow] = useState([]);
  const [loading, setLoading] = useState(false);

  const [imageRow, setImageRow] = useState([]);
  const handleFetchProductList = async (val) => {
    setLoading(true);
    const response = await imsAxios.get(`/bomRnd/attachment/${val}`);
    console.log("response", response);
    if (response.success) {
      //   setRows(response.data);
      let arr = response.data.documents;
      let a = arr?.map((r, index) => {
        return {
          id: v4(),
          type: "Document",
          ...r,
        };
      });
      console.log("a", a);
      setDocumentRow(a);

      // console.log("rows", rowing);
      setRows(a);
      toast.success(response.message);
      setLoading(false);
    } else {
      toast.success(response.message.msg);
      setLoading(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (attachlist.key) {
      let val = attachlist?.key;
      handleFetchProductList(val);
    }
  }, [attachlist]);
  //   const handleDownloadDoc = async (url: string) => {
  //     window.open(url, "_blank", "noreferrer");
  //   };

  const doccolumns = [
    // { headerName: "#", field: "id", width: 30 },
    {
      headerName: "File Name",
      field: "fileName",
      width: 300,
      //   renderCell: ({ row }: { row: ProductType }) => (
      //     <ToolTipEllipses text={row.name} />
      //   ),
    },
    {
      headerName: "Type",
      field: "type",
      width: 90,
      //   renderCell: ({ row }: { row: ProductType }) => (
      //     <ToolTipEllipses text={row.name} />
      //   ),
    },
    {
      headerName: "File Size",
      field: "fileSize",
      width: 90,
      //   renderCell: ({ row }: { row: ProductType }) => (
      //     <ToolTipEllipses text={row.name} />
      //   ),
    },
    {
      headerName: "Action",
      field: "sku",
      width: 100,
      renderCell: ({ row }) => (
        <>
          {/* <TableActions
            action="download"
            type="secondary"
            onClick={row.filePath}
          > */}
          <a target="_blank" href={row?.filePath}>
            {" "}
            <TableActions
              action="download"
              type="secondary"
              onClick={row.filePath}
            />
          </a>
          {/* </TableActions> */}
        </>
      ),
    },
  ];
  return (
    <Drawer
      title="Attachments"
      width={600}
      open={attachlist?.key}
      onClose={() => setAttachLsit(null)}
    >
      <Flex vertical gap={3} style={{ marginBottom: 10, height: "100%" }}>
        <MyDataTable columns={doccolumns} data={rows} loading={loading} />
      </Flex>

      {rows?.documents?.fileName === 0 && (
        <Flex justify="center" style={{ marginTop: 200 }}>
          <Typography.Text strong type="secondary">
            No attachments found for this BOM!
          </Typography.Text>
        </Flex>
      )}
      {/* {props.bom.documents?.length > 0 && (
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
          ))} */}
      {/* </Flex> */}
      {/* )} */}
    </Drawer>
  );
};

export default AttachementList;
