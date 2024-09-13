import axios from "axios";
import { toast } from "react-toastify";

let socketLink = import.meta.env.VITE_REACT_APP_SOCKET_BASE_URL;
const imsLink = import.meta.env.VITE_REACT_APP_API_BASE_URL; //for net
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
const timestamp = formatTimestamp();
console.log("timestamp", timestamp);

const imsAxios = axios.create({
  baseURL: imsLink,
  headers: {
    "x-csrf-token": JSON.parse(localStorage.getItem("loggedInUser"))?.token,
    timeStamp: timestamp,
  },
});

imsAxios.interceptors.response.use(
  (response) => {
    if (response.data?.success !== undefined) {
      return response.data;
    } else {
      if (response.data.code !== 200 && response?.data?.message?.msg) {
        toast.error(response?.data?.message?.msg);
      }
    }
    return response;
  },
  (error) => {
    if (typeof error.response?.data === "object") {
      console.log("api error", error);
      if (error.response.data?.data?.logout) {
        // toast.error(error.response.data.message);
        // localStorage.clear();
        // window.location.reload();
        return error;
      }
      if (error?.response.data.success !== undefined) {
        // toast.error(error.response.data.message);
      } else if (error?.response.data.success === undefined) {
        toast.error(
          error.response.data.message.msg ?? error.response.data.message.msg
        );
      }
      //  else {
      //   toast.error(
      //     error.response.data?.message?.msg ??
      //       "Error while connecting to backend."
      //   );
      // }
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
console.log("this is the company branch", localStorage.getItem("otherData"));
let branch =
  JSON.parse(localStorage.getItem("otherData"))?.company_branch ?? "BRMSC012";
let session = JSON.parse(localStorage.getItem("otherData"))?.session ?? "24-25";

imsAxios.defaults.headers["Company-Branch"] = branch;
imsAxios.defaults.headers["Session"] = session;

export { imsAxios, socketLink };
