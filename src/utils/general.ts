import dayjs from "dayjs";

export const convertSelectOptions = (
  arr: [],
  label?: string,
  value?: string
) => {
  if (arr.map) {
    return arr.map((row) => ({
      text: row[label ?? "text"],
      value: row[value ?? "id"],
    }));
  }
};

/**
 * Create PO and related APIs: when user picks "None" / placeholder PPR, backend
 * must receive null — not "0" — or it tries to load PPR and errors.
 */
export const normalizePprForApiPayload = (
  ppr: unknown,
  pprId: unknown
): { ppr: string | null; pprId: string | null } => {
  const isNoPpr = (v: unknown) =>
    v === undefined ||
    v === null ||
    v === "" ||
    v === "0" ||
    v === 0 ||
    (typeof v === "string" && v.trim().toLowerCase() === "none");

  const rawFrom = (v: unknown): string | number | null => {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "object" && v !== null) {
      const o = v as { value?: unknown; key?: unknown };
      const inner = o.value ?? o.key;
      if (isNoPpr(inner)) return null;
      return inner as string | number;
    }
    if (isNoPpr(v)) return null;
    return v as string | number;
  };

  const raw = rawFrom(pprId) ?? rawFrom(ppr);
  if (raw === null || isNoPpr(raw)) {
    return { ppr: null, pprId: null };
  }
  const s = String(raw);
  return { ppr: s, pprId: s };
};

export const removeHtml = (value) => {
  return value.replace(/<[^>]*>/g, " ");
};
export const getInt = (value, decimal) => {
  return +Number(value ?? "0").toFixed(decimal ?? 4);
};

export const convertDate = (date, format = "DD-MM-YYYY") => {
  return dayjs(date).format(format);
};

export const downloadFromLink = (uri) => {
  const splitArr = uri.split("/");
  const name = splitArr[splitArr.length - 1];
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // delete link;
};

export function validatePAN(pan: string): { valid: boolean; formattedPAN: string } {
  const formattedPAN = (pan ?? "").trim().toUpperCase();

  if (formattedPAN.length !== 10) {
    return { valid: false, formattedPAN };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const valid = panRegex.test(formattedPAN);
  return { valid, formattedPAN };
}
