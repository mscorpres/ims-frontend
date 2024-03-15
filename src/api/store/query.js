import { imsAxios } from "../../axiosInterceptor";

export const fetchQ4 = async (componentId) => {
  const response = await imsAxios.get(`/itemLedger?componentID=${componentId}`);
  let arr = [];

  if (response.success) {
    arr = response.data.result.map((row, index) => ({
      id: index + 1,
      poId: row.poID,
      project: row.project,
      vbtCode: row.vbtKey,
      minId: row.minID,
      vendorCode: row.venCode,
      invoiceNumber: row.invoiceNo,
      vendor: row.venName,
      consideredQty: row.consideredQty,
      inRate: row.inRate,
      cifRate: row.cifPrice,
      inQty: row.inQty,
      effectiveDate: row.effectiveDate,
      insertDate: row.insertDate,
      totalValue: row.totalValue,
    }));
    response.data.result = arr;
  }

  return response;
};
