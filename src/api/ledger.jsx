import { imsAxios } from "../axiosInterceptor";

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
