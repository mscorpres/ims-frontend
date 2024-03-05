import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Drawer, Form, Input, Row } from "antd";
import { imsAxios } from "../../../axiosInterceptor";

export default function CreateCostModal({
  setShowAddCostModal,
  showAddCostModal,
}) {
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

  return (
    <Drawer
      title="Add Cost Center"
      placement="right"
      onClose={() => setShowAddCostModal(null)}
      open={showAddCostModal}
    >
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
    </Drawer>
  );
}
