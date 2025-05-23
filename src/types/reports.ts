export interface R33Type {
  id: string | number;
  date: string;
  department: string;
  manPower: string;
  lineCount: string;
  output: string;
  overTime: string;
  product: string;
  remarks: string;
  shiftEnd: string;
  shiftStart: string;
  sku: string;
  uom: string;
  workHours: string;
}
export interface R34Type {
  id: string | number;
  transactionId: string;
  executionId: string;
  product: string;
  sku: string;
  insertedDate: string;
  insertedBy: string;
  remarks?: string;
  qty: string;
  components?: R34ComponentType[];
}
export interface R34ComponentType {
  id?: string | number;
  name: string;
  partCode: string;
  qty: string;
  bomQty: string;
  executedDate: string;
  executedBy: string;
}
