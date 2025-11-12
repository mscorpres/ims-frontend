import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Col, Row, Select } from "antd";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import MyDatePicker from "../../../../Components/MyDatePicker";
import { imsAxios } from "../../../../axiosInterceptor";
import CustomButton from "../../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, IconButton, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

function TransactionRej() {
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "",
  });
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);

  const columns = [
    { accessorKey: "date", header: "Date", size: 150 },
    { accessorKey: "part", header: "Part Code", size: 90 },
    { accessorKey: "cat_part", header: "Cat Part Code", size: 120 },
    { accessorKey: "name", header: "Component", size: 390 },
    { accessorKey: "out_location", header: "Out Location", size: 150 },
    { accessorKey: "in_location", header: "In Location", size: 150 },
    { accessorKey: "qty", header: "Qty", size: 100 },
    { accessorKey: "uom", header: "UoM", size: 80 },
    { accessorKey: "transaction", header: "Transaction In", size: 150 },
    { accessorKey: "completed_by", header: "Shiffed By", size: 150 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = dataComesFromDateWise;
    csvData = arr.map((row) => {
      return {
        Date: row.approvedate,
        Part: row.part,
        Component: row.name,
        "Out Location": row.out_location,
        "In Location": row.in_location,
        Qty: row.qty,
        Uom: row.uom,
        "Txd In": row.transaction,
        "Shiffed By": row.completed_by,
      };
    });
    downloadCSVCustomColumns(csvData, "Transaction Rejection");
  };

  const dataComesFromDBWhenClickButton = async () => {
    if (!allData.selectdate) {
      toast.error("Please Select date wise then proceed");
    } else if (!datee[0]) {
      toast.error("Please Select date ");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/godown/report_rm_rej", {
        data: datee,
        wise: allData.selectdate,
      });
      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDataComesFromDateWise(arr);
        // setFilterDate(data.data);
        setLoading(false);
      } else if (data.code == 500) {
        setDataComesFromDateWise([]);
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

    const table = useMaterialReactTable({
    columns: columns,
    data: dataComesFromDateWise || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });
  return (
    <div style={{ height: "calc(100vh - 290px)" }}>
      <Row gutter={16} style={{ margin: "10px" }}>
        <Col span={4} className="gutter-row">
          <div>
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
        </Col>
        <Col span={5} className="gutter-row">
          <MyDatePicker size="default" setDateRange={setDatee} />
        </Col>
        <Col span={1} className="gutter-row">
          <div>
            <CustomButton
              size="small"
              title={"Search"}
              starticon={<Search fontSize="small" />}
              loading={loading}
              onclick={dataComesFromDBWhenClickButton}
            />
          </div>
        </Col>
        {dataComesFromDateWise.length > 0 && (
          <Col span={1} offset={12} className="gutter-row">
            <div>
              <IconButton
              size="small"
                onClick={handleDownloadingCSV}
                style={{
                  backgroundColor: "#0d9488",
                  color: "white",
                  marginLeft: "60px",
                }}
              >
                <FaDownload />
              </IconButton>
            </div>
          </Col>
        )}
      </Row>
      <div className="m-2" style={{ height: "100%" }}>
        <div style={{ height: "80%", margin: "10px" }}>
            <MaterialReactTable table={table} />
        </div>
      </div>
    </div>
  );
}
export default TransactionRej;
