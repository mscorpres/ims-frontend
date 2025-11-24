import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Descriptions, Divider, Drawer, Form, Input, InputNumber, Modal, Row, Tabs, Radio, Card, message, Typography, Spin, Space } from "antd";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import TextArea from "antd/lib/input/TextArea";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import printFunction, { downloadFunction } from "../../../Components/printFunction";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import NavFooter from "../../../Components/NavFooter";

export default function ViewPORequest({ poId, setPoId, getRows }) {
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState([]);
  const [newPoLogs, setNewPoLogs] = useState([]);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [approveRemark, setApproveRemark] = useState("");
  const [componentRemarks, setComponentRemarks] = useState({});
  const [form] = Form.useForm();
  const [currencies, setCurrencies] = useState([]);
  const [totalTaxValue, setTotalTaxValue] = useState([]);
  const [billingOptions, setBillingOptions] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [rejectReason, setRejectReason] = useState(""); // "rate_mismatch" | "other"

  // Vendor type mapping like EditPO
  const vendorDetailsOptions = [
    { text: "JWI (Job Work In)", value: "j01" },
    { text: "Vendor", value: "v01" },
  ];

  // Get currency symbol from ID
  const getCurrencySymbol = (currencyId) => {
    if (!currencyId) return "--";
    const currency = currencies.find((c) => c.value == currencyId);
    return currency ? currency.text : currencyId;
  };

  // Get GST type text
  const getGstTypeText = (gstType) => {
    if (gstType === "L") return "LOCAL";
    if (gstType === "I") return "INTER STATE";
    return gstType || "--";
  };

  // Fetch currencies
  const getCurrencies = async () => {
    try {
      const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
      let arr = data.data.map((d) => ({
        text: d.currency_symbol,
        value: d.currency_id,
        notes: d.currency_notes,
      }));
      setCurrencies(arr);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  // Fetch billing address options
  const getBillTo = async () => {
    try {
      const { data } = await imsAxios.post("/backend/billingAddressList", {
        search: "",
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setBillingOptions(arr);
    } catch (error) {
      console.error("Error fetching billing addresses:", error);
    }
  };

  // Fetch shipping address options
  const getShippingId = async () => {
    try {
      const { data } = await imsAxios.post("/backend/shipingAddressList", {
        searchInput: "",
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setShippingOptions(arr);
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
    }
  };

  // Fetch currencies on mount
  useEffect(() => {
    getCurrencies();
    getBillTo();
    getShippingId();
  }, []);

  // Fetch PO details
  useEffect(() => {
    if (poId) {
      fetchPODetails();
      getPoLogs(poId);
    } else {
      setLoading(false); // jab drawer band ho
    }
  }, [poId]);

  // Update form values when address options are loaded
  useEffect(() => {
    if (!purchaseOrder) return;

    let formValues = {};
    let needsUpdate = false;

    // Convert billing ID to object with label and value
    if (purchaseOrder.addrbillid && billingOptions.length > 0) {
      const billingId = typeof purchaseOrder.addrbillid === "object" ? purchaseOrder.addrbillid?.value || purchaseOrder.addrbillid?.id : purchaseOrder.addrbillid;
      const billingOption = billingOptions.find((opt) => String(opt.value) === String(billingId));
      if (billingOption) {
        formValues.addrbillid = {
          label: billingOption.text,
          value: billingOption.value,
        };
        needsUpdate = true;
      }
    }

    // Convert shipping ID to object with label and value
    if (purchaseOrder.addrshipid && shippingOptions.length > 0) {
      const shippingId = typeof purchaseOrder.addrshipid === "object" ? purchaseOrder.addrshipid?.value || purchaseOrder.addrshipid?.id : purchaseOrder.addrshipid;
      const shippingOption = shippingOptions.find((opt) => String(opt.value) === String(shippingId));
      if (shippingOption) {
        formValues.addrshipid = {
          label: shippingOption.text,
          value: shippingOption.value,
        };
        needsUpdate = true;
      }
    }

    // Update form values if we found matches
    if (needsUpdate) {
      form.setFieldsValue(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder, billingOptions, shippingOptions]);

  const fetchPODetails = async () => {
    setLoading(true);
    try {
      const { data } = await imsAxios.post("/purchaseOrder/fetchData4Update", {
        pono: poId.replaceAll("_", "/"),
      });
      setLoading(false);
      if (data?.code == 200) {
        let obj = {
          ...data.data.bill,
          materials: data.data.materials,
          ...data.data.ship,
          ...data.data.vendor[0],
        };
        obj = {
          ...obj,
          poid: obj.orderid,
          shipaddress: obj.shipaddress?.replaceAll("<br>", "\n") || "",
          vendoraddress: obj.vendoraddress?.replaceAll("<br>", "\n") || "",
          billaddress: obj.billaddress?.replaceAll("<br>", "\n") || "",
        };

        // Format vendor data properly - ensure objects have proper structure
        // If vendorcode is an object, keep it; if it's a string/value, try to preserve structure
        if (obj.vendorcode && typeof obj.vendorcode !== "object") {
          // If vendorcode is not an object, it might be just the value
          // Keep vendorname for display
        }
        if (obj.vendorbranch && typeof obj.vendorbranch !== "object") {
          // If vendorbranch is not an object, keep as is
        }

        setPurchaseOrder(obj);
        // Format form values properly like EditPO - preserve object structure for form
        form.setFieldsValue(obj);
        form.setFieldValue("advancePayment", Number(obj?.advPayment) || 0);

        // Set materials/rowCount - format like EditPO
        let arr = [];
        obj.materials?.map((row, index) => {
          // Handle gsttype - could be array with object or just value
          let gstTypeValue = "L";
          if (row.gsttype) {
            if (Array.isArray(row.gsttype) && row.gsttype[0]) {
              gstTypeValue = row.gsttype[0]?.id || row.gsttype[0]?.value || row.gsttype[0];
            } else if (typeof row.gsttype === "object") {
              gstTypeValue = row.gsttype?.id || row.gsttype?.value || "L";
            } else {
              gstTypeValue = row.gsttype;
            }
          }

          arr.push({
            id: v4(),
            currency: row.currency, // Keep as is - will be ID
            exchange_rate: row.exchangerate == "" ? 1 : row.exchangerate,
            component: {
              label: row.component + " " + row.part_no,
              value: row.componentKey,
            },
            qty: row.orderqty,
            rate: row.rate,
            duedate: row.duedate,
            hsncode: row.hsncode,
            gsttype: gstTypeValue,
            gstrate: row.gstrate,
            cgst: row.cgst == "--" ? 0 : row.cgst,
            sgst: row.sgst == "--" ? 0 : row.sgst,
            igst: row.igst == "--" ? 0 : row.igst,
            remark: row.remark || "--",
            inrValue: row.taxablevalue,
            foreginValue: row.exchangetaxablevalue,
            unit: row.unitname,
            updateRow: row.updateid,
            project_rate: row.project_rate,
            localPrice: +Number(row.exchangerate || 1).toFixed(2) * +Number(row.rate || 0).toFixed(2),
            tol_price: +Number((row.project_rate * 1) / 100).toFixed(2),
            project_qty: row.project_qty,
            po_ord_qty: row.po_ord_qty,
            last_rate: row.last_rate || "--",
          });
        });
        setRowCount(arr);
      } else {
        toast.error(data?.message || "Failed to fetch PO details");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error fetching PO details");
    } finally {
      setLoading(false); // ← finally mein false (100% safe)
    }
  };

  // Calculate tax summary like EditComponents
  useEffect(() => {
    if (rowCount.length > 0) {
      let obj = [
        {
          label: "Sub-Total value before Taxes",
          sign: "",
          values: rowCount?.map((row) => Number(row.inrValue || 0)),
        },
        {
          label: "CGST",
          sign: "+",
          values: rowCount?.map((row) => Number(row.cgst || 0)),
        },
        {
          label: "SGST",
          sign: "+",
          values: rowCount?.map((row) => Number(row.sgst || 0)),
        },
        {
          label: "IGST",
          sign: "+",
          values: rowCount?.map((row) => Number(row.igst || 0)),
        },
        {
          label: "Sub-Total values after Taxes",
          sign: "",
          values: rowCount?.map((row) => Number(row.inrValue || 0) + Number(row.sgst || 0) + Number(row.cgst || 0) + Number(row.igst || 0)),
        },
      ];
      setTotalTaxValue(obj);
    }
  }, [rowCount]);

  const getPoLogs = async (po_id) => {
    try {
      const { data } = await imsAxios.post("/purchaseOthers/pologs", {
        po_id,
      });
      if (data.code === "200" || data.code == 200) {
        let arr = data.data;
        setNewPoLogs(arr.reverse());
      }
    } catch (error) {
      console.error("Error fetching PO logs:", error);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      if (status === "R" && !rejectRemark.trim()) {
        message.error("Please enter rejection remarks");
        return;
      }

      setApproveLoading(status === "A");
      setRejectLoading(status === "R");

      // CHANGE 1: Extract vendor_code properly
      const vendorCodeValue = purchaseOrder?.vendorcode
        ? typeof purchaseOrder.vendorcode === "object"
          ? purchaseOrder.vendorcode.value || purchaseOrder.vendorcode.id
          : purchaseOrder.vendorcode
        : "";

      const components = rowCount.map((row) => {
        const componentKey = row.component?.value || row.updateRow;

        return {
          component_key: componentKey,
          status: status,
          // CHANGE: Send component-specific remark if exists
          remark: status === "R" ? componentRemarks[componentKey] || rejectRemark || "" : componentRemarks[componentKey] || approveRemark || "",
        };
      });

      const payload = {
        po_transaction: poId.replaceAll("_", "/"),
        vendor_code: vendorCodeValue,
        components: components,
        remark: status === "R" ? rejectRemark : approveRemark,
      };

      console.log("Approval/Rejection Payload:", payload); // Debug

      const response = await imsAxios.post("/purchaseOrder/updatePOComponentStatus", payload);

      setApproveLoading(false);
      setRejectLoading(false);

      if (response.data.code === 200) {
        toast.success(status === "A" ? "PO Components Approved Successfully!" : "PO Components Rejected Successfully!", { autoClose: 3000 });

        // Reset modals and refresh
        setShowRejectModal(false);
        setShowApproveModal(false);
        setRejectRemark("");
        setApproveRemark("");
        setComponentRemarks({});
        setPoId(null);

        if (getRows && typeof getRows === "function") {
          setTimeout(() => getRows(true), 500);
        }
      } else {
        // IMPROVED ERROR HANDLING: Show which components have rate mismatch
        if (response.data.data?.mismatch_components) {
          const mismatches = response.data.data.mismatch_components;

          // Create detailed error message
          const errorLines = mismatches
            .map((m) => {
              const diff = parseFloat(m.difference);
              const symbol = diff > 0 ? "↑" : "↓";
              return `• ${m.part_no} (${m.component_name})\n  Order Rate: ₹${m.order_rate} | Last Rate: ₹${m.last_rate} ${symbol} ₹${Math.abs(diff)}`;
            })
            .join("\n\n");

          toast.warn(
            <div style={{ maxWidth: "500px" }}>
              <strong style={{ fontSize: "14px" }}>⚠️ Rate Mismatch! Approval Blocked</strong>
              <br />
              <br />
              <div
                style={{
                  fontSize: "12px",
                  whiteSpace: "pre-line",
                  backgroundColor: "#fff3cd",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ffc107",
                }}
              >
                {errorLines}
              </div>
              <br />
            </div>,
            {
              autoClose: 10000,
              style: { minWidth: "500px" },
            }
          );
        } else {
          toast.error(response.data.message?.msg || "Failed to update status");
        }
      }
    } catch (error) {
      console.error("Error in handleStatusUpdate:", error);
      setApproveLoading(false);
      setRejectLoading(false);

      // Better error message
      const errorMsg = error.response?.data?.message?.msg || error.message || "Network or Server Error. Please try again.";

      toast.error(errorMsg, { autoClose: 5000 });
    }
  };
  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    setShowApproveModal(false);
    await handleStatusUpdate("A");
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    // Final validation
    if (rejectReason === "other" && !rejectRemark.trim()) {
      message.error("Rejection remark is required when selecting 'Other'");
      return;
    }

    // Auto-set remark if rate mismatch was selected
    if (rejectReason === "rate_mismatch") {
      setRejectRemark("Rate Mismatch");
    }

    setShowRejectModal(false);
    await handleStatusUpdate("R"); // This will use rejectRemark correctly
  };

  const printFun = async () => {
    setLoading("print");
    const { data } = await imsAxios.post("/poPrint", {
      poid: poId,
    });
    printFunction(data.data.buffer.data);
    setLoading(null);
  };

  const handleDownload = async () => {
    setLoading("download");
    const { data } = await imsAxios.post("/poPrint", {
      poid: poId,
    });
    setLoading(null);
    let filename = `PO ${poId}`;
    downloadFunction(data.data.buffer.data, filename);
  };

  const componentColumns = [
    {
      headerName: "Component",
      width: 250,
      field: "component",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component?.label || "--"} />,
    },
    {
      headerName: "Ord. Qty",
      width: 130,
      field: "qty",
      sortable: false,
      renderCell: ({ row }) => (
        <span>
          {row.qty} {row.unit || ""}
        </span>
      ),
    },
    {
      headerName: "order Rate",
      width: 180,
      field: "rate",
      sortable: false,
      renderCell: ({ row }) => {
        const currencyId = typeof row.currency === "object" ? row.currency?.value : row.currency;
        return (
          <span>
            {row.rate || "--"} {getCurrencySymbol(currencyId)}
          </span>
        );
      },
    },
    {
      headerName: "Last rate",
      width: 180,
      field: "last_rate",
      sortable: false,
      renderCell: ({ row }) => {
        const currencyId = typeof row.currency === "object" ? row.currency?.value : row.currency;
        return (
          <span>
            {row.last_rate || "--"} {getCurrencySymbol(currencyId)}
          </span>
        );
      },
    },
    // {
    //   headerName: "BOM Rate",
    //   width: 150,
    //   field: "project_rate",
    //   sortable: false,
    //   renderCell: ({ row }) => <span>{row.project_rate || "--"}</span>,
    // },
    // {
    //   headerName: "PRC IN LC",
    //   width: 150,
    //   field: "localPrice",
    //   sortable: false,
    //   renderCell: ({ row }) => <span>{row.localPrice || "--"}</span>,
    // },
    // {
    //   headerName: "Tolerance",
    //   width: 150,
    //   field: "tol_price",
    //   sortable: false,
    //   renderCell: ({ row }) => <span>{row.tol_price || "--"}</span>,
    // },
    {
      headerName: "Project Req Qty",
      width: 150,
      field: "project_qty",
      sortable: false,
      renderCell: ({ row }) => <span>{row.project_qty || "--"}</span>,
    },
    {
      headerName: "PO Exq Qty",
      width: 150,
      field: "po_ord_qty",
      sortable: false,
      renderCell: ({ row }) => <span>{row.po_ord_qty || "--"}</span>,
    },
    {
      headerName: "Taxable Value",
      width: 150,
      field: "inrValue",
      sortable: false,
      renderCell: ({ row }) => <span>{row.inrValue || "--"}</span>,
    },
    {
      headerName: "Foreign Value",
      width: 150,
      field: "foreginValue",
      sortable: false,
      renderCell: ({ row }) => <span>{row.foreginValue || "--"}</span>,
    },
    {
      headerName: "Due Date",
      width: 150,
      field: "duedate",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.duedate || "--"} />,
    },
    {
      headerName: "HSN Code",
      width: 150,
      field: "hsncode",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.hsncode || "--"} />,
    },
    {
      headerName: "GST Type",
      width: 150,
      field: "gsttype",
      sortable: false,
      renderCell: ({ row }) => {
        const gstType = typeof row.gsttype === "object" ? row.gsttype?.value || row.gsttype?.id : row.gsttype;
        return <span>{getGstTypeText(gstType)}</span>;
      },
    },
    {
      headerName: "GST Rate",
      width: 100,
      field: "gstrate",
      sortable: false,
      renderCell: ({ row }) => <span>{row.gstrate || "--"}</span>,
    },
    {
      headerName: "CGST",
      width: 100,
      field: "cgst",
      sortable: false,
      renderCell: ({ row }) => <span>{row.cgst || "--"}</span>,
    },
    {
      headerName: "SGST",
      width: 100,
      field: "sgst",
      sortable: false,
      renderCell: ({ row }) => <span>{row.sgst || "--"}</span>,
    },
    {
      headerName: "IGST",
      width: 100,
      field: "igst",
      sortable: false,
      renderCell: ({ row }) => <span>{row.igst || "--"}</span>,
    },
    {
      headerName: "Item Description",
      width: 250,
      field: "remark",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.remark || "--"} />,
    },
  ];

  const LoaderOverlay = () => (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(255, 255, 255, 0.97)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        borderRadius: 8,
      }}
    >
      <Spin size="large" />
      <div style={{ marginTop: 24, fontSize: 18, color: "#555", fontWeight: 500 }}>Loading Purchase Order...</div>
    </div>
  );

  return (
    <Drawer
      title={`Viewing PO: ${poId}`}
      width="100vw"
      open={poId}
      onClose={() => {
        setPoId(null);
        setRejectRemark("");
        setApproveRemark("");
        setComponentRemarks({});
        setShowRejectModal(false);
        setShowApproveModal(false);
      }}
      extra={
        <div style={{ display: "flex", gap: 8 }}>
          <CommonIcons action="printButton" loading={loading === "print"} onClick={printFun} />
          <CommonIcons action="downloadButton" loading={loading === "download"} onClick={handleDownload} />
        </div>
      }
    >
      {loading && <LoaderOverlay />}
      <Tabs
        activeKey={activeTab}
        style={{
          marginTop: -24,
          height: "100%",
        }}
        size="small"
      >
        <Tabs.TabPane style={{ height: "100%" }} tab="Purchase Order Details" key="1">
          <Form form={form} initialValues={purchaseOrder} size="small" layout="vertical" style={{ height: "100%" }}>
            <div
              style={{
                height: "calc(100% - 80px)",
                overflowY: "scroll",
                overflowX: "hidden",
              }}
            >
              {/* Vendor Details */}
              <Row>
                <Col span={4}>
                  <Descriptions title="Vendor Details">
                    <Descriptions.Item>Type Name or Code of the vendor</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        label="Vendor Type"
                        name="vendortype_value"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a vendor Type!",
                          },
                        ]}
                      >
                        <MySelect size="default" options={vendorDetailsOptions} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Vendor Name"
                        name="vendorcode"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a vendor!",
                          },
                        ]}
                      >
                        <MyAsyncSelect onBlur={() => setAsyncOptions([])} labelInValue disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="vendorbranch"
                        label="Vendor Branch"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a vendor Branch!",
                          },
                        ]}
                      >
                        <MySelect
                          size="default"
                          labelInValue
                          disabled
                          // options={vendorBranches}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="GSTIN">
                        <Input size="default" value="--" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={18}>
                      <Form.Item name="vendoraddress" label="Bill From Address">
                        <TextArea style={{ resize: "none" }} rows={4} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider />

              {/* PO Terms */}
              <Row>
                <Col span={4}>
                  <Descriptions title="PO Terms">
                    <Descriptions.Item>Provide PO terms and other information</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item name="termsofcondition" label="Delivery terms">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="termsofquotation" label="Quotation">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="paymentterms" label="Payment Terms">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    {/* <Col span={6}>
                      <Form.Item
                        label="Due Date (in days)"
                        name="paymenttermsday"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="default"
                          disabled
                        />
                      </Form.Item>
                    </Col> */}
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        name="costcenter"
                        label="Cost Center"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a Cost Center!",
                          },
                        ]}
                      >
                        <MyAsyncSelect onBlur={() => setAsyncOptions([])} labelInValue disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="projectname" label="Project">
                        <Input size="default" value={purchaseOrder?.projectname} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="pocomment" label="Comments">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item label="Advance Payment" name="advancePayment">
                        <Radio.Group disabled>
                          <Radio value={1}>Yes</Radio>
                          <Radio value={0}>No</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider />

              {/* Billing Details */}
              <Row>
                <Col span={4}>
                  <Descriptions title="Billing Details">
                    <Descriptions.Item>Provide billing information</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        name="addrbillid"
                        label="Billing Id"
                        rules={[
                          {
                            required: true,
                            message: "Please select a billing address!",
                          },
                        ]}
                      >
                        <MySelect disabled labelInValue options={billingOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="billpanno" label="Pan No.">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="billgstid" label="GSTIN / UIN">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={18}>
                      <Form.Item name="billaddress" label="Billing Address">
                        <TextArea style={{ resize: "none" }} rows={4} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Divider />

              {/* Shipping Details */}
              <Row>
                <Col span={4}>
                  <Descriptions title="Shipping Details">
                    <Descriptions.Item>Provide shipping information</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        name="addrshipid"
                        label="Shipping Id"
                        rules={[
                          {
                            required: true,
                            message: "Please select a shipping address!",
                          },
                        ]}
                      >
                        <MySelect disabled labelInValue options={shippingOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="shippanno" label="Pan No.">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="shipgstid" label="GSTIN / UIN">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={18}>
                      <Form.Item name="shipaddress" label="Shipping Address">
                        <TextArea style={{ resize: "none" }} rows={4} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            <NavFooter backFunction={() => setPoId(null)} submitFunction={() => setActiveTab("2")} submitButton={true} backLabel="Cancel" />
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Components Details" style={{ height: "100%" }} key="2">
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
                          <ToolTipEllipses text={purchaseOrder?.vendorcode?.label || purchaseOrder?.vendorname || "--"} />
                        </Typography.Text>
                      </Col>
                      <Col span={24}>
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
                          <ToolTipEllipses type="Paragraph" text={purchaseOrder?.vendoraddress || "--"} />
                        </Typography.Text>
                      </Col>
                      <Col span={24}>
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
                          {purchaseOrder?.vendorgst || "--"}
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
                                fontWeight: totalTaxValue?.indexOf(row) == totalTaxValue.length - 1 && 600,
                              }}
                            >
                              {row.label}
                            </Col>
                            <Col span={6} style={{ textAlign: "right" }}>
                              {row.sign.toString() == "" ? (
                                ""
                              ) : (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: totalTaxValue?.indexOf(row) == totalTaxValue.length - 1 && 600,
                                  }}
                                >
                                  ({row.sign.toString()}){" "}
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: totalTaxValue?.indexOf(row) == totalTaxValue.length - 1 && 600,
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
              <div style={{ height: "calc(100% - 80px)" }} className="remove-table-footer">
  <MyDataTable pagination={undefined} rows={rowCount} columns={componentColumns} />
  
  {(purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || 
    purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") || 
    purchaseOrder?.remarByacc?.toLowerCase().includes("rejected")) && (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-18deg)",
      pointerEvents: "none",
      zIndex: 10,
      userSelect: "none",
      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
    }}>
      {/* Main Stamp Circle */}
      <div style={{
        position: "relative",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        // border: "10px solid #dc2626",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.82,
      }}>
        {/* Inner dashed circle */}
        <div style={{
          position: "absolute",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "2px dashed #dc2626",
          opacity: 0.6,
        }} />
        
        {/* REJECTED Text */}
        <div style={{
          fontSize: "1rem",
          fontWeight: "900",
          fontFamily: "'Arial Black', 'Impact', sans-serif",
          color: "#dc2626",
          letterSpacing: "10px",
          textTransform: "uppercase",
          lineHeight: "1",
          opacity: 0.85,
          transform: "scaleY(1.15)",
          textAlign: "center",
        }}>
          REJECTED
        </div>
        
        {/* Top Arc Text */}
        {/* <div style={{
          position: "absolute",
          top: "40px",
          fontSize: "0.85rem",
          fontWeight: "700",
          color: "#dc2626",
          letterSpacing: "4px",
          opacity: 0.75,
        }}>
          NOT APPROVED
        </div>
         */}
       
        {/* Decorative stars */}
        {[0, 90, 180, 270].map((angle, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              fontSize: "1.4rem",
              color: "#dc2626",
              opacity: 0.65,
              transform: `rotate(${angle}deg) translateY(-125px) rotate(-${angle}deg)`,
            }}
          >
            ★
          </div>
        ))}
        
        {/* Texture overlay for authenticity */}
        <div style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(220, 38, 38, 0.02) 2px,
              rgba(220, 38, 38, 0.02) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(220, 38, 38, 0.02) 2px,
              rgba(220, 38, 38, 0.02) 4px
            )
          `,
          pointerEvents: "none",
        }} />
        
        {/* Ink splatter effects */}
        <div style={{
          position: "absolute",
          top: "-8px",
          right: "15px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#dc2626",
          opacity: 0.25,
          filter: "blur(2px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "-5px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#dc2626",
          opacity: 0.2,
          filter: "blur(3px)",
        }} />
      </div>
    </div>
  )}
  
  <Row
    align="middle"
    style={{
      marginTop: 2,
      padding: purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") ? "16px" : "12px 16px",
      backgroundColor: purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") ? "#fff1f0" : "#e6f7ff",
      borderRadius: "8px",
      border:
        purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") ? "1px solid #ffa39e" : "1px solid #91d5ff",
      boxShadow:
        purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") ? "0 2px 8px rgba(255,59,48,0.15)" : "none",
    }}
  >
    <Col span={3}>
      <Typography.Text
        strong
        style={{
          fontSize: window.innerWidth < 1600 ? "1.3rem" : "1.1rem",
          color: purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") ? "#cf1322" : "red",
        }}
      >
        Remark :-
      </Typography.Text>
    </Col>
    <Col span={20}>
      <Typography.Text
        strong
        style={{
          fontSize: window.innerWidth < 1600 ? "1.05rem" : "1.15rem",
          color: purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch") ? "#cf1322" : "#0050b3",
          fontWeight: 600,
          display: "block",
        }}
      >
        {purchaseOrder?.remarByacc ? (
          <>
            {purchaseOrder.remarByacc}
            {/* Optional: Add icon for rejection */}
            {(purchaseOrder?.remarByacc?.toLowerCase().includes("reject") || purchaseOrder?.remarByacc?.toLowerCase().includes("rate mismatch")) && (
              <span style={{ marginLeft: 8, fontSize: "1.4rem" }}></span>
            )}
          </>
        ) : (
          "--"
        )}
      </Typography.Text>
    </Col>
  </Row>
</div>
              <NavFooter
                backFunction={() => setActiveTab("1")}
                backLabel="Back"
                additional={[
                  () => (
                    <Button key="reject" type="primary" danger size="default" loading={rejectLoading} onClick={handleReject}>
                      Reject
                    </Button>
                  ),
                  () => (
                    <Button
                      key="approve"
                      type="primary"
                      size="default"
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                      loading={approveLoading}
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                  ),
                ]}
              />
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* Reject Modal */}
      <Modal
        title={<div style={{ color: "#cf1322", fontWeight: 600 }}>Reject PR</div>}
        open={showRejectModal}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectRemark("");
          setRejectReason("");
        }}
        width={650}
        footer={null} // We'll use custom footer for better control
      >
        <div style={{ padding: "10px 0" }}>
          {/* Warning Header */}
          <div
            style={{
              backgroundColor: "#fff2e8",
              border: "1px solid #ffbb96",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#d4380d",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: "1.4rem", textAlign: "center" }}>Warning</span>
            {/* <span>
              You are about to <strong>reject</strong> one or more components in this PO. This action will notify the requester.
            </span> */}
          </div>

          {/* Rejection Reason Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 10, fontWeight: 600, fontSize: "15px" }}>
              Select Rejection Reason <span style={{ color: "red" }}>*</span>
            </label>
            <Radio.Group
              onChange={(e) => {
                const value = e.target.value;
                setRejectReason(value);
                if (value === "rate_mismatch") {
                  setRejectRemark("Rate Mismatch with Last Purchase Rate");
                } else {
                  setRejectRemark("");
                }
              }}
              value={rejectReason}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio value="rate_mismatch" style={{ fontSize: "15px" }}>
                  <span style={{ color: "#cf1322", fontWeight: 500 }}>Rate Mismatch</span> (Order rate differs from last purchase rate)
                </Radio>
                <Radio value="other" style={{ fontSize: "15px" }}>
                  Other Reason (Please specify below)
                </Radio>
              </Space>
            </Radio.Group>
          </div>

          {/* Custom Remark Input (Only for "Other") */}
          {rejectReason === "other" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                Rejection Remark <span style={{ color: "red" }}>*</span>
              </label>
              <TextArea
                rows={4}
                placeholder="Please provide a detailed reason for rejection..."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                autoFocus
                style={{
                  borderColor: rejectRemark.trim() ? "#52c41a" : "#ff4d4f",
                }}
              />
            </div>
          )}

          {/* Auto Remark Preview for Rate Mismatch */}
          {rejectReason === "rate_mismatch" && (
            <div
              style={{
                marginTop: 10,
                padding: "14px",
                backgroundColor: "#fef7e0",
                border: "1px dashed #fa8c16",
                borderRadius: 8,
                color: "#d46b08",
                fontWeight: 500,
              }}
            >
              <strong>Auto Remark:</strong> "Rate Mismatch with Last Purchase Rate"
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Button
              size="large"
              onClick={() => {
                setShowRejectModal(false);
                setRejectRemark("");
                setRejectReason("");
              }}
              style={{ marginRight: 10 }}
            >
              Cancel
            </Button>
            <Button
              size="large"
              type="primary"
              danger
              loading={rejectLoading}
              disabled={!rejectReason || (rejectReason === "other" && !rejectRemark.trim())}
              onClick={handleRejectConfirm}
              style={{
                minWidth: 140,
                fontWeight: 600,
              }}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Approve PO"
        open={showApproveModal}
        onCancel={() => {
          setShowApproveModal(false);
          setApproveRemark("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowApproveModal(false);
              setApproveRemark("");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={approveLoading}
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
            onClick={handleApproveConfirm}
          >
            Approve PO
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>Approve PO Remarks (Optional)</label>
          <TextArea rows={4} placeholder="Enter remarks here (optional)..." value={approveRemark} onChange={(e) => setApproveRemark(e.target.value)} />
        </div>
      </Modal>
    </Drawer>
  );
}
