import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "../../types/general";
import { R33Type, R34ComponentType, R34Type } from "../../types/reports";

interface GetR33Type {
  department: string;
  product: string;
  sku: string;
  unit: string;
  manPower: string;
  noOfLines: string;
  output: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  overTm: string;
  workHrs: string;
  remark: string;
}
export const getR33 = async (date: string, wise: string) => {
  const response: ResponseType = await imsAxios.post("report33/", {
    date,
    type: wise,
  });
  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetR33Type, index: number): R33Type => ({
        id: index + 1,
        date: row.date,
        department: row.department,
        manPower: row.manPower,
        lineCount: row.noOfLines,
        output: row.output,
        overTime: row.overTm,
        product: row.product,
        remarks: row.remark,
        shiftEnd: row.shiftEnd,
        shiftStart: row.shiftStart,
        sku: row.sku,
        uom: row.unit,
        workHours: row.workHrs,
      })
    );
  }
  response.data = arr;
  return response;
};
interface GetR34Type {
  reversal_Txn_id: string;
  rtn_ref_id: string;
  product: string;
  sku: string;
  insert_dt: string;
  create_by: string;
}
export const getR34 = async (date: string) => {
  const response: ResponseType = await imsAxios.post("/report34/", { date });
  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetR34Type, index: number): R34Type => ({
        id: index + 1,
        transactionId: row.reversal_Txn_id,
        executionId: row.rtn_ref_id,
        product: row.product,
        sku: row.sku,
        insertedDate: row.insert_dt,
        insertedBy: row.create_by,
      })
    );
  }
  response.data = arr;
  return response;
};

interface GetR34DetailsType {
  reversal_Txn_id: "FGRTN/24-25/0002";
  components_name: "Adapter with wire 5v New Type C";
  components_part_no: "P2758";
  qty: "3";
  bomQty: "1";
  insert_dt: "03-05-2024 12:54:34";
  create_by: "Somendra Yadav";
}
export const getR34Details = async (
  transactionId: string,
  executionId: string
) => {
  const response: ResponseType = await imsAxios.post("/report34/fetchDetail", {
    fg_txn_id: transactionId,
    ref_no: executionId,
  });

  let arr = [];

  if (response.success) {
    arr = response.data.map(
      (row: GetR34DetailsType, index: number): R34ComponentType => ({
        id: index + 1,
        bomQty: row.bomQty,
        executedBy: row.create_by,
        executedDate: row.insert_dt,
        name: row.components_name,
        partCode: row.components_part_no,
        qty: row.qty,
      })
    );
  }

  response.data = arr;
  return response;
};
