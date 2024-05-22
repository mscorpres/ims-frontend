import { SelectOptionType, SelectOptionType1 } from "@/types/general";

export interface ProductType {
  key?: string;
  id?: string | number;
  name: string;
  sku: string;
  description: string;
  unit: string;
  images?: { url: string; fileName: string }[];
  documents?: { url: string; fileName: string }[];
  approvalStage: "0" | "1" | "2";
  isActive: boolean;
}

export interface ApprovalType {
  product: string;
  name: string;
  creationDetails: {
    by: string;
    date: string;
  };
  approvalDetails1: {
    by: string | null;
    date: string | null;
    crn: string;
    remarks: string;
  };
  approvalDetails2: {
    by: string | null;
    date: string | null;
    crn: string;
    remarks: string;
  };
  stage: "0" | "1" | "2";
}

export interface BOMType {
  name: string;
  product?: SelectOptionType | string;;
  key?: string;
  sku?: string;
  description: string;
  version?: string;
  documents: File[] | {fileName: string, url: string}[];
  components: {
    id?: string | number;
    component: SelectOptionType | string;
    name?: string;
    partCode?: string;
    qty: string;
    vendor?: SelectOptionType | string;
    locations?: string;
    remarks: string;
    type: "substitute" | "main";
    substituteOf:
      | SelectOptionType1
      | string
      | {
          partCode: string;
          key: string;
          name: string;
        };
    status: "active" | "inactive";
  }[];
  createdOn?: string;
}

export interface BOMTypeExtended extends BOMType {
  currentApprover?: string;
  id: string
}

export interface BOMApprovalType {
  currentStage: number;
  logs: {
    approver: null | {
      crn: string;
      name?: string;
      email?: string;
      department?: string;
      designation?: string;
    };
    currentStage: number;
    remarks: string | null;
    stage: number;
    formattedStage: string;
    isRejected: boolean;
    date: string | null;
  }[];
}
