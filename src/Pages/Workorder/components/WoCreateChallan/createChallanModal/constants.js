export const defaultValues = {
  components: [
    {
      component: {
        label: "Sample Component",
        value: "Sample Value",
      },
      partCode: "p2044",
      availabelQty: 100,
      requiredQty: 100,
      pendingQty: 100,
      inwardQty: "",
    },
  ],
};

export const gstTypeOptions = [
  { text: "Local", value: "L" },
  { text: "Interstate", value: "I" },
];

export const uploadTypeOptions = [
  { label: "File", value: "file" },
  { label: "Manual", value: "table" },
];

export const gstRateOptions = [
  { text: "5%", value: 5 },
  { text: "12%", value: 12 },
  { text: "18%", value: 18 },
  { text: "28%", value: 28 },
];

export const listRules = {
  hsn: [{ required: true, message: "Please enter a HSN code!" }],
  location: [{ required: true, message: "Please select a Location!" }],
  qty: [{ required: true, message: "Please enter MIN Qty!" }],
  rate: [{ required: true, message: "Please component rate!" }],
  hsncode: [{ required: true, message: "Please select hsncode!" }],
  secondary_product: [
    { required: true, message: "Please select secondary_product!" },
  ],
};
