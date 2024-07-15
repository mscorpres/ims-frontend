import { imsAxios } from "../../axiosInterceptor";

export const getPhysicalStockWithStatus = async (status) => {
  const response = await imsAxios.post("/sfPhysical/fetchPendingAudit", {
    status,
  });

  return response;
};

export const updateStatus = async (values) => {
  const payload = {
    audit_key: values.auditKey,
    status: values.status,
    component_key: values.componentKey,
  };

  const response = await imsAxios.post("/sfPhysical/updateAudit", payload);
  return response;
};

export const updateAudit = async (componentKey, auditKey, qty) => {
  const payload = {
    audit_key: auditKey,
    component_key: componentKey,
    audit_qty: qty,
  };

  const response = await imsAxios.post(
    "/sfPhysical/updateRejectedAudit",
    payload
  );
  return response;
};

export const getVerifiedStocks = async (wise, data) => {
  const response = await imsAxios.post("/sfPhysical/fetchAudit", {
    searchBy: wise,
    searchValue: data,
  });

  return response;
};

export const getLogs = async (auditKey) => {
  const payload = {
    audit_key: auditKey,
  };
  const response = await imsAxios.post("/sfPhysical/fetchAuditLog", payload);
  return response;
};
