import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import AddShippingAddress from "./AddShippingAddress.";

function ShippingAddress() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.get("/shippingAddress/getAll");
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          id: index,
          index: index + 1,
          ...row,
        }));
        setRows(arr);
      } else {
        setRows([]);
        toast.error(data.message.msg);
      }
    }
  };
  const columns = [
    { headerName: "Sr. No.", field: "index", width: 80 },
    { headerName: "Label", field: "label", flex: 1 },
    { headerName: "Company", field: "company", flex: 1 },
    { headerName: "State", field: "state", flex: 1 },
    { headerName: "Pan No.", field: "pan", width: 150 },
    { headerName: "GST", field: "gst", width: 150 },
  ];
  const handleCSVDownload = () => {
    downloadCSV(rows, columns, "Shipping Address Report");
  };
  useEffect(() => {
    getRows();
  }, []);
  return (
    <div style={{ height: "90%", padding: "0px 5px" }}>
      <Row gutter={6} style={{ height: "95%" }}>
        <Col span={4}>
          <AddShippingAddress
            getRows={getRows}
            handleCSVDownload={handleCSVDownload}
          />
        </Col>
        <Col span={20}>
          <MyDataTable
            loading={loading === "fetch"}
            columns={columns}
            rows={rows}
          />
        </Col>
      </Row>
    </div>
  );
}

export default ShippingAddress;
