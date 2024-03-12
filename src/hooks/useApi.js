import { toast } from "react-toastify";
import useLoading from "./useLoadingUpdated";

const useApi = () => {
  const { loading, setLoading } = useLoading();

  const executeFun = async (fun, loadingLabel) => {
    try {
      let message = "";
      setLoading(loadingLabel, true);
      const response = await fun();
      console.log("response in use api", response);
      if (response.data.success !== undefined) {
        if (response.data.success && response.data.message) {
          toast.success(response.data.messae);
        } else if (!response.data.success && response.data.message) {
          toast.error(response.data.messae);
        }
        return response.data;
      }
      // console.log("this is the response up 123", response);
      if (typeof response?.data === "string") {
        if (response?.status === 200) {
          toast.success(response?.data);
          return {
            data: null,
            success: true,
            error: false,
            message: null,
          };
        } else {
          toast.error(response?.data);
          return {
            data: null,
            error: true,
          };
        }
      }

      if (
        (response.data &&
          response?.data?.code &&
          response?.success !== undefined &&
          response?.data?.code !== 200 &&
          typeof response?.data.message &&
          typeof response?.data.message.msg === "string") ||
        response?.success === false
      ) {
        message = response?.data.message.msg;
        throw new Error(message);
      } else if (
        (response?.data.code === 200 &&
          response?.data.message &&
          response?.data.message.length &&
          typeof response?.data.message === "string") ||
        (response?.data.success && response?.data.message !== "")
      ) {
        // console.log('got a success message')
        message = response?.data.message;
        toast.success(message);
      }

      return {
        data: response?.data,
        error: false,
        success: true,
        message,
      };
    } catch (error) {
      let message = "";
      if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      console.log("Some error occured in the api", error);
      toast.error(message);

      return {
        data: null,
        error: true,
        success: false,
        message,
      };
    } finally {
      setLoading(loadingLabel, false);
    }
  };
  return { executeFun, loading };
};

export default useApi;
