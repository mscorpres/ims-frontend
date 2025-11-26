import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
import MyDataTable from "../../../Components/MyDataTable.jsx";
import TableActions from "../../../Components/TableActions.jsx/TableActions.jsx";
import { ProductType } from "@/types/master";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSVnested2 } from "../../../Components/exportToCSV";
import { Row } from "antd";

interface PropTypes {
  rows: ProductType[];
  loading: boolean;
  setEditingProduct: React.Dispatch<React.SetStateAction<string | boolean>>;
  setUpdatingImage: React.Dispatch<React.SetStateAction<false | ProductType>>;
  productType: ProductType["type"];
  setShowImages: React.Dispatch<React.SetStateAction<false | ProductType>>;
}
function View({
  rows,
  loading,
  setEditingProduct,
  setUpdatingImage,
  productType,
  setShowImages,
}: PropTypes) {
  const actionColumn = [
    {
      headerName: "Actions",
      width: 100,
      type: "actions",
      getActions: ({ row }: { row: ProductType }) => [
        <TableActions
          action="edit"
          onClick={() => row.productKey && setEditingProduct(row.productKey)}
        />,
        <TableActions action="view" onClick={() => setShowImages(row)} />,
        <TableActions
          disabled={productType === "sfg"}
          action="upload"
          onClick={() => setUpdatingImage(row)}
        />,
      ],
    },
  ];
  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "Products");
  };
  return (
    <div style={{ height: "100%" }}>
      <Row justify="end" style={{ margin: "5x 0" }}>
        <CommonIcons
          disabled={rows.length === 0}
          onClick={handleDownload}
          action="downloadButton"
        />
      </Row>
      <MyDataTable
        loading={loading}
        data={rows}
        columns={[...columns, ...actionColumn]}
      />
    </div>
  );
}

export default View;
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
];
