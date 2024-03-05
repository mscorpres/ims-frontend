// import React, { useEffect, useState } from "react";
// import "./materialTransaction.css";
// import AddVendorModal from "./AddVendorModal";
// import AddBranchModal from "./AddBranchModal";
// import AddInvoice from "./AddInvoice";
// import Select from "react-select";
// import AsyncSelect from "react-select/async";
// import axios from "axios";

// const MaterialTransaction = () => {
//   const [showAddVendorModal, setShowAddVendorModal] = useState(false);
//   const [addBranch, setAddBranch] = useState(false);
//   const [showAddInvoice, setShowAddInvoice] = useState(false);
//   const [rowCount, setRowCount] = useState([1]);
//   const [tab, setTab] = useState(true);
//   const [taxes, setTaxes] = useState(false);
//   const [branches, setBranches] = useState([]);
//   const [address, setAddress] = useState([]);
//   const [vendorBranches, setVendorBranches] = useState({
//     vendorname: "",
//     vendortype: "",
//     vendorbranch: "",
//     vendoraddress: "",
//   });

//   const selectInputHandler = (name, value) => {
//     setVendorBranches((vendorBranches) => {
//       return {
//         ...vendorBranches,
//         [name]: value,
//       };
//     });
//   };

//   // const []
//   const options = [
//     { label: "React", value: "Vendor" },
//     { label: "JWI", value: "JWI" },
//     { label: "SortIn", value: "SortIn" },
//     { label: "RejIn", value: "RejIn" },
//     { label: "ProductReturn", value: "ProductReturn" },
//   ];

//   // console.log(first)
//   const [seacrhVendor, setSearchVendor] = useState(null);

//   const addRows = () => {
//     setRowCount([...rowCount, rowCount.length + 1]);
//   };
//   const removeRows = (count) => {
//     console.log(count);
//     console.log(rowCount);
//     const arr = rowCount.filter((c) => c != count);
//     setRowCount(arr);
//   };
//   const toggleButton = () => {
//     setTab(!true);
//   };

//   const toggleButtonBack = () => {
//     setTab(true);
//   };

//   const toggleTexas = () => {
//     setTaxes(!taxes);
//   };
//   const closeAllModal = () => {
//     setShowAddVendorModal(false);
//     setAddBranch(false);
//     setShowAddInvoice(false);
//   };

//   const vendorSearch = (e) => {
//     // console.log(e.target.value);
//   };

//   const getOption = async (e) => {
//     if (e.length > 2) {
//       const { data } = await imsAxios.post("/backend/vendorList", {
//         search: e,
//       });

//       let arr = [];
//       arr = data.map((vList) => {
//         return { label: vList.text, value: vList.id };
//       });
//       console.log("Array Vendor=>", arr);
//       return arr;
//     }
//   };

//   //getting vendor branches
//   const getVendorBracnch = async () => {
//     const { data } = await imsAxios.post("/backend/vendorBranchList", {
//       vendorcode: vendorBranches.vendorname.value,
//     });

//     const arr = data.data.map((d) => {
//       return { value: d.id, label: d.text };
//     });
//     setBranches(arr);
//     getAddress();
//   };
//   const showBranchOption = () => {
//     // imsAxios.post("/backend/vendorBranchList",{
//     //   vendorcode:
//     // })
//   };

//   const getAddress = async () => {
//     const { data } = await imsAxios.post("/backend/vendorAddress", {
//       vendorcode: vendorBranches.vendorname.value,
//       branchcode: vendorBranches.vendorbranch.value,
//     });
//     setAddress(data.data.address);
//     console.log("address=>", data.data.address);
//   };

//   useEffect(() => {
//     vendorSearch();
//     if (vendorBranches.vendorname) {
//       getVendorBracnch();
//       console.log("first");
//     }
//   }, [vendorBranches.vendorname]);
//   return (
//     <>
//       <AddVendorModal
//         setShowAddVendorModal={setShowAddVendorModal}
//         showAddVendorModal={showAddVendorModal}
//       />
//       <AddBranchModal setAddBranch={setAddBranch} addBranch={addBranch} />
//       <AddInvoice
//         setShowAddInvoice={setShowAddInvoice}
//         showAddInvoice={showAddInvoice}
//       />
//       {/* <!-- navb start --> */}
//       <div
//         style={{
//           opacity: `${
//             addBranch || showAddVendorModal || showAddInvoice ? 0.3 : 1
//           }`,
//         }}
//         onClick={() => {
//           (addBranch || showAddVendorModal || showAddInvoice) &&
//             closeAllModal();
//         }}
//         id="sidebar2"
//         className="sidebar sidebar-fixed sidebar-hover sidebar-h collapsed-h sidebar-light has-open sidebar-backdrop"
//       >
//         <div className="sidebar-inner align-items-xl-end border-b-1 brc-grey-l2 border-r-0 shadow-none">
//           <div
//             className="d-xl-none text-right position-tr"
//             style={{ zIndex: "5" }}
//           >
//             <button
//               type="button"
//               className="btn collapsed btn-light-red radius-0"
//             >
//               <i className="fa fa-times"></i>
//             </button>
//           </div>

//           <nav
//             aria-label="Main"
//             className="ml-xl-3 flex-grow-1 flex-xl-grow-0 d-xl-flex flex-xl-row ace-scroll"
//           >
//             <ul className="nav w-auto has-active-border active-on-right active-on-top">
//               <li className="nav-item-caption">
//                 <span className="fadeable pl-3">MAIN</span>
//                 <span className="fadeinable mt-n2 text-125">…</span>
//               </li>
//               <li className="nav-item active">
//                 <a className="nav-link">
//                   <span>Material In</span>
//                 </a>
//                 <b className="sub-arrow"></b>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>
//       {/* <!-- navb end --> */}

//       <div
//         style={{
//           opacity: `${
//             addBranch || showAddVendorModal || showAddInvoice ? 0.3 : 1
//           }`,
//         }}
//         onClick={() => {
//           (addBranch || showAddVendorModal || showAddInvoice) &&
//             closeAllModal();
//         }}
//         className="page-content container-plus"
//       >
//         <div className="ng_data animated fadeIn">
//           <form
//             role="form"
//             id="form_ajxMINRequest"
//             className="form_ajxMINRequest"
//           >
//             <div
//               className="min_normal ace-scrollbar"
//               style={{ height: "73vh" }}
//             >
//               {tab ? (
//                 <div id="vendor-details">
//                   <div className="row">
//                     <div className="col-sm-12 col-md-3">
//                       <h5>Vendor Details</h5>
//                     </div>
//                     <div className="col-sm-12 col-md-8">
//                       <div className="row">
//                         <div
//                           className="row"
//                           style={{
//                             position: "relative",
//                             width: "100%",
//                             marginBottom: "10px",
//                           }}
//                         >
//                           <div className="col-md-4">
//                             <label className="control-label">
//                               <small>Vendor Name</small>
//                             </label>
//                             <a
//                               id="vendor_add_model"
//                               className="pull-right"
//                               style={{
//                                 fontSize: "12px",
//                                 cursor: "pointer",
//                                 fontFamily: "montserrat",
//                               }}
//                               onClick={() => setShowAddVendorModal(true)}
//                             >
//                               add vendor
//                             </a>
//                             <br />
//                             <AsyncSelect
//                               loadOptions={getOption}
//                               onInputChange={(e) => setSearchVendor(e)}
//                               value={vendorBranches.vendorname}
//                               onChange={(value) => {
//                                 selectInputHandler("vendorname", value);
//                               }}
//                             />
//                           </div>
//                           <div className="col-md-4">
//                             <label className="control-label">
//                               <small>Vendor type</small>
//                             </label>
//                             <br />
//                             <Select
//                               options={options}
//                               onChange={(value) => {
//                                 selectInputHandler("vendortype", value);
//                               }}
//                             />
//                           </div>
//                           <div className="col-md-4">
//                             <label
//                               className="control-label"
//                               style={{ display: "initial !important" }}
//                             >
//                               <small>Branch</small>
//                             </label>
//                             <a
//                               id="add_ven_branch_btn"
//                               className="pull-right"
//                               style={{ fontSize: "12px", cursor: "pointer" }}
//                               onClick={() => setAddBranch(true)}
//                             >
//                               add branch
//                             </a>
//                             <br />
//                             <Select
//                               value={vendorBranches.vendorbranch}
//                               options={branches}
//                               onChange={(value) => {
//                                 selectInputHandler("vendorbranch", value);
//                               }}
//                               // loadOptions={showBranchOption}
//                               // onInputChange={(e) => setSearchVendor(e)}
//                             />
//                           </div>
//                         </div>
//                         <div
//                           className="row"
//                           style={{
//                             position: "relative",
//                             width: "100%",
//                             marginBottom: " 10px",
//                           }}
//                         >
//                           <div className="col-md-8">
//                             <label className="control-label">
//                               <small>Bill from address</small>
//                             </label>
//                             <br />
//                             <textarea
//                               type="text"
//                               className="form-control vendor_branch_address"
//                               name="vendor_branch_address"
//                               cols="3"
//                               rows="3"
//                               style={{ resize: "none" }}
//                               placeholder="use linebreak for line break"
//                               value={vendorBranches.vendoraddress}
//                               spellCheck="false"
//                             ></textarea>
//                           </div>
//                           <div className="col-md-4">
//                             <label className="control-label">
//                               <small>State</small>
//                             </label>
//                             <br />
//                             <span
//                               className="ajax_vendor_details_state"
//                               id="ajax_vendor_details_state"
//                             >
//                               --
//                             </span>
//                           </div>
//                         </div>
//                         <div
//                           className="row"
//                           style={{
//                             position: "relative",
//                             width: "100%",
//                             marginBottom: "10px",
//                           }}
//                         >
//                           <div className="col-md-4">
//                             <label className="control-label">
//                               <small>GSTIN / UIN</small>
//                             </label>
//                             <br />
//                             <span
//                               className="vendor_gst_number"
//                               id="vendor_gst_number"
//                             >
//                               --
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div
//                   id="material-details"
//                   className="table-responsive active ace-scrollbar"
//                   style={{ height: "78vh" }}
//                 >
//                   <div className="row">
//                     <div className="col-md-9">
//                       <div className="form-group">
//                         <input
//                           type="hidden"
//                           id="uploaded_files"
//                           name="uploaded_files"
//                           className="uploaded_files"
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-3"></div>
//                   </div>

//                   <table
//                     className="table table-striped table-hover table-bordered"
//                     id="initialize_tb"
//                   >
//                     <thead>
//                       <tr>
//                         <th style={{ width: "0%" }}>
//                           <button
//                             className="btn btn-outline-green btn-h-light-green btn-a-light-green border-b-2 text-600 px-3 mb-1"
//                             id="add_row"
//                             accessKey="+"
//                             type="button"
//                             onClick={addRows}
//                           >
//                             <i className="fa fa-plus text-110 text-green-d2 mr-1"></i>
//                           </button>
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "300px",
//                           }}
//                         >
//                           COMPONENT
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           QTY | UOM
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "300px",
//                           }}
//                         >
//                           RATE
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "180px",
//                           }}
//                         >
//                           ₹ VALUE
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "180px",
//                           }}
//                         >
//                           USD VALUE
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "180px",
//                           }}
//                         >
//                           INVOICE
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "180px",
//                           }}
//                         >
//                           LOCATION
//                         </th>

//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           HSN
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           GST TYPE
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           GST RATE
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           CGST
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           SGST
//                         </th>
//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "150px",
//                           }}
//                         >
//                           IGST
//                         </th>

//                         <th
//                           style={{
//                             textAlign: "center",
//                             verticalAlign: "middle",
//                             minWidth: "300px",
//                           }}
//                         >
//                           REMARK
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {/* duplicate from here */}
//                       {rowCount.map((count) => {
//                         return (
//                           <tr key={count}>
//                             {count != 1 && (
//                               <td
//                                 colspan="1"
//                                 style={{
//                                   maxWidth: "250px",
//                                   minWdth: "250px",
//                                 }}
//                               >
//                                 <button
//                                   className="btn btn-outline-yellow btn-h-light-yellow btn-a-light-yellow border-b-2 text-600 px-3 mb-1"
//                                   id="remove_row"
//                                   accesskey="+"
//                                   type="button"
//                                   onClick={() => removeRows(count)}
//                                 >
//                                   <i className="fa fa-minus text-110 text-warning-d2 mr-1"></i>
//                                 </button>
//                               </td>
//                             )}
//                             <td
//                               colspan={count != 1 ? "1" : "2"}
//                               style={{
//                                 maxWidth: " 250px",
//                                 minWidth: "250px",
//                               }}
//                             >
//                               <Select options={options} />
//                             </td>
//                             <td>
//                               <div className="input-floating-label text-orange-d2 brc-orange-m1">
//                                 <input
//                                   type="text"
//                                   name="order_qty[]"
//                                   placeholder="--"
//                                   className="form-control orderQty"
//                                   id="order_qty_1"
//                                 />
//                                 <span
//                                   className="floating-label text-grey-m3 quantity_old"
//                                   id="avail_stock_qty_1"
//                                 >
//                                   <span id="part_uom_1"></span>
//                                 </span>
//                               </div>
//                             </td>
//                             <td>
//                               <div style={{ display: "inline-flex" }}>
//                                 <input
//                                   type="text"
//                                   //   onfocus="select(); getGSTData('1'); getTotalCalculation('1')"
//                                   name="order_rate[]"
//                                   id="order_rate_1"
//                                   className="form-control orderRate"
//                                 />
//                                 <select
//                                   className="form-control currency_change_1"
//                                   name="currency_change[]"
//                                   style={{ width: "45px" }}
//                                   //   onchange="exchangeCurrency(1)"
//                                 ></select>
//                                 <input
//                                   type="hidden"
//                                   className="exchange_rate_1"
//                                   id="exchange_rate_1"
//                                   value="1"
//                                   name="exchange_rate[]"
//                                 />
//                               </div>
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 // onfocus="select()"
//                                 name="taxable_inr_value[]"
//                                 id="taxable_inr_value_1"
//                                 className="form-control taxable_inr_value"
//                                 disabled
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 // onfocus="select()"
//                                 name="taxable_forex_value[]"
//                                 id="taxable_forex_value_1"
//                                 className="form-control taxable_forex_value"
//                                 disabled
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 name="due_date[]"
//                                 id="due_date_1"
//                                 className="form-control dueDate"
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 list="hsns_for_comp_1"
//                                 name="hsn_code[]"
//                                 id="hsn_code_1"
//                                 className="form-control hsncode"
//                                 placeholder="HSN CODE"
//                               />
//                               <datalist id="hsns_for_comp_1"></datalist>
//                             </td>
//                             <td>
//                               <select
//                                 style={{ width: "100%" }}
//                                 name="gst_type[]"
//                                 className="gst_type"
//                                 id="gst_type_1"
//                               >
//                                 <option value="0">-- SELECT --</option>
//                                 <option value="L">LOCAL</option>
//                                 <option value="I">INTER STATE</option>
//                               </select>
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 name="gst_rate[]"
//                                 id="gst_rate_1"
//                                 className="form-control gst"
//                                 placeholder="GST"
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 name="cgst_rate[]"
//                                 id="cgst_rate_1"
//                                 className="form-control cgst"
//                                 placeholder="CGST"
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 name="sgst_rate[]"
//                                 id="sgst_rate_1"
//                                 className="form-control sgst"
//                                 placeholder="SGST"
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 name="igst_rate[]"
//                                 id="igst_rate_1"
//                                 className="form-control igst"
//                                 placeholder="IGST"
//                                 // readonly
//                               />
//                             </td>
//                             <td>
//                               <textarea
//                                 cols="1"
//                                 rows="1"
//                                 name="comp_remark[]"
//                                 id="comp_remark_1"
//                                 className="form-control"
//                                 style={{ resize: "none" }}
//                               ></textarea>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                       {/* till here */}
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {/* 2nd page */}
//             </div>

//             {/* Bottom  */}
//             <div className="row mt-5 border-t-1 bgc-secondary-l4 brc-secondary-l2 py-35 mx-n25">
//               <div className="col-md-6">
//                 <div className="l_c_h">
//                   <div className="c_h">
//                     <div className="left_c">
//                       <div
//                         onClick={toggleTexas}
//                         className=" left right_c left_icons"
//                       >
//                         <a
//                           href="#"
//                           className="bg mini"
//                           style={{ fontSize: "23px" }}
//                         >
//                           {taxes ? "-" : "+"}
//                         </a>
//                       </div>
//                       <div className="left center_icons">
//                         {/* <!--center_icons--> */}
//                         Taxes Detail
//                       </div>
//                       {/* <!--end center_icons--> */}
//                     </div>
//                     <div className="clear"></div>
//                   </div>
//                   {/* <!-- Tax Detail Popup --> */}
//                   {taxes ? (
//                     <div className="msg_container">
//                       <table className="table" style={{ width: "100%" }}>
//                         <tr
//                           className="summary-row sub-total"
//                           style={{ borderBottom: "1px solid #e0e0e0" }}
//                         >
//                           <td style={{ padding: "3px" }}>
//                             <span>Sub-Total value before Taxes</span>
//                           </td>
//                           <td
//                             style={{ padding: "3px", textAlign: "right" }}
//                             className="amount_taxable_val"
//                           >
//                             ₹0.00
//                           </td>
//                         </tr>
//                         <tr>
//                           <td style={{ padding: "3px" }}>
//                             <span>CGST</span>
//                           </td>
//                           <td
//                             style={{ padding: "3px", textAlign: "right" }}
//                             className="amount_cgst_val"
//                           >
//                             (+) ₹0.00
//                           </td>
//                         </tr>
//                         <tr>
//                           <td style={{ padding: "3px" }}>
//                             <span>SGST</span>
//                           </td>
//                           <td
//                             style={{ padding: "3px", textAlign: "right" }}
//                             className="amount_sgst_val"
//                           >
//                             (+) ₹0.00
//                           </td>
//                         </tr>
//                         <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
//                           <td style={{ padding: "3px" }}>IGST</td>
//                           <td
//                             style={{ padding: "3px", textAlign: "right" }}
//                             className="amount_igst_val"
//                           >
//                             (+) ₹0.00
//                           </td>
//                         </tr>
//                         <tr>
//                           <td style={{ padding: "3px" }}>
//                             <span>Total Taxes (CGST+SGST+IGST)</span>
//                           </td>
//                           <td
//                             style={{ padding: "3px", textAlign: "right" }}
//                             className="amount_csi_val"
//                           >
//                             ₹0.00
//                           </td>
//                         </tr>
//                         <tr
//                           className="total-payable"
//                           style={{
//                             fontSize: "14px",
//                             lineHeight: "2rem",
//                             fontWeight: "700",
//                             borderTop: "1px solid #e0e0e0",
//                             borderBottom: "2px solid #e0e0e0",
//                           }}
//                         >
//                           <td style={{ padding: "3px" }}>
//                             <span>Net Amount</span>
//                           </td>
//                           <td
//                             style={{ padding: "3px", textAlign: "right" }}
//                             className="amount_net_val"
//                           >
//                             ₹0.00
//                           </td>
//                         </tr>
//                       </table>
//                     </div>
//                   ) : (
//                     ""
//                   )}
//                   {/* <!-- Tax Detail Popup End--> */}
//                 </div>
//               </div>

//               {/* <!-- Bottom Start --> */}
//               <div className="col-md-6 text-nowrap">
//                 <div className="">
//                   <button
//                     onClick={() => setShowAddInvoice(true)}
//                     type="button"
//                     className="d-style btn btn-white btn-h-lighter-blue btn-a-blue shadow-sm radius-round text-600 letter-spacing px-4 mb-1"
//                     // data-toggle="modal"
//                     // data-target="#id-ace-uploadfile-modal"
//                   >
//                     <i className="fa fa-upload mr-2 f-n-hover"></i>
//                     Upload Doc(s)
//                   </button>
//                   &nbsp; &nbsp; &nbsp; &nbsp;
//                   <button
//                     type="button"
//                     className="btn btn-outline-red btn-h-light-red btn-a-light-red border-b-2 text-600 px-3 mb-1"
//                     id="reset_po"
//                     onClick="resetForm();"
//                   >
//                     <i className="fa fa-trash-alt text-110 text-red-d2 mr-1"></i>
//                     &nbsp;RESET
//                   </button>
//                   &nbsp; &nbsp;
//                   {tab ? (
//                     <button
//                       type="button"
//                       className="btn btn-outline-green btn-h-light-green btn-a-light-green border-b-2 text-600 px-3 mb-1"
//                       id="next_btn"
//                       onClick={toggleButton}
//                     >
//                       NEXT &nbsp;
//                       <i className="fa fa-arrow-right text-110 text-green-d2 mr-1"></i>
//                     </button>
//                   ) : (
//                     <>
//                       <button
//                         type="button"
//                         className="btn btn-outline-orange btn-h-light-orange btn-a-light-orange border-b-2 text-600 px-3 mb-1"
//                         id="previous_btn"
//                         onClick={toggleButtonBack}
//                         // style={{ display: "none" }}
//                       >
//                         <i className="fa fa-arrow-left text-110 text-orange-d2 mr-1"></i>
//                         &nbsp;Previous
//                       </button>
//                       &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;
//                       <button
//                         className="btn pt-1 btn-success radius-round pl-1 shadow-sm mb-1"
//                         id="submitMINReq"
//                       >
//                         <i className="w-3 h-3 bgc-white text-success-m1 radius-round fa fa-check mr-1 align-middle pt-15 text-85"></i>
//                         <span className="align-middle pl-1 pr-2">MIN Save</span>
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//               {/* <!-- Bottom End --> */}
//             </div>
//           </form>
//         </div>
//       </div>
//       {/* add branch */}
//     </>
//   );
// };

// export default MaterialTransaction;

// {
//   /* <button onClick={toggleModal} className="btn btn-primary">
//         Show
//       </button>
//       <Modal isOpen={show} style={{width:"200px",height:"200px"}} >
//         <button onClick={toggleModal} className="btn btn-primary">
//           Close
//         </button>
//       </Modal> */
// }
