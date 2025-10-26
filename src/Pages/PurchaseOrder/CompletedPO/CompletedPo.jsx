import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ViewComponentSideBar from "./ViewComponentSideBar";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { Button, Col, Input, Row, Space } from "antd";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { downloadCSV } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import { getVendorOptions } from "../../../api/general.ts";
import SearchIcon from "@mui/icons-material/Search";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";

const CompletedPo = () => {
  const [loading, setLoading] = useState(false);
  const [showComponentSideBar, setShowComponentSideBar] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [searchInput, setSearchInput] = useState(null);
  const [vendorSearchInput, setVendorSearchInput] = useState("");
  const [wise, setWise] = useState("po_wise");
  const [rows, setRows] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewLoading, seViewLoading] = useState(false);

  const [componentData, setComponentData] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { value: "single_date_wise", text: "Date Wise" },
    { value: "po_wise", text: "PO ID Wise" },
    { value: "vendor_wise", text: "Vendor Wise" },
  ];

  const getSearchResults = async () => {
    setLoading(true);
    let w = null;
    if (wise === "vendor_wise" || wise === "po_wise") {
      w = searchInput;
    } else if (wise === "single_date_wise") {
      w = searchDateRange;
    }
    if (w) {
      setSearchLoading(true);
      const { data } = await imsAxios.post("/purchaseOrder/fetchCompletePO", {
        data:
          wise === "vendor_wise"
            ? searchInput
            : wise === "po_wise"
            ? searchInput.trim()
            : wise === "single_date_wise" && searchDateRange,
        wise: wise,
      });
      setSearchLoading(false);
      setLoading(false);
      // console.log(data.data);
      if (data.code === 200) {
        let arr = data.data;
        arr = arr.map((row, index) => {
          return { ...row, id: row.po_transaction_code, index: index + 1 };
        });
        setRows(arr);
      } else {
        toast.error(data.message.msg);
        setRows([]);
      }
    } else {
      setLoading(false);
      if (wise === "single_date_wise") {
        toast.error("Please select start and end dates for the results");
      } else if (wise === "po_wise") {
        toast.error("Please enter a PO id");
      } else if (wise === "vendor_wise") {
        toast.error("Please select a vendor");
      }
    }
  };
  // setLoading(false);
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
  const getComponentData = async (poid) => {
    seViewLoading(true);
    const { data } = await imsAxios.post(
      "/purchaseOrder/fetchComponentList4PO",
      {
        poid,
      }
    );
    seViewLoading(false);
    if (data.code === 200) {
      let arr = data.data;
      arr = arr.map((row) => {
        return { ...row, id: row.componentPartID };
      });
      setComponentData({ poId: poid, components: arr });
      setShowComponentSideBar(true);
    } else {
      toast.error("Some error occured please try again");
    }
  };
  const printFun = async (poid) => {
    setLoading(true);
    const { data } = await imsAxios.post("/poPrint", {
      poid: poid,
    });
    printFunction(data.data.buffer.data);
    setLoading(false);
  };
  const handleDownload = async (poid) => {
    setLoading("download");
    const { data } = await imsAxios.post("/poPrint", {
      poid: poid,
    });
    setLoading(null);
    let filename = poid;
    downloadFunction(data.data.buffer.data, filename);
  };

  const columns = [
    {
      headerName: "Serial No.",
      field: "index",
      width: 100,
    },
    {
      headerName: "PO ID",
      renderCell: ({ row }) => (
        <span dangerouslySetInnerHTML={{ __html: row.po_transaction_style }} />
      ),
      field: "po_transaction_code",
      flex: 1,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      flex: 1,
    },
    {
      headerName: "Vendor Name",
      field: "vendor_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor_name} />,
      flex: 2,
    },
    {
      headerName: "Vendor Code",
      field: "vendor_id",

      flex: 1,
    },
    {
      headerName: "PO REG. DATE",
      field: "po_reg_date",
      flex: 1,
    },
    {
      headerName: "Created By",
      field: "po_reg_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_by} />,
      flex: 1,
    },
    {
      headerName: "Comments",
      field: "po_comment",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_comment} />,
      flex: 1,
    },
    {
      headerName: "Actions",
      type: "actions",
      id: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <TableActions
          action="view"
          onClick={() => getComponentData(row.po_transaction_code)}
        />,

        <TableActions
          action="print"
          onClick={() => {
            printFun(row.po_transaction_code);
          }}
        />,

        <TableActions
          action="download"
          onClick={() => handleDownload(row.po_transaction_code)}
        />,
      ],
    },
  ];
  const additional = () => (
    <Space>
      <div style={{ width: 150 }}>
        <MySelect
          size="default"
          options={wiseOptions}
          defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
          onChange={setWise}
          value={wise}
          setSearchString={setSearchInput}
        />
      </div>
      <div style={{ width: 300 }}>
        {wise === "single_date_wise" ? (
          <MyDatePicker
            size="default"
            setDateRange={setSearchDateRange}
            dateRange={searchDateRange}
            value={searchDateRange}
          />
        ) : wise === "po_wise" ? (
          <Input
            style={{ width: "100%" }}
            type="text"
            size="default"
            placeholder="Enter Po Number"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        ) : (
          wise === "vendor_wise" && (
            <div>
              <MyAsyncSelect
                selectLoading={selectLoading}
                size="default"
                onBlur={() => setAsyncOptions([])}
                value={searchInput}
                onChange={(value) => setSearchInput(value)}
                loadOptions={getVendors}
                optionsState={asyncOptions}
                defaultOptions
                placeholder="Select Vendor..."
              />
            </div>
          )
        )}
      </div>
      <Button
        disabled={
          wise === "single_date_wise"
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
        // className="primary-button search-wise-btn"
      >
        Search
      </Button>
      <CommonIcons
        action="downloadButton"
        onClick={() => downloadCSV(rows, columns, "Completed PO Report")}
        disabled={rows.length == 0}
      />
    </Space>
  );
  useEffect(() => {
    getVendors(vendorSearchInput);
  }, [vendorSearchInput]);
  const closeAllModal = () => {
    setShowComponentSideBar(false);
  };
  useEffect(() => {
    setSearchInput("");
    // console.log(filterData);
  }, [wise]);

  return (
    <div style={{ height: "calc(100vh - 80px)", marginTop: 8 }}>
      <Row justify="space-between" style={{ padding: "4px 10px" }}>
        <Col className="left">
          <Space style={{ paddingTop: 5, paddingBottom: 8 }}>
            <div style={{ width: 150 }}>
              <MySelect
                size="medium"
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
                setSearchString={setSearchInput}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "single_date_wise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : wise === "po_wise" ? (
                <Input
                  style={{ width: "100%" }}
                  type="text"
                  size="default"
                  placeholder="Enter Po Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : (
                wise === "vendor_wise" && (
                  <div>
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      size="default"
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={(value) => setSearchInput(value)}
                      loadOptions={getVendors}
                      optionsState={asyncOptions}
                      defaultOptions
                      placeholder="Select Vendor..."
                    />
                  </div>
                )
              )}{" "}
            </div>
            {/* <MyButton
              loading={searchLoading}
              disabled={
                wise === "single_date_wise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              type="primary"
              onClick={getSearchResults}
              variant="search"
            >
              Search
            </MyButton> */}
            <CustomButton
              size="small"
              title={"Search"}
              starticon={<SearchIcon fontSize="small" />}
              loading={searchLoading}
              disabled={
                wise === "single_date_wise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              onclick={getSearchResults}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Completed PO Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div style={{ height: "85%", padding: "0px 10px" }}>
        <MyDataTable
          loading={loading || viewLoading}
          data={rows}
          columns={columns}
          pagination={true}
          headText="center"
        />
      </div>

      <ViewComponentSideBar
        setShowComponentSideBar={setShowComponentSideBar}
        showComponentSideBar={showComponentSideBar}
        componentData={componentData}
      />
    </div>
  );
};

export default CompletedPo;
