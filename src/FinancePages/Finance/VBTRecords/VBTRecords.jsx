import { Col, Form, Row, Space, Input, Button, Modal } from "antd";
import React from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";

import { useState } from "react";
import MyDatePicker from "../../../Components/MyDatePicker";
import { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { CodeSandboxCircleFilled } from "@ant-design/icons";
import { toast } from "react-toastify";
import { downloadExcel } from "../../../Components/printFunction";
import { v4 } from "uuid";
import Loading from "../../../Components/Loading";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../../Components/socket";
import { getVendorOptions } from "../../../api/general";
import { convertSelectOptions } from "../../../utils/general";
import useApi from "../../../hooks/useApi.ts";
function VBTRecords() {
  const [wise, setWise] = useState("datewise");
  const [rows, setRows] = useState([]);

  const [searchDateRange, setSearchDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("MIN/23-24/");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vbtOption, setVbtOption] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);
  const { user, notifications } = useSelector((state) => state.login);
  const [selectLoading, setSelectLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();

  const wiseOptions = [
    { value: "datewise", text: "Date Wise" },
    { value: "minwise", text: "MIN Wise" },
    { value: "vendorwise", text: "Vendor Wise" },
    { value: "vbtwise", text: "VBT Code Wise" },
    { value: "effectivewise", text: "Effective Date Wise" },
  ];
  const vbtTypeOptions = [
    { text: "All", value: "ALL" },
    { text: "VBT1", value: "VBT01" },
    { text: "VBT2", value: "VBT02" },
    { text: "VBT3", value: "VBT03" },
    { text: "VBT4", value: "VBT04" },
    { text: "VBT5", value: "VBT05" },
    { text: "VBT6", value: "VBT06" },
    { text: "VBT7", value: "VBT07" },
  ];
  const emitDownloadEvent = () => {
    // let newId = v4();
    // let arr = notifications;

    console.log("this is the arr", searchDateRange);
    if (!user.company_branch) {
      toast.error("Please select a branch to download report");
      return;
    }
    socket.emit("vbtReport", {
      otherdata: {
        data:
          wise == "vendorwise"
            ? searchInput
            : wise == "minwise"
            ? searchInput.trim()
            : wise == "vbtwise"
            ? searchInput.trim()
            : wise == "datewise"
            ? searchDateRange
            : wise == "effectivewise" && searchDateRange,
        wise: wise,
        vbt_type: vbtOption,
      },
    });
  };
  const downlaodReport = async () => {
    setRows([]);
    setLoading(true);
    let search;
    if (wise === "datewise" || wise === "effectivewise") {
      search = searchDateRange;
    } else {
      search = null;
    }
    if (searchInput || search) {
      setLoading(true);
    }
    emitDownloadEvent();
    setOpenModal(false);
  };

  // const response = await imsAxios.post("/tally/vbt_report/download", {
  //   data:
  //     wise == "vendorwise"
  //       ? searchInput
  //       : wise == "minwise"
  //       ? searchInput.trim()
  //       : wise == "vbtwise"
  //       ? searchInput.trim()
  //       : wise == "datewise"
  //       ? searchDateRange
  //       : wise == "effectivewise" && searchDateRange,
  //   wise: wise,
  //   vbt_type: vbtOption,
  // });
  // setLoading(false);
  // console.log("response=in vbt reocrds =>>>", response);

  // if (response.status == 200) {
  // console.log("data= in vbt reocrds", response);
  // const { data } = response;
  // console.log("data reocrds", data);
  // console.log("data.buffer ", data.data.data);
  // const arr = data.map((row) => {
  //   return {
  //     ...row,
  //     id: v4(),
  //     index: data.indexOf(row) + 1,
  //     // status: row.status == "D" ? "Deleted" : "--",
  //     taxableValue: row.vbp_inqty * row.vbp_inrate,
  //   };
  // });

  // setRows(arr);
  // console.log("data.data ->>>>>", arr);
  // downloadExcel(data.data.data, "VBT records");

  //     } else {
  //       // console.log(data.message);
  //       if (response.message.msg) {
  //         toast.error(response.message.msg);
  //       } else if (response.message) {
  //         toast.error(response.message.msg);
  //       } else {
  //         toast.error("Something wrong happened");
  //       }
  //     }
  //   } else {
  //     if (wise == "datewise" && searchDateRange == null) {
  //       toast.error("Please select start and end dates for the results");
  //     } else if (wise == "powise") {
  //       toast.error("Please enter a PO id");
  //     } else if (wise == "vendorwise") {
  //       toast.error("Please select a vendor");
  //     }
  //   }
  // };
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  useEffect(() => {
    setRows([]);
    if (wise == "minwise") {
      setSearchInput("MIN/23-24/");
    } else {
      setSearchInput("");
    }
    setSearchDateRange("");
  }, [wise]);
  return (
    <div style={{ height: "90%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space gutter={10}>
            <Col>
              <MySelect
                style={{ width: "100%" }}
                placeholder="Please Select Option "
                options={wiseOptions}
                onChange={setWise}
                value={wise}
              />
            </Col>
            <div style={{ width: 300 }}>
              <Col>
                {wise === "datewise" ? (
                  <MyDatePicker
                    size="default"
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                  />
                ) : wise === "minwise" ? (
                  <Input
                    type="text"
                    size="default"
                    placeholder="Enter MIN Number"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                ) : wise === "powise" ? (
                  <>
                    <Input
                      size="default"
                      type="text"
                      placeholder="Enter Po Number"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </>
                ) : wise === "vbtwise" ? (
                  <div>
                    <Input
                      size="default"
                      type="text"
                      placeholder="Enter VBT Code..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                ) : wise === "vendorwise" ? (
                  <>
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
                  </>
                ) : (
                  wise == "effectivewise" && (
                    <MyDatePicker
                      size="default"
                      setDateRange={setSearchDateRange}
                      dateRange={searchDateRange}
                      value={searchDateRange}
                    />
                  )
                )}
              </Col>
            </div>

            <div style={{ width: 150 }}>
              <MySelect
                options={vbtTypeOptions}
                onChange={setVbtOption}
                value={vbtOption}
              />
            </div>
            <Button
              type="primary"
              onClick={() => setOpenModal(true)}
              loading={loading}
            >
              Generate
            </Button>
            <Modal
              title="VBT Report Information!"
              open={openModal}
              onCancel={() => setOpenModal(false)}
              onOk={() => downlaodReport()}
            >
              <p>The process of report generation has started!</p>
              <p>
                Kindly check you mail after some time for furthur information.
              </p>
            </Modal>
          </Space>
        </Col>
      </Row>
      <div style={{ height: "95%", padding: "0 10px" }}>
        {/* <MyDataTable
          // initialState={{
          //   columns: {
          //     // ...data.initialState?.columns,
          //     columnVisibilityModel: {
          //       min_id: false,
          //       // vbt_code: false,
          //       cgst_gl: false,
          //     },
          //   },
          // }}
          checkboxSelection={wise == "vendorwise"}
          loading={loading}
          columns={columns}
          data={rows}
          onSelectionModelChange={(newSelectionModel) => {
            console.log(newSelectionModel);
            setSelectedRows(newSelectionModel);
          }}
        /> */}
      </div>
    </div>
  );
}

export default VBTRecords;
