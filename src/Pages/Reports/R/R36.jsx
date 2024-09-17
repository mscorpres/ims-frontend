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
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import { downloadCSV } from "../../../Components/exportToCSV.jsx";
function R36() {
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
  const downloadHandler = () => {
    downloadCSV(rows, columns, `R36 Report`);
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
  const columns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // Upload DOC Icon
        <GridActionsCellItem
          showInMenu
          onClick={() => handleDownloadAttachement(row.TRANSACTION)}
          disabled={row.invoiceStatus == false}
          label="Download Attachement"
          // disabled={row.approval_status == "C"}
        />,
      ],
    },
    { headerName: "Sr. No", field: "index", width: 80 },
    {
      headerName: "Date",
      field: "DATE",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row.DATE} />,
    },
    { headerName: "Transaction Type", field: "TYPE", width: 120 },
    { headerName: "Part No.", field: "PART", width: 100 },
    { headerName: "Cat Part Code", field: "PART_NEW", width: 100 },
    {
      headerName: "Component",
      field: "COMPONENT",
      minWidth: 200,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.COMPONENT} />,
    },
    { headerName: "In Location", field: "LOCATION", width: 120 },
    { headerName: "Rate", field: "RATE", width: 100 },
    { headerName: "Currency", field: "CURRENCY", width: 100 },
    { headerName: "In Qty", field: "INQTY", width: 120 },
    {
      headerName: "Vendor",
      field: "VENDOR",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.VENDOR} />,
    },
    {
      headerName: "Doc Id",
      field: "INVOICENUMBER",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.INVOICENUMBER} />,
    },
    { headerName: "Transaction Id", field: "TRANSACTION", width: 150 },
    { headerName: "Cost Center", field: "COSTCENTER", width: 150 },
    { headerName: "By", field: "ISSUEBY", width: 120 },
  ];
  return (
    <div>
      {" "}
      <Row justify="center" style={{ height: "100%" }}>
        <Col span={23} style={{ height: "100%" }}>
          <Form
            layout="vertical "
            form={form}
            style={{ marginTop: 8, marginLeft: -35 }}
          >
            <Row gutter={[10, 0]}>
              <Col span={5}>
                <Form.Item
                  name="date"
                  // rules={[{ required: true }]}
                  //   label="Date"
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
                  //   style={{ margin: "18px" }}
                  onClick={fetchSearch}
                  disabled={bomVal?.length == 0}
                  // loading={loading}
                ></MyButton>{" "}
                <CommonIcons
                  action="downloadButton"
                  onClick={downloadHandler}
                  disabled={rows.length === 0}
                />
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

export default R36;

const rules = {
  ppr: [{ required: true, message: "Please select PPR Number" }],
  process: [{ required: true, message: "Please select Process" }],
  status: [{ required: true, message: "Please select Status" }],
  date: [{ required: true, message: "Please select Date" }],
};
