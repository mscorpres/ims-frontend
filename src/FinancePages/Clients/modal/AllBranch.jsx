import { Drawer, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { EditOutlined } from "@ant-design/icons";
import EditBranchModel from "./EditBranchModel";
import { toast } from "react-toastify";

const { TextArea } = Input;

function AllBranch({
  branchModal,
  setBranchModal,
  showAllBranch,
  setShowAllBranch,
}) {
  const [allBranch, setAllBranch] = useState([]);

  const [branchId, setBranchId] = useState(null);

  // const getDetailByCodeWise = async () => {
  //   const { data } = await imsAxios.post(
  //     "/client/branches",
  //     {
  //       clientCode: branchModal?.code,
  //     }
  //   );
  //   // let arr = data.data.map((row) => {
  //   //   return {
  //   //     ...row,
  //   //     id: v4(),
  //   //   };
  //   // });
  //   // setAllBranch(arr);
  // };

  const getDetailByCodeWise = async () => {
    setAllBranch([]);
    const response = await imsAxios.get(
      `client/branches?clientCode=${branchModal?.code}`
    );
    // console.log(data);
    const { data } = response;
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      toast.success("Client Branched Fetched Successfully");
      setAllBranch(arr);
    } else {
      toast.error(data.message.msg);
    }
    setShowAllBranch(false);
  };

  const coloums = [
    {
      field: "addressID",
      headerName: "Address Id",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
      renderCell: ({ row }) => <span>{row?.city.name}</span>,
    },
    {
      field: "address",
      headerName: "Address",
      renderCell: ({ row }) => <TextArea disabled value={row?.address} />,
      flex: 1,
    },
    {
      field: "gst",
      headerName: "GST",
      flex: 1,
    },
    {
      field: "phoneNo",
      headerName: "Contact",
      flex: 1,
    },
    {
      field: "pinCode",
      headerName: "Pin Code",
      flex: 1,
    },
    {
      headerName: "Action",
      flex: 1,
      renderCell: ({ row }) => (
        <>
          <EditOutlined onClick={() => setBranchId(row)} />
        </>
      ),
    },
  ];

  useEffect(() => {
    if (showAllBranch == true) {
      getDetailByCodeWise();
    }
  }, [showAllBranch]);
  return (
    <Drawer
      title={`All Branch: ${branchModal?.code}`}
      // centered
      // confirmLoading={submitLoading}
      open={branchModal}
      onClose={() => setBranchModal(false)}
      width="100vw"
    >
      <>
        <div style={{ height: "100%" }}>
          <MyDataTable data={allBranch} columns={coloums} />
        </div>
        <EditBranchModel
          setBranchModal={setBranchModal}
          branchModal={branchModal}
          setBranchId={setBranchId}
          branchId={branchId}
          allBranch={allBranch}
        />
      </>
    </Drawer>
  );
}

export default AllBranch;
