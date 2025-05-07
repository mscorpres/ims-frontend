import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { downloadCSV } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";

const R37 = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [wise, setWise] = useState("date");
  const [rows, setRows] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { value: "date", text: "Date Wise" },
    // { value: "jwid", text: "Job Work ID Wise" },
  ];

  const columns = [
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      headerName: "PART ",
      // minWidth: 80,
      //   flex: 1,
      field: "PART",
      renderCell: ({ row }) => <ToolTipEllipses text={row.PART} />,
    },
    {
      headerName: "Component",
      width: 350,
      field: "COMPONENT",
    },
    {
      headerName: "Unit",
      width: 90,
      field: "UNIT",
    },
    {
      headerName: "Opening Qty",
      width: 100,
      field: "Opening",
    },
    {
      headerName: "Opening Rate",
      width: 100,
      field: "OpeningRate",
    },
    {
      headerName: "Opening Value",
      width: 100,
      field: "OpeningValue",
    },
    {
      headerName: "Inward Qty",
      width: 100,
      field: "Inward",
    },
    {
      headerName: "Inward Rate",
      width: 100,
      field: "InwardRate",
    },
    {
      headerName: "Inward Value",
      width: 100,
      field: "InwardValue",
    },

    {
      headerName: "Outward Qty",
      width: 110,
      field: "Outward",
    },
    {
      headerName: "Outward Rate",
      width: 100,
      field: "OutwardRate",
    },
    {
      headerName: "Outward Value",
      width: 100,
      field: "OutwardValue",
    },
    {
      headerName: "closing Qty",
      width: 100,
      field: "closing",
    },
    {
      headerName: "Closing Rate",
      width: 100,
      field: "closingRate",
    },
    {
      headerName: "Closing Value",
      width: 90,
      field: "closingValue",
    },
    
  ];
  //getting rows from database from all 3 filter po wise, data wise, vendor wise
  const getSearchResults = async () => {
    setRows([]);
    let search;
    if (wise == "date") {
      search = searchDateRange;
    } else {
      search = null;
    }
    if (searchInput || (search && vendor)) {
      setSearchLoading(true);
      const { data,success,message } = await imsAxios.post(
        "/report37",
        {
          data:
            wise == "jwid"
              ? searchInput.trim()
              : wise == "date" && searchDateRange,
          wise: wise,
          vendor: vendor,
        }
      );
      setSearchLoading(false);
      console.log(data)
      if (success) {
        let arr = data?.map((row, index) => ({
          ...row,
          id: index+1,
          index: index + 1,
        }));
        setRows(arr);
      } else {
        if (message) {
          toast.error(message);
        } else {
          toast.error(message);
        }
      }
    } else {
      if (wise == "date" && searchDateRange == null) {
        toast.error("Please select start and end dates for the results");
      } else if (wise == "jwid") {
        toast.error("Please enter a Job work ID");
      } else if (vendor == null) {
        toast.error("Please select a vendor");
      }
    }
  };
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };

  return (
    <div className="manage-po" style={{ position: "relative", height: "100%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
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
            <div style={{ width: 150 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "date" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : (
                <Input
                  style={{ width: "100%" }}
                  type="text"
                  placeholder="Enter Job Work ID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              )}
            </div>
            <MyButton
              disabled={
                wise === "date"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
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
              onClick={() => downloadCSV(rows, columns, "Job Work Inventory Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div
        style={{
          height: "85%",
          padding: "0 10px",
        }}
      >
        <MyDataTable
          loading={loading || searchLoading}
          rows={rows}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default R37;
