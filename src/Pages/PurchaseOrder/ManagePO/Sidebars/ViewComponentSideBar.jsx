import { useState, useMemo } from "react";
import { Card, Col, Drawer, Row, Space, Timeline } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../../axiosInterceptor";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { getViewManagePOColumns } from "../../../../new/pages/procurement/POType";

export default function ViewComponentSideBar({
  showViewSidebar,
  setShowViewSideBar,
  componentData,
  newPoLogs,
}) {

  const [loading, setLoading] = useState(null);
  const printFun = async () => {
    setLoading("print");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poid,
    });

    printFunction(data.data.buffer.data);
    setLoading(null);
  };
  const handleDownload = async () => {
    setLoading("download");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poid,
    });
    setLoading(null);
    let filename = `PO ${componentData?.poid}`;
    downloadFunction(data.data.buffer.data, filename);
  };

  const columns = useMemo(() => getViewManagePOColumns(), []);
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
      bodyStyle={{ padding: 5 }}
      title={
        <>
          <span
            style={{
              color: componentData?.status == "C" && "red",
            }}
          >
            {componentData?.poid}
          </span>
          <span> / </span>
          <span>
            {componentData?.components?.length} Item
            {componentData?.components?.length > 1 ? "s" : ""}
          </span>
        </>
      }
      width="100vw"
      onClose={() => setShowViewSideBar(null)}
      open={showViewSidebar}
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
      <Row gutter={12} style={{ height: "95%" }}>
        <Col span={16}>
          <div style={{ height: "100%" }} className="remove-table-footer">
            <MaterialReactTable table={table} />
          </div>
        </Col>
        <Col span={8}>
          <Card
            title="PO logs"
            size="small"
            style={{ maxHeight: "100%", backgroundColor: "#e0f2f1" }}
            bodyStyle={{ height: "95%", backgroundColor: "#e0f2f1" }}
          >
            <Timeline
              items={newPoLogs.map((row) => ({
                children: (
                  <>
                    <strong>{row.po_log_status}</strong>
                    <div style={{ fontSize: "10px" }}>
                      By {row.user_name} on {row.date} {row.time}
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      Remark:{" "}
                      {row.po_log_remark.length === 0
                        ? "--"
                        : row.po_log_remark}
                    </div>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </Drawer>
  );
}
