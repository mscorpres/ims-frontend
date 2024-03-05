import { useEffect, useState } from "react";
import { Col, Drawer, Row } from "antd";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import ProductDetailsCard from "./ProductDetailsCard";
import WODetailsCard from "./WODetailsCard";
import { getWorkOrderDetails } from "../api";

const ViewModal = ({ showView, setShowView }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({});

  const getDetails = async (subjectId, woId, sku) => {
    try {
      setLoading("fetch");
      setRows([]);
      setDetails({});
      const details = await getWorkOrderDetails(subjectId, woId, sku);
      setRows(details.components);
      setDetails(details.details);
    } catch (error) {
      console.log("error getting component details", error);
    } finally {
      setLoading(false);
    }
  };
  //////////////////////////////

  useEffect(() => {
    if (showView) {
      getDetails(showView.subjectId, showView.woId, showView.sku);
    }
  }, [showView]);

  return (
    <Drawer
      title={showView?.woId ?? ""}
      placement="right"
      onClose={() => setShowView(false)}
      bodyStyle={{
        padding: 5,
      }}
      open={showView}
      width="100%"
    >
      <Row gutter={6} style={{ height: "95%" }}>
        <Col span={4}>
          <Row gutter={[0, 6]}>
            <ProductDetailsCard details={details} />
            <WODetailsCard details={details} />
          </Row>
        </Col>
        <Col span={20} style={{ height: "100%", overflow: "auto" }}>
          <MyDataTable
            columns={columns}
            data={rows}
            loading={loading === "fetch"}
          />
        </Col>
      </Row>
    </Drawer>
  );
};

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Part Code",
    width: 150,
    field: "partCode",
    renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
  },
  {
    headerName: "Cat Part Code",
    width: 150,
    field: "newPartCode",
    renderCell: ({ row }) => <ToolTipEllipses text={row.newPartCode} />,
  },

  {
    headerName: "Component",
    minWidth: 200,
    flex: 1,
    field: "component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },

  {
    headerName: "UOM",
    width: 100,
    field: "unit",
  },
  {
    headerName: "BOM Qty",
    width: 150,
    field: "bomQty",
  },
  {
    headerName: "Req Qty",
    width: 150,
    field: "reqQty",
  },
  {
    headerName: "RM Rtn",
    width: 150,
    field: "rmRtnQty",
  },
  {
    headerName: "Received Qty",
    width: 150,
    field: "receivedQty",
  },
  {
    headerName: "Short/Access",
    width: 150,
    field: "shortAccessQty",
  },
  {
    headerName: "Consumed Qty",
    width: 150,
    field: "consumedQty",
  },

  {
    headerName: "Pending with WO",
    width: 150,
    field: "pendingQtyWO",
  },
  {
    headerName: "Outward Value",
    width: 150,
    field: "outValue",
  },
  {
    headerName: "In Value",
    width: 150,
    field: "inValue",
  },
  {
    headerName: "RM Rtn Value",
    width: 150,
    field: "rmRtnValue",
  },
];

export default ViewModal;
