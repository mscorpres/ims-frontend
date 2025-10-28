import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { Drawer, Space } from "antd";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { getViewApprovedPOColumns } from "../../../../new/pages/procurement/POType";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

export default function PoDetailsView({ viewPoDetails, setViewPoDetails }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post(
      "/purchaseOrder/fetchComponentList4POApproval",
      {
        poid: viewPoDetails,
      }
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          id: index + 1,
          ...row,
        }));
        setRows(arr);
      } else {
        toast.message(data.message.msg);
        setViewPoDetails(false);
      }
    }
  };

  const columns = useMemo(() => getViewApprovedPOColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 190px)" : "calc(100vh - 190px)",
      },
    },

    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Purchase Orders Found" />
    ),
    renderTopToolbar: () =>
      loading ? (
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

  useEffect(() => {
    if (viewPoDetails) {
      getRows();
    }
  }, [viewPoDetails]);
  return (
    <Drawer
      title={`PO : ${viewPoDetails}`}
      placement="right"
      width="100vw"
      onClose={(e) => {
        if (e === "escape") {
          setViewPoDetails(false);
        }
        setViewPoDetails(false);
      }}
      open={viewPoDetails}
      bodyStyle={{
        padding: 5,
      }}
      extra={
        <Space>
          {rows.length} Items{" "}
          <CommonIcons
            action="downloadButton"
            onClick={() => downloadCSV(rows, columns, viewPoDetails)}
          />
        </Space>
      }
    >
      <div
        style={{
          height: "100%",
          overflowX: "auto",
          width: "100%",
          padding: "4px 8px",
        }}
      >
        <MaterialReactTable table={table} />
      </div>
    </Drawer>
  );
}
