import { HSNType } from "@/types/master";
import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "@/types/general";

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

interface GetHSNListType {
  hsncode: string;
  hsnlabel: string;
  hsntax: string;
  serial_no: number;
}

export const getHsnList = async (key: string) => {
  const response: ResponseType = await imsAxios.post("/backend/fetchHsn", {
    component: key,
  });

  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetHSNListType, index: number): HSNType => ({
        code: row.hsncode,
        label: row.hsnlabel,
        tax: row.hsntax,
      })
    );
  }

  response.data = arr;
  return response;
};

export const mapHsn = async (key: string, hsnRows: HSNType[]) => {
  const hsn = hsnRows.map((row) => row.code);
  const tax = hsnRows.map((row) => row.tax);

  const response = await imsAxios.post("/backend/mapHsn", {
    component: key,
    hsn,
    tax,
  });

  return response;
};
