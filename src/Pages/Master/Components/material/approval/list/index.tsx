import IconButton from "@/Components/IconButton";
import MyDataTable from "@/Components/MyDataTable.jsx";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { GridActionsCellItem } from "@mui/x-data-grid";

interface Props {
  rows: any[];
  loading: boolean;
  setShowApproveModal: React.Dispatch<
    React.SetStateAction<false | "approve" | "reject">
  >;
  setSelectedComponent: React.Dispatch<React.SetStateAction<any>>;
}

const ApprovalList = ({
  rows,
  loading,
  setSelectedComponent,
  setShowApproveModal,
}: Props) => {
  const handleSelect = (row: any, type: "approve" | "reject") => {
    setSelectedComponent(row);
    setShowApproveModal(type);
  };
  const actionColumn = {
    field: "actions",
    headerName: "",
    width: 80,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        icon={
          <IconButton
            icon={
              <CheckCircleFilled style={{ color: "#04B0A8", fontSize: 24 }} />
            }
            tooltip="Approve"
          />
        }
        label="View Images"
        onClick={() => handleSelect(row, "approve")}
      />,
      <GridActionsCellItem
        icon={
          <IconButton
            onClick={() => console.log("working")}
            icon={
              <CloseCircleFilled style={{ color: "brown", fontSize: 24 }} />
            }
            tooltip="Reject"
          />
        }
        label="View Images"
        onClick={() => handleSelect(row, "reject")}
      />,
    ],
  };
  return (
    <MyDataTable
      loading={loading}
      data={rows}
      columns={[...columns, actionColumn]}
    />
  );
};

export default ApprovalList;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Name",
    field: "name",
    minWidth: 200,
    flex: 1,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 150,
  },
  {
    headerName: "Type",
    field: "type",
    width: 120,
  },
  {
    headerName: "Unique Code",
    field: "uniqueCode",
    width: 200,
  },
  {
    headerName: "MFG Code",
    field: "mfgCode",
    width: 200,
  },
  {
    headerName: "Requested By",
    field: "requestedBy",
    width: 200,
  },
  {
    headerName: "Created At",
    field: "createdAt",
    width: 200,
  },
];
