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
    { headerName: "Sr. No", width: 80, field: "index" },
    { headerName: "SFG Date", width: 150, field: "indt" },
    { headerName: "Vendor", flex: 1, field: "vendor" },
    { headerName: "Job Work Id", flex: 1, field: "jw_txn" },
    { headerName: "Transaction Id", flex: 1, field: "sfg_txn" },
    {
      headerName: "Actions",
      flex: 1,
      type: "actions",
      getActions: ({ row }) => [
        <TableActions
          action="add"
          //   disable={row.po_status == "C"}
          onClick={() =>
            setTransactionInwarding({
              jw: row.jw_txn,
              challan: row.challan_txn,
              sfgtxn: row.sfg_txn,
              vendor: {
                label: searchForm.getFieldsValue().data.label,
                value: searchForm.getFieldsValue().data.value,
              },
            })
          }
          label="MIN"
        />,
      ],
    },
  ];
  return (
    <div style={{ height: "90%" }}>
      <MINDrawer
        transactionInwarding={transactionInwarding}
        setTransactionInwarding={setTransactionInwarding}
      />
      <Row gutter={4} style={{ height: "100%", padding: "5px 10px" }}>
        <Col span={4}>
          <Card size="small">
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
                    <Button
                      loading={fetchLoading}
                      size="default"
                      htmlType="submit"
                      type="primary"
                    >
                      Search
                    </Button>
                  </Space>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col style={{ height: "100%" }} span={20}>
          <MyDataTable loading={fetchLoading} rows={rows} columns={columns} />
        </Col>
      </Row>
    </div>
  );
}

export default SFGMIN;
