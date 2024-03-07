const links = [
  // purchase order links
  [
    {
      routeName: "Create PO",
      routePath: "/create-po",
      key: 0,
    },
    {
      routeName: "Manage PO",
      routePath: "/manage-po",
      key: 1,
    },
    {
      routeName: "Completed PO",
      routePath: "/completed-po",
      key: 2,
    },
    {
      routeName: "Vendor Pricing",
      routePath: "/vendor-pricing",
      key: 3,
    },
    {
      routeName: "PO Approval",
      routePath: "/approval-po",
      key: 4,
    },
  ],
  // accounts master links
  [
    {
      routeName: "Create Master",
      routePath: "/tally/create_master",
      key: 0,
    },
    {
      routeName: "Create Ledger",
      routePath: "/tally/ledger",
      key: 1,
    },
    {
      routeName: "Chart Of Accounts",
      routePath: "/tally/ChartOfAccounts",
      key: 2,
    },
  ],
  // add new or nature of tds links
  [
    {
      routeName: "Add New TDS",
      routePath: "/tally/nature_of_tds",
      key: 0,
    },
  ],

  // add new or nature of tcs links
  [
    {
      routeName: "Add New TCS",
      routePath: "/tally/nature_of_tcs",
      key: 0,
    },
    {
      routeName: "Block TCS",
      routePath: "/tally/block-tcs",
      key: 0,
    },
  ],
  // ledger report links
  [
    {
      routeName: "Ledger Report",
      routePath: "/tally/ledger_report",
      key: 0,
    },
  ],
  // VBT links
  [
    {
      routeName: "Purchase Register",
      routePath: "/tally/vendorbillposting/report",
      key: 0,
    },
    {
      routeName: "VBT1",
      routePath: "/tally/vendorbillposting/VB1",
      key: 1,
      placeholder: "Purchase - Goods",
    },
    {
      routeName: "VBT2",
      routePath: "/tally/vendorbillposting/VB2",
      key: 2,
      placeholder: "Services",
    },
    {
      routeName: "VBT3",
      routePath: "/tally/vendorbillposting/VB3",
      key: 3,
      placeholder: "Import",
    },
    {
      routeName: "VBT4",
      routePath: "/tally/vendorbillposting/VB4",
      key: 4,
      placeholder: "Fixed Assets",
    },
    {
      routeName: "VBT5",
      routePath: "/tally/vendorbillposting/VB5",
      key: 5,
      placeholder: "Expenses",
    },
    {
      routeName: "VBT6",
      placeholder: "JobWork",
      routePath: "/tally/vendorbillposting/VB6",
      key: 6,
    },
    {
      routeName: "VBT7",
      placeholder: "RCM",
      routePath: "/tally/vendorbillposting/VB7",
      key: 6,
    },
  ],
  // JV links
  [
    {
      routeName: "JV Register",
      routePath: "/tally/journal-posting/report",
      key: 0,
    },
    {
      routeName: "Journal Voucher",
      routePath: "/tally/journal-posting",
      key: 1,
    },
    {
      routeName: "Journal Voucher (JV01)",
      routePath: "/tally/journal-posting/jv01",
      key: 2,
    },
  ],
  // contra links
  [
    {
      routeName: "Contra Register",
      routePath: "/tally/contra/report",
      key: 0,
    },
    {
      routeName: "Contra 1",
      routePath: "/tally/contra/1",
      key: 1,
      placeholder: "BANK TO CASH",
    },
    {
      routeName: "Contra 2",
      routePath: "/tally/contra/2",
      key: 2,
      placeholder: "CASH TO BANK",
    },
    {
      routeName: "Contra 3",
      routePath: "/tally/contra/3",
      key: 3,
      placeholder: "CASH TO CASH",
    },
    {
      routeName: "Contra 4",
      routePath: "/tally/contra/4",
      key: 4,
      placeholder: "BANK TO BANK",
    },
  ],
  // bank payment voucher links
  [
    {
      routeName: "Bank Payment Register",
      routePath: "/tally/vouchers/bank_payment/report",
      key: 0,
    },
    {
      routeName: "Bank Payment",
      routePath: "/tally/vouchers/bank-payment",
      key: 1,
    },
  ],
  // bank receipts voucer links
  [
    {
      routeName: "Bank Receipts Register",
      routePath: "/tally/vouchers/bank_receipts/report",
      key: 0,
    },

    {
      routeName: "Bank Reciepts",
      routePath: "/tally/vouchers/bank-receipts",
      key: 1,
    },
  ],
  // cash payment voucher links
  [
    {
      routeName: "Cash Payment Register",
      routePath: "/tally/vouchers/cash_payment/report",
      key: 0,
    },
    {
      routeName: "Cash Payment",
      routePath: "/tally/vouchers/cash-payment",
      key: 1,
    },
  ],
  // cash receipts voucer links
  [
    {
      routeName: "Cash Receipts Register",
      routePath: "/tally/vouchers/cash_receipts/report",
      key: 0,
    },

    {
      routeName: "Cash Reciepts",
      routePath: "/tally/vouchers/cash-receipt",
      key: 1,
    },
  ],
  // debit  vbt
  [
    {
      routeName: "Debit Note",
      routePath: "/tally/debit-note/create",
      key: 0,
    },
    {
      routeName: "Debit Register",
      routePath: "/tally/debit-note/report",
      key: 1,
    },
    {
      routeName: "Debit Register Without VBT",
      routePath: "/tally/debit-journal/report",
      key: 2,
    },
    {
      routeName: "Debit Centralized Register",
      routePath: "/tally/debit-journal/general-report",
      key: 3,
    },
  ],
  // legal
  [
    {
      routeName: "Add Agreement",
      routePath: "/legal/createagreement",
    },
    {
      routeName: "View Agreement",
      routePath: "/legal/viewagreement",
    },
  ],
  [
    {
      routeName: "Add Party",
      routePath: "/legal/addparty",
    },
    {
      routeName: "Add Type of Agreement",
      routePath: "/legal/addagreementtype",
    },
  ],
  // credit without vbt
  [
    {
      routeName: "Credit Voucher",
      routePath: "/tally/credit-journal-posting",
      key: 0,
    },
    {
      routeName: "Credit Register",
      routePath: "/tally/credit-journal/report",
      key: 1,
    },
  ],
  [
    {
      routeName: "VBT records",
      routePath: "/tally/vendorbillposting/vendor_bill_records",
    },
  ],
  // SKU costing
  [
    {
      routeName: "SKU Costing",
      routePath: "/dashboard/sku_costing",
    },
  ],
  // UOM links
  [{ routeName: "Uom", routePath: "/uom" }],
  // components links
  [
    { routeName: "Materials", routePath: "/material" },
    { routeName: "Services", routePath: "/services" },
    {
      routeName: "Component Category",
      routePath: "/master/component/category",
    },
    {
      routeName: "StocKControl",
      routePath: "/stockControl",
    },
  ],
  // product links
  [
    {
      routeName: "Product",
      routePath: "/masters/products/fg",
    },
    {
      routeName: "SFG Product",
      routePath: "/masters/products/sfg",
    },
  ],
  // hsn map links
  [{ routeName: "HSN Map", routePath: "/hsn-map" }],
  // group links
  [{ routeName: "Groups", routePath: "/group" }],
  // master cost center links
  [
    {
      routeName: "Cost Center",
      routePath: "/cost-center",
    },
  ],
  // billing address links
  [
    {
      routeName: "Billing Address",
      routePath: "/billingAddress",
    },
    {
      routeName: "Shipping Address",
      routePath: "/shippingAddress",
    },
  ],
  // create and manage BOM links
  [
    {
      routeName: "Create Bill of Material",
      routePath: "/master/bom/create",
    },
    { routeName: "FG BOM", routePath: "/master/bom/manage/fg" },
    {
      routeName: "SFG BOM",
      routePath: "/master/bom/manage/sfg",
    },
    {
      routeName: "Disabled",
      routePath: "/master/bom/disabled",
    },
  ],
  // vendor master links
  [
    { routeName: "Add Vendor", routePath: "/add-vendor" },
    { routeName: "Vendor", routePath: "/vendor" },
  ],
  // MR approved transactionlinks
  [
    {
      routeName: "Pending MR(Approval)",
      routePath: "/approved-transaction",
    },
    {
      routeName: "Material Requisition Request",
      routePath: "/material-requisition-request",
    },
  ],
  // Create MIN links
  [
    {
      routeName: "Material In",
      routePath: "/warehouse/material-in",
    },
    {
      routeName: "Material In from PO",
      routePath: "/warehouse/material-in-with-po",
    },
    {
      routeName: "Material In FG/SFG",
      routePath: "/warehouse/material-in-product",
    },
  ],
  //QA link
  [
    { routeName: "Create Process", routePath: "/master/qa-process" },
    { routeName: "Create Process MAP", routePath: "/master/qa-process-map" },
  ],
  // edit and reverse MIN links
  [
    { routeName: "Edit MIN", routePath: "/update-rm" },
    { routeName: "Reverse MIN", routePath: "/reverse-min" },
  ],
  // FG inward links
  [
    {
      routeName: "Pending FG (s)",
      routePath: "/PendingFG",
    },
    {
      routeName: "Completed FG (s)",
      routePath: "/completedFG",
    },
  ],
  // FG Out links
  [
    {
      routeName: "Create FG OUT",
      routePath: "/create-fgOut",
    },
    { routeName: "VIEW FG OUT", routePath: "/view-fgOut" },
  ],
  // RM to RM transfer links
  [
    { routeName: "RM To RM", routePath: "/rm-to-rm" },
    // { routeName: "SF to Rej", routePath: "/sf-to-rm" },
    {
      routeName: "View Transaction",
      routePath: "/view-transaction",
    },
  ],
  // RM to REJ links
  [
    { routeName: "Rm To Rej", routePath: "/re-to-rej" },
    {
      routeName: "View Transaction",
      routePath: "/trans-rej",
    },
  ],
  // pending transfer links
  [
    {
      routeName: "Pending Transfer",
      routePath: "/pending-transfer",
    },
  ],
  // rejection links
  [
    {
      routeName: "Create Rejection",
      routePath: "/rejection",
    },
  ],
  [
    {
      routeName: "Prod Return MIN",
      routePath: "/warehouse/prod-return-MIN",
    },
  ],
  // jobwork links
  [
    { routeName: "CREATE JW PO", routePath: "/create-jw" },
    { routeName: "PO ANALYSIS", routePath: "/po-analysis" },
    { routeName: "JW RM ISSUE", routePath: "/jw-rw-issue" },
    {
      routeName: "JW RM ISSUE CHALLAN",
      routePath: "/jw-issue-challan",
    },
    {
      routeName: "JW RM CHALLAN",
      routePath: "/jw-rw-challan",
    },
    {
      routeName: "JW SF INWARD",
      routePath: "/jw-sf-inward",
    },
    {
      routeName: "JW RM RETURN",
      routePath: "/jw-rm-return",
    },
    {
      routeName: "JW COMPLETED",
      routePath: "/jw-completed",
    },
    // {
    //   routeName: "JW VENDOR PRICING",
    //   routePath: "/jw-vendor-pricing",
    // },
  ],
  // Jowbwork update
  [
    {
      routeName: "JW Update (Suppl.)",
      routePath: "/jobwork/update/supplementary",
    },
    {
      routeName: "JW Update (Rate)",
      routePath: "/jobwork/update/rate",
    },
  ],
  // jobwork vendor sfg min report
  [
    {
      routeName: "Jobwork SFG MIN",
      routePath: "/jobwork/vendor/sfg/min",
    },
  ],
  // workorder links
  [
    { routeName: "CREATE WO", routePath: "/createwo" },
    { routeName: "WO ANALYSIS", routePath: "/woanalysis" },
    { routeName: "WO CREATE CHALLAN", routePath: "/wocreatechallan" },
    { routeName: "WO SHIPMENT", routePath: "/woShipment" },
    { routeName: "WO VIEW CHALLAN", routePath: "/woviewchallan" },
    { routeName: "WO COMPLETED", routePath: "/wocompleted" },
    //
    { routeName: "WO REPORT", routePath: "/woreport" },
  ],
  //branch transfer link
  [
    {
      routeName: "Branch Transfer",
      routePath: "/branchtransferchallan",
    },
    {
      routeName: "View Branch Transfer",
      routePath: "/viewbranchtransfer",
    },
  ],
  // DC Links
  [
    {
      routeName: "Create DC",
      routePath: "/create-dc",
      key: "0",
    },
    {
      routeName: "Manage DC",
      routePath: "/manage-dc",
      key: "1",
    },
  ],
  // gatepass links
  [
    { routeName: "Create GP", routePath: "/create-gp" },
    { routeName: "Manage GP", routePath: "/manage-gp" },
  ],
  // physical stock
  [
    {
      routeName: "Create Physical Stock",
      routePath: "/warehouse/physical/create",
    },
    {
      routeName: "Pending Physical Stock",
      routePath: "/warehouse/physical/pending",
    },
    {
      routeName: "Rejected Physical Stock",
      routePath: "/warehouse/physical/rejected",
    },
    {
      routeName: "View Physical Stock",
      routePath: "/warehouse/physical/view",
    },
  ],
  // part code conversion
  //
  [
    {
      routeName: "Part Code Conversion",
      routePath: "/warehouse/part-code-conversion",
    },

    // to be added
    {
      routeName: "Part Code Conversion Report",
      routePath: "/warehouse/part-code-conversion-report",
    },
  ],
  // MIN register

  [
    {
      routeName: "MIN Register",
      routePath: "/transaction-In",
    },
    {
      routeName: "RM Issue Register",
      routePath: "/transaction-Out",
    },
  ],
  // reports r1-r14 links
  [
    {
      routeName: "R1",
      routePath: "/r1",
      placeholder: "Bom Wise RM Report",
    },
    {
      routeName: "R2",
      routePath: "/r2",
      placeholder: "PO Report",
    },
    {
      routeName: "R3",
      routePath: "/r3",
      placeholder: "Manufacturing Report",
    },
    {
      routeName: "R4",
      routePath: "/r4",
      placeholder: "Finished Goods In",
    },
    {
      routeName: "R5",
      routePath: "/r5",
      placeholder: "Finished Goods Stock ",
    },
    {
      routeName: "R6",
      routePath: "/r6",
      placeholder: "Date Wise RM Stock",
    },
    {
      routeName: "R7",
      routePath: "/r7",
      placeholder: "PPR Replenishment Report",
    },
    {
      routeName: "R8",
      routePath: "/r8",
      placeholder: "Detailed Production Report",
    },
    {
      routeName: "R9",
      routePath: "/r9",
      placeholder: "Location Wise BOM Report",
    },
    {
      routeName: "R10",
      routePath: "/r10",
      placeholder: "Location Wise Report",
    },
    {
      routeName: "R11",
      routePath: "/r11",
      placeholder: "Component CL Stock Report",
    },
    {
      routeName: "R12",
      routePath: "/r12",
      placeholder: "Required RM for FG",
    },
    {
      routeName: "R13",
      routePath: "/r13",
      placeholder: "Custom MIN Report",
    },
    {
      routeName: "R14",
      routePath: "/r14",
      placeholder: "RM Physical Report",
    },
    {
      routeName: "R15",
      routePath: "/r15",
      placeholder: "MIN Register",
    },
    {
      routeName: "R16",
      routePath: "/r16",
      placeholder: "RM Issue Register",
    },
    {
      routeName: "R17",
      routePath: "/r17",
      placeholder: "Vendor Wise JW Stock",
    },
    {
      routeName: "R18",
      routePath: "/r18",
      placeholder: "All Location Wise Stock Report",
    },
    {
      routeName: "R19",
      routePath: "/r19",
      placeholder: "MTD Report",
    },
    {
      routeName: "R20",
      routePath: "/r20",
      placeholder: "Inventory Evaluation",
    },
    {
      routeName: "R21",
      routePath: "/r21",
      placeholder: "Part Storage Location Report",
    },
    {
      routeName: "R22",
      routePath: "/r22",
      placeholder: "Branch Wise BOM Report",
    },
    {
      routeName: "R24",
      routePath: "/r24",
      placeholder: "BOM Component Report",
    },
    {
      routeName: "R25",
      routePath: "/r25",
      placeholder: "FG RM Requirement Report",
    },
    {
      routeName: "R26",
      routePath: "/r26",
      placeholder: "XML Report",
    },
    {
      routeName: "R27",
      routePath: "/r27",
      placeholder: "SFG STOCK",
    },
    //weekly report
    {
      routeName: "R28",
      routePath: "/r28",
      placeholder: "Weekly Audit Report",
    },
    {
      routeName: "R29",
      routePath: "/r29",
      placeholder: "BOM Wise SF Report",
    },
    {
      routeName: "R30",
      routePath: "/r30",

      placeholder: "Vendor Pending MIN Report",
    },
    {
      routeName: "R31",
      routePath: "/r31",

      placeholder: "Vendor RM Consumption Report",
    },

    {
      routeName: "R32",
      routePath: "/r32",

      placeholder: "Cost Center Transaction Report",
    },
  ],
  // MIN label links

  [
    {
      routeName: "View and Print MIN Label",
      routePath: "/warehouse/print-view-min",
    },
  ],
  // query reports
  [
    {
      routeName: "Q1",
      routePath: "/item-all-logs",
      placeholder: "Item Query (All)",
    },
    {
      routeName: "Q2",
      routePath: "/item-location-logs",
      placeholder: "Item Query (Loc Wise)",
    },
    {
      routeName: "Q3",
      routePath: "/sku-query",
      placeholder: "SKU Query",
    },
    {
      routeName: "Q4",
      routePath: "/q4-query",
      placeholder: "Ledger's Query",
    },
    {
      routeName: "Q5",
      routePath: "/q5",
      placeholder: "Component wise stock",
    },
    {
      routeName: "Q6",
      routePath: "/q6",
      placeholder: "Closing stock",
    },
  ],
  // CPM Analysis
  [
    {
      routeName: "CPM",
      routePath: "/CPM/CPM-analysis",
      placeholder: "Client Project Management",
    },
    {
      routeName: "CPM Finance",
      routePath: "/CPM/report",
    },
  ],
  // Paytm qc
  [
    // { routeName: "Paytm QC Upload", routePath: "/paytm-qc/upload", key: 0 },
    // { routeName: "Paytm QC Update", routePath: "/paytm-qc/update", key: 1 },
    {
      routeName: "Paytm QC Report",
      routePath: "/analysis/paytm-qc",
    },
  ],
  // Paytm refurbushment
  [
    {
      routeName: "Paytm Refurbishment",
      routePath: "/analysis/paytm-refurbishment",
    },
    {
      routeName: "Paytm MIN Register",
      routePath: "/analysis/paytm-refurbishment/register",
    },
  ],
  // PPR links
  [
    { routeName: "Create PPR", routePath: "/create-ppr" },
    { routeName: "Pending PPR", routePath: "/pending-ppr" },
    {
      routeName: "Completed PPR",
      routePath: "/completed-ppr",
    },
  ],
  // Material Requisition links
  [
    {
      routeName: "Material Requisition with BOM",
      routePath: "/reqWithBom",
    },
    {
      routeName: "Material Requisition without BOM",
      routePath: "/reqWithoutBom",
    },
  ],
  // SF To REJ links
  [
    { routeName: "SF to REJ", routePath: "/sf-to-rej" },
    {
      routeName: "View Transactions",
      routePath: "/transaction-sf-to-rej",
    },
  ],
  // SF To SF links
  [
    { routeName: "SF to SF", routePath: "/sf-to-sf" },
    {
      routeName: "View Transactions",
      routePath: "/transaction-sf-to-sf",
    },
  ],

  // Create QC ALl
  [
    { routeName: "Print QCA Label", routePath: "/print-qc-label" },
    { routeName: "QC Check", routePath: "/qccheck" },
    { routeName: "QC Report", routePath: "/mes-report-qc" },
  ],
  // Create QC ALl
  [
    { routeName: "Create Sample", routePath: "/sample-qc" },
    {
      routeName: "Pending Sample",
      routePath: "/pending-qc",
    },
    {
      routeName: "Completed Sample",
      routePath: "/completed-qc",
    },
    { routeName: "QC Report", routePath: "/report-qc" },
  ],
  [
    {
      routeName: "JW Update Report",
      routePath: "/jw-update",
    },
  ],
  [{ routeName: "Location", routePath: "/location" }],
  // project master
  [
    {
      routeName: "Projects",
      routePath: "/master/reports/projects",
    },
  ],
  // reports Master
  [
    {
      routeName: "R19 MTD",
      routePath: "/master/reports/r19",
    },
  ],
  // clients
  [
    {
      routeName: "Client",
      routePath: "/tally/clients/add",
    },
    // {
    //   routeName: "View Client",
    //   routePath: "/tally/clients/view",
    // },
  ],
  // app reference setup
  [
    {
      routeName: "Ap Bill Setup",
      routePath: "/tally/vouchers/reference/setup",
    },
    {
      routeName: "Ap Payment Setup",
      routePath: "/tally/vouchers/reference/payment",
    },
    {
      routeName: "Ap Report",
      routePath: "/tally/vouchers/reference/report",
    },
    // {
    //   routeName: "Ap Vendor Report",
    //   routePath: "/tally/vouchers/reference/vendorReport",
    // },
    // {
    //   routeName: "Accounts Payable",
    //   routePath: "/tally/vouchers/reference/payableReport",
    // },
  ],
  //  Finance Reports
  [
    {
      routeName: "Trial Balance Report",
      routePath: "/tally/reports/trial-balance-report",
    },
    {
      routeName: "Balance Sheet",
      routePath: "/tally/reports/balance-sheet",
    },
    {
      routeName: "P & L Report",
      routePath: "/tally/reports/profitloss-report",
    },
    {
      routeName: "Day Book",
      routePath: "/tally/reports/day-book",
    },
    {
      routeName: "Ageing Report",
      routePath: "/tally/vouchers/reference/payableReport",
    },
    {
      routeName: "TDS Report",
      routePath: "/tally/vouchers/reference/tdsReport",
    },
    {
      routeName: "GSTR1",
      routePath: "/tally/vouchers/reference/gst/gstReport1",
    },
    {
      routeName: "MIS Report",
      routePath: "/tally/vouchers/reference/misReport",
    },
  ],
  // // debit note
  // [
  //   {
  //     routeName: "Debit Note",
  //     routePath: "/tally/debit-note/create",
  //   },
  //   {
  //     routeName: "Debit Note Register",
  //     routePath: "/tally/debit-note/report",
  //   },
  // ],
  // sop module
  [
    {
      routeName: "SOP's",
      routePath: "/sop",
    },
  ],
  [
    {
      routeName: "Sales Register",
      routePath: "/sales-register",
    },
    {
      routeName: "Create Invoice",
      routePath: "/invoice/create",
    },
    {
      routeName: "Draft Invoices",
      routePath: "/draft-invoices",
    },
    {
      routeName: "Final Invoices",
      routePath: "/final-invoices",
    },
  ],
  // sales create
  [
    {
      routeName: "Create Sales Order",
      routePath: "/sales/order/create",
    },
    {
      routeName: "Sales Order Register",
      routePath: "/sales/order/register",
    },
    {
      routeName: "Shipment",
      routePath: "/sales/order/shipments",
    },
    {
      routeName: "Challan",
      routePath: "/sales/order/challan",
    },
  ],
  // mes links
  [
    {
      routeName: "Create Process",
      routePath: "/mes/process/create",
    },
    {
      routeName: "Map Process",
      routePath: "/mes/process/map",
    },
  ],
  // gst reco
  [
    {
      routeName: "Add GST Data",
      routePath: "/addgstdetails",
    },
    {
      routeName: "Add Book Data",
      routePath: "/addbookdetails",
    },
    {
      routeName: "Reconciled Details",
      routePath: "/viewreconciled",
    },
    {
      routeName: "Summary",
      routePath: "/viewsummary",
    },
    {
      routeName: "view book Data",
      routePath: "/viewbookdata",
    },
    {
      routeName: "view GST Data",
      routePath: "/viewgstdata",
    },
  ],
  // vendor reco
  [
    {
      routeName: "Vendor Reconciliation",
      routePath: "/vendorreco",
    },
    {
      routeName: "View Reconciliations",
      routePath: "/viewvendorreco",
    },
  ],
  // task manager links
  [
    {
      routeName: "Tasks(Admin)",
      routePath: "/tasks/admin",
    },
    {
      routeName: "Tasks",
      routePath: "/tasks/user",
    },
  ],
  [
    // {
    //   routeName: "All Pages",
    //   routePath: "/controlPanel/allPages",
    // },
    // {
    //   routeName: "All Users",
    //   routePath: "/controlPanel/allUsers",
    // },
    ///
    {
      routeName: "Registered Users",
      routePath: "/controlPanel/registeredUsers",
    },
  ],
  [
    {
      routeName: "GSTR1",
      routePath: "/tally/vouchers/reference/gst/gstReport1",
    },
  ],
];
export default links;
