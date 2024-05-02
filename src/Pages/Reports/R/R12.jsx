import React, { useEffect, useState } from "react";
import "./r.css";
import axios from "axios";
import { toast } from "react-toastify";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import InternalNav from "../../../Components/InternalNav";
import { Button, Col, Input, Row } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getProductsOptions } from "../../../api/general";
import MyButton from "../../../Components/MyButton";

const R12 = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [bomName, setBomName] = useState([]);
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
    fgQty: "",
  });

  const [resData, setResData] = useState([]);

  const { executeFun, loading1 } = useApi();
  const columns = [
    // { field: "dt", headerName: "S.No.", width: 150 },
    { field: "serial_no", headerName: "S.No.", width: 80 },
    { field: "partno", headerName: "Part No", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "components",
      headerName: "Component",
      width: 380,
    },
    { field: "uom", headerName: "UoM", width: 100 },
    { field: "bomqty", headerName: "Bom Qty", width: 200 },
    { field: "currentStock", headerName: "Available Qty", width: 200 },
    { field: "reqStock", headerName: "Req Qty", width: 220 },
    {
      field: "currentStock - reqStock",
      headerName: "Final Need Qty",
      width: 150,
      renderCell: ({ row }) => <span>{row.reqStock - row.currentStock}</span>,
    },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = resData;
    csvData = arr.map((row) => {
      return {
        "Part No": row.partno,
        Component: row.components,
        UOM: row.uom,
        "Bom Qty": row.bomqty,
        "Avalable Qty": row.currentStock,
        "Req Qty": row.reqStock,
        "Final Need Qty": `${row.reqStock}` - ` ${row.currentStock}`,
      };
    });
    downloadCSVCustomColumns(csvData, "Required RM For FG");
  };

  const getDataBySearch = async (searchInput) => {
    const response = await executeFun(
      () => getProductsOptions(searchInput, true),
      "select"
    );

    setAsyncOptions(response.data);
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
    } else if (!allData.selectBom) {
      toast.error("Please select a bom");
    } else if (!allData.fgQty) {
      toast.error("Please select add Qty");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/report12", {
        subjectcode: allData.selectBom,
        skucode: allData.selectProduct,
        product_fg_qty: allData.fgQty,
        action: "search_r12",
      });
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return { ...row, id: v4() };
        });
        console.log(arr);
        setResData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        setLoading(true);
        toast.error(data.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (allData?.selectProduct) {
      getBom();
    }
  }, [allData?.selectProduct]);

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "5px" }}>
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
          {/* <AsyncSelect
            placeholder="Select Product"
            loadOptions={getDataBySearch}
            onInputChange={(e) => setSearch(e)}
            value={allData.selectProduct}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, selectProduct: e };
              })
            }
          /> */}
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
        <Col span={2}>
          <Input
            style={{ width: "100%", margin: "-1px" }}
            placeholder="Qty"
            className="form-control"
            value={allData.fgQty}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, fgQty: e.target.value };
              })
            }
          />
          {/* <input
            placeholder="Qty"
            className="form-control"
            value={allData.fgQty}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, fgQty: e.target.value };
              })
            }
          /> */}
        </Col>
        <Col span={1}>
          <MyButton variant="search" onClick={fetchBySearch} type="primary">
            Fetch
          </MyButton>
        </Col>
        {resData.length > 1 && (
          <Col span={2} offset={9} className="gutter-row">
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div className="hide-select" style={{ height: "90%", margin: "10px" }}>
        <MyDataTable
          checkboxSelection={true}
          loading={loading}
          data={resData}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default R12;
