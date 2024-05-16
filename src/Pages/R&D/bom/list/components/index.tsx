import { useEffect, useState } from "react";
import { Drawer } from "antd";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MyDataTable from "@/Components/MyDataTable.jsx";
import { getComponents } from "@/api/r&d/bom";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { BOMType, BOMTypeExtended } from "@/types/r&d";

interface Proptypes extends ModalType {
  selectedBOM: BOMTypeExtended;
}
const Components = (props: Proptypes) => {
  const [rows, setRows] = useState<BOMType["components"]>([]);

  const { loading, executeFun } = useApi();

  const handleFetchComponents = async (bomKey: string) => {
    const response = await executeFun(() => getComponents(bomKey), "fetch");
    console.log("compnent response", response);
    setRows(response.data ?? []);
  };

  useEffect(() => {
    if (props.selectedBOM?.key) {
      handleFetchComponents(props.selectedBOM.key);
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
      width={1400}
      title={`BOM: ${props.selectedBOM.name}`}
      extra={`${rows.length} Components`}
    >
      <MyDataTable loading={loading("fetch")} columns={columns} data={rows} />
    </Drawer>
  );
};

export default Components;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Name",
    minWidth: 100,
    flex: 1,
    field: "name",
  },
  {
    headerName: "Part Code",
    width: 80,
    field: "partCode",
  },
  {
    headerName: "Sub. Part Code",
    width: 120,
    field: "subPartCode",
    valueGetter: ({ row }: { row: BOMType["components"][0] }) => {
      if (typeof row.substituteOf === "object" && row.substituteOf?.partCode) {
        return row.substituteOf?.partCode;
      }
    },
  },
  {
    headerName: "Sub. Name",
    minWidth: 100,
    flex: 1,
    field: "subName",
    valueGetter: ({ row }: { row: BOMType["components"][0] }) => {
      if (typeof row.substituteOf === "object" && row.substituteOf?.name) {
        return row.substituteOf?.name;
      }
    },
  },
  {
    headerName: "Qty",
    width: 80,
    field: "qty",
  },
  {
    headerName: "Status",
    width: 80,
    field: "status",
    renderCell: ({ row }: { row: BOMType["components"][0] }) => (
      <ToolTipEllipses text={row.status.toUpperCase()} />
    ),
  },
  {
    headerName: "Type",
    width: 120,
    field: "type",
    renderCell: ({ row }: { row: BOMType["components"][0] }) => (
      <ToolTipEllipses text={row.type.toUpperCase()} />
    ),
  },
  {
    headerName: "Remarks",
    width: 200,
    field: "remarks",
  },
];
