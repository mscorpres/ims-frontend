import React from "react";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";

const ViewTasks = ({
  tasks,
  setSetshowDetailsModal,
  setShowTransferModal,
  loading,
  showLogs,
  setShowLogs,
}) => {
  const actionColumns = [
    {
      headerName: "",
      type: "actions",
      width: 10,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="View"
          onClick={() => setSetshowDetailsModal({ taskId: row.taskId })}
        />,
        // <GridActionsCellItem
        //   showInMenu
        //   // disabled={disabled}
        //   label="Transfer"
        //   onClick={() => setShowTransferModal({ taskId: row.taskId })}
        // />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Logs"
          onClick={() => setShowLogs(row.taskId)}
        />,
      ], //setSetshowDetailsModal
    },
  ];
  return (
    <MyDataTable
      loading={loading}
      data={tasks}
      columns={[...actionColumns, ...columns]}
    />
  );
};

export default ViewTasks;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Task ID",
    field: "taskId",
    renderCell: ({ row }) => <ToolTipEllipses text={row.taskId} copy={true} />,
    width: 120,
  },
  {
    headerName: "Title",
    field: "title",
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "Assign Date",
    field: "assignDate",
    width: 150,
  },

  {
    headerName: "Assigned To",
    field: "assignedToName",
    renderCell: ({ row }) => <ToolTipEllipses text={row.assignedToName} />,
    width: 180,
  },
  {
    headerName: "TAT",
    field: "tat",
    width: 150,
  },
  {
    headerName: "Status",
    field: "status",
    width: 150,
  },
];
