import { imsAxios } from "@/axiosInterceptor";
import { ResponseType, SelectOptionType } from "@/types/general";
import { ApprovalType, ProductType } from "@/types/r&d";
import { convertSelectOptions } from "@/utils/general";

interface GetProductListType {
  name: string;
  sku: string;
  description: string;
  // unit: string;
  images: { url: string; fileName: string }[];
  documents: { url: string; fileName: string }[];
  isActive: boolean;
  productKey: string;
  status: "0" | "1" | "2";
  projectCode: SelectOptionType;
  costCenter: SelectOptionType;
  createdAt: string;
  createdBy: string;
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
        key: row.productKey,
        costCenter: row.costCenter.text,
        project: row.projectCode.text,
        createdBy: row.createdBy,
        createdDate: row.createdAt,
      })
    );
  }

  response.data = arr;
  return response;
};

export const getProductdata = async (id: string) => {
  const response: ResponseType = await imsAxios.get(`products/fethProductUpdate/${id}`);
  return response;
}

export const createProduct = async (values: ProductType) => {
  const formData = new FormData();

  formData.append("name", values.name);
  // formData.append("unit", values.unit);/
  formData.append("description", values.description);
  formData.append("projectCode", values.project);
  formData.append("costCenter", values.costCenter);
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

export const updateProduct = async (values: ProductType,key) => {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("isActive", true);
  formData.append("description", values.description);
  formData.append("projectCode", values.projectCode?.value?values.projectCode?.value:values.projectCode);
  formData.append("costCenter", values.costCenter?.value?values.costCenter?.value:values.costCenter);
  values.images?.map((row) => {
    formData.append("images", row.originFileObj);
  });
  values.documents?.map((row) => {
    formData.append("documents", row.originFileObj);
  });

  const response: ResponseType = await imsAxios.put(
    `/products/update/temp/${key}`,
    formData
  );

  return response;
};

export const getProductOptions = async (search: string) => {
  const response: ResponseType = await imsAxios.get(
    `/bomRnd/search/product?search=${search}`
  );

  let arr: SelectOptionType[] = [];
  // if (response.success) {
  //   arr = convertSelectOptions(response.data);
  // }

  // response.data = arr;
  return response;
};

interface GetLogs {
  productName: string;
  createdBy: string;
  createdDate: string;
  status: "0" | "1" | "2";
  stage1Approver: string | null;
  stage1Remarks: string | null;
  stage1ApprovalDate: string | null;
  stage2Approver: string | null;
  stage2Remarks: string | null;
  stage2ApprovalDate: string | null;
  approver1CRN: string;
  approver2CRN: string;
}

export const getApprovalLogs = async (productKey: string) => {
  const response: ResponseType = await imsAxios.get(
    `/products/fetch/logs?productKey=${productKey}`
  );

  if (response.success) {
    const obj: GetLogs = response.data;
    const final: ApprovalType = {
      name: obj.productName,
      product: productKey,
      stage: obj.status,
      currentStatus: obj?.currentStatus,
      creationDetails: {
        by: obj.createdBy,
        date: obj.createdDate,
      },
      approvalDetails1: {
        by: obj.stage1Approver,
        date: obj.stage1ApprovalDate,
        crn: obj.approver1CRN,
        remarks: obj.stage1Remarks ?? "--",
      },
      approvalDetails2: {
        by: obj.stage2Approver,
        date: obj.stage2ApprovalDate,
        crn: obj.approver2CRN,
        remarks: obj.stage2Remarks ?? "--",
      },
    };

    response.data = final;
  }

  return response;
};

interface UpdateStatusType {
  productKey: string;
  status: boolean;
  remarks: string;
}
export const updateApprovalStatus = async (
  productKey: string,
  remarks: string,
  status: "approve" | "reject",
  stage: "0" | "1" | "2"
) => {
  const payload: UpdateStatusType = {
    productKey: productKey,
    remarks: remarks,
    status: status === "approve",
  };

  const response = await imsAxios.patch(
    `/products/approve/temp/L${+stage + 1}`,
    payload
  );

  return response;
};
