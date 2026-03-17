import React, { useState } from "react";
import { toast } from "react-toastify";
import { Col, Row, Select, Space } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyButton from "../../../Components/MyButton";
import dayjs from "dayjs";

function FGToFGViewTransaction() {
  const [loading, setLoading] = useState(false);
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "datewise",
  });
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);

  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "part", headerName: "SKU Code", width: 150 },
   
    { field: "name", headerName: "Products", width: 350 },
    { field: "out_location", headerName: "Out Location", width: 150 },
    { field: "in_location", headerName: "In Location", width: 150 },
    {
      field: "qty",
      headerName: "Qty",
      width: 120,
      renderCell: ({ row }) => <span>{`${row?.qty} ${row?.uom}`}</span>,
    },
    { field: "transaction", headerName: "Transaction In", width: 150 },
    { field: "completed_by", headerName: "Transferred By", width: 150 },
    { field: "remark", headerName: "Remark", width: 150 },
  ];

  const handleDownloadingCSV = () => {
    downloadCSV(
      dataComesFromDateWise,
      columns,
      "FG To FG View Transaction"
    );
  };

  const formatDateForAPI = (dateValue) => {
    // datee can be "DD-MM-YYYY-DD-MM-YYYY" from MyDatePicker or a dayjs range
    if (typeof dateValue === "string" && dateValue.includes("-")) {
      const parts = dateValue.split("-");
      if (parts.length >= 6) {
        const fromDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        const toDate = `${parts[5]}-${parts[4]}-${parts[3]}`; // YYYY-MM-DD
        return { fromDate, toDate };
      }
    } else if (Array.isArray(dateValue) && dateValue.length === 2) {
      const fromDate = dayjs(dateValue[0]).format("YYYY-MM-DD");
      const toDate = dayjs(dateValue[1]).format("YYYY-MM-DD");
      return { fromDate, toDate };
    } else if (dateValue && typeof dateValue === "object") {
      if (dateValue[0] && dateValue[1]) {
        const fromDate = dayjs(dateValue[0]).format("YYYY-MM-DD");
        const toDate = dayjs(dateValue[1]).format("YYYY-MM-DD");
        return { fromDate, toDate };
      }
    }
    return null;
  };

  const dateWise = async (e) => {
    e.preventDefault();
    if (!allData.selectdate) {
      toast.error("Please Select Mode Then Proceed Next");
      return;
    }
    if (!datee) {
      toast.error("Please Select Date");
    } else {
      setDataComesFromDateWise([]);
      setLoading(true);

      // console.log("datee->>>", c);

      const { data } = await imsAxios.post("/godown/report_fg2fg_same", {
        data: datee,
        wise: allData.selectdate,
      });
      console.log(data);
      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDataComesFromDateWise(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };
  return (
    <div style={{ height: "90%" }}>
      <Row gutter={16} justify="space-between" style={{ margin: "10px" }}>
        <Space>
          <div style={{ width: 120 }}>
            <Select
              options={options}
              style={{ width: "100%" }}
              placeholder="Select"
              value={allData.selectdate}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectdate: e };
                })
              }
            />
          </div>
          <div style={{ width: 250 }}>
            <MyDatePicker size="default" setDateRange={setDatee} />
          </div>
          <MyButton
            onClick={dateWise}
            loading={loading}
            type="primary"
            variant="search"
          >
            Fetch
          </MyButton>
        </Space>
        <Col className="gutter-row">
          <CommonIcons
            disabled={dataComesFromDateWise.length === 0}
            action="downloadButton"
            onClick={handleDownloadingCSV}
          />
        </Col>
      </Row>
      <div style={{ height: "90%", margin: "10px" }}>
        <MyDataTable
          loading={loading}
          data={dataComesFromDateWise}
          columns={columns}
        />
      </div>
    </div>
  );
}

export default FGToFGViewTransaction;

