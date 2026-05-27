import React, { useState } from "react";
import {
  Button,
  Drawer,
  Modal,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { imsAxios } from "../../../../axiosInterceptor";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import MyButton from "../../../../Components/MyButton";

const BULK_COMPONENT_SAMPLE = [
  {
    TYPE: "Other",
    "COMPONENT NAME": "Sample Component 1",
    "CAT PART CODE": "CAT-PART-001",
    "PART CODE": "PART-001",
    UOM: "NOS",
    GROUP: "PackingMaterial",
    "SUB GROUP": "Packing Material",
    DESCRIPTION: "Sample description",
    "PIA STATUS": "YES",
  },
  {
    TYPE: "Other",
    "COMPONENT NAME": "Sample Component 2",
    "CAT PART CODE": "CAT-PART-002",
    "PART CODE": "PART-002",
    UOM: "KG",
    GROUP: "PackingMaterial",
    "SUB GROUP": "Packing Material",
    DESCRIPTION: "Sample description",
    "PIA STATUS": "NO",
  },
];

const EXCEL_COLUMN_ORDER = [
  "TYPE",
  "COMPONENT_NAME",
  "CAT_PART_COD",
  "PART_CODE",
  "UOM",
  "GROUP",
  "SUB_GROUP",
  "DESCRIPTION",
  "PIA_STATUS",
];

const FIELD_ALIASES = {
  TYPE: ["TYPE", "type", "comp_type", "COMP_TYPE", "compType"],
  COMPONENT_NAME: [
    "COMPONENT_NAME",
    "component_name",
    "component",
    "COMPONENT",
    "componentName",
    "name",
    "c_name",
    "C_NAME",
  ],
  CAT_PART_COD: [
    "CAT_PART_COD",
    "CAT_PART_CODE",
    "cat_part_cod",
    "catPartCode",
    "new_partno",
    "NEW_PARTNO",
    "newPartno",
    "c_new_part_no",
    "C_NEW_PART_NO",
  ],
  PART_CODE: [
    "PART_CODE",
    "part_code",
    "part",
    "PART",
    "partCode",
    "c_part_no",
    "C_PART_NO",
  ],
  UOM: ["UOM", "uom", "unit", "UNIT", "units_name", "UNITS_NAME"],
  GROUP: ["GROUP", "group", "group_name", "GROUP_NAME"],
  SUB_GROUP: [
    "SUB_GROUP",
    "SUBGROUP",
    "sub_group",
    "subgroup",
    "sub_group_name",
    "SUB_GROUP_NAME",
  ],
  DESCRIPTION: ["DESCRIPTION", "description", "notes", "NOTES"],
  PIA_STATUS: ["PIA_STATUS", "pia_status", "PIA", "pia", "piaStatus"],
};

const normKey = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function formatValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if (v.name !== undefined) return String(v.name).trim();
    if (v.label !== undefined) return String(v.label).trim();
    if (v.text !== undefined) return String(v.text).trim();
    if (v.value !== undefined) return String(v.value).trim();
  }
  return String(v).trim();
}

function refId(v) {
  if (v && typeof v === "object" && v.id != null && v.id !== "") {
    return String(v.id).trim();
  }
  if (typeof v === "string" || typeof v === "number") {
    return String(v).trim();
  }
  return "";
}

/** Maps API header labels (spaces) to table field keys */
const HEADER_TO_FIELD = {
  TYPE: "TYPE",
  COMPONENTNAME: "COMPONENT_NAME",
  CATPARTCODE: "CAT_PART_COD",
  CATPARTCOD: "CAT_PART_COD",
  PARTCODE: "PART_CODE",
  UOM: "UOM",
  GROUP: "GROUP",
  SUBGROUP: "SUB_GROUP",
  DESCRIPTION: "DESCRIPTION",
  PIASTATUS: "PIA_STATUS",
};

function emptyRow() {
  return {
    ...Object.fromEntries(Object.keys(FIELD_ALIASES).map((k) => [k, ""])),
    uomId: "",
    groupId: "",
    subGroupId: "",
  };
}

/** API row: { type, name, catPartCode, partCode, uom, group, subGroup, ... } */
function parseApiObjectRow(row) {
  const uom = row.uom ?? row.UOM;
  const group = row.group ?? row.GROUP;
  const subGroup = row.subGroup ?? row.subgroup ?? row.SUB_GROUP;

  return {
    TYPE: formatValue(row.type ?? row.TYPE),
    COMPONENT_NAME: formatValue(
      row.name ?? row.component ?? row.componentName ?? row.COMPONENT_NAME
    ),
    CAT_PART_COD: formatValue(
      row.catPartCode ?? row.cat_part_code ?? row.CAT_PART_COD
    ),
    PART_CODE: formatValue(row.partCode ?? row.part_code ?? row.PART_CODE),
    UOM: formatValue(uom),
    GROUP: formatValue(group),
    SUB_GROUP: formatValue(subGroup),
    DESCRIPTION: formatValue(row.description ?? row.DESCRIPTION ?? row.notes),
    PIA_STATUS: formatValue(row.piaStatus ?? row.pia_status ?? row.PIA_STATUS),
    uomId: refId(uom) || refId(row.uomId),
    groupId: refId(group) || refId(row.groupId),
    subGroupId: refId(subGroup) || refId(row.subGroupId ?? row.subgroupId),
  };
}

function parseBulkData(payload) {
  const rows = payload?.rows;
  if (!Array.isArray(rows) || !rows.length) return [];

  if (rows[0] && typeof rows[0] === "object" && !Array.isArray(rows[0])) {
    return rows.map(parseApiObjectRow);
  }

  if (Array.isArray(payload?.headers)) {
    return parseHeadersAndRows(payload);
  }

  return rows.map((row) =>
    Array.isArray(row) ? { ...arrayRowToObject(row), uomId: "", groupId: "", subGroupId: "" } : parseApiObjectRow(row)
  );
}

/** API: { data: { headers: string[], rows: string[][] } } */
function parseHeadersAndRows(payload) {
  const headers = payload?.headers;
  const rows = payload?.rows;
  if (!Array.isArray(headers) || !Array.isArray(rows) || !rows.length) {
    return [];
  }

  const indexToField = headers.map((h) => HEADER_TO_FIELD[normKey(h)] ?? null);

  return rows.map((row) => {
    const out = emptyRow();
    if (!Array.isArray(row)) return out;
    row.forEach((value, i) => {
      const field = indexToField[i];
      if (field) out[field] = formatValue(value);
    });
    return out;
  });
}

function toPiaStatus(value) {
  const s = String(value ?? "").trim().toUpperCase();
  if (s === "YES" || s === "Y") return "Y";
  if (s === "NO" || s === "N") return "N";
  return "N";
}

function getApiBody(response) {
  if (!response) return null;
  const inner = response.data ?? response;
  if (
    inner &&
    (inner.code !== undefined ||
      inner.success !== undefined ||
      inner.data !== undefined)
  ) {
    return inner;
  }
  return response;
}

function isSuccess(body) {
  if (!body) return false;
  return (
    body.code === 200 ||
    body.code === "200" ||
    body.success === true ||
    body.status === "success"
  );
}

function cell(row, ...aliases) {
  const map = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "id") continue;
    map[normKey(k)] = v;
  }
  for (const a of aliases) {
    const v = map[normKey(a)];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return formatValue(v);
    }
  }
  return "";
}

function arrayRowToObject(arr) {
  const obj = {};
  EXCEL_COLUMN_ORDER.forEach((col, i) => {
    if (arr[i] !== undefined && arr[i] !== null) {
      obj[col] = formatValue(arr[i]);
    }
  });
  return obj;
}

function columnarToRows(obj) {
  const arraysByNorm = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      arraysByNorm[normKey(k)] = v;
    }
  }
  const lengths = Object.values(arraysByNorm).map((a) => a.length);
  if (!lengths.length || Math.max(...lengths, 0) === 0) return [];

  const len = Math.max(...lengths);
  return Array.from({ length: len }, (_, i) => {
    const row = {};
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      row[field] = "";
      for (const alias of aliases) {
        const arr = arraysByNorm[normKey(alias)];
        if (arr && arr[i] !== undefined && arr[i] !== null) {
          row[field] = formatValue(arr[i]);
          break;
        }
      }
    }
    return row;
  });
}

function objectMapToRows(obj) {
  const values = Object.values(obj);
  if (
    values.length > 0 &&
    values.every((v) => v && typeof v === "object" && !Array.isArray(v))
  ) {
    return values;
  }
  return [];
}

function extractRowsFromPayload(body) {
  if (!body) return [];

  // Primary: { code, data: { headers?, rows: object[] | array[] } }
  if (Array.isArray(body.data?.rows)) {
    const parsed = parseBulkData(body.data);
    if (parsed.length) return parsed;
  }

  const candidates = [
    body.data?.data,
    body.data?.rows,
    body.data?.list,
    body.data?.components,
    body.data?.result,
    body.data,
    body.rows,
    body.list,
    body.components,
    body.result,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      return c.map((row) =>
        Array.isArray(row) ? arrayRowToObject(row) : row
      );
    }
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const asRows = objectMapToRows(c);
      if (asRows.length > 0) return asRows;

      const fromColumnar = columnarToRows(c);
      if (fromColumnar.length > 0) return fromColumnar;
    }
  }

  if (Array.isArray(body) && body.length > 0) {
    return body.map((row) =>
      Array.isArray(row) ? arrayRowToObject(row) : row
    );
  }

  return [];
}

function normalizeRow(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) {
    return emptyRow();
  }

  if (r.TYPE !== undefined || r.uomId !== undefined || r.name !== undefined) {
    return {
      ...emptyRow(),
      ...parseApiObjectRow(r),
      uomId: r.uomId ?? refId(r.uom) ?? "",
      groupId: r.groupId ?? refId(r.group) ?? "",
      subGroupId: r.subGroupId ?? refId(r.subGroup ?? r.subgroup) ?? "",
    };
  }

  const out = { ...emptyRow() };
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    out[field] = cell(r, field, ...aliases);
  }
  return out;
}

function toCompType(typeCell) {
  const t = String(typeCell ?? "").trim().toUpperCase();
  if (!t) return "O";
  if (t === "O" || t === "OTHER" || t === "OTHERS") return "O";
  if (t === "R" || t === "RESISTOR") return "R";
  if (t === "C" || t === "CAPACITOR") return "C";
  if (t === "I" || t === "INDUCTOR") return "I";
  return t.length === 1 ? t : "O";
}

const columns = [
  { title: "Type", dataIndex: "TYPE", key: "TYPE", width: 90 },
  {
    title: "Component Name",
    dataIndex: "COMPONENT_NAME",
    key: "cn",
    width: 160,
  },
  {
    title: "Cat Part Code",
    dataIndex: "CAT_PART_COD",
    key: "cpc",
    width: 120,
  },
  { title: "Part Code", dataIndex: "PART_CODE", key: "pc", width: 110 },
  { title: "UoM", dataIndex: "UOM", key: "uom", width: 80 },
  { title: "Group", dataIndex: "GROUP", key: "grp", width: 120 },
  { title: "Sub Group", dataIndex: "SUB_GROUP", key: "sg", width: 120 },
  {
    title: "Description",
    dataIndex: "DESCRIPTION",
    key: "desc",
    ellipsis: true,
  },
  { title: "PIA Status", dataIndex: "PIA_STATUS", key: "pia", width: 90 },
];

function BulkAddComponentDrawer({ open, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const reset = () => {
    setRows([]);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleDownloadSample = () => {
    downloadCSVCustomColumns(BULK_COMPONENT_SAMPLE, "Bulk Component Sample");
  };

  const beforeUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading("upload");
    try {
      const response = await imsAxios.post(
        "/component/bulkUploadComponent",
        formData
      );
      const body = getApiBody(response);

      if (!isSuccess(body)) {
        toast.error(body?.message?.msg ?? body?.message ?? "Upload failed");
        return Upload.LIST_IGNORE;
      }

      const raw = extractRowsFromPayload(body);
      if (!raw.length) {
        toast.error("No rows returned from upload. Check file format.");
        return Upload.LIST_IGNORE;
      }

      const normalized = raw.map((r, i) => {
        const row = normalizeRow(r);
        return { id: i + 1, ...row };
      });

      const hasData = normalized.some((r) =>
        EXCEL_COLUMN_ORDER.some((col) => String(r[col] ?? "").trim())
      );
      if (!hasData) {
        toast.error(
          "Upload succeeded but row data could not be read. Check column headers in the file."
        );
        return Upload.LIST_IGNORE;
      }

      setRows(normalized);
      toast.success(
        typeof body?.message === "string"
          ? body.message
          : "File uploaded — review and save."
      );
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const saveBulk = async () => {
    if (!rows.length) {
      toast.error("Nothing to save");
      return;
    }
    const missing = rows.find(
      (r) =>
        !String(r.COMPONENT_NAME ?? "").trim() ||
        !String(r.PART_CODE ?? "").trim() ||
        !String(r.uomId ?? "").trim() ||
        !String(r.groupId ?? "").trim() ||
        !String(r.subGroupId ?? "").trim() ||
        !String(r.DESCRIPTION ?? "").trim() ||
        !String(r.CAT_PART_COD ?? "").trim()
    );
    if (missing) {
      toast.error(
        "Each row must have component name, part code, UoM, group, sub group, description, and cat part code (with valid IDs from upload)."
      );
      return;
    }

    const payload = {
      component: rows.map((r) => String(r.COMPONENT_NAME).trim()),
      part: rows.map((r) => String(r.PART_CODE).trim()),
      uom: rows.map((r) => String(r.uomId).trim()),
      comp_type: rows.map((r) => toCompType(r.TYPE)),
      group: rows.map((r) => String(r.groupId).trim()),
      subgroup: rows.map((r) => String(r.subGroupId).trim()),
      notes: rows.map((r) => String(r.DESCRIPTION).trim()),
      attr_category: rows.map((r) => toCompType(r.TYPE)),
      new_partno: rows.map((r) => String(r.CAT_PART_COD).trim()),
      pia_status: rows.map((r) => toPiaStatus(r.PIA_STATUS)),
    };

    setLoading("save");
    try {
      const verifyResponse = await imsAxios.post(
        "/component/addComponent/verify",
        payload,
      );
      const verifyBody = getApiBody(verifyResponse);

      if (!isSuccess(verifyBody)) {
        toast.error(
          verifyBody?.message?.msg ?? verifyBody?.message ?? "Verification failed",
        );
        return;
      }

      Modal.confirm({
        title: "Are you sure you want to save these components?",
        content:
          typeof verifyBody?.message === "string"
            ? verifyBody.message
            : verifyBody?.message?.msg ?? "Please confirm to continue.",
        onOk: async () => {
          try {
            const response = await imsAxios.post(
              "/component/addComponent/save",
              payload,
            );
            const body = getApiBody(response);
            if (isSuccess(body)) {
              toast.success(
                typeof body?.message === "string"
                  ? body.message
                  : "Saved successfully",
              );
              onSaved?.();
              handleClose();
            } else {
              toast.error(body?.message?.msg ?? body?.message ?? "Save failed");
            }
          } catch (e) {
            toast.error("Save failed");
          }
        },
      });
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Bulk add components (Other)"
      width={Math.min(
        1100,
        typeof window !== "undefined" ? window.innerWidth - 40 : 1100
      )}
      open={open}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Space>
          <MyButton
            variant="downloadSample"
            text="Sample File"
            onClick={handleDownloadSample}
          />
          {rows.length > 0 && (
            <Button onClick={reset} disabled={!!loading}>
              Upload another file
            </Button>
          )}
          <Button onClick={handleClose}>Close</Button>
          {rows.length > 0 && (
            <Button
              type="primary"
              loading={loading === "save"}
              onClick={saveBulk}
            >
              Save
            </Button>
          )}
        </Space>
      }
    >
      {rows.length === 0 ? (
        <>
          <Typography.Paragraph type="secondary">
            Upload the bulk template (Excel/CSV) with columns: TYPE, COMPONENT
            NAME, CAT PART CODE, PART CODE, UOM, GROUP, SUB GROUP, DESCRIPTION,
            PIA STATUS. Download the sample file for the correct format.
          </Typography.Paragraph>
          <Spin spinning={loading === "upload"}>
            <Upload.Dragger
              name="file"
              multiple={false}
              maxCount={1}
              showUploadList={false}
              beforeUpload={beforeUpload}
              accept=".xlsx,.xls,.csv"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file here</p>
              <p className="ant-upload-hint">
                Single file — preview opens after upload.
              </p>
            </Upload.Dragger>
          </Spin>
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <MyButton
              variant="downloadSample"
              text="Sample File"
              onClick={handleDownloadSample}
            />
          </div>
        </>
      ) : (
        <Table
          size="small"
          rowKey="id"
          loading={loading === "save"}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 1000, y: 480 }}
          pagination={false}
        />
      )}
    </Drawer>
  );
}

export default BulkAddComponentDrawer;
