import { RowType as Q5RowType } from "@/pages/Query/Q5/type";
export interface RowType {
  key: string;
  partCode: string;
  name: string;
  stock: Q5RowType;
}
