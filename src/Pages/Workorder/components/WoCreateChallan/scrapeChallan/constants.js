export const defaultValues = {
  vendorType: "v01",
  vendorName: "",
  vendorBranch: "",
  gstin: "",
  vendorAddress: "",
  ewaybill: "",
  companybranch: "BRMSC012",
  projectID: "",
  costCenter: "",
  components: [
    {
      component: "",
      qty: "",
      rate: "",
      value: "",
      hsnCode: "",
      remarks: "",
    },
  ],
};

export const listRules = {
  hsn: [{ required: true, message: "Please enter a HSN code!" }],
  location: [{ required: true, message: "Please select a Location!" }],
  qty: [{ required: true, message: "Please enter MIN Qty!" }],
  file: [{ required: true, message: "Please select document!" }],
  rate: [{ required: true, message: "Please component rate!" }],
  docDate: [{ required: true, message: "Please select doc Date!" }],
  invoiceId: [{ required: true, message: "Please select doc id!" }],
};
