import { HSNType } from "@/types/master";
import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "@/types/general";

export const getComponentList = async () => {};

export const downloadComponentMaster = async () => {
  const response = await imsAxios.get("/component/compMasterReport");
  return response;
};
export const downloadServiceMaster = async () => {
  const response = await imsAxios.get("/component/serviceMasterReport");
  return response;
};

export const getAlternativePartCodes = async (componentKey) => {
  const response = await imsAxios.post("/component/fetchalternatePartcode", {
    componentKey,
  });

  console.log("aternate code response", response);
  let arr = [];
  if (response.success) {
    arr = response.data.map((row, index) => ({
      id: index + 1,
      partCode: row.alternatepartCode,
      componentKey: row.alternatepartKey,
      component: row.alternatepartName,
      added: true,
    }));
  }

  response.data = arr;
  return response;
};

interface GetHSNListType {
  hsncode: string;
  hsnlabel: string;
  hsntax: string;
  serial_no: number;
}

export const getHsnList = async (key: string) => {
  const response: ResponseType = await imsAxios.post("/backend/fetchHsn", {
    component: key,
  });

  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetHSNListType, index: number): HSNType => ({
        code: row.hsncode,
        label: row.hsnlabel,
        tax: row.hsntax,
      })
    );
  }

  response.data = arr;
  return response;
};

export const mapHsn = async (key: string, hsnRows: HSNType[]) => {
  const hsn = hsnRows.map((row) => row.code);
  const tax = hsnRows.map((row) => row.tax);

  const response = await imsAxios.post("/backend/mapHsn", {
    component: key,
    hsn,
    tax,
  });

  return response;
};

export const downloadElectronicReport = async () => {
  const response = await imsAxios.get("/component/electronicReport");

  return response;
};

interface GetCategoryFieldsType {
  text: string;
  id: string;
  inp_type: "text" | "select";
  hasValue: string;
  order: number;
}
export const getCategoryFields = async (category: string) => {
  const response: ResponseType = await imsAxios.post(
    "/mfgcategory/getAttributeListByCategory",
    {
      category,
    }
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row: GetCategoryFieldsType) => ({
      name: row.id,
      label: row.text,
      type: row.inp_type,
      valueLabel: row.hasValue,
      order: row.order,
    }));
  }

  response.data = arr;
  return response;
};

export const getCategoryOptions = async (name: string, id: string) => {
  const response: ResponseType = await imsAxios.post(
    "/mfgcategory/getAttributeValue",
    {
      attribute: name,
    }
  );

  let arr = [];
  if (response.success) {
    arr = response.data.map((row) => ({
      text: row.attr_value,
      value: row.code,
      name: name,
      valueKey: row.value,
    }));
  }

  response.data = arr;
  return response;
};

export const getAllCategoryFields = async () => {
  const response = await imsAxios.get("/mfgcategory/getAttributes");

  return response;
};

interface VerifyAttributesType {
  attr_category: string;
  attr_code: string;
  manufacturing_code: string;
}
export const verifyAttributes = async (
  attrCategory: string,
  uniqueId: string,
  mfgCode: string
) => {
  const payload: VerifyAttributesType = {
    attr_code: uniqueId,
    manufacturing_code: mfgCode,
    attr_category: attrCategory,
  };

  const response = await imsAxios.post(
    "/component/addComponent/verify",
    payload
  );
  return response;
};

export const createComponent = async (
  values: any,
  attributes: any,
  allAttributeOptions: never[]
) => {
  const attrName = new Set<string>();
  const attrValueKey = new Set<string>();

  console.log("crete payload", attributes);

  for (let key in attributes) {
    const current = attributes[key];
    const foundAttr = allAttributeOptions.find(
      (row) => row.name === key && row.value === current
    );

    if (foundAttr) {
      attrName.add(foundAttr?.name);
      attrValueKey.add(foundAttr?.valueKey ?? current);
    }
    if (!foundAttr) {
      attrName.add(key);
      attrValueKey.add(current.value ?? current);
    }
  }

  const payload: VerifyAttributesType = {
    attr_category: values.attrCategory?.value,

    attr_code: values.uniqueId,
    attr_raw: attributes,
    c_category: values.attrCategory?.value, //confirm
    comp_type: getCategoryLabel(values.attrCategory?.value), //confirm
    component: values.componentname,
    group: values.group,
    hsns: [],
    new_partno: values.newPart,
    notes: values.description,
    part: values.code,
    taxs: [],
    uom: values.unit,
    manufacturing_code: "123",
    attributeKey: Array.from(attrName),
    attributeValue: Array.from(attrValueKey),
    pia_status: values.piaEnable ? "Y" : "N",
    request_by: values.raisedBy,
  };

  console.log("crete payload 123", payload);
  return;
  const response = await imsAxios.post("/component/addComponent/save", payload);
  return response;
};

export const updateApprovalStatus = async (
  key: string,
  type: "approve" | "reject",
  remarks: string
) => {
  const response = await imsAxios.patch(`/component/approve/${key}`, {
    status: type === "approve" ? "Y" : "N",
    remarks,
  });

  return response;
};

export const getCategoryTypeOptions = async () => {
  const response = await imsAxios.get("/mfgcategory/listCategories");
  if (response.data.code === 200) {
    return {
      success: true,
      data: response.data.data,
      message: null,
    };
  } else {
    return {
      success: false,
      message: response.data.message.msg,
      data: [],
    };
  }
};

interface GetPendingApprovalListType {
  componentName: string;
  componentKey: string;
  partCode: string;
  type: string;
  attributeCode: string;
  manufacturingCode: string;
  requestedBy: string;
  createdAt: string;
  attributeCategory: SelectOptionType;
  placement: string;
}
export const getPendingApprovalList = async () => {
  const response: ResponseType = await imsAxios.get(
    "/component/pendingApproval"
  );
  let arr = [];
  if (response.success) {
    arr = response.data.map((row: GetPendingApprovalListType, index) => ({
      id: index + 1,
      key: row.componentKey,
      name: row.componentName,
      partCode: row.partCode,
      type: row.type,
      uniqueCode: row.attributeCode,
      mfgCode: row.manufacturingCode,
      requestedBy: row.requestedBy,
      createdAt: row.createdAt,
      category: row.attributeCategory.text,
      categoryKey: row.attributeCategory.value,
      locations: row.placement,
    }));
  }
  response.data = arr;
  return response;
};
const getCategoryLabel = (key?: string) => {
  let compTypeLabel;
  switch (key) {
    case "20231025864820945":
      compTypeLabel = "R";
      break;
    case "20231028142920945":
      compTypeLabel = "C";
      break;
    case "348423983543":
      compTypeLabel = "I";
      break;
    case "348423984423":
      compTypeLabel = "O";
      break;
    case undefined:
      compTypeLabel = "O";
  }

  return compTypeLabel;
};
