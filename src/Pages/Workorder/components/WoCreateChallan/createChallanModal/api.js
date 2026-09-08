import { imsAxios } from "../../../../../axiosInterceptor";

export { postUpdatedWo } from "../../api";

export const previewExcelShipmentData = (formData) =>
  imsAxios.post("/wo_challan/previewExcelShipmentData", formData);

export const fetchLocation = (searchTerm) =>
  imsAxios.post("/backend/fetchLocation", { searchTerm });

export const editWorkorderDeliveryChallan = (challan_no) =>
  imsAxios.post("/wo_challan/editWorkorderDeliveryChallan", { challan_no });

export const editWorkorderChallan = (challan_no) =>
  imsAxios.post("/wo_challan/editWorkorderChallan", { challan_no });

export const updateWO_DeliveryChallan = (payload) =>
  imsAxios.post("/wo_challan/updateWO_DeliveryChallan", payload);

export const updateWO_ReturnChallan = (payload) =>
  imsAxios.post("wo_challan/updateWO_ReturnChallan", payload);

export const editWorkorderShipment = (shipment_no) =>
  imsAxios.post("/wo_challan/editWorkorderShipment", { shipment_no });

export const fetchReturnEdit = (shipment_no) =>
  imsAxios.post("/wo_challan/fetchReturn_edit", { shipment_no });

export const fetchWoMins = (wo_id) =>
  imsAxios.post("/createwo/fetch_wo_mins", { wo_id });

export const fetchComponentListForWO = (skucode, wo_transaction) =>
  imsAxios.post("/createwo/fetchComponentListforWO", { skucode, wo_transaction });

export const fetchProductData = (product_key) =>
  imsAxios.post("/createwo/fetchProductData", { product_key });

export const fetchClientDetail = (code) =>
  imsAxios.post("/backend/fetchClientDetail", { code });

export const saveShipmentThroughExcel = (formData) =>
  imsAxios.post("/wo_challan/saveShipmentthroughExcel", formData);

export const saveCreateShipment = (payload) =>
  imsAxios.post("/wo_challan/saveCreateShipment", payload);

export const getProductByNameAndNo = (search) =>
  imsAxios.post("/backend/getProductByNameAndNo", { search });

export const updateWO_ReturnShipment = (payload) =>
  imsAxios.post("/wo_challan/updateWO_ReturnShipment", payload);

export const saveCreateReturnChallan = (payload) =>
  imsAxios.post("wo_challan/saveCreateReturnChallan", payload);
