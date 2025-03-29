import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";

import MyDataTable from "@/Components/MyDataTable.jsx";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import AttachementList from "./AttachementList.jsx";

import Components from "@/Pages/R&D/bom/list/components";

import { getBOMList } from "@/api/r&d/bom";

import useApi from "@/hooks/useApi";

import { BOMTypeExtended } from "@/types/r&d";
import Attachments from "@/Pages/R&D/bom/list/attachments";
import { useLocation, useNavigate } from "react-router-dom";
import routeConstants from "@/Routes/routeConstants.js";
import IconButton from "@/Components/IconButton";
import { ArrowRightOutlined,EyeOutlined } from "@ant-design/icons";

import ViewLogs from "@/Pages/R&D/bom/list/components/ViewLogs.js";

const BOMList = () => {
  const [rows, setRows] = useState<BOMTypeExtended[]>([]);
  const [selectedBOM, setSelectedBOM] = useState<BOMTypeExtended | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<BOMTypeExtended | null>(null);

  const [showDocs, setShowDocs] = useState(false);
  const [attachlist, setAttachLsit] = useState([]);
  const { pathname: pathName } = useLocation();
  const navigate = useNavigate();

  const { executeFun, loading } = useApi();

  const handleFetchBOMList = async () => {
    let action: "draft" | "final";
    if (pathName.includes("draft")) {
      action = "draft";
    } else {
      action = "final";
    }
    const response = await executeFun(() => getBOMList(action), "fetch");
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
          placeholder="Components and Logs"
          label={"Components and Logs"}
          onClick={() => {
            setShowComponents(true);
            setSelectedBOM(row);
          }}
        />,
        <GridActionsCellItem
          showInMenu
          placeholder="Attachments"
          label={"Attachments"}
          // onClick={() => {
          //   setShowAttachments(true);
          //   setSelectedBOM(row);
          onClick={() => {
            setShowDocs(true);
            setAttachLsit(row);
          }}
          // }}
        />,
        <GridActionsCellItem
          showInMenu
          placeholder="Update"
          label={"Update"}
          onClick={() => {
            console.log(row)
            navigate(
              `${routeConstants.researchAndDevelopment.bom.create}?sku=${row.productKey}&version=${row.version}`
            );
          }}
        />,
        <GridActionsCellItem
        showInMenu
        placeholder="View Logs"
        label={"View Logs"}
        onClick={() => {
          console.log(row)
         setShowLogs(true)
         setSelectedLogs(row);
        }}
      />,
      ],
    },
  ];

  const draftActionColumns = [
    {
      headerName: "Actions",
      type: "actions",
      width: 130,      
      getActions: ({ row }: { row: BOMTypeExtended }) => [
        <GridActionsCellItem
          icon={
            <IconButton
              icon={
                <EyeOutlined
                  style={{ color: "#04B0A8", fontSize: 16 }}
                />
              }
              tooltip="View Images"
            />
          }
          label="View Attachments"
          onClick={() => {
            console.log(row)
            setShowDocs(true);
            setAttachLsit(row);
          }}
        />,
        <GridActionsCellItem
          icon={
            <IconButton
              icon={
                <ArrowRightOutlined
                  style={{ color: "#04B0A8", fontSize: 16 }}
                />
              }
              tooltip="Continue"
            />
          }
          label="View Images"
          onClick={() => {
            navigate(
              `${routeConstants.researchAndDevelopment.bom.create}?sku=${row.productKey}&version=${row.version}/draft`
            );
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
      {attachlist?.key && (
        // <Attachments
        //   show={showAttachments}
        //   hide={() => {
        //     setShowAttachments(false);
        //     setSelectedBOM(null);
        //   }}
        //   bom={selectedBOM}
        // />
        <AttachementList
          attachlist={attachlist}
          setAttachLsit={setAttachLsit}
          showDocs={showDocs}
          setShowDocs={setShowDocs}

          // setAttachLsit={setAttachLsit}
          // attachlist={attachlist}
          // hide={() => {
          //   setShowDocs(false);
          //   // setSelectedBOM(null);
          // }}
          // bom={selectedBOM}
        />
      )}
      {selectedBOM && (
        <Components
          show={showComponents}
          selectedBOM={selectedBOM}
          hide={() => {
            setShowComponents(false);
            setSelectedBOM(null);
            handleFetchBOMList();
          }}
        />
      )}
      {selectedLogs && <ViewLogs
        show={showLogs}
        hide={() => {
          setShowLogs(false);
          setSelectedBOM(null);
        }}
        selectedBOM={selectedLogs}
      />}
      {/* <BOMApproval
        show={showLogs}
        hide={() => {
          setShowLogs(false);
          setSelectedBOM(null);
        }}
        selectedBom={selectedBOM}
      /> */}
      <Col sm={24} lg={20} xxl={16}>
        <MyDataTable
          columns={[
            ...columns,
            ...(pathName.includes("draft")
              ? [...draftActionColumns]
              : [...actionColumns]),
          ]}
          data={rows ?? []}
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
  //
  {
    headerName: "Product",
    minWidth: 200,
    flex: 1,
    field: "productName",
  },
  //
  {
    headerName: "Created On",
    width: 150,
    field: "createdOn",
  },
  {
    headerName: "BRN",
    width: 80,
    field: "version",
  },
  {
    headerName: "Current Approver",
    width: 150,
    field: "currentApprover",
  },
  {
    headerName: "Status",
    width: 150,
    field: "status",
    renderCell: ({ row }: { row: BOMTypeExtended }) => (
      <ToolTipEllipses
        text={
          row?.status == "REJECTED"
            ? "Rejected"
            : row?.status == "CLOSED"
            ? "Closed"
            : "Pending"
        }
      />
    ),
  },
  {
    headerName: "Created By",
    width: 250,
    field: "createdBy",
  },
];
