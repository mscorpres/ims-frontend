import React, { useState, useEffect } from "react";
import { Drawer, Skeleton, Space } from "antd";
import { CloseCircleFilled, PrinterTwoTone } from "@ant-design/icons";
import axios from "axios";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import printFunction from "../../../Components/printFunction";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";

const CompletedModal = ({ editModal, setEditModal }) => {
  const [mainData, setMainData] = useState([]);
  const [printLoading, setPrintLoading] = useState(false);
  const [modalLoad, setModalLoad] = useState(false);
  //   console.log(editModal);

  const getFetchData = async () => {
    setModalLoad(true);
    const { data } = await imsAxios.post("/jobwork/view_completed_jw_details", {
      jwcode: editModal?.transaction_id,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setMainData(arr);
      setModalLoad(false);
    } else if (data.code == 500) {
      setEditModal(false);
      toast.error(data.message.msg);
      // setModalLoad(false);
    }
  };

  const printShow = async (d) => {
    setPrintLoading(true);
    //  console.log(d);
    const { data } = await imsAxios.post("/jobwork/print_jw_complete_challan", {
      refid: d?.refid,
      transaction: d?.transaction,
    });
    setPrintLoading(false);
    printFunction(data.data.buffer.data);
  };

  //   const printShow = async (transactionId) => {
  //    const formData = new FormData();
  //    formData.append("transaction", transactionId);
  //    const { data } = await imsAxios.post("/storeApproval/print_request", formData);
  //    console.log(data);
  //    printFunction(data.data.buffer.data);
  //  };

  const columns = [
    {
      field: "index",
      headerName: "Sr No.",
      width: 150,
    },
    {
      field: "challantxn",
      headerName: "Challan TXN IDM",
      width: 320,
    },
    {
      field: "challandate",
      headerName: "Challan Issue Date",
      width: 320,
    },
    {
      field: "challanqty",
      headerName: "Challan Total Qty",
      width: 320,
    },
    {
      type: "actions",
      headerName: "Action",
      width: 150,
      getActions: ({ row }) => [
        // <TableActions action="view" onClick={() => setViewModalOpen(row)} />,
        // <TableActions action="cancel" onClick={() => setCloseModalOpen(row)} />,
        // <TableActions action="print" onClick={() => console.log(row)} />,
        // <TableActions action="edit" />,

        <PrinterTwoTone
          onClick={() => printShow(row)}
          style={{ color: "#1890ff", fontSize: "15px" }}
        />,
      ],
    },
  ];

  useEffect(() => {
    if (editModal) {
      getFetchData();
    }
  }, [editModal]);
  return (
    <Space>
      <Drawer
        width="100vw"
        title={
          <span style={{ fontSize: "15px", color: "#1890ff" }}>
            {editModal?.transaction_id}
          </span>
        }
        placement="right"
        closable={false}
        onClose={() => setEditModal(false)}
        open={editModal}
        getContainer={false}
        style={
          {
            //  position: "absolute",
          }
        }
        extra={
          <Space>
            <CloseCircleFilled onClick={() => setEditModal(false)} />
          </Space>
        }
      >
        <Skeleton active loading={modalLoad}>
          <div style={{ height: "95%", marginTop: "5px" }}>
            <div style={{ height: "100%" }}>
              <MyDataTable
                data={mainData}
                columns={columns}
                loading={printLoading}
              />
            </div>
          </div>
        </Skeleton>
      </Drawer>
    </Space>
  );
};

export default CompletedModal;
