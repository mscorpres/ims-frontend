import { useState } from "react";
import {  Card, Col, Drawer, Row, Space, Timeline } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../../axiosInterceptor";

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
  const columns = [
    {
      headerName: "SR. No",
      field: "po_transaction",
      valueGetter: ({ row }) => {
        return `${componentData?.components?.indexOf(row) + 1}`;
      },
      width: 80,
      id: "Sr. No",
    },
    {
      headerName: "Component Name / Part No.",
      field: "componentPartId",
      valueGetter: ({ row }) => {
        return `${row.po_components} / ${row.componentPartID}`;
      },
      id: "po_components",
      flex: 1,
    },
    {
      headerName: "Ordered Qty",
      field: "ordered_qty",
      id: "ordered_qty",
      width: 120,
    },
    {
      headerName: "Pending QTY",
      field: "pending_qty",

      id: "pending_qty",
      width: 120,
    },
  ];
  console.log(componentData);
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
      <Row gutter={20} style={{ height: "95%" }}>
        <Col span={16}>
          <div style={{ height: "100%" }} className="remove-table-footer">
            <MyDataTable
              pagination={undefined}
              rows={componentData?.components}
              columns={columns}
            />
          </div>
        </Col>
        <Col span={8}>
          <Card
            title="PO logs"
            size="small"
            style={{ maxHeight: "100%" }}
            bodyStyle={{ height: "95%" }}
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
