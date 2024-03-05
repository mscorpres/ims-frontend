import { Button, Col, Row, Space } from "antd";
import { useState } from "react";
import MyDatePicker from "../../../../Components/MyDatePicker";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import DetailsModal from "./DetailsModal";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import socket from "../../../../Components/socket";
import { v4 } from "uuid";

function R8() {
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeDetails, setSeeDetails] = useState(false);

  const getRows = async () => {
    try {
      setLoading("fetch");
      setRows([]);
      const { data } = await imsAxios.post("/report8", {
        date: searchInput,
      });
      if (data) {
        const arr = data.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(arr);
      }
    } catch (error) {
      console.log("Some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const actionMenuItem = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // View
      <GridActionsCellItem
        showInMenu
        label="View"
        onClick={() => setSeeDetails(row.mfg_id)}
      />,
    ],
  };
  const downloadHandler = () => {
    let newId = v4();

    socket.emit("generate_r8_report", {
      otherdata: { date: searchInput },
      notificationId: newId,
    });
  };
  return (
    <div style={{ height: "90%" }}>
      <Row justify="space-between" style={{ padding: 5, paddingTop: 0 }}>
        <Col>
          <Space>
            <MyDatePicker setDateRange={setSearchInput} />
            <Button
              loading={loading === "fetch"}
              onClick={getRows}
              type="primary"
            >
              Fetch
            </Button>
          </Space>
        </Col>
        <Col>
          <CommonIcons
            onClick={downloadHandler}
            type="primary"
            action="downloadButton"
          />
        </Col>
      </Row>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <MyDataTable
          loading={loading === "fetch"}
          columns={[actionMenuItem, ...columns]}
          data={rows}
        />
      </div>

      <DetailsModal show={seeDetails} close={() => setSeeDetails(false)} />
    </div>
  );
}

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "MFG No.",
    field: "mfg_id",
    width: 120,
  },
  {
    headerName: "Date",
    field: "date",
    width: 150,
  },
  {
    headerName: "SKU",
    field: "productsku",
    width: 120,
  },
  {
    headerName: "SKU Type",
    field: "fgtype",
    width: 100,
  },

  {
    headerName: "Product",
    field: "productname",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "UOM",
    field: "unit",
    width: 50,
  },
  {
    headerName: "MFG By",
    field: "user",
    width: 180,
    renderCell: ({ row }) => <ToolTipEllipses text={row.user} />,
  },
  {
    headerName: "MFG Qty",
    field: "mfg_qty",
    width: 180,
    renderCell: ({ row }) => <ToolTipEllipses text={row.mfg_qty} />,
  },
  {
    headerName: "Remark",
    field: "remark",
    minWidth: 180,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
  },
];

export default R8;
