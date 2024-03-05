import React, { useEffect, useState } from "react";
import "./r.css";
import { DownloadOutlined } from "@ant-design/icons";

import { Button, Col, DatePicker, Row, Skeleton, Spin } from "antd";
import { toast } from "react-toastify";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";

const R7 = () => {
  const [seacrh, setSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [bomName, setBomName] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
    selectBomWise: "",
  });
  const [resData, setResData] = useState([]);

  const { executeFun, loading1 } = useApi();
  const columns = [
    { field: "serial_no", headerName: "S.No.", width: 60 },
    {
      field: "part_no",
      headerName: "Part No.",
      width: 120,
    },
    {
      field: "new_partno",
      headerName: "Cat Part Code",
      width: 150,
    },
    {
      field: "part_name",
      headerName: "Component",
      width: 350,
    },
    // { field: "category", headerName: "Category", width: 100 },
    {
      field: "bomstatus",
      headerName: "Status",
      width: 120,
      type: "status",
      renderCell: ({ row }) => (
        <span
          dangerouslySetInnerHTML={{
            __html: row.bomstatus,
          }}
        />
      ),
    },
    { field: "bomqty", headerName: "BOM Qty", width: 120 },
    { field: "unit_name", headerName: "UOM", width: 120 },
    {
      field: "closingBal",
      headerName: "CL Qty",
      width: 100,
    },
    {
      field: "replenish",
      headerName: "Replenishment",
      width: 140,
    },
  ];

  const opt = [{ label: "Bom Wise", value: "Bom Wise" }];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = resData;
    csvData = arr.map((row) => {
      return {
        No: row.serial_no,
        "Part No": row.part_no,
        Component: row.part_name,
        Status:
          row.bomstatus ==
          '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>'
            ? "ACTIVE"
            : row.bomstatus ==
              '<span style="color: #e53935; font-weight: 600;">INACTIVE</span>'
            ? "INACTIVE"
            : "ALTERNATIVE",
        "Bom Qty": row.bomqty,
        Uom: row.unit_name,
        "CL Qty": row.closingBal,
        Replenishment: row.replenish,
      };
    });
    downloadCSVCustomColumns(csvData, "PPR Replenishment");
  };

  const getDataBySearch = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      let { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      // return arr;
      setAsyncOptions(arr);
    }
  };

  const getBom = async () => {
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData?.selectProduct,
    });
    const arr = data.data.map((d) => {
      return { value: d.bomid, text: d.bomname };
    });
    setBomName(arr);
  };

  const fetchBySearch = async () => {
    if (!allData.selectProduct) {
      toast.error("Please select a product");
    } else if (!allData.selectBomWise) {
      toast.error("Please select a bom");
    } else if (!allData.selectBomWise) {
      toast.error("Please select a bomwise");
    } else if (!selectDate[0]) {
      toast.error("Please select a valid date");
    } else {
      setResData([]);
      setLoading(true);
      const { data } = await imsAxios.post("/report7", {
        date: selectDate,
        skucode: allData.selectProduct,
        subject: allData.selectBom,
        action: "search_r7",
      });
      // console.log(data);
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return { ...row, id: v4() };
        });
        setResData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        setLoading(true);
        toast.error(data.message);
        setLoading(false);
      }
    }
    // {}
  };

  useEffect(() => {
    if (allData.selectProduct) {
      getBom();
    }
  }, [allData.selectProduct]);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={10} style={{ margin: "0px" }}>
        <Col span={5}>
          <Row style={{ padding: "5px" }}>
            <Col span={24} style={{ margin: "5px" }}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                placeholder="Select Product"
                loadOptions={getDataBySearch}
                onInputChange={(e) => setSearch(e)}
                value={allData.selectProduct.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectProduct: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ margin: "5px" }}>
              <MySelect
                placeholder="Select Bom"
                options={bomName}
                value={allData.selectBom.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectBom: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ margin: "5px" }}>
              <MySelect
                placeholder="Bom Wise"
                options={opt}
                value={allData.selectBomWise.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectBomWise: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ margin: "5px" }}>
              <SingleDatePicker setDate={setSelectDate} />
            </Col>
            <Col span={24} style={{ margin: "5px" }}>
              <div style={{ textAlign: "end" }}>
                {resData.length > 1 && (
                  <Button
                    onClick={handleDownloadingCSV}
                    loading={loading}
                    style={{ marginRight: "5px" }}
                  >
                    <DownloadOutlined style={{ fontSize: "10px" }} />
                  </Button>
                )}
                <Button
                  onClick={fetchBySearch}
                  loading={loading}
                  type="primary"
                >
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Col>
        <Col span={19}>
          {loading ? (
            <div
              style={{
                // height:"80vh",
                justifyItems: "center",
                padding: "350px 0",
                textAlign: "center",
              }}
            >
              <Spin />
            </div>
          ) : (
            <div className="hide-select" style={{ height: "85vh" }}>
              <MyDataTable
                checkboxSelection={true}
                data={resData}
                columns={columns}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default R7;

{
  /* <Row gutter={24} style={{ margin: "5px" }}>
  <Col span={6}>
    <MyAsyncSelect
      style={{ width: "100%" }}
      onBlur={() => setAsyncOptions([])}
      optionsState={asyncOptions}
      placeholder="Select Product"
      loadOptions={getDataBySearch}
      onInputChange={(e) => setSearch(e)}
      value={allData.selectProduct.value}
      onChange={(e) =>
        setAllData((allData) => {
          return { ...allData, selectProduct: e };
        })
      }
    />
  </Col>
  <Col span={4}>
    <MySelect
      placeholder="Select Bom"
      options={bomName}
      value={allData.selectBom.value}
      onChange={(e) =>
        setAllData((allData) => {
          return { ...allData, selectBom: e };
        })
      }
    />
  </Col>
  <Col span={3}>
    <MySelect
      placeholder="Bom Wise"
      options={opt}
      value={allData.selectBomWise.value}
      onChange={(e) =>
        setAllData((allData) => {
          return { ...allData, selectBomWise: e };
        })
      }
    />
  </Col>
  <Col span={4}>
    <SingleDatePicker setDate={setSelectDate} />
  </Col>
  <Col span={2}>
    <Button onClick={fetchBySearch} type="primary">
      Search
    </Button>
  </Col>
  {resData.length > 1 && (
    <Col span={1} offset={2} className="gutter-row">
      <Button onClick={handleDownloadingCSV} style={{ marginLeft: "60px" }}>
        <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
      </Button>
    </Col>
  )}
</Row>

<div style={{ height: "90%", margin: "10px" }}>
  <MyDataTable loading={loading} data={resData} columns={columns} />
</div> */
}
