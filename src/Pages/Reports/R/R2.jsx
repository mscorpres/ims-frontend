import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Row, Space } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import useApi from "../../../hooks/useApi";
import { getProjectOptions } from "../../../api/general";
import MyButton from "../../../Components/MyButton";

const R2 = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [wise, setWise] = useState("A");
  const [searchTerm, setSearchTerm] = useState("");

  const { executeFun, loading: loading1 } = useApi();
  const options = [
    { text: "All", value: "A" },
    { text: "Pending", value: "P" },
    { text: "Project", value: "PROJECT" },
    { text: "Requested By", value: "by" },
  ];

  const columns = [
    { field: "i", headerName: "Sr. No.", width: 8 },
    {
      field: "reg_date",
      headerName: "Po Date",
      width: 100,
    },
    {
      field: "reg_by",
      headerName: "Create By",
      width: 130,
    },
    {
      field: "po_order_id",
      headerName: "Po Order Id",
      width: 120,
    },
    { field: "part_no", headerName: "Part", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "component_name",
      headerName: "Component",
      width: 350,
    },
    { field: "unit_name", headerName: "UoM", width: 80 },
    { field: "po_rate", headerName: "Rate", width: 100 },
    {
      field: "ordered_qty",
      headerName: "Order Qty",
      width: 120,
    },
    {
      field: "ordered_pending",
      headerName: "Pending Qty",
      width: 150,
    },
    {
      field: "vendor_code",
      headerName: "Vendor Code",
      width: 100,
    },
    {
      field: "vendor_name",
      headerName: "Vendor Name",
      width: 280,
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 100,
    },
    {
      field: "po_cost_center",
      headerName: "Cost Center",
      width: 150,
    },
    {
      field: "po_project",
      headerName: "Project Name",
      width: 120,
    },
    {
      field: "branch",
      headerName: "Branch-In",
      width: 120,
    },
    {
      field: "po_status",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_status ? "Active" : "Closed"} />
      ),
      headerName: "Status",
      width: 100,
    },
  ];

  const handleDownloadCSV = () => {
    downloadCSV(rows, columns, "PO Report");
  };

  const fetch = async () => {
    setRows([]);
    setLoading(true);
    const { data } = await imsAxios.post("/report2", {
      data: searchTerm,
      wise: wise,
    });
    if (data.code == 200) {
      // setLoading(true);
      toast.success(data.message);
      let arr = data.response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          i: index + 1,
        };
      });
      setRows(arr);
      console.log("rows", rows);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const getUsers = async (search) => {
    setLoading(true);
    const { data } = await imsAxios.post("/backend/fetchAllUser", {
      search: search,
    });
    setLoading(false);
    let arr = data.map((row) => ({ text: row.text, value: row.id }));
    setAsyncOptions(arr);
  };
  return (
    <div style={{ height: "90%" }}>
      <Row justify="space-between" style={{ padding: "0 5px" }}>
        <Space>
          <div style={{ width: 200 }}>
            <MySelect options={options} value={wise} onChange={setWise} />
          </div>
          <div style={{ width: 300 }}>
            {wise === "A" || wise === "P" ? (
              <MyDatePicker size="default" setDateRange={setSearchTerm} />
            ) : wise === "PROJECT" ? (
              wise == "PROJECT" && (
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={handleFetchProjectOptions}
                  // value={allData.part}
                  selectLoading={loading1("select")}
                  optionsState={asyncOptions}
                  onChange={setSearchTerm}
                />
              )
            ) : (
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                loadOptions={getUsers}
                // selectLoading={loading1("select")}
                optionsState={asyncOptions}
                onChange={setSearchTerm}
              />
            )}
          </div>
          <MyButton
            variant="search"
            loading={loading}
            onClick={fetch}
            type="primary"
          >
            Fetch
          </MyButton>
        </Space>

        <Col>
          <CommonIcons
            disabled={rows.length === 0}
            onClick={handleDownloadCSV}
            action={"downloadButton"}
          />
        </Col>
      </Row>

      <div
        className="hide-select"
        style={{ height: "95%", margin: "5px", marginBottom: 0 }}
      >
        <MyDataTable
          loading={loading}
          data={rows}
          columns={columns}
          checkboxSelection={true}
        />
      </div>
    </div>
  );
};

export default R2;
