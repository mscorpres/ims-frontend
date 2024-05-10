export interface ProductType {
  key?: string;
  id?: string | number;
  name: string;
  sku: string;
  description: string;
  unit: string;
  images?: { url: string }[];
  documents?: { url: string }[];
  approvalStage: "0" | "1" | "2";
  isActive: boolean;
}
