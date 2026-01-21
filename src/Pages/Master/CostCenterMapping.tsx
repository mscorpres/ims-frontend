import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, Drawer, Form, Input, Row } from "antd";
//@ts-ignore
import MyAsyncSelect from "../../Components/MyAsyncSelect";
//@ts-ignore
import { imsAxios } from "../../axiosInterceptor";
//@ts-ignore
import MyDataTable from "../../Components/MyDataTable";
import { getCostCentresOptions } from "../../api/general";
import { convertSelectOptions } from "../../utils/general";
import useApi from "@/hooks/useApi";

export default function CostCenterMapping() {
      const { executeFun, loading: loading1 } = useApi();
  const [mappingData, setMappingData] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [newCostCenter, setNewCostCenter] = useState({
    costCenterName: "",
    leaderName: "",
    memberName: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const inputHandler = (name: any, value: any) => {
    let obj = newCostCenter;
    obj = { ...obj, [name]: value };
    setNewCostCenter(obj);
  };
   const handleFetchCostCenterOptions = async (search:any) => {
      const response = await executeFun(() => getCostCentresOptions(search), "select");
      let arr:any = [];
      if (response.success) arr = convertSelectOptions(response.data);
      setUserOptions(arr);
    };
  const submitCostCenter = async () => {
    if (
      newCostCenter.costCenterName.length > 0 &&
      newCostCenter.leaderName.length > 0 &&
      newCostCenter.memberName.length > 0
    ) {
      setSubmitLoading(true);
      const payload = {
        costName: newCostCenter.costCenterName,
        leaderId: newCostCenter.leaderName,
        memberId: newCostCenter.memberName,
      };
      console.log(payload,"data")
      return

      const { data } = await imsAxios.post("/purchaseOrder/createCostCenter",payload );
      setSubmitLoading(false);
      if (data.code == 200) {
        toast.success(data.message);
        setNewCostCenter({
          costCenterName: "",
          leaderName: "",
          memberName: "",
        });
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Cost Center should have a Name and ID");
    }
  };

  const getusers = async (value: any) => {
    if (value?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/fetchAllUser", {
        search: value,
      });
      setSelectLoading(false);
      let arr = [];
      if (!data.msg) {
        arr = data.map((d: any) => {
          return { text: d.text, value: d.id };
        });
        setUserOptions(arr);
      } else {
        setUserOptions([]);
      }
    }
  };

  const fetchCostCenterMapping = async () => {
    try {
      const response = await imsAxios.get(
        "/admin/costCenterMapping/fetchPOuserWithCostCenter",
      );
      if (response?.data?.code !== 200) {
        toast.error(response?.data?.message ?? "Failed to fetch data");
        return;
      }

      setMappingData(response?.data?.data ?? []);
    } catch (error) {}
  };

  const columns = [
    { field: "id", headerName: "#", minWidth: 170, flex: 1 },

    { field: "leaderName", headerName: "Leader Name", minWidth: 170, flex: 1 },
    { field: "memberName", headerName: "Member Name", minWidth: 170, flex: 1 },
    {
      field: "costName",
      headerName: "Cost Center Name",
      minWidth: 170,
      flex: 1,
    },
  ];

  useEffect(() => {
    if (mappingData.length === 0) {
      fetchCostCenterMapping();
    }
  }, [mappingData]);

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
        <Card title="Enter Details " style={{ width: "100%" }}>
          <Form layout="vertical" style={{ height: "95%" }}>
            <Form.Item label="Leader Name">
              <MyAsyncSelect
                selectLoading={selectLoading}
                size="default"
                onBlur={() => setUserOptions([])}
                optionsState={userOptions}
                loadOptions={getusers}
                onChange={(value: any) => inputHandler("leaderName", value)}
              />
            </Form.Item>
            <Form.Item label="Member Name">
              <MyAsyncSelect
                selectLoading={selectLoading}
                size="default"
                onBlur={() => setUserOptions([])}
                optionsState={userOptions}
                loadOptions={getusers}
                onChange={(value: any) => inputHandler("memberName", value)}
              />
            </Form.Item>
            <Form.Item label="Cost Center Name">
              <MyAsyncSelect selectLoading={loading1("select")} onBlur={() => setUserOptions([])} loadOptions={handleFetchCostCenterOptions} optionsState={userOptions} />
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
            data={mappingData}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
