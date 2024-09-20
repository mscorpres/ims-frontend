import { imsAxios } from "../../axiosInterceptor";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import { downloadCSV } from "../../Components/exportToCSV";

export const validateInvoice = async (values) => {
  let comp = values.components;
  let newComp = comp.map((element) => {
    let obj = {
      ...element,
      invoiceId: values.invoiceId, // Assuming values.invoiceId is defined elsewhere
    };
    return obj;
  });
  values.components = newComp;
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

export const uploadMinInvoice = async (formData) => {
  // const formData = new FormData();
  // formData.append("files", file);
  const response = await imsAxios.post("/transaction/upload-invoice", formData);

  return response;
};
export const uploadVendorDoc = async (formData) => {
  // const formData = new FormData();
  // formData.append("files", file);
  const response = await imsAxios.post(
    "/transaction/vendor-document",
    formData
  );

  return response;
};

export const materialInWithoutPo = async (values, fileName, vendorType) => {
  let comp = values.components;
  let newComp = comp.map((element) => {
    let obj = {
      ...element,
      invoiceId: values.invoiceId,
      invoiceDate: values.invoiceDate,
    };
    return obj;
  });
  values.components = newComp;
  const payload = {
    attachment: vendorType !== "p01" ? fileName ?? "" : undefined,
    vendor: values.vendorName.value ?? "--",
    vendorbranch: values.vendorBranch ?? "--",
    address: values.vendorAddress,
    vendortype: values.vendorType,
    ewaybill: values.ewaybill ?? "--",
    cost_center: values.costCenter,
    project_id: values.projectID,
    irn: values.irn,
    qrScan: values.QR == true ? "Y" : "N",

    documentName: values.fileComponents?.map((r) => r.documentName),
    component: values?.components.map((row) => row.component?.value),
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
  // console.log("payload",payload)
  // return
  const response = await imsAxios.post("/transaction/min_transaction", payload);

  return response;
};

export const downloadAttachement = async (transactionId) => {
  const response = await imsAxios.post("/printDoc/download", {
    transaction: transactionId,
  });

  return response;
};

export const getMINLabelRows = async (wise, value) => {
  const response = await imsAxios.post("/transaction/getMinTransactionByDate", {
    data: value,
    wise,
  });

  let arr = [];
  if (response.data.code === 200) {
    arr = response.data.data.data.map((row, index) => ({
      id: index + 1,
      createdDate: row.datetime,
      invoice: row.invoice,
      vendor: row.vendorname,
      partCode: row.partcode,
      qty: row.inqty,
      location: row.location,
      createdBy: row.inby,
      consumptionStatus: row.consumptionStatus,
      invoiceStatus: row.invoiceStatus,
      minId: row.transaction,
    }));
  }
  response.data = arr;

  return response;
};

export const printMIN = async (minId, action) => {
  const response = await imsAxios.post("minPrint/printSingleMin", {
    transaction: minId,
  });

  if (response.data.code === 200) {
    if (!action) {
      printFunction(response.data.data.buffer.data);
    } else if (action === "download") {
      downloadFunction(response.data.data.buffer.data, minId);
    }
  }

  return response;
};

export const downloadConsumptionList = async (minId, columns) => {
  const response = await imsAxios.post("/jobwork/getjwsfinwardConsumption", {
    minTxn: minId,
  });

  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      createdBy: row.by,
      component: row.partName,
      partCode: row.partCode,
      catPartCode: row.catPartCode,
      qty: row.qty,
      uom: row.uom,
      date: row.date,
      partName: row.partName,
      invNo: row.invNo,
      jwID: row.jwID,
    }));

    response.data = arr;
    downloadCSV(arr, columns, "MIN Consumption List");
    // return response;
  }
  return response;
};
export const getMINComponents = async (minId) => {
  const response = await imsAxios.post("/qrLabel/getComponents", {
    transaction: minId,
  });
  let arr = [];

  if (response.success) {
    arr = response.data.map((row) => ({
      qty: row.min_qty,
      partCode: row.part_code,
      component: row.part_name,
      piaStatus: row.pia_status,
      componentKey: row.component_key,
      alreadyPrinted: row.allReadyPrinted,
      boxes: row.boxes,
    }));
  }

  response.data = arr;

  return response;
};

export const printLabels = async (values) => {
  const url = values.components[0].boxes
    ? "/minBoxLablePrint/generateBoxLabel"
    : "/qrLabel/generateQR";
  const response = await imsAxios.post(url, values);
  if (response.success) {
    printFunction(response.data.buffer.data);
  }
  return response;
};

export const fetchBoxDetails = async (minId, boxLabel) => {
  const response = await imsAxios.post("/minBoxLablePrint/fetchBoxDetails", {
    box: boxLabel,
    minId: minId,
  });
  if (response.success) {
    response.data = {
      availabelQty: response.data.avlQty,
      boxLabel: response.data.box,
      boxDate: response.data.boxCreateDt,
      costCenter: response.data.costCenter,
      minDate: response.data.minDate,
      minId: response.data.minId,
      minQty: response.data.minQty,
      partCode: response.data.partCode,
      component: response.data.partName,
      project: response.data.project,
      boxQty: response.data.qty,
      vendorCode: response.data.vendorCode,
      vendor: response.data.vendorName,
    };
  }

  return response;
};

export const updateBoxQty = async (componentKey, values, stock) => {
  console.log("values are ", values);

  const payload = {
    minId: values.components.map((row) => row["MIN ID"]),
    box: values.components.map((row) => row["label"]),
    avlQty: values.components.map((row) => row.availabelQty),
    is_open: values.components.map((row) => row.opened ?? false),
    component: componentKey,
    remark: values.remarks,
    imsQty: stock.toString(),
  };

  const response = await imsAxios.post(
    "/minBoxLablePrint/updateAvailQty",
    payload
  );

  return response;
};
