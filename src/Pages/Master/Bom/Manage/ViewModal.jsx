import { Drawer } from "antd";
import { useState, useEffect, useMemo } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import { toast } from "react-toastify";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { Box, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

const ViewModal = ({ show, close }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    downloadCSV(rows, columns, `BOM ${show.name}`);
  };

  const getRows = async (id) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/bom/bomComponents", {
        subject_id: id,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row, index) => ({
            id: index + 1,
            component: row.c_name,
            partCode: row.c_part_no,
            qty: row.qty,
            uom: row.units_name,
          }));

          setRows(arr);
        }
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      console.log("error while fetching bom components", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      getRows(show.id);
    }
  }, [show]);

  const columns = useMemo(() => bomColumns, []);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 190px)" : "calc(100vh - 190px)",
      },
    },
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
    <Drawer
      width="50vw"
      title={`${show?.name} / ${rows?.length} items`}
      extra={
        <CommonIcons
          disabled={rows.length === 0}
          action="downloadButton"
          onClick={handleDownload}
        />
      }
      onClose={close}
      open={show}
      bodyStyle={{
        padding: 5,
      }}
    >
      {/* <MyDataTable
        loading={loading === "fetch"}
        columns={columns}
        data={rows}
      /> */}
      <MaterialReactTable table={table} />
    </Drawer>
  );
};

export default ViewModal;

const bomColumns = [
  {
    accessorKey: "id",
    header: "#",
    size: 10,
    // size: 30,
  },
  {
    accessorKey: "component",
    header: "Component",
    // size: 200,
  },
  {
    accessorKey: "partCode",
    header: "Part Code",
    // size: 100,
  },
  {
    accessorKey: "qty",
    header: "BOM Qty",
    // size: 100,
  },
  {
    accessorKey: "uom",
    header: "UoM",
  },
];
