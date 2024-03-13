import React, { useState } from "react";
import { Form, Row, Col, Card, Space, Flex } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import useApi from "../../hooks/useApi";
import MyButton from "../../Components/MyButton";
import MyDataTable from "../../Components/MyDataTable";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { getNotes, getRecoReport } from "../../api/finance/vendor-reco";
import { getVendorOptions } from "../../api/general";
import { convertSelectOptions } from "../../utils/general";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import routeConstants from "../../Routes/routeConstants";
import Notes from "./Notes";
import MySelect from "../../Components/MySelect";

const statusWiseOptions = [
  {
    text: "Draft",
    value: "draft",
  },
  {
    text: "Completed",
    value: "completed",
  },
  {
    text: "All",
    value: "all",
  },
];

const RecoReport = () => {
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  // const [isData, setIsData] = useState()
  const [showNotes, setShowNotes] = useState(false);
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const selectedVendor = Form.useWatch("vendor", form);
  const { executeFun, loading } = useApi();

  const handleFetchVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");

    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }

    setAsyncOptions(arr);
  };
  const handleFetchRows = async () => {
    const values = await form.validateFields();
    let wise = "all";
    console.log("these are the values", values);
    if (values.vendor?.value) {
      wise = "vendorwise";
    }
    console.log("these are the validated values", wise);

    const response = await executeFun(
      () => getRecoReport(values.vendor?.value, wise, values.status),
      "fetch"
    );
    setShowNotes(false);
    setRows(response.data);
  };
  const handleConitnue = async (date) => {
    const values = await form.validateFields();
    navigate(
      `${routeConstants.finance.vendor.reco.create}?vendorCode=${values.vendor.value}&vendor=${values.vendor.label}&date=${date}`
    );
  };

  const handleSubmit = async () => {
    await handleFetchNotes();
    handleFetchRows();
  };

  const handleFetchNotes = async () => {
    const values = await form.validateFields();
    const response = await executeFun(
      () => getNotes(values.vendor.value),
      "notes"
    );
    setNotes(response.data);
  };

  const actionColum = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // Edit icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label="Continue"
        onClick={() => handleConitnue(row.dateRange)}
      />,
    ],
  };
  return (
    <Row justify="center" style={{ height: "95%", padding: 10 }} gutter={6}>
      <Col span={4}>
        <Flex vertical gap={6}>
          {" "}
          <Card size="small" title="Filters">
            <Form
              layout="vertical"
              initialValues={{
                status: "draft",
              }}
              form={form}
            >
              <Form.Item name="vendor" label="Vendor">
                <MyAsyncSelect
                  labelInValue={true}
                  placeholder={"Search Vendor"}
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  loadOptions={handleFetchVendors}
                  selectLoading={loading("select")}
                />
              </Form.Item>
              <Form.Item name="status" label="Status">
                <MySelect options={statusWiseOptions} />
              </Form.Item>
              <Row justify="end">
                <Space>
                  <CommonIcons action="downloadButton" />
                  <MyButton
                    loading={loading("fetch")}
                    variant="search"
                    onClick={handleSubmit}
                  />
                </Space>
              </Row>
            </Form>
          </Card>
          {selectedVendor && showNotes && (
            <Card size="small" title="Notes">
              <Notes
                handleFetchNotes={handleFetchNotes}
                notes={notes}
                fetchLoading={loading("notes")}
                filterForm={form}
              />
            </Card>
          )}
        </Flex>
      </Col>
      <Col span={16} xl={14}>
        <MyDataTable
          columns={[actionColum, ...columns]}
          data={rows}
          loading={loading("fetch")}
        />
      </Col>
    </Row>
  );
};

export default RecoReport;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Vendor Code",
    field: "vendorCode",
    width: 150,
  },
  {
    headerName: "Vendor",
    field: "vendor",
    minWidth: 200,
    flex: 1,
  },
  {
    headerName: "Month",
    field: "month",
    minWidth: 100,
  },

  {
    headerName: "Status",
    field: "status",
    minWidth: 100,
  },
];
