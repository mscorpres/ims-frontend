import { toast } from "react-toastify";

const axiosResponseFunction = async (func) => {
  try {
    await func();
  } catch (error) {
    toast.error("Something went wrong, Please contact administrator");
  }
};

export default axiosResponseFunction;
