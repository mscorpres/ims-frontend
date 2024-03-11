import { imsAxios } from "../../axiosInterceptor";

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

export const getRecoReport = async (vendorCode) => {
  const response = await imsAxios.get(
    `/vendorReconciliation/view/reconciliation?wise=vendorwise&data=${vendorCode}`
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      dateRange: row.dateRange,
      status: row.status,
      month: row.month,
      vendorCode: row.vendorCode,
      vendor: row.vendorName,
    }));
  }
  response.data = arr;
  return response;
};
