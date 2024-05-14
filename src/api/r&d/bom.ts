import { imsAxios } from "@/axiosInterceptor";
import { ResponseType } from "@/types/general";
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
    })),
    description: values.description,
    name: values.name,
    sku: values.product,
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
    }));
  }

  response.data = arr;
  return response;
};

interface GetBomComponentsType {
  name: string;
  quantity: string;
  remarks: string;
  type: "main" | "substitute";
  substituteOf: string;
  status: "active" | "inactive";
  createdAt: string;
  componentID: string;
}
export const getComponents = async (bomKey: string) => {
  const response: ResponseType = await imsAxios.get(`/bom/fetch/${bomKey}`);
  let arr: BOMType["components"] = [];

  if (response.success) {
    let values: GetBomComponentsType[] = response.data;

    arr = values.map((row, index: number) => ({
      component: row.componentID,
      id: index + 1,
      qty: row.quantity,
      remarks: row.remarks,
      status: row.status,
      substituteOf: row.substituteOf,
      type: row.type,
      name: row.name,
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
