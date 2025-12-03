import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, Col, Form, Input, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";

const SubGroup = () => {
  const [form] = Form.useForm();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [subGroupName, setSubGroupName] = useState("");
  const [subGroupDesc, setSubGroupDesc] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [subGroupData, setSubGroupData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);

  // Fetch groups for dropdown
  const fetchGroups = async (search = "") => {
    try {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/groups/groupSelect2", {
        searchTerm: search,
      });
      if (data?.code === 200 || data?.data) {
        const arr = (data.data || data).map((row) => ({
          text: row.text,
          value: row.id || row.key,
        }));
        setGroupOptions(arr);
        setAsyncOptions(arr);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroupOptions([]);
      setAsyncOptions([]);
    } finally {
      setSelectLoading(false);
    }
  };

  // Fetch subgroup list
  const fetchSubGroup = async () => {
    try {
      setTableLoading(true);
      const data = await imsAxios.get("/master/subgroup/list");
      setTableLoading(false);

      if (data?.success && data?.data) {
        const arr = data.data.map((row, index) => ({
          id: row.subGroup?.key || v4(),
          serialNo: index + 1,
          groupName: row.group?.name || "--",
          groupKey: row.group?.key || "--",
          subGroupName: row.subGroup?.name || "--",
          subGroupKey: row.subGroup?.key || "--",
          subGroupDesc: row.subGroupDesc || "--",
          createdAt: row.createdAt || "--",
        }));
        setSubGroupData(arr);
      } else {
        setSubGroupData([]);
      }
    } catch (error) {
      console.error("Error fetching subgroups:", error);
      setTableLoading(false);
      setSubGroupData([]);
      toast.error("Failed to fetch subgroup list");
    }
  };

  // Submit new subgroup
  const addSubGroup = async () => {
    if (!selectedGroup) {
      toast.error("Please select a Group");
      return;
    }
    if (!subGroupName.trim()) {
      toast.error("Please enter Sub Group Name");
      return;
    }
    if (!subGroupDesc.trim()) {
      toast.error("Please enter Description");
      return;
    }

    try {
      setSubmitLoading(true);
      const groupKey =
        typeof selectedGroup === "object" ? selectedGroup.value : selectedGroup;

      const payload = {
        groupId: groupKey,
        subGroupName: subGroupName.trim(),
        subGroupDesc: subGroupDesc.trim(),
      };

      const { data } = await imsAxios.post("/master/subgroup/add", payload);
      setSubmitLoading(false);

      if (data?.code === 200 || data?.success) {
        toast.success("Sub Group added successfully");
        reset();
        fetchSubGroup();
      } else {
        toast.error(
          data?.message?.msg || data?.message || "Failed to add Sub Group"
        );
      }
    } catch (error) {
      setSubmitLoading(false);
      console.error("Error adding subgroup:", error);
      toast.error(
        error?.response?.data?.message?.msg || "Failed to add Sub Group"
      );
    }
  };

  const reset = () => {
    setSelectedGroup(null);
    setSubGroupName("");
    setSubGroupDesc("");
    form.resetFields();
  };

  const columns = [
    { field: "serialNo", headerName: "Serial No", width: 100 },
    { field: "groupName", headerName: "Group Name", flex: 1 },
    { field: "subGroupName", headerName: "Sub Group Name", flex: 1 },
    { field: "subGroupDesc", headerName: "Description", flex: 2 },
    { field: "createdAt", headerName: "Created At", width: 150 },
  ];

  useEffect(() => {
    fetchGroups();
    fetchSubGroup();
  }, []);
console.log(subGroupData,"subGroupData")
  return (
    <div style={{ height: "100%" }}>
      <Row gutter={8} style={{ padding: "0 10px", height: "100%" }}>
        <Col span={8}>
          <Card title="Add Sub Group" size="small">
            <Form form={form} layout="vertical">
              <Form.Item
                label="Group"
                rules={[{ required: true, message: "Please select a Group" }]}
              >
                <MyAsyncSelect
                  placeholder="Select Group..."
                  optionsState={asyncOptions}
                  loadOptions={fetchGroups}
                  onBlur={() => setAsyncOptions([])}
                  onChange={(value) => {
                    setSelectedGroup(value);
                    form.setFieldValue("group", value);
                  }}
                  value={selectedGroup}
                />
              </Form.Item>

              <Form.Item
                label="Sub Group Name"
                rules={[
                  { required: true, message: "Please enter Sub Group Name" },
                ]}
              >
                <Input
                  placeholder="Enter Sub Group Name..."
                  value={subGroupName}
                  onChange={(e) => {
                    setSubGroupName(e.target.value);
                    form.setFieldValue("subGroupName", e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Description"
                rules={[
                  { required: true, message: "Please enter Description" },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter Description..."
                  value={subGroupDesc}
                  onChange={(e) => {
                    setSubGroupDesc(e.target.value);
                    form.setFieldValue("description", e.target.value);
                  }}
                />
              </Form.Item>
            </Form>
            <Row justify="end">
              <Col>
                <Space>
                  <MyButton onClick={reset} variant="reset">
                    Reset
                  </MyButton>
                  <MyButton
                    loading={submitLoading}
                    type="primary"
                    onClick={addSubGroup}
                    variant="add"
                  >
                    Submit
                  </MyButton>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "85%" }} span={16}>
          <MyDataTable
            loading={tableLoading}
            data={subGroupData}
            columns={columns}
          />
        </Col>
      </Row>
    </div>
  );
};

export default SubGroup;
