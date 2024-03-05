import React, { useEffect, useState } from "react";
import "./accounts.css";
import Tree from "../../Components/Tree";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../Components/Loading";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { imsAxios } from "../../axiosInterceptor";

export default function CreateSubGroup() {
  const [newsubGroup, setNewSubGroup] = useState({
    group_name: "",
    code: "",
    parent: "",
  });
  const [subGroups, setSubGroups] = useState([]);
  // const [searchInput, setSearchInput] = useState("");
  const [subGroupAsyncOptions, setSubGroupAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const { Option } = Select;
  const subGroupOptions = [
    { label: "Assets", values: "A" },
    { label: "Liabilities", values: "L" },
    { label: "Income", values: "I" },
    { label: "Expense", values: "E" },
    { label: "Reserves Surplus", values: "R" },
    { label: "Bank Accounts", values: "B" },
  ];
  const getSubGroupsTree = async () => {
    const { data } = await imsAxios.get("/tally/sub_group_tree");
    setSubGroups(data.data);
  };

  const getSubGroupSelect = async (value) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/getSubgroup", {
      search: value,
    });
    let arr = [];
    setSelectLoading(false);
    if (data.code == 200) {
      arr = data.data.map((d) => {
        return { text: d.label, value: d.id };
      });
      setSubGroupAsyncOptions(arr);
    } else {
      setSubGroupAsyncOptions([]);
    }
    // return arr;
  };
  const inputHandler = (name, value) => {
    setNewSubGroup((newsubGroup) => {
      return { ...newsubGroup, [name]: value };
    });
  };
  const createNewSubGroup = async () => {
    if (!newsubGroup.parent || newsubGroup.parent == "") {
      return toast.error("Please select a parent");
    } else if (!newsubGroup.group_name || newsubGroup.group_name == "") {
      return toast.error("Please Enter a Sub group Name");
    } else if (!newsubGroup.code || newsubGroup.code == "") {
      return toast.error("Please Enter a Code");
    }
    setFormLoading(true);
    const { data } = await imsAxios.post("/tally/create_sub_group", {
      ...newsubGroup,
      parent: newsubGroup.parent,
    });
    setFormLoading(false);
    getSubGroupsTree();
    reset();
    if (data.code == 200) {
      toast.success("Sub Group added succesfully");
    } else {
      toast.error(data.message.msg);
    }
  };
  const reset = () => {
    setNewSubGroup({
      group_name: "",
      code: "",
      parent: "",
    });
  };
  useEffect(() => {
    getSubGroupsTree();
  }, []);

  const { Title } = Typography;
  useEffect(() => {}, [subGroupAsyncOptions]);
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* sub groups */}
      <Row
        gutter={4}
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "all",
          position: "relative",
          padding: "0px 5px",
          height: "100%",
        }}
      >
        <Col span={8}>
          <Card title="Add Sub Group" size="small">
            <Row gutter={8}>
              <Col span={24}>
                <Form size="small" layout="vertical">
                  <Form.Item label="Code">
                    <Input
                      size="default"
                      value={newsubGroup.code}
                      onChange={(e) => {
                        inputHandler("code", e.target.value);
                      }}
                      placeholder="Enter New Sub Group Code.."
                    />
                  </Form.Item>

                  <Form.Item label="Sub Group Name">
                    <Input
                      size="default"
                      value={newsubGroup.group_name}
                      onChange={(e) => {
                        inputHandler("group_name", e.target.value);
                      }}
                      placeholder="Enter New Sub Group Name.."
                    />
                  </Form.Item>

                  <Form.Item label="Under Group">
                    <MyAsyncSelect
                      onBlur={() => {
                        setSubGroupAsyncOptions([]);
                      }}
                      value={newsubGroup.parent}
                      onChange={(value) => {
                        inputHandler("parent", value);
                      }}
                      optionsState={subGroupAsyncOptions}
                      loadOptions={getSubGroupSelect}
                      placeholder="Search..."
                      selectLoading={selectLoading}
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
            <Row justify="end">
              <Space>
                <Button
                  type="primary"
                  onClick={createNewSubGroup}
                  loading={formLoading}
                >
                  Save
                </Button>
                <Button type="secondary" onClick={reset}>
                  Reset
                </Button>
              </Space>
            </Row>
          </Card>
        </Col>
        <Col span={16} style={{ position: "relative" }}>
          <Card
            size="small"
            style={{ height: "90%", padding: 5 }}
            title="Sub Groups"
          >
            {loading && <Loading />}
            {subGroups.length > 0 && <Tree subGroups={subGroups} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
