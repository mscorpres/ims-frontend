import { ProductType } from "@/types/r&d";
import React, { useEffect, useState } from "react";
import ToolTipEllipses from "@/Components/ToolTipEllipses.jsx";
import useApi from "@/hooks/useApi";
import { Col, Row } from "antd";
import MyDataTable from "@/Components/MyDataTable.jsx";
import { getProductsList } from "@/api/r&d/products";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Approval from "@/Pages/R&D/products/approval";
import AttachementList from "./AttachementList.jsx";
//@ts-ignore
import CustomButton from "../../../new/components/reuseable/CustomButton";
//@ts-ignore
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";

type Props = {};

const ApprovalList = (props: Props) => {
  const [rows, setRows] = useState([]);
  const [showDocs, setShowDocs] = useState(false);
  const [showApprovalLogs, setShowApprovalLogs] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [attachlist, setAttachLsit] = useState([]);
  const { executeFun, loading } = useApi();

  const handleFetchProductList = async () => {
    const response = await executeFun(() => getProductsList(), "fetch");
    setRows(
      (response.data ?? [])
        .filter(
          (row: any) => row.approvalStage === "PEN"
          // || row.approvalStage === "1"
        )
        .map((row: any, index: any) => ({
          ...row,
          id: index + 1,
        }))
    );
  };

 
  useEffect(() => {
    handleFetchProductList();
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
    renderRowActions: ({ row }: { row: any }) => (
      <div className="flex gap-6">
        <CustomButton
          variant="text"
          size="small"
          title={"Attachments"}
          onclick={() => {
            setShowDocs(true);
            setAttachLsit(row?.original);
          }}
        />
        <CustomButton
          variant="text"
          size="small"
          title={"Approval"}
          onclick={() => {
            setShowApprovalLogs(true);
            setSelectedProduct(row?.original);
          }}
        />
      </div>
    ),
    muiTableContainerProps: {
      sx: {
        height:
          loading("fetch") || loading("submit")
            ? "calc(100vh - 190px)"
            : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") || loading("submit") ? (
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
  });

  return (
    <div style={{ margin: 12, height: "95%" }}>
      {selectedProduct && (
        <Approval
          show={showApprovalLogs}
          hide={() => {
            setShowApprovalLogs(false);
            setSelectedProduct(null);
          }}
          productKey={selectedProduct.key ?? ""}
          setShowApprovalLogs={setShowApprovalLogs}
        />
      )}{" "}
      {attachlist?.key && (
        <AttachementList
          attachlist={attachlist}
          setAttachLsit={setAttachLsit}
          showDocs={showDocs}
          setShowDocs={setShowDocs}
        />
      )}
      <MaterialReactTable table={table} />
    </div>
  );
};

export default ApprovalList;

const columns = [
  { header: "#", accessorKey: "id", width: 30 },
  {
    header: "Product Name",
    accessorKey: "name",
    width: 200,
    render: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.name} />
    ),
  },
  {
    header: "SKU",
    accessorKey: "sku",
    width: 100,
    render: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
  },
  {
    header: "Unit",
    accessorKey: "unit",
    width: 80,
  },
  {
    header: "Cost Center",
    accessorKey: "costCenter",
    width: 150,
  },
  {
    header: "Project",
    accessorKey: "project",
    width: 150,
  },
  {
    header: "Approval Stage",
    accessorKey: "approvalStage",
    width: 120,
    render: ({ row }: { row: any }) => (
      <ToolTipEllipses
        text={
          row?.approvalStage == "PEN"
            ? "Pending"
            : row?.approvalStage == "APR"
            ? "Approved"
            : "Rejected"
        }
        // copy={true}
      />
    ),
  },

  {
    header: "Created By",
    accessorKey: "createdBy",
    width: 180,
  },
  {
    header: "Created At",
    accessorKey: "createdDate",
    width: 120,
  },
];
