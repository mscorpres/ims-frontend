import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, Drawer, Form, Input, Row } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import MyDataTable from "../../Components/MyDataTable";
import { render } from "react-dom";

export default function AddCostCenter({
  setShowAddCostModal,
  showAddCostModal,
}) {
  const [centerData, setCenterData] = useState([]);
  const [newCostCenter, setNewCostCenter] = useState({
    cost_center_name: "",
    cost_center_id: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const inputHandler = (name, value) => {
    let obj = newCostCenter;
    obj = { ...obj, [name]: value };
    setNewCostCenter(obj);
  };
  const submitCostCenter = async () => {
    if (
      newCostCenter.cost_center_id.length > 0 &&
      newCostCenter.cost_center_name.length > 0
    ) {
      setSubmitLoading(true);

      const { data } = await imsAxios.post("/purchaseOrder/createCostCenter", {
        cost_center_id: newCostCenter.cost_center_id,
        cost_center_name: newCostCenter.cost_center_name,
      });
      setSubmitLoading(false);
      if (data.code == 200) {
        toast.success(data.message);
        setShowAddCostModal(false);
        setNewCostCenter({
          cost_center_name: "",
          cost_center_id: "",
        });
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Cost Center should have a Name and ID");
    }
  };

  const handleFetchUOMList = async () => {
    try {
      const response = await imsAxios.get("backend/getAllCostCenters");
   
      setCenterData(response?.data?.data ?? []);
    } catch (error) {}
  };

  const columns = [
    // { field: "id", headerName: "#", minWidth: 170, flex: 1},
   
    { field: "cost_center_short_name", headerName: "Cost Center Name", minWidth: 170, flex: 1, renderCell: (params) => `${params.row.cost_center_short_name} (${params.row.cost_center_name})` },
    { field: "cost_center_indt", headerName: "Date", minWidth: 170, flex: 1 },
  ];

  useEffect(() => {
    if (centerData.length === 0) {
      handleFetchUOMList();
    } 
   
  }, [centerData]);

   

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "1fr 2fr",
        padding: "20px",
      }}
    >
      <div>
        <Card title="Add Cost Center" style={{ width: "100%" }}>
          <Form layout="vertical" style={{ height: "95%" }}>
            <Form.Item label="Cost Center Id">
              <Input
                value={newCostCenter.cost_center_name}
                onChange={(e) => {
                  inputHandler("cost_center_name", e.target.value);
                }}
                placeholder="Enter Cost Center ID"
              />
            </Form.Item>
            <Form.Item label="Cost Center Name">
              <Input
                value={newCostCenter.cost_center_id}
                onChange={(e) => {
                  inputHandler("cost_center_id", e.target.value);
                }}
                placeholder="Enter Cost Center Name"
              />
            </Form.Item>
          </Form>
          <Row justify="end">
            <Button
              onClick={submitCostCenter}
              loading={submitLoading}
              type="primary"
            >
              Submit
            </Button>
          </Row>
        </Card>
      </div>
      <div className="m-2" style={{ height: "100%" }}>
        <div style={{ height: "80vh" }}>
          <MyDataTable
            // loading={loading("fetch")}
            data={centerData}
            
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
