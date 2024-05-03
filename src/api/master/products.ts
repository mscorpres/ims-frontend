import { imsAxios } from "@/axiosInterceptor";
import { ResponseType } from "../../types/general";
import { ProductImageType, ProductType } from "@/types/master";

interface GetProductList {
  p_name: string;
  p_sku: string;
  units_name: string;
  product_key: string;
  product_category: "goods" | "services";
}
export const getProductsList = async (type: "fg" | "sfg") => {
  let link = type === "fg" ? "/products" : "/products/semiProducts";

  const response: ResponseType = await imsAxios.get(link);
  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetProductList, index): ProductType => ({
        id: index + 1,
        name: row.p_name,
        category: row.product_category,
        productKey: row.product_key,
        sku: row.p_sku,
        uom: row.units_name,
      })
    );
  }
  response.data = arr;
  return response;
};

interface AddProductType {
  category?: "goods" | "services";
  p_sku: string;
  units_id: string;
  p_name: string;
}
export const addProduct = async (values: ProductType, type: "fg" | "sfg") => {
  let link = type === "fg" ? "/products/insertProduct" : "/products/insertSemi";
  const payload: AddProductType = {
    category: values.category,
    p_name: values.name ?? "",
    p_sku: values.sku ?? "",
    units_id: values.uom ?? "",
  };

  const response = await imsAxios.post(link, payload);
  return response;
};

interface GetProductDetailsType {
  batchstock: string;
  brand: string;
  costprice: string;
  description: string;
  ean: string;
  enablestatus_name: string;
  gstrate_name: string;
  height: string;
  hsncode: string;
  jobworkcost: string;
  laboutcost: string;
  loc: string;
  minrmstock: string;
  minstock: string;
  mrp: string;
  othercost: string;
  pKey: string;
  packingcost: string;
  productcategory: string;
  productname: string;
  producttype_name: string;
  sku: string;
  tax_type_name: string;
  uomid: string;
  uomname: string;
  url: string;
  vweight: string;
  weight: string;
  width: string;
}
export const getProductDetails = async (key: string) => {
  const response: ResponseType = await imsAxios.post(
    "/products/getProductForUpdate",
    {
      product_key: key,
    }
  );

  let obj: ProductType;
  if (response.success) {
    let values: GetProductDetailsType = response.data[0];
    obj = {
      batchQty: values.batchstock,
      brand: values.brand,
      // co
      description: values.description,
      ean: values.ean,
      isEnabled: values.enablestatus_name === "Y",
      taxRate: values.gstrate_name,
      height: values.height,
      hsn: values.hsncode,
      jobworkCost: values.jobworkcost,
      labourCost: values.laboutcost,
      defaultStockLocation: values.loc,
      minRmStock: values.minrmstock,
      minStock: values.minstock,
      mrp: values.mrp,
      otherCost: values.othercost,
      productKey: values.pKey,
      packingCost: values.packingcost,
      category: values.productcategory,
      name: values.productname,
      type: values.producttype_name === "default" ? "fg" : "sfg",
      sku: values.sku,
      taxType: values.tax_type_name,
      uom: values.uomid,
      url: values.url,
      volumetricWeight: values.vweight,
      weight: values.weight,
      width: values.width,
    };
    response.data = obj;
  }

  return response;
};

interface UpdateProductType {
  sfg: {
    sac?: string;
    description?: string;
    product_category?: string;
    category?: string;
    producttKey?: string;
    uom?: string;
    isenabled?: string;
    gstrate?: string;
    gsttype?: string;
    product_name?: string;
    producttype?: string;
  };
  fg: {
    hsn?: string;
    jobworkcost?: string;
    labourcost?: string;
    packingcost?: string;
    othercost?: string;
    minstock?: string;
    batchstock?: string;
    category?: string;
    mrp?: string;
    brand?: string;
    ean?: string;
    weight?: string;
    vweight?: string;
    height?: string;
    width?: string;
    minstockrm?: string;
    producttype?: string;
    isenabled?: string;
    gsttype?: string;
    gstrate?: string;
    product_category?: string;
    location?: string;
    description?: string;
    uom?: string;
    product_name?: string;
    producttKey?: string;
  };
}
export const updateProductDetails = async (
  values: ProductType,
  key: string,
  type: ProductType["type"]
) => {
  let link =
    type === "fg" ? "/products/updateProduct" : "/products/updateSemiProduct";

  let obj: UpdateProductType["sfg"] | UpdateProductType["fg"];

  if (type === "fg") {
    obj = {
      hsn: values.hsn,
      jobworkcost: values.jobworkCost,
      labourcost: values.labourCost,
      packingcost: values.packingCost,
      othercost: values.otherCost,
      minstock: values.minStock,
      batchstock: values.batchQty,
      product_category: values.category,
      mrp: values.mrp,
      brand: values.brand,
      ean: values.ean,
      weight: values.weight,
      vweight: values.volumetricWeight,
      height: values.height,
      width: values.width,
      minstockrm: values.minRmStock,
      producttype: values.type,
      isenabled: values.isEnabled ? "Y" : "N",
      gsttype: values.taxType,
      gstrate: values.taxRate,
      location: values.defaultStockLocation,
      description: values.description,
      uom: values.uom,
      product_name: values.name,
      producttKey: key,
      category: values.productCategory ?? "--",
    };
  } else {
    obj = {
      sac: values.hsn,
      description: values.description,
      product_category: values.category,
      producttKey: key,
      uom: values.uom,
      isenabled: values.isEnabled ? "Y" : "N",
      gstrate: values.taxRate,
      gsttype: values.taxType,
      product_name: values.name,
      category: values.productCategory ?? "--",
      producttype: values.type,
    };
  }

  const response: ResponseType = await imsAxios.post(link, obj);

  return response;
};

export const uploadImage = async (values, key: string) => {
  const formData = new FormData();
  formData.append("caption", values.label);
  formData.append("files", values.dragger[0].originFileObj);
  formData.append("product", key);

  const response = await imsAxios.post(
    "/products/upload_product_img",
    formData
  );

  return response;
};

interface GetImageType {
  image_id: string;
  image_name: string;
  image_url: string;
  uploaded_by: string;
  uploaded_date: string;
}
export const getImages = async (key: string) => {
  const response: ResponseType = await imsAxios.post(
    "/products/fetchImageProduct",
    {
      product: key,
    }
  );

  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetImageType, index: number): ProductImageType => ({
        id: row.image_id,
        index: index + 1,
        name: row.image_name,
        url: row.image_url,
        uploadedBy: row.uploaded_by,
        updatedDate: row.uploaded_date,
      })
    );
  }

  response.data = arr;
  return response;
};

export const deleteImage = async (key: string, image: string) => {
  const response = await imsAxios.post("/products/ProductDelete", {
    product: key,
    image,
  });

  return response;
};
