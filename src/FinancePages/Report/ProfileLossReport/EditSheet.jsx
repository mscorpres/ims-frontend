import { Col, Drawer, Input, Row, Skeleton, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";

function EditSheet({ editingSheet, setEditingSheet }) {
  const [editingData, setEditingData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  let arr = [];
  const getEditingData = async () => {
    setLoading("fetch");
    const response = await imsAxios.get("/tally/reports/editPl");
    setLoading(false);
    let { data } = response;
    if (data) {
      if (data.code === 200) {
        setEditingData(data.data);
      }
    }
  };
  const getSubGroup = async (search) => {
    setLoading("select");
    const response = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row) => ({
          text: row.label,
          value: row.id,
        }));
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  const inputHandler = (masterCode, groupCode, name, value) => {
    let data = editingData;
    data = data.map((row) => {
      if (row.code === masterCode) {
        let group = row.children;
        group = group.map((gr) => {
          if (gr.key === groupCode) {
            if (name === "children") {
              gr.children = value.filter((value) => value.value);
            } else if (name === "note") {
              gr.note = value;
            }
            return gr;
          } else {
            return gr;
          }
        });
        row = { ...row, children: group };
        return row;
      } else {
        return row;
      }
    });
    setEditingData(data);
  };
  const updateGroup = async (groupCode, values) => {
    let finalObj = {
      subgroups: values.children.map((row) => row.value),
      group_code: groupCode,
      note: values.note ?? "",
    };
    setLoading(groupCode);
    const response = await imsAxios.post(
      "/tally/reports/updatePlReport",
      finalObj
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  useEffect(() => {
    if (editingSheet) {
      getEditingData();
    }
  }, [editingSheet]);
  return (
    <Drawer
      title="Customizing Balance sheet report"
      onClose={() => setEditingSheet(false)}
      open={editingSheet}
      width="100vw"
    >
      {loading !== "fetch" &&
        editingData.map((row) => (
          <Row key={row.code}>
            <Typography.Title level={4}>{row.name}</Typography.Title>
            {row.children.map((group) => (
              <Col span={24} style={{ margin: "0 20px" }}>
                <Row gutter={8} style={{ margin: 10 }}>
                  <Col span={4}>
                    <Typography.Title level={5}>{group.name}</Typography.Title>
                  </Col>
                  <Col span={2}>
                    <Input
                      value={group.note}
                      onChange={(e) =>
                        inputHandler(
                          row.code,
                          group.key,
                          "note",
                          e.target.value
                        )
                      }
                      placeholder="Note"
                    />
                  </Col>
                  <Col span={16}>
                    <MyAsyncSelect
                      mode="multiple"
                      labelInValue={true}
                      value={group.children}
                      loadOptions={getSubGroup}
                      onChange={(value) =>
                        inputHandler(row.code, group.key, "children", value)
                      }
                      optionsState={asyncOptions}
                      selectLoading={loading === "select"}
                      onBlur={() => setAsyncOptions([])}
                    />
                  </Col>
                  <Col span={2}>
                    <CommonIcons
                      loading={loading === group.key}
                      onClick={() => updateGroup(group.key, group)}
                      action="checkButton"
                    />
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        ))}
      {loading === "fetch" && (
        <>
          <Row>
            <Typography.Title level={4}>
              <Skeleton.Button active />
            </Typography.Title>
            <Col span={24} style={{ margin: "0 20px" }}>
              <Row gutter={8} style={{ margin: 10 }}>
                <Col span={6}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={14}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Avatar
                    style={{ marginTop: 8 }}
                    active
                    shape="circle"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24} style={{ margin: "0 20px" }}>
              <Row gutter={8} style={{ margin: 10 }}>
                <Col span={6}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={14}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Avatar
                    style={{ marginTop: 8 }}
                    active
                    shape="circle"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Typography.Title level={4}>
              <Skeleton.Button active />
            </Typography.Title>
            <Col span={24} style={{ margin: "0 20px" }}>
              <Row gutter={8} style={{ margin: 10 }}>
                <Col span={6}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={14}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Avatar
                    style={{ marginTop: 8 }}
                    active
                    shape="circle"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24} style={{ margin: "0 20px" }}>
              <Row gutter={8} style={{ margin: 10 }}>
                <Col span={6}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={14}>
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                  <Skeleton.Button style={{ marginTop: 8 }} active block />
                </Col>
                <Col span={2}>
                  <Skeleton.Avatar
                    style={{ marginTop: 8 }}
                    active
                    shape="circle"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      )}
    </Drawer>
  );
}

export default EditSheet;
