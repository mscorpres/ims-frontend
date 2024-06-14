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
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
import MyDatePicker from "../../../Components/MyDatePicker";
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
function R35() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectDate, setSelectDate] = useState("");
  const [searchedInput, setSearchedInput] = useState("");
  const [bomName, setBomName] = useState([]);
  const [wise, setWise] = useState("date");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
  });
  const [resData, setResData] = useState([]);
  const [form] = Form.useForm();
  const prod = Form.useWatch("product", form);
  const bomVal = Form.useWatch("bom", form);
  const dateVal = Form.useWatch("date", form);
  console.log("prod", prod);
  const bomOptions = [
    { text: "Date Wise", value: "date" },
    { text: "BOM Wise", value: "bom" },
    { text: "SKU Wise", value: "sku" },
  ];
  const columns = [
    { field: "id", headerName: "Sr. No.", width: 8 },
    {
      field: "component",
      headerName: "Part Code",
      width: 150,
    },
    {
      field: "new_part_no",
      headerName: "New Part Code",
      width: 150,
    },
    {
      field: "name",
      headerName: "Part Name",
      width: 250,
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} copy={true} />,
    },
    {
      field: "opening",
      headerName: "Opening Stock (A)",
      width: 150,
    },

    {
      field: "inward",
      headerName: "Net Purchase (B)",
      width: 150,
    },
    {
      field: "consumptionQty",
      headerName: "Net Consumption (C)",
      width: 180,
    },
    {
      field: "totalRejections",
      headerName: "Net Rejection (D)",
      width: 150,
    },
    {
      field: "rmCons",
      headerName: "Raw Material Sale & Other Cons. (E)",
      width: 260,
    },
    {
      field: "jwCons",
      headerName: "Job Worker Consumption (F)",
      width: 210,
    },
    {
      field: "jwStock",
      headerName: "Job Worker stock (G)",
      width: 160,
    },
    {
      field: "closingStock",
      headerName: "Closing Stock (H)=(A+B)-(C+D+E+F+G)",
      width: 240,
    },
    {
      field: "currentStock",
      headerName: "Total Current Stock (I)",
      width: 180,
    },
  ];
  const { executeFun, loading1 } = useApi();
  const getDataBySearch = async (searchInput) => {
    setLoading(true);
    if (searchInput?.length > 2) {
      const response = await executeFun(() =>
        getProductsOptions(searchInput, true)
      );
      setLoading(false);
      setAsyncOptions(response.data);
    }
    setLoading(false);
  };
  const getBom = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: prod.value,
    });
    console.log(data.data);
    const arr = data.data.map((d) => {
      return { value: d.bomid, text: d.bomname };
    });
    setBomName(arr);
    setLoading(false);
  };
  const fetchSearch = async () => {
    setLoading(true);
    const values = await form.validateFields();
    console.log("val", values);
    const response = await imsAxios.post("/report35/get", {
      sku: values.product.value,
      bom: values.bom,
      date: values.date,
    });
    console.log("response", response);
    let { data } = response;
    if (response.success) {
      let arr = data.map((r, index) => {
        return { ...r, id: index + 1 };
      });
      console.log("arr", arr);
      setRows(arr);
      setLoading(false);
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (prod) {
      getBom();
    }
  }, [prod]);
  useEffect(() => {
    if (prod) {
      form.setFieldValue("bom", "");
      // form.setFieldValue("date", "");
      setRows([]);
    }
  }, [prod]);
  console.log("bomVal", bomVal);
  console.log("dateVal", dateVal);
  return (
    <div>
      {" "}
      <Row justify="center" style={{ height: "100%" }}>
        <Col span={23} style={{ height: "100%" }}>
          <Form
            layout="vertical "
            form={form}
            style={{ marginTop: 8, marginLeft: -15 }}
          >
            <Row gutter={[10, 0]}>
              <Col span={5}>
                <Form.Item
                  name="product"
                  rules={[
                    {
                      required: true,
                      message: "Please enter product!",
                    },
                  ]}
                  label="Product"
                >
                  <MyAsyncSelect
                    style={{ width: "300px" }}
                    onBlur={() => setAsyncOptions([])}
                    optionsState={asyncOptions}
                    placeholder="Select Product"
                    loadOptions={getDataBySearch}
                    labelInValue={true}
                    loading={loading}
                    // onInputChange={(e) => setSearch(e)}
                    // value={allData.selectProduct.value}
                    // onChange={(e) =>
                    //   setAllData((allData) => {
                    //     return { ...allData, selectProduct: e };
                    //   })
                    // }
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="bom"
                  rules={[
                    {
                      required: true,
                      message: "Please select BOM!",
                    },
                  ]}
                  label="BOM"
                >
                  <MySelect
                    placeholder="Select Bom"
                    options={bomName}
                    loading={loading == "fetch"}
                    // value={allData.selectBom.value}
                    // onChange={(e) =>
                    //   setAllData((allData) => {
                    //     return { ...allData, selectBom: e };
                    //   })
                    // }
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  name="date"
                  // rules={[{ required: true }]}
                  label="Date"
                  rules={rules.date}
                >
                  {" "}
                  <MyDatePicker
                    setDateRange={(value) => form.setFieldValue("date", value)}
                    size="default"
                    disabledtheDate="true"
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <MyButton
                  variant="search"
                  style={{ margin: "18px" }}
                  onClick={fetchSearch}
                  disabled={bomVal?.length == 0}
                  // loading={loading}
                ></MyButton>
              </Col>
            </Row>
          </Form>{" "}
        </Col>
      </Row>{" "}
      <Row>
        <Col span={24}>
          <div
            className="hide-select"
            style={{ height: "75vh", margin: " 0px 10px 5px" }}
          >
            <MyDataTable
              checkboxSelection={true}
              loading={loading}
              data={rows}
              columns={columns}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default R35;
const columns = [
  { field: "serial_no", headerName: "S. No", width: 40 },
  { field: "partno", headerName: "Part No", width: 80 },
  { field: "new_partno", headerName: "Cat Part Code", width: 150 },
  { field: "bomalt_name", headerName: "Bom ALt Name", width: 100 },
  { field: "bomalt_part", headerName: "Alt Of", width: 80 },
  { field: "bomqty", headerName: "Bom Qty", width: 80 },
  { field: "category", headerName: "Category", width: 80 },
  { field: "components", headerName: "Components", flex: 1 },
  { field: "uom", headerName: "UoM", width: 80 },
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
const rules = {
  ppr: [{ required: true, message: "Please select PPR Number" }],
  process: [{ required: true, message: "Please select Process" }],
  status: [{ required: true, message: "Please select Status" }],
  date: [{ required: true, message: "Please select Date" }],
};
