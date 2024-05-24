import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import NavFooter from "../../../../Components/NavFooter";
import {
  CGSTCell,
  componentSelect,
  foreignCell,
  gstRate,
  gstTypeCell,
  HSNCell,
  IGSTCell,
  invoiceDateCell,
  itemDescriptionCell,
  quantityCell,
  rateCell,
  SGSTCell,
  taxableCell,
} from "./tableColumns";
//
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import Loading from "../../../../Components/Loading";
import FormTable from "../../../../Components/FormTable";
import {
  Button,
  Card,
  Col,
  Collapse,
  Modal,
  Radio,
  Row,
  Switch,
  Typography,
} from "antd";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import CurrenceModal from "./CurrenceModal";
import useApi from "../../../../hooks/useApi.ts";
import {
  getComponentOptions,
  getProductsOptions,
} from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import MySelect from "../../../../Components/MySelect.jsx";
import MyButton from "../../../../Components/MyButton/index.jsx";
import UploadFile from "../../../Master/Bom/CreateBom/UploadFile.jsx";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV.jsx";
const POoption = [
  { text: "Product", value: "product" },
  { text: "Component", value: "component" },
];

export default function AddComponents({
  rowCount,
  setRowCount,
  setTotalValues,
  submitHandler,
  setActiveTab,
  totalValues,
  newPurchaseOrder,
  form,
  iscomponents,
  selectLoading,
  confirmSubmit,
  submitLoading,
  setConfirmSubmit,
  fileupload,
  setFileUpload,
  callFileUpload,
  setUploadFile,
  uploadfile,
}) {
  const [currencies, setCurrencies] = useState([]);
  // const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showCurrencyUpdateConfirmModal, setShowCurrencyUpdateConfirmModal] =
    useState(false);
  const newdata = form.getFieldsValue();
  console.log("rowCount", rowCount);
  const sampleData = [
    {
      TYPE: "P",
      ITEM_CODE: "15705",
      ITEM_DESC: "item 1",
      QTY: "100",
      RATE: "10",
      GST_TYPE: "I",
      GST_RATE: "18",
      DUE_DATE: "20-05-2024",
    },
  ];
  const { executeFun, loading } = useApi();
  const addRows = () => {
    const newRow = {
      id: v4(),
      type: "product",
      index: rowCount.length + 1,
      currency: "364907247",
      exchange_rate: 1,
      component: "",
      qty: 1,
      rate: "",
      duedate: "",
      hsncode: "",
      gsttype: "L",
      gstrate: "",
      cgst: "0",
      sgst: "0",
      igst: "0",
      remark: "--",
      inrValue: 0,
      foreginValue: 0,
      unit: "",
      rate_cap: 0,
      tol_price: 0,
      project_req_qty: 0,
      po_exec_qty: 0,
      diffPercentage: "--",
    };
    setRowCount((rowCount) => [...rowCount, newRow]);
  };
  const removeRows = (id) => {
    const arr = rowCount.filter((c) => c.id != id);
    setRowCount(arr);
  };
  const changeCurrencyToINR = () => {
    let arr = rowCount.map((row) => {
      let obj = row;
      if (row.id == showCurrencyUpdateConfirmModal.id) {
        obj = {
          ...obj,
          currency: showCurrencyUpdateConfirmModal.value,
          usdValue: 0,
          exchange_rate: 1,
          currencySymbol: currencies.filter(
            (row) => row.value == showCurrencyUpdateConfirmModal.value
          ),
        };
        return obj;
      } else {
        return obj;
      }
    });
    setShowCurrencyUpdateConfirmModal(false);
    setRowCount(arr);
  };
  console.log("these are the rows", rowCount);
  const inputHandler = async (name, value, id) => {
    let arr = rowCount;
    console.log("update rate and value", value);
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        if (name == "rate") {
          if (row.gsttype == "L") {
            let percentage = obj.gstrate / 2;
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * obj.qty,
              foreginValue: value * obj.qty * obj.exchange_rate,
              cgst: (value * obj.qty * percentage) / 100,
              sgst: (value * obj.qty * percentage) / 100,
              igst: 0,
            };
          } else if (row.gsttype == "I") {
            let percentage = obj.gstrate;
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * obj.qty,
              foreginValue: value * obj.qty * obj.exchange_rate,
              cgst: 0,
              sgst: 0,
              igst: (value * obj.qty * percentage) / 100,
            };
          }
          let rate = value;
          let app = false;
          if (rate > +Number(obj.rate_cap).toFixed(2)) {
            app = true;
          } else {
            let diff =
              +Number(obj.rate_cap).toFixed(2) - +Number(rate).toFixed(2);
            if (diff > obj.tol_price) {
              app = true;
            } else {
              app = false;
            }
          }

          // perc = perc.toFixed(2);
          obj = {
            ...obj,
            approval: app,
          };
        } else if (name == "hsncode" || name == "duedate") {
          obj = {
            ...obj,
            [name]: value,
          };
        } else if (name == "qty") {
          if (row.gsttype == "L") {
            let percentage = obj.gstrate / 2;
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * obj.rate,
              foreginValue: value * obj.rate * obj.exchange_rate,
              cgst: (value * obj.rate * percentage) / 100,
              sgst: (value * obj.rate * percentage) / 100,
              igst: 0,
            };
          } else if (row.gsttype == "I") {
            let percentage = obj.gstrate;
            obj = {
              ...obj,
              [name]: value,
              foreginValue: value * obj.rate * obj.exchange_rate,
              inrValue: value * obj.rate,
              cgst: 0,
              sgst: 0,
              igst: (value * obj.rate * percentage) / 100,
            };
          }
          let diff = +Number(obj.project_req_qty) - +Number(obj.po_exec_qty);

          obj = {
            ...obj,
            qtyApproval: diff > +Number(value).toFixed(2) ? false : true,
          };
        } else if (name == "gsttype") {
          if (value == "L") {
            let percentage = obj.gstrate / 2;
            obj = {
              ...obj,
              [name]: value,
              cgst: (obj.inrValue * percentage) / 100,
              sgst: (obj.inrValue * percentage) / 100,
              igst: 0,
            };
          } else if (value == "I") {
            let percentage = obj.gstrate;
            obj = {
              ...obj,
              [name]: value,
              cgst: 0,
              sgst: 0,
              igst: (obj.inrValue * percentage) / 100,
            };
          }
        } else if (name == "exchange_rate") {
          obj = {
            ...obj,
            exchange_rate: value.rate,
            currency: value.currency,
            foreginValue: row.inrValue * value.rate,
            inrValue: row.qty * row.rate * value.rate,
            currencySymbol: currencies.filter(
              (row) => row.value == value.currency
            ),
          };
          // let rate = +Number(obj.rate).toString();
          // let diff = obj.rate_cap * value.rate - rate * value.rate;
          // let diff1 = obj.rate_cap - rate;
          // let perc = (diff1 * 100) / obj.rate_cap;
          // perc = perc.toFixed(2);
          // obj = {
          //   ...obj,
          //   diffPercentage: perc,
          //   tol_price: diff,
          // };
        } else if (name == "currency") {
          if (value == "364907247") {
            setShowCurrencyUpdateConfirmModal({ value: value, id: id });
            obj = {
              ...obj,
              exchange_rate: 1,
              [name]: value,
              foreginValue: 0,
              inrValue: row.qty * row.rate,
              currencySymbol: currencies.filter(
                (row) => row.value == value.currency
              ),
            };
          } else {
            setShowCurrencyModal({
              currency: value,
              price: row.inrValue,
              exchange_rate: row.exchange_rate,
              symbol: currencies.filter((cur) => cur.value == value)[0].text,
              rowId: row.id,
              inputHandler: inputHandler,
            });
          }

          // return obj;
        } else if (name == "gstrate") {
          if (row.gsttype == "L" && name != "gsttype") {
            let percentage = value / 2;
            obj = {
              ...obj,
              [name]: value,
              exchange_rate: value == "364907247" ? 1 : obj.exchange_rate,

              cgst: (obj.inrValue * percentage) / 100,
              sgst: (obj.inrValue * percentage) / 100,
              igst: 0,
            };
          } else if (row.gsttype == "I" && name != "gsttype") {
            let percentage = value;
            obj = {
              ...obj,
              [name]: value,
              exchange_rate: value == "364907247" ? 1 : obj.exchange_rate,

              cgst: 0,
              sgst: 0,
              igst: (obj.inrValue * percentage) / 100,
            };
          }
        }
        if (row.gsttype.value == "L" && name != "gsttype") {
          let percentage = obj.gstrate / 2;
          obj = {
            ...obj,
            cgst: (obj.inrValue * percentage) / 100,
            sgst: (obj.inrValue * percentage) / 100,
            igst: 0,
          };
        } else if (row.gsttype.value == "I" && name != "gsttype") {
          let percentage = obj.gstrate;
          obj = {
            ...obj,
            cgst: 0,
            sgst: 0,
            igst: (obj.inrValue * percentage) / 100,
          };
        } else if (name == "remark") {
          obj = {
            ...obj,
            [name]: value,
          };
          // return obj;
        } else if (name === "type") {
          obj = {
            ...obj,
            type: value,

            cgst: 0,
            component: "",
            rate: 0,
            unit: "",
            inrValue: 0,
            hsncode: "",
            gstrate: 0,
            sgst: 0,
            igst: 0,
          };
        }
        return obj;
      } else {
        return row;
      }
    });
    // "/purchaseOrder/getComponentDetailsByCode",
    // /purchaseOrdertest/getComponentDetailsByCode
    // console.log(arr);
    if (name == "component") {
      // console.log("newPurchaseOrder", newPurchaseOrder);
      // setPageLoading(true);
      // const { data } = await imsAxios.post(
      //   "/purchaseOrder/getComponentDetailsByCode",
      //   {
      //     component_code: value.value,
      //     vencode: newdata.client.value,
      //     project: newdata.project_name.value ?? newdata.project_name,
      //   }
      // );
      // console.log("iscomponents", iscomponents);
      var data;
      const found = arr.find((row) => row.id === id);
      console.log("we found", found);
      if (found?.type == "component") {
        console.log("newPurchaseOrder", newPurchaseOrder);
        setPageLoading(true);
        let response = await imsAxios.post(
          "/purchaseOrder/getComponentDetailsByCode",
          {
            component_code: value.value,
            vencode: newdata.client?.value,
            project: newdata.project_name.value ?? newdata.project_name,
          }
        );
        data = response.data;
      } else {
        setPageLoading(true);
        let response = await imsAxios.post("/products/fetchProductData", {
          product_key: value.value,
          // vencode: newdata.client.value,
          // project: newdata.project_name.value ?? newdata.project_name,
        });
        data = response.data;
      }
      setPageLoading(false);
      let arr1 = rowCount;
      arr1 = arr1.map((row) => {
        if (row.id == id) {
          let obj = row;
          if (row.gsttype == "L") {
            let percentage = data?.data?.gstrate / 2;
            obj = {
              ...obj,
              component: value,
              rate: Number(data.data.rate?.toString().trim()),
              unit: data.data.unit,
              inrValue:
                Number(data.data.rate?.toString().trim()) *
                Number(obj?.qty) *
                Number(obj?.exchange_rate),
              hsncode: data.data.hsn,
              gstrate: data.data.gstrate,
              cgst: (obj?.inrValue * percentage) / 100,
              sgst: (obj?.inrValue * percentage) / 100,
              igst: 0,
            };
          } else if (row.gsttype == "I") {
            let percentage = data.data.gstrate;
            obj = {
              ...row,
              cgst: 0,
              component: value,
              rate: data.data.rate,
              unit: data.data.unit,
              inrValue: data.data.rate * row.qty * parseInt(row?.exchange_rate),
              hsncode: data.data.hsn,
              gstrate: data.data.gstrate,
              sgst: 0,
              igst: (row?.inrValue * percentage) / 100,
            };
          } else {
            obj = {
              ...row,
              component: value,
              rate: data.data.rate,
              unit: data.data.unit,
              gstrate: data.data.gstrate,
              hsncode: data.data.hsn,
              inrValue: data.data.rate * row.qty * parseInt(row?.exchange_rate),
            };
          }
          obj = {
            ...obj,
            rate_cap: data.data.project_rate,
            project_req_qty: data.data.project_qty,
            po_exec_qty: data.data.po_ord_qty,
            po_exec_qty: data.data.po_ord_qty,
            tol_price: Number((data.data.project_rate * 1) / 100).toFixed(2),
            componentKey: data.data.key,
          };
          return obj;
        } else {
          return row;
        }
      });

      setRowCount(arr1);
    }
    if (name != "component") {
      setRowCount(arr);
    }
  };
  const getComponents = async (searchInput, type) => {
    console.log("this is the type", type);
    if (type === "product") {
      const response = await executeFun(
        () => getProductsOptions(searchInput),
        "select"
      );
      setAsyncOptions(response.data);
    } else {
      const response = await executeFun(
        () => getComponentOptions(searchInput),
        "select"
      );

      if (response.success) {
        let arr = convertSelectOptions(response.data);
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
    // if (searchInput.length > 2) {
    //   // setSelectLoading(true);
    //   const { data } = await imsAxios.post("/backend/fetchProduct", {
    //     searchTerm: searchInput,
    //   });
    //   // setSelectLoading(false);
    //   let arr = [];
    //   if (!data.msg) {
    //     arr = data.map((d) => {
    //       return { text: d.text, value: d.id };
    //     });
    //     setAsyncOptions(arr);
    //   } else {
    //     setAsyncOptions([]);
    //   }
    // }
  };
  const resetFunction = () => {
    setRowCount([
      {
        id: v4(),
        type: "product",
        index: 1,
        currency: "364907247",
        exchange: "1",
        component: "",
        qty: 1,
        rate: "",
        duedate: "",
        inrValue: 0,
        hsncode: "",
        gsttype: "L",
        gstrate: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        remark: "--",
        unit: "--",
      },
    ]);
    setConfirmReset(false);
  };
  useEffect(() => {
    let obj = [
      {
        label: "Sub-Total value before Taxes",
        sign: "",
        values: rowCount?.map((row) => Number(row.inrValue)),
      },
      {
        label: "CGST",
        sign: "+",
        values: rowCount?.map((row) => Number(row.cgst)),
      },
      {
        label: "SGST",
        sign: "+",
        values: rowCount?.map((row) => Number(row.sgst)),
      },
      {
        label: "IGST",
        sign: "+",
        values: rowCount?.map((row) => Number(row.igst)),
      },
      {
        label: "Sub-Total values after Taxes",
        sign: "",
        values: rowCount?.map(
          (row) =>
            Number(row.inrValue) +
            Number(row.sgst) +
            Number(row.cgst) +
            Number(row.igst)
        ),
      },
    ];
    setTotalValues(obj);
  }, [rowCount, rowCount.qty]);
  //file upload status
  const toggleInputType = (e) => {
    setFileUpload(e.target.value);
  };
  useEffect(() => {
    if (fileupload == "file" && rowCount.length > 0 && uploadfile) {
      rowCount.map((r) => {
        console.log("hereeeee is ", r.gstrate);
        // inputHandler("gsttype,", r.gsttype, r.id);
      });
    }
  }, [uploadfile]);

  //getting currencies on page load
  const getCurrencies = async () => {
    const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
    let arr = [];
    arr = data.data.map((d) => {
      return {
        text: d.currency_symbol,
        value: d.currency_id,
        notes: d.currency_notes,
      };
    });
    setCurrencies(arr);
  };
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      width: 40,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        rowCount.length > 1 && (
          <CommonIcons
            action="removeRow"
            value={row.type}
            onClick={() => removeRows(row.id)}
          />
        ),
      // sortable: false,
    },
    {
      headerName: "Type",
      width: 100,
      field: "type",
      renderCell: (params) => (
        <MySelect
          options={POoption}
          value={params?.row.type}
          onChange={(value) => inputHandler("type", value, params?.row.id)}
        />
      ),

      // componentSelect(
      //   params,
      //   inputHandler,
      //   getComponents,
      //   setAsyncOptions,
      //   asyncOptions,
      //   loading("select")
      // ),
    },
    {
      headerName: "Product",
      width: 250,
      field: "component",
      sortable: false,
      renderCell: (params) =>
        componentSelect(
          params,
          inputHandler,
          getComponents,
          setAsyncOptions,
          asyncOptions,
          loading("select")
        ),
    },
    {
      headerName: "Item Description",

      width: 250,
      renderCell: (params) => itemDescriptionCell(params, inputHandler),
    },
    {
      headerName: "Ord. Qty",
      field: "qty",
      sortable: false,
      renderCell: (params) => quantityCell(params, inputHandler),
      width: 130,
    },
    {
      headerName: "Rate",
      width: 170,
      field: "rate",
      sortable: false,
      renderCell: (params) => rateCell(params, inputHandler, currencies),
    },
    {
      headerName: "GST Rate",
      headerName: "GST RATE",
      width: 100,
      field: "gstrate",
      sortable: false,
      renderCell: (params) => gstRate(params, inputHandler),
    },
    {
      headerName: "GST Type",
      width: 150,
      field: "gsttype",
      sortable: false,
      renderCell: (params) => gstTypeCell(params, inputHandler),
    },

    {
      headerName: "Local Value",
      width: 150,
      field: "inrValue",
      sortable: false,
      renderCell: (params) => taxableCell(params), //ask
    },
    {
      headerName: "Foreign Value",
      width: 150,
      field: "usdValue",
      sortable: false,
      renderCell: (params) => foreignCell(params),
    },

    {
      headerName: "CGST",
      width: 150,
      field: "cgst",
      sortable: false,
      renderCell: (params) => CGSTCell(params, inputHandler),
    },
    {
      headerName: "SGST",
      width: 150,
      field: "sgst",
      sortable: false,
      renderCell: (params) => SGSTCell(params, inputHandler),
    },
    {
      headerName: "IGST",
      width: 150,
      field: "igst",
      sortable: false,
      renderCell: (params) => IGSTCell(params, inputHandler),
    },
    {
      headerName: "Due Date",
      width: 150,
      field: "duedate",
      sortable: false,
      renderCell: (params) => invoiceDateCell(params, inputHandler), //ask
    },
    {
      headerName: "HSN Code",
      width: 150,
      field: "hsncode",
      sortable: false,
      renderCell: (params) => HSNCell(params, inputHandler),
    },
  ];

  useEffect(() => {
    getCurrencies();
  }, []);
  // useEffect(() => {
  //   if (selectLoading) {
  //     setTimeout(() => {
  //       setSelectLoading(false);
  //     }, 600000);
  //   }
  // }, [selectLoading]);
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        overflowX: "hidden",
      }}
    >
      {/* reset component rows */}
      <Modal
        title="Confirm Reset!"
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmReset(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure to reset details of all components of this Sales Order?
        </p>
      </Modal>
      <Modal
        title="Confirm Submit!"
        open={confirmSubmit}
        okText="Create"
        confirmLoading={submitLoading}
        onOk={() => submitHandler(rowCount)}
        onCancel={() => setConfirmSubmit(false)}
      >
        <p>
          Are you sure to Submit details of all components of this Sales Order?
        </p>
      </Modal>
      {/* currency changed to inr confirm modal */}
      <Modal
        title="Confirm Currency Change!"
        open={showCurrencyUpdateConfirmModal}
        onCancel={() => setShowCurrencyUpdateConfirmModal(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setShowCurrencyUpdateConfirmModal(false)}
          >
            No
          </Button>,
          <Button key="submit" type="primary" onClick={changeCurrencyToINR}>
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to change the currency to INR for this
          component. The exchange rate will change to 1.
        </p>
      </Modal>
      {pageLoading && <Loading />}
      {showCurrencyModal != null && (
        <CurrenceModal
          inputHandler={inputHandler}
          showCurrency={showCurrencyModal}
          setShowCurrencyModal={setShowCurrencyModal}
        />
      )}
      <Row style={{ height: "100%" }} gutter={8}>
        <Col style={{ height: "100%" }} span={6}>
          <Row gutter={[0, 4]} style={{ height: "100%" }} justify="center">
            {/* vendor card */}

            <Radio.Group
              onChange={toggleInputType}
              value={fileupload}
              options={uploadTypeOptions}
            />
            <Col span={24}>
              <Row>
                <Col span={24}>
                  {fileupload == "file" && (
                    <Row
                      justify="center"
                      style={{ marginTop: 4, marginBottom: 5 }}
                    >
                      <Col span={24}>
                        <Col span={24}>
                          <UploadFile />
                        </Col>
                      </Col>
                      <Button
                        type="link"
                        onClick={() =>
                          downloadCSVCustomColumns(
                            sampleData,
                            "Sales Order Sample"
                          )
                        }
                      >
                        Download Sample File
                      </Button>
                      <Button onClick={callFileUpload}>Upload</Button>
                    </Row>
                  )}
                </Col>
              </Row>
            </Col>
            {/* </Col> */}
            {/* </r> */}
            <Col span={24} style={{ height: "50%" }}>
              <Card
                style={{ height: "100%" }}
                // bodyStyle={{ height: "90%" }}
                title="Client Detail"
              >
                <Row gutter={[0, 8]}>
                  <Col span={24}>
                    <Typography.Title
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                      }}
                      level={5}
                    >
                      Name
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                      }}
                    >
                      <ToolTipEllipses text={newdata?.client?.label} />
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Title
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                      }}
                      level={5}
                    >
                      Address
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                      }}
                    >
                      <ToolTipEllipses
                        type="Paragraph"
                        text={newdata.clientaddress?.replaceAll("<br>", " ")}
                      />
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Title
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                      }}
                      level={5}
                    >
                      GSTIN
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                      }}
                    >
                      {newdata?.gstin}
                    </Typography.Text>
                  </Col>
                </Row>
              </Card>
            </Col>
            {/* tax detail card */}
            <Col span={24} style={{ height: "50%" }}>
              <Card
                style={{ height: "100%" }}
                // bodyStyle={{ height: "90%" }}
                title="Tax Detail"
              >
                <Row gutter={[0, 4]}>
                  {totalValues?.map((row) => (
                    <Col span={24} key={row.label}>
                      <Row>
                        <Col
                          span={18}
                          style={{
                            fontSize: "0.8rem",
                            fontWeight:
                              totalValues?.indexOf(row) ==
                                totalValues.length - 1 && 600,
                          }}
                        >
                          {row.label}
                        </Col>
                        <Col span={6} className="right">
                          {row.sign.toString() == "" ? (
                            ""
                          ) : (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight:
                                  totalValues?.indexOf(row) ==
                                    totalValues.length - 1 && 600,
                              }}
                            >
                              ({row.sign.toString()}){" "}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight:
                                totalValues?.indexOf(row) ==
                                  totalValues.length - 1 && 600,
                            }}
                          >
                            {Number(
                              row.values?.reduce((partialSum, a) => {
                                return partialSum + Number(a);
                              }, 0)
                            ).toFixed(2)}
                          </span>
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col
          span={18}
          style={{
            height: "100%",
            padding: 0,

            border: "1px solid #EEEEEE",
          }}
        >
          <FormTable columns={columns} data={rowCount} />
        </Col>
      </Row>
      <NavFooter
        resetFunction={() => setConfirmReset(true)}
        nextLabel="Submit"
        hideHeaderMenu
        loading={submitLoading}
        backFunction={() => setActiveTab("1")}
        submitFunction={() => setConfirmSubmit(true)}
      />
    </div>
  );
}
const uploadTypeOptions = [
  {
    label: "File",
    value: "file",
  },
  {
    label: "Manual",
    value: "table",
  },
];
