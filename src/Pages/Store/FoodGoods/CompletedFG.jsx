import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Row, Select } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi";
import { getProductsOptions } from "../../../api/general";

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

  const columns = [
    { field: "index", headerName: "No.", width: 100 },
    { field: "ppr_type", headerName: "Type", width: 150 },
    {
      headerName: "Req. Id",
      field: "mfg_transaction",
      renderCell: ({ row }) => (
        <span> {row.mfg_transaction + " / " + row.ppr_transaction}</span>
      ),
      width: 200,
    },
    { field: "mfg_date", headerName: "Date/Time", width: 170 },
    { field: "ppr_sku", headerName: "SKU", width: 100 },
    { field: "sku_name", headerName: "Product", width: 420 },
    {
      field: "completed_qty",
      headerName: "MFG/STIN Qty",
      width: 160,
    },
  ];

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

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={5} style={{ margin: "5px" }}>
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
              <Button onClick={dateWise} type="primary">
                Fetch
              </Button>
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
              <Col span={2} className="gutter-row">
                <Button onClick={skuWise} type="primary">
                  Fetch
                </Button>
              </Col>
              {skuData.length > 0 && (
                <Col span={2} offset={11} className="gutter-row">
                  <div>
                    <Button onClick={handleDownloadingCSV}>
                      <MdOutlineDownloadForOffline
                        style={{ fontSize: "20px" }}
                      />
                    </Button>
                  </div>
                </Col>
              )}
            </>
          </>
        ) : (
          ""
        )}

        {/* {dateData.length >= 1 ? (
          <Col span={3} className="gutter-row">
            <div>
              <Button>
                <DownloadOutlined
                  onClick={handleDownloadingCSV}
                  style={{ fontSize: "18px" }}
                  color="#5D7788"
                />
              </Button>
            </div>
          </Col>
        ) : (
          <Col span={3} className="gutter-row">
            <div>
              <Button>
                <DownloadOutlined
                  onClick={handleDownloadingCSV}
                  style={{ fontSize: "18px" }}
                  color="#5D7788"
                />
              </Button>
            </div>
          </Col>
        )} */}
      </Row>
      <div style={{ height: "93%", margin: "5px" }}>
        {all.info == "datewise" ? (
          <MyDataTable loading={loading} data={dateData} columns={columns} />
        ) : (
          <MyDataTable loading={loading} data={skuData} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default CompletedFG;
