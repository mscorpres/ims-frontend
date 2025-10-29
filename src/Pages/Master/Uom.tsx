import { useEffect, useMemo, useState } from "react";
import { Card, Form, Input, Row, Space } from "antd";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import useApi from "../../hooks/useApi.ts";
import { createUOM, getUOMList } from "../../api/master/uom";
import { ResponseType } from "../../types/general.ts";
import { Box, LinearProgress, Typography } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { CheckOutlined, Refresh } from "@mui/icons-material";

const Uom = () => {
  const [uomData, setUomData] = useState([]);
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  const getUOMColumns = () => [
    {
      accessorKey: "id",
      header: "#",
      size: 150,
    },
    {
      accessorKey: "name",
      header: "Name",
      size: 200,
    },
    {
      accessorKey: "details",
      header: "Specification",
      size: 150,
    },
  ];

  const columns = useMemo(() => getUOMColumns(), []);

  const table = useMaterialReactTable({
    columns: columns,
    data: uomData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderTopToolbar: () =>
      loading("fetch") ? (
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

  //   fetch uom
  const handleFetchUOMList = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomData(response.data ?? []);
  };

  //   add UOM
  const submitHandler = async () => {
    const values = await form.validateFields();
    const response: ResponseType = await executeFun(
      () => createUOM(values),
      "submit"
    );
    if (response.success) {
      form.resetFields();
      handleFetchUOMList();
    }

    };

  const resetHandler = () => {
    form.resetFields();
  };

  useEffect(() => {
    handleFetchUOMList();
  }, []);

  return (
    <div
      style={{
        height: "calc(100vh - 130px)",
        marginTop: 8,
        padding: 10,
        gap: 12,
      }}
      className="grid grid-cols-[2fr_4fr] gap-4"
    >
      <div>
        <Typography variant="subtitle1">Create UOM</Typography>

        <Card size="small" style={{
          backgroundColor: "#e0f2f1",
        }}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Unit">
              <Input />
            </Form.Item>
            <Form.Item name="details" label="Specification">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Row justify="center">
              <Space>
                {/* <CustomButton /> */}
                <CustomButton
                  size="small"
                  title={"Reset"}
                  starticon={<Refresh fontSize="small" />}
                  onclick={resetHandler}
                  variant="outlined"
                  htmlType="reset"
                />

                <CustomButton
                  size="small"
                  title={"Submit"}
                  starticon={<CheckOutlined fontSize="small" />}
                  loading={loading("submit")}
                  onclick={submitHandler}
                  htmlType="submit"
                />
              </Space>
            </Row>
          </Form>
        </Card>
      </div>

      <div
        style={{
          height: "85%",
          padding: "0 10px",
        }}
      >
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default Uom;
