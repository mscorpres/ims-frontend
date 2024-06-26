import { SelectOptionType } from "@/types/general";

export interface headerType {
  ppr: SelectOptionType;
  sku: string;
  process: SelectOptionType;
  level: string;
}

export interface EntryFormType {
  qr: string;
  count: string;
  status: "PASS" | "FAIL";
}

export interface EntryType {
  id: number | string;
  date: string;
  time: string;
  qr: string;
  status: EntryFormType["status"];
  reason: string;
}

export interface PPRDetailsType {
  customer: string;
  summaryQty: {
    total: string;
    remaining: string;
    scanned: string;
    passed: string;
    failed: string;
  };
  product: SelectOptionType;
  token: string;
  status: string;
}

export interface ProcessDetailsType {
  bom: SelectOptionType;
  isBomRequired: boolean;
  location: {
    fail: SelectOptionType;
    pass: SelectOptionType;
    process: SelectOptionType;
  };
  process: SelectOptionType;
  lotSize: string;
  level: string;
  remarks: string;
  rowKey: string; //used in update
}
export interface currentScanDetails {
  currentScanned: number | string;
  passed: number | string;
  failed: number | string;
  total: number | string;
}

export interface scanRowType {
  id: string | number;
  time: string;
  date: string;
  qr: string;
  status: "FAIL" | "PASS";
}
