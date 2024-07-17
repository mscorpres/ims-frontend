import { imsAxios } from "@/axiosInterceptor.js";
import { convertSelectOptions } from "@/utils/general";

export const getDepartmentOptions = async (search: string) => {
  const response = await imsAxios.post("/backend/misDepartment", {
    search,
  });

  response.data = convertSelectOptions(response.data);

  return response;
};
