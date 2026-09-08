import { useEffect, useState } from "react";
import { Form, Modal } from "antd";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { v4 } from "uuid";

import {
  editWorkorderChallan,
  editWorkorderDeliveryChallan,
  editWorkorderShipment,
  fetchClientDetail,
  fetchComponentListForWO,
  fetchLocation,
  fetchProductData,
  fetchReturnEdit,
  fetchWoMins,
  getProductByNameAndNo,
  postUpdatedWo,
  previewExcelShipmentData,
  saveCreateReturnChallan,
  saveCreateShipment,
  saveShipmentThroughExcel,
  updateWO_DeliveryChallan,
  updateWO_ReturnChallan,
  updateWO_ReturnShipment,
} from "./api";

const useCreateChallanModal = ({
  show,
  close,
  data,
  editShipment,
  rtnchallan,
  setRtnChallan,
}) => {
  const [challanForm] = Form.useForm();
  const [locationlist, setlocationlist] = useState([]);
  const [test, settest] = useState("");
  const [challantitle, setchallantitle] = useState(false);
  const [billid, setBillId] = useState("");
  const [dispatchid, setDispatchId] = useState("");
  const [addid, setaddid] = useState(false);
  const [daddid, setdaddid] = useState(false);
  const [addOptions, setaddoptions] = useState([]);
  const [challanId, setChallanId] = useState("");
  const [rows, setRows] = useState([]);
  const [minRows, setMinRows] = useState([]);
  const [gstType, setgstType] = useState([]);
  const [loading, setLoading] = useState("fetch");
  const [branchid, setBranchId] = useState("");
  const [minqty, setMinQty] = useState("");
  const [componentList, setComponentList] = useState([]);
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [dataProductdetails, setDataProductdetails] = useState({
    text: "",
    value: "",
  });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [transaction, setTransactions] = useState("");
  const [uplaodType, setUploadType] = useState("table");
  const [stage, setStage] = useState("preview");
  const [previewData, setpreviewData] = useState([]);

  let bid;

  const files = Form.useWatch("files", challanForm);
  useEffect(() => {
    if (files) setStage("preview");
  }, [files]);

  const previewuploaData = async () => {
    const values = await challanForm.validateFields();
    let formData = new FormData();
    formData.append("file", values.files[0].originFileObj);
    setLoading(true);
    const { data: res } = await previewExcelShipmentData(formData);
    if (res.code === 200) {
      setpreviewData(res.data.map((r, index) => ({ id: index + 1, ...r })));
      setLoading(false);
    }
    setLoading(false);
  };

  const getLocationList = async (search) => {
    const { data: res } = await fetchLocation(search);
    const list = res?.data ?? res;
    setlocationlist(
      (list || []).map((row) => ({ text: row.text, value: row.id }))
    );
  };

  const showSubmitConfirmationModal = () => {
    Modal.confirm({
      title: "Do you Want to Create this Shipment?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      cancelText: "No",
      onOk: () => createDeliveryChallan(),
    });
  };

  const showReturnSubmitConfirmationModal = () => {
    Modal.confirm({
      title: "Do you Want to Create this Return Challan?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await createRMChallan();
      },
    });
  };

  const getchallandata = async (challanType, challanno) => {
    try {
      setLoading("fetch");
      setChallanId(challanno);
      if (challanType === "Create shipment") {
        const { data: res } = await editWorkorderDeliveryChallan(challanno);
        challanForm.setFieldValue("clientname", res.header.clientcode.label);
        challanForm.setFieldValue("vn", res.header.vehicle);
        challanForm.setFieldValue("or", res.header.other_ref);
        challanForm.setFieldValue("pd", res.header.duration_process);
        challanForm.setFieldValue("nature", res.header.nature_process);
        challanForm.setFieldValue("components", [
          {
            productname: res.material.product_name,
            qty: res.material.received_qty,
            hsn: res.material.hsn_code,
            rate: res.material.product_rate,
            description: res.material.remarks,
          },
        ]);
      } else {
        const { data: res } = await editWorkorderChallan(challanno);
        challanForm.setFieldValue("clientname", res.header.clientcode.label);
        challanForm.setFieldValue("vn", res.header.vehicle);
        challanForm.setFieldValue("or", res.header.other_ref);
        challanForm.setFieldValue("pd", res.header.duration_process);
        challanForm.setFieldValue("nature", res.header.nature_process);
        const arr = res.material.map((row, index) => ({
          id: index + 1,
          componentKey: row.component_key,
          component: row.component_name,
          partCode: row.part_no,
          hsn: row.hsn_code,
          rate: row.part_rate,
          qty: row.received_qty,
        }));
        const fields = challanForm.getFieldsValue();
        fields.components = arr;
        challanForm.setFieldsValue(fields);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryChallan = async () => {
    try {
      const values = await challanForm.validateFields();
      let did;
      bid = addid ? values.billingid : billid;
      did = daddid ? values.shippingid : dispatchid;
      const cddata = {
        transaction_id: challanId,
        header: {
          billingid: bid,
          billingaddress: values.billingaddress,
          dispatchid: did,
          dispatchaddress: values.shippingaddress,
          dispatchfrompincode: "--",
          dispatchfromgst: "--",
          vehicle: values.vn,
          clientbranch: branchid,
          clientaddress: values.address,
          duration: values.pd,
          nature: values.nature,
          other_ref: values.or,
        },
        material: {
          product: data.dataProductdetails.value,
          qty: values.components[0].qty,
          rate: values.components[0].rate,
          picklocation: values.components[0].pickuplocation,
          hsncode: values.components[0].hsn,
          remark: values.components[0].description,
        },
      };
      setLoading("fetch");
      const response = await updateWO_DeliveryChallan(cddata);
      if (response.data.code === 200) {
        toast.success(response.data.message);
        resetState();
        close();
      } else {
        toast.error(response.data.message.msg);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRmChallan = async () => {
    try {
      const values = await challanForm.validateFields();
      let did;
      bid = addid ? values.billingid : billid;
      did = addid ? values.shippingid : dispatchid;
      const component = values.components.map((item) => item.componentKey);
      const qty = values.components.map((item) => item.qty);
      const rate = values.components.map((item) => item.rate);
      const pickup = values.components.map((item) => item.pickuplocation);
      const hsn = values.components.map((item) => item.hsn);
      const remark = values.components.map((item) => item.description);
      const cddata = {
        transaction_id: challanId,
        header: {
          billingid: bid,
          billingaddress: values.billingaddress,
          dispatchid: did,
          dispatchaddress: values.shippingaddress,
          dispatchfrompincode: "--",
          dispatchfromgst: "--",
          vehicle: values.vn,
          clientbranch: branchid,
          clientaddress: values.address,
          duration: values.pd,
          nature: values.nature,
          other_ref: values.or,
        },
        material: { component, qty, rate, picklocation: pickup, hsncode: hsn, remark },
      };
      setLoading("fetch");
      const response = await updateWO_ReturnChallan(cddata);
      if (response.data.code === 200) {
        toast.success(response.data.message);
        resetState();
        close();
      } else {
        toast.error(response.data.message.msg);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  // edit the challans
  const getEditShipmentData = async (h) => {
    const request =
      editShipment === "Shipment"
        ? editWorkorderShipment(h.shipmentId)
        : fetchReturnEdit(h.shipmentId);
    const { data: res } = await request;
    if (res.code !== 200) return;

    const arrHead = res.header;
    challanForm.setFieldValue("clientbranch", arrHead.client_branch);
    challanForm.setFieldValue("nature", arrHead.eway_no);
    challanForm.setFieldValue("pd", arrHead.ship_doc_no);
    challanForm.setFieldValue("vn", arrHead.vehicle);
    challanForm.setFieldValue("or", arrHead.other_ref);
    challanForm.setFieldValue("billingid", arrHead.billing_info.value);
    challanForm.setFieldValue("billingaddress", arrHead.billing_address);
    challanForm.setFieldValue("dispatchid", arrHead.dispatch_info.value);
    challanForm.setFieldValue("shippingaddress", arrHead.dispatch_address);

    if (editShipment === "Shipment") {
      challanForm.setFieldValue("components", [
        {
          productname: res.material.product_name,
          productKey: res.material.product_key,
          qty: res.material.received_qty,
          hsncode: res.material.hsn_code,
          rate: res.material.product_rate,
          productdescription: res.material.sku_desc,
          woId: h.woTransaction_Id,
          shipment_id: arrHead.shipment_id,
          clientbranchid: arrHead.clientaddress.value,
          challan_remark: arrHead.challan_remark,
        },
      ]);
    } else {
      challanForm.setFieldValue("challanRemark", arrHead.challan_remark);
      const materialArr = res.material.map((a) => ({
        materialRowId: a.row_id,
        component: a.component_name,
        productKey: a.component_key,
        partCode: a.part_no,
        qty: a.part_qty,
        hsn: a.hsn_code,
        rate: a.part_rate,
        description: a.remarks,
        woId: h.woTransaction_Id,
        shipment_id: arrHead.shipment_id,
        clientbranchid: arrHead.clientaddress.value,
      }));
      const fields = challanForm.getFieldsValue();
      fields.components = materialArr;
      setComponentList(materialArr);
      challanForm.setFieldsValue(fields);
    }

    const arr = res?.min_out_data?.map((r) => ({
      min_date: r.wo_min_date,
      min_id: r.wo_min_id,
      min_eway_bill: r.min_eway_bill,
      min_rate: r.wo_out_rate,
      component_name: r.component_name,
      part_code: r.component_part_no,
      component_key: r.component_key,
      out_qty: r.wo_out_qty,
      rowId: r.row_id,
      id: v4(),
    }));
    setMinRows(arr);
    challanForm.setFieldValue("address", arrHead.clientaddress.label);
  };

  const resetState = () => {
    challanForm.resetFields();
    setRows([]);
    setMinRows([]);
    setLoading(false);
    setComponentList([]);
    setRtnChallan(false);
    setpreviewData([]);
  };

  const closeDrawer = () => {
    resetState();
    close();
  };

  useEffect(() => {
    if (rows.length === 0) return;
    if (!rtnchallan) {
      let sumOfMinAvailableQty = 0;
      const getRowsQty = rows.filter((b) => b.out_qty > 0);
      for (const item of getRowsQty) {
        sumOfMinAvailableQty += parseInt(item.out_qty);
      }
      setMinQty(sumOfMinAvailableQty);
      const a = challanForm.getFieldValue("components");
      a[0].qty = sumOfMinAvailableQty;
      challanForm.setFieldValue("components", a);
    } else {
      setLoading("fetch");
      let totalMinAvailableQty = 0;
      let qtyelement;
      const getRowsQty = rows.filter((b) => b.out_qty > 0);
      for (const item of getRowsQty) {
        qtyelement = componentList.find(
          ({ partCode }) => partCode === item.part_code
        );
      }
      if (qtyelement) {
        const samePartCodeArr = getRowsQty.filter(
          (r) => r.part_code === qtyelement.partCode
        );
        samePartCodeArr.forEach((s) => {
          totalMinAvailableQty += parseInt(s.out_qty) || 0;
        });
        challanForm.setFieldValue(
          ["components", qtyelement.id - 1, "qty"],
          totalMinAvailableQty
        );
      }
      setLoading(false);
    }
  }, [rows]);

  useEffect(() => {
    setRows([]);
    setMinRows([]);
    setComponentList([]);
    challanForm.resetFields();
    setDataProductdetails({ text: data.product, value: data.productId });
    setTransactions(data.transactionId);
    if (editShipment == "Shipment" && data) {
      getEditShipmentData(data);
      settest("Edit Shipment");
    }
    if (editShipment == "editReturn" && data) {
      getEditShipmentData(data);
      settest("Edit Return");
    }
    getLocationList();
    if (Object.prototype.hasOwnProperty.call(data, "challanId")) {
      getchallandata(data.challantype, data.challanId);
      setchallantitle(true);
      settest(data.challantype);
    }
    if (show.label === "Return Challan") {
      settest(show.label);
      getbomcomponents(data.productId, data.transactionId);
      setRtnChallan(true);
      getMinDetails(data);
    } else if (show.label === "Create shipment") {
      settest(show.label);
      const obj = {
        index: 1,
        productname: data.product,
        hsncode: data.hsn,
        partCode: "row.c_part_no",
        id: v4(),
      };
      setRows([]);
      challanForm.setFieldValue("components", [obj]);
      getMinDetails(data);
    }
    if (data != "") {
      getClientdetails(
        data.clientCode,
        data.clientaddress,
        data.clientAddressId,
        data.billaddress,
        data.shipaddress,
        data.challanId
      );
    }
  }, [show, data?.transactionId, data?.challanId]);

  const getMinDetails = async (d) => {
    setLoading("fetch-wo-mins");
    const { data: res } = await fetchWoMins(d.transactionId);
    if (res?.code === 200) {
      const arr = res?.data?.map((r) => ({
        min_date: r.min_date,
        min_id: r.min_id,
        min_eway_bill: r.min_eway_bill,
        min_available_qty: r.min_available_qty,
        min_rate: r.min_rate,
        component_name: r.component_name,
        part_code: r.part_code,
        component_key: r.component_key,
        id: v4(),
      }));
      setMinRows(arr);
      setLoading(false);
    }
  };

  const inputHandler = (name, value, id) => {
    const arr = minRows.map((row) =>
      row.id === id ? { ...row, [name]: value } : row
    );
    setRows(arr);
    setMinRows(arr);
  };

  // Push the Qty typed against a component (top components table) into the
  // "Out Qty" of every MIN row that belongs to that same component.
  const syncOutQty = (component, value) => {
    const componentKey = component?.componentKey ?? component?.productKey;
    const partCode = component?.partCode;
    setMinRows((prev) =>
      (Array.isArray(prev) ? prev : []).map((row) => {
        const matches =
          (componentKey && row.component_key === componentKey) ||
          (partCode && row.part_code === partCode);
        return matches ? { ...row, out_qty: value } : row;
      })
    );
  };

  const getbomcomponents = async (sku, woid) => {
    try {
      setLoading("fetch");
      setComponentsLoading(true);
      const { data: res } = await fetchComponentListForWO(sku, woid);
      const arr = res.data.map((row, index) => ({
        id: index + 1,
        componentKey: row.component_key,
        component: row.component_name,
        partCode: row.part_code,
        hsn: row.component_hsn,
        qty: "",
      }));
      const fields = challanForm.getFieldsValue();
      fields.components = arr;
      setComponentList(arr);
      challanForm.setFieldsValue(fields);
      setLoading(false);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
      setComponentsLoading(false);
    }
  };

  const removeRow = (id) => {
    setMinRows(minRows.filter((row) => row.id !== id));
  };

  const getComponentDetails = async (inputValue) => {
    setLoading("fetch");
    const { data: res } = await fetchProductData(inputValue);
    setLoading(false);
    if (!res) {
      toast.error("Some error occured wile getting component details");
      return;
    }
    if (res.code === 200) {
      challanForm.setFieldValue("components", [
        {
          hsncode: res.data?.hsn,
          secondary_product: res.data?.product_name,
          secondary_productId: inputValue,
          productname: dataProductdetails.text,
          qty: minqty,
        },
      ]);
    } else {
      toast.error(res.message.msg);
    }
  };

  const getClientdetails = async (code, caddress, caid, badd, sadd, cid) => {
    try {
      setLoading("fetch");
      const { data: res } = await fetchClientDetail(code);

      if (cid === undefined) {
        res.branchList.forEach((row) => {
          if (row.address === badd) {
            challanForm.setFieldValue("billingid", row.id);
            challanForm.setFieldValue("billingaddress", badd);
            setBillId(row.id);
          } else if (row.address === sadd) {
            challanForm.setFieldValue("dispatchid", row.text);
            challanForm.setFieldValue("shippingaddress", sadd);
            challanForm.setFieldValue("dispatchfromgst", row.gst);
            challanForm.setFieldValue("dispatchfrompincode", row.pincode);
            setDispatchId(row.id);
          }
        });
        challanForm.setFieldValue("clientname", res.client.name);
        challanForm.setFieldValue("address", caddress);
        res.branchList.forEach((item) => {
          if (item.id === caid) {
            challanForm.setFieldValue("clientbranch", item.text);
            setBranchId(item.id);
          }
        });
      } else {
        res.branchList.forEach((item) => {
          if (item.id === caid) {
            challanForm.setFieldValue("clientbranch", item.text);
            setBranchId(item.id);
          }
        });
        res.branchList.forEach((row) => {
          if (row.address === badd) {
            challanForm.setFieldValue("billingid", row.text);
            challanForm.setFieldValue("billingaddress", badd);
            setBillId(row.id);
          } else if (row.address === sadd) {
            challanForm.setFieldValue("dispatchid", row.text);
            challanForm.setFieldValue("shippingaddress", sadd);
            challanForm.setFieldValue("dispatchfromgst", row.gst);
            challanForm.setFieldValue("dispatchfrompincode", row.pincode);
            setDispatchId(row.id);
          }
        });
        challanForm.setFieldValue("clientname", res.client.name);
        challanForm.setFieldValue("address", caddress);
      }
      if (res.code === 200) {
        setaddoptions(
          res.branchList.map((row) => ({
            text: row.text,
            value: row.id,
            address: row.address,
            gst: row.gst,
            pincode: row.pincode,
          }))
        );
      }
      toast.error(res.message?.msg);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateWoShipment = async (newpayload) => {
    await postUpdatedWo(newpayload);
    close();
  };

  const createchallanThroughtExcel = async () => {
    const a = challanForm.getFieldsValue();
    const bbidforexcel = a.billingid;
    const values = await challanForm.validateFields();
    bid = addid ? values.billingid : billid;
    let formData = new FormData();
    formData.append("file", values.files[0].originFileObj);
    formData.append("billingaddrid", bbidforexcel);
    formData.append("dispatchaddrid", values.dispatchid);
    formData.append("transaction_id", transaction);

    const { data: res } = await saveShipmentThroughExcel(formData);
    if (res.code === 200) {
      toast.success(res.message);
      resetState();
      close();
    } else {
      toast.error(res.message.msg);
    }
  };

  const createDeliveryChallan = async () => {
    setLoading("create");
    if (uplaodType === "file") {
      try {
        await createchallanThroughtExcel();
      } finally {
        setLoading(false);
      }
      return;
    }
    if (editShipment === "Shipment") {
      try {
        const values = await challanForm.validateFields();
        const newpayload = {
          shipment_id: values.components[0].shipment_id,
          wo_id: values.components[0].woId,
          header: {
            billingid: values.billingid,
            billingaddress: values.billingaddress,
            dispatchid: values.dispatchid,
            dispatchaddress: values.shippingaddress,
            dispatchfrompincode: "--",
            dispatchfromgst: "--",
            vehicle: values.vn,
            clientbranch: values.components[0].clientbranchid,
            clientaddress: values.address,
            eway: values.nature,
            ship_doc: values.pd,
            other_ref: values.or,
            challan_remark: values.components[0].challan_remark,
          },
          material: {
            product: values.components[0].productKey,
            qty: values.components[0].qty,
            rate: values.components[0].rate,
            picklocation: values.components[0].pickuplocation,
            hsncode: values.components[0].hsncode,
            gst_rate: values.components[0].gstRate,
            wo_sku_desc: values.components[0].productdescription,
          },
          min_out: {
            id: minRows.map((e) => e.rowId),
            comp: minRows.map((e) => e.component_key),
            qty: minRows.map((e) => e.out_qty),
          },
        };
        await updateWoShipment(newpayload);
      } catch (error) {
        toast.error(error?.message || "Failed to update shipment");
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      const values = await challanForm.validateFields();
      const minOutRows = (Array.isArray(minRows) ? minRows : []).filter(
        (b) => Number(b.out_qty) > 0
      );
      if (!minOutRows.length) {
        toast.error("Please enter Out Qty for at least one MIN row");
        throw new Error("MIN out qty required");
      }
      bid = addid ? values.billingid : billid;
      setLoading("fetch");
      const cddata = {
        header: {
          billingaddrid: bid,
          billingaddr: values.billingaddress,
          transaction_id: data.transactionId,
          dispatchfromaddrid: values.dispatchid,
          dispatchfromaddr: values.shippingaddress,
          dispatchfrompincode: "",
          dispatchfromgst: "",
          vehicle: values.vn,
          clientbranch: values.clientbranch,
          clientaddress: values.address,
          eway_no: values.nature,
          ship_doc_no: values.pd,
          other_ref: values.or,
        },
        material: {
          product: dataProductdetails.value,
          secondary_product: values.components[0].secondary_productId,
          qty: values.components[0].qty,
          rate: values.components[0].rate,
          picklocation: values.components[0].pickuplocation,
          hsncode: values.components[0].hsncode,
          gst_rate: values.components[0].gstRate,
          sku_desc: values.components[0].productdescription,
          remark: values.components[0].description,
          insert_dt: values.insertDate,
        },
        component: minOutRows.map((r) => r.component_key),
        doc_id: minOutRows.map((r) => r.min_id),
        doc_date: minOutRows.map((r) => r.min_date),
        out_qty: minOutRows.map((r) => r.out_qty),
        out_rate: minOutRows.map((r) => r.min_rate),
      };
      const response = await saveCreateShipment(cddata);
      if (response.data.status === "success") {
        toast.success(response.data.message);
        resetState();
        close();
      } else {
        toast.error(response.data.message.msg);
      }
    } catch (error) {
      if (error?.errorFields?.length) {
        toast.error(
          error.errorFields[0]?.errors?.[0] || "Please fill required fields"
        );
      } else {
        toast.error(
          error?.response?.data?.message?.msg ||
            error?.message ||
            "Failed to create shipment"
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getComponentOptions = async (inputValue) => {
    setLoading("select");
    const { data: res } = await getProductByNameAndNo(inputValue);
    setLoading(false);
    if (res) {
      setAsyncOptions(res.map((row) => ({ text: row.text, value: row.id })));
    } else {
      toast.error("Some error occured wile getting components");
    }
  };

  const createRMChallan = async () => {
    try {
      const values = await challanForm.validateFields();
      const minOutRows = (Array.isArray(minRows) ? minRows : []).filter(
        (b) => Number(b.out_qty) > 0
      );
      if (!minOutRows.length) {
        toast.error("Please enter Out Qty for at least one MIN row");
        throw new Error("MIN out qty required");
      }

      const cddata = {
        product_id: data.productId,
        header: {
          billingaddrid: values.billingid,
          billingaddr: values.billingaddress,
          transaction_id: data.transactionId,
          dispatchfromaddrid: values.dispatchid,
          dispatchfromaddr: values.shippingaddress,
          dispatchfrompincode: values.dispatchfrompincode,
          dispatchfromgst: values.dispatchfromgst,
          vehicle: values.vn,
          clientbranch: values.clientbranch,
          clientaddress: values.address,
          other_ref: values.or,
          ship_doc: values.pd,
          eway_no: values.nature,
          insert_dt: values.insertDate,
        },
        material: {
          component: values.components.map((r) => r.componentKey),
          qty: values.components.map((r) => r.qty),
          rate: values.components.map((r) => r.rate),
          picklocation: values.components.map((r) => r.pickuplocation),
          hsncode: values.components.map((r) => r.hsn),
          remark: values.components.map((r) => r.description),
        },
        component: minOutRows.map((r) => r.component_key),
        doc_id: minOutRows.map((r) => r.min_id),
        doc_date: minOutRows.map((r) => r.min_date),
        out_qty: minOutRows.map((r) => r.out_qty),
        out_rate: minOutRows.map((r) => r.min_rate),
      };
      const editPayload = {
        shipment_id: values.components[0].shipment_id,
        wo_id: values.components[0].woId,
        header: {
          clientadd_id: values.components[0].clientbranchid,
          clientaddress: values.address,
          eway_no: values.nature,
          ship_doc_no: values.pd,
          vehicle: values.vn,
          other_ref: values.or,
          billingid: values.billingid,
          billingaddress: values.billingaddress,
          dispatchid: values.dispatchid,
          dispatchaddress: values.shippingaddress,
          challan_remark: values.challanRemark,
        },
        material: {
          id: values.components.map((r) => r.materialRowId),
          component: values.components.map((r) => r.productKey),
          qty: values.components.map((r) => r.qty),
          rate: values.components.map((r) => r.rate),
          hsncode: values.components.map((r) => r.hsn),
          remark: values.components.map((r) => r.description),
        },
        min_out: {
          id: minRows.map((r) => r.rowId),
          comp: minRows.map((r) => r.component_key),
          qty: minRows.map((r) => r.out_qty),
        },
      };

      let response;
      if (editShipment === "editReturn") {
        response = await updateWO_ReturnShipment(editPayload);
      } else {
        response = await saveCreateReturnChallan(cddata);
      }

      if (response.data.code === 200) {
        toast.success(response.data.message);
        resetState();
        close();
      } else {
        toast.error(response.data.message.msg);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculation = (fieldName, watchValues) => {
    const { qty, rate, gstRate } = watchValues;
    const value = +Number(qty ?? 0) * +Number(rate ?? 0).toFixed(3);
    const gstAmount = (+Number(value).toFixed(3) * +Number(gstRate)) / 100;
    let cgst = 0,
      igst = 0,
      sgst = 0;

    if (gstType === "L" && gstRate) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      igst = undefined;
    } else if (gstType === "I" && gstRate) {
      igst = gstAmount;
      cgst = undefined;
      sgst = undefined;
    }
    challanForm.setFieldValue(
      ["components", fieldName, "value"],
      +Number(value).toFixed(3)
    );
    challanForm.setFieldValue(
      ["components", fieldName, "cgst"],
      +Number(cgst).toFixed(3)
    );
    challanForm.setFieldValue(
      ["components", fieldName, "sgst"],
      +Number(sgst).toFixed(3)
    );
    challanForm.setFieldValue(
      ["components", fieldName, "igst"],
      +Number(igst).toFixed(3)
    );
  };

  const toggleInputType = (e) => setUploadType(e.target.value);

  return {
    challanForm,
    test,
    loading,
    closeDrawer,
    uplaodType,
    setUploadType,
    toggleInputType,
    stage,
    previewuploaData,
    previewData,
    gstType,
    setgstType,
    setaddid,
    setdaddid,
    addOptions,
    challantitle,
    locationlist,
    setlocationlist,
    getLocationList,
    calculation,
    getComponentOptions,
    asyncOptions,
    setAsyncOptions,
    inputHandler,
    minRows,
    removeRow,
    rows,
    componentsLoading,
    syncOutQty,
    getComponentDetails,
    updateDeliveryChallan,
    updateRmChallan,
    showSubmitConfirmationModal,
    showReturnSubmitConfirmationModal,
  };
};

export default useCreateChallanModal;
