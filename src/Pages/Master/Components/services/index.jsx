import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UpdateService from "./UpdateService";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import MySelect from "../../../../Components/MySelect";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../../axiosInterceptor";
import MyButton from "../../../../Components/MyButton";
import {
  downloadServiceMaster,
} from "../../../../api/master/component";
import useApi from "../../../../hooks/useApi";

function Services() {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [editService, setEditService] = useState(null);
  const [newService, setNewService] = useState({
    part: "",
    uom: "",
    component: "",
    notes: "",
  });

  const { executeFun, loading: loading1 } = useApi();
  const getServices = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/component/service");
    setLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
    }
  };

  const getUnits = async () => {
    const { data } = await imsAxios.get("/uom");
    let u = [];

    data.data.map((d) => u.push({ text: d.units_name, value: d.units_id }));
    setUnits(u);
  };

  const addService = async (e) => {
    e.preventDefault();
    if (!newService.part) {
      return toast.error("Please enter part no.");
    } else if (!newService.uom) {
      return toast.error("please select a unit");
    } else if (!newService.component) {
      return toast.error("Please enter a component name");
    } else if (!newService.notes) {
      return toast.error("Please enter a note");
    }
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/component/addServices", {
      ...newService,
      uom: newService.uom,
    });
    setSubmitLoading(false);
    if (data.code == 200) {
      getServices();
      resetFun();
      toast.success(data.message);
    } else {
      toast.error(data.message.msg);
    }
  };
  const resetFun = () => {
    setNewService({
      part: "",
      uom: "",
      component: "",
      notes: "",
    });
  };
  const inputHandler = (name, value) => {
    let obj = newService;
    obj = { ...obj, [name]: value };
    setNewService(obj);
  };
  const columns = [
    { headerName: "Serial No.", width: 100, field: "index" },
    { headerName: "Part", width: 150, field: "c_part_no" },
    { headerName: "Component", flex: 1, field: "c_name" },
    { headerName: "UOM", width: 120, field: "units_name" },
    {
      headerName: "Action",
      type: "actions",
      field: "action",
      getActions: ({ row }) => [
        <TableActions
          action="edit"
          onClick={() =>
            setEditService({
              componentKey: row.component_key,
              partNo: row.c_part_no,
            })
          }
        />,
      ],
    },
  ];
  const handleDownloadMaster = async () => {
    const response = await executeFun(downloadServiceMaster, "download");
    if (response.success) {
      window.open(response.data.filePath, "_blank", "noreferrer");
    }
  };
  useEffect(() => {
    getUnits();
    getServices();
  }, []);
  return (
    <div style={{ height: "90%" }}>
      <UpdateService
        units={units}
        editService={editService}
        setEditService={setEditService}
        getServices={getServices}
      />
      <Row gutter={8} style={{ height: "100%", padding: "0 10px" }}>
        <Col span={8}>
          <Card title="Add Service" size="small">
            <Form size="small" layout="vertical">
              <Row>
                <Col span={24}>
                  <Row gutter={8}>
                    <Col span={18}>
                      <Form.Item
                        label={
                          <span
                            style={{
                              fontSize: window.innerWidth < 1600 && "0.7rem",
                            }}
                          >
                            Part Number
                          </span>
                        }
                      >
                        <Input
                          size="default"
                          value={newService.part}
                          onChange={(e) => inputHandler("part", e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <span
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              UOM
                            </span>
                          }
                        >
                          <MySelect
                            size="default"
                            options={units}
                            value={newService.uom}
                            onChange={(value) => inputHandler("uom", value)}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                </Col>

                <Col span={24}>
                  <Form.Item label=" Component Name">
                    <Input
                      size="default"
                      value={newService.component}
                      onChange={(e) =>
                        inputHandler("component", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form size="small" layout="vertical">
                    <Form.Item label="Specification">
                      <Input
                        size="default"
                        value={newService.notes}
                        onChange={(e) => inputHandler("notes", e.target.value)}
                      />
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={24}>
                  <Row justify="end">
                    <Space>
                      <MyButton
                        // loading={loading1("download")}
                        text="Download Master"
                        variant="downloadSample"
                        onClick={handleDownloadMaster}
                      />
                      <Button size="default" onClick={resetFun}>
                        Reset
                      </Button>
                      <Button
                        size="default"
                        onClick={addService}
                        loading={submitLoading}
                        type="primary"
                      >
                        Save
                      </Button>
                    </Space>
                  </Row>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={16} style={{ height: "100%" }}>
          <MyDataTable loading={loading} rows={rows} columns={columns} />
        </Col>
      </Row>
    </div>
  );
}

export default Services;
