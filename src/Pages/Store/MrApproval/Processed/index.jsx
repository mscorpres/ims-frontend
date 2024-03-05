import { useEffect, useState } from "react";
import { Card, Col, Form, Radio, Row, Space } from "antd";
import useLoading from "../../../../hooks/useLoading";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyButton from "../../../../Components/MyButton";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import { toast } from "react-toastify";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewMRTransaction from "../../ApprovedTransaction/ViewMRTransaction";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";

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
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 20,
    getActions: ({ row }) => [
      // VIEW Icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label="View"
        onClick={() => {
          setShowDetails(row.requestId);
        }}
      />,
    ],
  };

  useEffect(() => {
    console.log("this is the show details", showDetails);
  }, [showDetails]);
  return (
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Col span={4}>
        <Card size="small" title="Filters">
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
                <MyButton
                  variant="search"
                  loading={loading("fetch")}
                  onClick={getRows}
                />
              </Space>
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={10}>
        <MyDataTable data={rows} columns={[actionColumn, ...columns]} />
      </Col>
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
    </Row>
  );
};

export default ProccessedMrRequest;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Request Date",
    field: "requestDate",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Request ID",
    field: "requestId",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.requestId} copy={true} />
    ),
  },
  {
    headerName: "RM qty",
    field: "rmQty",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.rmQty} />,
  },
  {
    headerName: "Pick Location",
    field: "pickLocation",
    width: 120,
  },
];
