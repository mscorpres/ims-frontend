import React, { useState } from "react";
import { Button, Col, Row, Select } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";

function R15() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selType: "",
    part: "",
  });
  // console.log(allData);
  const [datee, setDatee] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [responseData, setResponseData] = useState([]);
  const [responsePoData, setResponsePoData] = useState([]);
  const options = [
    { label: "ALL MIN", value: "M" },
    { label: "PO(s) MIN", value: "P" },
  ];

  const getOption = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/searchPoByPoNo", {
        search: e,
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const fetch = async () => {
    // console.log(c)
    if (!allData.selType) {
      toast.error("Please Select Type");
    } else if (!datee[0]) {
      toast.error("Please Select Date First");
    } else {
      setResponseData([]);
      setLoading(true);
      const { data } = await imsAxios.post("/transaction/transactionIn", {
        data: datee,
        min_types: allData?.selType,
      });
      // console.log(data.data);
      if (data.code == 200) {
        // setLoading(true);
        toast.success(data.message);
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setResponseData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const fetchPo = async () => {
    setResponsePoData([]);
    setLoading(true);
    const { data } = await imsAxios.post("/transaction/transactionIn", {
      data: allData.part,
      min_types: allData?.selType,
    });
    // console.log(data);
    if (data.code == 200) {
      // toast.success(data.message);
      let arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setResponsePoData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const columns = [
    { field: "DATE", headerName: "Date & Time", width: 150 },
    { field: "TYPE", headerName: "Transfer Type", width: 140 },
    { field: "PART", headerName: "Part Type", width: 80 },
    { field: "PART_NEW", headerName: "Cat Part Code", width: 150 },
    {
      field: "COMPONENT",
      headerName: "Component",
      width: 320,
    },
    { field: "LOCATION", headerName: "In Location", width: 100 },
    { field: "RATE", headerName: "Rate", width: 80 },
    { field: "CURRENCY", headerName: "Currency", width: 120 },
    { field: "INQTY", headerName: "In Qty", width: 80 },
    { field: "UNIT", headerName: "UoM", width: 80 },
    { field: "VENDOR", headerName: "Vendor", width: 200 },
    { field: "INVOIVENUMBER", headerName: "Doc.Id ", width: 120 },
    { field: "TRANSACTION", headerName: "Transaction Id", width: 130 },
    { field: "ISSUEBY", headerName: "In By", width: 120 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        DATE: row.DATE,
        "TRANFER TYPE": row.TYPE,
        PART: row.PART,
        COMPONENT: row.COMPONENT,
        "IN LOCATION": row.LOCATION,
        RATE: row.RATE,
        CURRENCY: row.CURRENCY,
        "IN QTY": row.INQTY,
        UOM: row.UNIT,
        VENDOR: row.VENDOR,
        "DOC. ID": row.INVOIVENUMBER,
        "TRANSACTION ID": row.TRANSACTION,
        "IN BY": row.ISSUEBY,
      };
    });
    downloadCSVCustomColumns(csvData, "MIN Register Report");
  };

  const handleDownloadingCSV1 = () => {
    let arr = [];
    let csvData = [];
    arr = responsePoData;
    csvData = arr.map((row) => {
      return {
        DATE: row.DATE,
        "TRANFER TYPE": row.TYPE,
        PART: row.PART,
        COMPONENT: row.COMPONENT,
        "IN LOCATION": row.LOCATION,
        RATE: row.RATE,
        CURRENCY: row.CURRENCY,
        "IN QTY": row.INQTY,
        UOM: row.UNIT,
        VENDOR: row.VENDOR,
        "DOC. ID": row.INVOIVENUMBER,
        "TRANSACTION ID": row.TRANSACTION,
        "IN BY": row.ISSUEBY,
      };
    });
    downloadCSVCustomColumns(csvData, "MIN Register Report");
  };

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={3}>
          <Select
            placeholder="Select Option"
            options={options}
            value={allData?.selType.value}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, selType: e };
              })
            }
            style={{
              width: "100%",
            }}
          />
        </Col>
        {allData.selType == "M" ? (
          <>
            <Col span={4}>
              <MyDatePicker size="default" setDateRange={setDatee} />
            </Col>
            <Col span={1}>
              <Button onClick={fetch} loading={loading} type="primary">
                Fetch
              </Button>
            </Col>
            {responseData.length > 0 && (
              <Col span={1} offset={15}>
                <Button onClick={handleDownloadingCSV}>
                  <DownloadOutlined style={{ fontSize: "15px" }} />
                </Button>
              </Col>
            )}
          </>
        ) : allData.selType == "P" ? (
          <>
            <Col span={4}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getOption}
                value={allData.part}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, part: e };
                  })
                }
                placeholder="Part/Name"
              />
            </Col>
            <Col span={1}>
              <Button onClick={fetchPo} loading={loading} type="primary">
                Fetch
              </Button>
            </Col>
            {responsePoData.length > 0 && (
              <Col span={1} offset={15}>
                <Button onClick={handleDownloadingCSV1}>
                  <DownloadOutlined style={{ fontSize: "15px" }} />
                </Button>
              </Col>
            )}
          </>
        ) : (
          <>
            <Col span={4}>
              <MyDatePicker size="default" setDateRange={setDatee} />
            </Col>
            <Col span={1}>
              <Button onClick={fetch} type="primary">
                Fetch
              </Button>
            </Col>
          </>
        )}
      </Row>

      <div className="hide-select" style={{ height: "95%", margin: "10px" }}>
        {allData.selType == "M" ? (
          <MyDataTable
            loading={loading}
            data={responseData}
            columns={columns}
            checkboxSelection={true}
          />
        ) : allData.selType == "P" ? (
          <MyDataTable
            loading={loading}
            data={responsePoData}
            columns={columns}
            checkboxSelection={true}
          />
        ) : (
          <MyDataTable
            loading={loading}
            data={responseData}
            columns={columns}
            checkboxSelection={true}
          />
        )}
        {/* )} */}
      </div>
    </div>
  );
}

export default R15;
