import { imsAxios } from "@/axiosInterceptor";
import { ResponseType, SelectOptionType } from "@/types/general";
import { MISType } from "@/types/production";
import { convertSelectOptions } from "@/utils/general";
import { Row } from "antd";
import dayjs from "dayjs";

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
  skcodeu: string[];
  date: string[];
  manPower: string[];
  lineNo: string[];
  output: string[];
  remarks?: string[];
  shiftIn: string[];
  shiftEnd: string[];
  overTime: string[];
  workHours: string[];
  shiftCode: string[];
}
export const createEntry = async (values: MISType) => {
  const payload: CreateEntryType = {
    date: values.shifts.map((row) => row.date),
    code: values.shifts.map((row) => row.product),
    type: values.shifts.map((row) => row.productType),
    manPower: values.shifts.map((row) => row.manPower),
    lineNo: values.shifts.map((row) => row.lineCount),
    output: values.shifts.map((row) => row.output),
    remarks: values.shifts.map((row) => row.remarks ?? ""),
    shiftIn: values.shifts.map((row) => row.shiftHours[0].format("HH:mm")),
    shiftEnd: values.shifts.map((row) => row.shiftHours[1].format("HH:mm")),
    overTime: values.shifts.map((row) => row.overTime.format("HH:mm")),
    workHoursIn: values.shifts.map((row) =>
      row.workingTimings[0].format("HH:mm")
    ),
    workHoursEnd: values.shifts.map((row) =>
      row.workingTimings[1].format("HH:mm")
    ),
    department: values.department,
    shiftCode: values.shifts.map((row) => row.shiftLabel),
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

export const fetchShiftLabels = async () => {
  const response: ResponseType = await imsAxios.get(
    "/production/mis/shiftList"
  );

  let arr = [];
  if (response.success) {
    arr = convertSelectOptions(response.data, "name", "id");

    const final = {
      data: arr,
      raw: response.data,
    };
    response.data = final;
  }

  return response;
};

export const updateShiftLabels = async (id: string, range: []) => {
  const payload = {
    shift: id,
    start: dayjs(range[0]).format("HH:mm"),
    end: dayjs(range[1]).format("HH:mm"),
  };

  const response = await imsAxios.post(
    "/production/mis/updateShiftTime",
    payload
  );
  return response;
};
