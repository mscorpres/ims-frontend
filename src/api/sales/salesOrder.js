import { imsAxios } from "../../axiosInterceptor";

export const getSalesOrders = async (wise, data) => {
  const response = await imsAxios.post("/sellRequest/fetchSellRequestList", {
    wise,
    data,
  });

  return response;
};

export const getOrderDetails = async (orderId) => {
  const response = await imsAxios.post("/sellRequest/fetchData4Update", {
    sono: orderId,
  });

  return response;
};

export const createOrder = async (payload) => {
  const response = await imsAxios.post(
    "/sellRequest/createSellRequest",
    payload
  );
  return response;
};
export const updateOrder = async (payload) => {
  const response = await imsAxios.post("/sellRequest/soDataUpdate", payload);
  return response;
};
export const cancelTheSelectedSo = async (values) => {
  const response = await imsAxios.post("/sellRequest/CancelSO", {
    so: values.so,
    remark: values.remarks,
  });
  return response;
};
export const listOfShipment = async (searchTerm, wise) => {
  const response = await imsAxios.post(
    "/so_challan_shipment/fetchSalesOrderShipmentlist",
    {
      wise: wise,
      data: searchTerm,
    }
  );
  return response;
};
export const getUpdateShipmentDetails = async (searchTerm) => {
  const response = await imsAxios.post(
    "/so_challan_shipment/fetchShipmentforUpdate",
    {
      shipment_id: searchTerm,
    }
  );
  return response;
};
export const getChallanList = async (wise, searchTerm) => {
  const response = await imsAxios.post(
    "/so_challan_shipment/fetchDeliveryChallan",
    {
      data: searchTerm,
      wise: wise,
    }
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      date: row.delivery_challan_dt,
      challanId: row.so_challan_id,
      clientCode: row.client_code,
      client: row.client,
      billingAddress: row.billingaddress,
      shippingAddress: row.shippingaddress,
    }));
  }
  response.data = arr;
  return response;
};
export const getCourierList = async (search) => {
  console.log("search", search);
  const response = await imsAxios.post(
    "/so_challan_shipment/fetchCourierList",
    {
      courier: search.courier,
    }
  );
  let arr = [];
  // console.log("response------", response);
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,

      shippingAddress: row.shippingaddress,
      courierName: row.courier_name,
      client: row.client,
      deliveryChallanDt: row.delivery_challan_dt,
      challanId: row.so_challan_id,
      clientaddress: row.clientaddress,
      billingaddress: row.billingaddress,
      soChallanId: row.so_challan_id,
    }));
  }
  response.data = arr;
  return response;
};

export const printOrder = async (orderId) => {
  const payload = {
    so_id: orderId,
  };
  const response = await imsAxios.post("/sellRequest/printSellOrder", payload);
  return response;
};

export const createChallanFromSo = async (shipments, remark) => {
  let payload = {
    shipment_id: shipments.map((r) => r.shipmentId),
    so_id: shipments.map((r) => r.orderId),
    client_id: shipments[0].clientCode,
    client_addr_id: shipments[0].clientAddressId,
    bill_id: shipments[0].billingId,
    ship_id: shipments[0].shippingId,
    remark: remark,
  };
  const response = await imsAxios.post(
    "/so_challan_shipment/createDeliveryChallan",
    payload
  );
  return response;
};
export const cancelChallanFromSo = async (singleRow, remark) => {
  console.log("singlerwo", singleRow);
  let payload = {
    so_shipment_id: singleRow.shipment_id,
    remark: remark,
  };

  console.log("payload", remark);
  const response = await imsAxios.post(
    "/so_challan_shipment/cancelSOshipment",
    payload
  );
  return response;
};

export const createShipment = async (values, open, details) => {
  const payload = {
    header: {
      bill_id: values.billingId,
      bill_addr: values.billingAddress,
      so_id: open,
      ship_id: values.shippingId,
      ship_addr: values.shippingAddress,
      vehicle_no: values.vehicleNo,
      eway_no: values.eWayBillNo,
      other_ref: values.otherRef,
      ship_pan: details.shipping.pan,
      ship_gstin: details.shipping.gst,
    },
    material: {
      item: values.products.map((row) => row.productKey),
      qty: values.products.map((row) => row.qty),
      rate: values.products.map((row) => row.rate),
      picklocation: values.products.map((row) => row.pickLocation),
      hsncode: values.products.map((row) => row.hsn),
      remark: values.products.map((row) => row.remark),
    },
  };
  const response = await imsAxios.post(
    "/so_challan_shipment/saveSOShipment",
    payload
  );
  return response;
  // console.log("this is the values", payload);
};

export const fetchShipmentDetails = async (shipmentId) => {
  const payload = {
    so_shipment_id: shipmentId,
  };
  const response = await imsAxios.post(
    "/so_challan_shipment/fetchSOShipmentDetails",
    payload
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      partCode: row.item_code,
      component: row.item_name,
      hsn: row.hsn,
      pickLocation: row.item_pick_location_name,
      pickLocationKey: row.item_pick_location,
      rate: row.price,
      qty: row.qty,
      remark: row.remark,
    }));
  }
  response.data = arr;
  return response;
};

export const getChallanDetails = async (challanId) => {
  const payload = {
    challan_id: challanId,
  };
  const response = await imsAxios.post(
    "/so_challan_shipment/getDeliveryChallanDetails",
    payload
  );
  let arr = [];
  let obj = {};
  if (response.success) {
    const first = response.data[0];
    arr = response.data.map((row, index) => ({
      id: index + 1,
      orderId: row.so_id,
      shipmentId: row.shipment_id,
      partCode: row.item_part_no,
      component: row.item_name,
      componentKey: row.item_id,
      rate: row.item_rate,
      qty: row.item_qty,
      remark: row.remark,
    }));

    obj = {
      clientCode: first.client_code,
      client: first.client,
      clientAddress: first.clientaddress,
      billingAddress: first.billingaddress,
      shippingAddress: first.shippingaddress,
    };
  }
  response.data = { components: arr, details: obj };
  return response;
};
export const updateShipment = async (
  values,
  open,
  updateShipmentRow,
  details
) => {
  let billId;
  if (values?.billingId?.id) {
    billId = values?.billingId?.id;
  } else {
    billId = values?.billingId;
  }
  const payload = {
    headers: {
      bill_id: billId,
      bill_addr: values.billingAddress,
      so_shipment_id: open,
      ship_id: values.shippingId,
      ship_addr: values.shippingAddress,
      vehicle_no: values.vehicleNo,
      eway_no: values.eWayBillNo,
      other_ref: values.otherRef,
      so_id: updateShipmentRow?.so_id,
      ship_pan: details.shipping_info.pan,
      ship_gstin: details.shipping_info.gst,
    },
    materials: {
      updaterow: values.products.map((row) => row.updaterow.toString()),
      item: values.products.map((row) => row.productKey),
      qty: values.products.map((row) => row.qty),
      rate: values.products.map((row) => row.rate),
      // picklocation: values.products.map((row) => row.pickLocation),
      hsn: values.products.map((row) => row.hsn),
      remark: values.products.map((row) => row.remark),
    },
  };
  // // return;
  const response = await imsAxios.post(
    "/so_challan_shipment/updateSOshipment",
    payload
  );
  return response;
  // console.log("this is the values", payload);
};
