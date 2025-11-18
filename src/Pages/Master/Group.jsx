import React, { useEffect, useState,useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";
import { renderIcon } from "../../new/components/layout/Sidebar/iconMapper.tsx";
import CustomFieldBox from "../../new/components/reuseable/CustomFieldBox.jsx";

const Group = () => {
  const { pathname } = useLocation();
  const [newGroup, setNewGroup] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [tableLoading, setTableLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [search, setSearch] = useState("");

  const groupColumns = [
    { accessorKey: "ID", header: "Serial No"},
    { accessorKey: "group_name", header: "Group Name",width: 150 },
  ];
  const columns = useMemo(() => groupColumns, []);

  const table = useMaterialReactTable({
    columns: columns,
    data: groupData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: tableLoading ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
      },
    },
    renderTopToolbar: () =>
      tableLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });
  const addGroup = async (e) => {
    e.preventDefault();
    if (!newGroup) {
      toast.error("Please Add a Group");
    } else {
      setSubmitLoading(true);
      const { data } = await imsAxios.post("/groups/insert", {
        group_name: newGroup,
      });
      setSubmitLoading(false);
      if (data.code === 200) {
        // toast.success("Group Added");
        fetchGroup();
        setNewGroup("");
      } else if (data.code === 500) {
        toast.error(data.message.msg);
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
      <Row gutter={8} style={{ height: "100%" }}>
        <Col span={8}>
          <CustomFieldBox title="Add Group">
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
                <CustomButton
                  size="small"
                  title={"Reset"}
                  starticon={renderIcon("ResetIcon")}
                  onclick={reset}
                  variant="outlined"
                  htmlType="reset"
                />

                <CustomButton
                  size="small"
                  title={"Submit"}
                  starticon={renderIcon("CheckCircleOutlined")}
                  loading={submitLoading}
                  onclick={addGroup}
                  htmlType="submit"
                />
                </Space>
              </Col>
            </Row>
          </CustomFieldBox>
        </Col>
        <Col span={16}>
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
};

export default Group;
