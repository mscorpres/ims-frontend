import { Button, Col, Form, Row, Space, Typography } from "antd";
import { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../Components/MyDataTable";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import { downloadCSV } from "../../../Components/exportToCSV";
import useApi from "../../../hooks/useApi";
import { getProjectOptions } from "../../../api/general";

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
      headerName: "Sr. No",
      field: "index",
      width: 80,
    },
    {
      headerName: "Vendor Code",
      field: "ven_code",
      flex: 1,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.ven_code} copy={true} />
      ),
    },
    {
      headerName: "Vendor Name",
      field: "ven_name",
      width: 200,
      renderCell: ({ row }) => <ToolTipEllipses text={row.ven_name} />,
    },
    {
      headerName: "Purchase Amount",
      field: "vbt_taxable_value",
      flex: 1,
    },
    {
      headerName: "GST Amount",
      field: "gst_amount",
      flex: 1,
    },
    {
      headerName: "Vendor Amount",
      field: "vendor_amount",
      flex: 1,
    },

    {
      headerName: "Paid Amount",
      field: "paid_amount",
      flex: 1,
    },
    {
      headerName: "Advance Amount",
      field: "advance_amount",
      flex: 1,
    },
  ];
  console.log(rows);
  return (
    <div style={{ height: "90%", padding: 5, paddingTop: 0 }}>
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
            <Button
              onClick={getRows}
              type="primary"
              loading={loading === "fetch"}
            >
              Fetch
            </Button>
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
      <div style={{ height: "95%", marginTop: 5 }}>
        <MyDataTable
          loading={loading === "fetch"}
          columns={columns}
          rows={rows}
        />
      </div>
    </div>
  );
}
