import { useState, useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import {
  ConfirmationNumber,
  Delete,
  Download,
  Edit,
  Print,
} from "@mui/icons-material";

const DraftInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const navigate = useNavigate();

  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/invoice/draftInvoiceList");
      const { data } = response;
      if (data) {
        const arr = data.map((row) => ({ ...row, id: row.ID }));
        setRows(arr);
      }
    } catch (error) {
      console.log("Some error occured while fetching draft invoices", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      setLoading("download");
      const { data } = await imsAxios.get(
        `/invoice/downloadInvoice?invoiceID=${invoiceId}`
      );
      downloadFunction(data.buffer.data, invoiceId);
    } catch (error) {
      console.log("Some error while download invoice", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (invoiceId) => {
    try {
      setLoading("download");
      const { data } = await imsAxios.get(
        `/invoice/downloadInvoice?invoiceID=${invoiceId}`
      );
      printFunction(data.buffer.data);
    } catch (error) {
      console.log("Some error while download invoice", error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = async (invoiceId) => {
    Modal.confirm({
      title: "Are you sure delete this invoice?",
      content: "This action cannot be undone",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDelete(invoiceId),
      onCancel() {},
    });
  };
  const handleDelete = async (invoiceId) => {
    try {
      setLoading(true);
      const response = await imsAxios.delete(
        `/invoice/deleteInvoice?invoiceID=${invoiceId}`
      );
      const { data } = response;
      if (data) {
        toast.success(data);
        getRows();
      }
    } catch (error) {
      console.log("Some error occured while deleting the invoice", error);
    } finally {
      setLoading(false);
    }
  };
  const showActivateConfirm = async (invoiceId) => {
    Modal.confirm({
      title: "Are you sure you want to finalize this invoice?",
      content:
        "This action cannot be undone and you will not be able to edit or delete this invoice after you finalize it",
      okText: "Yes",
      cancelText: "No",
      onOk: () => handleActivate(invoiceId),
      onCancel() {},
    });
  };

  const handleActivate = async (invoiceId) => {
    try {
      setLoading(true);
      const { data } = await imsAxios.put("/invoice/updateInvoice", {
        invoiceID: invoiceId,
      });
      toast.success(data);
      getRows();
    } catch (error) {
      console.log("Some error occcured while activating this invoicce", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRows();
  }, []);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        icon={<Edit fontSize="small" />}
        key="edit"
        label="Edit"
        onClick={() => {
          closeMenu?.();
          navigate(
            `/invoice/edit/${row?.original?.invoice?.replaceAll("/", "_")}`
          );
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Delete fontSize="small" />}
        key="view"
        label="View"
        onClick={() => {
          closeMenu?.();
          showDeleteConfirm(row?.original?.invoice);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Download fontSize="small" />}
        key="download"
        label="Download"
        onClick={() => {
          closeMenu?.();
          handleDownload(row?.original?.invoice);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Print fontSize="small" />}
        key="print"
        label="Print"
        onClick={() => {
          closeMenu?.();
          handlePrint(row?.original?.invoice);
        }}
        table={table}
      />,

      <MRT_ActionMenuItem
        icon={<ConfirmationNumber fontSize="small" />}
        key="upload"
        label="Confirm Invoice"
        onClick={() => {
          closeMenu?.();
          showActivateConfirm(row?.original?.invoice);
        }}
        table={table}
      />,
    ],
  });

  return (
    <div
      style={{
        height: "90%",
        margin: 12,
      }}
    >
      {/* <MyDataTable
        loading={loading}
        data={rows}
        columns={[actionMenuItem, ...columns]}
      /> */}
      <MaterialReactTable table={table} />
    </div>
  );
};

const columns = [
  {
    header: "Client",
    accessorKey: "client",
    flex: 1,
    minWidth: 250,
  },
  {
    header: "Invoice",
    accessorKey: "invoice",
    width: 200,
  },
  {
    header: "Invoice Date",
    accessorKey: "date",
    width: 150,
  },

  {
    header: "Amount",
    accessorKey: "amount",
    width: 200,
  },
];

export default DraftInvoice;
