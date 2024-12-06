import { useEffect, useState } from "react";
import { Card, Col, Drawer, Flex, Row } from "antd";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MyDataTable from "@/Components/MyDataTable.jsx";
import { downloadBom, getBomOfProject, getComponents, getComponentsLogs } from "@/api/r&d/bom";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { BOMType, BOMTypeExtended } from "@/types/r&d";
import BOMApproval from "@/Pages/R&D/bom/list/approval";

interface Proptypes extends ModalType {
  selectedBOM: any;
}
const ViewBomOfProject = (props: Proptypes) => {
  const [rows, setRows] = useState<BOMType["components"]>([]);

  const { loading, executeFun } = useApi();

  const handleFetchComponents = async (bomKey: string) => {
    const response = await executeFun(() => getBomOfProject(bomKey), "fetch");
    console.log(response, "response");
    setRows(response.data ?? []);
  };

  useEffect(() => {
    if (props.selectedBOM?.project) {
      handleFetchComponents(props.selectedBOM.project);
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
      width="50%"
      title={`Project: ${props.selectedBOM.description}`}
      extra={
        <Flex align="center" gap={10}>
          {rows.length} BOM
          {/* <CommonIcons
            action="downloadButton"
            // onClick={handleDownload}
            loading={loading("download")}
          /> */}
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

export default ViewBomOfProject;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Bom Type",
    width: 150,
    field: "bomType",
  },
  {
    headerName: "Bom SKU",
    width: 150,
    field: "bomSKU",
  },
  {
    headerName: "BOM Subject",
    minWidth: 250,
    flex: 1,
    field: "bomSubject",
  },
  {
    headerName: "Bom Status",
    minWidth: 150,
    flex: 1,
    field: "bomStatus",
  },

  {
    headerName: "Bom Inserted By",
    width: 200,
    field: "bomInsertBy",
  },
  
  {
    headerName: "Bom Insert Date",
    width: 200,
    field: "bomInsertDt",
  },
];
