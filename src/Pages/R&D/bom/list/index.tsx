import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";

import MyDataTable from "@/Components/MyDataTable.jsx";
import ToolTipEllipses from "@/Components/ToolTipEllipses";

import Components from "@/Pages/R&D/bom/list/components";

import { getBOMList } from "@/api/r&d/bom";

import useApi from "@/hooks/useApi";

import { BOMTypeExtended } from "@/types/r&d";
import BOMApproval from "@/Pages/R&D/bom/list/approval";
import Attachments from "@/Pages/R&D/bom/list/attachments";

const BOMList = () => {
  const [rows, setRows] = useState<BOMTypeExtended[]>([]);
  const [selectedBOM, setSelectedBOM] = useState<BOMTypeExtended | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const { executeFun, loading } = useApi();

  const handleFetchBOMList = async () => {
    const response = await executeFun(() => getBOMList(), "fetch");
    setRows(response.data);
  };

  const actionColumns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }: { row: BOMTypeExtended }) => [
        <GridActionsCellItem
          showInMenu
          placeholder="See Components"
          label={"Components"}
          onClick={() => {
            setShowComponents(true);
            setSelectedBOM(row);
          }}
        />,
        <GridActionsCellItem
          showInMenu
          placeholder="See Attachments"
          label={"Attachments"}
          onClick={() => {
            setShowAttachments(true);
            setSelectedBOM(row);
          }}
        />,
        <GridActionsCellItem
          showInMenu
          placeholder="See Logs"
          label={"Logs"}
          onClick={() => {
            setShowLogs(true);
            setSelectedBOM(row);
          }}
        />,
      ],
    },
  ];

  useEffect(() => {
    handleFetchBOMList();
  }, []);
  return (
    <Row justify="center" style={{ height: "95%", padding: 10 }}>
      {selectedBOM && (
        <Attachments
          show={showAttachments}
          hide={() => {
            setShowAttachments(false);
            setSelectedBOM(null);
          }}
          bom={selectedBOM}
        />
      )}
      {selectedBOM && (
        <Components
          show={showComponents}
          selectedBOM={selectedBOM}
          hide={() => {
            setShowComponents(false);
            setSelectedBOM(null);
          }}
        />
      )}
      <BOMApproval
        show={showLogs}
        hide={() => {
          setShowLogs(false);
          setSelectedBOM(null);
        }}
        selectedBom={selectedBOM}
      />
      <Col sm={20} lg={16} xxl={14}>
        <MyDataTable
          columns={[...actionColumns, ...columns]}
          data={rows}
          loading={loading("fetch")}
        />
      </Col>
    </Row>
  );
};

export default BOMList;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "SKU",
    width: 100,
    field: "sku",
    renderCell: ({ row }: { row: BOMTypeExtended }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
  },
  {
    headerName: "Name",
    minWidth: 200,
    flex: 1,
    field: "name",
  },
  {
    headerName: "Created On",
    width: 150,
    field: "createdOn",
  },
  {
    headerName: "Version",
    width: 80,
    field: "version",
  },
  {
    headerName: "Current Approver",
    width: 150,
    field: "currentApprover",
  },
  {
    headerName: "Description",
    width: 250,
    field: "description",
  },
];
