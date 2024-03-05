import React, { useEffect, useState } from "react";
import { Drawer, Row, Col, Flex, Typography, Card } from "antd";
import MyDataTable from "../../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import useApi from "../../../../../hooks/useApi";
import { getChallanDetails } from "../../../../../api/sales/salesOrder";
import ClientInfo from "../CreateShipment/ClientInfo";
import Loading from "../../../../../Components/Loading";

const ChallanDetails = ({ open, hide }) => {
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState({});

  const { executeFun, loading } = useApi();

  const handleFetchChallanDetails = async (challanId) => {
    const response = await executeFun(
      () => getChallanDetails(challanId),
      "fetch"
    );

    setRows(response.data.components);
    setDetails(response.data.details);
  };

  const clientDetails = {
    address: details?.clientAddress,
    client: details?.client,
  };

  const billingDetails = {
    address: details?.billingAddress,
  };
  const shippingDetails = {
    address: details?.shippingAddress,
  };

  useEffect(() => {
    if (open) {
      handleFetchChallanDetails(open);
    }
  }, [open]);
  return (
    <Drawer
      title={`Challan Details : ${open ?? ""}`}
      open={open}
      onClose={hide}
      width="70%"
    >
      <Row style={{ height: "100%" }} gutter={6}>
        <Col span={4}>
          <Flex vertical={true} gap={6}>
            {loading("fetch") && <Loading />}
            <ClientInfo details={clientDetails} />
            <Info details={billingDetails} title="Billing Info" />
            <Info details={shippingDetails} title="Shipping Info" />
          </Flex>
        </Col>
        <Col span={20}>
          <MyDataTable
            loading={loading("fetch")}
            columns={columns}
            data={rows}
          />
        </Col>
      </Row>
    </Drawer>
  );
};

export default ChallanDetails;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "SO Id",
    field: "orderId",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.orderId} copy={true} />,
  },
  {
    headerName: "Shipment Id",
    field: "shipmentId",
    width: 150,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.shipmentId} copy={true} />
    ),
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 120,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partCode} copy={true} />
    ),
  },
  {
    headerName: "Component",
    field: "component",
    minWidth: 200,
    flex: 2,
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Qty",
    width: 120,
    field: "qty",
  },
  {
    headerName: "Rate",
    width: 120,
    field: "rate",
  },
];

const Info = ({ details, title }) => {
  return (
    <Card size="small" title={title}>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Typography.Text strong>Address</Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Text>{details.address}</Typography.Text>
          </Col>
        </Row>
      </Col>
    </Card>
  );
};
