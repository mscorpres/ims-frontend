import { imsAxios } from "../../axiosInterceptor";

export const getClientsOptions = async (search) => {
  const response = await imsAxios.get(`/client/getClient?name=${search}`);
  return response;
};

export const getClientBranches = async (cliendCode) => {
  const response = await imsAxios.get(
    `/client/branches?clientCode=${cliendCode}`
  );

  return response;
};

export const getBranchDetails = async (branchId) => {
  const response = await imsAxios.get(
    `/client/getClientDetail?addressID=${branchId}`
  );

  return response;
};
