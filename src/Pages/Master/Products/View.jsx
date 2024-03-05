import { useEffect, useState } from "react";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import TableActions from "../../../Components/TableActions.jsx/TableActions";

function View({
  rows,
  tableLoading,
  setEditingProduct,
  setUpdatingImage,
  productType,
  setShowImages,
}) {
  const columns = [
    { headerName: "Sr. No.", field: "index", width: 60 },
    {
      headerName: "Product Name",
      field: "p_name",
      flex: 1,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.p_name} />
      ),
    },
    {
      headerName: "SKU",
      field: "p_sku",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.p_sku} copy={true} />
      ),
    },
    {
      headerName: "Unit",
      field: "units_name",
      flex: 1,
    },
    {
      headerName: "Product Category",
      field: "product_category",
      flex: 1,
      renderCell: ({ row }) => (
        <>
          {row?.product_category == ""
            ? "--"
            : row?.product_category == "services"
            ? "Services"
            : "Goods"}
        </>
      ),
    },
    {
      headerName: "Actions",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        <TableActions
          action="edit"
          onClick={() => setEditingProduct(row.product_key)}
        />,
        <TableActions
          action="view"
          onClick={() =>
            setShowImages({
              partNumber: row.product_key,
              partCode: row.p_name,
            })
          }
        />,
        <TableActions
          disabled={productType === "sfg"}
          action="upload"
          onClick={() =>
            setUpdatingImage({
              key: row.product_key,
              label: row.p_name,
            })
          }
        />,
      ],
    },
  ];

  return (
    <div style={{ height: "100%" }}>
      <MyDataTable
        loading={tableLoading}
        data={rows}
        columns={columns}
      />
    </div>
  );
}

export default View;
