import { imsAxios } from "@/axiosInterceptor";
import {
  EntryFormType,
  EntryType,
  headerType,
  PPRDetailsType,
  ProcessDetailsType,
  scanRowType,
} from "@/Pages/Production/mes/qca/scan/types";
import { ResponseType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";

interface GetPPRDetails {
  customer_name: string;
  total_qty: string;
  remaining_qty: string;
  scanned_qty: string;
  passed_qty: string;
  failed_qty: string;
  product_name: string;
  product_sku: string;
  access_token: string;
  status: "string";
}
export const getPprDetails = async (ppr: string) => {
  const response: ResponseType = await imsAxios.post(
    "createqca/fetchPprDetails",
    {
      ppr_no: ppr,
    }
  );
  if (response.success) {
    const values: GetPPRDetails = response.data;
    const final: PPRDetailsType = {
      customer: values.customer_name,
      product: {
        value: values.product_sku,
        text: values.product_name,
        label: values.product_name,
      },
      status: values.status,
      summaryQty: {
        failed: values.failed_qty,
        passed: values.passed_qty,
        remaining: values.remaining_qty,
        scanned: values.scanned_qty,
        total: values.total_qty,
      },
      token: values.access_token,
    };

    response.data = final;
  }

  return response;
};

export const fetchFailReasonOptions = async () => {
  const response = await imsAxios.get("/createqca/getDefectNames");
  response.data = convertSelectOptions(
    response.data ?? [],
    "defect_name",
    "problem_key"
  );

  return response;
};

interface GetProcessOptionsType {
  bomrequired: "YES" | "NO";
  qa_sfg_sku: string;
  qa_process_level: string;
  qa_process_key: string;
  qa_process_remark: string;
  qa_lot_size: string;
  bom: {
    id: "string";
    name: "string";
  };
  process: {
    key: "string";
    name: "string";
  };
  process_loc: {
    key: "string";
    name: "string";
  };
  pass_loc: {
    key: "string";
    name: "string";
  };
  fail_loc: {
    key: "string";
    name: "string";
  };
}
export const getProcessOptions = async (sku: string) => {
  const response: ResponseType = await imsAxios.post(
    "qaProcessmaster/fetchQAProcess",
    {
      sku: sku,
    }
  );

  if (response.success) {
    const values: GetProcessOptionsType[] = response.data;

    const final: ProcessDetailsType[] = values.map(
      (row): ProcessDetailsType => ({
        bom: {
          value: row.bom.id,
          text: row.bom.name,
          label: row.bom.name,
        },
        isBomRequired: row.bomrequired === "YES",
        level: row.qa_process_level,
        location: {
          fail: {
            value: row.fail_loc.key,
            text: row.fail_loc.name,
            label: row.fail_loc.name,
          },
          pass: {
            value: row.pass_loc.key,
            text: row.pass_loc.name,
            label: row.pass_loc.name,
          },
          process: {
            value: row.process_loc.key,
            text: row.process_loc.name,
            label: row.process_loc.name,
          },
        },
        lotSize: row.qa_lot_size,
        process: {
          value: row.process.key,
          label: row.process.name,
          text: row.process.name,
        },
        remarks: row.qa_process_remark,
        rowKey: row.qa_process_key,
      })
    );

    response.data = final;
  }

  return response;
};

interface InsertQRType {
  bar_code: string;
  qca_ppr: string;
  qca_process: string;
  qca_result: "PASS" | "FAIL";
  failReason: string | null;
  correction: string | null;
}

export const insertQr = async (values: {
  qr: EntryFormType["qr"];
  ppr: headerType["ppr"];
  process: headerType["process"];
  status: EntryFormType["status"];
  reason: EntryType["reason"];
  correction: string;
}) => {
  const payload: InsertQRType = {
    bar_code: values.qr,
    correction: values.correction ?? "--",
    failReason: values.reason,
    qca_ppr: values.ppr.value.toString(),
    qca_process: values.process.value.toString(),
    qca_result: values.status,
  };
  const response = await imsAxios.post(
    "/createqca/insert_qca_process",
    payload
  );

  return response;
};

interface FetchPreviousDataType {
  barcode: string;
  insertdt: string;
  result: "PASS" | "FAIL";
}

export const fetchPreviousData = async (ppr: string, process: string) => {
  const response: ResponseType = await imsAxios.post(
    "createqca/fetch_testing_data",
    {
      qca_ppr: ppr,
      qca_process: process,
    }
  );

  if (response.success) {
    const arr = response.data.map(
      (row: FetchPreviousDataType, index: number) => ({
        id: index + 1,
        qr: row.barcode,
        date: row.insertdt.split(" ")[0],
        time: row.insertdt.split(" ")[1],
        status: row.result,
      })
    );

    response.data = arr;
  }

  return response;
};

interface InsertSingleScanPayloadType {
  bar_code: string;
  qca_ppr: string;
  qca_process: string;
  qca_result: "PASS" | "FAIL";
  failReason: string;
  correction: string;
}

interface InsertSingleScanValueType {
  qr: string;
  ppr: string;
  process: string;
  status: "PASS" | "FAIL";
  reason?: string;
  correction?: string;
}
export const InsertSingleScan = async (values: InsertSingleScanValueType) => {
  const payload: InsertSingleScanPayloadType = {
    bar_code: values.qr,
    correction: values.correction ?? "--",
    failReason: values.reason ?? "--",
    qca_ppr: values.ppr,
    qca_process: values.process,
    qca_result: values.status,
  };

  const response = await imsAxios.post(
    "/createqca/insert_qca_process",
    payload
  );

  return response;
};

interface ValueProps {
  ppr: string;
  process: string;
  status: "PASS" | "FAIL";
  count: number | string;
  reason: string;
}
export const insertScanWithCount = async (values: ValueProps) => {
  const response = await imsAxios.post("/createqca/bulk_insert_qca_Process", {
    qca_ppr: values.ppr,
    qca_process: values.process,
    qca_result: values.status,
    numberRows: values.count,
    remark: values.reason,
  });

  return response;
};

interface TransferLotType {
  qca_barcode: string[];
  skucode: string;
  ppr_transaction: string;
  process: string;
  accesstoken: string;
  result: "PASS" | "FAIL";
}
export const transferLot = async (
  pprDetails: PPRDetailsType,
  values: headerType,
  rows: scanRowType[],
  status: "PASS" | "FAIL"
) => {
  const payload: TransferLotType = {
    qca_barcode: rows.map((row) => row.qr),
    skucode: values.sku,
    ppr_transaction: values.ppr.value as string,
    process: values.process.value as string,
    accesstoken: pprDetails?.token,
    result: status,
  };

  const response = await imsAxios.post("/createqca/lot_transfer", payload);

  return response;
};
