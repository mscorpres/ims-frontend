// import React, { useState } from "react";
// import SfHeader from "./header/SfHeader";
// import Select from "react-select";
// import axios from "axios";
// import { toast } from "react-toastify";
// import DataTable from "react-data-table-component";
// import moment from "moment";
// import { DatePicker } from "antd";
// import waiting from "../../../animation/main.json";

// const { RangePicker } = DatePicker;

// function TransactionSF() {
//   document.title = "View Transaction SF To SF";
//   const [loading, setLoading] = useState(false);
//   const [date, setData] = useState([]);
//   const [allData, setAllData] = useState({
//     selType: "",
//   });
//   const [data, setDat] = useState([]);

//   const fetchData = async () => {
//     setLoading(true);
//     let aa = date[0];
//     let bb = date[1];
//     let c = aa + ` ` + `-` + ` ` + bb;
//     const { data } = await imsAxios.post("/godown/report_sf_rej", {
//       data: c,
//       wise: allData.selType.value,
//     });
//     // setDat(data.data);
//     // console.log(data.data);
//     if (data.code == 200) {
//       setDat(data.data);
//       toast.success(data.status);
//       setLoading(false);
//     } else if (data.code == 500) {
//       toast.error(data.message.msg);
//       setLoading(false);
//     }
//   };

//   const customStyles = {
//     rows: {
//       style: {
//         minHeight: "35px", // override the row height
//       },
//     },
//     headCells: {
//       style: {
//         background: "#4D636F",
//         color: "white",
//         // minHeight: "72px"

//         // fontSize: "12px",
//       },
//     },
//     cells: {
//       style: {
//         fontSize: "10px",
//         // minHeight: "5px",
//       },
//     },
//   };

//   const col = [
//     // {name:"#",selector:(row)=>row.}
//     {
//       name: "Data/Time",
//       selector: (row) => row.date,
//       width: "10vw",
//       sortable: true,
//     },
//     { name: "Part", selector: (row) => row.part, sortable: true },
//     {
//       name: "Component",
//       selector: (row) => row.name,
//       width: "14vw",
//       sortable: true,
//     },
//     {
//       name: "Out Location",
//       selector: (row) => row.out_location,
//       width: "8vw",
//       sortable: true,
//     },
//     {
//       name: "In Location",
//       selector: (row) => row.in_location,
//       width: "8vw",
//       sortable: true,
//     },
//     { name: "Qty", selector: (row) => row.qty, sortable: true },
//     { name: "Uom", selector: (row) => row.uom, sortable: true },
//     {
//       name: "Txt Id",
//       selector: (row) => row.transaction,
//       sortable: true,
//       width: "7vw",
//     },
//     {
//       name: "Shifted By",
//       selector: (row) => row.completed_by,
//       width: "10vw",
//       sortable: true,
//     },
//     {
//       name: "Remarks",
//       selector: (row) => row.remark,
//       width: "10vw",
//       sortable: true,
//     },
//   ];

//   const opt = [{ label: "Date", value: "datewise" }];
//   return (
//     <div>
//       <SfHeader />

//       <div className="row m-2 ">
//         <div className="col-md-2">
//           <Select
//             options={opt}
//             value={allData.selType}
//             onChange={(e) =>
//               setAllData((allData) => {
//                 return { ...allData, selType: e };
//               })
//             }
//           />
//         </div>
//         <div className="col-md-2">
//           <RangePicker
//             style={{
//               minHeight: "38px",
//             }}
//             onChange={(e) => {
//               setData(
//                 e.map((item) => {
//                   return moment(item).format("DD-MM-YYYY");
//                 })
//               );
//             }}
//           />
//         </div>
//         <div className="col-md-2">
//           <button className="btn btn-secondary" onClick={fetchData}>
//             Search
//           </button>
//         </div>
//       </div>
//       <hr className="m-2" />

//       <div className="m-2">
//         {loading ? (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "70vh",
//             }}
//           >
//             <Lottie
//               animationData={waiting}
//               loop={true}
//               style={{ height: "200px" }}
//             />
//           </div>
//         ) : (
//           <DataTable
//             data={data}
//             columns={col}
//             customStyles={customStyles}
//             pointerOnHover
//             pagination
//             highlightOnHover
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default TransactionSF;
