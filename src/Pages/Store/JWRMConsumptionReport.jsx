import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux/es/exports";
import { toast } from "react-toastify";

import { Button, Col, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable.jsx";
import { v4 } from "uuid";
import MyDatePicker from "../../Components/MyDatePicker.jsx";
import socket from "../../Components/socket.js";
import { downloadCSV } from "../../Components/exportToCSV.jsx";
import { imsAxios } from "../../axiosInterceptor.js";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions.jsx";
import { DownloadOutlined } from "@ant-design/icons";
import MyButton from "../../Components/MyButton/index.jsx";

const JWRMConsumptionReport = () => {
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [dateData, setDateData] = useState([]);
  const [fetchData, setFetchData] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.login);

  const columns = [
    { field: "date", headerName: "Date", width: 120 },
    { field: "type", headerName: "Type", width: 100 },
    { field: "partNo", headerName: "Part No", width: 120 },
    { field: "catPartNo", headerName: "Cat Part No", width: 130 },
    { field: "component", headerName: "Component", minWidth: 200, flex: 1 },
    { field: "fromLocation", headerName: "From Location", width: 150 },
    { field: "toLocation", headerName: "To Location", width: 150 },
    { field: "qty", headerName: "Qty", width: 100 },
    { field: "uom", headerName: "UOM", width: 100 },
    { field: "remark", headerName: "Remark", width: 150 },
    { field: "jobworkId", headerName: "Jobwork ID", width: 150 },
    { field: "transactionId", headerName: "Transaction ID", width: 150 },
    { field: "transactionBy", headerName: "Transaction By", width: 150 },
  ];

  const handleDownloadingCSV = () => {
    let newId = v4();
    socket.emit("trans_out", {
      otherdata: JSON.stringify({ date: datee, branch: user.company_branch }),
      notificationId: newId,
    });
  };
  const handleSimmpleDownloadingCSV = () => {
    downloadCSV(dateData, columns, "JW RM Consumption Report");
  };
  // const handleDownloadXML = () => {
  //   console.log("fetching report");
  //   let newId = v4();
  //   socket.emit("rmsfXML", {
  //     otherdata: { date: datee },
  //     notificationId: newId,
  //   });
  // };
  // console.log(datee);

  const rmIssue = async (e) => {
    e.preventDefault();

    if (!datee) {
      toast.error("Please select date range");
      return;
    } else {
      setLoading(true);
      setDateData([]);
      try {
        const response = await imsAxios.get(
          `/jobwork/jw-rm-consumption-report?date=${encodeURIComponent(datee)}`
        );
        // console.log("Response", response);
        if (response.success) {
          // Handle both array and single object response
          const dataArray = Array.isArray(response.data)
            ? response.data
            : response.data?.data
            ? Array.isArray(response.data.data)
              ? response.data.data
              : [response.data.data]
            : response.data
            ? [response.data]
            : [];

          let arr = dataArray.map((row) => {
            return {
              id: v4(),
              date: row.txnDt || row.date || "",
              type: row.type || "",
              partNo: row.part?.code || row.partNo || "",
              catPartNo: row.part?.catCode || row.catPartNo || "",
              component: row.part?.name || row.component || "",
              fromLocation: row.from || row.fromLocation || "",
              toLocation: row.to || row.toLocation || "",
              qty: row.qty || "0",
              uom: row.uom || row.unit || "",
              remark: row.remark || "",
              jobworkId: row.jw || row.jobworkId || "",
              transactionId: row.txn || row.transactionId || "",
              transactionBy: row.by || row.transactionBy || "",
              // Keep original data for reference
              originalData: row,
            };
          });
          setDateData(arr);
          setLoading(false);
        } else {
          toast.error(response.message || "Failed to fetch report data");
          setLoading(false);
        }
      } catch (error) {
        toast.error(error.message || "Error fetching report data");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (search) {
      const ress = dateData.filter((a) => {
        const partNo = (a.partNo || "").toLowerCase();
        const component = (a.component || "").toLowerCase();
        const searchLower = search.toLowerCase();
        return partNo.match(searchLower) || component.match(searchLower);
      });
      setFetchData(ress);
    } else {
      setFetchData(dateData);
    }
  }, [search, dateData]);

  // console.log(dateData);
  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "5px" }} justify="space-between">
        <Col>
          <Space>
            <MyDatePicker setDateRange={setDatee} size="default" />

            <MyButton
              variant="search"
              onClick={rmIssue}
              loading={loading}
              block
              type="primary"
            >
              Fetch
            </MyButton>
          </Space>
        </Col>
        {/* {dateData.length > 0 && ( */}
        <Col>
          <Space>
            <CommonIcons
              tooltip="Download Detailed Report"
              onClick={handleDownloadingCSV}
              action="downloadButton"
            />

            <Button
              tooltip="Download Brief Report"
              onClick={handleSimmpleDownloadingCSV}
              shape="circle"
              icon={<DownloadOutlined />}
            />
          </Space>
        </Col>
        {/* // )} */}
      </Row>
      <div style={{ height: "87%", margin: "10px" }}>
        <MyDataTable
          loading={loading}
          data={search ? fetchData : dateData}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default JWRMConsumptionReport;
