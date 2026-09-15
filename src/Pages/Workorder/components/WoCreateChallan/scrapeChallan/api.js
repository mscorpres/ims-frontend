import { imsAxios } from "../../../../../axiosInterceptor";

export { submitScrapreChallan } from "../../api";

export const getScrapeChallanDetails = (challan_no) =>
  imsAxios.post("/wo_challan/editWO_ScrapChallan", { challan_no });

export const updateScrapeChallan = (payload) =>
  imsAxios.post("/wo_challan/updateWO_ScrapChallan", payload);
