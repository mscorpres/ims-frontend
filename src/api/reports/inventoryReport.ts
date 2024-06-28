import { RowType } from "@/Pages/Query/Q7/type";
import { RowType as Q5RowType } from "@/Pages/Query/Q5/type";
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
export const getR33 = async (date: string, wise: string, data: string) => {
  const response: ResponseType = await imsAxios.post("report33/", {
    date,
    type: wise,
    data,
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
        workHours: `${row.workHrsEnd} - ${row.workHrsIn}`,
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
  qty: string;
  remark: string;
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
        qty: row.qty,
        remarks: row.remark,
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

interface q5Type {
  component: string;
  date: string;
  for_location: string;
}

interface Q5ResponseType {
  stock: {
    loc_name: string;
    loc_owner: string;
    loc_address: string;
    opening: number;
    closing: number;
  }[];

  total_closing: number;
  total_opening: number;
  component: {
    part_code: string;
    name: string;
    unit: string;
    unique_id: string;
  };
  last_audit_remark: string;
  last_audit_date: string;
  last_audit_by: string;
}
export const q5 = async (
  componentKey: string,
  date: string,
  location: "RM" | "VENDOR" | "SF"
) => {
  const payload: q5Type = {
    component: componentKey,
    date: date,
    for_location: location,
  };
  const response: ResponseType = await imsAxios.post("/q5", payload);
  if (response.success) {
    const values: Q5ResponseType = response.data;

    const final: Q5RowType = {
      stock: values.stock.map((row) => ({
        address: row.loc_address,
        closing: row.closing,
        name: row.loc_name,
        opening: row.opening,
        owner: row.loc_owner,
      })),
      total: {
        closing: values.total_closing,
        opening: values.total_opening,
      },
    };

    response.data = final;
  }
  return response;
};

interface Q7RowType {
  componentKey: string;
  componentName: string;
  partCode: string;
  manufacturingCode: string;
  uniqueID: string;
}
export const q7 = async (attributes: any, allAttributeOptions: any[]) => {
  const attrName = new Set<string>();
  const attrValueKey = new Set<string>();

  for (let key in attributes) {
    const current = attributes[key];

    if (key !== "category" && current) {
      const foundAttr = allAttributeOptions.find(
        (row) => row.name === key && row.value === current?.value
      );

      if (foundAttr) {
        if (foundAttr?.name !== "category") attrName.add(foundAttr?.name);

        attrValueKey.add(foundAttr?.valueKey);
      }
      if (!foundAttr) {
        attrName.add(key);
        attrValueKey.add(current);
      }
    }
  }
  if (Array.from(attrName).length > 0 && Array.from(attrValueKey).length > 0) {
    const response: ResponseType = await imsAxios.post("/q7", {
      type: attributes.category.value,
      attributeKey: Array.from(attrName),
      attributeValue: Array.from(attrValueKey),
    });

    let arr: RowType[] = [];
    if (response.success) {
      arr = response.data.map(
        (row: Q7RowType): RowType => ({
          key: row.componentKey,
          name: row.componentName,
          partCode: row.partCode,
          uniqueId: row.uniqueID,
          mfgCode: row.manufacturingCode,
          stock: [],
        })
      );

      response.data = arr;
    }

    return response;
  }
};
