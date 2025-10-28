import { useState, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Drawer, Empty, Space } from "antd";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { getViewCompletePOColumns } from "../../../new/pages/procurement/POType";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";

export default function ViewComponentSideBar({
  showComponentSideBar,
  setShowComponentSideBar,
  componentData,
}) {
  const [loading, setLoading] = useState(null);
  const printFun = async () => {
    setLoading("print");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poId,
    });
    printFunction(data.data.buffer.data);
    setLoading(null);
  };

  const handleDownload = async () => {
    setLoading("download");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poId,
    });
    let filename = `PO ${componentData?.poId}`;
    downloadFunction(data.data.buffer.data, filename);
    setLoading(null);
  };

  const columns = useMemo(() => getViewCompletePOColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: componentData?.components || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: "calc(100vh - 200px)",
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
  return (
    <Drawer
      title={`Purchase Order: ${componentData?.poId}  / ${
        componentData?.components?.length
      } Item${componentData?.components?.length > 1 ? "s" : ""}`}
      width="50vw"
      onClose={() => setShowComponentSideBar(null)}
      open={showComponentSideBar}
      extra={
        <Space>
          <CommonIcons
            action="printButton"
            loading={loading == "print"}
            onClick={printFun}
          />
          <CommonIcons
            action="downloadButton"
            loading={loading == "download"}
            onClick={handleDownload}
          />
        </Space>
      }
    >
      <div style={{ height: "100%" }} className="remove-table-footer">
        <MaterialReactTable table={table} />
      </div>
    </Drawer>
  );
}
