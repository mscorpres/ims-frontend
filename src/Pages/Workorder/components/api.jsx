import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { v4 } from "uuid";

////////
const getValueInArray = (arr, name) => {
  const updatedArr = arr.map((row) =>
    row[name]?.value ?? row[name] === "" ? 0 : row[name] ?? "--"
  );
  return updatedArr;
};
const getFinalizeComponents = async (id, woId, getComponents) => {
  const { data } = await imsAxios.post("/createwo/allbomcomponents", {
    subject_id: id,
    wo_id: woId,
    getComponents: getComponents ?? true,
  });
  if (data) {
    const { components, details } = data;

    const arr = components.map((row, index) => ({
      index: index + 1,
      component: row.component_name,
      partCode: row.component_part_no,
      componentKey: row.component_key,
      qty: row.quantity,
      unit: row.unit,
    }));
    const detailsObj = {
      orderedQty: details.requiredqty,
      bom: details.bom_name,
      productName: details.skuname + " / " + details.skucode,
      createdBy: details.created_by,
      client: details.client,
      woId: details.woid,
      status: details.wo_status === "A" && "Active",
      createdDate: details.date,
    };

    return {
      components: arr,
      details: detailsObj,
    };
  }
};
const getClientOptions = async (search) => {
  const { data } = await imsAxios.post("/backend/getClient", {
    searchTerm: search,
  });
  if (data && data?.data?.length) {
    const arr = data.data.map((row) => ({
      text: row.name,
      value: row.code,
    }));

    return arr;
  }
};
const getSKUOptions = async (search) => {
  const { data } = await imsAxios.post("/backend/getProductByNameAndNo", {
    search: search,
  });
  if (data && data?.length) {
    const arr = data.map((row) => ({
      text: row.text,
      value: row.id,
    }));

    return arr;
  }
};

const getWorkOrderAnalysis = async (wise, searchInput) => {
  const { data } = await imsAxios.post("/createwo/fetch_WorkOrder", {
    wise,
    data: searchInput,
  });
  if (data) {
    if (data.code === 200) {
      const arr = data.data.map((row, index) => ({
        id: index + 1,
        date: row.date,
        status: row.bom_recipe,
        client: row.client,
        clientCode: row.clientcode,
        requiredQty: row.requiredqty,
        productId: row.sku,
        sku: row.skucode,
        product: row.skuname,
        transactionId: row.wo_sku_transaction,
        bomid: row.bom_id,
        shipaddress: row.shippingaddress,
        billaddress: row.billingaddress,
        clientaddress: row.clientaddress,
        clientAddressId: row.clientAddressId,
        // hsn: row.hsn_code,
      }));
      return arr;
    } else {
      toast.error(data.message.msg);
      return [];
    }
  }
};
const postUpdatedWo = async (datas) => {
  const response = await imsAxios.post("/wo_challan/updateWO_Shipment", datas);
  const { data } = response;
  if (data.code === 200) {
    toast.success(data.message);
  } else {
    toast.error(data.message.msg);
  }
};
const getWorkOrderShipment = async (wise, searchInput) => {
  const { data } = await imsAxios.post("/wo_challan/getWorkOrderShipment", {
    wise,
    data: searchInput,
  });
  //shipment added
  if (data) {
    if (data.code === 200) {
      const arr = data.data.map((row, index) => ({
        id: index + 1,
        shipmentDt: row.shipment_dt,
        woTransaction_Id: row.wo_transaction_id,
        woshipmentId: row.shipment_id,
        shipmentId: row.shipment_id,
        sku: row.sku,
        skuCode: row.sku_code,
        client: row.client,
        clientCode: row.client_code,
        clientaddress: row.clientaddress,
        client_add_id: row.client_add_id,
        billingaddress: row.billingaddress,
        billing_id: row.billing_id,
        dispatchaddress: row.dispatchaddress,
        dispatchId: row.dispatch_id,
        wo_sku_name: row.wo_sku_name,
        wo_order_qty: row.wo_order_qty,
        wo_order_rate: row.wo_order_rate,
        del_challan_status: row.del_challan_status,
        shipment_status: row.shipment_status,
      }));
      return arr;
    } else {
      toast.error(data.message.msg);
      return [];
    }
  }
};

///
const getWorkOrderRC = async (wise, searchInput) => {
  const { data } = await imsAxios.post(
    "/wo_challan/getWorkOrderReturnShipment",
    {
      wise,
      data: searchInput,
    }
  );
  if (data) {
    if (data.code === 200) {
      const arr = data.data.map((row, index) => ({
        id: index + 1,
        billingId: row.billing_id,
        dispatchId: row.dispatch_id,
        clientAddId: row.client_address_id,
        shipmentDt: row.shipment_dt,
        woTransaction_Id: row.wo_transaction_id,
        shipmentId: row.shipment_id,
        partCode: row.part_code,
        skuCode: row.sku_code,
        wo_sku_name: row.wo_sku_name,
        client: row.client,
        clientCode: row.client_code,
        clientaddress: row.clientaddress,
        shipment_status: row.shipment_status,
        del_challan_status: row.del_challan_status,
        wo_order_qty: row.wo_order_qty,
        wo_order_rate: row.wo_order_rate,
        billingaddress: row.billingaddress,
        woComponentName: row.wo_component_name,
        // client_add_id: row.client_add_id,
        // billing_id: row.billing_id,
        // dispatchaddress: row.dispatchaddress,
        // dispatchId: row.dispatch_id,
      }));
      return arr;
    } else {
      toast.error(data.message.msg);
      return [];
    }
  }
};
const getdetailsOfReturnChallan = async (shipWoid) => {
  const { data } = await imsAxios.post("/wo_challan/fetchWOShipmentDetails", {
    wo_shipment_id: shipWoid,
  });
  if (data.code === 200) {
    const arr = data.data.map((row, index) => ({
      ...row,
      id: index + 1,
    }));
    return arr;
  } else {
    toast.error(data.message.msg);
    return [];
  }
};
const fetchReturnChallanDetails = async (challanID) => {
  const { data } = await imsAxios.post(
    "/wo_challan/fetchReturnDeliveryChallanDetails",
    {
      challan_id: challanID,
    }
  );
  if (data.code === 200) {
    const arr = data.data.map((row, index) => ({
      ...row,
      id: index + 1,
    }));
    return arr;
  } else {
    toast.error(data.message.msg);
    return [];
  }
};

const getReturnRowsInViewChallan = async (wise, searchInput) => {
  const { data } = await imsAxios.post(
    "/wo_challan/fetchReturnDeliveryChallan",
    {
      wise,
      data: searchInput,
    }
  );
  if (data.code === 200) {
    const arr = data.data.map((row, index) => ({
      ...row,
      id: index + 1,
    }));
    return arr;
  } else {
    toast.error(data.message.msg);
    return [];
  }
};
const getScrapeInViewChallan = async (wise, searchInput) => {
  const { data } = await imsAxios.post("/wo_challan/fetchScrapChallanlist", {
    wise,
    data: searchInput,
  });
  if (data.code === 200) {
    const arr = data.data.map((row, index) => ({
      ...row,
      id: index + 1,
    }));
    return arr;
  } else {
    toast.error(data.message.msg);
    return [];
  }
};

const createWorkOrderShipmentChallan = async (payload) => {
  const { data } = await imsAxios.post(
    "/wo_challan/createDeliveryChallan",
    payload
  );
  console.log("data", data);
  if (data) {
    if (data.code === 200) {
      toast.success(data.message);
    } else {
      toast.error(data.message.msg);
    }
  }
};

const printreturnChallan = async (payload) => {
  const { data } = await imsAxios.post(
    "/wo_challan/printWorkorderReturnChallan",
    payload
  );
  console.log("data", data);
  return data;
};
const createWorkOrderReturnChallan = async (payload) => {
  const { data } = await imsAxios.post(
    "/wo_challan/createDeliveryReturnChallan",
    payload
  );
  if (data) {
    if (data.code === 200) {
      toast.success(data.message);
    } else {
      toast.error(data.message.msg);
    }
  }
};
const getWorkOrderForMIN = async (id, woId, getComponents) => {
  const { data } = await imsAxios.post("/backend/workOrderdetails", {
    subject_id: id,
    wo_id: woId,
    getComponents: getComponents,
  });
  if (data) {
    const { components, details } = data;
    const arr = components.map((row, index) => ({
      index: index + 1,
      componentKey: row.component_key,
      component: row.c_name,
      partCode: row.c_part_no,
      qty: row.qty,
      id: v4(),
      rate: "",
      qty: "",
      value: "",
      sgst: "",
      igst: "",
      cgst: "",
      gstRate: "",
    }));
    const detailsObj = {
      orderedQty: details.requiredqty,
      bom: details.bom_name,
      productName: details.skuname + " / " + details.skucode,
      createdBy: details.created_by,
      client: details.client,
      woId: details.woid,
      status: details.wo_status === "A" && "Active",
      createdDate: details.date,
    };
    return {
      components: arr,
      details: detailsObj,
    };
  } else {
    return [];
  }
};

const getLocationOptions = async () => {
  const { data } = await imsAxios.post("/backend/fetchLocation");
  if (data) {
    if (data.length) {
      const arr = data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      return arr;
    } else {
      return [];
    }
  }
};

const createMIN = async (values, showView) => {
  const arr = values.components.filter((r) => r.qty > 0);
  const finalObj = {
    woid: showView.woId,
    component: getValueInArray(arr, "componentKey"),
    qty: getValueInArray(arr, "qty"),
    rate: getValueInArray(arr, "rate"),
    gstrate: getValueInArray(arr, "gstRate"),
    remark: getValueInArray(arr, "remark"),
    gsttype: arr.map(() => values.gstType),
    hsncode: getValueInArray(arr, "hsn"),
    location: getValueInArray(arr, "location"),
    // doc_id: arr.map(() => values.invoiceId),
    doc_id: values.invoiceId,
    doc_date: values.docDate,
    ewaybill: values.eway,
  };
  // return;
  const response = await imsAxios.post("/createwo/woMIN", finalObj);
  const { data } = response;
  // console.log("data", data);
  if (data.code === 200) {
    toast.success(data.message);
    return data;
  } else {
    toast.error(data.message.msg);
  }
};

const printWorkOrder = async (woId, action) => {
  try {
    const { data } = await imsAxios.post("/createwo/print_wo_analysis", {
      transaction: woId,
    });
    if (data) {
      if (data.code === 200) {
        const bufferData = data.data.buffer.data;
        console.log(bufferData);
        if (action === "print") {
          printFunction(bufferData);
        } else if (action === "download") {
          downloadFunction(bufferData, woId);
        }
      }
    }
  } catch (error) {
    console.log("some error occured while printing work order", error);
  }
};
const closeWorkOrder = async (woId, sku, remarks) => {
  try {
    const { data } = await imsAxios.post("/createwo/close_WO", {
      skucode: sku,
      transaction: woId,
      remark: remarks,
    });
    if (data.code === 200) {
      return {
        status: "success",
        message: data.message,
      };
    } else {
      return { status: "fail", message: data.message.msg ?? data.message };
    }
  } catch (error) {
    console.log("some error occured while closing work order", error);
    return { status: "fail", message: "Some error while canelling work order" };
  }
};
const getWorkOrderDetails = async (id, woId, sku) => {
  try {
    const { details } = await getWorkOrderForMIN(id, woId, false);
    const { data: componentsData } = await imsAxios.post(
      "/createwo/fetchComponentListforWO",
      {
        wo_transaction: woId,
        skucode: sku,
      }
    );
    if (componentsData) {
      const { data: components } = componentsData;
      const arr = components.map((row, index) => ({
        id: index + 1,
        partCode: row.part_code,
        newPartCode: row.new_part_code,
        unit: row.bom_uom,
        bomQty: row.bom_qty,
        reqQty: row.required_qty,
        rmRtnQty: row.rm_return_qty,
        receivedQty: row.received_qty,
        shortAccessQty: row.pending_qty,
        consumedQty: row.comsump_qty,
        pendingQtyWO: row.p_with_wo,
        outValue: row.out_value,
        inValue: row.in_value,
        rmRtnValue: row.rm_rtn_value,
        component: row.component_name + "-" + row.new_part_code,
        componentKey: row.component_key,
        hsn: row.component_hsn,
      }));

      return {
        components: arr,
        details,
      };
    }
  } catch (error) {
    console.log("error while getting wo details", error);
  }
};
const finalizeOrder = async (values, woId) => {
  let finalObj = {
    component: values.components.map((row) => row.componentKey),
    bom_qty: values.components.map((row) => row.qty),
    wo_trans_id: woId.woId,
  };

  const response = await imsAxios.post(
    "/createwo/save_wo_material_received",
    finalObj
  );

  const { data } = response;
  if (data) {
    if (data.code === 200) {
      toast.success(data.message);
      return {
        error: false,
      };
    } else {
      toast.error(data.message.msg);
      return {
        error: true,
      };
    }
  } else {
    return {
      error: true,
    };
  }
};
/// scrape challan added
const submitScrapreChallan = async (payload) => {
  const response = await imsAxios.post(
    "/wo_challan/saveCreateScrapChallan",
    payload
  );
  // console.log("data", response);
  return response;
};
export {
  getClientOptions,
  getWorkOrderAnalysis,
  getWorkOrderForMIN,
  getLocationOptions,
  getValueInArray,
  createMIN,
  printWorkOrder,
  closeWorkOrder,
  getSKUOptions,
  getWorkOrderDetails,
  getFinalizeComponents,
  finalizeOrder,
  getWorkOrderShipment,
  createWorkOrderShipmentChallan,
  postUpdatedWo,
  getWorkOrderRC,
  getdetailsOfReturnChallan,
  getReturnRowsInViewChallan,
  fetchReturnChallanDetails,
  createWorkOrderReturnChallan,
  printreturnChallan,
  submitScrapreChallan,
  getScrapeInViewChallan,
};
