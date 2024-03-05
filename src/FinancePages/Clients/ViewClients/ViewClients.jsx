import { Col, Layout, Row } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import EditClient from "../EditClient/EditClient";
import ClientBranchAdd from "../modal/ClientBranchAdd";
import AllBranch from "../modal/AllBranch";
import { v4 } from "uuid";

function ViewClients() {
  const [rows, setRows] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [branchAddOpen, setBranchAddOpen] = useState(null);
  const [branchModal, setBranchModal] = useState(null);
  const [updatingClient, setUpdatingClient] = useState(null);
  const [branchCode, setBranchCode] = useState("");
  const [showAllBranch, setShowAllBranch] = useState(false);
  const [addClientApi, setAddClientApi] = useState(false);

  const getRows = async () => {
    setFetchLoading(true);
    const { data } = await imsAxios.get("/client/getClient");
    setFetchLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        ...row,
        id: index,
        index: index + 1,
      }));
      setRows(arr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
      setShowAllBranch(false);
    }
  };
  // const getDetailByCodeWise = async () => {
  //   const response = await imsAxios.get(
  //     `client/branches?clientCode=${branchCode}`
  //   );
  //   // console.log(data);
  //   const { data } = response;
  //   if (data.code == 200) {
  //     let arr = data.data.map((row) => {
  //       return {
  //         ...row,
  //         id: v4(),
  //       };
  //     });
  //     setBranchModal(arr);
  //   } else {
  //     toast.error(data.message.msg);
  //   }
  // };
  const handleDownloadExcel = () => {
    downloadCSV(rows, columns, "Clients Report");
  };
  const columns = [
    {
      headerName: "Actions",
      type: "actions",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          // icon={<SecurityIcon />}
          label="Edit Client"
          onClick={() => manageClientAPI(row)}
          showInMenu
        />,
        <GridActionsCellItem
          // icon={<FileCopyIcon />}
          label="Add Branch"
          onClick={() => setBranchAddOpen(row)}
          showInMenu
        />,
        <GridActionsCellItem
          // icon={<FileCopyIcon />}
          label="Edit / View Branch Details"
          onClick={() => manageBranchAPI(row)}
          showInMenu
        />,
      ],
    },
    // {
    //   headerName: "Sr. No.",
    //   field: "index",
    //   width: 80,
    //   // flex: 1,
    // },
    {
      headerName: "Client ID",
      field: "code",
      // width: 100,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses copy={true} text={row.code} />,
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    },

    {
      headerName: "Email",
      field: "email",
      flex: 1,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.email == "" ? "--" : row.email} />
      ),
    },
    {
      headerName: "Mobile",
      field: "mobile",
      flex: 1,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.mobile == "" ? "--" : row.mobile} />
      ),
    },
    {
      headerName: "PAN",
      field: "panNo",
      flex: 1,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.panNo == "" ? "--" : row.panNo} />
      ),
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      renderCell: ({ row }) => (
        <ToolTipEllipses
          text={
            row.status == "active" ? (
              <span style={{ color: "green" }}>Active</span>
            ) : (
              <span style={{ color: "red" }}>In-Active</span>
            )
          }
        />
      ),
    },
  ];
  const manageBranchAPI = (row) => {
    setShowAllBranch(true);
    setBranchModal(row);
  };
  const manageClientAPI = (row) => {
    setAddClientApi(true);
    setUpdatingClient(row);
  };

  // useEffect(() => {
  //   getRows();
  // }, []);
  useEffect(() => {
    // if (updatingClient) {
    getRows();
    // }
  }, [updatingClient]);
  // useEffect(() => {
  //   if (branchModal) {
  //     if (branchModal?.code) {
  //       console.log("branchModal", branchModal);
  //       setBranchCode(branchModal.code);
  //       getDetailByCodeWise();
  //     }
  //   }
  // }, [branchModal]);

  return (
    <>
      <div style={{ height: "90%", padding: 5 }}>
        <Row justify="end"></Row>
        <div style={{ paddingTop: 5, height: "95%" }}>
          <MyDataTable loading={fetchLoading} rows={rows} columns={columns} />
        </div>
      </div>
      <ClientBranchAdd
        branchAddOpen={branchAddOpen}
        setBranchAddOpen={setBranchAddOpen}
      />
      <EditClient
        updatingClient={updatingClient}
        setUpdatingClient={setUpdatingClient}
        getRows={getRows}
        setAddClientApi={setAddClientApi}
        addClientApi={addClientApi}
      />
      <AllBranch
        // row={row}
        setShowAllBranch={setShowAllBranch}
        showAllBranch={showAllBranch}
        branchModal={branchModal}
        setBranchModal={setBranchModal}
      />
    </>
  );
}

export default ViewClients;
