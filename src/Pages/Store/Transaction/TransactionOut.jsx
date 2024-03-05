import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { toast } from "react-toastify";

import { Button, Col, Popover, Row, Space } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import MyDatePicker from "../../../Components/MyDatePicker";
import { setNotifications } from "../../../Features/loginSlice/loginSlice.js";
import socket from "../../../Components/socket";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { DownloadOutlined } from "@ant-design/icons";

const TransactionOut = () => {
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [dateData, setDateData] = useState([]);
  const [fetchData, setFetchData] = useState([]);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const { user, notifications } = useSelector((state) => state.login);

  const content1 = (row) => (
    <div>
      <span
        style={{ fontWeight: "bold" }}
        dangerouslySetInnerHTML={{ __html: row }}
      />
    </div>
  );

  const columns = [
    { field: "DATE", headerName: "Date", width: 170 },
    { field: "TYPE", headerName: "Type", width: 100 },
    { field: "PART", headerName: "Part No.", width: 150 },
    { field: "PART_NEW", headerName: "New Part No.", width: 150 },
    { field: "COMPONENT", headerName: "Component", minWidth: 200, flex: 1 },
    { field: "FROMLOCATION", headerName: "From Location", width: 160 },
    { field: "TOLOCATION", headerName: "To Location", width: 160 },
    { field: "OUTQTY", headerName: "Out Qty", width: 140 },
    { field: "UNIT", headerName: "UOM", width: 140 },
    {
      field: "VENDORCODE",
      headerName: "Vendor",
      width: 160,
      renderCell: ({ row }) => (
        // console.log(row),
        <Popover content={content1(row?.VENDORNAME)}>
          <span style={{ fontWeight: "bolder", cursor: "pointer" }}>
            {row?.VENDORCODE}
          </span>
        </Popover>
      ),
    },
    { field: "REQUESTEDBY", headerName: "Requested By", width: 160 },
    { field: "ISSUEBY", headerName: "Approved By", width: 160 },
  ];

  const handleDownloadingCSV = () => {
    let newId = v4();
    socket.emit("trans_out", {
      otherdata: JSON.stringify({ date: datee, branch: user.company_branch }),
      notificationId: newId,
    });
  };
  const handleSimmpleDownloadingCSV = () => {
    downloadCSV(dateData, columns, "RM Register Report");
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

    if (!datee[0] || !datee[1]) {
      toast.error("a");
    } else {
      setLoading(true);
      setDateData([]);
      const { data } = await imsAxios.post("/transaction/transactionOut", {
        data: datee,
      });
      // console.log("Response", data);
      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDateData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const ress = dateData.filter((a) => {
      return a.PART.toLowerCase().match(search.toLowerCase());
    });
    setFetchData(ress);
  }, [search]);

  // console.log(dateData);
  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "5px" }} justify="space-between">
        <Col>
          <Space>
            <MyDatePicker setDateRange={setDatee} size="default" />

            <Button onClick={rmIssue} loading={loading} block type="primary">
              Fetch
            </Button>
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
        <MyDataTable loading={loading} data={dateData} columns={columns} />
      </div>
    </div>
  );
};

export default TransactionOut;
