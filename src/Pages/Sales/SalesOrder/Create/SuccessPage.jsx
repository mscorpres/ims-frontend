import React, { useState } from "react";
import { Button, Col, Result, Row } from "antd";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import MyDataTable from "../../../../Components/MyDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";

export default function SuccessPage({
  po,
  successColumns,
  setNewPO,
  resetFunction,
}) {
  const [printLoading, setPringLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const printFun = async () => {
    setPringLoading(true);
// log 
    const { data } = await imsAxios.post("/poPrint", {
      poid: po.poId,
    });
    setPringLoading(false);
    printFunction(data.data.buffer.data);
  };
  const handleDownload = async () => {
    setDownloadLoading(true);
    const { data } = await imsAxios.post("/poPrint", {
      poid: po?.poId,
    });
    setDownloadLoading(false);
    let filename = po?.poId;
    downloadFunction(data.data.buffer.data, filename);
  };
  const columns = [
    {
      headerName: "Component",
      field: "component",
      renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
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
      headerName: "Value",
      field: "value",
      flex: 1,
    },
  ];
  return (
    <div style={{ height: "100vh" }}>
      <Result
        status="success"
        title={`${po?.poId} created successfully`}
        subTitle={`Vendor:  ${po?.vendorName}  (${
          po?.components.length
        } component${po?.components.length > 1 ? "s" : ""}) `}
        extra={[
          <Row justify="center" gutter={16}>
            <Col>
              <CommonIcons action={"refreshButton"} onClick={setNewPO} />
            </Col>
            {/* <Col>
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
            </Col> */}
          </Row>,
          <Row style={{ marginTop: 15, height: "40vh" }}>
            <MyDataTable data={po.components} columns={columns} />
          </Row>,
        ]}
      />
    </div>
  );
}
