import React, { useEffect, useState } from "react";
import SideModal from "./SideModal";
import EditModal from "./EditModal";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { Col, Row, Space } from "antd";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";

const ViewBom = () => {
  const [open, setOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [filter, setFilter] = useState([]);
  const [search, setSearch] = useState("");

  const columns = [
    { field: "ID", headerName: "Serial No.", width: 80 },
    { field: "subject_name", headerName: "Product Name & SKU", flex: 1 },
    { field: "bom_product_sku", headerName: "SKU", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      type: "actions",
      getActions: ({ row }) => [
        <TableActions
          action="view"
          onClick={() =>
            setOpen({ bomId: row.subject_id, bomName: row.subject_name })
          }
        />,
        <TableActions action="edit" onClick={() => setModalEditOpen(row)} />,
      ],
    },
  ];
  const fetchAllData = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/bom/fgBom");
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setTableData(arr);
    setLoading(false);
  };

  useEffect(() => {
    const res = tableData.filter((a) => {
      return a.subject_name.toLowerCase().match(search.toLowerCase());
    });
    setFilter(res);
  }, [search]);

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: "0px 10px", paddingBottom: 5 }} justify="end">
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(tableData, columns, "FG Report")}
            />
          </Space>
        </Col>
      </Row>
      <div style={{ height: "95%", padding: "0px 10px" }}>
        <MyDataTable loading={loading} data={tableData} columns={columns} />
      </div>

      <SideModal open={open} setOpen={setOpen} />
      <EditModal
        modalEditOpen={modalEditOpen}
        setModalEditOpen={setModalEditOpen}
      />
    </div>
  );
};

export default ViewBom;

// <div className="m-3 shadow">
//   {loading ? (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "70vh",
//         zIndex: "999999",
//       }}
//     >
//       <Lottie animationData={waiting} loop={true} style={{ height: "200px" }} />
//     </div>
//   ) : (
//     <DataTable
//       // title="Manage FG Bom"
//       fixedHeader="true"
//       fixedHeaderScrollHeight={"55vh"}
//       customStyles={customStyles}
//       highlightOnHover
//       columns={columns}
//       data={filter}
//       pagination
//       // progressPending={}
//       subHeader
//       subHeaderComponent={
//         <input
//           className="form-control mb-4"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           type="text"
//           placeholder="Search SKU"
//         />
//       }
//     />
//   )}
// </div>

// {/* <ViewModal modalOpen={modalOpen} setModalOpen={setModalOpen} /> */}
// <SideModal modalOpen={modalOpen} setModalOpen={setModalOpen} tableData={tableData} />
// <EditModal setModalEditOpen={setModalEditOpen} modalEditOpen={modalEditOpen} />
