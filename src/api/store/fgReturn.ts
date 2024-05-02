import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "../../types/general";
import { CompletedFGReturnType } from "../../types/store";

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
