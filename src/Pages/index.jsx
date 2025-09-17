export { default as Login } from "./Login/Login";
export { default as ProductDetail } from "../Pages/Store/ProductDetail";
import { lazy } from "react";
// export { default as MaterialTransaction } from "./Store/MaterialTransaction/MaterialTransaction";

export { default as Uom } from "./Master/Uom.tsx";
export { default as Product } from "./Master/Products/Product";
export { default as Group } from "./Master/Group";
export { default as Location } from "./Master/Location";
export { default as BillingAddress } from "./Master/BillingAddress";
export { default as ShippingAddress } from "./Master/ShippingAddress/ShippingAddress";
export { default as CreateBom } from "./Master/Bom/CreateBom";
export { default as ManageBom } from "./Master/Bom/Manage";
export { default as DisabledBom } from "./Master/Bom/Disabled";
export { default as HsnMap } from "./Master/HSNMap/HsnMap.tsx";
export { default as DocNumbering } from "./Master/DocNumbering";
export { default as Vendor } from "./Master/Vendor/Vendor";
export { default as CPMMaster } from "./Master/projects/CPMMaster";
export { default as R19Master } from "./Master/reports/R19/R19Master";
export { default as CategoryMaster } from "./Master/Components/material/categoryMaster";
export { default as AddVendor } from "./Master/Vendor/AddVendor";

export { default as RmtoRm } from "./Store/MaterialTransfer/RmtoRm";
export { default as ViewTransaction } from "./Store/MaterialTransfer/ViewTransaction";
export { default as PendingTransfer } from "./Store/MaterialTransfer/PendingTransfer";
export { default as ReToRej } from "./Store/MaterialTransfer/RM-REJ/ReToRej";
export { default as TransactionRej } from "./Store/MaterialTransfer/RM-REJ/TransactionRej";
export { default as CreateDC } from "./Store/RGP_DC/CreateDC/CreateDC";
export { default as ManageDC } from "./Store/RGP_DC/ManageDC";
export { default as CreateGP } from "./Store/Gatepass/CreateGP";
export { default as ManageGatePass } from "./Store/Gatepass/ManageGatePass";
export { default as CreateFGOut } from "./Store/FG OUT/CreateFGOut";
export { default as ViewFGOut } from "./Store/FG OUT/ViewFGOut";
export { default as ViewMin } from "./Store/MINLabel/ViewMIN.jsx";

export { default as MaterialInWithoutPO } from "./Store/MaterialIn/MaterialInWithoutPO/MaterialInWithoutPO";
export { default as MaterialInWithPO } from "./Store/MaterialIn/MaterialInWithPO/MaterialInWithPO";
export { default as ExportMaterialInWithPO } from "./Store/MaterialIn/MaterialInWithPO/ExportMaterialInWithPO.jsx";

export { default as ProductMIN } from "./Store/MaterialIn/ProductMIN";

export { default as Rejection } from "./Store/Rejection/Rejection";

export { default as Material } from "./Master/Components/material/index.jsx";

export { default as UpdateComponent } from "./Master/Components/material/UpdateComponent.jsx";
// export { default as UpdateComponent } from "./Master/Components/UpdateComponent.jsx";
export { default as Services } from "../Pages/Master/Components/services/index.jsx";
export { default as StockControl } from "../Pages/Master/Components/stockControl/index.jsx";
export { default as TransactionIn } from "./Store/Transaction/TransactionIn";
export { default as TransactionOut } from "./Store/Transaction/TransactionOut";
export { default as CompletedFG } from "./Store/FoodGoods/CompletedFG";
export { default as PendingFG } from "./Store/FoodGoods/PendingFG";
export { default as CreatePhysical } from "./Store/PhysicalStock/CreatePhysical";
export { default as ViewPhysical } from "./Store/PhysicalStock/ViewPhysical";

// Reports
export { default as ItemAllLogs } from "./Reports/ItemAllLogs";
export { default as ItemLocationLog } from "./Reports/ItemLocationLog";
export { default as R1 } from "./Reports/R/R1";

// QCA
export const Dashboard = lazy(() => import("../new/pages/dashboard"));
export { default as SampleQC } from "./Production/Qca/SampleQC";
export { default as PendingQC } from "./Production/Qca/PendingQC";
export { default as CompletedQC } from "./Production/Qca/CompletedQC";
export { default as ReportQC } from "./Production/Qca/ReportQC";

// MES QCA

export { default as PrintQCALabel } from "./Production/Qca/PrintQCALabel";
export { default as MesQcaReport } from "./MES/report/MesQcReport.jsx";

// SF to rej
export { default as MaterialTransfer } from "./Production/Location Movement/MaterialTransfer";
// export { default as TransactionSF } from "./Production/Location Movement/TransactionSF";
export { default as MaterialTransferReport } from "./Production/Location Movement/MaterialTransferReport";
// export { default as TransactionSfToRej } from "./Production/Location Movement/TransactionSfToRej";

// Production Requisition ->  Material Requisition
export { default as ReqWithBom } from "./Production/Material Requisition/ReqWithBom";
export { default as ReqWithoutBom } from "./Production/Material Requisition/ReqWithoutBom";
export { default as CreatePPR } from "./Production/Production & Planning/CreatePPR";
export { default as PendingPPR } from "./Production/Production & Planning/PendingPPR/PendingPPR";
// export { default as CompletedPPR } from "./Production/Production & Planning/CompletedPPR";
// Purchase Order

export const CreatePO = lazy(() => import("../new/pages/procurement/CreatePO/CreatePO.tsx"));
export { default as CompletedPo } from "./PurchaseOrder/CompletedPO/CompletedPo";
export { default as ManagePO } from "./PurchaseOrder/ManagePO/ManagePo";
export { default as EditPO } from "./PurchaseOrder/ManagePO/EditPO/EditPO";
export { default as CreatePo } from "./PurchaseOrder/CreatePO/CreatePo";
export { default as VendorPricingUpload } from "./PurchaseOrder/VendorPricingUpload";
export { default as PoApproval } from "./PurchaseOrder/ManagePO/PoApproval/PoApproval";
export { default as JobworkApproval } from "./Jobwork/JwApproval/JobWorkApproval.jsx";

export { default as SKUCosting } from "./SKUCosting/SKUCosting";

export { default as SkuQuery } from "./Query/Sku Query/SkuQuery";
export { default as Q4 } from "./Query/Ledger query/LedgerQuery";
export { default as QueryQ5 } from "./Query/Q5";

export { default as Messenger } from "./Messenger/Messenger";

export { default as Profile } from "./Profile/Profile";

// cpm analysis
export { default as CPMAnalysis } from "./CPM/CPMAnalysis/CPMAnalysis";

// Jobwork
export { default as CreateJW } from "./Jobwork/CreateJW";
export { default as POAnalysis } from "./Jobwork/POAnalysis";
export { default as JwIssue } from "./Jobwork/JwIssue";
export { default as JwRmChallan } from "./Jobwork/JWRMChallan/JwRwChallan";
export { default as JwsfInward } from "./Jobwork/JwsfInward";
export { default as JwPendingRequest } from "./Jobwork/JwPendingRequest";
export { default as JwrmReturn } from "./Jobwork/JwrmReturn";
export { default as JwCompleted } from "./Jobwork/JwCompleted";
export { default as JWSupplementary } from "./Jobwork/update/supplementary";
export { default as JWUpdateRate } from "./Jobwork/update/rate";
export { default as SFGMIN } from "./Jobwork/VendorSFGMIN/SFGMIN";
export { default as JWVendorPricingUpload } from "./Jobwork/VendorPricingUpload";

// Work order
export { default as CreateWo } from "./Workorder/CreateWo";
export { default as WoAnalysis } from "./Workorder/WoAnalysis";
export { default as WoCompleted } from "./Workorder/WoCompleted";
export { default as WoCreateChallan } from "./Workorder/WoCreateChallan";

export { default as WoViewChallan } from "./Workorder/WoViewChallan";
export { default as AddClientInfo } from "./Master/workorder/AddClientInfo";
export { default as ViewandEditClient } from "./Master/workorder/ViewandEditClient";

// update RM MATLS
export { default as UpdateRM } from "./Store/UpdateRM";
export { default as ReverseMin } from "./Store/ReverseMin";

// paytm qc
export { default as PaytmQCReport } from "./Analysis/PaytmQC/PaytmQCReport";
// paytm refurbishment
export { default as PaytmRefurbishmentMIN } from "./Analysis/PaytmRefurbishment/PaytmRefurbishmentMIN";
export { default as MINRegister } from "./Analysis/PaytmRefurbishment/PaytmMINRegister/MINRegister";
// material requisition request and mr approval
export { default as PendingApproval } from "./Store/MrApproval/Pending";
export { default as MaterialRequisitionRequest } from "./Store/MrApproval/Processed";

export { default as FirstLogin } from "./Login/FirstLogin";

export { default as Drive } from "./Drive/Drive";

export { default as Invoice } from "./Invoice/";
export { default as DraftInvoices } from "./Invoice/Draft";
export { default as FinalInvoices } from "./Invoice/Final";

// MES process
export { default as CreateProcess } from "./MES/Process/Create";
export { default as MapProcesses } from "./MES/Process/Map";

// Part code conversion
export { default as PartCodeConversion } from "../Pages/Store/PartCodeConversion";

//challan window Branch Transfer
export { default as CreateBranchTransferChallan } from "./Store/branchtransfer/CreateDC/CreateBranchTransferChallan.jsx";
export { default as ViewBranchTransfer } from "./Store/branchtransfer/ViewBranchTransfer.jsx";

//e-way bill
export { default as EWayBill } from "./Jobwork/JWRMChallan/EWayBill.jsx";

// task manager
export { default as AdminTasks } from "../Pages/TaskManager/Admin";
export { default as UserTasks } from "../Pages/TaskManager/User";

// sales order
export { default as CreateSalesOrder } from "../Pages/Sales/SalesOrder/Create";

//Legal
export { default as Agreement } from "./Legal/agreements/Agreement.jsx";
export { default as ViewAgreement } from "./Legal/agreements/ViewAgreement.jsx";
export { default as AddAgreementType } from "./Legal/master/AddAgreementType.jsx";
export { default as Addparty } from "./Legal/master/Addparty.jsx";

//GST Reco
export { default as AddBookDetails } from "./gstreco/AddBookDetails/AddBookDetails.jsx";
export { default as ReconciledDetails } from "./gstreco/ReconcilledDetails/ReconciledDetails.jsx";
export { default as AddGstDetails } from "./gstreco/AddGstDetails/AddGstDetails.jsx";
export { default as Summary } from "./gstreco/Summary/Summary.jsx";
export { default as ViewBookData } from "./gstreco/ViewBookData/ViewBookData.jsx";
export { default as ViewGstData } from "./gstreco/ViewGstData/ViewGstData.jsx";
export { default as WeeklyAudit } from "./Reports/WeeklyAudit/WeeklyAudit.jsx";

//control panel
export { default as AllPages } from "./ControlPanel/AllPages.jsx";
export { default as AllUsers } from "./ControlPanel/AllUsers.jsx";

// this always comes last
export { default as Page404 } from "./Page404";
