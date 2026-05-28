import React, { useEffect, useState } from "react";
import { getR34Details } from "@/api/reports/inventoryReport";
import useApi from "@/hooks/useApi";
import { R34ComponentType, R34Type } from "@/types/reports";
import { Drawer, Flex, Row, Typography } from "antd";
import MyDataTable from "@/Components/MyDataTable";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions.jsx";
import { downloadCSV } from "@/Components/exportToCSV.jsx";
import ToolTipEllipses from "@/Components/ToolTipEllipses.jsx";

interface PropTypes {
  selectedTransaction: R34Type | null;
  setSelectedTransaction: React.Dispatch<React.SetStateAction<R34Type | null>>;
}
const Details = ({
  selectedTransaction,
  setSelectedTransaction,
}: PropTypes) => {
  const [rows, setRows] = useState<R34ComponentType[]>([]);
  const { executeFun, loading } = useApi();

  const handleFetchDetails = async (
    transactionId: string,
    executionId: string
  ) => {
    const response = await executeFun(
      () => getR34Details(transactionId, executionId),
      "fetch"
    );
    setRows(response.data ?? []);
  };

  const handleDownload = () => {
    downloadCSV(rows, columns, "R34 Report");
  };

  useEffect(() => {
    if (selectedTransaction) {
      handleFetchDetails(
        selectedTransaction.transactionId,
        selectedTransaction.executionId
      );
    }
  }, [selectedTransaction]);
  return (
    <Drawer
      width={1000}
      open={selectedTransaction ? true : false}
      bodyStyle={{ padding: 5 }}
      onClose={() => setSelectedTransaction(null)}
      title={
        <Flex style={{ width: "100%" }} justify="space-between" align="center">
          <Typography.Text strong>
            {selectedTransaction?.product} :{" "}
            {selectedTransaction?.transactionId}
          </Typography.Text>

          <CommonIcons onClick={handleDownload} action="downloadButton" />
        </Flex>
      }
    >
      <MyDataTable columns={columns} data={rows} loading={loading("fetch")} />
    </Drawer>
  );
};

export default Details;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Component",
    field: "name",
    minWidth: 100,
    flex: 1,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    renderCell: ({ row }: { row: R34ComponentType }) => (
      <ToolTipEllipses text={row.partCode} copy={true} />
    ),
    width: 100,
  },
  {
    headerName: "Rtn. Qty",
    field: "qty",
    width: 100,
  },
  {
    headerName: "BOM Qty",
    field: "bomQty",
    width: 100,
  },
  {
    headerName: "Exec. Date",
    field: "executedDate",
    width: 130,
  },
  {
    headerName: "Exec. By",
    field: "executedBy",
    width: 130,
  },
];
