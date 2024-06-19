import { imsAxios } from "@/axiosInterceptor";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await imsAxios.post("/far/upload", formData, {
    responseType: "arraybuffer",
  });

  return response;
};
