import { imsAxios } from "../../axiosInterceptor";

export const getComponentList = async () => {};

export const downloadComponentMaster = async () => {
  const response = await imsAxios.get("/component/compMasterReport");
  return response;
};
export const downloadServiceMaster = async () => {
  const response = await imsAxios.get("/component/serviceMasterReport");
  return response;
};

export const getAlternativePartCodes = async (componentKey) => {
  const response = await imsAxios.post("/component/fetchalternatePartcode", {
    componentKey,
  });

  console.log("aternate code response", response);
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      partCode: row.alternatepartCode,
      componentKey: row.alternatepartKey,
      component: row.alternatepartName,
      added: true,
    }));
  }

  response.data = arr;
  return response;
};
