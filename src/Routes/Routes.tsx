import React from "react";
import {
  Services,
  Material,
  PendingApproval,
  Login,
  // MaterialTransaction,
  TransactionIn,
  TransactionOut,
  CompletedFG,
  PendingFG,
  CreateFGOut,
  ViewFGOut,
  Rejection,
  ItemAllLogs,
  ItemLocationLog,
  R1,
  ReqWithBom,
  ReqWithoutBom,
  CreatePPR,
  PendingPPR,
  CreatePo,
  ManagePO,
  CompletedPo,
  Uom,
  Product,
  Group,
  Location,
  BillingAddress,
  CreateBom,
  HsnMap,
  Vendor,
  AddVendor,
  RmtoRm,
  PendingTransfer,
  ViewTransaction,
  ReToRej,
  TransactionRej,
  CreateDC,
  ManageDC,
  VendorPricingUpload,
  CreateGP,
  ManageGatePass,
  SKUCosting,
  SampleQC,
  PendingQC,
  CompletedQC,
  ReportQC,
  MaterialTransfer,
  MaterialTransferReport,
  ViewMin,
  CreatePhysical,
  ViewPhysical,
  SkuQuery,
  Q4,
  MaterialInWithoutPO,
  MaterialInWithPO,
  Messenger,
  Profile,
  Page404,
  CPMAnalysis,
  CreateJW,
  POAnalysis,
  JwRmChallan,
  JwIssue,
  JwsfInward,
  JwrmReturn,
  JwCompleted,
  UpdateRM,
  ReverseMin,
  PaytmQCReport,
  MaterialRequisitionRequest,
  JWSupplementary,
  CPMMaster,
  SFGMIN,
  R19Master,
  JwPendingRequest,
  PaytmRefurbishmentMIN,
  ShippingAddress,
  MINRegister,
  FirstLogin,
  Drive,
  PoApproval,
  JWVendorPricingUpload,
  Invoice,
  DraftInvoices,
  FinalInvoices,
  QueryQ5,
  ManageBom,
  DisabledBom,
  CreateProcess,
  MapProcesses,
  WoAnalysis,
  WoCompleted,
  WoCreateChallan,
  WoViewChallan,
  PrintQCALabel,
  MesQcaReport,
  AddClientInfo,
  ViewandEditClient,
  PartCodeConversion,
  ProductMIN,
  Dashboard,
  JWUpdateRate,
  CreateBranchTransferChallan,
  ViewBranchTransfer,
  UpdateComponent,
  EWayBill,
  CategoryMaster,
  StockControl,
  AdminTasks,
  UserTasks,
  CreateSalesOrder,
  AddGstDetails,
  AddBookDetails,
  ReconciledDetails,
  Summary,
  ViewBookData,
  ViewGstData,
  WeeklyAudit,
  Agreement,
  ViewAgreement,
  AddAgreementType,
  AllPages,
  AllUsers,
} from "@/Pages/index.jsx";

import {
  CreateMaster,
  Ledger,
  ChartOfAccounts,
  NatureOfTDS,
  NatureOfTCS,
  BlockTCS,
  LedgerReport,
  VBTReport,
  VBT1,
  VBT2,
  VBT3,
  VBT4,
  VBT5,
  JournalPosting,
  JVReport,
  BankReceipts,
  BankPayments,
  VoucherReport,
  Contra1,
  Contra2,
  Contra3,
  Contra4,
  ContraReport,
  VBT6,
  CashPaymentResister,
  CashPayment,
  CashReceiptReport,
  CashReceipt,
  AddClient,
  ViewClients,
  AppPaymentSetup,
  AppReport,
  Reference,
  TrialBalReport,
  BalanceSheet,
  ProfilLossReport,
  DebitNote,
  DebitNoteReport,
  DayBook,
  VBT7,
  DebitJournalVoucher,
  DebitRegister,
  CreditJournal,
  CreditReport,
  CPMReport,
  AppVendorReport,
  VendorReconcilation,
  ViewReconcilation,
} from "@/FinancePages/index.jsx";
//GST report
import GstReport from "@/FinancePages/Finance/GstReport.jsx";
import R11 from "@/Pages/Reports/R/R11.jsx";
import R12 from "@/Pages/Reports/R/R12.jsx";
import R2 from "@/Pages/Reports/R/R2.jsx";
import R3 from "@/Pages/Reports/R/R3.jsx";
import R4 from "@/Pages/Reports/R/R4.jsx";
import R5 from "@/Pages/Reports/R/R5.jsx";
import R6 from "@/Pages/Reports/R/R6.jsx";
import R7 from "@/Pages/Reports/R/R7.jsx";
import R8 from "@/Pages/Reports/R/R8/index.jsx";
import R9 from "@/Pages/Reports/R/R9.jsx";
import R10 from "@/Pages/Reports/R/R10.jsx";
import R13 from "@/Pages/Reports/R/R13.jsx";
import R14 from "@/Pages/Reports/R/R14.jsx";
import R15 from "@/Pages/Reports/R/R15.jsx";
import R16 from "@/Pages/Reports/R/R16.jsx";
import R17 from "@/Pages/Reports/R/R17.jsx";
import R18 from "@/Pages/Reports/R/R18.jsx";
import R19 from "@/Pages/Reports/R/R19.jsx";
import R20 from "@/Pages/Reports/R/R20.jsx";
import R21 from "@/Pages/Reports/R/R21.jsx";
import R22 from "@/Pages/Reports/R/R22.jsx";
import R24 from "@/Pages/Reports/R/R24.jsx";
import R25 from "@/Pages/Reports/R/R25.jsx";
import R26 from "@/Pages/Reports/R/R26.jsx";
import R27 from "@/Pages/Reports/R/R27.jsx";
import R28 from "@/Pages/Reports/R/R28.jsx";
import R29 from "@/Pages/Reports/R/R29.jsx";
import CompletedPPR from "@/Pages/Production/Production & Planning/CompletedPPR.jsx";
import AccountsPayableReport from "@/FinancePages/Finance/vouchers/AppReference/AccountsPayableReport.jsx";
import VBTRecords from "@/FinancePages/Finance/VBTRecords/VBTRecords.jsx";
import DebitCentralizedRegister from "@/FinancePages/Finance/Debit/DebitCentralizedRegister.jsx";
import SalesRegister from "@/Pages/Invoice/SalesRegister/SalesRegister.jsx";
import QaProcess from "@/Pages/Master/QAProcess/QaProcess.jsx";
import QaProcessMap from "@/Pages/Master/QAProcess/QaProcessMap.jsx";
import CreateWO from "@/Pages/Workorder/CreateWo.jsx";
import Qctest from "@/Pages/Production/testqca/Qctest.jsx";
import VBTMainTable from "@/FinancePages/Finance/VendorBillPosting/FormVBT/VBTMainTable.jsx";
import TdsReport from "@/FinancePages/Report/TdsReport.jsx";
import MisReport from "@/FinancePages/Report/MisReport.jsx";
import WoShipment from "@/Pages/Workorder/WoShipment.jsx";
import SalesORderRegister from "@/Pages/Sales/SalesOrder/SalesOrderRegister/SalesORderRegister.jsx";
import PartCodeConversionReport from "@/Pages/Store/PartCodeConversionReport/PartCodeConversionReport.jsx";
import Pending from "@/Pages/SFTransfer/Pending.jsx";
import Addparty from "@/Pages/Legal/master/Addparty.jsx";

import WoReport from "@/Pages/Workorder/WoReport.jsx";
import RnC from "@/Pages/Legal/Registration&Certificates/RnC.jsx";
import ViewRnC from "@/Pages/Legal/Registration&Certificates/ViewRnC.jsx";
import OneLogIn from "@/Pages/Login/OneLogIn.jsx";
import R30 from "@/Pages/Reports/R/R30.jsx";
import R31 from "@/Pages/Reports/R/R31.jsx";
import PendingPhysicalStock from "@/Pages/Store/PhysicalStock/Pending.jsx";
import RejectedPhysicalStock from "@/Pages/Store/PhysicalStock/Rejected.jsx";
import EditSalesOrder from "@/Pages/Sales/SalesOrder/edit/index.jsx";
import RegisteredUser from "@/Pages/ControlPanel/RegisteredUser/RegisteredUser.jsx";
import ShipmentsList from "@/Pages/Sales/SalesOrder/SalesOrderRegister/Shipments/ShipmentsList.jsx";
import Challan from "@/Pages/Sales/SalesOrder/SalesOrderRegister/Challan/Challan.jsx";

import R32 from "@/Pages/Reports/R/R32.jsx";
import Index from "@/Pages/Query/ClosingStock/Index.jsx";
import routeConstants from "./routeConstants.js";
import CreateScrapeChallan from "@/Pages/Workorder/components/WoCreateChallan/CreateScrapeChallan.jsx";
import ProcurementDashboard from "@/Pages/Dashboard/ProcurementDashboard.jsx";
//
import ProductionMIS from "@/Pages/Production/ProductionMIS/ProductionMIS.jsx";
import R33 from "@/Pages/Reports/R/R33.tsx";

import CreateFgReturn from "@/Pages/Store/FgReturn/CreateFgReturn.jsx";
import PendingReversal from "@/Pages/Store/FgReturn/PendingReversal/PendingReversal.jsx";
import ViewDocuments from "@/Pages/Store/Transaction/Modal/ViewDocuments.jsx";
import CompletedFgReturn from "@/Pages/Store/FgReturn/CompletedReversal";
import R34 from "@/Pages/Reports/R/R34/index.js";
import PIAScan from "@/Pages/Store/MINLabel/PIAScan.js";
import Products from "@/Pages/R&D/products/index.js";
import BOMCreate from "@/Pages/R&D/bom/create/index.js";
import BOMList from "@/Pages/R&D/bom/list/index.js";
import FARUpload from "@/Pages/far/index.js";

// import CreateAsset from "@/Pages/fixeassetmodule/CreateAsset/CreateAsset";
// import ViewAsset from "@/Pages/fixeassetmodule/ViewAsset";
// import Depreciation from "@/Pages/fixeassetmodule/Depreciation";

const Routes = [
  {
    path: "/login",
    main: () => <Login />,
  },
  {
    path: "/ims/login",
    main: () => <OneLogIn />,
  },
  {
    path: "/",
    main: () => <Dashboard />,
  },
  {
    path: "/dashboardProcurement",
    main: () => <ProcurementDashboard />,
  },
  {
    path: "/material",
    main: () => <Material />,
  },
  {
    path: "/master/component/category",
    main: () => <CategoryMaster />,
  },
  {
    path: "/master/component/:componentKey",
    main: () => <UpdateComponent />,
  },
  {
    path: "/services",
    main: () => <Services />,
  },
  {
    path: "/stockControl",
    main: () => <StockControl />,
  },
  {
    path: "/uom",
    main: () => <Uom />,
  },
  {
    path: "/masters/products/fg",
    main: () => <Product />,
  },
  {
    path: "/masters/products/sfg",
    main: () => <Product />,
  },
  {
    path: "/group",
    main: () => <Group />,
  },
  {
    path: "/location",
    main: () => <Location />,
  },
  {
    path: "/billingAddress",
    main: () => <BillingAddress />,
  },
  {
    path: "/ShippingAddress",
    main: () => <ShippingAddress />,
  },
  {
    path: "/vendor",
    main: () => <Vendor />,
  },
  {
    path: "/add-vendor",
    main: () => <AddVendor />,
  },
  // {
  //   path: "/branch-edit/:id",
  //
  //   main: () => <BranchEdit />,
  // },
  {
    path: "/hsn-map",
    main: () => <HsnMap />,
  },
  // {
  //   path: "/doc_numbering",
  //   main: () => <DocNumbering />,
  // },
  {
    path: "/master/bom/create",
    main: () => <CreateBom />,
  },

  {
    path: "/master/bom/manage/fg",
    main: () => <ManageBom />,
  },
  {
    path: "/master/bom/manage/sfg",
    main: () => <ManageBom />,
  },
  {
    path: "/master/bom/disabled",
    main: () => <DisabledBom />,
  },

  {
    path: "/approved-transaction",
    main: () => <PendingApproval />,
  },
  // {
  //   path: "/material-transaction",
  //   main: () => <MaterialTransaction />,
  // },
  {
    path: "/uploaded-documents",
    main: () => <ViewDocuments />,
  },
  {
    path: "/transaction-In",
    main: () => <TransactionIn />,
  },
  {
    path: "/transaction-Out",
    main: () => <TransactionOut />,
  },
  {
    path: "/completedFG",
    main: () => <CompletedFG />,
  },
  {
    path: "/pendingFG",
    main: () => <PendingFG />,
  },
  {
    path: "/createFgReturn",
    main: () => <CreateFgReturn />,
  },
  {
    path: "/pendingFgReturn",
    main: () => <PendingReversal />,
  },
  {
    path: "/completedFgReturn",
    main: () => <CompletedFgReturn />,
  },
  {
    path: "/create-fgOut",
    main: () => <CreateFGOut />,
  },
  {
    path: "/view-fgOut",
    main: () => <ViewFGOut />,
  },

  {
    path: "/rm-to-rm",
    exact: true,
    main: () => <RmtoRm />,
  },
  // {
  //   path: "/sf-to-rm",
  //   exact: true,
  //   main: () => <RmtoRm />,
  // },
  {
    path: "/view-transaction",
    exact: true,
    main: () => <ViewTransaction />,
  },
  {
    path: "/re-to-rej",
    exact: true,
    main: () => <ReToRej />,
  },
  {
    path: "/trans-rej",
    exact: true,
    main: () => <TransactionRej />,
  },
  {
    path: "/pending-transfer",
    exact: true,
    main: () => <PendingTransfer />,
  },
  {
    path: "/rejection",
    exact: true,
    main: () => <Rejection />,
  },
  {
    path: "/create-dc",
    exact: true,
    main: () => <CreateDC />,
  },
  {
    path: "/manage-dc",
    exact: true,
    main: () => <ManageDC />,
  },
  {
    path: "/create-gp",
    exact: true,
    main: () => <CreateGP />,
  },
  {
    path: "/manage-gp",
    exact: true,
    main: () => <ManageGatePass />,
  },
  {
    path: "/sku-query",
    exact: true,
    main: () => <SkuQuery />,
  },
  {
    path: "/q4-query",
    exact: true,
    main: () => <Q4 />,
  },
  {
    path: "/q5",
    main: () => <QueryQ5 />,
  },
  {
    path: "/q6",
    main: () => <Index />,
  },
  // production MIS
  {
    path: "/production/prodMis",
    main: () => <ProductionMIS />,
  },
  // MES QCA
  {
    path: "/mes-report-qc",
    exact: true,
    main: () => <MesQcaReport />,
  },
  {
    path: "/print-qc-label",
    main: () => <PrintQCALabel />,
  },
  {
    path: "/qccheck",
    exact: true,
    main: () => <Qctest />,
  },
  // QCA
  {
    path: "/sample-qc",
    exact: true,
    main: () => <SampleQC />,
  },
  {
    path: "/pending-qc",
    exact: true,
    main: () => <PendingQC />,
  },
  {
    path: "/completed-qc",
    exact: true,
    main: () => <CompletedQC />,
  },
  {
    path: "/report-qc",
    exact: true,
    main: () => <ReportQC />,
  },
  {
    path: "/warehouse/physical/create",
    exact: true,
    main: () => <CreatePhysical />,
  },
  {
    path: "/warehouse/physical/pending",
    exact: true,
    main: () => <PendingPhysicalStock />,
  },
  {
    path: "/warehouse/physical/rejected",
    exact: true,
    main: () => <RejectedPhysicalStock />,
  },
  {
    path: "/warehouse/physical/view",
    exact: true,
    main: () => <ViewPhysical />,
  },
  // sf to sf
  {
    path: "/sf-to-sf",
    exact: true,
    main: () => <MaterialTransfer type="sftosf" title="SF to SF" />,
  },
  {
    path: "/sf-to-rej",
    exact: true,
    main: () => <MaterialTransfer type="sftorej" title="SF to REJ" />,
  },
  {
    path: "/transaction-sf-to-sf",
    exact: true,
    main: () => <MaterialTransferReport type="sftosf" />,
  },

  {
    path: "/transaction-sf-to-rej",
    exact: true,
    main: () => <MaterialTransferReport type="sftorej" />,
  },
  // qc process
  //qa process
  {
    path: "/master/qa-process",
    exact: true,
    main: () => <QaProcess />,
  },
  {
    path: "/master/qa-process-map",
    exact: true,
    main: () => <QaProcessMap />,
  },
  // Reports
  {
    path: "/item-all-logs",
    main: () => <ItemAllLogs />,
  },
  {
    path: "/item-location-logs",
    main: () => <ItemLocationLog />,
  },
  {
    path: "/r1",
    main: () => <R1 />,
  },
  {
    path: "/r2",
    main: () => <R2 />,
  },
  {
    path: "/r3",
    main: () => <R3 />,
  },
  {
    path: "/r4",
    main: () => <R4 />,
  },
  {
    path: "/r5",
    main: () => <R5 />,
  },
  {
    path: "/r6",
    main: () => <R6 />,
  },
  {
    path: "/r7",
    main: () => <R7 />,
  },
  {
    path: "/r8",
    main: () => <R8 />,
  },
  {
    path: "/r9",
    main: () => <R9 />,
  },
  {
    path: "/r10",
    main: () => <R10 />,
  },

  {
    path: "/r11",
    main: () => <R11 />,
  },
  {
    path: "/r12",
    main: () => <R12 />,
  },
  {
    path: "/r13",
    main: () => <R13 />,
  },
  {
    path: "/r14",
    main: () => <R14 />,
  },
  {
    path: "/r15",
    main: () => <R15 />,
  },
  {
    path: "/r16",
    main: () => <R16 />,
  },
  {
    path: "/r17",
    main: () => <R17 />,
  },
  {
    path: "/r18",
    main: () => <R18 />,
  },
  {
    path: "/r19",
    main: () => <R19 />,
  },
  {
    path: "/r20",
    main: () => <R20 />,
  },
  {
    path: "/r21",
    main: () => <R21 />,
  },
  {
    path: "/r22",
    main: () => <R22 />,
  },
  {
    path: "/r24",
    main: () => <R24 />,
  },
  {
    path: "/r25",
    main: () => <R25 />,
  },
  {
    path: "/r26",
    main: () => <R26 />,
  },
  {
    path: "/r27",
    main: () => <R27 />,
  },
  // R28
  {
    path: "/r28",
    main: () => <R28 />,
  },
  {
    path: "/r29",
    main: () => <R29 />,
  },
  {
    path: "/r30",

    main: () => <R30 />,
  },
  {
    path: "/r31",

    main: () => <R31 />,
  },

  {
    path: "/r32",

    main: () => <R32 />,
  },
  {
    path: "/r33",

    main: () => <R33 />,
  },
  {
    path: "/r34",

    main: () => <R34 />,
  },
  {
    path: "/reqWithBom",
    main: () => <ReqWithBom />,
  },
  {
    path: "/reqWithoutBom",
    main: () => <ReqWithoutBom />,
  },
  {
    path: "/create-ppr",
    main: () => <CreatePPR />,
  },
  {
    path: "/pending-ppr",
    main: () => <PendingPPR />,
  },
  {
    path: "/completed-ppr",
    main: () => <CompletedPPR />,
  },
  // Purchase Order
  {
    path: "/create-po",
    main: () => <CreatePo />,
  },

  {
    path: "/manage-po",
    main: () => <ManagePO />,
  },
  {
    path: "/completed-po",
    main: () => <CompletedPo />,
  },
  {
    path: "/approval-po",
    main: () => <PoApproval />,
    text: "Po Approval",
  },
  {
    path: "/vendor-pricing",
    main: () => <VendorPricingUpload />,
  },
  {
    path: "/dashboard/sku_costing",
    main: () => <SKUCosting />,
  },
  {
    path: "/warehouse/print-view-min",
    main: () => <ViewMin />,
  },
  {
    path: "/warehouse/pia-scan",
    main: () => <PIAScan />,
  },

  {
    path: "/warehouse/material-in",
    main: () => <MaterialInWithoutPO />,
  },
  {
    path: "/warehouse/material-in-with-po",
    main: () => <MaterialInWithPO />,
  },
  {
    path: "/warehouse/material-in-product",
    main: () => <ProductMIN />,
  },
  {
    path: "/master/reports/projects",
    main: () => <CPMMaster />,
  },
  {
    path: "/master/reports/r19",
    main: () => <R19Master />,
  },
  {
    path: "/messenger",
    main: () => <Messenger />,
  },
  {
    path: "/myProfile",
    main: () => <Profile />,
  },
  // CPM
  {
    path: "/CPM/CPM-analysis",
    main: () => <CPMAnalysis />,
  },
  {
    path: "/CPM/report",
    main: () => <CPMReport />,
  },

  // Jobwork
  {
    path: "/create-jw",
    main: () => <CreateJW />,
  },
  {
    path: "/po-analysis",
    main: () => <POAnalysis />,
  },
  {
    path: "/jw-rw-issue",
    main: () => <JwIssue />,
  },
  {
    path: "/jw-rw-challan",
    main: () => <JwRmChallan />,
  },
  {
    path: "/jw-sf-inward",
    main: () => <JwsfInward />,
  },
  {
    path: "/jw-rm-return",
    main: () => <JwrmReturn />,
  },
  {
    path: "/jw-completed",
    main: () => <JwCompleted />,
  },
  {
    path: "/jobwork/update/supplementary",
    main: () => <JWSupplementary />,
  },
  {
    path: "/jobwork/update/rate",
    main: () => <JWUpdateRate />,
  },
  {
    path: "/jw-issue-challan",
    main: () => <JwPendingRequest />,
  },
  {
    path: "/jw-vendor-pricing",
    main: () => <JWVendorPricingUpload />,
  },
  {
    path: "/update-rm",
    main: () => <UpdateRM />,
  },
  {
    path: "/reverse-min",
    main: () => <ReverseMin />,
  },

  {
    path: "/analysis/paytm-qc",
    main: () => <PaytmQCReport />,
  },
  {
    path: "/analysis/paytm-refurbishment",
    main: () => <PaytmRefurbishmentMIN />,
  },
  {
    path: "/analysis/paytm-refurbishment/register",
    main: () => <MINRegister />,
  },
  {
    path: "/material-requisition-request",
    main: () => <MaterialRequisitionRequest />,
  },
  // Vendor Jobwork modules
  {
    path: "/jobwork/vendor/sfg/min",
    main: () => <SFGMIN />,
  },
  //Work Order

  {
    path: "/createwo",
    main: () => <CreateWO />,
  },

  {
    path: "/warehouse/prod-return-MIN",
    main: () => <Pending />,
  },
  {
    path: "/woanalysis",
    main: () => <WoAnalysis />,
  },
  {
    path: "/wocompleted",
    main: () => <WoCompleted />,
  },

  {
    path: "/woreport",
    main: () => <WoReport />,
  },
  {
    path: "/wocreatechallan",
    main: () => <WoCreateChallan />,
  },
  {
    path: "/woShipment",
    main: () => <WoShipment />,
  },
  //
  {
    path: "/wocreatescrapechallan",
    main: () => <CreateScrapeChallan />,
  },
  {
    path: "/woviewchallan",
    main: () => <WoViewChallan />,
  },
  // {
  //   path: "/addClient",
  //   exact: true,
  //   main: () => <AddClientInfo />,
  // },
  {
    path: "/clientView",
    exact: true,
    main: () => <ViewandEditClient />,
  },
  // finance start here
  {
    path: "/tally/create_master",
    main: () => <CreateMaster />,
  },
  {
    path: "/tally/vouchers/reference/gst/gstReport1",
    main: () => <GstReport />,
  },
  {
    path: "/tally/ledger",
    main: () => <Ledger />,
  },
  {
    path: "/tally/ChartOfAccounts",
    main: () => <ChartOfAccounts />,
  },
  {
    path: "/tally/nature_of_tds",
    main: () => <NatureOfTDS />,
  },
  {
    path: "/tally/nature_of_tcs",
    main: () => <NatureOfTCS />,
  },
  {
    path: "tally/block-tcs",
    main: () => <BlockTCS />,
  },
  {
    path: "/tally/ledger_report",
    main: () => <LedgerReport />,
  },
  {
    path: "/tally/ledger_report/:code",
    main: () => <LedgerReport />,
  },
  {
    path: "/tally/vendorbillposting/VB1",
    main: () => <VBTMainTable />,
  },
  {
    path: "/tally/vendorbillposting/VB2",
    main: () => <VBTMainTable />,
  },

  {
    path: "/tally/vendorbillposting/VB3",
    main: () => <VBTMainTable />,
  },
  // {
  //   path: "/tally/vendorbillposting/VB3",
  //   main: () => <VBT3 />,
  // },
  {
    path: "/tally/vendorbillposting/VB4",
    main: () => <VBTMainTable />,
  },
  {
    path: "/tally/vendorbillposting/VB5",
    main: () => <VBTMainTable />,
  },

  {
    path: "/tally/vendorbillposting/VB6",
    main: () => <VBTMainTable />,
  },

  {
    path: "/tally/vendorbillposting/VB7",
    main: () => <VBTMainTable />,
  },
  {
    path: "/tally/vendorbillposting/vendor_bill_records",
    main: () => <VBTRecords />,
  },
  {
    path: "/tally/vendorbillposting/report",
    main: () => <VBTReport />,
  },
  {
    path: "/tally/journal-posting",
    main: () => <JournalPosting />,
  },
  {
    path: "/tally/journal-posting/jv01",
    main: () => <JournalPosting />,
  },
  {
    path: "/tally/journal-posting/report",
    main: () => <JVReport />,
  },

  {
    path: "/tally/credit-journal-posting",
    main: () => <CreditJournal />,
  },
  {
    path: "/tally/credit-journal/report",
    main: () => <CreditReport />,
  },
  {
    path: "/tally/vouchers/bank-payment",
    main: () => <BankPayments />,
  },
  {
    path: "/tally/vouchers/bank-receipts",
    main: () => <BankReceipts />,
  },
  {
    path: "/tally/vouchers/bank_payment/report",
    main: () => <VoucherReport />,
  },
  {
    path: "/tally/vouchers/bank_receipts/report",
    main: () => <VoucherReport />,
  },
  {
    path: "/tally/contra/1",
    main: () => <Contra1 />,
  },
  {
    path: "/tally/contra/2",
    main: () => <Contra2 />,
  },
  {
    path: "/tally/contra/3",
    main: () => <Contra3 />,
  },
  {
    path: "/tally/contra/4",
    main: () => <Contra4 />,
  },
  {
    path: "/tally/contra/report",
    main: () => <ContraReport />,
  },
  {
    path: "/tally/vouchers/cash_payment/report",
    main: () => <CashPaymentResister />,
  },
  {
    path: "/tally/vouchers/cash-payment",
    main: () => <CashPayment />,
  },
  {
    path: "/tally/vouchers/cash_receipts/report",
    main: () => <CashReceiptReport />,
  },
  {
    path: "/tally/vouchers/cash-receipt",
    main: () => <CashReceipt />,
  },
  {
    path: "/tally/clients/add",
    main: () => <AddClient />,
  },
  {
    path: "/tally/clients/view",
    main: () => <ViewClients />,
  },
  {
    path: "/tally/vouchers/reference/setup",
    main: () => <Reference />,
  },
  {
    path: "/tally/vouchers/reference/payment",
    main: () => <AppPaymentSetup />,
  },
  {
    path: "/tally/vouchers/reference/report",
    main: () => <AppReport />,
  },
  {
    path: "/tally/vouchers/reference/vendorReport",
    main: () => <AppVendorReport />,
  },
  {
    path: "/tally/vouchers/reference/tdsReport",
    main: () => <TdsReport />,
  },
  //mis report
  {
    path: "/tally/vouchers/reference/misReport",
    main: () => <MisReport />,
  },
  {
    path: "/tally/vouchers/reference/payableReport",
    main: () => <AccountsPayableReport />,
  },
  {
    path: "/tally/reports/trial-balance-report",
    main: () => <TrialBalReport />,
  },
  {
    path: "/tally/reports/balance-sheet",
    main: () => <BalanceSheet />,
  },
  {
    path: "/tally/reports/profitloss-report",
    main: () => <ProfilLossReport />,
  },

  // debit note without vbt
  {
    path: "/tally/debit-note/report",
    main: () => <DebitNoteReport />,
  },
  {
    path: "/tally/debit-note/create",
    main: () => <DebitJournalVoucher />,
  },
  {
    path: "/tally/debit-journal/report",
    main: () => <DebitRegister />,
  },
  {
    path: "/tally/debit-journal/general-report",
    main: () => <DebitCentralizedRegister />,
  },
  //legal
  {
    path: "/legal/createagreement",
    // exact: true,
    // dept: "legal",
    main: () => <Agreement />,
  },
  {
    path: "/legal/viewagreement",
    // exact: true,
    // dept: "legal",
    main: () => <ViewAgreement />,
  },
  {
    path: "/legal/creater&c",
    // exact: true,
    // dept: "legal",
    main: () => <RnC />,
  },
  {
    path: "/legal/viewr&c",
    // exact: true,
    // dept: "legal",
    main: () => <ViewRnC />,
  },
  {
    path: "/legal/addparty",
    // exact: true,
    // dept: "legal",
    main: () => <Addparty />,
  },
  {
    path: "/legal/addagreementtype",
    // exact: true,
    // dept: "legal",
    main: () => <AddAgreementType />,
  },

  // debit note with vbt

  { path: "/tally/debit-note/vbt/create", main: () => <DebitNote /> },
  // debit note test
  // {
  //   path: "/tally/debit-note/report",
  //   main: () => <DebitNoteReport />,
  // },
  // {
  //   path: "/tally/debit-note/create-test",
  //   main: () => <DebitNoteTest />,
  // },
  // {
  //   path: "/tally/debit-journal/report",
  //   main: () => <DebitRegister />,
  // },
  {
    path: "/tally/reports/day-book",
    main: () => <DayBook />,
  },
  {
    path: "/first-login",
    main: () => <FirstLogin />,
  },
  {
    path: "/sop",
    main: () => <Drive />,
  },
  {
    path: "/invoice/create",
    main: () => <Invoice />,
  },
  {
    path: "/viewbranchtransfer",
    main: () => <ViewBranchTransfer />,
  },
  {
    path: "/invoice/edit/:invoiceId",
    main: () => <Invoice />,
  },
  {
    path: "/draft-invoices",
    main: () => <DraftInvoices />,
  },
  {
    path: "/final-invoices",
    main: () => <FinalInvoices />,
  },
  {
    path: "/sales-register",
    main: () => <SalesRegister />,
  },

  {
    path: "/mes/process/create",
    main: () => <CreateProcess />,
  },
  {
    path: "/mes/process/map",
    main: () => <MapProcesses />,
  },
  {
    path: "/branchtransferchallan",
    main: () => <CreateBranchTransferChallan />,
  },
  {
    path: "/warehouse/part-code-conversion",
    main: () => <PartCodeConversion />,
  },
  // to be added
  {
    path: "/warehouse/part-code-conversion-report",
    main: () => <PartCodeConversionReport />,
  },
  {
    path: "/warehouse/e-way/jw/:jwId",
    main: () => <EWayBill />,
  },
  {
    path: "/tasks/admin",
    main: () => <AdminTasks />,
  },
  {
    path: "/tasks/user",
    main: () => <UserTasks />,
  },
  //over here
  {
    path: routeConstants.finance.vendor.reco.create,
    main: () => <VendorReconcilation />,
  },
  {
    path: routeConstants.finance.vendor.reco.report,
    main: () => <ViewReconcilation />,
  },
  // CreateSalesOrder
  {
    path: "/sales/order/create",
    main: () => <CreateSalesOrder />,
  },
  {
    path: "/sales/order/:orderId/edit",
    main: () => <EditSalesOrder />,
  },
  {
    path: "/sales/order/register",
    main: () => <SalesORderRegister />,
  },
  //
  {
    path: "/sales/order/shipments",
    main: () => <ShipmentsList />,
  },

  {
    path: "/sales/order/challan",
    main: () => <Challan />,
  },
  {
    path: "/sales/order/allocated",
    main: () => <AllocatedChallan />,
  },
  //gst reco
  {
    path: "/addgstdetails",
    main: () => <AddGstDetails />,
  },
  {
    path: "/addbookdetails",
    main: () => <AddBookDetails />,
  },
  {
    path: "/viewreconciled",
    main: () => <ReconciledDetails />,
  },
  {
    path: "/viewsummary",
    main: () => <Summary />,
  },
  {
    path: "/viewbookdata",
    main: () => <ViewBookData />,
  },
  {
    path: "/viewgstdata",
    main: () => <ViewGstData />,
  },
  //
  {
    path: "/weeklyaudit",
    main: () => <WeeklyAudit />,
  },
  {
    path: "/controlPanel/allPages",
    main: () => <AllPages />,
  },
  {
    path: "/controlPanel/allUsers",
    main: () => <AllUsers />,
  },
  // {
  //   path: "/assets/create",
  //   main: () => <CreateAsset />,
  // },
  // {
  //   path: "/assets/view",
  //   main: () => <ViewAsset />,
  // },
  // {
  //   path: "/assets/depreciation",
  //   main: () => <Depreciation />,
  // },
  //research and development
  {
    path: routeConstants.researchAndDevelopment.products,
    main: () => <Products />,
  },
  {
    path: routeConstants.researchAndDevelopment.bom.create,
    main: () => <BOMCreate />,
  },
  {
    path: routeConstants.researchAndDevelopment.bom.list,
    main: () => <BOMList />,
  },

  ///login
  {
    path: "/controlPanel/registeredUsers",
    main: () => <RegisteredUser />,
  },

  //research and development
  {
    path: routeConstants.researchAndDevelopment.products,
    main: () => <Products />,
  },

  // far upload
  {
    path: routeConstants.far.upload,
    main: () => <FARUpload />,
  },

  // should always be at the end
  {
    path: "*",
    main: () => <Page404 />,
  },
];

export default Routes;
