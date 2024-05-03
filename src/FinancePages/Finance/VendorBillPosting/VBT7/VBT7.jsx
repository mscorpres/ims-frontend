import React, { useEffect, useState } from "react";
import links from "../links";
import MyDatePicker from "../../../../Components/MyDatePicker";
import axios from "axios";
import "../../../Accounts/accounts.css";
import { toast } from "react-toastify";
import { AiFillEdit } from "react-icons/ai";
import CreateVBT7 from "./CreateVBT7";
import MyDataTable from "../../../../Components/MyDataTable";
import MapVBTModal from "../MapVBTModal";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Button, Input, Row, Space } from "antd";
import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import useApi from "../../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";

export default function VBT1() {
  const [wise, setWise] = useState("min_wise");
  const [searchInput, setSearchInput] = useState("MIN/23-24/");
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [vbtData, setVBTData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingVBT, setEditingVBT] = useState(null);
  const [mapVBT, setMapVBT] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const vbtTableColumsns = [
    {
      headerName: "Sr. No.",
      renderCell: ({ row }) => <span>{vbtData?.indexOf(row) + 1}</span>,
      sortable: true,
      flex: 1,
      id: "serial-no",
      width: "8vw",
      // style: { backgroundColor: "transparent" },
    },
    {
      headerName: "Vendor Code",
      field: "ven_code",
      sortable: true,
      flex: 1,
      id: "vendor code",
      // style: { backgroundColor: "transparent" },
    },
    {
      headerName: "MIN ID",
      field: "min_transaction",
      sortable: true,
      flex: 1,
      id: "min id",
      // style: { backgroundColor: "transparent" },
    },
    {
      headerName: "PART ID",
      field: "part_code",
      flex: 1,
      sortable: true,
      id: "part id",
      // style: { backgroundColor: "transparent" },
    },
    {
      headerName: "MIN DATE",
      field: "min_in_date",
      flex: 1,
      sortable: true,
      id: "min date",
      // style: { backgroundColor: "transparent" },
    },
    {
      headerName: "ACTIONS",
      button: true,
      field: "action",
      type: "actions",
      flex: 1,
      // minWidth: "20%",
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<AiFillEdit />}
          onClick={() => getVBTDetail(row.min_transaction)}
          label="Delete"
        />,
      ],
      // style: { backgroundColor: "transparent" },
    },
  ];
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getVBTDetail = async (minId) => {
    setLoading(true);
    const { data } = await imsAxios.post("/tally/vbt07/fetch_minData", {
      min_id: minId,
    });
    if (data.code === 200) {
      setEditingVBT(data.data);
    } else {
      toast.error(data.message.msg);
      setEditingVBT(null);
    }
    setLoading(false);
  };
  const getMultipleVBTDetail = async () => {
    setLoading(true);
    let mins = selectedRows.map((row) => vbtData.filter((r) => r.id == row)[0]);
    // console.log(mins);
    const { data } = await imsAxios.post("/tally/vbt07/fetch_multi_min_data", {
      mins: mins.map((row) => row.min_transaction),
    });
    setLoading(false);
    if (data.code === 200) {
      console.log(data.data);
      let arr = data.data;
      arr = arr.map((row) => ({
        ...row,
        ven_tds: arr[0].ven_tds,
      }));
      setEditingVBT(arr);
    } else {
      toast.error(data.message.msg);
      setEditingVBT(null);
    }
    setLoading(false);
  };
  const getRows = async () => {
    let d;
    if (wise === "date_wise") {
      if (searchDateRange) {
        d = searchDateRange;
      } else {
        toast.error("Please select a time period");
      }
    } else if (wise === "vendor_wise") {
      if (searchInput) {
        d = searchInput;
      } else {
        toast.error("Please select a Vendor");
      }
    } else if (wise === "min_wise") {
      if (searchInput) {
        d = searchInput?.trim();
      } else {
        toast.error("Please Enter a MIN Number");
      }
    }
    setSearchLoading(true);
    const { data } = await imsAxios.post("/tally/vbt07/fetch_vbt07", {
      wise: wise,
      data: d,
    });
    if (data.code === 200) {
      const arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setVBTData(arr);
    } else {
      toast.error(data.message.msg);
      setVBTData([]);
    }
    setSearchLoading(false);
    // console.log(data);
  };
  const wiseOptions = [
    { value: "date_wise", text: "Date Wise" },
    { value: "min_wise", text: "MIN Wise" },
    { value: "vendor_wise", text: "Vendor Wise" },
  ];

  useEffect(() => {
    if (wise == "min_wise") {
      setSearchInput("MIN/23-24/");
    } else {
      setSearchInput(null);
    }
    setVBTData([]);
  }, [wise]);
  useEffect(() => {
    setToggleCleared((toggleCleared) => !toggleCleared);
  }, [vbtData]);
  return (
    <div style={{ height: "95%" }}>
      <MapVBTModal mapVBT={mapVBT} setMapVBT={setMapVBT} />
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* search header */}
        <CreateVBT7
          setVBTData={setVBTData}
          editingVBT={editingVBT}
          setEditingVBT={setEditingVBT}
        />
        <Row
          justify="space-between"
          style={{ padding: "0px 10px", paddingBottom: 5 }}
        >
          <div className="left">
            <Space>
              <div style={{ width: 250 }}>
                <MySelect
                  options={wiseOptions}
                  value={wise}
                  onChange={setWise}
                />
              </div>
              <div style={{ width: 300 }}>
                {wise === "date_wise" ? (
                  <MyDatePicker
                    size="default"
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                  />
                ) : wise === "min_wise" ? (
                  <Input
                    type="text"
                    size="default"
                    // className="form-control w-100 "
                    placeholder="Enter MIN Number"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                ) : (
                  wise === "vendor_wise" && (
                    <MyAsyncSelect
                      size="default"
                      selectLoading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={(value) => setSearchInput(value)}
                      loadOptions={getVendors}
                      optionsState={asyncOptions}
                      defaultOptions
                      placeholder="Select Vendor..."
                    />
                  )
                )}
              </div>

              <Button
                size="default"
                disabled={
                  wise === "date_wise"
                    ? searchDateRange === ""
                      ? true
                      : false
                    : !searchInput
                    ? true
                    : false
                }
                loading={searchLoading}
                type="primary"
                onClick={getRows}
              >
                Search
              </Button>
              {wise == "vendor_wise" && (
                <Button
                  onClick={getMultipleVBTDetail}
                  disabled={selectedRows.length < 2}
                  loading={loading}
                  type="primary"
                >
                  Create VBT
                </Button>
              )}
            </Space>
          </div>
          <Space>
            <Button
              onClick={() => {
                setMapVBT("vbt01");
              }}
              size="default"
              type="primary"
            >
              Map VBT
            </Button>
          </Space>
        </Row>
        {/* search header end */}
        <div style={{ height: "90%", padding: "0px 10px" }}>
          <MyDataTable
            checkboxSelection={wise == "vendor_wise"}
            loading={loading || searchLoading}
            columns={vbtTableColumsns}
            data={vbtData}
            onSelectionModelChange={(newSelectionModel) => {
              setSelectedRows(newSelectionModel);
            }}
          />
        </div>
      </div>
    </div>
  );
}
