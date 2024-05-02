import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "../../types/general";
import { R33Type, R34Type } from "../../types/reports";

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
export const getR33 = async (date: string) => {
  const response: ResponseType = await imsAxios.post("report33/", { date });
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
  department: string;
  product: string;
  sku: string;
  unit: string;
  manPower: string;
  noOfLines: string;
  output: string;
  // date: string;
  // shiftStart: string;
  // shiftEnd: string;
  overTm: string;
  workHrs: string;
  remark: string;
}
export const getR34 = async (date: string) => {
  const response: ResponseType = await imsAxios.post("/report34/", { date });
  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetR34Type, index: number): R34Type => ({
        id: index + 1,
        // date: row.date,
        department: row.department,
        manPower: row.manPower,
        lineCount: row.noOfLines,
        output: row.output,
        overTime: row.overTm,
        product: row.product,
        remarks: row.remark,
        // shiftEnd: row.shiftEnd,
        // shiftStart: row.shiftStart,
        sku: row.sku,
        uom: row.unit,
        workHours: row.workHrs,
      })
    );
  }
  response.data = arr;
  return response;
};
