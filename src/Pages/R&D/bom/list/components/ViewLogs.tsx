import { useEffect, useState } from "react";
import { Card, Col, Drawer, Flex, Row } from "antd";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MyDataTable from "@/Components/MyDataTable.jsx";
import { downloadBom, getComponents, getComponentsLogs } from "@/api/r&d/bom";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { BOMType, BOMTypeExtended } from "@/types/r&d";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import BOMApproval from "@/Pages/R&D/bom/list/approval";

interface Proptypes extends ModalType {
  selectedBOM: BOMTypeExtended;
}
const ViewLogs = (props: Proptypes) => {
  const [rows, setRows] = useState<BOMType["components"]>([]);

  const { loading, executeFun } = useApi();

  const handleFetchComponents = async (bomKey: string) => {
    const response = await executeFun(() => getComponentsLogs(bomKey), "fetch");
    setRows(response.data ?? []);
  };

  useEffect(() => {
    if (props.selectedBOM?.key) {
      handleFetchComponents(props.selectedBOM.key);
      // handleFetchComponents(props.selectedBOM.key);
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
      title={`BOM: ${props.selectedBOM.productName}`}
      extra={
        <Flex align="center" gap={10}>
          {rows.length} Components
          <CommonIcons
            action="downloadButton"
            // onClick={handleDownload}
            loading={loading("download")}
          />
        </Flex>
      }
    >
      <Row style={{ height: "100%", overflow: "hidden" }} gutter={8}>
        <Col span={24} style={{ overflow: "auto", height: "100%" }}>
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

export default ViewLogs;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Label",
    width: 250,
    field: "label",
  },
  {
    headerName: "Summary",
    width: 300,
    field: "summary",
  },
  {
    headerName: "Time",
    minWidth: 200,
    flex: 1,
    field: "time",
  },
  {
    headerName: "Activity Person",
    minWidth: 200,
    flex: 1,
    field: "activityPerson",
  },

  {
    headerName: "Version",
    width: 120,
    field: "version",
  },
  
  {
    headerName: "Remark",
    width: 200,
    field: "remark",
  },
];
