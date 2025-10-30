import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Button, Col, Row, Select } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { v4 } from "uuid";

import MyDatePicker from "../../../Components/MyDatePicker";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getProductsOptions } from "../../../api/general.ts";
import MyButton from "../../../Components/MyButton";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { Search } from "@mui/icons-material";
import { getFgCompletedColumns } from "./fgcolunms.jsx";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, IconButton, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

const CompletedFG = () => {
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState({
    info: "",
    selOption: "",
  });
  const [asyncSelect, setAsyncSelect] = useState([]);
  const [datee, setDatee] = useState("");
  const [dateData, setDateData] = useState([]);
  const [skuData, setSkuData] = useState([]);
  const options = [
    { label: "Date Wise", value: "datewise" },
    { label: "SKU Wise", value: "skuwise" },
  ];
  // filter date

  const { executeFun, loading1 } = useApi();
  const getOption = async (searchInput) => {
    const response = await executeFun(
      () => getProductsOptions(searchInput, true),
      "select"
    );
    let { data } = response;

    setAsyncSelect(data);
  };

  const skuWise = async () => {
    setLoading(true);
    setSkuData([]);
    const { data } = await imsAxios.post("/fgIN/fgInCompleted", {
      searchBy: all.info,
      searchValue: all.selOption,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setSkuData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const dateWise = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDateData([]);

    const { data } = await imsAxios.post("/fgIN/fgInCompleted", {
      searchBy: all.info,
      searchValue: datee,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setDateData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const handleDownloadingCSV = () => {
    let arr = [];
    if (all.info === "datewise") {
      arr = dateData;
    } else {
      arr = skuData;
    }
    let csvData = [];
    csvData = arr.map((row) => {
      return {
        "Req.ID": `${row.mfg_transaction}/${row.ppr_transaction}`,
        Type: row.ppr_type,
        "Date/Time": row.mfg_date,
        Sku: row.ppr_sku,
        Product: row.sku_name,
        "Mfg/Stin Qtyk": row.completed_qty,
      };
    });
    downloadCSVCustomColumns(csvData, "Completed FG");
  };

  const columns = useMemo(() => getFgCompletedColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: dateData || skuData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    positionActionsColumn: "last",
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 238px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Product Found" />
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
      <Row gutter={5} style={{ margin: "10px" }}>
        <Col span={3}>
          <Select
            options={options}
            style={{ width: "100%" }}
            placeholder="Select Option"
            value={all.info.value}
            onChange={(e) =>
              setAll((all) => {
                return { ...all, info: e };
              })
            }
          />
        </Col>

        {all.info == "datewise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2} className="gutter-row">
              <MyButton onClick={dateWise} type="primary" variant="search">
                Fetch
              </MyButton>
            </Col>
            {dateData.length > 0 && (
              <Col span={2} offset={12} className="gutter-row">
                <div>
                  <Button onClick={handleDownloadingCSV}>
                    <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
                  </Button>
                </div>
              </Col>
            )}
          </>
        ) : all.info == "skuwise" ? (
          <>
            <>
              <Col span={5} className="gutter-row">
                <div>
                  <MyAsyncSelect
                    style={{ width: "100%" }}
                    onBlur={() => setAsyncSelect([])}
                    placeholder="SKU"
                    loadOptions={getOption}
                    optionsState={asyncSelect}
                    value={all.selOption.value}
                    onChange={(e) =>
                      setAll((all) => {
                        return { ...all, selOption: e };
                      })
                    }
                  />
                </div>
              </Col>
              <Col span={6} className="gutter-row">
                <div className="flex " style={{ gap: 12 }}>
                  <CustomButton
                    size="small"
                    title={"Search"}
                    onclick={skuWise}
                    starticon={<Search fontSize="small" />}
                  />
                  {skuData.length > 0 && (
                    <CustomButton
                      size="small"
                      title={"Download"}
                      onclick={handleDownloadingCSV}
                      starticon={<MdOutlineDownloadForOffline />}
                    />
                  )}
                </div>
              </Col>
            </>
          </>
        ) : (
          ""
        )}
      </Row>
      <div style={{ height: "calc(100% - 60px)", margin: "10px" }}>
        {all.info == "datewise" ? (
          <MaterialReactTable table={table} />
        ) : (
          <MaterialReactTable table={table} />
        )}
      </div>
    </div>
  );
};

export default CompletedFG;
