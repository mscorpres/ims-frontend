import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import {
  getDefaultFinancialYearValue,
  migrateFinancialYearSessionInStorage,
} from "./utils/financialYear";

migrateFinancialYearSessionInStorage();
let socketLink = localStorage.getItem("currentSocketUrl") || import.meta.env.VITE_REACT_APP_SOCKET_BASE_URL;
const isSwitchInProgress = () => localStorage.getItem("switchInProgress") === "1";
const imsLink =
  localStorage.getItem("currentUrl") ||
  import.meta.env.VITE_REACT_APP_API_BASE_URL; //for net
const generateUniqueId = () => {
  return uuidv4();
};

const formatTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = String(now.getFullYear()).slice(-4); // Last 2 digits of the year
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
};
// Get token - prioritize newToken from localStorage, otherwise use loggedInUser token
const getToken = () => {
  const newToken = localStorage.getItem("newToken");
  if (newToken) {
    return newToken;
  }
  return JSON.parse(localStorage.getItem("loggedInUser"))?.token;
};

const getBranchFromStorage = () => {
  const branchData = JSON.parse(localStorage.getItem("otherData") || "{}");
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  return branchData?.company_branch || user?.company_branch || "BRALWR36";
};
const getSessionFromStorage = () => {
  const branchData = JSON.parse(localStorage.getItem("otherData") || "{}");
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  return branchData?.session || user?.session || getDefaultFinancialYearValue();
};

const imsAxios = axios.create({
  baseURL: imsLink,
  headers: {
       "Authorization": `${getToken() || ""}`,
  },
});


imsAxios.interceptors.request.use(
  (config) => {
   const url = String(config?.url || "");
    if (isSwitchInProgress() && !url.includes("/auth/switch")) {
      return Promise.reject(new axios.Cancel("Switch in progress please wait...."));
    }

    const newId = uuidv4();
    const timestamp = formatTimestamp();

    // Add headers
    config.headers["timeStamp"] = timestamp;
    config.headers["newId"] = newId;

    // Use newToken if available, otherwise use loggedInUser token
    const token = getToken();
    if (token) {

       config.headers["Authorization"]= `${token}`
    }

    const branch = getBranchFromStorage();
    const session = getSessionFromStorage();
  
    config.headers["Company-Branch"] = branch ?? "BRMSC012";
    config.headers["Session"] = session;
    config.headers["x-window-url"] = window.location.href;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

imsAxios.interceptors.response.use(
  (response) => {
    if (response.data?.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
      if (axios.isCancel?.(error)) {
      return Promise.reject(error);
    }
    if (typeof error.response?.data === "object") {
      if (error.response.data?.data?.logout) {
        toast.error(error.response.data.message);
        localStorage.clear();
        window.location.reload();
        return error;
      }
      if (error?.response.data.success !== undefined) {
        console.log("this is the error response", error);
        toast.error(error.response.data.message);
      }
      return error.response.data;
    }

    // if (error.response.status === 404) {
    //   toast.error("Some Internal error occured");
    // } else {

    // if (error.response.data?.message) {
    //   toast.error(
    //     error.response.data?.message?.msg ??
    //       "Error while connecting to backend."
    //   );
    // }
    if (!error.response.data?.message) {
      toast.error(error.response?.data);
    }
    // }
    return error.response;
  }
);


const branch = getBranchFromStorage();
const session = getSessionFromStorage();
imsAxios.defaults.headers["Company-Branch"] = branch ?? "BRMSC012";
imsAxios.defaults.headers["Session"] = session;

export { imsAxios, socketLink };
