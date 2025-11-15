
import { useEffect, useState } from "react";

import MyDataTable from "../../../Components/MyDataTable";
import printFunction from "../../../Components/printFunction";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import MyButton from "../../../Components/MyButton";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Download } from "@mui/icons-material";
import { Box, IconButton, LinearProgress } from "@mui/material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";

function FinalInvoice() {
  const [finalData, setFinalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      accessorKey: "client",
      header: "Client Name",
      flex: 1,
      render: ({ row }) => (row.client == null ? "---" : row.client),
    },
    {
      accessorKey: "date",
      header: "Invoice Date",
      flex: 1,
    },
    {
      accessorKey: "invoice",
      header: "Invoice No",
      flex: 1,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      flex: 1,
      render: ({ row }) => <p>{Number(row.amount).toFixed(2)}</p>,
    },
    // {
    //   headerName: "Action",
    //   flex: 1,
    //   renderCell: ({ row }) => (
    //     <div>
    //       <MyButton
    //         variant="download"
    //         // icon={<DownloadOutlined />}
    //         // loading={loading}
    //         // onClick={downlaodData(row.invoice)}
    //         onClick={() => downloadFunction(row.invoice)}
    //         type="secondary"
    //       >
    //         Download
    //       </MyButton>
    //     </div>
    //   ),
    // },
  ];

  const getFinalInvoice = async () => {
    try {
      setFinalData([]);
      setLoading(true);
      const response = await imsAxios.get("/invoice/activeInvoiceList");
      const { data } = response;
      if (data) {
        let arr = data.map((row) => ({
          ...row,
          id: v4(),
        }));
        setFinalData(arr);
      }
    } catch (error) {
      console.log("Error while fetching final invoice", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFunction = async (id) => {
    const { data } = await imsAxios.get(
      `/invoice/downloadInvoice?invoiceID=${id}`
    );
    printFunction(data.buffer.data);
  };

  useEffect(() => {
    getFinalInvoice();
  }, []);

   const table = useMaterialReactTable({
    columns: columns,
    data: finalData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    
    renderRowActions: ({ row }) => (
    
        <IconButton
          color="inherit"
          size="small"
          onClick={() => {
           downloadFunction(row?.original?.invoice)
          }}
        >
          <Download fontSize="small" />
        </IconButton>
 
    ),
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 200px)" : "calc(100vh - 250px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

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
    <div className="hide-select" style={{ height: "87%", margin: "12px" }}>
      {/* <MyDataTable data={finalData} columns={columns} loading={loading} /> */}
         <MaterialReactTable table={table} />
    </div>
  );
}

export default FinalInvoice;
