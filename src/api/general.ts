import { ResponseType, SelectOptionType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";
import { imsAxios } from "../axiosInterceptor";
import { RowProps } from "antd";
import { toast } from "react-toastify";

export const getVendorOptions = async (search) => {
  console.log("here", search);
  try {
    const response = await imsAxios.post("/backend/vendorList", {
      search,
    });
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const createJobWorkReq = async (finalObj) => {
  try {
    const response = await imsAxios.post("/jobwork/createJobWorkReq", finalObj);
    if(response.code == 500) toast.error(response?.message?.msg);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const saveJwMAterialIssue = async (finalObj) => {
  try {
    const response = await imsAxios.post(
      "/jobwork/save_jw_material_issue",
      finalObj
    );
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const checkInvoiceforMIN = async (payload) => {
  try {
    const response = await imsAxios.post("/backend/checkInvoice", payload);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const poMINforMIN = async (final) => {
  try {
    const response = await imsAxios.post("/purchaseOrder/poMIN", final);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};

export const poMINforImport = async (final) => {
  try {
    const response = await imsAxios.post("/purchaseOthers/poMINImport", final);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const savefginward = async (final) => {
  try {
    const response = await imsAxios.post("/fgMIN/savefginward", final);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const getBomItem = async (finalObj) => {
  try {
    const response = await imsAxios.post("/jobwork/getBomItem", finalObj);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const savejwsfinward = async (finalObj) => {
  try {
    const response = await imsAxios.post("/jobwork/savejwsfinward", finalObj);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const saveCreateChallan = async (final) => {
  try {
    const response = await imsAxios.post("/jobwork/saveCreateChallan", final);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const uplaodFileInJWReturn = async (formdata) => {
  try {
    const response = await imsAxios.post("/jobwork/upload/item ", formdata);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const uplaodFileInMINInward = async (formdata) => {
  try {
    const response = await imsAxios.post("transaction/upload/item", formdata);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};

export const uploadPOExportFile = async (formdata) => {
  try {
    const response = await imsAxios.post("purchaseOthers/uploadPoFile", formdata);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};
export const getVendorBranchOptions = async (vendorCode) => {
  const response = await imsAxios.post("/backend/vendorBranchList", {
    vendorcode: vendorCode,
  });

  return response;
};
export const getVendorBranchDetails = async (vendorCode, branchCode) => {
  const response = await imsAxios.post("/backend/vendorAddress", {
    branchcode: branchCode,
    vendorcode: vendorCode,
  });
  return response;
};
export const getCostCentresOptions = async (search) => {
  const response = await imsAxios.post("/backend/costCenter", {
    search,
  });
  return response;
};

export const getUsersOptions = async (search) => {
  const response = await imsAxios.post("/backend/fetchAllUser", {
    search,
  });

  return response;
};

export const getBillingAddressDetails = async (addressCode) => {
  const response = await imsAxios.post("/backend/billingAddress", {
    billing_code: addressCode,
  });

  return response;
};
export const getBillingAddressOptions = async () => {
  const response = await imsAxios.post("/backend/billingAddressList", {
    search: "",
  });

  return response;
};

export const getShippingAddressOptions = async () => {
  const response = await imsAxios.post("/backend/shipingAddressList", {
    search: "",
  });

  return response;
};

export const getClientShippingOptions = async (clientCod) => {
  const response = await imsAxios.post("/backend/shipingAddressList", {
    search: "",
  });

  return response;
};

export const getProjectOptions = async (search) => {
  const response = await imsAxios.post("/backend/poProjectName", {
    search,
  });

  let arr = [];
  arr = convertSelectOptions(response.data ?? []);
  response.data = arr;
  return response;
};

export const getProjectDetails = async (projectId) => {
  const response = await imsAxios.post("/backend/projectDescription", {
    project_name: projectId,
  });
  return response;
};

export const getComponentOptions = async (search) => {
  const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    search,
  });
  // console.log("response", response);
  return response;
};
export const updateAlternatePartCode = async (alternativeArr, basePartCode) => {
  const response = await imsAxios.post("/component/update_alt_part_no", {
    componentKey: basePartCode,
    alt_part_key: alternativeArr,
  });
  return response;
};
export const fetchLocations = async (search, type?: "sf") => {
  let url = "/backend/fetchLocation";
  switch (type) {
    case "sf":
      url = "/godown/fetchLocationForSF2SF_from";
      break;
  }
  const response = await imsAxios.post(url, {
    searchTerm: search,
  });

  if (response.data.code === 200) {
    return {
      success: true,
      data: response.data.data,
    };
  }
  return response;
};
export const getProductsOptions = async (search: string, sku?: boolean) => {
  let url;
  if (sku) {
    url = "/backend/fetchProduct";
  } else {
    url = "/backend/getProductByNameAndNo";
  }

  const response = await imsAxios.post(url, {
    search,
    searchTerm: search,
  });
  let arr = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }

  if (response?.data.length) {
    arr = convertSelectOptions(response.data);
  }
  response.data = arr;

  return response;
};

///Query  6
export const getClosingStockForQuery6 = async (search) => {
  const response = await imsAxios.post(
    "/closing_stock/save_closing_stock_cif",
    {
      date: search,
    }
  );

  let arr = [];
  // if (response.success) arr = convertSelectOptions(response.data);
  // response.data = arr;
  return response;
};
export const getComponentDetail = async (componentKey, vendorCode) => {
  const response = await imsAxios.post("/component/getComponentDetailsByCode", {
    component_code: componentKey,
    vendorCode,
  });

  return response;
};

export const getMINOptions = async (search) => {
  const response = await imsAxios.post("/qrLabel/getMinsTransaction", {
    searchTerm: search,
  });

  let arr = [];
  if (response.data.code === 200) {
    arr = convertSelectOptions(response.data.data);
  }
  response.data = arr;
  return response;
};

export const getHsnOptions = async (search: string) => {
  const response: ResponseType = await imsAxios.post("/backend/searchHsn", {
    searchTerm: search,
  });

  let arr = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }
  response.data = arr;
  return response;
};

export const getComponentStock = async (componentKey: string, type: "rm") => {
  if (type === "rm") {
  }
  const response = await imsAxios.post("/minBoxLablePrint/getComponetQty", {
    component: componentKey,
  });

  if (response.success) {
    response.data = response.data.stock;
  }

  return response;
};

export const getUserOptions = async (search: string) => {
  const response = await imsAxios.post("/backend/fetchAllUser", {
    search,
  });

  if (Array.isArray(response.data)) {
    response.data = convertSelectOptions(response.data);
  }

  return response;
};
export const getUomOptions = async () => {
  const response: ResponseType = await imsAxios.post("/uom/uomSelect2");

  response.data = convertSelectOptions(response.data ?? []);

  return response;
};
export const getPprOptions = async (search: string) => {
  const response = await imsAxios.post("/createqca/getPprNo", {
    searchTerm: search,
  });

  response.data = convertSelectOptions(response.data ?? []);

  return response;
};
export const deleteQcaRows = async (payload) => {
  const response = await imsAxios.post(
    "/createqca/delete_testing_data",
    payload
  );

  response.data = convertSelectOptions(response.data ?? []);

  return response;
};
export const getComponentMfgCodeAndType = async (components: string[]) => {
  const response: ResponseType = await imsAxios.post("/backend/checkMPN", {
    search: components,
  });

  let arr = [];

  if (response.success) {
    arr = response.data.map((row) => ({
      mfgCode: row.manufacturingCode,
      category: row.category,
      key: row.componentKey,
    }));
  }

  response.data = arr;
  return response;
};

export const getComponenentAndProduct = async (search: string) => {
  const response: ResponseType = await imsAxios.post(
    "/backend/getFGRMByNameAndNo",
    {
      search,
      searchTerm: search,
    }
  );

  let arr: SelectOptionType[] = [];
  if (response.success) {
    arr = response.data.map((row) => ({
      text: row.text,
      value: row.id,
      type: row.type,
    }));
  }
  response.data = arr;

  return response;
};
