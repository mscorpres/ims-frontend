import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, Form, Input, Row } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import MyDataTable from "../../Components/MyDataTable";

export default function AddCostCenter({
  setShowAddCostModal,
}) {
  const [centerData, setCenterData] = useState([]);
  const [newCostCenter, setNewCostCenter] = useState({
    code: "",
    name: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const inputHandler = (name, value) => {
    let obj = newCostCenter;
    obj = { ...obj, [name]: value };
    setNewCostCenter(obj);
  };
  const submitCostCenter = async () => {
    if (newCostCenter.name.length > 0 && newCostCenter.code.length > 0) {
      try {
        setSubmitLoading(true);
        const response = await imsAxios.post("/purchaseOrder/createCostCenter", {
          code: newCostCenter.code,
          name: newCostCenter.name,
        });

        const isSuccess =
          response?.success === true ||
          response?.code === 200 ||
          response?.status === "success";

        if (isSuccess) {
          toast.success(response?.message || "Cost center created successfully");
          setNewCostCenter({
            code: "",
            name: "",
          });
          if (typeof setShowAddCostModal === "function") {
            setShowAddCostModal(false);
          }
          handleFetchUOMList();
        } else {
          toast.error(response?.message || "Failed to create cost center");
        }
      } catch (error) {
        toast.error(error?.message || "Failed to create cost center");
      } finally {
        setSubmitLoading(false);
      }
    } else {
      toast.error("Cost Center should have a Name and ID");
    }
  };

  const handleFetchUOMList = async () => {
    try {
      const response = await imsAxios.get("backend/costCenter");

      if (response?.success) {
        const formattedRows = (response?.data ?? []).map((item, index) => ({
          ...item,
          id: item?.uID || `${item?.name || ""}-${item?.code || ""}-${index}`,
        }));
        setCenterData(formattedRows);
      } else {
        toast.error(response?.message || "Failed to fetch cost centers");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch cost centers");
    }
  };

  const columns = [
    // { field: "id", headerName: "#", minWidth: 170, flex: 1},

    { field: "code", headerName: "Cost Center ID", minWidth: 170, flex: 1 },
    { field: "name", headerName: "Cost Center Name", minWidth: 220, flex: 1 },
    { field: "timestamp", headerName: "Date", minWidth: 170, flex: 1 },
  ];

  useEffect(() => {
    // if (centerData.length === 0) {
      handleFetchUOMList();
    // } 
   
  }, []);

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
                inputMode="numeric"
                value={newCostCenter.code}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  inputHandler("code", digitsOnly);
                }}
                placeholder="Enter Cost Center ID"
              />
            </Form.Item>
            <Form.Item label="Cost Center Name">
              <Input
                value={newCostCenter.name}
                onChange={(e) => {
                  inputHandler("name", e.target.value);
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
