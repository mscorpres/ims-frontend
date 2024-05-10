import { imsAxios } from "@/axiosInterceptor";
import { ResponseType, SelectOptionType } from "@/types/general";
import { MISType } from "@/types/production";
import { convertSelectOptions } from "@/utils/general";

export const getDepartmentOptions = async (search: string) => {
  const response: ResponseType = await imsAxios.post("/backend/misDepartment", {
    search,
  });
  let arr: SelectOptionType[] = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }
  response.data = [];
  return response;
};

interface CreateEntryType {
  department: string;
  sku: string[];
  date: string[];
  manPower: string[];
  lineNo: string[];
  output: string[];
  remarks?: string[];
  shiftIn: string[];
  shiftEnd: string[];
  overTime: string[];
  workHours: string[];
}
export const createEntry = async (values: MISType) => {
  const payload: CreateEntryType = {
    date: values.shifts.map((row) => row.date),
    sku: values.shifts.map((row) => row.product),
    manPower: values.shifts.map((row) => row.manPower),
    lineNo: values.shifts.map((row) => row.lineCount),
    output: values.shifts.map((row) => row.output),
    remarks: values.shifts.map((row) => row.remarks ?? ""),
    shiftIn: values.shifts.map((row) => row.shiftStart),
    shiftEnd: values.shifts.map((row) => row.shiftEnd),
    overTime: values.shifts.map((row) => row.overTime),
    workHours: values.shifts.map((row) => row.workingHours),
    department: values.department,
  };

  const response = await imsAxios.post("/production/mis/add", payload);
  return response;
};

export const createDepartment = async (name: string) => {
  const response: ResponseType = await imsAxios.post(
    "/production/mis/createDprt",
    {
      department: name,
    }
  );

  return response;
};
