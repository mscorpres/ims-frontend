import { Button, Col, Form, Row, Skeleton } from "antd";
import React, { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { getProductsOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
function R22() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectDate, setSelectDate] = useState("");
  const [bomName, setBomName] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
  });
  const [resData, setResData] = useState([]);

  const { executeFun, loading1 } = useApi();
  const getDataBySearch = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );

      setAsyncOptions(response.data);
    }
  };
  const getBom = async () => {
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData?.selectProduct,
    });
    console.log(data.data);
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
    } else if (!selectDate[0]) {
      toast.error("Please select a valid date");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/report22", {
        skucode: allData.selectProduct,
        subject: allData.selectBom,
        date: selectDate,
      });
      // console.log(data);
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return {
            ...row,
            id: v4(),
            statusHtml: row.status,
            status: row.status?.includes("INACTIVE")
              ? "INACTIVE"
              : row.status.includes("ALTERNATIVE")
              ? "ALTERNATIVE"
              : row.status.includes("ACTIVE")
              ? "ACTIVE"
              : "",
          };
        });
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
    <div>
      {" "}
      <div style={{ height: "90%" }}>
        <Row gutter={16} style={{ margin: "5px" }}>
          <Col span={5}>
            <MyAsyncSelect
              loadOptions={getDataBySearch}
              onBlur={() => setAsyncOptions([])}
              optionsState={asyncOptions}
              onInputChange={(e) => setSearch(e)}
              placeholder="Select Product"
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
              value={allData?.selectBom.value}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectBom: e };
                })
              }
            />
          </Col>
          <Col span={4}>
            <SingleDatePicker setDate={setSelectDate} />
          </Col>
          {allData?.selectBom.length > 1 && (
            <Col span={4}>
              <div>
                {/* <Button
                    onClick={reset}
                    style={{ backgroundColor: "red", color: "white", marginRight: "5px" }}
                  >
                    Cancel
                  </Button> */}
                <Button onClick={fetchBySearch} type="primary">
                  Generate
                </Button>
              </div>
            </Col>
          )}
          <Col span={24}>
            <Skeleton loading={loading} active>
              <div
                className="hide-select"
                style={{ height: "75vh", marginTop: "0.75em" }}
              >
                <MyDataTable
                  checkboxSelection={true}
                  loading={loading}
                  data={resData}
                  columns={columns}
                />
              </div>
            </Skeleton>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default R22;
const columns = [
  { field: "serial_no", headerName: "S. No", width: 40 },
  { field: "partno", headerName: "Part No", width: 80 },
  { field: "new_partno", headerName: "Cat Part Code", width: 150 },
  { field: "bomalt_name", headerName: "Bom ALt Name", width: 100 },
  { field: "bomalt_part", headerName: "Alt Of", width: 80 },
  { field: "bomqty", headerName: "Bom Qty", width: 80 },
  { field: "category", headerName: "Category", width: 80 },
  { field: "components", headerName: "Components", flex: 1 },
  { field: "uom", headerName: "UOM", width: 80 },
  { field: "closingBal", headerName: "Cl Qty", width: 80 },
  { field: "openBal", headerName: "Op Qty", width: 80 },
  { field: "creditBal", headerName: "In Qty", width: 80 },
  { field: "debitBal", headerName: "Out Qty", width: 80 },
  //   { field: "openBal", headerName: "Open Bal", width: 80 },
  {
    field: "status",
    headerName: "Status",
    width: 80,
    type: "status",
    renderCell: ({ row }) => (
      <span dangerouslySetInnerHTML={{ __html: row.statusHtml }} />
    ),
  },
];
