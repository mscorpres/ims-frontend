import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Col, Row, Select } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { getViewFgColumns } from "../FoodGoods/fgcolunms";

const ViewFGOut = () => {
  const [loading, setLoading] = useState(false);
  const [localVar, setLocalVar] = useState({
    sel: "",
  });
  const [selectDate, setSelectDate] = useState("");
  const opt = [{ label: "Out", value: "O" }];
  const [fetchDataFromDate, setFetchDataFromDate] = useState([]);

  const dateWise = async (e) => {
    e.preventDefault();

    if (!localVar.sel) {
      toast.error("Please Select Button");
    } else if (!selectDate) {
      toast.error("Please Select Date");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/fgout/fetchFgOutRpt", {
        method: localVar.sel,
        date: selectDate,
      });
      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setFetchDataFromDate(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message);
        setLoading(false);
      }
    }
  };

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = fetchDataFromDate;
    csvData = arr.map((row) => {
      return {
        Date: row.approvedate,
        SKU: row.sku,
        Product: row.name,
        "Out Qty": row.approveqty,
        "Out By": row.approveby,
        "FG TYPE": row.fg_type,
      };
    });
    downloadCSV(csvData);
  };

  const columns = useMemo(() => getViewFgColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: fetchDataFromDate || [],
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
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback  />
    ),

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
      <Row gutter={16} style={{ margin: "10px" }}>
        <Col span={4} className="gutter-row">
          <div>
            <Select
              options={opt}
              style={{ width: "100%" }}
              placeholder="Select type"
              value={localVar.sel}
              onChange={(e) =>
                setLocalVar((localVar) => {
                  return { ...localVar, sel: e };
                })
              }
            />
          </div>
        </Col>
        <Col span={4} className="gutter-row">
          <div>
            <SingleDatePicker setDate={setSelectDate} />
          </div>
        </Col>
        <Col span={2} className="gutter-row">
          <div>
            <CustomButton
              onclick={dateWise}
              title={"Search"}
              size="small"
              starticon={<Search fontSize="small" />}
              loading={loading}
            />
          </div>
        </Col>
      </Row>
      <div style={{ height: "90%", margin: "10px" }}>
        {/* <MyDataTable
          loading={loading}
          data={fetchDataFromDate}
          columns={columns}
        /> */}
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default ViewFGOut;
