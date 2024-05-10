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
