import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import CurrenceModal from "../ManagePO/CurrenceModal";
import NavFooter from "../../../Components/NavFooter";
import {
  CGSTCell,
  componentSelect,
  disabledCell,
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
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import Loading from "../../../Components/Loading";
import FormTable from "../../../Components/FormTable";
import { Button, Card, Col, Modal, Row, Typography } from "antd";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import { toast } from "react-toastify";
export default function AddComponents({
  rowCount,
  setRowCount,
  setTotalValues,
  submitHandler,
  setActiveTab,
  totalValues,
  submitLoading,
  newPurchaseOrder,
  stateCode,
}) {
  const [currencies, setCurrencies] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showCurrencyUpdateConfirmModal, setShowCurrencyUpdateConfirmModal] =
    useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const addRows = () => {
    const newRow = {
      id: v4(),
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
      cgst: "",
      sgst: "",
      igst: "",
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
  const inputHandler = async (name, value, id) => {
    let arr = rowCount;

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
            currencySymbol: currencies.filter(
              (row) => row.value == value.currency
            ),
          };
        } else if (name == "currency") {
          if (value == "364907247") {
            setShowCurrencyUpdateConfirmModal({ value: value, id: id });
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
        }
        return obj;
      } else {
        return row;
      }
    });

    if (name == "component") {
      setPageLoading(true);
      const { data } = await imsAxios.post(
        "/purchaseOrder/getComponentDetailsByCode",
        {
          component_code: value.value,
          vencode: newPurchaseOrder.vendorname.value,
          project: newPurchaseOrder.project_name,
        }
      );
      if (data.code == 400 || data.code == 500) {
        toast.error(data.message.vencode[0] || data.message.msg);
        setPageLoading(false);
        return;
      }

      setPageLoading(false);
      let arr1 = rowCount;
      arr1 = arr1.map((row) => {
        if (row.id == id) {
          let obj = row;
          if (row.gsttype == "L") {
            let percentage = data.data.gstrate / 2;
            obj = {
              ...obj,
              component: value,
              rate: Number(data.data.rate.toString().trim()),
              unit: data.data.unit,
              inrValue:
                Number(data.data.rate.toString().trim()) *
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
            tol_price: Number((data.data.project_rate * 1) / 100).toFixed(2),
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
  const getComponents = async (searchInput) => {
    if (searchInput.length > 2) {
      const response = await executeFun(
        () => getComponentOptions(searchInput),
        "select"
      );
      const { data } = response;
      let arr = [];
      if (!data.msg) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  const resetFunction = () => {
    setRowCount([
      {
        id: v4(),
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
  }, [rowCount]);
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
      headerName: (
        <div className="flex ">
          <CommonIcons action="addRow" onClick={addRows} />
        </div>
      ),
      width: 40,
      field: "add",
      sortable: false,
      render: ({ row }) =>
        row.index >= 2 && (
          <CommonIcons action="removeRow" onClick={() => removeRows(row?.id)} />
        ),
      // sortable: false,
    },
    {
      headerName: "Component",
      width: 250,
      field: "component",
      sortable: false,
      render: (params) =>
        componentSelect(
          params,
          inputHandler,
          getComponents,
          setAsyncOptions,
          asyncOptions,
          loading1("select"),
          stateCode
        ),
    },

    {
      headerName: "Ord. Qty",
      field: "qty",
      sortable: false,
      render: (params) => quantityCell(params, inputHandler),
      width: 130,
    },
    {
      headerName: "Rate",
      width: 170,
      field: "rate",
      sortable: false,
      render: (params) => rateCell(params, inputHandler, currencies),
    },
    {
      headerName: "Rate Cap",
      width: 100,
      field: "rate_cap",
      sortable: false,
      render: (params) =>
        disabledCell(params, params.row.rate_cap, inputHandler),
    },
    {
      headerName: "Tol Price",
      width: 120,
      field: "tol_price",
      sortable: false,
      render: (params) =>
        disabledCell(
          params,
          params.row.tol_price,
          inputHandler,
          params.row.diffPercentage + "%" || "--"
        ),
    },
    {
      headerName: "Proj. Req. Qty",
      width: 120,
      field: "project_req_qty",
      sortable: false,
      render: (params) =>
        disabledCell(params, params.row.project_req_qty, inputHandler),
    },
    {
      headerName: "PO Exec. Qty",
      width: 100,
      field: "po_exec_qty",
      sortable: false,
      render: (params) =>
        disabledCell(params, params.row.po_exec_qty, inputHandler),
    },
    {
      headerName: "Local Value",
      width: 150,
      field: "inrValue",
      sortable: false,
      render: (params) => taxableCell(params), //ask
    },
    {
      headerName: "Foreign Value",
      width: 150,
      field: "usdValue",
      sortable: false,
      render: (params) => foreignCell(params),
    },
    {
      headerName: "Due Date",
      width: 150,
      field: "duedate",
      sortable: false,
      render: (params) => invoiceDateCell(params, inputHandler), //ask
    },
    {
      headerName: "HSN Code",
      width: 150,
      field: "hsncode",
      sortable: false,
      render: (params) => HSNCell(params, inputHandler),
    },
    {
      headerName: "GST Type",
      width: 150,
      field: "gsttype",
      sortable: false,
      render: (params) => gstTypeCell(params, inputHandler),
    },
    {
      headerName: "GST Rate",
      width: 100,
      field: "gstrate",
      sortable: false,
      render: (params) => gstRate(params, inputHandler),
    },
    {
      headerName: "CGST",
      width: 150,
      field: "cgst",
      sortable: false,
      render: (params) => CGSTCell(params, inputHandler),
    },
    {
      headerName: "SGST",
      width: 150,
      field: "sgst",
      sortable: false,
      render: (params) => SGSTCell(params, inputHandler),
    },
    {
      headerName: "IGST",
      width: 150,
      field: "igst",
      sortable: false,
      render: (params) => IGSTCell(params, inputHandler),
    },

    {
      headerName: "Item Description",
      width: 250,
      render: (params) => itemDescriptionCell(params, inputHandler),
    },
  ];
  useEffect(() => {
    getCurrencies();
  }, []);
  useEffect(() => {
    if (selectLoading) {
      setTimeout(() => {
        setSelectLoading(false);
      }, 600000);
    }
  }, [selectLoading]);
  return (
    <div
      style={{
        height: "calc(100vh - 190px)",
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
          Are you sure to reset details of all components of this Purchase
          Order?
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
          showCurrency={showCurrencyModal}
          setShowCurrencyModal={setShowCurrencyModal}
        />
      )}

      <div
        className=" h-[calc(100%_-_210px)] grid grid-cols-[1fr_3fr]"
        style={{ gap: 12 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CustomFieldBox title="Vendor Detail">
            <Typography.Title
              style={{
                fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
              }}
              level={5}
            >
              Vendor Name
            </Typography.Title>
            <Typography.Text
              style={{
                fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
              }}
            >
              <ToolTipEllipses text={newPurchaseOrder?.vendorname?.label} />
            </Typography.Text>
            <Typography.Title
              style={{
                fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
              }}
              level={5}
            >
              Vendor Address
            </Typography.Title>
            <Typography.Text
              style={{
                fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
              }}
            >
              <ToolTipEllipses
                type="Paragraph"
                text={newPurchaseOrder?.vendoraddress?.replaceAll("<br>", " ")}
              />
            </Typography.Text>{" "}
            <Typography.Title
              style={{
                fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
              }}
              level={5}
            >
              Vendor GSTIN
            </Typography.Title>
            <Typography.Text
              style={{
                fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
              }}
            >
              {newPurchaseOrder?.gstin}
            </Typography.Text>
          </CustomFieldBox>
          <CustomFieldBox title="Tax Detail">
            <Row gutter={[0, 4]}>
              {totalValues?.map((row) => (
                <Col span={24} key={row.label}>
                  <Row>
                    <Col
                      span={18}
                      style={{
                        fontSize: "0.8rem",
                        fontWeight:
                          totalValues?.indexOf(row) == totalValues.length - 1 &&
                          600,
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
          </CustomFieldBox>
        </div>
        <div
          style={{
            height: "calc(100vh - 200px)",
            padding: 0,
            overflow: "auto",
          }}
          className="h-[calc(100vh - 200px)] overflow-auto"
        >
          <FormTable columns={columns} data={rowCount} />
        </div>
      </div>

      <NavFooter
        resetFunction={() => setConfirmReset(true)}
        nextLabel="Submit"
        hideHeaderMenu
        loading={submitLoading}
        backFunction={() => setActiveTab("1")}
        submitFunction={() => {
          submitHandler(rowCount);
        }}
      />
    </div>
  );
}
