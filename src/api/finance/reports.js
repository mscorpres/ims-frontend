import { imsAxios } from "../../axiosInterceptor";
import { v4 } from "uuid";

export const getLedgerReport = async (vendorCode, dateRange) => {
  const response = await imsAxios.post("/tally/ledger/ledger_report", {
    date: dateRange,
    data: vendorCode,
  });

  let arr = [];
  let summary = {};

  if (response.data.code === 200) {
    console.log(response);
    arr = response.data.data.rows.map((row, index) => ({
      id: index + 1,
      creditAmount: row.credit,
      debitAmount: row.debit,
      insertDate: row.insert_date,
      invoiceDate: row.invoice_date,
      invoiceNumber: row.invoice_date,
      moduleUsed: row.module_used,
      recoStatus: row.recoStatus,
      reference: row.ref,
      referenceDate: row.ref_date,
      whichModule: row.which_module,
    }));

    summary = {
      closing: response.data.data.summary.closing,
      opening: response.data.data.summary.opening,
      creditTotal: response.data.data.summary.total_credit,
      debitTotal: response.data.data.summary.total_debit,
    };
  }

  response.data.data.rows = arr;
  response.data.data.summary = summary;

  return response.data;
};
