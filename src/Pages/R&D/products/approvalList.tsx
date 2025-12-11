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
          (row) => row.approvalStage === "PEN"
          // || row.approvalStage === "1"
        )
        .map((row, index) => ({
          ...row,
          id: index + 1,
        }))
    );
  };

  const actionColumns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          placeholder="See Attachments"
          // disabled={disabled}
          label={"Attachments"}
          onClick={() => {
            setShowDocs(true);
            setAttachLsit(row);
          }}
        />,
        <GridActionsCellItem
          showInMenu
          placeholder="Approval"
          label={"Approval"}
          onClick={() => {
            setShowApprovalLogs(true);
            setSelectedProduct(row);
          }}
        />,
      ],
    },
  ];
  useEffect(() => {
    handleFetchProductList();
  }, []);

  return (
    <Row style={{ padding: 10, height: "95%" }}>
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

          // setAttachLsit={setAttachLsit}
          // attachlist={attachlist}
          // hide={() => {
          //   setShowDocs(false);
          //   // setSelectedBOM(null);
          // }}
          // bom={selectedBOM}
        />
      )}
      <Col sm={24} md={22} xl={20}>
        <MyDataTable
          columns={[...actionColumns, ...columns]}
          data={rows}
          loading={loading("fetch") || loading("submit")}
        />
      </Col>
    </Row>
  );
};

export default ApprovalList;

const columns = [
  { headerName: "#", field: "id", width: 30 },
  {
    headerName: "Product Name",
    field: "name",
    width: 200,
    renderCell: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.name} />
    ),
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 100,
    renderCell: ({ row }: { row: ProductType }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
  },
  {
    headerName: "Unit",
    field: "unit",
    width: 80,
  },
  {
    headerName: "Cost Center",
    field: "costCenter",
    width: 150,
  },
  {
    headerName: "Project",
    field: "project",
    width: 150,
  },
  {
    headerName: "Approval Stage",
    field: "approvalStage",
    width: 120,
    renderCell: ({ row }: { row: ProductType }) => (
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
    headerName: "Created By",
    field: "createdBy",
    width: 180,
  },
  {
    headerName: "Created At",
    field: "createdDate",
    width: 120,
  },
];
