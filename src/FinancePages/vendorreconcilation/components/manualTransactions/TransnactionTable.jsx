import React from "react";
import MyDataTable from "../../../../Components/MyDataTable";
import { Col } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";

const TransnactionTable = ({
  rows,
  handleDelete,
  loading,
  handleSetUpdateTransaction,
}) => {
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        label="Update"
        onClick={() => handleSetUpdateTransaction(row)}
      />,
      <GridActionsCellItem
        showInMenu
        label="Delete"
        onClick={() => handleDelete(row.transactionId)}
      />,
    ],
  };
  return (
    <Col span={18} style={{ height: 500 }}>
      <MyDataTable
        loading={loading}
        data={rows}
        columns={[actionColumn, ...columns]}
      />
    </Col>
  );
};

export default TransnactionTable;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Invoice No.",
    field: "invoiceNumber",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Invoice Date",
    field: "invoiceDate",
    width: 100,
  },
  {
    headerName: "Impact On",
    field: "impact",
    width: 100,
  },
  {
    headerName: "Type",
    field: "type",
    width: 80,
  },
  {
    headerName: "Debit",
    field: "debit",
    width: 100,
  },
  {
    headerName: "Credit",
    field: "credit",
    width: 100,
  },
];
