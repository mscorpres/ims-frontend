import {
  Button,
  Card,
  Col,
  Drawer,
  Input,
  Modal,
  Popconfirm,
  Row,
  Typography,
} from "antd";
import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import FormTable from "../../../Components/FormTable";
import Loading from "../../../Components/Loading";
import SummaryCard from "../../../Components/SummaryCard";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";

function MINDrawer({ transactionInwarding, setTransactionInwarding }) {
  const [fetchLoading, setFetchLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const summary = [
    { title: "Job Work Id", description: transactionInwarding?.jw, copy: true },
    {
      title: "Challan Id",
      description: transactionInwarding?.challan,
      copy: true,
    },
    {
      title: "Transaction Id",
      description: transactionInwarding?.sfgtxn,
      copy: true,
    },
    {
      title: "Vendor",
      description: transactionInwarding?.vendor?.label,
    },
  ];
  const getDetail = async () => {
    setFetchLoading(true);
    const { data } = await imsAxios.post(
      "/jwvendor/fetchVendorSFGdetails",
      transactionInwarding
    );
    setFetchLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        id: v4(),
        index: index + 1,
        qty: 0,
        minRemark: "",
        ...row,
      }));
      setRows(arr);
    }
  };
  const columns = [
    {
      headerName: "Sr. No",
      width: 80,
      renderCell: ({ row }) => <Typography.Text>{row.index}</Typography.Text>,
    },
    {
      headerName: "Component",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
    },
    {
      headerName: "SFG In Qty",
      renderCell: ({ row }) => <Typography.Text>--</Typography.Text>,
    },
    {
      headerName: "In qty",
      width: 120,
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("qty", e.target.value, row.id)}
          value={row.qty}
          suffix={row.unit}
        />
      ),
    },
    {
      headerName: "Remark",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
    },
    {
      headerName: "MIN Remark",
      flex: 1,
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("minRemark", e.target.value, row.id)}
          value={row.minRemark}
        />
      ),
    },
  ];
  const inputHandler = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          [name]: value,
        };
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  const validateFunction = () => {
    let validation = "";
    rows.map((row) => {
      if (row.qty === "" || row.qty === 0 || row.qty === "0") {
        validation = "qty";
      }
    });
    if (validation === "qty") {
      return toast.error("All Component should have quantity more than 0");
    }
    let finalObj = {
      qty: rows.map((row) => row.qty),
      component: rows.map((row) => row.key),
      component: rows.map((row) => row.key),
      location: rows.map(() => "--"),
      remark: rows.map((row) => row.minRemark),
      vendor: transactionInwarding.vendor.value,
      challan: transactionInwarding.challan,
      jw: transactionInwarding.jw,
    };
    setShowConfirmSubmit(finalObj);
  };
  const submitHandler = async () => {
    setSubmitLoading(false);
    const { data } = await imsAxios.post(
      "/jwvendor/sfgInward",
      showConfirmSubmit
    );
    if (data.code === 200) {
      setShowConfirmSubmit(false);
      toast.success(data.message);
      setSubmitLoading(false);
      setTransactionInwarding(false);
    } else {
      toast.error(data.message.msg);
    }
  };
  useEffect(() => {
    if (transactionInwarding) {
      getDetail();
    }
  }, [transactionInwarding]);
  return (
    <Drawer
      open={transactionInwarding}
      width="75vw"
      title="Inwarding SFG"
      onClose={() => setTransactionInwarding(null)}
    >
      {/* <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
       Are you sure
      </Modal> */}
      <Row gutter={4} style={{ height: "100%" }}>
        <Col span={6}>
          <Row gutter={[0, 4]}>
            <Col span={24}>
              <SummaryCard loading={fetchLoading} summary={summary} />
            </Col>
            <Col span={24}>
              <Row justify="end">
                <Popconfirm
                  title="Submit MIN"
                  description="Are you sure to submit this MIN?"
                  onConfirm={submitHandler}
                  onCancel={() => setShowConfirmSubmit(false)}
                  okText="Yes"
                  okButtonProps={{
                    loading: submitLoading,
                  }}
                  open={showConfirmSubmit}
                  cancelText="No"
                >
                  <Button type="primary" onClick={validateFunction}>
                    Submit
                  </Button>
                </Popconfirm>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={18}>
          <Card
            size="small"
            bodyStyle={{ padding: 0 }}
            style={{ height: "100%", padding: 0 }}
          >
            {fetchLoading && <Loading />}
            <FormTable data={rows} columns={columns} />
          </Card>
        </Col>
      </Row>
    </Drawer>
  );
}

export default MINDrawer;
