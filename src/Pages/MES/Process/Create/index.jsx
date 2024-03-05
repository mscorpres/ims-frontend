import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import AddProcessForm from "./AddProcessForm";
import ProcessTable from "./ProcessTable";
import { processApi } from "../../api";

const CreateProcess = () => {
  const [loading, setLoading] = useState();
  const [rows, setRows] = useState([]);

  const getAllProcesses = async () => {
    setLoading("fetch");
    const { data, success, error } = await processApi.getAllProcesses();
    setLoading(false);
    setRows(data);
  };

  useEffect(() => {
    getAllProcesses();
  }, []);

  return (
    <Row gutter={6} style={{ padding: 5, paddingTop: 0, height: "93%" }}>
      <Col span={4}>
        <AddProcessForm loading={loading} setLoading={setLoading} />
      </Col>
      <Col span={20}>
        <ProcessTable rows={rows} loading={loading === "fetch"} />
      </Col>
    </Row>
  );
};

export default CreateProcess;
