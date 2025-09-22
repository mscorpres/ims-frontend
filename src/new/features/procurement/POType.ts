export type Vendor = { id: string; name: string; remarks?: string };
export type Address = {
  id?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pin?: string;
};
export type Item = {
  id: string;
  sku: string;
  description?: string;
  qty: number;
  uom?: string;
  rate: number;
  amount: number;
};

export type POState = {
  vendor: Vendor | null;
  loading: boolean;
  error?: string;
  billTo: Address;
  shipTo: Address;
  items: Item[];
  // PO meta
  poType: "N" | "S";
  originalPo?: string;
  vendorType: "j01" | "v01";
  vendorBranch?: string;
  vendorAddress?: string;
  gstin?: string;
  msmeType?: string;
  msmeId?: string;
  // terms
  termsCondition?: string;
  quotationDetail?: string;
  paymentTerms?: string;
  dueDays?: number;
  costCenter?: string;
  projectId?: string;
  projectDesc?: string;
  comments?: string;
  requestedBy?: string;
  advancePayment?: 0 | 1;

  // Manage PO state
  managePOList: any[];
  managePOLoading: boolean;

  // Action states
  printLoading: boolean;
  downloadLoading: boolean;
  componentData: any;
  componentLoading: boolean;
  poLogs: any[];
  poLogsLoading: boolean;
  poDetails: any;
  poDetailsLoading: boolean;
  showCancelPO: string | null;
  showViewSidebar: boolean;
  showUploadDoc: string | null;
  showEditPO: any;
};
