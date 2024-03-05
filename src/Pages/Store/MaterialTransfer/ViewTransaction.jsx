import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Col, DatePicker, Row, Select, Space } from "antd";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";

const { RangePicker } = DatePicker;

function ViewTransaction() {
  const [loading, setLoading] = useState(false);
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "datewise",
  });
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);
  // console.log(dataComesFromDateWise);
  const col = [
    { name: "Date", selector: (row) => row.date },
    { name: "Part", selector: (row) => row.part },
    { name: "Component", selector: (row) => row.name },
    { name: "Out Location", selector: (row) => row.out_location },
    { name: "In Location", selector: (row) => row.in_location },
    { name: "Qty", selector: (row) => row.qty },
    { name: "UOM", selector: (row) => row.uom },
    { name: "Txd In", selector: (row) => row.transaction },
    { name: "Shiffed By", selector: (row) => row.date },
  ];

  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "part", headerName: "Part", width: 150 },
    { field: "name", headerName: "Component", width: 350 },
    { field: "out_location", headerName: "Out Location", width: 150 },
    { field: "in_location", headerName: "In Location", width: 150 },
    {
      field: "qty",
      headerName: "Qty",
      width: 120,
      renderCell: ({ row }) => <span>{`${row?.qty} ${row?.uom}`}</span>,
    },
    { field: "transaction", headerName: "Transaction In", width: 150 },
    { field: "completed_by", headerName: "Shiffed By", width: 150 },
  ];
  const handleDownloadingCSV = () => {
    downloadCSV(dataComesFromDateWise, columns, "View Transaction");
  };

  const dateWise = async (e) => {
    e.preventDefault();
    if (!allData.selectdate) {
      toast.error("Please Select Mode Then Proceed Next");
    } else if (!datee[0]) {
      toast.error("Please Select Date");
    } else {
      setDataComesFromDateWise([]);
      setLoading(true);

      // console.log("datee->>>", c);

      const { data } = await imsAxios.post("/godown/report_rmsf_same", {
        data: datee,
        wise: allData.selectdate,
      });
      // console.log(data);
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
          <Button onClick={dateWise} loading={loading} type="primary">
            Fetch
          </Button>
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

export default ViewTransaction;
