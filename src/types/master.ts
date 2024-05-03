export interface UOMType {
  id?: number | string;
  type?: string;
  name: string;
  details: string;
  insertedDate?: string;
  updatedDate?: string;
  insertedBy?: string;
  unitId?: string;
  text?: string;
  value?: string;
}

export interface ProductType {
  id?: string | number;
  type?: "fg" | "sfg";
  name?: string;
  sku?: string;
  // m_sku?:string;
  uom?: string;
  insertDate?: string;
  updatedDate?: string;
  insertedBy?: string;
  updatedBy?: string;
  productKey?: string;
  minStock?: string;
  minRmStock?: string;
  batchQty?: string;
  hsn?: string;
  labourCost?: string;
  packingCost?: string;
  otherCost?: string;
  jobworkCost?: string;
  visibleInProductCosting?: string;
  mrp?: string;
  brand?: string;
  ean?: string;
  weight?: string;
  volumetricWeight?: string;
  height?: string;
  width?: string;
  url?: string;
  defaultStockLocation?: string;
  taxRate?: string;
  taxType?: string;
  isEnabled?: boolean;
  description?: string;
  // p_s_code?:string;
  // p_s_name?:string;
  sac?: string;
  productCategory?: string; // "--"
  category?: "goods" | "services";
}

export interface ProductImageType {
  id: string;
  index?: number;
  name: string;
  url: string;
  uploadedBy: string;
  updatedDate: string;
}

export interface HSNType {
  code: string;
  label: string;
  tax: string;
  index?: number;
}
