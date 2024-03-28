import React, { useState, useEffect } from "react";
import "./r.css";
import axios from "axios";
import { toast } from "react-toastify";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import moment from "moment";
import { Button, Col, DatePicker, Row, Select, Space } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import { DownloadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import InternalNav from "../../../Components/InternalNav";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const { RangePicker } = DatePicker;

const R14 = () => {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selType: "",
  });
  const [responseData, setResponseData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState([]);

  const options = [{ label: "Fetch", value: "fetchStock" }];

  // console.log(allData);

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Date: row.dt,
        "Part Name": row.name,
        "Part No": row.part,
        Uom: row.uom,
        "IMS Stock": row.cl,
        "Physical Stock": row.rm,
        "Verified By": row.by,
        Remark: row.remark,
      };
    });
    downloadCSVCustomColumns(csvData, "RM Physical Report");
  };

  const columns = [
    { field: "dt", headerName: "Date", width: 150 },
    { field: "name", headerName: "Part Name", width: 380 },
    { field: "part", headerName: "Part No", width: 100 },
    { field: "new_part", headerName: "Cat Part Code", width: 150 },
    { field: "uom", headerName: "UoM", width: 100 },
    {
      field: "cl",
      headerName: "IMS Stock",
      width: 100,
    },
    // { field: "Alt Of", headerName: "Alt Of", width: 100 },
    { field: "rm", headerName: "Physical Stock", width: 200 },
    { field: "by", headerName: "Verified By", width: 200 },
    { field: "remark", headerName: "Remark", width: 220 },
  ];

  const fetch = async () => {
    if (!allData.selType) {
      toast.error("Please Select Type");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/audit/fetchAuditReport", {
        type: allData.selType.value,
      });
      // setLoading(false);
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setResponseData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message);
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <>
          <Col span={4}>
            <div>
              <MySelect
                style={{ width: "100%" }}
                placeholder="Please Select Option "
                options={options}
                // value={allData?.selType}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selType: e };
                  })
                }
              />
            </div>
          </Col>

          <Col span={2}>
            <MyButton variant="search" onClick={fetch} type="primary" block>
              Fetch
            </MyButton>
          </Col>

          {responseData.length > 1 ? (
            <Col span={1} offset={17}>
              <Button onClick={handleDownloadingCSV}>
                <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
              </Button>
            </Col>
          ) : (
            ""
          )}
        </>
      </Row>

      <div className="m-2" style={{ height: "100%" }}>
        <div className="hide-select" style={{ height: "80%", margin: "10px" }}>
          <MyDataTable
            loading={loading}
            data={responseData}
            columns={columns}
            checkboxSelection={true}
          />
        </div>
      </div>
    </div>
  );
};

export default R14;
