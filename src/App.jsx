import React, { useState, useEffect, useRef } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Rout from "./Routes/Routes";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "buffer";
import {
  logout,
  setNotifications,
  setFavourites,
  setTestPages,
  setCompanyBranch,
  setCurrentLink,
  setSession,
} from "./Features/loginSlice/loginSlice.js";
import UserMenu from "./Components/UserMenu";
import Logo from "./Components/Logo";
import socket from "./Components/socket.js";
import Notifications from "./Components/Notifications";
import MessageModal from "./Components/MessageModal/MessageModal";
// antd imports
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Badge, Row, Select, Space, Switch, Typography } from "antd";
// icons import
import {
  MessageOutlined,
  BellFilled,
  StarFilled,
  StarOutlined,
  MenuOutlined,
  UserOutlined,
  LoadingOutlined,
  CalculatorFilled,
  FormOutlined,
  UsergroupAddOutlined,
  AlignRightOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  UnorderedListOutlined,
  DeploymentUnitOutlined,
  DeliveredProcedureOutlined,
  CheckCircleOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { BsFillHddStackFill } from "react-icons/bs";
import { ImCart } from "react-icons/im";
import { MdAccountBox, MdDashboard, MdQueryStats } from "react-icons/md";
import {
  IoBookSharp,
  IoFileTrayStacked,
  IoJournalSharp,
} from "react-icons/io5";
import { RiBillFill } from "react-icons/ri";
import { BiMoney, BiTransfer } from "react-icons/bi";
import { FaWarehouse } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { SiPaytm } from "react-icons/si";
import InternalNav from "./Components/InternalNav";
import { imsAxios } from "./axiosInterceptor";
import MyAsyncSelect from "./Components/MyAsyncSelect";
import internalLinks from "./Pages/internalLinks";
import TicketsModal from "./Components/TicketsModal/TicketsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScaleBalanced } from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const { user, notifications, testPages } = useSelector(
    (state) => state.login
  );

  const filteredRoutes = Rout.filter((route) => {
    // Include the route if it doesn't have a "dept" property or if showlegal is true
    return !route.dept || user?.showlegal;
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSideBar, setShowSideBar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [showMessageNotifications, setShowMessageNotifications] =
    useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const { pathname } = useLocation();
  const [testToggleLoading, setTestToggleLoading] = useState(false);
  const [testPage, setTestPage] = useState(false);
  const [branchSelected, setBranchSelected] = useState(true);
  const [modulesOptions, setModulesOptions] = useState([]);
  const [searchModule, setSearchModule] = useState("");
  const [showTickets, setShowTickets] = useState(false);
  const [searchHis, setSearchHis] = useState("");
  const [hisList, setHisList] = useState([]);
  const [showHisList, setShowHisList] = useState([]);
  const notificationsRef = useRef();
  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }
  const items = [
    getItem(
      "Favorites",
      "G",
      user?.favPages?.length > 0 ? <StarFilled /> : <StarOutlined />,
      user?.favPages?.map((fav, index) =>
        getItem(<Link to={fav.url}>{fav.page_name}</Link>, `A${index + 1}`)
      )
    ),
    getItem("Finance", "D", <BiMoney />, [
      getItem("COA", "D1", <MdAccountBox />, [
        getItem(
          <Link to="/tally/ChartOfAccounts">Account</Link>,
          "D11"
          // <MinusOutlined />
        ),
        getItem(
          <Link to="/tally/ledger_report">Ledger Report</Link>,
          "D12"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Taxation", "D2", <IoBookSharp />, [
        getItem(
          <Link to="/tally/nature_of_tds">TDS Config</Link>,
          "D21"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/nature_of_tcs">TCS Config</Link>,
          "D22"
          // <AiOutlineMinus />
        ),
      ]),
      // getItem("TDS", "D2", <IoBookSharp />, [
      //   getItem(
      //     <Link to="/tally/nature_of_tds">TDS Config</Link>,
      //     "D21"
      //     // <AiOutlineMinus />
      //   ),
      // ]),
      // getItem("TCS", "D22", <IoBookSharp />, []),
      getItem("Vendor Bills", "D3", <RiBillFill />, [
        getItem(
          <Link to="/tally/vendorbillposting/VB1">Vendor Bill Posting</Link>,
          "D31"

          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vendorbillposting/vendor_bill_records">
            VBT Records
          </Link>,
          "D32"

          // <AiOutlineMinus />
        ),
      ]),

      getItem("Accounting Voucher", "D4", <IoJournalSharp />, [
        getItem(
          <Link to="/tally/journal-posting">Journal</Link>,
          "D41"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/contra/1">Contra Transactions</Link>,
          "D42"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/bank-payment">Bank Payments</Link>,
          "D43"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/bank-receipts">Bank Receipts</Link>,
          "D44"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/cash-payment">Cash Payments</Link>,
          "D45"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/cash-receipt">Cash Receipts</Link>,
          "D46"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/reference/setup">App Reference Setup</Link>,
          "D47"
          // <AiOutlineMinus />
        ),
      ]),
      // getItem(
      //   <Link to="tally/clients/add">Clients</Link>,
      //   "clients/add"
      //   // <AiOutlineMinus />
      // ),
      // getItem("Clients", "clients", <UsergroupAddOutlined />, [
      //   getItem(
      //     <Link to="/tally/clients/add">Add</Link>,
      //     "clients/add"
      //     // <AiOutlineMinus />
      //   ),
      //   getItem(
      //     <Link to="/tally/clients/view">View</Link>,
      //     "clients/view"
      //     // <AiOutlineMinus />
      //   ),
      // ]),
      getItem("Report", "report", <AlignRightOutlined />, [
        getItem(
          <Link to="/tally/reports/trial-balance-report">
            Trial Balance Report
          </Link>,
          "reports/trial-balance"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/reports/balance-sheet">Balance Sheet</Link>,
          "reports/balance-sheet"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/reports/profitloss-report">P & L Report</Link>,
          "reports/profitloss-report"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/reports/day-book">Day Book</Link>,
          "reports/day-book"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/reference/payableReport">
            Ageing Report
          </Link>,
          "reports/day-book"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/vouchers/reference/tdsReport">TDS Report</Link>,
          "reports/tdsReport"
          // <AiOutlineMinus
        ),
        getItem(
          <Link to="/tally/vouchers/reference/misReport">MIS Report</Link>,
          "reports/tdsReport"
          // <AiOutlineMinus />)
        ),
        getItem(
          <Link to="/tally/vouchers/reference/gst/gstReport1">GSTR1</Link>,
          "/gst/gstReport1"
        ),
      ]),
      getItem("Others", "D9", <IoJournalSharp />, [
        getItem(
          <Link to="/vendorreco">Vendor Reconciliation</Link>
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/tally/debit-note/create">Debit Note</Link>,
          "/tally/debit-note/create"
          // <AiOutlineMinus />
        ),
        getItem("GST RECO", "D8", <IoJournalSharp />, [
          getItem(<Link to="/addbookdetails">Add Book Details</Link>, "D81"),
          getItem(<Link to="/addgstdetails">Add Gst Details</Link>, "D82"),
          getItem(<Link to="/viewreconciled">Reconciled Details</Link>, "D83"),
          getItem(<Link to="/viewsummary">Summary</Link>, "D84"),
          getItem(<Link to="/viewbookdata">View Book Data</Link>, "D85"),
          getItem(<Link to="/viewgstdata">View Gst Data</Link>, "D86"),
        ]),
      ]),
    ]),
    getItem("Dashboard", "A", <MdDashboard />, [
      getItem(
        <Link to="/dashboard/sku_costing">SKU Costing</Link>,
        "2"
        // <AiOutlineMinus />
      ),
    ]),
    getItem("Material Management", "B", <BiTransfer />, [
      getItem("Master", "B1", <BsFillHddStackFill />, [
        getItem(
          <Link to="/uom">UOM</Link>,
          "Material Management/B11"
          // <AiOutlineMinus />
        ),
        getItem("Component", "B12", <MdDashboard />, [
          getItem(
            <Link to="/material">Material</Link>,
            "Component/B121"
            //   // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/services">Services</Link>,
            "Component/B122"
            // <AiOutlineMinus />
          ),
        ]),
        getItem(
          <Link to="/masters/products/fg">Products</Link>,
          "Component/B13"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/hsn-map">HSN Map</Link>,
          "hsn-map/B14"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/location">Location</Link>,
          "B114"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/group">Groups</Link>,
          "B15"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/billingAddress">Billing Address</Link>,
          "B16"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/shippingAddress">Shipping Address</Link>,
          "B17"
          // <AiOutlineMinus />
        ),
        // getItem(
        //   <Link to="/doc_numbering">Doc(s) Number</Link>,
        //   "B17"
        //   // <AiOutlineMinus />
        // ),
        getItem("Bill Of Material", "B18", <MdDashboard />, [
          getItem(
            <Link to="/master/bom/create">Create BOM</Link>,
            "B181"
            // <MdDashboard />
          ),
        ]),
        getItem("Vendor / Supplier", "B19", <MdDashboard />, [
          getItem(
            <Link to="/vendor">Add / Rectify</Link>,
            "B191"
            // <MdDashboard />
          ),
        ]),
        getItem(
          <Link to="tally/clients/add">Clients</Link>,
          "clients/add"
          // <AiOutlineMinus />
        ),
        getItem("WorkOrder", "B28", <MdDashboard />, [
          getItem(
            <Link to="/addClient">Create Client</Link>,
            "B281"
            // <MdDashboard />
          ),
        ]),
        getItem(
          <Link to="/master/reports/projects">Projects</Link>,
          "/master/reports/projects/B20"
          // <MdDashboard />
        ),
        getItem(
          <Link to="/master/reports/r19">Reports</Link>,
          "B21"
          // <MdDashboard />
        ),
      ]),
      getItem("Procurement", "B2", <ImCart />, [
        getItem(
          <Link to="/create-po">Create PO</Link>,
          "B21"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/manage-po">Manage PO</Link>,
          "B22"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/completed-po">Completed PO</Link>,
          "B23"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/vendor-pricing">Vendor Pricing</Link>,
          "B24"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/approval-po">Po Approval</Link>,
          "B25"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Warehouse", "B3", <FaWarehouse />, [
        getItem(
          <Link to="/approved-transaction">MR Approval</Link>,
          "B31"
          // <AiOutlineMinus />
        ),
        getItem(<Link to="/warehouse/material-in">RM MATLS IN</Link>, "B32"),
        ///
        getItem(
          <Link to="/warehouse/prod-return-MIN">Prod. Return MIN</Link>,
          "B32"
          // <AiOutlineMinus />
        ),
        getItem("MIN Edit/Reverse", "warehouse/minedit", <MdDashboard />, [
          getItem(
            <Link to="/update-rm">Edit MIN</Link>,
            "warehouse/minedit/edit"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/reverse-min">Reverse MIN</Link>,
            "warehouse/minedit/reverse"
            // <AiOutlineMinus />
          ),
        ]),

        getItem("FG (s) Inwarding", "B43", <MdDashboard />, [
          getItem(
            <Link to="/PendingFG">Pending FG (s)</Link>,
            "B431"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/completedFG">Completed FG (s)</Link>,
            "B432"
            // <AiOutlineMinus />
          ),
        ]),
        getItem("FG(s) Out", "B35", <MdDashboard />, [
          getItem(
            <Link to="/create-fgOut">Create FG Out</Link>,
            "B351"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/view-fgOut">View FG Out</Link>,
            "B352"
            // <AiOutlineMinus />
          ),
        ]),
        getItem("Material Transfer", "B36", <MdDashboard />, [
          getItem(
            <Link to="/rm-to-rm">RM To RM</Link>,
            "B361"
            // <MdDashboard />
          ),
          getItem(
            <Link to="/sf-to-rm">SF To RM</Link>,
            "B362"
            // <MdDashboard />
          ),
          getItem(
            <Link to="/re-to-rej">RM To REJ</Link>,
            "B363"
            // <MdDashboard />
          ),
          getItem(
            <Link to="/pending-transfer">Pending Transfer(s)</Link>,
            "B363"
            // <MdDashboard />
          ),
        ]),
        getItem(
          <Link to="/rejection">Rejection Out</Link>,
          "B37"
          // <AiOutlineMinus />
        ),
        getItem("Jobwork", "B6", <MdQueryStats />, [
          getItem(
            <Link to="/create-jw">Jobwork & Analysis</Link>,
            "B61"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/jobwork/update/supplementary">Jobwork Update</Link>,

            "B63"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/jobwork/vendor/sfg/min">Vendor SFG MIN</Link>,

            "B62"
            // <AiOutlineMinus />
          ),
        ]),
        getItem("Work Order", "B7", <MdQueryStats />, [
          getItem(<Link to="/createwo">Create Work-order</Link>, "B71"),
          getItem(<Link to="/woanalysis">WO Analysis</Link>, "B72"),
          getItem(<Link to="/wocreatechallan">WO Create Challan</Link>, "B73"),
          getItem(<Link to="/woShipment">WO Shipment</Link>, "B74"),
          getItem(<Link to="/woviewchallan">WO View Challan</Link>, "B75"),
          getItem(<Link to="/wocompleted">WO Completed</Link>, "B76"),
          getItem(<Link to="/woreport">WO Report</Link>, "B77"),
        ]),
        getItem(
          <Link to="/create-dc">RGP - DC</Link>,
          "B38"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/branchtransferchallan">Branch Transfer Challan</Link>,
          "B35"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/create-gp">Gatepass (RGP / NRGP)</Link>,
          "B39"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/warehouse/physical/create">Physical Stock (Store)</Link>,
          "B40"
          // <AiOutlineMinus />
        ),
        // Part Code Conversion
        getItem(
          <Link to="/warehouse/part-code-conversion">
            Part Code Conversion
          </Link>,
          "B41"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Sales Order", "C5", <TbReportAnalytics />, [
        getItem(<Link to="/sales/order/register">Register</Link>, "E51"),
        getItem(
          <Link to="/sales/order/create">Create order</Link>,
          "C52"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Reports", "B4", <TbReportAnalytics />, [
        getItem("Inventory Reports", "B41", <MdDashboard />, [
          getItem(
            <Link to="/transaction-In">MIN Register</Link>,
            "B411"
            // <AiOutlineMinus />
          ),

          getItem(<Link to="/weeklyAudit">Weekly Audit</Link>, "B414"),
          getItem(
            <Link to="/transaction-Out">MIN Issue Register</Link>,
            "B412"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/weeklyaudit">Weekly Audit</Link>,
            "B414"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/r1">Reports R1 - R32 </Link>,

            "B413"
            // <AiOutlineMinus />
          ),
        ]),
        getItem(
          <Link to="/warehouse/print-view-min">Print and View MIN Label</Link>,
          "B42"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Query", "B5", <MdQueryStats />, [
        getItem(
          <Link to="/item-all-logs">Q1 - Q6</Link>,
          "C51"
          // <AiOutlineMinus />
        ),
        // getItem(
        //   <Link to="/sku-query">SKU Query</Link>,
        //   "B52"
        //   // <AiOutlineMinus />
        // ),
      ]),
    ]),

    getItem("Production", "C", <IoFileTrayStacked />, [
      getItem("PPC", "C1", <MdDashboard />, [
        getItem("Material Requisition", "C11", <MdDashboard />, [
          getItem(
            <Link to="/reqWithBom">Req With BOM</Link>,
            "C111"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/reqWithoutBom">Req Without BOM</Link>,
            "C112"
            // <AiOutlineMinus />
          ),
        ]),
        getItem("Production and Plan (s)", "C12", <MdDashboard />, [
          getItem(
            <Link to="/create-ppr">Create PPR</Link>,
            "C121"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/pending-ppr">Pending PPR</Link>,
            "C122"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/completed-ppr">Completed PPR</Link>,
            "C123"
            // <AiOutlineMinus />
          ),
        ]),

        getItem("Location Movement", "C14", <MdDashboard />, [
          getItem(
            <Link to="/sf-to-sf">SF To SF</Link>,
            "C141"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/sf-to-rej">SF To REJ</Link>,
            "C142"
            // <AiOutlineMinus />
          ),
        ]),
      ]),
      getItem("QCA", "C2", <MdDashboard />, [
        getItem(
          <Link to="/sample-qc">Create Sample</Link>,
          "C131"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/pending-qc">Pending Sample</Link>,
          "C132"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/completed-qc">Completed Sample</Link>,
          "C133"
          // <AiOutlineMinus />
        ),
        getItem(
          <Link to="/report-qc">QC Report</Link>,
          "C134"
          // <AiOutlineMinus />
        ),
      ]),
      getItem("Query", "C3", <MdQueryStats />, [
        getItem(
          <Link to="/item-all-logs">Q1 - Q6</Link>,
          "C31"
          // <AiOutlineMinus />
        ),
        // getItem(
        //   <Link to="/sku-query">SKU Query</Link>,
        //   "C32"
        //   // <AiOutlineMinus />
        // ),
      ]),

      getItem("Reports", "C4", <TbReportAnalytics />, [
        getItem("Inventory Reports", "C41", <MdDashboard />, [
          getItem(
            <Link to="/transaction-In">MIN Register</Link>,
            "C411"
            // <AiOutlineMinus />
          ),
          getItem(
            <Link to="/transaction-Out">MIN Issue Register</Link>,
            "C412"
          ),
          getItem(<Link to="/weeklyAudit">Weekly Audit</Link>, "C412"),

          getItem(
            <Link to="/r1">Reports R1 - R32</Link>,

            "C413"
            // <AiOutlineMinus />
          ),
        ]),
      ]),
    ]),
    //Legal
    user?.showlegal
      ? getItem("Legal", "X", <FontAwesomeIcon icon={faScaleBalanced} />, [
          getItem("Master", "X1", <DeliveredProcedureOutlined />, [
            getItem(<Link to="/legal/addparty">Add Party</Link>, "X11"),
            getItem(
              <Link to="/legal/addagreementtype">Add Type Of Agreement</Link>,
              "X12"
            ),
          ]),
          getItem("Agreements", "X2", <DeliveredProcedureOutlined />, [
            getItem(
              <Link to="/legal/createagreement">Create Agreement</Link>,
              "X21"
            ),
            getItem(
              <Link to="/legal/viewagreement">View Agreement</Link>,
              "X22"
            ),
          ]),
        ])
      : null,

    //MES
    getItem("MES", "Z", <DeploymentUnitOutlined />, [
      getItem("QA Process", "Z1", <DeliveredProcedureOutlined />, [
        getItem(<Link to="/master/qa-process">Create Process</Link>, "Z11"),
        getItem(
          <Link to="/master/qa-process-map">Create Process Map</Link>,
          "Z12"
        ),
      ]),
      getItem("QCA", "Z2", <CheckCircleOutlined />, [
        getItem(<Link to="/print-qc-label">Print QCA Label</Link>, "Z21"),
        getItem(<Link to="/qccheck">QC Check</Link>, "Z22"),
        getItem(<Link to="/mes-report-qc">QC Report</Link>, "Z23"),
      ]),
    ]),
    // getItem("MES", "Z", <DeploymentUnitOutlined />, [
    //   getItem(
    //     <Link to="/mes/process/create">Create Process</Link>,
    //     "G1",

    //     []
    //   ),
    //   // getItem('QCA', 'G2',<CheckCircleOutlined />,[
    //   //   getItem(<Link to='/print-qc-label'>Print QCA Label</Link>,'G21'),
    //   //   getItem(<Link to='/qccheck'>QC Check</Link>,'G22'),
    //   //   getItem(<Link to='/report-qc'>QC Report</Link>,'G23'),
    //   // ]),
    // ]),
    getItem("CPM", "E", <CalculatorFilled />, [
      getItem(<Link to="/CPM/CPM-analysis">CPM Analysis</Link>, "E1"),
      getItem(<Link to="/CPM/report">CPM Finance</Link>, "reports/cpm"),
    ]),
    getItem("Analysis", "F", <SiPaytm />, [
      // getItem(
      //   <Link to="/paytm-qc/upload">Paytm QC Upload updated to check</Link>,
      //   "F1"
      // ),
      // getItem(<Link to="paytm-qc/update">Paytm QC Update</Link>, "F2"),
      getItem(<Link to="/analysis/paytm-qc">Paytm QC Report</Link>, "F1"),
      getItem(
        <Link to="/analysis/paytm-refurbishment">Paytm Refurbishment</Link>,
        "F2"
      ),
    ]),
    getItem(<Link to="/sop">SOP's</Link>, "/sop", <FormOutlined />),
    getItem(
      <Link to="/invoice/create">Sales & Distribution</Link>,
      "/invoice/create",
      <UnorderedListOutlined />
    ),
    // user?.type == "developer"
    //   ? getItem(
    //       <Link to="/controlPanel/registeredUsers">Control Panel</Link>,
    //       "/controlPanel/registeredUsers",
    //       <ControlOutlined />
    //     )
    //   : "",
  ];
  const items1 = [
    getItem(
      <Link to="#" onClick={() => setShowTickets(true)}>
        Tickets
      </Link>,
      "B",
      <CustomerServiceOutlined />
    ),
    getItem(<Link to="/myprofile">Profile</Link>, "A", <UserOutlined />),
    // getItem(<Link to="/messenger">Messenger</Link>, "C", <MessageOutlined />),
  ];
  const logoutHandler = () => {
    dispatch(logout());
  };
  const deleteNotification = (id) => {
    let arr = notifications;
    arr = arr.filter((not) => not.ID != id);
    dispatch(setNotifications(arr));
  };
  useEffect(() => {
    if (pathname === "/controlPanel/registeredUsers" && user?.type == "user") {
      navigate("/");
    }
  }, [user?.type]);

  const handleFavPages = async (status) => {
    let favs = user.favPages;

    if (!status) {
      setFavLoading(true);
      const { data } = await imsAxios.post("/backend/favouritePages", {
        pageUrl: pathname,
        source: "react",
      });
      setFavLoading(false);
      if (data.code == 200) {
        favs = JSON.parse(data.data);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      let page_id = favs.filter((f) => f.url == pathname)[0].page_id;
      setFavLoading(true);
      const { data } = await imsAxios.post("/backend/removeFavouritePages", {
        page_id,
      });
      setFavLoading(false);
      if (data.code == 200) {
        let fav = JSON.parse(data.data);
        favs = fav;
      } else {
        toast.error(data.message.msg);
      }
    }
    dispatch(setFavourites(favs));
  };
  const navToControl = () => {
    if (user?.type == "user") {
      navigate("/");
    } else {
      navigate("/controlPanel/registeredUsers");
    }
  };
  const handleChangePageStatus = (value) => {
    let status = value ? "TEST" : "LIVE";
    socket.emit("setPageStatus", {
      page: pathname,
      status: status,
    });
    setTestToggleLoading(true);
    setTestPage(value);
  };
  const handleSelectCompanyBranch = (value) => {
    dispatch(setCompanyBranch(value));
    setBranchSelected(true);
    socket.emit("getBranch", value);
  };
  const handleSelectSession = (value) => {
    dispatch(setSession(value));
  };

  const getModuleSearchOptions = (search) => {
    let arr = [];
    let modOpt = [];
    internalLinks.map((row) => {
      let a = row;
      arr.push(...a);
    });
    arr.map((row) => {
      if (row.routeName?.toLowerCase().includes(search)) {
        let obj = {
          text: row.routeName,
          value: row.routePath,
        };
        modOpt.push(obj);
      }
    });
    setSearchHis(modOpt);
    setModulesOptions(modOpt);
  };
  useEffect(() => {
    if (modulesOptions?.length === 0) {
      setModulesOptions(showHisList);
    }
  }, [modulesOptions]);
  // notifications recieve handlers
  useEffect(() => {
    const otherData = JSON.parse(localStorage.getItem("otherData"));

    if (Notification.permission == "default") {
      Notification.requestPermission();
    }
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        setShowSideBar(false);
      }
    });
    if (!user) {
      navigate("/login");
    }
    if (user) {
      if (user.company_branch) {
        setBranchSelected(true);
      }
    }
    if (user) {
      if (!user.company_branch) {
      }
      if (user.company_branch) {
        setBranchSelected(true);
      }
      socket.emit("fetch_notifications", {
        source: "react",
      });
    }

    if (user && user.token) {
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        arr = arr.map((row) => {
          console.log(
            "this one in norification",
            JSON.parse(row.other_data)?.message
          );
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
            message: JSON.parse(row.other_data)?.message,
          };
        });
        dispatch(setNotifications(arr));
      });
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file" || data[0].msg_type == "msg") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.req_date,
                file: JSON.parse(data.other_data).fileUrl,
                message: JSON.parse(data.other_data)?.message,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });

      // event for starting detail
      socket.on("download_start_detail", (data) => {
        console.log("start details arrived");
        if (data.title || data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        setTestToggleLoading(false);
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          let obj = {
            url: property,
            status: data[property],
          };
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        toast.error(data.message);
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
      socket.on("getting-loading-percentage", (data) => {
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                total: data.total,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, []);
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user) {
      let branch = JSON.parse(
        localStorage.getItem("otherData")
      )?.company_branch;
      if (branch) {
        setBranchSelected(true);
        // toast.error(
        //   "Please select a company branch before working on any modules"
        // );
      }
      // handleSelectSession("23-24");
    }
  }, [user]);
  useEffect(() => {
    if (pathname === "/login" && user) {
      const link = JSON.parse(localStorage.getItem("otherData"))?.currentLink;
      if (user.passwordChanged === "P") {
        navigate("/first-login");
      } else {
        navigate(link ?? "/");
      }
    }
    if (user && user.token) {
      imsAxios.defaults.headers["x-csrf-token"] = user.token;
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.status,
                file: JSON.parse(data.other_data).fileUrl,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        // console.log("allnotifications", arr);
        arr = arr.map((row) => {
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
          };
        });
        dispatch(setNotifications(arr));
      });
      // event for starting detail
      socket.on("download_start_detail", (data) => {
        if (data.title && data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        setTestToggleLoading(false);
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          let obj = {
            url: property,
            status: data[property],
          };
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        toast.error(data.message);
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, [user?.token]);
  useEffect(() => {
    setShowSideBar(false);
    setShowMessageNotifications(false);
    setShowNotifications(false);
    let currentLink = pathname;
    if (user) {
      if (pathname !== "login") {
        dispatch(setCurrentLink(currentLink));
        if (user.passwordChanged === "P") {
          navigate("/first-login");
        }
      }
    }
  }, [navigate]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  useEffect(() => {
    if (newNotification?.type) {
      if (Notification.permission == "default") {
        Notification.requestPermission(function (permission) {
          if (permission === "default") {
            let notification = new Notification(newNotification.title, {
              body: newNotification.message,
            });
            notification.onclick = () => {
              notification.close();
              window.parent.focus();
            };
          }
        });
      } else {
        let notification = new Notification(newNotification?.title, {
          body: newNotification?.message,
        });
        notification.onclick = () => {
          notification.close();
          window.parent.focus();
        };
      }
    }
  }, [newNotification]);
  useEffect(() => {
    if (showMessageNotifications) {
      {
        setShowNotifications(false);
      }
    }
  }, [showMessageNotifications]);
  useEffect(() => {
    if (showNotifications) {
      {
        setShowMessageNotifications(false);
      }
    }
  }, [showNotifications]);
  useEffect(() => {
    if (testPages) {
      let match = testPages?.filter((page) => page.url == pathname)[0];
      if (match) {
        setTestPage(true);
      } else {
        setTestPage(false);
      }
    }
  }, [navigate, user]);

  useEffect(() => {
    setModulesOptions([]);
    if (searchModule.length > 2) {
      // console.log("Search module is here", searchModule);
      // console.log("Search msearchHis", searchHis);
      let searching = searchHis.filter((i) => i.value === searchModule);
      // setHisList([...hisList,searching]);
      let a = hisList.push(...hisList, ...searching);
      const ids = hisList.map(({ text }) => text);
      const filtered = hisList.filter(
        ({ text }, index) => !ids.includes(text, index + 1)
      );
      // console.log("Search module Array after filtering in here", a);
      // console.log("Search module Array after filtering in here", filtered);
      // setHisList(filtered);
      // localStorage.setItem("searchHistory", hisList);
      localStorage.setItem("searchHistory", JSON.stringify({ filtered }));

      navigate(searchModule);
    }
  }, [searchModule]);

  const showRecentSearch = () => {
    console.log("obj in fnc");
    let obj = JSON.parse(localStorage.getItem("searchHistory"));
    // localStorage.setItem("searchHistory", JSON.stringify({ filtered }));

    let arr = obj?.filtered?.map((row) => ({
      text: row.text,
      value: row.value,
    }));
    // console.log("obj arr", arr);
    setShowHisList(arr);
  };

  const options = [
    { label: "A-21 [BRMSC012]", value: "BRMSC012" },
    { label: "B-29 [BRMSC029]", value: "BRMSC029" },
  ];
  const sessionOptions = [
    { label: "Session 22-23", value: "22-23" },
    { label: "Session 23-24", value: "23-24" },
  ];
  return (
    <div style={{ height: "100vh" }}>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        limit={1}
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />
      <Layout
        style={{
          width: "100%",
          top: 0,
        }}
      >
        {/* header start */}
        {user && user.passwordChanged === "C" && (
          <Layout style={{ height: "100%" }}>
            <Header
              style={{
                zIndex: 4,
                height: 45,
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Row style={{ width: "100%" }} justify="space-between">
                <Space size="large">
                  <MenuOutlined
                    onClick={() => {
                      setShowSideBar((open) => !open);
                    }}
                    style={{
                      color: "white",
                      marginLeft: 12,
                      fontSize: window.innerWidth > 1600 && "1rem",
                    }}
                  />

                  <Link to="/">
                    <Space
                      style={{
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      <Logo />
                      <span style={{ color: "white" }}>IMS</span>
                    </Space>
                  </Link>
                  <div className="location-select">
                    <Select
                      style={{ width: 200, color: "white" }}
                      options={options}
                      bordered={false}
                      placeholder="Select Company Branch"
                      onChange={(value) => handleSelectCompanyBranch(value)}
                      value={user.company_branch}
                    />
                  </div>
                  <div className="location-select">
                    <Select
                      style={{ width: 200, color: "white" }}
                      options={sessionOptions}
                      bordered={false}
                      placeholder="Select Session"
                      onChange={(value) => handleSelectSession(value)}
                      value={user.session}
                    />
                  </div>
                </Space>
                <Space>
                  <div className="location-select">
                    <Space>
                      <Typography.Text style={{ color: "white" }}>
                        <SearchOutlined />
                      </Typography.Text>
                      <div style={{ width: 250, color: "white" }}>
                        <MyAsyncSelect
                          style={{ color: "black" }}
                          // placeholder={
                          //   <span style={{ color: "#000000" }}>
                          //     Search here...
                          //   </span>
                          // }
                          placeholder="Select users"
                          onBlur={() => setModulesOptions([])}
                          noBorder={true}
                          hideArrow={true}
                          searchIcon={false}
                          color="white"
                          optionsState={modulesOptions}
                          loadOptions={getModuleSearchOptions}
                          value={searchModule}
                          onChange={setSearchModule}
                          onMouseEnter={showRecentSearch}
                          options={showHisList}
                        />
                      </div>
                    </Space>
                  </div>
                </Space>
                <Space
                  size="large"
                  style={{
                    position: "relative",
                  }}
                >
                  {user?.type && user?.type.toLowerCase() == "developer" && (
                    <>
                      <Switch
                        loading={testToggleLoading}
                        checked={testPage}
                        onChange={(value) => handleChangePageStatus(value)}
                        checkedChildren="Test"
                        unCheckedChildren="Live"
                      />

                      <ControlOutlined
                        style={{
                          fontSize: 18,
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={() => navToControl()}
                      />
                    </>
                  )}

                  {favLoading ? (
                    <LoadingOutlined
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                    />
                  ) : user?.favPages?.filter(
                      (fav) => fav.url == pathname
                    )[0] ? (
                    <StarFilled
                      onClick={() => handleFavPages(true)}
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                    />
                  ) : (
                    <StarOutlined
                      onClick={() => handleFavPages(false)}
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                    />
                  )}

                  <div>
                    <Badge
                      size="small"
                      style={{
                        background: notifications.filter(
                          (not) => not?.loading || not?.status == "pending"
                        )[0]
                          ? "#EAAE0F"
                          : "green",
                      }}
                      count={
                        notifications.filter((not) => not?.type != "message")
                          ?.length
                      }
                    >
                      <BellFilled
                        onClick={() => setShowNotifications((n) => !n)}
                        style={{
                          fontSize: 18,
                          color: "white",
                          // marginRight: 8,
                        }}
                      />
                    </Badge>
                    {showNotifications && (
                      <Notifications
                        source={"notifications"}
                        showNotifications={showNotifications}
                        notifications={notifications.filter(
                          (not) => not?.type != "message"
                        )}
                        deleteNotification={deleteNotification}
                      />
                    )}
                  </div>
                  <div>
                    <Badge
                      size="small"
                      count={
                        notifications.filter((not) => not?.type == "message")
                          .length
                      }
                    >
                      <MessageOutlined
                        onClick={() => setShowMessageDrawer(true)}
                        style={{
                          fontSize: 18,
                          cursor: "pointer",
                          color: "white",
                        }}
                      />
                    </Badge>
                  </div>
                  <UserMenu user={user} logoutHandler={logoutHandler} />
                </Space>
              </Row>
            </Header>
          </Layout>
        )}
        {/* header ends */}
        {/* sidebar starts */}
        <Layout
          style={{
            height: "100%",
            opacity: user && !branchSelected ? 0.5 : 1,
            pointerEvents: user && !branchSelected ? "none" : "all",
          }}
        >
          <TicketsModal
            open={showTickets}
            handleClose={() => setShowTickets(false)}
          />
          {user && user.passwordChanged === "C" && (
            <Sidebar
              items={items}
              items1={items1}
              className="site-layout-background"
              key={1}
              setShowSideBar={setShowSideBar}
              showSideBar={showSideBar}
            />
          )}
          {/* sidebar ends */}
          <Layout
            onClick={() => {
              setShowNotifications(false);
              setShowMessageNotifications(false);
            }}
            style={{ height: "100%" }}
          >
            <Content style={{ height: "100%" }}>
              <InternalNav links={internalLinks} />

              <div
                style={{
                  height: "calc(100vh - 50px)",
                  width: "100%",
                  opacity: testPage ? 0.5 : 1,
                  pointerEvents:
                    testPage && user?.type != "developer" ? "none" : "all",

                  overflowX: "hidden",
                }}
              >
                <MessageModal
                  showMessageDrawer={showMessageDrawer}
                  setShowMessageDrawer={setShowMessageDrawer}
                />
                <Routes>
                  {filteredRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.main />}
                    />
                  ))}
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;
