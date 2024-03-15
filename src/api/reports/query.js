import { imsAxios } from "../../axiosInterceptor";

export const getQ5 = async (payload) => {
  const response = await imsAxios.post("/q5", payload);
  console;
  return response;
};
