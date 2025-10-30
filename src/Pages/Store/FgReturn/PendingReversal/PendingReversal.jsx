import { useEffect, useState, useMemo } from "react";
import { Col, Form, Row } from "antd";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import ExecutePPR from "./ExecutePPR";
import useApi from "../../../../hooks/useApi";
import { getProductsOptions } from "../../../../api/general.ts";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { getPendingReturns } from "../../../../api/store/fgReturn";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { getPendingFGReversal } from "../../FoodGoods/fgcolunms.jsx";

const wiseOptions = [
  { value: "datewise", text: "Date Wise" },
  { value: "skuwise", text: "SKU Wise" },
];

function PendingReversal() {
  const [rows, setRows] = useState([]);
  const [executePPR, setExecutePPR] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const wise = Form.useWatch("wise", form);

  const handleFetchProductOptions = async (search) => {
    const response = await executeFun(
      () => getProductsOptions(search),
      "select"
    );

    setAsyncOptions(response.data);
  };

  const getRows = async () => {
    const values = await form.validateFields();
    const response = await executeFun(
      () => getPendingReturns(values.data, values.wise),
      "fetch"
    );

    console.log("pending response", response);

    setRows(response.data);
  };
  const getExecuteDetails = async (row) => {
    console.log("row", row);
    // return;
    const response = await imsAxios.post("/fg_return/fetchComponentDetails", {
      product_id: row.productKey,
      fg_return_txn: row.transactionId,
    });
    console.log("response", response);
    if (response.success) {
      let { data } = response;
      setExecutePPR(row);
    }
  };

  useEffect(() => {
    if (wise === "skuwise") {
      form.setFieldValue("data", "");
    }
  }, [wise]);

  const columns = useMemo(() => getPendingFGReversal(), []);
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
    renderRowActions: ({ row }) => (
      <CustomButton
        size="small"
        title={"Execute"}
        variant="text"
        onclick={() => getExecuteDetails(row)}
      />
    ),

    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 190px)"
          : "calc(100vh - 250px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Product Found" />
    ),

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

  return (
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <ExecutePPR
        getRows={getRows}
        editPPR={executePPR}
        setEditPPR={setExecutePPR}
      />
      <Col sm={6} xxl={3}>
        <CustomFieldBox title="Filter">
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item name="wise" label="Select Wise">
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item
              name="data"
              label={wise === "skuwise" ? "Select Product" : "Select Date"}
            >
              {wise === "skuwise" && (
                <MyAsyncSelect
                  loadOptions={handleFetchProductOptions}
                  selectLoading={loading("select")}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                />
              )}
              {wise === "datewise" && (
                <MyDatePicker
                  setDateRange={(value) => form.setFieldValue("data", value)}
                />
              )}
            </Form.Item>
            <Row justify="end">
              <CustomButton
                title={"Search"}
                size="small"
                loading={loading("fetch")}
                onclick={getRows}
              />
            </Row>
          </Form>
        </CustomFieldBox>
      </Col>
      <Col sm={18} xxl={20}>
        <MaterialReactTable table={table} />
      </Col>
    </Row>
  );
}

export default PendingReversal;

const initialValues = {
  wise: "datewise",
  data: undefined,
};
