import { useEffect } from "react";
import { Col, Row } from "antd";
import AddCostCenterForm from "./AddCostCenterForm";
import CostCenterTable from "./CostCenterTable";
import { imsAxios } from "../../../axiosInterceptor";
import { useState } from "react";

const CostCenter = () => {
  const [loading, setLoading] = useState(false);
  const [costCenteres, setCostCenteres] = useState([]);
  const getCostCenters = async () => {
    try {
      setLoading("fetchingRows");
      const { data } = await imsAxios.get("/costCenter", {
        search: "",
      });
      if (data) {
        const arr = data.data.map((row, index) => ({
          id: index,
          index: index + 1,
          ...row,
        }));
        setCostCenteres(arr);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCostCenters();
  }, []);
  return (
    <Row style={{ height: "90%", padding: 5, paddingTop: 0 }} gutter={6}>
      <Col span={4}>
        <AddCostCenterForm getRows={getCostCenters} />
      </Col>
      <Col span={20}>
        <CostCenterTable loading={loading} rows={costCenteres} />
      </Col>
    </Row>
  );
};

export default CostCenter;
