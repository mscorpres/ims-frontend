import { imsAxios } from "../../axiosInterceptor";

export const validateInvoice = async (values) => {
  const invoices = values.components.map((row) => row.invoiceId);
  const response = await imsAxios.post("/backend/checkInvoice", {
    invoice: invoices,
    vendor: values.vendorName.value,
  });
  return response;
};
export const validateInvoiceforSFG = async (values) => {
  const invoices = values.components.map((row) => row.jw);
  const response = await imsAxios.post("/backend/checkInvoice", {
    invoice: invoices,
    vendor: values.vendorName.value,
  });
  return response;
};

export const uploadMinInvoice = async (file) => {
  const formData = new FormData();
  formData.append("files", file);
  const response = await imsAxios.post("/transaction/upload-invoice", formData);

  return response;
};

export const materialInWithoutPo = async (values, fileName) => {
  const payload = {
    attachment: fileName ?? "",
    vendor: values.vendorName.value ?? "--",
    vendorbranch: values.vendorBranch.length ?? "--",
    address: values.vendorAddress,
    vendortype: values.vendorType,
    ewaybill: values.ewaybill ?? "--",
    cost_center: values.costCenter,
    project_id: values.projectID,

    component: values.components.map((row) => row.component.value),
    qty: values.components.map((row) => row.qty),
    rate: values.components.map((row) => row.rate),
    currency: values.components.map((row) => row.currency),
    exchange: values.components.map((row) => row.exchangeRate),
    invoice: values.components.map((row) => row.invoiceId),
    invoiceDate: values.components.map((row) => row.invoiceDate),
    hsncode: values.components.map((row) => row.hsnCode),
    gsttype: values.components.map((row) => row.gstType),
    gstrate: values.components.map((row) => row.gstRate),
    cgst: values.components.map((row) => row.cgst),
    sgst: values.components.map((row) => row.sgst),
    igst: values.components.map((row) => row.igst),
    remark: values.components.map((row) => row.remarks),
    location: values.components.map((row) => row.location.value),
    out_location: values.components.map((row) => row.autoConsumption),
  };

  const response = await imsAxios.post("/transaction/min_transaction", payload);

  return response;
};
