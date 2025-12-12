import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import CurrenceModal from "../CurrenceModal";
import { toast } from "react-toastify";
import NavFooter from "../../../../Components/NavFooter";
import {
  CGSTCell,
  componenetSelect,
  disabledCell,
  foreignCell,
  gstRate,
  gstTypeCell,
  HSNCell,
  IGSTCell,
  invoiceDateCell,
  itemDescriptionCell,
  internalRemarkCell,
  quantityCell,
  rateCell,
  SGSTCell,
  taxableCell,
} from "./TableColumns";
import Loading from "../../../../Components/Loading";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { Button, Card, Col, Modal, Popconfirm, Row, Typography } from "antd";
import {
  LoadingOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import FormTable from "../../../../Components/FormTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import { getComponentOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
export default function EditComponent({
  rowCount,
  setRowCount,
  setActiveTab,
  purchaseOrder,
  setUpdatePoId,
  resetRowsDetailsData,
  updatePoId,
  getRows,
}) {
  const [asynOptions, setAsyncOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(null);
  const [removePartLoading, setRemovePartLoading] = useState(false);
  const [totalTaxValue, setTotaTaxValue] = useState([]);
  const [showCurrencyUpdateConfirmModal, setShowCurrencyUpdateConfirmModal] =
    useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const addRows = () => {
    const newRow = {
      index: rowCount.length + 1,
      new: true,
      id: v4(),
      currency: "364907247",
      exchange_rate: 1,
      component: "",
      qty: 1,
      rate: 0,
      last_rate: 0,
      duedate: "",
      hsncode: "",
      gsttype: rowCount[0].gsttype,
      gstrate: "",
      cgst: 0,
      sgst: 0,
      igst: 0,
      remark: "--",
      internal_remark: "",
      inrValue: 0,
      foreginValue: 0,
      unit: "",
      updaterow: "",
    };
    setRowCount((rowCount) => [...rowCount, newRow]);
  };
  const removeRows = (id) => {
    const arr = rowCount?.filter((c) => c.id != id);
    setRowCount(arr);
  };
  const changeCurrencyToINR = () => {
    let arr = rowCount.map((row) => {
      let obj = row;
      if (row.id == showCurrencyUpdateConfirmModal.id) {
        obj = {
          ...obj,
          currency: showCurrencyUpdateConfirmModal.value,
          exchange_rate: 1,
          foreginValue: 0,
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
          let diff =
            +Number(value).toFixed(2) - +Number(obj.project_rate).toFixed(2);
          obj = {
            ...obj,
            project_rate: obj.project_rate,
            localPrice:
              +Number(obj.exchange_rate).toFixed(2) * +Number(value).toFixed(2),
            tol_price: +Number((row.project_rate * 1) / 100).toFixed(2),
            rateAppr:
              +Number(value).toFixed(2) > +Number(obj.project_rate)
                ? true
                : diff > +Number(obj.tol_price).toFixed(2)
                ? true
                : false,
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
          let diff = +Number(value) + +Number(obj.project_qty);
          obj = {
            ...obj,
            qtyApproval:
              diff > +Number(obj.po_ord_qty).toFixed(2) ? true : false,
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
            project_rate: row.project_rate,
            localPrice:
              +Number(value.rate).toFixed(2) * +Number(row.rate).toFixed(2),
            tol_price: +Number((row.project_rate * 1) / 100).toFixed(2),
          };
        } else if (name == "currency") {
          if (value != 364907247) {
            setShowCurrencyModal({
              currency: value,
              price: row.inrValue,
              exchange_rate: row.exchange_rate,
              symbol: currencies.filter((cur) => cur.value == value)[0].text,
              rowId: id,
              inputHandler: inputHandler,
            });
          } else if (value == "364907247") {
            setShowCurrencyUpdateConfirmModal({ value: value, id: id });
          }
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
        if (
          row.gsttype.value == "L" &&
          name != "gsttype" &&
          name != "remark" &&
          name != "internal_remark"
        ) {
          let percentage = obj.gstrate / 2;
          obj = {
            ...obj,
            cgst: (obj.inrValue * percentage) / 100,
            sgst: (obj.inrValue * percentage) / 100,
            igst: 0,
          };
        } else if (
          row.gsttype.value == "I" &&
          name != "gsttype" &&
          name != "remark" &&
          name != "internal_remark"
        ) {
          let percentage = obj.gstrate;
          obj = {
            ...obj,
            cgst: 0,
            sgst: 0,
            igst: (obj.inrValue * percentage) / 100,
          };
        } else if (name == "remark" || name === "internal_remark") {
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
      const { data } = await imsAxios.post(
        "/component/getComponentDetailsByCode",
        {
          component_code: value.value,
        }
      );
      let arr1 = rowCount;
      arr1 = arr1.map((row) => {
        if (row.id == id) {
          if (row.gsttype == "L") {
            let percentage = data.data.gstrate / 2;
            return {
              ...row,
              component: value,
              rate: data.data.rate,
              unit: data.data.unit,
              inrValue: data.data.rate * row?.qty * parseInt(row?.exchange),
              hsncode: data.data.hsn,
              gstrate: data.data.gstrate,
              cgst: (row?.inrValue * percentage) / 100,
              sgst: (row?.inrValue * percentage) / 100,
              igst: 0,
            };
          } else if (row.gsttype == "I") {
            let percentage = data.data.gstrate;
            return {
              ...row,
              cgst: 0,
              component: value,
              rate: data.data.rate,
              unit: data.data.unit,
              inrValue: data.data.rate * row.qty * parseInt(row?.exchange),
              hsncode: data.data.hsn,
              gstrate: data.data.gstrate,
              sgst: 0,
              igst: (row?.inrValue * percentage) / 100,
            };
          } else {
            return {
              ...row,
              component: value,
              rate: data.data.rate,
              unit: data.data.unit,
              gstrate: data.data.gstrate,
              hsncode: data.data.hsn,
              inrValue: data.data.rate * row.qty * parseInt(row?.exchange),
            };
          }
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
  const getComponents = async (s) => {
    // if (searchInput.length > 2) {
    // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: s,
    // });
    const response = await executeFun(() => getComponentOptions(s), "select");
    const { data } = response;
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setAsyncOptions(arr);
    // }
  };
  const resetRows = () => {
    setRowCount(resetRowsDetailsData);
    setConfirmReset(false);
  };
  const validateData = () => {
    let validation = true;

    // Basic required field check
    rowCount.forEach((row) => {
      if (
        !row.component ||
        !row.qty ||
        !row.rate ||
        !row.hsncode ||
        !row.gsttype
      ) {
        validation = false;
      }
    });

    if (!validation) {
      toast.error("Please fill all required component fields");
      return;
    }

    // Build components arrays
    const components = {
      component: [],
      qty: [],
      rate: [],
      currency: [],
      exchange_rate: [],
      date: [],
      hsn: [],
      gsttype: [],
      gstrate: [],
      sgst: [],
      igst: [],
      cgst: [],
      remark: [],
      internal_remark: [],
      updaterow: [],
      rate_cap: [],
      project_qty: [],
      exq_po_qty: [],
    };

    rowCount.forEach((row) => {
      components.component.push(row.component?.value);
      components.qty.push(row.qty);
      components.rate.push(row.rate);
      components.currency.push(row.currency);
      components.exchange_rate.push(row.exchange_rate);
      components.date.push(row.duedate || "");
      components.hsn.push(row.hsncode);
      components.gsttype.push(row.gsttype);
      components.gstrate.push(row.gstrate);
      components.sgst.push(row.sgst);
      components.igst.push(row.igst);
      components.cgst.push(row.cgst);
      components.remark.push(row.remark);
      components.internal_remark.push(row.internal_remark || "");
      components.updaterow.push(row.updateRow || row.updaterow || "");
      components.rate_cap.push(row.project_rate || 0);
      components.project_qty.push(row.project_qty || 0);
      components.exq_po_qty.push(row.po_ord_qty || 0);
    });

    if (
      [...new Set(components.currency)].length > 1 ||
      [...new Set(components.gsttype)].length > 1
    ) {
      toast.error("All items must have same Currency and GST Type");
      return;
    }

    let finalPO = {
      poid: updatePoId?.orderid,
      vendor_name:
        purchaseOrder?.vendorcode?.value || purchaseOrder?.vendorcode,
      vendor_type: purchaseOrder?.vendortype_value,
      vendor_branch:
        purchaseOrder?.vendorbranch?.value || purchaseOrder?.vendorbranch,
      vendor_address: purchaseOrder?.vendoraddress?.trim(),
      paymentterms: purchaseOrder?.paymentterms?.trim(),
      quotationterms: purchaseOrder?.termsofquotation?.trim(),
      termsandcondition: purchaseOrder?.termsofcondition?.trim(),
      costcenter: purchaseOrder?.costcenter?.value || purchaseOrder?.costcenter,
      projectname: purchaseOrder?.projectname?.trim(),
      pocomment: purchaseOrder?.pocomment?.trim(),
      bill_address_id: purchaseOrder.addrbillid,
      billaddress: purchaseOrder.billaddress,
      advancePayment: purchaseOrder.advancePayment || 0,
      termsday: purchaseOrder.paymenttermsday || 30,

      ship_type: purchaseOrder.ship_type,

      ...(purchaseOrder.ship_type === "saved" && {
        ship_address_id:
          purchaseOrder.addrshipid?.value || purchaseOrder.addrshipid,
      }),

      ...(purchaseOrder.ship_type === "vendor" && {
        ship_vendor: purchaseOrder.ship_vendor?.value,
        ship_vendor_branch: purchaseOrder.ship_vendor_branch?.value,
        ship_address_id:
          purchaseOrder.ship_vendor?.value || purchaseOrder.ship_vendor,
      }),

      // Manual mode → no IDs, only address
      ship_address:
        purchaseOrder.ship_type === "manual"
          ? purchaseOrder.shipaddress?.trim()
          : purchaseOrder.shipaddress?.trim() || "--",
      ship_other_pan: purchaseOrder.shippanno?.trim(),
      ship_other_gstin: purchaseOrder.shipgstid?.trim(),
      ship_partyname: purchaseOrder.ship_partyname?.trim(),
    };

    // Always spread components at the end
    Object.assign(finalPO, components);
    finalPO.materials = null;

    console.log("FINAL CLEAN PAYLOAD →", finalPO);
    setSubmitConfirm(finalPO);
  };
  const submitHandler = async () => {
    if (submitConfirm) {
      setSubmitLoading(true);
      const { data } = await imsAxios.post("/purchaseOrder/updateData4Update", {
        ...submitConfirm,
      });
      setSubmitLoading(false);
      if (data.code == 200) {
        toast.success(data.message);
        setUpdatePoId(null);
        if (getRows && typeof getRows === "function") {
          setTimeout(() => getRows(true), 500);
        }
      } else {
        toast.error(data.message);
      }
    }
  };
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
  const removePart = async (row) => {
    if (!row.new) {
      const obj = {
        partcode: row.component.value,
        updatecode: row.updateRow,
        pocode: updatePoId?.orderid,
      };
      console.log(obj);
      setRemovePartLoading(row.id);
      const response = await imsAxios.post("/purchaseOrder/removePart", obj);
      setRemovePartLoading(false);
      if (response.data.code === 200) {
        toast.success(response.data.message);
        removeRows(row.id);
      } else {
        toast.error(response.data.message.msg);
      }
    } else {
      removeRows(row.id);
    }
  };
  const columns = [
    {
      headerName: (
        <Button size="small" icon={<PlusOutlined />} onClick={addRows} />
      ),
      width: 50,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        removePartLoading.toString() === row.id ? (
          <LoadingOutlined />
        ) : (
          rowCount.length > 1 && (
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to delete this component"
              onConfirm={() => removePart(row)}
              // onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" icon={<MinusOutlined />} />
              {/* <CommonIcons action="removeRow" /> */}
            </Popconfirm>
          )
        ),
      sortable: false,
    },
    {
      headerName: "Component",
      width: 250,
      field: "component",
      sortable: false,
      renderCell: (params) =>
        componenetSelect(
          params,
          inputHandler,
          getComponents,
          setAsyncOptions,
          asynOptions
        ),
    },
    {
      headerName: "Item Description",
      width: 200,
      width: 250,
      sortable: false,
      renderCell: (params) => itemDescriptionCell(params, inputHandler),
    },
    {
      headerName: "Ord. Qty",
      width: 130,
      field: "qty",
      sortable: false,
      renderCell: (params) => quantityCell(params, inputHandler),
    },
    {
      headerName: "Rate",
      width: 180,
      field: "rate",
      sortable: false,
      renderCell: (params) => rateCell(params, inputHandler, currencies),
    },
    {
      headerName: "Last rate",
      width: 180,
      field: "last_rate",
      sortable: false,
      renderCell: (params) => disabledCell(params.row.last_rate, inputHandler),
      // renderCell: ({ row }) => {
      //   const currencyId = typeof row.currency === "object" ? row.currency?.value : row.currency;
      //   return (
      //     <span>
      //       {row.last_rate || "--"} {getCurrencySymbol(currencyId)}
      //     </span>
      //   );
      // },
    },
    // {
    //   headerName: "BOM Rate",
    //   width: 150,
    //   field: "rate",
    //   sortable: false,
    //   renderCell: (params) =>
    //     disabledCell(params.row.project_rate, inputHandler),
    // },
    // {
    //   headerName: "PRC IN LC",
    //   width: 150,
    //   field: "rate",
    //   sortable: false,
    //   renderCell: (params) => disabledCell(params.row.localPrice, inputHandler),
    // },
    // {
    //   headerName: "Tolerance",
    //   width: 150,
    //   field: "tol_price",
    //   sortable: false,
    //   renderCell: (params) => disabledCell(params.row.tol_price, inputHandler),
    // },
    {
      headerName: "Project Req Qty",
      width: 150,
      field: "project_qty",
      sortable: false,
      renderCell: (params) =>
        disabledCell(params.row.project_qty, inputHandler),
    },
    {
      headerName: "PO Exq Qty",
      width: 150,
      field: "po_ord_qty",
      sortable: false,
      renderCell: (params) => disabledCell(params.row.po_ord_qty, inputHandler),
    },
    {
      headerName: "Taxable Value",
      width: 150,
      field: "inrValue",
      sortable: false,
      renderCell: (params) => taxableCell(params, inputHandler),
    },
    {
      headerName: "Foreign Value",
      width: 150,
      field: "foreginValue",
      sortable: false,
      renderCell: (params) => foreignCell(params, inputHandler),
    },
    {
      headerName: "Due Date",
      width: 150,
      field: "duedate",
      sortable: false,
      renderCell: (params) => invoiceDateCell(params, inputHandler),
    },
    {
      headerName: "HSN Code",
      width: 150,
      field: "hsncode",
      sortable: false,
      renderCell: (params) => HSNCell(params, inputHandler),
    },
    {
      headerName: "GST Type",
      width: 150,
      field: "gsttype",
      sortable: false,
      renderCell: (params) => gstTypeCell(params, inputHandler),
    },
    {
      headerName: "GST Rate",
      width: 100,
      field: "gstrate",
      sortable: false,
      renderCell: (params) => gstRate(params, inputHandler),
    },
    {
      headerName: "CGST",
      width: 100,
      field: "cgst",
      sortable: false,
      renderCell: (params) => CGSTCell(params, inputHandler),
    },
    {
      headerName: "SGST",
      width: 100,
      field: "sgst",
      sortable: false,
      renderCell: (params) => SGSTCell(params, inputHandler),
    },
    {
      headerName: "IGST",
      width: 100,
      field: "igst",
      sortable: false,
      renderCell: (params) => IGSTCell(params, inputHandler),
    },
    {
      headerName: "Internal Remark",
      width: 200,
      field: "internal_remark",
      sortable: false,
      renderCell: (params) => internalRemarkCell(params, inputHandler),
    },
   
  ];
  useEffect(() => {
    getCurrencies();
  }, []);
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
    setTotaTaxValue(obj);
  }, [rowCount]);
  return (
    <div style={{ height: "99%" }}>
      {/* po update confirm modal */}
      <Modal
        title="Confirm Update PO!"
        open={submitConfirm}
        onCancel={() => setSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to update this Purchase Order?</p>
      </Modal>
      {submitLoading && <Loading />}
      {showCurrencyModal != null && (
        <CurrenceModal
          showCurrency={showCurrencyModal}
          setShowCurrencyModal={setShowCurrencyModal}
        />
      )}
      {/* po reset confirm modal */}
      <Modal
        title="Confirm Reset!"
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmReset(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetRows}>
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure to reset details of all components of this Purchase Order
          to the details it was created with?
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
      <Row gutter={8} style={{ height: "100%" }}>
        <Col span={6} style={{ height: "99%" }}>
          <Row gutter={[0, 4]} style={{ height: "100%" }}>
            {/* vendor card */}
            <Col span={24} style={{ height: "50%" }}>
              <Card style={{ height: "100%" }} title="Vendor Detail">
                <Row gutter={[0, 8]}>
                  <Col span={24}>
                    <Typography.Title
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                      }}
                      level={5}
                    >
                      Vendor Name
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                      }}
                    >
                      <ToolTipEllipses
                        text={purchaseOrder?.vendorcode?.label}
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
                      Vendor Address
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                      }}
                    >
                      <ToolTipEllipses
                        type="Paragraph"
                        text={purchaseOrder.vendoraddress}
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
                      Vendor GSTIN
                    </Typography.Title>

                    <Typography.Text
                      style={{
                        fontSize:
                          window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                      }}
                    >
                      {purchaseOrder?.vendorgst}
                    </Typography.Text>
                  </Col>
                </Row>
              </Card>
            </Col>
            {/* tax detail card */}
            <Col span={24} style={{ height: "50%" }}>
              <Card style={{ height: "100%" }} title="Tax Detail">
                <Row gutter={[0, 4]}>
                  {totalTaxValue?.map((row) => (
                    <Col span={24} key={row.label}>
                      <Row>
                        <Col
                          span={18}
                          style={{
                            fontSize: "0.8rem",
                            fontWeight:
                              totalTaxValue?.indexOf(row) ==
                                totalTaxValue.length - 1 && 600,
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
                                  totalTaxValue?.indexOf(row) ==
                                    totalTaxValue.length - 1 && 600,
                              }}
                            >
                              ({row.sign.toString()}){" "}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight:
                                totalTaxValue?.indexOf(row) ==
                                  totalTaxValue.length - 1 && 600,
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
          style={{ height: "100%", padding: 0, border: "1px solid #EEEEEE" }}
        >
          <FormTable columns={columns} data={rowCount} />
        </Col>
      </Row>
      <NavFooter
        hideHeaderMenu
        backFunction={() => setActiveTab("1")}
        submitFunction={validateData}
        nextLabel="Submit"
        resetFunction={() => setConfirmReset(true)}
      />
    </div>
  );
}
