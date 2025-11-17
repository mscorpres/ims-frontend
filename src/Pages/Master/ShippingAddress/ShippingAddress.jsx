import { Col, Row } from "antd";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import AddShippingAddress from "./AddShippingAddress.";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";

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
  const shippingAddressColumns = [
    { header: "Sr. No.", accessorKey: "index", width: 80 },
    { header: "Label", accessorKey: "label", },
    { header: "Company", accessorKey: "company", },
    { header: "State", accessorKey: "state",  },
    { header: "Pan No.", accessorKey: "pan", width: 150 },
    { header: "GST", accessorKey: "gst", width: 150 },
  ];
  const handleCSVDownload = () => {
    downloadCSV(rows, columns, "Shipping Address Report");
  };
  useEffect(() => {
    getRows();
  }, []);

  const columns = useMemo(() => shippingAddressColumns, []);

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
        height: loading ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
      },
    },
    renderTopToolbar: () =>
      loading ? (
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
      <Row gutter={6} style={{ height: "95%" }}>
        <Col span={6}>
          <AddShippingAddress
            getRows={getRows}
            handleCSVDownload={handleCSVDownload}
          />
        </Col>
        <Col span={18} style={{ height: "100%" }}>
        <MaterialReactTable table={table} />
        </Col>
      </Row>
    </div>
  );
}

export default ShippingAddress;
