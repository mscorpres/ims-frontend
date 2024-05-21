import { imsAxios } from "@/axiosInterceptor";
import { ResponseType, SelectOptionType } from "@/types/general";
import { BOMApprovalType, BOMType, BOMTypeExtended } from "@/types/r&d";

interface CreateBOMType {
  name: string;
  sku: string;
  description: string;
  components: {
    component: string;
    qty: string;
    remarks: string;
    type: "substitute" | "main";
    substitute: string;
    status: "active" | "inactive";
    vendor?: string;
    location?: string;
  }[];
}
export const createBOM = async (values: BOMType) => {
  const payload: CreateBOMType = {
    components: values.components.map((row) => ({
      component:
        typeof row.component === "object" ? row.component.value : row.component,
      qty: row.qty,
      remarks: row.remarks,
      status: "active",
      substitute:
        typeof row.substituteOf === "object"
          ? row.substituteOf.value
          : row.substituteOf,
      type: row.type,
      vendor:
        typeof row.vendor === "object" && row.vendor
          ? row.vendor?.value
          : row.vendor,
      location: row.locations,
    })),
    description: values.description,
    name: values.name,
    sku: values.product.value ?? values.product,
  };
  console.log("payload id", payload);

  const response = await imsAxios.post("/bom/tempProduct", payload);
  return response;
};

interface GetBOMListType {
  name: string;
  description: string;
  bomID: string;
  sku: string;
  createdAt: string;
  currentApprover: string;
  version: string;
  documents: [];
}
export const getBOMList = async () => {
  const response: ResponseType = await imsAxios.get("/bom/fetch");
  let arr: BOMTypeExtended[] = [];

  if (response.success) {
    const obj: GetBOMListType[] = response.data;
    arr = obj.map((row, index: number) => ({
      currentApprover: row.currentApprover,
      description: row.description,
      name: row.name,
      sku: row.sku,
      key: row.bomID,
      createdOn: row.createdAt,
      components: [],
      id: index + 1,
      version: row.version,
      documents: row.documents,
    }));
  }

  response.data = arr;
  return response;
};

interface GetBomComponentsType {
  component: {
    text: string;
    value: string;
    partCode: string;
  };
  quantity: string;
  remarks: string;
  type: "main" | "substitute";
  substituteOf: {
    text: string;
    value: string;
    partCode: string;
  } | null;
  status: "active" | "inactive";
  createdAt: string;
}
export const getComponents = async (bomKey: string) => {
  const response: ResponseType = await imsAxios.get(`/bom/fetch/${bomKey}`);
  let arr: BOMType["components"] = [];

  if (response.success) {
    let values: GetBomComponentsType[] = response.data;

    arr = values.map((row, index: number) => ({
      component: row.component.value,
      partCode: row.component.partCode,
      id: index + 1,
      qty: row.quantity,
      remarks: row.remarks,
      status: row.status,
      type: row.type,
      name: row.component.text,
      substituteOf: {
        key: row.substituteOf?.value,
        name: row.substituteOf?.text,
        partCode: row.substituteOf?.partCode,
      },
    }));
  }

  response.data = arr;

  return response;
};

interface GetLogsType {
  details: {
    createdBy: string;
    createdOn: string;
    stage: number;
  };
  logs: {
    approverCrn: string;
    approverName: string;
    department: string;
    designation: string;
    stage: number;
    remarks: string | null;
    date: string | null;
    isRejected: boolean;
  }[];
}
export const getLogs = async (bomKey: string) => {
  const response: ResponseType = await imsAxios.get(
    `/bom/logs?bomID=${bomKey}`
  );
  let arr: BOMApprovalType | {} = {};

  if (response.success) {
    const values: GetLogsType = response.data;
    arr = {
      currentStage: values.details.stage,
      logs: values.logs.map((row) => ({
        approver: {
          crn: row.approverCrn,
          name: row.approverName,
          department: row.department,
          designation: row.designation,
        },
        isRejected: row.isRejected,
        remarks: row.remarks,
        stage: row.stage,
        formattedStage: (row.stage <= 3
          ? `L1-S${row.stage}`
          : row.stage > 3 && row.stage <= 6
          ? `L2-S${row.stage - 3}`
          : row.stage > 6 && row.stage <= 9 && `L3-S${row.stage - 6}`
        ).toString(),
        date: row.date,
      })),
    };
  }

  response.data = arr;
  return response;
};

interface updateStatusType {
  bomID: string;
  status: boolean;
  remarks: string;
}
export const updateStatus = async (
  bomKey: string,
  status: "approve" | "reject",
  remarks: string,
  stage: number
) => {
  const payload: updateStatusType = {
    bomID: bomKey,
    remarks: remarks,
    status: status === "approve",
  };

  const response = await imsAxios.patch(`/bom/approve/temp/L${stage}`, payload);

  return response;
};

interface GetExistingBom {
  name: string;
  description: string;
  sku: string;
  version: string;
  bomID: string;
  components: {
    component: {
      text: string;
      value: string;
      partCode: string;
    };
    quantity: string;
    remarks: string;
    type: "main" | "substitute";
    substituteOf: null | {
      text: string;
      value: string;
      partCode: string;
    };
    status: "active" | "inactive";
    createdAt: string;
    vendor: string | SelectOptionType;
    location: string;
    componentUniqueID: string;
  }[];
}
export const getExistingBom = async (sku: string) => {
  const response: ResponseType = await imsAxios.get(
    `/bom/checkExisting?sku=${sku}`
  );

  if (response.success) {
    let values: GetExistingBom = response.data[0];

    let obj: BOMTypeExtended = {
      name: values.name,
      description: values.description,
      product: { label: values.sku.text, value: values.sku.text },
      version: values.version,
      id: values.bomID,
      components: values.components.map((row) => ({
        component: { ...row.component, label: row.component.text },
        qty: row.quantity,
        remarks: row.remarks,
        status: row.status,
        substituteOf: {
          label: row.substituteOf?.text,
          partCode: row.substituteOf?.partCode,
          value: row.substituteOf?.value,
        },
        type: row.type,
        locations: row.location,
        vendor: row.vendor,
        text: row.component.text,
        value: row.component.value,
      })),
    };

    response.data = obj;
  }

  return response;
};
