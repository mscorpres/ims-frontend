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

function JwToJwViewTransaction() {
  const [loading, setLoading] = useState(false);
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "datewise",
  });
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);

  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "jw_po", headerName: "JW PO", width: 150 },
    { field: "part", headerName: "Part Code", width: 150 },
    { field: "cat_part", headerName: "Cat Part Code", width: 150 },
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
    { field: "completed_by", headerName: "Transferred By", width: 150 },
  ];

  const handleDownloadingCSV = () => {
    downloadCSV(dataComesFromDateWise, columns, "JW To JW View Transaction");
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

      const response = await imsAxios.post("/godown/report_jw2jw", {
        data: datee,
        wise: allData.selectdate,
      });

      if (response?.success) {
        let arr = response?.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDataComesFromDateWise(arr);
        setLoading(false);
      } else {
        toast.error(response?.message);
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

export default JwToJwViewTransaction;

