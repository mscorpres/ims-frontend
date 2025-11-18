import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";

import MyDataTable from "@/Components/MyDataTable.jsx";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import AttachementList from "./AttachementList.jsx";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import Components from "@/Pages/R&D/bom/list/components";

import { getBOMList } from "@/api/r&d/bom";

import useApi from "@/hooks/useApi";

import { BOMTypeExtended } from "@/types/r&d";
import Attachments from "@/Pages/R&D/bom/list/attachments";
import { useLocation, useNavigate } from "react-router-dom";
import routeConstants from "@/Routes/routeConstants.js";
import IconButton from "@/Components/IconButton";
import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import ViewLogs from "@/Pages/R&D/bom/list/components/ViewLogs.js";
import { Box, LinearProgress } from "@mui/material";
import { Image, Visibility } from "@mui/icons-material";

const BOMList = () => {
  const [rows, setRows] = useState<BOMTypeExtended[]>([]);
  const [selectedBOM, setSelectedBOM] = useState<BOMTypeExtended | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<BOMTypeExtended | null>(
    null
  );

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
      getActions: ({ row }: { row: BOMTypeExtended }) => [],
    },
  ];

  const draftActionColumns = [
    {
      header: "Actions",
      type: "actions",
      width: 130,
      getActions: ({ row }: { row: BOMTypeExtended }) => [
        <GridActionsCellItem
          icon={
            <IconButton
              icon={<EyeOutlined style={{ color: "#04B0A8", fontSize: 16 }} />}
              tooltip="View Attachments"
            />
          }
          label="View Attachments"
          onClick={() => {
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

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 190px)"
          : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
    renderRowActionMenuItems: ({ row, table, closeMenu }) =>
      pathName.includes("draft")
        ? [
            <MRT_ActionMenuItem
              icon={<Visibility fontSize="small" />}
              key="view"
              label="View Attachments"
              onClick={() => {
                closeMenu?.();

                setShowDocs(true);
                setAttachLsit(row?.original);
              }}
              table={table}
            />,
            <MRT_ActionMenuItem
              icon={<Image fontSize="small" />}
              key="viewimage"
              label="View Images"
              onClick={() => {
                navigate(
                  `${routeConstants.researchAndDevelopment.bom.create}?sku=${row?.original?.productKey}&version=${row?.original?.version}/draft`
                );
              }}
              table={table}
            />,
          ]
        : [
            <MRT_ActionMenuItem
              icon={""}
              table={table}
              key="componentsandlogs"
              label={"Components and Logs"}
              onClick={() => {
                {
                  closeMenu?.();
                  setShowComponents(true);
                  setSelectedBOM(row?.original);
                }
              }}
            />,
            <MRT_ActionMenuItem
              icon={""}
              table={table}
              key="attachments"
              label={"Attachments"}
              // onClick={() => {
              //   setShowAttachments(true);
              //   setSelectedBOM(row);
              onClick={() => {
                {
                  closeMenu?.();
                  setShowDocs(true);
                  setAttachLsit(row?.original);
                }
              }}
              // }}
            />,
            <MRT_ActionMenuItem
              icon={""}
              table={table}
              key="update"
              label={"Update"}
              onClick={() => {
                navigate(
                  `${routeConstants.researchAndDevelopment.bom.create}?sku=${row?.original?.productKey}&version=${row?.original?.version}`
                );
              }}
            />,
            <MRT_ActionMenuItem
              icon={""}
              table={table}
              key="viewlogs"
              label={"View Logs"}
              onClick={() => {
                setShowLogs(true);
                setSelectedLogs(row?.original);
              }}
            />,
          ],
  });
  return (
    <div style={{ height: "95%", margin: 12 }}>
      {attachlist?.key && (
        <AttachementList
          attachlist={attachlist}
          setAttachLsit={setAttachLsit}
          showDocs={showDocs}
          setShowDocs={setShowDocs}
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
      {selectedLogs && (
        <ViewLogs
          show={showLogs}
          hide={() => {
            setShowLogs(false);
            setSelectedBOM(null);
          }}
          selectedBOM={selectedLogs}
        />
      )}

      <MaterialReactTable table={table} />
    </div>
  );
};

export default BOMList;

const columns = [
  {
    header: "#",
    width: 30,
    accessorKey: "id",
  },
  {
    header: "SKU",
    width: 100,
    accessorKey: "sku",
    renderCell: ({ row }: { row: BOMTypeExtended }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
  },
  //
  {
    header: "Product",
    minWidth: 200,
    flex: 1,
    accessorKey: "productName",
  },
  //
  {
    header: "Created On",
    width: 150,
    accessorKey: "createdOn",
  },
  {
    header: "BRN",
    width: 80,
    accessorKey: "version",
  },
  {
    header: "Current Approver",
    width: 150,
    accessorKey: "currentApprover",
  },
  {
    header: "Status",
    width: 150,
    accessorKey: "status",
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
    header: "Created By",
    width: 250,
    accessorKey: "createdBy",
  },
];
