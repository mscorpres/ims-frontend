import { useState } from "react";
import { toast } from "react-toastify";
import { Col, Row, Select, Space } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

function ViewTransaction() {
  const [loading, setLoading] = useState(false);
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "datewise",
  });
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);

  const columns = [
    { accessorKey: "date", header: "Date", size: 150 },
    { accessorKey: "part", header: "Part Code", size: 150 },
    { accessorKey: "cat_part", header: "Cat Part Code", size: 150 },
    { accessorKey: "name", header: "Component", size: 350 },
    { accessorKey: "out_location", header: "Out Location", size: 150 },
    { accessorKey: "in_location", header: "In Location", size: 150 },
    {
      accessorKey: "qty",
      header: "Qty",
      size: 120,
      render: ({ row }) => <span>{`${row?.qty} ${row?.uom}`}</span>,
    },
    { accessorKey: "transaction", header: "Transaction In", size: 150 },
    { accessorKey: "completed_by", header: "Shiffed By", size: 150 },
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
          <CustomButton
            size="small"
            title={"Search"}
            starticon={<Search fontSize="small" />}
            loading={loading}
            onclick={dateWise}
          />
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
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

export default ViewTransaction;
