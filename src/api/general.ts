import { ResponseType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";
import { imsAxios } from "../axiosInterceptor";

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
export const fetchLocations = async (search) => {
  const response = await imsAxios.post("/backend/fetchLocation", {
    searchTerm: search,
  });
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
