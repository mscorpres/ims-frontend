import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NewModal from "./Modal/NewModal";
import printFunction from "../../../Components/printFunction";
import MyDataTable from "../../../Components/MyDataTable";
import { Button, Col, Row, Skeleton } from "antd";
import { EyeFilled, PrinterFilled } from "@ant-design/icons";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";

const ApprovedTransaction = () => {
  const [open, setOpen] = useState(false);
  const [allPending, setAllPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  // const [componentSubmit,setComponentSubmit] = useState()

  const [componentData, setComponentData] = useState({
    selType: "",
    // headers: { location: "", key: "" },
    // materials: [],
  });
  // console.log(componentData);

  const opt = [{ label: "Pending", value: "P" }];

  const printFun = async (transactionId) => {
    setLoading(true);
    //  console.log(d);
    const { data } = await imsAxios.post("/storeApproval/print_request", {
      transaction: transactionId,
    });
    setLoading(false);
    printFunction(data.data.buffer.data);
  };

  const columns = [
    { field: "i", headerName: "Serial No.", width: 200 },
    {
      field: "user_name",
      headerName: "Required From Name",
      width: 250,
    },
    {
      field: "transaction_id",
      headerName: "Required Ref ID",
      width: 280,
    },
    {
      field: "insert_full_date",
      headerName: "Req.Date/Time",
      width: 250,
    },
    {
      type: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <div
          style={{
            width: "30%",
            display: "flex",
            justifyContent: "space-around",
            fontSize: "14px",
          }}
        >
          <EyeFilled onClick={() => setOpen(row)} style={{ color: "grey" }} />
          <PrinterFilled
            onClick={() => printFun(row.transaction_id)}
            style={{ color: "grey" }}
          />
        </div>
      ),
    },
  ];

  const getPendingData = async () => {
    setAllPending([]);
    setLoading(true);
    const { data } = await imsAxios.post(
      "/storeApproval/fetchTransactionForApproval",
      {
        status: componentData.selType,
        branch: "BRMSC012",
      }
    );
    // console.log(data)
    if (data.code == 200) {
      const arr = data.response.data.map((row, i) => {
        return {
          ...row,
          id: v4(),
          i: i + 1,
        };
      });
      setAllPending(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
    // }
  };

  // new
  return (
    <>
      <div style={{ height: "90%" }}>
        <Row gutter={16} style={{ margin: "5px" }}>
          <Col span={3} className="gutter-row">
            <Button onClick={getPendingData} type="primary">
              Fetch Pending Data
            </Button>
          </Col>
        </Row>
        <div style={{ height: "95%", margin: "10px" }}>
          {/* <Skeleton loading={loading}> */}
          <MyDataTable data={allPending} loading={loading} columns={columns} />
          {/* </Skeleton> */}
        </div>
        <NewModal
          setOpen={setOpen}
          open={open}
          getPendingData={getPendingData}
        />
      </div>

      {/* Modal Open */}
    </>
  );
};

export default ApprovedTransaction;
