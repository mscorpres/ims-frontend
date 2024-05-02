import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import TableActions from "../../../Components/TableActions.jsx/TableActions";

function View({
  rows,
  loading,
  setEditingProduct,
  setUpdatingImage,
  productType,
  setShowImages,
}) {
  const columns = [
    { headerName: "#", field: "id", width: 30 },
    {
      headerName: "Product Name",
      field: "name",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    },
    {
      headerName: "SKU",
      field: "sku",
      width: 100,
      renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
    },
    {
      headerName: "Unit",
      field: "uom",
      width: 80,
    },
    {
      headerName: "Category",
      field: "category",
      width: 100,
      renderCell: ({ row }) => (
        <>
          {row?.category == ""
            ? "--"
            : row?.category == "services"
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
          onClick={() => setEditingProduct(row.productKey)}
        />,
        <TableActions
          action="view"
          onClick={() =>
            setShowImages({
              partNumber: row.productKey,
              partCode: row.product,
            })
          }
        />,
        <TableActions
          disabled={productType === "sfg"}
          action="upload"
          onClick={() =>
            setUpdatingImage({
              key: row.productKey,
              label: row.name,
            })
          }
        />,
      ],
    },
  ];

  return (
    <div style={{ height: "100%" }}>
      <MyDataTable loading={loading} data={rows} columns={columns} />
    </div>
  );
}

export default View;
