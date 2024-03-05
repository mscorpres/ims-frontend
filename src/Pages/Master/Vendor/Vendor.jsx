import React, { useState, useEffect } from "react";
import AddBranch from "./model/AddBranch.jsx";
import EditBranch from "./model/EditBranch.jsx";
import ViewModal from "./model/ViewModal.jsx";
import MyDataTable from "../../../Components/MyDataTable.jsx";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { v4 } from "uuid";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import { Row } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV.jsx";
import { imsAxios } from "../../../axiosInterceptor.js";

const Vendor = () => {
  const [allVendor, setAllVender] = useState([]);
  const [openBranch, setOpenBranch] = useState(false);
  const [editVendor, setEditVendor] = useState(false);
  const [viewVendor, setViewVendor] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchVendor = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/vendor/getAll");
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
        vendor_status: row.vendor_status == "B" ? "Blocked" : "Active",
      };
    });
    setAllVender(arr);
    setLoading(false);
  };
  const coloums = [
    { field: "vendor_name", headerName: "Name", width: 500 },
    { field: "vendor_code", headerName: "Code", flex: 1 },
    {
      field: "vendor_status",
      headerName: "Vendor Status",
      renderCell: ({ row }) => (
        <span
          style={{ color: row.vendor_status == "Active" ? "green" : "brown" }}
        >
          {row.vendor_status}
        </span>
      ),
      flex: 1,
    },
    { field: "vendor_pan", headerName: "PAN No.", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          // icon={<SecurityIcon />}
          label="Edit Vendor"
          onClick={() => setEditVendor(row)}
          showInMenu
        />,
        <GridActionsCellItem
          // icon={<FileCopyIcon />}
          label="Add Branch"
          onClick={() => setOpenBranch(row)}
          showInMenu
        />,
        <GridActionsCellItem
          // icon={<FileCopyIcon />}
          label="Edit / View Branch Details"
          onClick={() => setViewVendor(row)}
          showInMenu
        />,
        // <TableActions  showInMenu action="view" onClick={() => setViewVendor(row)} />,
      ],
      // getActions: ({ row }) => [
      //   <GridActionsCellItem
      //     icon={
      //       <>
      //         <Button
      //           onClick={() => setEditVendor(row)}
      //           style={{ backgroundColor: "#5837D0", color: "white" }}
      //         >
      //           Edit
      //         </Button>
      //         <Button
      //           onClick={() => setOpenBranch(row)}
      //           style={{
      //             width: "100%",
      //             backgroundColor: "#379237",
      //             color: "white",
      //           }}
      //         >
      //           Branch
      //         </Button>
      //         <Button
      //           onClick={() => setViewVendor(row)}
      //           style={{
      //             width: "100%",
      //             backgroundColor: "#497174",
      //             color: "white",
      //           }}
      //         >
      //           View
      //         </Button>
      //       </>
      //     }
      //   />,
      // ],
    },
  ];
  useEffect(() => {
    fetchVendor();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row justify="end" style={{ padding: "0px 10px", paddingBottom: 5 }}>
        <CommonIcons
          action="downloadButton"
          onClick={() => downloadCSV(allVendor, coloums, "Vendor Report")}
        />
      </Row>
      <div style={{ height: "95%", padding: "0 10px" }}>
        <MyDataTable loading={loading} data={allVendor} columns={coloums} />
      </div>

      <AddBranch
        fetchVendor={fetchVendor}
        openBranch={openBranch}
        setOpenBranch={setOpenBranch}
      />
      <EditBranch
        fetchVendor={fetchVendor}
        setEditVendor={setEditVendor}
        editVendor={editVendor}
      />
      <ViewModal
        setShowViewModal={setShowViewModal}
        showViewModal={showViewModal}
        setViewVendor={setViewVendor}
        viewVendor={viewVendor}
      />
    </div>
  );
};

export default Vendor;

// <div p-1" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
//   <DataTable
//     fixedHeader="true"
//     fixedHeaderScrollHeight={"55vh"}
//     columns={coloums}
//     title="All Vendor Details"
//     data={filterData}
//     pagination
//     highlightOnHover
//     actions={<IoIosPersonAdd nClick={() => setOpen(true)} />}
//     subHeader
//     subHeaderComponent={
//       <input
//         ntrol"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         type="text"
//         placeholder="Branch Name"
//       />
//     }
//     customStyles={customStyles}
//   />
// </div>
