import { toast } from "react-toastify";
import errorToast from "./errorToast";

const validateResponse = (data, showToast) => {
  if (data.code == 200) {
    if (showToast) {
      toast.success(data.message);
    }
    return data;
  } else {
    if (data.message) {
      if (data.message.msg) {
        return toast.error(data.message.msg);
      } else {
        return toast.error(errorToast(data.message));
      }
    } else if (!data.message && data.status) {
      return toast.error(data.status);
    }
  }
};

export default validateResponse;
