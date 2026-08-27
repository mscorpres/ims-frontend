import { useState } from "react";
import { Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";

const ReturnDC = () => {
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState("");
  const { executeFun } = useApi();

  const columns = [
    {
      headerName: "#",
      width: 30,
      field: "serial_no",
    },
    {
      headerName: "Vendor",
      width: 250,
      field: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
    },
    {
      headerName: "Item",
      width: 350,
      field: "item",
      renderCell: ({ row }) => <ToolTipEllipses text={row.item} />,
    },
    {
      headerName: "Part No.",
      width: 130,
      field: "part_no",
    },
    {
      headerName: "Unit",
      width: 80,
      field: "unit",
    },
    {
      headerName: "Outward",
      width: 100,
      field: "outward",
    },
    {
      headerName: "Returned",
      width: 100,
      field: "returned",
    },
    {
      headerName: "Balance",
      width: 100,
      field: "balance",
    },
  ];
  //getting rows from database from all 3 filter po wise, data wise, vendor wise
  const getSearchResults = async () => {
    setRows([]);

    setSearchLoading(true);
    try {
      const { data } = await imsAxios.post("/gatepass/consolidatedReturnReport", {
        data: searchDateRange,
        vendor: vendor?.value ?? vendor,
      });

      if (data.code === 200) {
        const arr = (data.response?.data ?? []).map((row, index) => ({
          ...row,
          id: index + 1,
          index: index + 1,
        }));
        setRows(arr);
      } else {
        toast.error(data.message || "Failed to fetch return report");
      }
    } catch (error) {
      toast.error("An error occurred while fetching the return report");
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    if (search?.length > 2) {
      setSelectLoading(true);
      const response = await executeFun(
        () => getVendorOptions(search),
        "select",
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
        setSelectLoading(false);
      }
      setAsyncOptions(arr);
    }
  };

  return (
    <div className="manage-po" style={{ position: "relative", height: "calc(100vh - 80px)", margin: "10px 10px" }}>
      <Row
        justify="space-between"
      >
        <Col>
          <Space>
            <div style={{ width: 250 }}>
              <MyAsyncSelect
                selectLoading={selectLoading}
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                loadOptions={(search) => getVendors(search)}
                placeholder={"Select Vendors"}
                onChange={(e) => {
                  setVendor(e);
                  setAsyncOptions([]);
                }}
              />
            </div>

            <div style={{ width: 300 }}>
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
            </div>
            <MyButton
              disabled={
                searchDateRange === "" ? true : false || !vendor ? true : false
              }
              type="primary"
              loading={searchLoading}
              onClick={getSearchResults}
              id="submit"
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() =>
                downloadCSV(rows, columns, "Job Work Inventory Report")
              }
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div
        style={{
          height: "calc(100% - 90px)",
          marginTop: "10px",
      
        }}
      >
        <MyDataTable loading={searchLoading} rows={rows} columns={columns} />
      </div>
    </div>
  );
};

export default ReturnDC;
