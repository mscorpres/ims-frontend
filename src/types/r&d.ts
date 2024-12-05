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
  createdBy?: string;
  createdDate?: string;
  project: string;
  costCenter: string;
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
  isAcive: boolean;
  product?: SelectOptionType | string;
  key?: string;
  sku?: string;
  description: string;
  version?: string;
  documents: File[] | { fileName: string; url: string }[];
  productName?: string;
  productKey?: string;

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
    uniqueCode?: string;
  }[];
  createdOn?: string;
}

export interface BOMTypeExtended extends BOMType {
  currentApprover?: string;
  id: string;
  status: string;
}

export interface BOMApprovalType {
  currentStage: number;
  createdBy: string;
  createdOn: string;
  logs: MultiStageApproverType[];
  // logs: {
  //   approver: MultiStageApproverType[];
  //   currentStage: number;
  //   remarks: string | null;
  //   stage: number;
  //   formattedStage: string;
  //   isRejected: boolean;
  //   date: string | null;
  // }[];
}

export interface MultiStageApproverType {
  stage: number;
  approvers: {
    line: number;
    user?: SelectOptionType | string;
    fixed?: boolean;
    new?: boolean;
    email?: string;
    approvalNumber: number;
    name?: string;
    remarks?: string;
    currentApprover?: boolean;
    remarksDate: string | null;
    isRejected?: boolean;
  }[];
}

export type bomUpdateType = "main" | "ecn";
