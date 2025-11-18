import { Col, Form, Input, Row } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

function QaProcess() {
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const addRows = async (values) => {
    console.log("values", values);
    const data = await imsAxios.post("/qaProcessmaster/insert_Process", values);

    console.log("row Data", data);
    if (data.status === "200" || data.status === 200) {
      getRows();
    }
  };
  const getRows = async () => {
    const response = await imsAxios.get("/qaProcessmaster/fetch_Process");
    // console.log("datadata", data.data);
    if (response.status === "200" || response.status === 200) {
      const { data } = response.data;
      console.log("datadata", data);
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    }
  };
  const submitForm = async () => {
    const values = await form.validateFields();
    console.log("form value", values);
    addRows(values);
  };
  const columns = [
    {
      header: "Index",
      accessorKey: "index",
      size: 100,
    },
    {
      header: "Process Code",
      accessorKey: "process_code",
      flex: 1,
    },
    {
      header: "Process Name",
      accessorKey: "process_name",
      flex: 1,
    },
    {
      header: "Process Decsription",
      accessorKey: "process_desc",
      flex: 1,
    },
  ];
  useEffect(() => {
    getRows();
  }, []);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height: "calc(100vh - 250px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,
  });

  return (
    <div style={{ height: "calc(100vh - 100px)", margin: 12 }}>
      <Row gutter={10} span={24}>
        <Col span={8}>
          <CustomFieldBox title={"Fill Details"}>
            <Form form={form} size="small" layout="vertical">
              <Form.Item
                name="processName"
                label="Process Name"
                rules={rules.processName}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="processDesc"
                label="Process Description"
                rules={rules.processDesc}
              >
                <Input />
              </Form.Item>
            </Form>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <CustomButton size="small" variant="outlined" title={"Reset"} />
              <CustomButton
                size="small"
                title={"submit"}
                onclick={submitForm}
              />
            </div>
          </CustomFieldBox>
        </Col>

        <Col style={{ height: "100%" }} span={16}>
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
}

export default QaProcess;

const rules = {
  processName: [
    {
      required: true,
      message: "Process Name is required",
    },
  ],
  processDesc: [
    {
      required: true,
      message: "Process description is required",
    },
  ],
};
