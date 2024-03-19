import { imsAxios } from "../../axiosInterceptor";

const createProcess = async (values) => {
  try {
    const url = "/qaProcessmaster/insert_Process";
    const finalObj = {
      processName: values.name,
      processDesc: values.description,
    };

    const response = await imsAxios.post(url, finalObj);
    // TODO
  } catch (error) {
    console.log("error while creating process", error);
  }
};

const getAllProcesses = async () => {
  try {
    const url = "/qaProcessmaster/fetch_Process";

    const response = await imsAxios.get(url);
    const { data } = response;
    if (data && data?.data) {
      const obj = data.data.map((row, index) => ({
        id: index + 1,
        name: row.process_name,
        code: row.process_code,
        description: row.process_desc,
      }));
      return apiResponse(obj, "", true, false, false);
    } else {
      return apiResponse([], "", false, true, true);
    }
    // TODO,
  } catch (error) {
    console.log("error while fetching processes", error);
    return apiResponse([], "", false, true, true);
  }
};

const getProductOptions = async (search) => {
  try {
    const url = "/backend/fetchproduct";
    const payload = { searchTerm: search };
    const response = await imsAxios.post(url, payload);

    const { data } = response;
    if (data && data?.length) {
      const arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      return apiResponse(arr, "", true, false, false);
    } else {
      return apiResponse([], "", false, true, false);
    }
  } catch (error) {
    console.log("some error occured while fetching product options", error);
    return apiResponse([], "", false, true, false);
  }
};

const getSkuBomOptions = async (sku) => {
  try {
    const url = "/backend/fetchBomForProduct";
    const payload = { search: sku };
    const response = await imsAxios.post(url, payload);

    const { data } = response;
    if (data && data?.code === 200) {
      const arr = data.data.map((row) => ({
        text: row.bomname,
        value: row.bomid,
      }));
      return apiResponse(arr, "", true, false, false);
    } else {
      return apiResponse([], "", false, true, false);
    }
  } catch (error) {
    console.log("some error occured while fetching product bom options", error);
    return apiResponse([], "", false, true, false);
  }
};
const getSkuSfgOptions = async (sku) => {
  try {
    const url = "/backend/fetchallsfgForProduct";
    const payload = { search: sku };
    const response = await imsAxios.post(url, payload);

    const { data } = response;
    if (data && data?.code === 200) {
      const arr = data.data.map((row) => ({
        text: row.sfgsku,
        value: row.sfgid,
      }));
      return apiResponse(arr, "", true, false, false);
    } else {
      return apiResponse([], "", false, true, false);
    }
  } catch (error) {
    console.log(
      "some error occured while fetching sfg product SKU options",
      error
    );
    return apiResponse([], "", false, true, false);
  }
};
const getProcessOptions = async () => {
  try {
    const url = "/qaProcessmaster/view_process";
    const payload = {};
    const response = await imsAxios.post(url, payload);

    const { data } = response;
    if (data && data?.length) {
      const arr = data.map((row) => ({
        name: row.text,
        id: row.id,
      }));
      return apiResponse(arr, "", true, false, false);
    } else {
      return apiResponse([], "", false, true, false);
    }
  } catch (error) {
    console.log("some error occured while fetching process options", error);
    return apiResponse([], "", false, true, false);
  }
};
const getLocationOptions = async () => {
  try {
    const url = "/backend/fetchLocation";
    const payload = {};
    const response = await imsAxios.post(url, payload);

    const { data } = response;
    if (data && data?.length) {
      const arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      return apiResponse(arr, "", true, false, false);
    } else {
      return apiResponse([], "", false, true, false);
    }
  } catch (error) {
    console.log("some error occured while fetching location options", error);
    return apiResponse([], "", false, true, false);
  }
};

const mapProcess = async (values) => {
  try {
    const { process } = values;
    const url = "/qaProcessmaster/createQAProcess";
    const finalObj = {
      sku: values.sku,
      sfg_sku: getArrayValues(process, "sfgSku"),
      process: process.map((row) => row.process.id),
      subject: getArrayValues(process, "bom", true),
      bomRequired: getArrayValues(process, "isBomRequired"),
      processLevel: getArrayValues(process, "level"),
      processRemark: getArrayValues(process, "remark"),
      processLoc: getArrayValues(process, "processLocation"),
      pass_loc: getArrayValues(process, "passLocation"),
      fail_loc: getArrayValues(process, "failLocation"),
      lot_size: getArrayValues(process, "lotSize"),
    };
    const response = await imsAxios.post(url, finalObj);
    const { data } = response;
    if (data) {
      if (data.status === "success") {
        return apiResponse([], data.message.msg, true, false, true);
      } else {
        return apiResponse([], data?.message?.msg, false, true, true);
      }
    }
  } catch (error) {
    return apiResponse([], "", false, true, true);
  }
};
const processApi = {
  createProcess,
  getAllProcesses,
  getProductOptions,
  getSkuBomOptions,
  getSkuSfgOptions,
  getProcessOptions,
  getLocationOptions,
  mapProcess,
};
export { processApi };

const apiResponse = (data, message, success, error, showMessage) => {
  return {
    data,
    message,
    success,
    error,
    showMessage,
  };
};

const getArrayValues = (arr, name, nullable) => {
  if (nullable) {
    return arr.map((row) => row[name] ?? "--");
  } else {
    return arr.map((row) => row[name]);
  }
};
