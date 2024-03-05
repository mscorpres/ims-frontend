export { default as Login } from "./Login/Login.jsx";
export { default as ProductDetail } from "./Store/ProductDetail.jsx";
// export { default as MaterialTransaction } from "./Store/MaterialTransaction/MaterialTransaction.jsx";
export { default as Uom } from "./Master/Uom.jsx";
export { default as Product } from "./Master/Products/Product.jsx";
export { default as Group } from "./Master/Group.jsx";
export { default as Location } from "./Master/Location.jsx";
export { default as BillingAddress } from "./Master/BillingAddress.jsx";
export { default as ShippingAddress } from "./Master/ShippingAddress/ShippingAddress.jsx";
export { default as CreateBom } from "./Master/Bom/CreateBom/index.jsx";
export { default as ManageBom } from "./Master/Bom/Manage/index.jsx";
export { default as DisabledBom } from "./Master/Bom/Disabled/index.jsx";
export { default as HsnMap } from "./Master/HSNMap/HsnMap.jsx";
export { default as DocNumbering } from "./Master/DocNumbering.jsx";
export { default as Vendor } from "./Master/Vendor/Vendor.jsx";
export { default as CPMMaster } from "./Master/projects/CPMMaster.jsx";
export { default as R19Master } from "./Master/reports/R19/R19Master.jsx";
export { default as CategoryMaster } from "./Master/Components/material/categoryMaster/index.jsx";
export { default as AddVendor } from "./Master/Vendor/AddVendor.jsx";

export { default as RmtoRm } from "./Store/MaterialTransfer/RmtoRm.jsx";
export { default as ViewTransaction } from "./Store/MaterialTransfer/ViewTransaction.jsx";
export { default as PendingTransfer } from "./Store/MaterialTransfer/PendingTransfer.jsx";
export { default as ReToRej } from "./Store/MaterialTransfer/RM-REJ/ReToRej.jsx";
export { default as TransactionRej } from "./Store/MaterialTransfer/RM-REJ/TransactionRej.jsx";
export { default as CreateDC } from "./Store/RGP_DC/CreateDC/CreateDC.jsx";
export { default as ManageDC } from "./Store/RGP_DC/ManageDC.jsx";
export { default as CreateGP } from "./Store/Gatepass/CreateGP.jsx";
export { default as ManageGatePass } from "./Store/Gatepass/ManageGatePass.jsx";
export { default as CreateFGOut } from "./Store/FG OUT/CreateFGOut.jsx";
export { default as ViewFGOut } from "./Store/FG OUT/ViewFGOut.jsx";
export { default as ViewMin } from "./Store/MINLabel/ViewMIN.jsx";

export { default as MaterialInWithoutPO } from "./Store/MaterialIn/MaterialInWithoutPO/MaterialInWithoutPO.jsx";
export { default as MaterialInWithPO } from "./Store/MaterialIn/MaterialInWithPO/MaterialInWithPO.jsx";
export { default as ProductMIN } from "./Store/MaterialIn/ProductMIN/index.jsx";

export { default as Rejection } from "./Store/Rejection/Rejection.jsx";

export { default as Material } from "./Master/Components/material/index.jsx";

export { default as UpdateComponent } from "./Master/Components/material/UpdateComponent.jsx";
// export { default as UpdateComponent } from "./Master/Components/UpdateComponent.jsx";
export { default as Services } from "./Master/Components/services/index.jsx";
export { default as StockControl } from "./Master/Components/stockControl/index.jsx";
export { default as TransactionIn } from "./Store/Transaction/TransactionIn.jsx";
export { default as TransactionOut } from "./Store/Transaction/TransactionOut.jsx";
export { default as CompletedFG } from "./Store/FoodGoods/CompletedFG.jsx";
export { default as PendingFG } from "./Store/FoodGoods/PendingFG.jsx";
export { default as CreatePhysical } from "./Store/PhysicalStock/CreatePhysical.jsx";
export { default as ViewPhysical } from "./Store/PhysicalStock/ViewPhysical.jsx";

// Reports
export { default as ItemAllLogs } from "./Reports/ItemAllLogs.jsx";
export { default as ItemLocationLog } from "./Reports/ItemLocationLog.jsx";
export { default as R1 } from "./Reports/R/R1.jsx";

// QCA
export { default as Dashboard } from "./Dashboard/index.jsx";
export { default as SampleQC } from "./Production/Qca/SampleQC.jsx";
export { default as PendingQC } from "./Production/Qca/PendingQC.jsx";
export { default as CompletedQC } from "./Production/Qca/CompletedQC.jsx";
export { default as ReportQC } from "./Production/Qca/ReportQC.jsx";

// MES QCA

export { default as PrintQCALabel } from "./Production/Qca/PrintQCALabel.jsx";
export { default as MesQcaReport } from "./MES/report/MesQcReport.jsx";

// SF to rej
export { default as MaterialTransfer } from "./Production/Location Movement/MaterialTransfer.jsx";
// export { default as TransactionSF } from "./Production/Location Movement/TransactionSF.jsx";
export { default as MaterialTransferReport } from "./Production/Location Movement/MaterialTransferReport.jsx";
// export { default as TransactionSfToRej } from "./Production/Location Movement/TransactionSfToRej.jsx";

// Production Requisition ->  Material Requisition
export { default as ReqWithBom } from "./Production/Material Requisition/ReqWithBom.jsx";
export { default as ReqWithoutBom } from "./Production/Material Requisition/ReqWithoutBom.jsx";
export { default as CreatePPR } from "./Production/Production & Planning/CreatePPR.jsx";
export { default as PendingPPR } from "./Production/Production & Planning/PendingPPR/PendingPPR.jsx";
// export { default as CompletedPPR } from "./Production/Production & Planning/CompletedPPR";
// Purchase Order
export { default as CompletedPo } from "./PurchaseOrder/CompletedPO/CompletedPo.jsx";
export { default as ManagePO } from "./PurchaseOrder/ManagePO/ManagePo.jsx";
export { default as EditPO } from "./PurchaseOrder/ManagePO/EditPO/EditPO.jsx";
export { default as CreatePo } from "./PurchaseOrder/CreatePO/CreatePo.jsx";
export { default as VendorPricingUpload } from "./PurchaseOrder/VendorPricingUpload.jsx";
export { default as PoApproval } from "./PurchaseOrder/ManagePO/PoApproval/PoApproval.jsx";

export { default as SKUCosting } from "./SKUCosting/SKUCosting.jsx";

export { default as SkuQuery } from "./Query/Sku Query/SkuQuery.jsx";
export { default as LedgerQuery } from "./Query/Ledger query/LedgerQuery.jsx";
export { default as QueryQ5 } from "./Query/Q5/index.jsx";

export { default as Messenger } from "./Messenger/Messenger.jsx";

export { default as Profile } from "./Profile/Profile.jsx";

// cpm analysis
export { default as CPMAnalysis } from "./CPM/CPMAnalysis/CPMAnalysis.jsx";

// Jobwork
export { default as CreateJW } from "./Jobwork/CreateJW.jsx";
export { default as POAnalysis } from "./Jobwork/POAnalysis.jsx";
export { default as JwIssue } from "./Jobwork/JwIssue.jsx";
export { default as JwRmChallan } from "./Jobwork/JWRMChallan/JwRwChallan.jsx";
export { default as JwsfInward } from "./Jobwork/JwsfInward.jsx";
export { default as JwPendingRequest } from "./Jobwork/JwPendingRequest.jsx";
export { default as JwrmReturn } from "./Jobwork/JwrmReturn.jsx";
export { default as JwCompleted } from "./Jobwork/JwCompleted.jsx";
export { default as JWSupplementary } from "./Jobwork/update/supplementary/index.jsx";
export { default as JWUpdateRate } from "./Jobwork/update/rate/index.jsx";
export { default as SFGMIN } from "./Jobwork/VendorSFGMIN/SFGMIN.jsx";
export { default as JWVendorPricingUpload } from "./Jobwork/VendorPricingUpload.jsx";

// Work order
export { default as CreateWo } from "./Workorder/CreateWo.jsx";
export { default as WoAnalysis } from "./Workorder/WoAnalysis.jsx";
export { default as WoCompleted } from "./Workorder/WoCompleted.jsx";
export { default as WoCreateChallan } from "./Workorder/WoCreateChallan.jsx";

export { default as WoViewChallan } from "./Workorder/WoViewChallan.jsx";
export { default as AddClientInfo } from "./Master/workorder/AddClientInfo.jsx";
export { default as ViewandEditClient } from "./Master/workorder/ViewandEditClient.jsx";

// update RM MATLS
export { default as UpdateRM } from "./Store/UpdateRM.jsx";
export { default as ReverseMin } from "./Store/ReverseMin.jsx";

// paytm qc
export { default as PaytmQCReport } from "./Analysis/PaytmQC/PaytmQCReport.jsx";
// paytm refurbishment
export { default as PaytmRefurbishmentMIN } from "./Analysis/PaytmRefurbishment/PaytmRefurbishmentMIN.jsx";
export { default as MINRegister } from "./Analysis/PaytmRefurbishment/PaytmMINRegister/MINRegister.jsx";
// material requisition request and mr approval
export { default as PendingApproval } from "./Store/MrApproval/Pending/index.jsx";
export { default as MaterialRequisitionRequest } from "./Store/MrApproval/Processed/index.jsx";

export { default as FirstLogin } from "./Login/FirstLogin.jsx";

export { default as Drive } from "./Drive/Drive.jsx";

export { default as Invoice } from "./Invoice/index.jsx";
export { default as DraftInvoices } from "./Invoice/Draft/index.jsx";
export { default as FinalInvoices } from "./Invoice/Final/index.jsx";

// MES process
export { default as CreateProcess } from "./MES/Process/Create/index.jsx";
export { default as MapProcesses } from "./MES/Process/Map/index.jsx";

// Part code conversion
export { default as PartCodeConversion } from "./Store/PartCodeConversion/index.jsx";

//challan window Branch Transfer
export { default as CreateBranchTransferChallan } from "./Store/branchtransfer/CreateDC/CreateBranchTransferChallan.jsx";
export { default as ViewBranchTransfer } from "./Store/branchtransfer/ViewBranchTransfer.jsx";

//e-way bill
export { default as EWayBill } from "./Jobwork/JWRMChallan/EWayBill.jsx";

// task manager
export { default as AdminTasks } from "./TaskManager/Admin/index.jsx";
export { default as UserTasks } from "./TaskManager/User/index.jsx";

// sales order
export { default as CreateSalesOrder } from "./Sales/SalesOrder/Create/index.jsx";

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
export { default as Page404 } from "./Page404.jsx";
