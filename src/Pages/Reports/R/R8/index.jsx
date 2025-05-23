import { Button, Col, Row, Space, Select, Input } from "antd";
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
import MyButton from "../../../../Components/MyButton";

function R8() {
  const [searchInput, setSearchInput] = useState("");
  const [skuInput, setSkuInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeDetails, setSeeDetails] = useState(false);
  const [type, setType] = useState("datewise");
  const options = [
    { label: "Date wise", value: "datewise" },
    { label: "SKU wise", value: "skuwise" },
    { label: "Both", value: "both" },
  ];

  const getRows = async () => {
    try {
      setLoading("fetch");
      setRows([]);

      let payload = {
        wise: type,
      };

      if (type === "datewise") {
        payload.data = searchInput;
      } else if (type === "skuwise") {
        payload.data = skuInput;
      } else if (type === "both") {
        payload.data = skuInput;
        payload.advanced = true;
        payload.dateRange = searchInput;
        payload.wise = "skuwise";
      }

      const { data } = await imsAxios.post("/report8", payload);
      if (data) {
        const arr = data.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(arr);
      }
    } catch (error) {
      console.log("Some error occurred while fetching rows", error);
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
    let payload = {
      otherdata: searchInput,
      notificationId: newId,
      wise: type,
      data: null,
      advanced: false,
    };

    if (type === "datewise") {
      payload.data = searchInput;
    } else if (type === "skuwise") {
      payload.data = skuInput;
    } else if (type === "both") {
      payload.data = skuInput;
      payload.advanced = true;
      payload.wise = "skuwise";
    }

    socket.emit("generate_r8_report", payload);
  };

  return (
    <div style={{ height: "90%" }}>
      <Space align="center" style={{ width: "100%", marginBottom: 8 }}>
        <Select
          placeholder="Select Type"
          options={options}
          value={type}
          onChange={(e) => setType(e)}
          style={{ width: 150 }}
        />
        {type === "datewise" && (
          <MyDatePicker setDateRange={setSearchInput} style={{ width: 250 }} />
        )}
        {type === "skuwise" && (
          <Input
            type="text"
            placeholder="Enter SKU"
            onChange={(e) => setSkuInput(e.target.value)}
            style={{ width: 200 }}
          />
        )}
        {type === "both" && (
          <>
            <MyDatePicker
              setDateRange={setSearchInput}
              style={{ width: 250 }}
            />
            <Input
              type="text"
              placeholder="Enter SKU"
              onClick={(e) => setSkuInput(e.target.value)}
              style={{ width: 200 }}
            />
          </>
        )}
        <MyButton
          variant="search"
          loading={loading === "fetch"}
          onClick={getRows}
          type="primary"
        >
          Fetch
        </MyButton>
        <CommonIcons
          onClick={downloadHandler}
          type="primary"
          action="downloadButton"
        />
      </Space>
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
    headerName: "UoM",
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