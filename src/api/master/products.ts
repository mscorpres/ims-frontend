import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "../../types/general";
import { ProductType } from "../../types/master";

interface GetProductList {
  p_name: string;
  p_sku: string;
  units_name: string;
  product_key: string;
  product_category: string;
}
export const getProductsList = async (type: "fg" | "sfg") => {
  let link = type === "fg" ? "/products" : "/products/semiProducts";

  const response: ResponseType = await imsAxios.get(link);
  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetProductList, index): ProductType => ({
        id: index + 1,
        product: row.p_name,
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

const r34 = [
  {
    department: "Paytm Sound Box",
    product: "15701 (Paytm Sound Box V2 (OAK66M))",
    sku: "15701",
    date: "",
    manPower: "",
    lineCount: "",
    output: "",
    overtime: "",
    shiftEnd: "",
    shiftStart: "",
    uom: "",
    workHours: "",
  },
];
