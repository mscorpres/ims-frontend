import React, { useState } from "react";
import { Button, Col, Result, Row } from "antd";
import axios from "axios";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MyDataTable from "../../../Components/MyDataTable";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";

export default function SuccessPage({
  successInfo,
  successColumns,
  createNewDC,
}) {
  const [printLoading, setPringLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const printFun = async () => {
    setPringLoading(true);
    const { data } = await imsAxios.post("/gatepass/printGatePass", {
      transaction: successInfo.id,
    });
    setPringLoading(false);
    printFunction(data.data.buffer.data);
  };
  const handleDownload = async () => {
    setDownloadLoading(true);
    const { data } = await imsAxios.post("/gatepass/printGatePass", {
      transaction: successInfo.id,
    });
    setDownloadLoading(false);
    let filename = successInfo.id;
    downloadFunction(data.data.buffer.data, filename);
  };
  const columns = [
    {
      headerName: "Component",
      field: "component",
      renderCell: ({ row }) => <ToolTipEllipses text={row.component.label} />,
      flex: 1,
    },

    {
      headerName: "Qty",
      field: "qty",
      renderCell: ({ row }) => (
        <span>
          {row.qty} {row.uom}
        </span>
      ),
      flex: 1,
    },
    {
      headerName: "Rate",
      field: "rate",
      renderCell: ({ row }) => (
        <span>
          {row.rate} / {row.uom}
        </span>
      ),
      flex: 1,
    },

    {
      headerName: "Description",
      field: "description",
      flex: 1,
    },
  ];
  return (
    <div style={{ height: "100vh" }}>
      <Result
        status="success"
        title={`${successInfo?.id} created successfully`}
        subTitle={`Vendor:  ${successInfo?.vendorName}  (${
          successInfo?.components.length
        } component${successInfo?.components.length > 1 ? "s" : ""}) `}
        extra={[
          <Row justify="center" gutter={16}>
            <Col>
              <CommonIcons action={"refreshButton"} onClick={createNewDC} />
            </Col>
            <Col>
              <CommonIcons
                loading={printLoading}
                action={"printButton"}
                onClick={printFun}
              />
            </Col>
            <Col>
              <CommonIcons
                loading={downloadLoading}
                action={"downloadButton"}
                onClick={handleDownload}
              />
            </Col>
          </Row>,
          <Row style={{ marginTop: 15, height: "40vh" }}>
            <MyDataTable data={successInfo.components} columns={columns} />
          </Row>,
        ]}
      />
    </div>
  );
}
