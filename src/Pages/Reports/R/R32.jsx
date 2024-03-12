import React, { useEffect, useState } from "react";
import MyDataTable from "../../gstreco/myDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { Button, Row } from "antd";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";

function R32() {






  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.get("/report32");
    console.log("response", response);
    const { data } = response;
    if (data.status) {
      let arr = [];
      arr = data.data.map((r, index) => {
        return {
          ...r,
          id: index + 1,
        };
      });
      console.log("arr", arr);
      setRows(arr);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  const handleDownloadingCSV = () => {
    downloadCSV(rows, columns, `R32 Report`);
  };
  useEffect(() => {
    getRows();
  }, []);

  return (
    <div className="hide-select" style={{ height: "90%" }}>
      <Row style={{ margin: "1em" }} justify="end">
        <CommonIcons action="downloadButton" onClick={handleDownloadingCSV} />
      </Row>
      <div style={{ height: "90%" }}>
        {" "}
        <MyDataTable
          // checkboxSelection={true}
          loading={loading}
          data={rows}
          columns={columns}
        />
      </div>
    </div>
  );
}

export default R32;
const columns = [
  { headerName: "#", field: "id", width: 50 },
  { headerName: "Cat Part Code", field: "new_part_code", width: 130 },
  { headerName: "Part Code", field: "part_code", width: 130 },
  { headerName: "Cat Part Name", field: "part_name", width: 350 },
  { headerName: "Qty", field: "qty", width: 130 },
  { headerName: "UoM", field: "uom", width: 130 },
  { headerName: "In Location", field: "in_location", width: 100 },
  { headerName: "Out Location", field: "out_location", width: 100 },
  {
    headerName: "Transfer Transaction",
    field: "transfer_transaction",
    width: 150,
  },
  { headerName: "Out Cost Center", field: "out_cost_center", width: 150 },
  { headerName: "In Cost Center", field: "in_cost_center", width: 150 },
];
