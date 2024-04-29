import { imsAxios } from "../../axiosInterceptor";
import { ResponseType } from "../../types/general";
import { UOMType } from "../../types/master";

interface GetUOMType {
  ID: string;
  units_type: string;
  units_name: string;
  units_details: string;
  insert_date: string;
  update_date: string;
  inserted_by: string;
  updated_by: string;
  units_id: string;
}
export const getUOMList = async () => {
  const response: ResponseType = await imsAxios.get("/uom");

  let arr = [];
  if (response.success) {
    arr = response.data.map(
      (row: GetUOMType, index: number): UOMType => ({
        id: index + 1,
        type: row.units_type,
        name: row.units_name,
        details: row.units_details,
        insertedDate: row.insert_date,
        updatedDate: row.update_date,
        insertedBy: row.inserted_by,
        unitId: row.units_id,
        text: row.units_name,
        value: row.units_id,
      })
    );
  }

  response.data = arr;
  return response;
};

export const createUOM = async (values: UOMType) => {
  const payload = {
    uom: values.name,
    description: values.description,
  };

  const response = await imsAxios.post("/uom/insert", payload);

  return response;
};
