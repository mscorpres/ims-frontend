import React, { useEffect, useState } from "react";
import { Button, Col, Result, Row } from "antd";
import axios from "axios";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
export default function SuccessPage({
  po,
  successColumns,
  newMinFunction,
  title,
}) {
  const [printLoading, setPringLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const printFun = async () => {
    setPringLoading(true);

    const { data } = await imsAxios.post("/minPrint/printSingleMin", {
      transaction: po?.materialInId,
    });
    setPringLoading(false);
    printFunction(data.data.buffer.data);
  };
  const downloadExcel = async () => {
    downloadCSV(po.components, successColumns, `SFG Inward Report`);
  };
  const handleDownload = async () => {
    console.log("");
    setDownloadLoading(true);
    const { data } = await imsAxios.post("/minPrint/printSingleMin", {
      transaction: po?.materialInId,
    });
    setDownloadLoading(false);
    let filename = `MIN ${po?.materialInId}`;
    downloadFunction(data.data.buffer.data, filename);
  };
  useEffect(() => {
    if (po?.components) {
      setRows(po?.components);
    }
  }, [po?.components]);

  return (
    <div style={{ height: "50vh" }}>
      <Result
        status="success"
        title={
          title === "Sfg"
            ? "SFG Inward successfull"
            : "Material Inward successfull"
        }
        subTitle={
          title === "Sfg"
            ? `SFG Inward ${po?.materialInId}  (${
                po?.components?.length
              } component${po?.components?.length > 1 ? "s" : ""}) ${
                po?.poId ? `from  ${po?.poId}` : ""
              } from ${po?.vendor}`
            : `Material Inward ${po?.materialInId}  (${
                po?.components?.length
              } component${po?.components?.length > 1 ? "s" : ""}) ${
                po?.poId ? `from  ${po?.poId}` : ""
              } from ${po?.vendor?.vendorname}`
        }
        extra={[
          <Row justify="center" gutter={16}>
            <Col>
              <CommonIcons action={"refreshButton"} onClick={newMinFunction} />
            </Col>
            {/* <Col>
              <CommonIcons
                loading={printLoading}
                action={"printButton"}
                onClick={printFun}
              />
            </Col> */}
            <Col>
              <CommonIcons
                loading={downloadLoading}
                action={"downloadButton"}
                onClick={title === "Sfg" ? downloadExcel : handleDownload}
              />
            </Col>
          </Row>,
          <Row style={{ marginTop: 15, height: "40vh" }}>
            <MyDataTable data={rows} columns={successColumns} />
          </Row>,
        ]}
      />
    </div>
  );
}
