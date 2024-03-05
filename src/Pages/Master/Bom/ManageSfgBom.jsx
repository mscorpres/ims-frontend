import React, { useEffect, useState } from "react";
import ViewSFGModal from "./ViewSFGModal";
import EditSFGModal from "./EditSFGModal";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { Col, Row, Space } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";

function ManageSfgBom() {
  const [sfgData, setSfgData] = useState([]);
  const [sfgViewModal, setSfgViewModal] = useState(false);
  const [sfgEditModal, setSfgEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFetchSFG = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/bom/semiFgBom");
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setSfgData(arr);
    setLoading(false);
  };
  const columns = [
    { field: "ID", headerName: "Serial No.", width: 80 },
    { field: "subject_name", headerName: "Product Name & SKU", width: 600 },
    { field: "bom_product_sku", headerName: "SKU", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      type: "actions",
      getActions: ({ row }) => [
        <TableActions action="view" onClick={() => setSfgViewModal(row)} />,
        <TableActions action="edit" onClick={() => setSfgEditModal(row)} />,
      ],
    },
  ];

  useEffect(() => {
    getFetchSFG();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: "0px 10px", paddingBottom: 5 }} justify="end">
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(sfgData, columns, "Semi FG Report")}
            />
          </Space>
        </Col>
      </Row>
      <div style={{ height: "90%", padding: "0px 10px" }}>
        <MyDataTable loading={loading} data={sfgData} columns={columns} />
      </div>

      <ViewSFGModal
        setSfgViewModal={setSfgViewModal}
        sfgViewModal={sfgViewModal}
      />
      <EditSFGModal
        setSfgEditModal={setSfgEditModal}
        sfgEditModal={sfgEditModal}
      />
    </div>
  );
}

export default ManageSfgBom;
