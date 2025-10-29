import { useMemo, useState } from "react";
import { Card, Col, Form, Radio, Row, Space } from "antd";
import useLoading from "../../../../hooks/useLoading";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyButton from "../../../../Components/MyButton";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { toast } from "react-toastify";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewMRTransaction from "../../ApprovedTransaction/ViewMRTransaction";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox";
import CustomButton from "../../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { getMrRequestColumns } from "../columns";

const ProccessedMrRequest = () => {
  const [loading, setLoading] = useLoading();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [rows, setRows] = useState([]);
  const [filterForm] = Form.useForm();

  const getUser = async (search) => {
    try {
      setLoading("select", true);
      const { data } = await imsAxios.post("/backend/fetchAllUser", { search });
      if (data) {
        let arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading("select", false);
    }
  };

  const getRows = async () => {
    try {
      const values = await filterForm.validateFields();
      setLoading("fetch", true);
      const payload = {
        date: values.date,
        user: values.user,
      };
      const { data } = await imsAxios.post(
        "/transaction/viewApprovalStatus",
        payload
      );

      if (data?.code === 200) {
        const arr = data.data.map((row, index) => ({
          id: index + 1,
          requestDate: row.datetime,
          requestId: row.transaction,
          pickLocation: row.location,
          rmQty: row.totalrm,
        }));

        setRows(arr);
      } else {
        toast.error(data?.message.msg);
      }
    } catch (error) {
    } finally {
      setLoading("fetch", false);
    }
  };

  const handleDownload = () => {
    downloadCSV(rows, columns, "MR Approved Requests");
  };

  const columns = useMemo(() => getMrRequestColumns(), []);
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
        height:
          loading["fetch"]  ? "calc(100vh - 240px)" : "calc(100vh - 240px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No MR Requests Found" />
    ),

    renderTopToolbar: () =>
      loading["fetch"]  ? (
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
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() => {
          closeMenu?.();
          setShowDetails(row?.original?.requestId);
        }}
        table={table}
        disabled={viewLoading}
      />,
    ],
  });

  return (
    <div className="grid grid-cols-[1fr_3fr] " style={{ gap: 12, padding: 12 }}>
      <CustomFieldBox title="Filters">
        <Form form={filterForm} layout="vertical">
          <Form.Item name="user" label="User">
            <MyAsyncSelect
              selectLoading={loading("select")}
              onBlur={() => setAsyncOptions([])}
              loadOptions={getUser}
              optionsState={asyncOptions}
            />
          </Form.Item>
          <Form.Item name="date" label="Select Date">
            <SingleDatePicker
              setDate={(value) => filterForm.setFieldValue("date", value)}
            />
          </Form.Item>

          <Row justify="end">
            <Space>
              <CommonIcons action="downloadButton" onClick={handleDownload} />
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search />}
                loading={loading("fetch")}
                onclick={getRows}
              />
            </Space>
          </Row>
        </Form>
      </CustomFieldBox>

      {/* <MyDataTable data={rows} columns={[actionColumn, ...columns]} /> */}
      <MaterialReactTable table={table} />

      {showDetails && (
        <Col span={10} style={{ height: "100%", overflowY: "hidden" }}>
          <Card
            size="small"
            title={`Request: ${showDetails}`}
            style={{ height: "100%" }}
            extra={
              <MyButton
                variant="clear"
                text="Close"
                onClick={() => setShowDetails(null)}
              />
            }
            bodyStyle={{ height: "95%", overflow: "hidden" }}
          >
            <ViewMRTransaction viewTransaction={showDetails} />
          </Card>
        </Col>
      )}
    </div>
  );
};

export default ProccessedMrRequest;
