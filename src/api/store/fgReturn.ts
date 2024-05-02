import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "../../types/general";
import { CompletedFGReturnType } from "../../types/store";

interface GetPendingReturns {
  product_id: string;
  product_sku: string;
  product_name: string;
  product_uom: string;
  qty_return: string;
  exe_qty: string;
  remaining_qty: string;
  bom_id: string;
  bom_name: string;
  location_in: string;
  location_name: string;
  fg_status: string;
  remark: string;
  fg_return_txn_id: string;
  insert_dt: string;
  insert_by: string;
}
export const getPendingReturns = async (
  data: string,
  wise: "datewise" | "skuwise"
) => {
  const response: ResponseType = await imsAxios.post(
    "/fg_return/fetchFG_returnlist",
    {
      wise,
      data,
    }
  );

  let arr = [];
  if (response.success) {
    arr = response.data.map((row: GetPendingReturns, index) => ({
      id: index + 1,
      productKey: row.product_id,
      sku: row.product_sku,
      name: row.product_name,
      uom: row.product_uom,
      returnQty: row.qty_return,
      executedQty: row.exe_qty,
      remainingQty: row.remaining_qty,
      bomId: row.bom_id,
      bom: row.bom_name,
      inLocationId: row.location_in,
      inLocation: row.location_name,
      status: row.fg_status,
      remarks: row.remark,
      transactionId: row.fg_return_txn_id,
      insertedDate: row.insert_dt,
      insertedBy: row.insert_by,
    }));
  }
  response.data = arr;
  return response;
};

interface GetCompletedReturns {
  date: string;
  txn_id: string;
  sku: string;
  name: string;
  in_qty: string;
  exe_qty: string;
  outBy: string;
}

export const getCompletedReturns = async (date: string) => {
  const response: ResponseType = await imsAxios.post(
    "/fg_return/fetchReturnCompleted",
    {
      date,
    }
  );

  let arr: CompletedFGReturnType[] = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetCompletedReturns, index): CompletedFGReturnType => ({
        id: index + 1,
        transactionId: row.txn_id,
        sku: row.sku,
        product: row.name,
        inQty: row.in_qty,
        executedBy: row.outBy,
        executedQty: row.exe_qty,
        date: row.date,
      })
    );
  }

  response.data = arr;
  return response;
};
