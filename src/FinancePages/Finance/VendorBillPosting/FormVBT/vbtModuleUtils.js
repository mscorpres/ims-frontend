/** Tally route prefix for VBT1/VBT8 (same endpoints). */
export const VBT01_API_PREFIX = "vbt01";

export const isVbt01StyleModule = (apiUrl) =>
  getTallyApiPrefix(apiUrl) === VBT01_API_PREFIX;

export const getVbtApiFromCode = (vbtCode = "") =>
  String(vbtCode).split("/")[0]?.toLowerCase() || "";

/** Screen / record type sent in API body: VBT01 vs VBT08 vs VBT09. */
export const getVbtScreenType = (routeOrCode = "") => {
  const token = String(routeOrCode).trim().toUpperCase();
  if (token === "VB8" || token === "VBT08" || token.startsWith("VBT08/")) {
    return "VBT08";
  }
  if (token === "VB9" || token === "VBT09" || token.startsWith("VBT09/")) {
    return "VBT09";
  }
  return "VBT01";
};

/** VBT8 / VBT9 use vbt01/* routes; map vbt08 / vbt09 prefix to vbt01 for URLs only. */
export const getTallyApiPrefix = (apiUrlOrVbtCode = "") => {
  const prefix = String(apiUrlOrVbtCode).includes("/")
    ? getVbtApiFromCode(apiUrlOrVbtCode)
    : apiUrlOrVbtCode;
  if (prefix === "vbt08" || prefix === "vbt09") return VBT01_API_PREFIX;
  return prefix;
};
