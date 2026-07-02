/**
 * Bank names used for vendor branch create/update.
 * Each option uses the same string for display (text) and stored value (value).
 */
export const VENDOR_BRANCH_BANK_NAMES = [
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Federal Bank",
  "RBL Bank",
  "Bandhan Bank",
  "IDBI Bank",
  "Jammu & Kashmir Bank",
];

const NA_OPTION = { text: "N/A", value: "N/A" };

/**
 * Options for MySelect: N/A first, then listed banks.
 * If currentBankName is set but not in the list (legacy data), it is prepended.
 */
export function getVendorBranchBankOptions(currentBankName) {
  const base = [
    NA_OPTION,
    ...VENDOR_BRANCH_BANK_NAMES.map((name) => ({ text: name, value: name })),
  ];
  const trimmed = (currentBankName ?? "").trim();
  if (trimmed && !base.some((o) => o.value === trimmed)) {
    return [{ text: trimmed, value: trimmed }, ...base];
  }
  return base;
}
