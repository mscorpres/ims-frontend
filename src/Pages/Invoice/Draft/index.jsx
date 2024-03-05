import { useState, useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import { toast } from "react-toastify";
import { GridActionsCellItem } from "@mui/x-data-grid";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";

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
  const actionMenuItem = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // Edit icon
      <GridActionsCellItem
        showInMenu
        label="Edit"
        onClick={() =>
          navigate(`/invoice/edit/${row.invoice?.replaceAll("/", "_")}`)
        }
      />,
      // Delete icon
      <GridActionsCellItem
        showInMenu
        label="Delete"
        onClick={() => showDeleteConfirm(row.invoice)}
      />,
      // download Icon
      <GridActionsCellItem
        showInMenu
        label="Download"
        onClick={() => handleDownload(row.invoice)}
      />,
      // print Icon
      <GridActionsCellItem
        showInMenu
        label="Print"
        onClick={() => handlePrint(row.invoice)}
      />,

      // active icon
      <GridActionsCellItem
        showInMenu
        label="Confirm Invoice"
        onClick={() => showActivateConfirm(row.invoice)}
      />,
    ],
  };

  useEffect(() => {
    getRows();
  }, []);

  return (
    <div
      style={{
        height: "90%",
        padding: "0px 10px 0px 10px",
      }}
    >
      <MyDataTable
        loading={loading}
        data={rows}
        columns={[actionMenuItem, ...columns]}
      />
    </div>
  );
};

const columns = [
  {
    headerName: "Client",
    field: "client",
    flex: 1,
    minWidth: 250,
  },
  {
    headerName: "Invoice",
    field: "invoice",
    width: 200,
  },
  {
    headerName: "Invoice Date",
    field: "date",
    width: 150,
  },

  {
    headerName: "Amount",
    field: "amount",
    width: 200,
  },
];

export default DraftInvoice;
