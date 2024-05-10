import { imsAxios } from "@/axiosInterceptor";
import { ResponseType, SelectOptionType } from "@/types/general";
import { ProductType } from "@/types/r&d";
import { convertSelectOptions } from "@/utils/general";

interface GetProductListType {
  name: string;
  sku: string;
  description: string;
  unit: string;
  images: { url: string }[];
  documents: { url: string }[];
  isActive: boolean;
  status: "0" | "1" | "2";
}
export const getProductsList = async () => {
  const response: ResponseType = await imsAxios.get("/products/fetch/temp");
  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetProductListType, index: number): ProductType => ({
        approvalStage: row.status,
        description: row.description,
        isActive: row.isActive,
        name: row.name,
        sku: row.sku,
        unit: row.unit,
        documents: row.documents,
        id: index + 1,
        images: row.images,
      })
    );
  }

  response.data = arr;
  return response;
};

export const createProduct = async (values: ProductType) => {
  const formData = new FormData();

  formData.append("name", values.name);
  formData.append("sku", values.sku);
  formData.append("unit", values.unit);
  formData.append("description", values.description);
  values.images?.map((row) => {
    formData.append("images", row.originFileObj);
  });
  values.documents?.map((row) => {
    formData.append("documents", row.originFileObj);
  });

  const response: ResponseType = await imsAxios.post(
    "/products/create/temp",
    formData
  );

  return response;
};

export const getProductOptions = async (search: string) => {
  const response: ResponseType = await imsAxios.get(
    `/products/search/temp?search=${search}`
  );

  let arr: SelectOptionType[] = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }

  response.data = arr;
  return response;
};
