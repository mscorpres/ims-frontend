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

export const printOrder = async (orderId) => {
  const payload = {
    so_id: orderId,
  };
  const response = await imsAxios.post("/sellRequest/printSellOrder", payload);
  return response;
};

export const createShipment = async (values) => {
  const payload = {
    header: {
      bill_id: values.billingId,
      bill_addr: values.billingAddress,
      so_id: "SO/23-24/0022",
      ship_id: values.shippingId,
      ship_addr: values.shippingAddress,
      vehicle_no: values.vehicleNo,
      eway_no: values.eWayBillNo,
      other_ref: values.otherRef,
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
  console.log("this is the values", payload);
};
