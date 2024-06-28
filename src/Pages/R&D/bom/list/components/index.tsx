import { useEffect, useState } from "react";
import { Card, Col, Drawer, Flex, Row } from "antd";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MyDataTable from "@/Components/MyDataTable.jsx";
import { downloadBom, getComponents } from "@/api/r&d/bom";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { BOMType, BOMTypeExtended } from "@/types/r&d";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import BOMApproval from "@/Pages/R&D/bom/list/approval";

interface Proptypes extends ModalType {
  selectedBOM: BOMTypeExtended;
}
const Components = (props: Proptypes) => {
  const [rows, setRows] = useState<BOMType["components"]>([]);

  const { loading, executeFun } = useApi();

  const handleFetchComponents = async (bomKey: string) => {
    const response = await executeFun(() => getComponents(bomKey), "fetch");
    console.log("compnent response", response);
    setRows(response.data ?? []);
  };

  const handleDownload = async () => {
    if (props.selectedBOM && props.selectedBOM.key) {
      const response = await executeFun(
        () => downloadBom(props.selectedBOM.key),
        "download"
      );
    }
  };

  useEffect(() => {
    if (props.selectedBOM?.key) {
      handleFetchComponents(props.selectedBOM.key);
    }
  }, [props.selectedBOM]);
  useEffect(() => {
    if (!props.show) {
      setRows([]);
    }
  }, [props.show]);
  return (
    <Drawer
      open={props.show}
      onClose={props.hide}
      width="100%"
      title={`BOM: ${props.selectedBOM.name}`}
      extra={
        <Flex align="center" gap={10}>
          {rows.length} Components
          <CommonIcons
            action="downloadButton"
            onClick={handleDownload}
            loading={loading("download")}
          />
        </Flex>
      }
    >
      <Row style={{ height: "100%", overflow: "hidden" }} gutter={8}>
        <Col span={6} style={{ overflow: "auto", height: "100%" }}>
          <Card title="Approval Logs" size="small">
            {props.selectedBOM && (
              <BOMApproval selectedBom={props.selectedBOM} />
            )}
          </Card>
        </Col>
        <Col span={18} style={{ overflow: "auto", height: "100%" }}>
          <MyDataTable
            loading={loading("fetch")}
            columns={columns}
            data={rows}
          />
        </Col>
      </Row>
    </Drawer>
  );
};

export default Components;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Part Code",
    width: 80,
    field: "partCode",
  },
  {
    headerName: "Unique Code",
    width: 180,
    field: "uniqueCode",
  },
  {
    headerName: "Name",
    minWidth: 200,
    flex: 1,
    field: "name",
  },

  {
    headerName: "Alt. Part Code",
    width: 120,
    field: "subPartCode",
    valueGetter: ({ row }: { row: BOMType["components"][0] }) => {
      if (typeof row.substituteOf === "object" && row.substituteOf?.partCode) {
        return row.substituteOf?.partCode;
      }
    },
  },
  // placement here
  {
    headerName: "Placement",
    width: 100,
    field: "locations",
    renderCell: ({ row }: { row: BOMType["components"][0] }) => (
      <ToolTipEllipses text={row.locations?.toUpperCase()} />
    ),
  },
  {
    headerName: "Qty",
    width: 80,
    field: "qty",
  },
  // vendor here
  {
    headerName: "Vendor",
    width: 200,
    field: "vendor",
    renderCell: ({ row }: { row: BOMType["components"][0] }) => (
      <ToolTipEllipses text={row.vendor?.toUpperCase()} />
    ),
  },
  {
    headerName: "Sub. Name",
    minWidth: 100,
    flex: 1,
    field: "subName",
    valueGetter: ({ row }: { row: BOMType["components"][0] }) => {
      if (typeof row.substituteOf === "object" && row.substituteOf?.name) {
        return row.substituteOf?.name;
      }
    },
  },

  {
    headerName: "Status",
    width: 80,
    field: "status",
    renderCell: ({ row }: { row: BOMType["components"][0] }) => (
      <ToolTipEllipses text={row.status.toUpperCase()} />
    ),
  },
  // {
  //   headerName: "Type",
  //   width: 120,
  //   field: "type",
  //   renderCell: ({ row }: { row: BOMType["components"][0] }) => (
  //     <ToolTipEllipses text={row.type.toUpperCase()} />
  //   ),
  // },
  {
    headerName: "Remarks",
    width: 200,
    field: "remarks",
  },
];
