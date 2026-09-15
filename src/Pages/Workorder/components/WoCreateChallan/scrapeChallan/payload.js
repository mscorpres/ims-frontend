const pluck = (rows = [], key) => rows.map((row) => row[key]);

export const buildCreatePayload = (values, remark) => ({
  header: {
    billingaddr: values.billingaddress,
    billingid: values.billingid?.value,
    client_id: values.clientname?.value,
    client_addr_id: values.clientbranch,
    clientaddr: values.address,
    dispatchaddr: values.shippingaddress,
    dispatchid: values.dispatchid?.value,
    eway_no: values.nature,
    ship_doc: values.pd,
    other_ref: values.or,
    vehicle: values.vn,
    insert_dt: values.insertDate,
    challan_remark: remark,
  },
  material: {
    component: values.components.map((r) => r.component?.key),
    hsncode: pluck(values.components, "hsnCode"),
    qty: pluck(values.components, "qty"),
    rate: pluck(values.components, "rate"),
    value: pluck(values.components, "value"),
    comp_remark: pluck(values.components, "remarks"),
  },
});

export const buildEditPayload = (values, remark, challanId) => ({
  challan_id: challanId,
  header: {
    clientadd_id: values.components[0]?.clientBranchId,
    clientaddress: values.address,
    ship_doc_no: values.pd,
    vehicle: values.vn,
    eway_no: values.nature,
    other_ref: values.or,
    billingid: values.billingid?.value,
    billingaddress: values.billingaddress,
    dispatchid: values.dispatchid?.value,
    dispatchaddress: values.shippingaddress,
    challan_remark: remark,
  },
  material: {
    id: pluck(values.components, "rowID"),
    component: pluck(values.components, "componentKey"),
    qty: pluck(values.components, "qty"),
    rate: pluck(values.components, "rate"),
    hsncode: pluck(values.components, "hsnCode"),
    remark: pluck(values.components, "remarks"),
  },
});

export const mapChallanMaterialToComponents = (material = [], header = {}) =>
  material.map((r) => ({
    component: r.component_name,
    qty: r.out_qty,
    rate: r.part_rate,
    valu: r.component_name,
    hsnCode: r.hsn_code,
    remarks: r.remarks,
    rowID: r.row_id,
    componentKey: r.component_key,
    clientBranchId: header?.clientaddress?.value,
  }));
