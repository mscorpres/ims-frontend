import axios from "axios";
import { toast } from "react-toastify";

let socketLink = import.meta.env.VITE_REACT_APP_SOCKET_BASE_URL;
const imsLink = import.meta.env.VITE_REACT_APP_API_BASE_URL; //for net

const imsAxios = axios.create({
  baseURL: imsLink,
  headers: {
    "x-csrf-token": JSON.parse(localStorage.getItem("loggedInUser"))?.token,
  },
});

imsAxios.interceptors.response.use(
  (response) => {
    if (response.data?.success !== undefined) {
      console.log("this is the response from axios interceptor", response.data);
      return response.data;
    }
    return response;
  },
  (error) => {
    if (typeof error.response?.data === "object") {
      if (error?.response.data.success !== undefined) {
        console.log("this is the error response", error);
        toast.error(error.response.data.message);
      } else {
        toast.error(
          error.response.data?.message?.msg ??
            "Error while connecting to backend."
        );
      }
      return error.response.data;
    }

    // if (error.response.status === 404) {
    //   toast.error("Some Internal error occured");
    // } else {

    if (error.response.data?.message) {
      toast.error(
        error.response.data?.message?.msg ??
          "Error while connecting to backend."
      );
    }
    if (!error.response.data?.message) {
      toast.error(error.response?.data);
    }
    // }
    return error.response;
  }
);
console.log("this is the company branch", localStorage.getItem("otherData"));
let branch =
  JSON.parse(localStorage.getItem("otherData"))?.company_branch ?? "";
let session = JSON.parse(localStorage.getItem("otherData"))?.session ?? "24-25";

imsAxios.defaults.headers["Company-Branch"] = branch;
imsAxios.defaults.headers["Session"] = session;

export { imsAxios, socketLink };
