import { useState } from "react";
import { Button, Card, Col, Form, Row, Space } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import axios from "axios";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import { useEffect } from "react";
import { toast } from "react-toastify";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MINDrawer from "./MINDrawer";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Add, Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, IconButton, LinearProgress } from "@mui/material";

function SFGMIN() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [transactionInwarding, setTransactionInwarding] = useState(null);
  const [searchForm] = Form.useForm();
  const wiseOptions = [{ text: "Vendor Wise", value: "vendorwise" }];

  const getVendors = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("backend/vendorList", {
      search: search,
    });
    setSelectLoading(false);
    if (data[0]) {
      let arr = data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getRows = async (values) => {
    setFetchLoading(false);
    values = {
      wise: values.wise,
      data: values.data.value,
    };
    const { data } = await imsAxios.post("/jwvendor/fetchVendorSFG", values);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        ...row,
        id: index,
        index: index + 1,
      }));
      setRows(arr);
    } else {
      setRows([]);
      toast.error(data.message.msg);
    }
    setFetchLoading(false);
  };
  const handleDownloadCSV = () => {
    downloadCSV(rows, columns, "Vendor SFG MIN Report");
  };
  useEffect(() => {
    searchForm.setFieldsValue({
      data: "",
      wise: "vendorwise",
    });
  }, []);
  useEffect(() => {
    setRows([]);
  }, [searchForm.getFieldsValue().data]);
  const columns = [
    { header: "Sr. No", size: 80, accessorKey: "index" },
    { header: "SFG Date", size: 150, accessorKey: "indt" },
    { header: "Vendor", accessorKey: "vendor" },
    { header: "Job Work Id", accessorKey: "jw_txn" },
    { header: "Transaction Id", accessorKey: "sfg_txn" },
    {
      header: "Actions",
      flex: 1,
      type: "actions",
      render: ({ row }) => {
        <IconButton>
          <Add />
        </IconButton>
      }
        // <TableActions
        //   action="add"
        //   //   disable={row.po_status == "C"}
        //   onClick={() =>
        //     setTransactionInwarding({
        //       jw: row.jw_txn,
        //       challan: row.challan_txn,
        //       sfgtxn: row.sfg_txn,
        //       vendor: {
        //         label: searchForm.getFieldsValue().data.label,
        //         value: searchForm.getFieldsValue().data.value,
        //       },
        //     })
        //   }
        //   label="MIN"
        // />,
      ,
    },
  ];

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
        height: fetchLoading ? "calc(100vh - 240px)" : "calc(100vh - 250px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      fetchLoading ? (
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
    <div style={{ height: "90%" }}>
      <MINDrawer
        transactionInwarding={transactionInwarding}
        setTransactionInwarding={setTransactionInwarding}
      />
      <Row gutter={12} style={{ height: "100%", padding: "12px 10px" }}>
        <Col span={6}>
          <CustomFieldBox title="Filters">
            <Form
              name="searchForm"
              form={searchForm}
              onFinish={getRows}
              size="small"
              layout="vertical"
            >
              <Form.Item
                label="Select Wise"
                name="wise"
                rules={[
                  {
                    required: true,
                    message: "Please Select a Wise Option!",
                  },
                ]}
              >
                <MySelect
                  options={wiseOptions}
                  //   value={wise}
                  //   onChange={(value) => setWise(value)}
                />
              </Form.Item>
              {/* {wise === "vendorwise" && ( */}
              <Form.Item
                label="Select Vendor"
                name="data"
                rules={[
                  {
                    required: true,
                    message: "Please Select a Vendor!",
                  },
                ]}
              >
                <MyAsyncSelect
                  labelInValue
                  selectLoading={selectLoading}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getVendors}
                />
              </Form.Item>
              {/* )} */}
              <Form.Item>
                <Row justify="end">
                  <Space>
                    <CommonIcons
                      action="downloadButton"
                      disabled={rows.length === 0}
                      onClick={handleDownloadCSV}
                    />
                    {/* <MyButton
                      loading={fetchLoading}
                      size="default"
                      htmlType="submit"
                      type="primary"
                      variant="search"
                    >
                      Search
                    </MyButton> */}
                    <CustomButton
                      size="small"
                      title={"Search"}
                      starticon={<Search fontSize="small" />}
                      loading={fetchLoading}
                      htmlType="submit"
                    />
                  </Space>
                </Row>
              </Form.Item>
            </Form>
          </CustomFieldBox>
        </Col>
        <Col style={{ height: "100%" }} span={18}>
          <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
}

export default SFGMIN;
