import { Card, Col, Drawer, Row, Skeleton, Typography } from "antd";
import { useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useState } from "react";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import Loading from "../../../../Components/Loading";
import SummaryCard from "../../../../Components/SummaryCard";

export default function ViewComponents({ viewComponents, setViewComponents }) {
  const [loading, setLoading] = useState(false);
  const [summaryDetails, setSummaryDetails] = useState([]);
  const [rows, setRows] = useState([]);

  const getRows = async () => {
    setRows([]);
    setLoading("fetch");
    const response = await imsAxios.post("/ppr/fetchRQDComponent4View", {
      ...viewComponents,
    });
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
        toast.error(data.message.msg);
      }
    }
  };
  const columns = [
    { headerName: "#", field: "id", width: 30 },
    {
      headerName: "Part Code",
      field: "part",
      width: 100,
      renderCell: ({ row }) => <ToolTipEllipses copy={true} text={row.part} />,
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    },
    { headerName: "Type", field: "category" },
    { headerName: "BOM Qty", field: "bom_qty" },
    { headerName: "Rate", field: "rate" },
    { headerName: "UoM", field: "uom", width: 80 },
    { headerName: "Req. Qty", field: "req_qty", width: 150 },
    { headerName: "Exec. Qty", field: "executed_qty", width: 150 },
    { headerName: "Remaining Qty", field: "remaining_qty", width: 150 },
  ];
  useEffect(() => {
    if (viewComponents) {
      getRows();
      const obj = [
        {
          title: "Project",
          description: viewComponents.project,
        },
        {
          title: "Product",
          description: viewComponents.product,
        },
      ];

      console.log(obj);
      setSummaryDetails(obj);
    }
  }, [viewComponents]);
  return (
    <Drawer
      title={`PPR No. : ${viewComponents?.ppr} | BOM Component List`}
      placement="right"
      width="80vw"
      bodyStyle={{ padding: 5 }}
      extra={
        loading === "fetch" ? (
          <Skeleton.Input block size="small" active />
        ) : (
          <Typography.Text>{rows?.length} Components</Typography.Text>
        )
      }
      onClose={() => setViewComponents(false)}
      open={viewComponents}
    >
      {loading === "fetch" && <Loading />}
      <Row align={"top"} gutter={[0, 0]} style={{ height: "100%" }}>
        <Col span={24}>
          <Card size="small">
            <Row justify="space-between">
              <Col>
                <Row>
                  <Col span={24}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                      Project:
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Text
                      style={{ fontSize: window.innerWidth < 1600 ? 11 : 13 }}
                    >
                      {viewComponents?.project}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col span={24}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                      Product:
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    {" "}
                    <Typography.Text
                      style={{ fontSize: window.innerWidth < 1600 ? 11 : 13 }}
                    >
                      {viewComponents?.product}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col span={24}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                      SKU:
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    {" "}
                    <Typography.Text
                      style={{ fontSize: window.innerWidth < 1600 ? 11 : 13 }}
                    >
                      {viewComponents?.sku}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col span={24}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                      Planned Qty:
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    {" "}
                    <Typography.Text
                      style={{ fontSize: window.innerWidth < 1600 ? 11 : 13 }}
                    >
                      {viewComponents?.plannedQty}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col span={24}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                      Executed Qty:
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    {" "}
                    <Typography.Text
                      style={{ fontSize: window.innerWidth < 1600 ? 11 : 13 }}
                    >
                      {viewComponents?.executedQty}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col span={24}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                      Remaining Qty:
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    {" "}
                    <Typography.Text
                      style={{ fontSize: window.innerWidth < 1600 ? 11 : 13 }}
                    >
                      {viewComponents?.remainingQty}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "90%" }} span={24}>
          <MyDataTable rows={rows} columns={columns} />
        </Col>
      </Row>
    </Drawer>
  );
}
