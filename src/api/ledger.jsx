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

export const getLedgerEmail = async (ledgerCode) => {
  const response = await imsAxios.get(
    `/vendorReconciliation/vendor/email?vendor=${ledgerCode}`
  );
  return response;
};

export const updateLedgerEmail = async (email, ledgerCode) => {
  const payload = {
    vendor: ledgerCode,
    email: email,
  };
  const response = await imsAxios.put(
    "/vendorReconciliation/vendor/email",
    payload
  );
  return response;
};

export const sendRequestLedgerMail = async (values) => {
  const payload = {
    reqDate: values.date,
    reqVendor: values.vendor.value,
    mailFrom: values.senderEmail,
    mailTo: values.receiverEmail,
    subject: values.subject,
    body: values.body,
  };
  const response = await imsAxios.post("/vendorReconciliation/mail", payload);

  return response;
};

export const getRequestedLedgerMails = async (vendorCode) => {
  const response = await imsAxios.get(
    `/vendorReconciliation/mails?vendor=${vendorCode}`
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      senderEmail: row.mailFrom,
      receiverEmail: row.mailTo,
      requestedDate: row.requestedDate,
      subject: row.subject,
      status: row.status,
      refId: row.refID,
      body: row.body,
      sentDate: row.sentDate,
      attachments: row.attachments,
      uploadedLedgers: row.uploadedLedgers,
    }));
    response.data = arr;
  }

  return response;
};
