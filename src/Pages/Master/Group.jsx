import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";

const Group = () => {
  const { pathname } = useLocation();
  const [newGroup, setNewGroup] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [tableLoading, setTableLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [search, setSearch] = useState("");

  const columns = [
    { field: "ID", headerName: "Serial No", width: 100 },
    { field: "group_name", headerName: "Group Name", flex: 1 },
  ];

  const addGroup = async (e) => {
    e.preventDefault();
    if (!newGroup) {
      toast.error("Please Add a Group");
    } else {
      setSubmitLoading(true);
      const response = await imsAxios.post("/groups/insert", {
        group_name: newGroup,
      });
      setSubmitLoading(false);
      if (response?.success) {
        fetchGroup();
        setNewGroup("");
      } else if (!response.success) {
        toast.error(response.message);
      }
    }
  };

  const fetchGroup = async () => {
    setTableLoading(true);

    const { data } = await imsAxios.get("/groups/allGroups");
    setTableLoading(false);
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setGroupData(arr);
  };

  const reset = () => {
    setNewGroup("");
  };

  useEffect(() => {
    const res = groupData.filter((a) => {
      return a?.group_name.toLowerCase().match(search.toLowerCase());
    });
    setFilterData(res);
  }, [search]);
  useEffect(() => {
    fetchGroup();
  }, []);
  return (
    <div style={{ height: "100%" }}>
      <Row gutter={8} style={{ padding: "0 10px", height: "100%" }}>
        <Col span={8}>
          <Card title="Add Group" size="small">
            <Form layout="vertical">
              <Form.Item label="Group Name">
                <Input
                  placeholder="Enter Group Name.."
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
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
                    onClick={addGroup}
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
            data={groupData}
            columns={columns}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Group;
