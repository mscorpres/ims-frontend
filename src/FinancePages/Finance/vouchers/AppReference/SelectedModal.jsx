import React, { useState, useEffect } from "react";
import { Button, Modal, Input } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";

export default function SelectedModal({
  setOpen,
  open,
  selectedVBTRowsForModal,
  setSelectedVBTRowsForModal,
  vbtRows,
  setVBTRows,
  setRowSelected,
  rowSelected,
  osAmountModal,
  setOsAmountModal,
  setFinalListOfRow,
  finalListOfRow,
}) {
  //   const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    // console.log(e);
    setOpen(false);
    setFinalListOfRow(true);
    // setVBTRows(selectedVBTRowsForModal);
  };

  const handleCancel = () => {
    // console.log(e);
    setOpen(false);
  };
  console.log("selectedVBTRows in modal", selectedVBTRowsForModal);
  // handlet vbt amount change
  const inputHandler = (value, id) => {
    const arr = vbtRows.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          selectedAmount: value,
        };
      } else {
        return item;
      }
    });

    setVBTRows(arr);
  };
  const leftColumns = [
    // {
    //   headerName: "#",
    //   field: "index",
    //   // renderCell: ({ row }) => row.index,
    //   width: 30,
    // },
    // {
    //   headerName: "",
    //   field: "check",
    //   renderCell: ({ row }) => (
    //     <Checkbox
    //       onChange={() => handleVBTSelection(row.id)}
    //       checked={row.selected}
    //     />
    //   ),
    //   width: 30,
    // },
    // {
    //   headerName: "Age",
    //   field: "age",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.age} />,
    //   width: 100,
    // },
    // {
    //   headerName: "Type",
    //   field: "type",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.type} />,
    //   width: 100,
    // },
    {
      headerName: "Invoice Date",
      field: "invoiceDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceDate} />,
      width: 100,
    },
    // {
    //   headerName: "Invoice",
    //   field: "bank",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_number} />,
    //   width: 180,
    // },
    {
      headerName: "O/S Amount",
      field: "invoiceNumber",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler(e.target.value, row.id)}
          value={row.selectedAmount}
        />
      ),
      width: 150,
    },
    {
      headerName: "O/S Amount / Bill Amount",
      field: "amount",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.osAmm + " / " + row.amount} />
      ),
      width: 150,
    },
    {
      headerName: "Settled Amount",
      field: "clearAmm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clearAmm} />,
      width: 120,
    },
    {
      headerName: "Total Bill Amount",
      field: "totalBillAmount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.totalBillAmount} />,
      width: 120,
    },
    {
      headerName: "VBT No.",
      field: "vbtKey",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vbtKey} />,
      width: 150,
    },
    {
      headerName: "Project",
      field: "project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project} />,
      width: 100,
    },
    {
      headerName: "Cost Center",
      field: "costCenter",
      renderCell: ({ row }) => <ToolTipEllipses text={row.costCenter} />,
      width: 100,
    },
    {
      headerName: "Due Date",
      field: "dueDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row.costCenter} />,
      width: 100,
    },
    {
      headerName: "PO ID",
      field: "poID",
      renderCell: ({ row }) => <ToolTipEllipses text={row.poID} />,
      width: 100,
    },
  ];
  useEffect(() => {
    if (open == false) {
      setRowSelected(false);
      console.log("inside modal useeffect", rowSelected);
      setOsAmountModal(false);
    }
  }, [open]);

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal with customized button props
      </Button>
      <Modal
        title="Select the os Amount"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        // okButtonProps={{ disabled: true }}
        // cancelButtonProps={{ disabled: true }}
        width={800}
        // height={400}
        bodyStyle={{
          // width: "80vw",
          height: "50vh",
          // overflowX: "scroll",
        }}
        // style={{ height: "70%", width: "70%", right: "10rem" }}
      >
        <MyDataTable
          // style={{ height: "70%" }}
          data={selectedVBTRowsForModal}
          columns={leftColumns}
        />
      </Modal>
    </>
  );
}
