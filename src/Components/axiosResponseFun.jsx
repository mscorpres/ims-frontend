import { toast } from "react-toastify";

const axiosResponseFunction = async (func) => {
  try {
    await func();
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong, Please contact administrator");
  }
};

export default axiosResponseFunction;
