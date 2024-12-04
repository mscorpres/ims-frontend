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
  placements:[];
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
    console.log("updateType", updateType);
    console.log("version", version);

    if (updateType === "ecn") {
      version = version + 0.01;
    } else if (updateType === "main") {
      version = +(version + 1).toFixed(0);
      version = version + ".00";
    }
    version = Number(version).toFixed(2);
  } else {
    version = version + ".0";
    version = Number(version).toFixed(1);
  }
  console.log("version", version);

  console.log("values", values);
  console.log("isBomRej", isBomRej);
  // return;
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
    name: `${values.name} `,
    // name: `${values.name} V-${version}`,
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
  if (isBomRej == true || isBomRej == "true") {
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
  product_name: string;
  product_sku: string;
  key: string;
  sku: string;
  createdAt: string;
  currentApprover: string;
  version: string;
  documents: [];
  vendor_name: string;
  createDate: string;
  status: string;
  createby: string;
}
export const getBOMList = async (action: "final" | "draft") => {
  let url = "";
  if (action === "draft") {
    url = "/bom/fetchBom/draft";
  } else {
    url = "/bomRnd/bomList";
  }
  const response: ResponseType = await imsAxios.get(url);
  let arr: BOMTypeExtended[] = [];

  if (response.success) {
    const obj: GetBOMListType[] = response.data;
    arr = obj.map((row, index: number) => ({
      currentApprover: row.currentApprover,
      status: row?.status,
      productName: row.product_name,
      sku: row.product_sku,
      key: row.key,
      createdOn: row.createDate,
      components: [],
      id: index + 1,
      createdBy: row.createby,
      version: row.version,
      documents: row.documents,
      vendorName: row.vendor_name,
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
  kay: string;
  partno: string;
  key: string;
  name: string;

}

export const getComponents = async (bomKey: string) => {
  const response: ResponseType = await imsAxios.get(`/bomRnd/bomDetails/${bomKey}`);
  let arr: BOMType["components"] = [];

  if (response.success) {
    let values: GetBomComponentsType[] = response.data?.components;

    // Map over each component and create a new structure
    arr = values.map((row, index: number) => ({
      component: row.key,                    
      partCode: row.partno,                
      id: index + 1,               
      qty: row.quantity,        
      remarks: row.remarks || null,      
      status: row.status,                     
      type: row.type,                      
      name: row.name,                     
      substituteOf: {
        key: row.substituteOf?.value || '',
        name: row.substituteOf?.text || '',   
        partCode: row.substituteOf?.partCode || '', 
      },
      vendor: row.vendor || null,             
      locations: row.location || null,         
      uniqueCode: row.componentUniqueID || '',
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
    `/bomRnd/bomDetails/${bomKey}`
  );
  let arr: BOMApprovalType | {} = {};

  if (response.success) {
    const values = response.data.approvers; // Assuming the new approvers structure is in response.data.approvers
    console.log(values, "Approver values");

    // Create a grouped structure by line
    const groupedLogs = values.reduce((acc, row) => {
      const existing = acc.find(item => item.line === row.line);

      if (existing) {
        // If the line already exists, add the stage to the approvers array
        existing.approvers.push({
          approvalNumber: row.line,  
          line: row.line,
          stage: row.stage,         
          currentApprover: row.currentApprover,
          email: row.email,
          name: row.name,
          remarks: row.remark,
          user: row.approver, 
          remarksDate: row.updateTime || null, 
          stageLabel:row.stageLable,
        });
      } else {
        // If the line doesn't exist, create a new entry
        acc.push({
          line: row.line,
          approvers: [{
            approvalNumber: row.line,
            line: row.line,
            stage: row.stage,           
            currentApprover: row.currentApprover,  
            email: row.email,
            name: row.name,
            remarks: row.remark,
            user: row.approver, 
            remarksDate: row.updateTime || null,
            stageLabel:row.stageLable,
          }],
        });
      }

      return acc;
    }, []);

    arr = { logs: groupedLogs , isRejected: response.data.details.isRejected };
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
  bom: string;
  line: number;
  stage: number;
  status: string;
  remark: string;
}
export const updateStatus = async (
  bom: string,
  stage: number,
  line: number,
  status: "Approved" | "Rejected",
  remark: string,
) => {
  const payload: updateStatusType = {
    bom: bom,
    remark: remark,
    status: status,
    stage: stage,
    line: line
  };

  const response = await imsAxios.put(
    "/bomRnd/updateBOMStatus",
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
    `/bomRnd/validProduct/${sku}`
  );

  if (response.success) {
    if (response.data) {
      let values: GetExistingBom = response.data[0];

      if (values) {
        let obj: BOMTypeExtended = {
          // name: values.name + "00.00",
          name: values.name,
          description: values.description,
          product: sku,
          isDraft: values.isDraft,
          isRejected: values?.isRejected,
          latestVersion: values.latestVersion,
          version: values.selectedversion,
          id: values.bomID,
          components: values.components.map((row) => ({
            component: {
              ...row.component,
              label: row.component.text + " " + row?.component?.partCode,
            },
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

interface BomComponent {
  component: string;
  quantity: number;
  type: 'main' | 'alternate';
  placement: string;
}

interface BomRequest {
  product: string;
  bomName: string;
  brn: string;
  bomDoc: string[];
  bomRemark: string;
  vendor: string;
  components: BomComponent[];
  approvers: string[][];
}

export const createBomRND = async (data: BomRequest) => {
  const response: ResponseType = await imsAxios.post("/bomRnd/creatBom", data);
  return response;
};

export const uploadDocs = async (formData) => {
  try {
    const response = await imsAxios.post("/bomRnd/uploadDocs", formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set content type for file uploads
      },
    });
  
    return response.data; // Return the response data
  } catch (error) {
    console.error("API Upload Error:", error);
    throw error; // You can handle the error here or rethrow it to be handled later
  }
};
