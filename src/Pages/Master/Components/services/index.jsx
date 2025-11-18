import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import UpdateService from "./UpdateService";
import { v4 } from "uuid";
import { Col, Form, Input, Row, Space } from "antd";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";
import { downloadServiceMaster } from "../../../../api/master/component.ts";
import useApi from "../../../../hooks/useApi.ts";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox.jsx";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";
import { renderIcon } from "../../../../new/components/layout/Sidebar/iconMapper.tsx";
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";

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
  const columns = useMemo(() => materialColumn(), []);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
      },
    },
    renderTopToolbar: () =>
      loading  ? (
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        icon={renderIcon("EditIcon")}
        key="edit"
        label="Update"
        onClick={() => {
          setEditService({
            componentKey: row?.original?.component_key,
            partNo: row?.original?.c_part_no,
          });
          closeMenu();
        }}
        table={table}
      />,
    ],
  });

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

    data.map((d) => u.push({ text: d.units_name, value: d.units_id }));
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
    <div style={{ height: "90%",margin:"12px" }}>
      <UpdateService
        units={units}
        editService={editService}
        setEditService={setEditService}
        getServices={getServices}
      />
      <Row gutter={8} style={{ height: "100%"}}>
        <Col span={8}>
          <CustomFieldBox title="Service Details">
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
                              UoM
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
                      <CustomButton
                        loading={loading1("download")}
                        variant="text"
                        onclick={handleDownloadMaster}
                        title="Download Master"
                        endicon={renderIcon("DownloadIcon")}
                        size="small"
                      />
                      <CustomButton
                        variant="outlined"
                        onclick={resetFun}
                        title="Reset"
                        endicon={renderIcon("ResetIcon")}
                      />
                      <CustomButton
                        variant="submit"
                        onclick={addService}
                        title="Add"
                        endicon={renderIcon("PlusIcon")}
                        loading={submitLoading}
                      />
                    </Space>
                  </Row>
                </Col>
              </Row>
            </Form>
          </CustomFieldBox>
        </Col>
        <Col span={16} style={{ height: "100%" }}>
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
}

export default Services;

const materialColumn = () => {
  {
    return [
      {
        accessorKey: "index",
        header: "Serial No.",
        size: 30,
      },
      {
        accessorKey: "c_part_no",
        header: "Part",
        size: 50,
      },
      {
        accessorKey: "c_name",
        header: "Component",
        size: 150,
      },
      {
        accessorKey: "units_name",
        header: "UoM",
        size: 150,
      },
    ];
  }
};
