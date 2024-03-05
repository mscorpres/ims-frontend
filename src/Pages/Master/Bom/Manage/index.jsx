import { useState } from "react";
import { useLocation } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { Switch } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewModal from "./ViewModal";
import { downloadExcel } from "../../../../Components/printFunction";
import EditModal from "./Edit";

const ManageBOM = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewBom, setViewBom] = useState(false);
  const [editBom, setEditBom] = useState(false);
  const { pathname } = useLocation();
  const bomType = pathname.includes("sfg") ? "sfg" : "fg";

  const getRows = async () => {
    let url = "";
    if (bomType === "sfg") {
      url = "bom/semiFgBom";
    } else {
      url = "bom/fgBom";
    }
    setLoading("fetch");
    const response = await imsAxios.get(url);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const arr = data.data.map((row, index) => ({
          id: index + 1,
          product: row.subject_name,
          sku: row.bom_product_sku,
          createdDate: row.insert_date,
          level: row.bom_level,
          bomId: row.subject_id,
          status: row.bom_status,
        }));

        setRows(arr);
      }
    }
  };
  const toggleStatus = async (id, status) => {
    const statusText = status ? "ENABLE" : "DISABLE";
    setLoading(id);
    const response = await imsAxios.post("/bom/updateBOMStatus", {
      subject_id: id,
      status: statusText,
    });
    const { data } = response;
    if (data) {
      if (data.status === "success") {
        setRows((curr) =>
          curr.map((row) => {
            if (row.bomId === id) {
              return {
                ...row,
                status: row.status === "ENABLE" ? "DISABLED" : "ENABLE",
              };
            } else {
              return row;
            }
          })
        );
      }
    }
    setLoading(false);
  };
  const handleBOMDownload = async (id, name) => {
    setLoading("fetch");
    const response = await imsAxios.post("/bom/bomExcelDownload", {
      subject_id: id,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        downloadExcel(data.data.buffer.data, `BOM ${name}`);
      }
    }
  };
  const actionColumns = [
    {
      headerName: "",
      width: 30,
      type: "actions",
      field: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="View"
          onClick={() => setViewBom({ name: row.product, id: row.bomId })}
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Edit"
          onClick={() => setEditBom({ name: row.product, id: row.bomId })}
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Download"
          onClick={() => handleBOMDownload(row.bomId, row.product)}
        />,
      ],
    },
    {
      headerName: "Status",
      width: 100,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === "ENABLE"}
          loading={loading === row.bomId}
          onChange={(value) => {
            toggleStatus(row.bomId, value);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    getRows();
  }, []);
  return (
    <div style={{ height: "90%", padding: 10, paddingTop: 0 }}>
      <MyDataTable
        loading={loading === "fetch"}
        columns={[...actionColumns, ...columns]}
        data={rows}
      />

      <ViewModal show={viewBom} close={() => setViewBom(false)} />
      <EditModal
        bomType={bomType}
        show={editBom}
        close={() => setEditBom(false)}
      />
    </div>
  );
};

export default ManageBOM;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 200,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Level",
    field: "level",
    minWidth: 50,
  },
  {
    headerName: "Created Date",
    field: "createdDate",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.createdDate} />,
  },
];
