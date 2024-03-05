import { Drawer, Space } from "antd";
import React, { useEffect, useState } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";

export default function AddBranchModal({ open, setOpen }) {
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);

  const fetchDataFromViewBom = async () => {
    const { data } = await imsAxios.post("/bom/bomComponents", {
      subject_id: open.bomId,
    });
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setStoreData(arr);
    setLoading(false);
  };

  const columns = [
    // { field: "serial_no", headerName: "#", width: 80 },
    { field: "c_name", headerName: "ComponentName", width: 450 },
    { field: "c_part_no", headerName: "Part No", flex: 1 },
    { field: "units_name", headerName: "Uom", flex: 1 },
    { field: "qty", headerName: "Req. Qty", flex: 1 },
  ];

  useEffect(() => {
    fetchDataFromViewBom();
  }, [open]);

  return (
    <Space>
      <Drawer
        width="50vw"
        // title={open?.bomName}
        title={`${open?.bomName} / ${storeData?.length} item${
          storeData?.length == 1 ? "" : "s"
        }`}
        onClose={() => setOpen(false)}
        open={open}
        getContainer={false}
      >
        <MyDataTable loading={loading} data={storeData} columns={columns} />
      </Drawer>
    </Space>
  );
}

// <div
//   style={{
//     height: "94%",
//     width: "100vw",
//     position: "fixed",
//     top: "6%",
//     // right: '0'
//     right: `${modalOpen ? "0vh" : "-100vw"}`,
//     zIndex: "9909999",
//     transition: "all 350ms linear",
//   }}
//   className="card text-center"
// >
//   <div
//     className="card-header bg-secondary text-white"
//     style={{
//       fontFamily: "montserrat",
//       fontSize: "15px",
//       color: "dodgerblue",
//     }}
//   >
//     Component Under BOM
//     <AiFillCloseCircle
//       className="cursorr "
//       size="20"
//       onClick={() => setModalOpen(null)}
//     />
//   </div>
//   <div className="card-body p-5">
//     <DataTable
//       columns={columns}
//       scro
//       data={storeData}
//       pagination
//       fixedHeader="true"
//       fixedHeaderScrollHeight={"55vh"}
//       customStyles={customStyles}
//       highlightOnHover
//       // subHeader
//       // subHeaderComponent={
//       //   <input
//       //     className="form-control"
//       //     value={search}
//       //     onChange={(e) => setSearch(e.target.value)}
//       //     type="text"
//       //     placeholder="Search"
//       //   />
//       // }
//     />
//   </div>
//   <div className="card-footer text-muted"></div>
// </div>
