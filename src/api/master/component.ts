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

export const getCategoryOptions = async (name: string) => {
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
  part: string;
  uom: string;
  component: string;
  new_partno: string;
  comp_type: string;
  c_category: string;
  notes: string;
  group: string;
  attr_category: string;
  attr_code: string;
  hsns: [];
  taxs: [];
  attr_raw: any;
  manufacturing_code: string;
  pia_status: "Y" | "N";
  attributeKey: string[];
  attributeValue: string[];
}
export const verifyAttributes = async (
  values: any,
  attributes: any,
  allAttributeOptions: never[]
) => {
  console.log("header values", values);
  console.log("attr values", attributes);

  const attrName = new Set<string>();
  const attrValueKey = new Set<string>();

  for (let key in attributes) {
    const current = attributes[key];
    const foundAttr = allAttributeOptions.find(
      (row) => row.name === key && row.value === current
    );

    if (foundAttr) {
      attrName.add(foundAttr?.name);
      attrValueKey.add(foundAttr?.valueKey);
    }
    if (!foundAttr) {
      attrName.add(key);
      attrValueKey.add(current);
    }
  }

  console.log("foundattr", attrName);
  console.log("foundattr 1", attrValueKey);
  return;

  const payload: VerifyAttributesType = {
    attr_category: values.attrCategory?.value,
    attr_code: values.uniqueId,
    attr_raw: attributes,
    c_category: "C", //confirm
    comp_type: "R", //confirm
    component: values.componentname,
    group: values.group,
    hsns: [],
    new_partno: values.newPart,
    notes: values.description,
    part: values.code,
    taxs: [],
    uom: values.unit,
    manufacturing_code: "",
    attributeKey: Array.from(attrName),
    attributeValue: Array.from(attrValueKey),
  };

  const response = await imsAxios.post(
    "/component/addComponent/verify",
    payload
  );
  return response;
};
