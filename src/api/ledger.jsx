import { imsAxios } from "../axiosInterceptor";
import { convertSelectOptions } from "../utils/general";

export const getLedgerReport = async (payload) => {
  try {
    const response = await imsAxios.post("/tally/ledger/ledger_report", {
      data: payload.ledger,
      date: payload.date,
    });

    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};

export const getLedgerOptions = async (search) => {
  const response = await imsAxios.post("/tally/ledger/ledger_options", {
    search,
  });

  let arr = [];
  if (response.data.code === 200) {
    arr = convertSelectOptions(response.data.data);
  }

  response.data.data = arr;
  return response.data;
};
