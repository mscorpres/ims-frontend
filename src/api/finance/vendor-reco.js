import { imsAxios } from "../../axiosInterceptor";
import { downloadFunction } from "../../Components/printFunction";

export const createDraft = async (vendor, date) => {
  const response = await imsAxios.post("/vendorReconciliation/create", {
    vendor,
    date,
  });

  return response;
};

export const updateDraft = async (recoRef, draftData, status) => {
  const payload = {
    recoID: recoRef,
    status: status,
    vendorClosingBalance: draftData.closing,
    vendorOpeningBalance: draftData.opening,
  };

  const response = await imsAxios.put(
    "/vendorReconciliation/update/reco",
    payload
  );

  return response;
};

export const addTransaction = async (values) => {
  const payload = {
    vendor: values.vendor,
    invoiceNo: values.invoice,
    invoiceDate: values.date,
    amount: values.amount,
    type: values.type,
    description: values.description,
    impactOn: values.impact,
  };

  const response = await imsAxios.post(
    "/vendorReconciliation/addTransactions",
    payload
  );

  return response;
};

export const getManualTransactions = async (vendor, date) => {
  const response = await imsAxios.get(
    `/vendorReconciliation/view/transactions?vendor=${vendor}&date=${date}`
  );

  return response;
};

export const updateMatchStatus = async (status, voucherArr) => {
  const payload = {
    voucherNo: voucherArr,
    status: status,
  };
  const response = await imsAxios.put(`/vendorReconciliation/update`, payload);
  return response;
};

export const addNote = async (values) => {
  const payload = {
    vendor: values.vendor,
    message: values.note,
  };
  const response = await imsAxios.post(
    "/vendorReconciliation/notes/add",
    payload
  );
  return response;
};

export const getNotes = async (vendorCode) => {
  const response = await imsAxios.get(
    `/vendorReconciliation/notes/view?vendor=${vendorCode}`
  );
  return response;
};

export const deleteManualTransaction = async (invoiceId) => {
  const response = await imsAxios.delete(
    `/vendorReconciliation/delete/transaction?transactionID=${invoiceId}`
  );

  return response;
};

export const updateTransaction = async (payload) => {
  const response = await imsAxios.put(
    "/vendorReconciliation/edit/transaction",
    payload
  );
  return response;
};

export const getRecoReport = async (vendorCode, wise, status) => {
  const response = await imsAxios.get(
    `/vendorReconciliation/view/reconciliation?${
      vendorCode ? `data=${vendorCode}` : ""
    }&wise=${wise}&status=${status}`
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      dateRange: row.dateRange,
      status: row.status,
      period: row.period,
      vendorCode: row.vendor,
      vendor: row.vendorName,
      recoId: row.recoID,
    }));
  }
  response.data = arr;
  return response;
};

export const downloadRecoPdf = async (date, vendorCode) => {
  const response = await imsAxios.get(
    `vendorReconciliation/download?vendor=${vendorCode}&date=${date}`
  );

  console.log("downloa pdf response", response);
  if (response.success) {
    downloadFunction(response.data.buffer.data, response.data.fileName);
    // window.open(response.data, "_blank", "noreferrer");
  }

  return response;
};
