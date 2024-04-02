import { useEffect, useState } from "react";
import { Drawer, Row, Col, Flex } from "antd";
import useApi from "../../../../../hooks/useApi";
import { fetchShipmentDetails } from "../../../../../api/sales/salesOrder";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../../Components/MyDataTable";
import ClientInfo from "../CreateShipment/ClientInfo";
import BillingInfo from "../CreateShipment/BillingDetailsCard";

const ShipmentDetails = ({ open, hide }) => {
  const [rows, setRows] = useState([]);

  const { executeFun, loading } = useApi();
  const handleFetchRows = async (shipmentId) => {
    const response = await executeFun(
      () => fetchShipmentDetails(shipmentId),
      "fetch"
    );
    setRows(response.data);
  };
  useEffect(() => {
    if (open) {
      handleFetchRows(open.shipmentId);
      console.log("these are the shipment details", open);
    }
  }, [open]);

  
  const clientDetails = {
    clientName: open?.client,
    address: open?.clientAddress,
  };
  const billingDetails = {
    billing: { address: open?.billingAddress },
  };
  return (
    <Drawer
      open={open}
      onClose={hide}
      width="80vw"
      title={`Shipment Details : ${open?.shipmentId}`}
    >
      <Row style={{ height: "100%" }} gutter={6}>
        {open && (
          <Col span={6}>
            <Flex vertical gap={6}>
              <ClientInfo details={clientDetails} />
            </Flex>
          </Col>
        )}
        <Col span={18}>
          <MyDataTable
            loading={loading("fetch")}
            data={rows}
            columns={columns}
          />
        </Col>
      </Row>
    </Drawer>
  );
};

export default ShipmentDetails;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 100,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partCode} copy={true} />
    ),
  },
  {
    headerName: "Component",
    field: "component",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "HSN Code",
    field: "hsn",
    width: 100,
  },
  {
    headerName: "Qty",
    field: "qty",
    width: 100,
  },
  {
    headerName: "Rate",
    field: "rate",
    width: 100,
  },
  {
    headerName: "Pick Location",
    field: "pickLocation",
    width: 150,
  },
  {
    headerName: "Remarks",
    field: "remark",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
  },
];
