import { imsAxios } from "../../axiosInterceptor";

export const getComponentList = async () => {};

export const downloadComponentMaster = async () => {
  const response = await imsAxios.get("/component/compMasterReport");
  return response;
};
