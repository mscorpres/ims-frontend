import { Col, Drawer, Row, Skeleton } from "antd";

/** Supports jobwork headers (jobwork_id, product_name, …) and WO supplementary (woid, skuname, client, …). */
function pickHeaderDisplay(h) {
  if (!h || typeof h !== "object" || Array.isArray(h)) {
    return {
      workOrderId: "",
      createdBy: "",
      nameSku: "",
      date: "",
      bomRecipe: "",
      worker: "",
      qty: "",
      woStatus: "",
    };
  }
  const name = h.skuname ?? h.product_name ?? "";
  const sku = h.skucode ?? h.sku_code ?? "";
  const nameSku = [name, sku].filter(Boolean).join(" / ");
  const bomTitle = h.bom_name ?? h.subject_name ?? "";
  const bomRecipe = bomTitle
    ? `${bomTitle}${h.bom_recipe ? ` (${h.bom_recipe})` : ""}`
    : (h.bom_recipe ?? "");
  return {
    workOrderId: h.woid ?? h.wo_sku_transaction ?? h.jobwork_id ?? "",
    createdBy: h.created_by ?? "",
    nameSku,
    date: h.date ?? h.registered_date ?? "",
    bomRecipe,
    worker: h.client ?? h.vendor_name ?? "",
    qty: h.requiredqty ?? h.ordered_qty ?? "",
    woStatus: h.wo_status ?? "",
  };
}

function ViewWorkOrderModal({ viewModal, setViewModal, header, loadingUpdate }) {
  const d = pickHeaderDisplay(header);

  return (
    <Drawer
      title="Details"
      placement="top"
      closable
      onClose={() => setViewModal(false)}
      open={viewModal}
      height="min(420px, 72vh)"
      styles={{ body: { paddingTop: 12, overflow: "auto" } }}
    >
      <Skeleton loading={loadingUpdate} active>
        <Row gutter={[10, 10]} style={{ border: "0.9px solid grey", margin: 0, padding: 24 }}>
          <Col span={12} style={{ padding: "3px" }}>
            <span>Work order ID: </span>
            {d.workOrderId}
            {d.woStatus ? ` (${d.woStatus})` : ""}
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <span>Created by: </span>
            {d.createdBy}
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <span>FG/SFG name & SKU code: </span>
            {d.nameSku || "—"}
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <span>Registered date: </span>
            {d.date}
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <span>FG/SFG BOM / recipe: </span>
            {d.bomRecipe}
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <span>Client: </span>
            {d.worker}
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <span>FG/SFG order qty: </span>
            {d.qty}
          </Col>
        </Row>
      </Skeleton>
    </Drawer>
  );
}

export default ViewWorkOrderModal;
