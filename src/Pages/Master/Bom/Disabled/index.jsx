import { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import { Row, Switch } from "antd";
import { toast } from "react-toastify";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

const Disabled = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/bom/getDraftBOMs");
      const { data } = response;
      if (data && data?.data.length) {
        const arr = data.data.map((row, index) => ({
          id: index + 1,
          product: row.subject_name,
          sku: row.bom_product_sku,
          bomId: row.subject_id,
          status: "DISABLE",
        }));

        setRows(arr);
      } else if (data && !data?.data) {
        toast.error(data.message.msg);
      }
    } catch (error) {
      setRows([]);
      console.log("error while fetching disabled BOMs", error);
    } finally {
      setLoading(false);
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

  const downloadHandler = () => {
    downloadCSV(rows, columns, "disabled BOM List");
  };

  const actionColumns = [
    {
      header: "Status",
      width: 100,
      accessorKey: "status",

      Cell: ({ row }) => (
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

  const table = useMaterialReactTable({
    columns: [...actionColumns, ...columns],
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height:
          loading === "fetch" ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });
  return (
    <div style={{ height: "90%", margin:12 }}>
      <Row style={{ marginBottom: 12 }} justify="end">
        <CommonIcons
          action="downloadButton"
          onClick={downloadHandler}
          disabled={rows.length === 0}
        />
      </Row>

      <MaterialReactTable table={table} />
    </div>
  );
};

export default Disabled;

const columns = [
  {
    header: "#",
    accessorKey: "id",
    width: 30,
  },
  {
    header: "Product",
    accessorKey: "product",
    minWidth: 200,
    flex: 1,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    width: 150,
  },
];
