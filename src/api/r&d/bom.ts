import { imsAxios } from "@/axiosInterceptor";
import { ResponseType, SelectOptionType } from "@/types/general";
import {
  BOMApprovalType,
  BOMType,
  BOMTypeExtended,
  bomUpdateType,
  MultiStageApproverType,
} from "@/types/r&d";
import { downloadFromLink } from "@/utils/general";

interface CreateBOMType {
  name: string;
  sku: string;
  description: string;
  version: string;
  approvalMetrics: {
    stage: string;
    approvers: {
      line: number;
      user: string;
    }[];
  }[];
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
export const createBOM = async (
  values: BOMType,
  approvals: MultiStageApproverType[],
  action: "final" | "draft",
  isUpdating: boolean,
  updateType: bomUpdateType,
  isBomRej,
  bomId
) => {
  let url = "";
  if (action === "draft") {
    url = "/bom/saveAsDraft";
  } else {
    url = "/bom/tempProduct";
  }

  let version =
    values.latestVersion === "NaN" || !values.latestVersion
      ? +Number(values.version)
      : +Number(values.latestVersion).toFixed(2);

  if (isUpdating) {
    if (updateType === "ecn") {
      version = version + 0.1;
    } else if (updateType === "main") {
      version = +(version + 1).toFixed(0);
      version = version + ".0";
    }
    version = Number(version).toFixed(2);
  } else {
    version = version + ".0";
    version = Number(version).toFixed(1);
  }

  console.log("values", values);
  console.log("isBomRej", bomId);
  let arr1: CreateBOMType["approvalMetrics"] = approvals.map((row) => {
    let obj: CreateBOMType["approvalMetrics"][0] = row;
    console.log("row in create bom", row);
    // return;
    obj.stage = `L${obj.stage}`;
    obj.approvers = obj.approvers.map((app) => ({
      ...app,
      // user: app.user?.value,
      user: {
        text: app.user?.label,
        value: app.user?.value,
        label: app.user?.label,
      },
      fixed: app.fixed,
    }));

    return obj;
  });
  //parsing approvers
  let arr: CreateBOMType["approvalMetrics"] = approvals.map((row) => {
    let obj: CreateBOMType["approvalMetrics"][0] = row;
    console.log("row in create bom", row);
    // return;
    obj.stage = `${obj.stage}`;
    obj.approvers = obj.approvers.map((app) => ({
      ...app,
      // user: app.user?.value,
      user: {
        text: app.user?.label,
        value: app.user?.value,
        label: app.user?.label,
      },
      fixed: app.fixed,
    }));

    return obj;
  });

  const payload: CreateBOMType = {
    components: values.components.map((row) => ({
      component:
        typeof row.component === "object" ? row.component.value : row.component,
      qty: row.qty,
      remarks: row.remarks,
      status: "active",
      substitute:
        typeof row.substituteOf === "object"
          ? row.substituteOf?.value
          : row.substituteOf,
      type: row.type,
      vendor:
        typeof row.vendor === "object" && row.vendor
          ? row.vendor?.value
          : row.vendor,
      location: row.locations,
    })),
    version: version,
    description: values.description,
    name: `${values.name} V-${version}`,
    sku: values.product.value ?? values.product,
    approvalMetrics: arr1,
  };
  const RejBOMpayload: CreateBOMType = {
    components: values.components.map((row) => ({
      component:
        typeof row.component === "object" ? row.component.value : row.component,
      qty: row.qty,
      remarks: row.remarks,
      status: "active",
      substitute:
        typeof row.substituteOf === "object"
          ? row.substituteOf?.value
          : row.substituteOf,
      type: row.type,
      vendor:
        typeof row.vendor === "object" && row.vendor
          ? row.vendor?.value
          : row.vendor,
      location: row.locations,
    })),
    version: version,
    description: values.description,
    name: `${values.name} V-${version}`,
    sku: values.product.value ?? values.product,
    approvalMetrics: arr1,
  };
  console.log("payload", payload);

  // return;
  const formData = new FormData();
  for (let key in payload) {
    if (key === "components" || key === "approvalMetrics") {
      formData.append(key, JSON.stringify(payload[key]));
    } else {
      formData.append(key, payload[key]);
    }
  }

  values.documents?.map((row) => {
    formData.append("documents", row.originFileObj);
  });
  let response;
  if (isBomRej) {
    response = await imsAxios.post(
      `/bom/tempProduct/update/${bomId}`,
      formData
    );
  } else {
    response = await imsAxios.post(url, formData);
  }
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
export const getBOMList = async (action: "final" | "draft") => {
  let url = "";
  if (action === "draft") {
    url = "/bom/fetchBom/draft";
  } else {
    url = "/bom/fetch";
  }
  const response: ResponseType = await imsAxios.get(url);
  let arr: BOMTypeExtended[] = [];

  if (response.success) {
    const obj: GetBOMListType[] = response.data;
    arr = obj.map((row, index: number) => ({
      currentApprover: row.currentApprover,
      description: row.description,
      status: row?.status,
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
  location: string;
  vendor: string;
  componentUniqueID: string;
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
      vendor: row.vendor,
      locations: row.location,
      uniqueCode: row.componentUniqueID,
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
    isRejected: boolean;
  };
  logs: {
    stage: number;
    approvers: {
      Email_ID: string;
      approvalNumber: string;
      approverName: string;
      currentApprover: boolean;
      insertedAt: null | string;
      line: number;
      remarks: null | string;
      user: string;
      remarksDate: null | string;
    }[];
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
      createdBy: values.details.createdBy,
      createdOn: values.details.createdOn,
      currentStage: values.details.stage,
      isRejected: values.details.isRejected,
      logs: values.logs.map((row) => ({
        stage: row.stage,
        approvers: row.approvers.map(
          (app): MultiStageApproverType["approvers"][0] => ({
            approvalNumber: app.approvalNumber,
            line: app.line,
            currentApprover: app.currentApprover,
            email: app.Email_ID,
            name: app.approverName,
            remarks: app.remarks,
            user: app.user,
            remarksDate: app.remarksDate,
          })
        ),
      })),
    };
  }

  response.data = arr;
  return response;
};
export const getRejLogs = async (bomKey: string) => {
  const response: ResponseType = await imsAxios.get(
    `/bom/fetchRejection?bomID=${bomKey}`
  );
  let arr: BOMApprovalType | {} = {};
  console.log("response rej bom ", response);
  // return;
  if (response.success) {
    // const values: GetLogsType = response.data;
    // arr = {
    //   createdBy: values.details.createdBy,
    //   createdOn: values.details.createdOn,
    //   currentStage: values.details.stage,
    //   isRejected: values.details.isRejected,
    //   logs: values.logs.map((row) => ({
    //     stage: row.stage,
    //     approvers: row.approvers.map(
    //       (app): MultiStageApproverType["approvers"][0] => ({
    //         approvalNumber: app.approvalNumber,
    //         line: app.line,
    //         currentApprover: app.currentApprover,
    //         email: app.Email_ID,
    //         name: app.approverName,
    //         remarks: app.remarks,
    //         user: app.user,
    //         remarksDate: app.remarksDate,
    //       })
    //     ),
    //   })),
    // };
  }

  // response.data[0] = arr;
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
  stage: number,
  line: number
) => {
  const payload: updateStatusType = {
    bomID: bomKey,
    remarks: remarks,
    status: status === "approve",
  };

  const response = await imsAxios.patch(
    `/bom/approve/temp/${stage}/${line}`,
    payload
  );

  return response;
};

interface GetExistingBom {
  name: string;
  description: string;
  sku: string;
  selectedversion: string;
  latestVersion: string;
  bomID: string;
  isDraft: boolean;
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
export const getExistingBom = async (sku: string, version: string) => {
  console.log("version", version);
  let v;
  if (version == "1.0") {
    v = "1.00";
  }
  const response: ResponseType = await imsAxios.get(
    `/bom/checkExisting?sku=${sku}&version=${version}`
  );

  if (response.success) {
    if (response.data) {
      let values: GetExistingBom = response.data[0];

      if (values) {
        let obj: BOMTypeExtended = {
          name: values.name + "00.00",
          description: values.description,
          product: sku,
          isDraft: values.isDraft,
          isRejected: values?.isRejected,
          latestVersion: values.latestVersion,
          version: values.selectedversion,
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
            mfgCode: row?.component?.manufacturingCode,
            smtType: row?.component?.category,
          })),
        };
        response.data = obj;
      }
    }
  }

  return response;
};

export const downloadBom = async (bomId: string) => {
  const response: ResponseType = await imsAxios.get(
    `/bom/download/temp?bomID=${bomId}`
  );

  if (response.success) {
    window.open(response.data.url, "_blank", "noreferrer");
  }

  return response;
};

export const getComponentsFromFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response: ResponseType = await imsAxios.post("/bom/getData", formData);
  return response;
};

interface GetFixedApproversType {
  crnID: string;
  name: string;
  email: string;
  stage: string;
}
export const getFixedApprovers = async () => {
  const response: ResponseType = await imsAxios.get("/bom/fetchApprover");

  let arr = [];
  if (response.success) {
    arr = response.data.map((row: GetFixedApproversType) => ({
      crn: row.crnID,
      email: row.email,
      name: row.name,
      stage: row.stage,
    }));
  }

  response.data = arr;
  return response;
};

export const downloadSampleComponentFile = async () => {
  const response: ResponseType = await imsAxios.get("/bom/sampleFile");
  if (response.success) {
    downloadFromLink(response.data.url);
  }
  return response;
};
