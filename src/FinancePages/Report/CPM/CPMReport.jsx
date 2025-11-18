import { Col, Form, Row, Space, Typography } from "antd";
import { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import { downloadCSV } from "../../../Components/exportToCSV";
import useApi from "../../../hooks/useApi.ts";
import { getProjectOptions } from "../../../api/general.ts";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";

export default function CPMReport() {
  const [projectName, setProjectName] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const { executeFun, loading: loading1 } = useApi();

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/tally/reports/cpmReport", {
      projectCode: projectName,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          ...row,
          index: index + 1,
          id: index,
          vbt_taxable_value: row.vbt_taxable_value ?? "--",
          vbt_ven_ammount: row.vbt_ven_ammount ?? "--",
          in_transaction_id: row.in_transaction_id ?? "--",
          paid_amount: row.paid_amount ?? "--",
          advance_amount: row.advance_amount ?? "0",
        }));
        console.log(arr);
        setRows(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const downloadFun = () => {
    downloadCSV(rows, columns, "CPM Report");
  };

  const columns = [
    {
      header: "Sr. No",
      accessorKey: "index",
      width: 80,
    },
    {
      header: "Vendor Code",
      accessorKey: "ven_code",
      flex: 1,
      render: ({ row }) => <ToolTipEllipses text={row.ven_code} copy={true} />,
    },
    {
      header: "Vendor Name",
      accessorKey: "ven_name",
      width: 200,
      render: ({ row }) => <ToolTipEllipses text={row.ven_name} />,
    },
    {
      header: "Purchase Amount",
      accessorKey: "vbt_taxable_value",
      flex: 1,
    },
    {
      header: "GST Amount",
      accessorKey: "gst_amount",
      flex: 1,
    },
    {
      header: "Vendor Amount",
      accessorKey: "vendor_amount",
      flex: 1,
    },

    {
      header: "Paid Amount",
      accessorKey: "paid_amount",
      flex: 1,
    },
    {
      header: "Advance Amount",
      accessorKey: "advance_amount",
      flex: 1,
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
        height:
          loading === "fetch" ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
    <div style={{ height: "90%", margin: 12 }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              <Form>
                <Form.Item style={{ margin: 0 }} label="Select Project">
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={handleFetchProjectOptions}
                    loading={loading1("select")}
                    value={projectName}
                    onChange={setProjectName}
                  />
                </Form.Item>
              </Form>
            </div>

            <CustomButton
              size="small"
              title={"Search"}
              onclick={getRows}
              loading={loading === "fetch"}
              starticon={<Search fontSize="small" />}
            />
          </Space>
        </Col>
        <Col>
          <CommonIcons
            onClick={downloadFun}
            disabled={rows.length === 0}
            action="downloadButton"
          />
        </Col>
      </Row>
      <div style={{ height: "95%", marginTop: 12 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
