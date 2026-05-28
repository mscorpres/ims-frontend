import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RemoveModal from "./RemoveModal";
import {
  Button,
  Col,
  Drawer,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Popover,
  Skeleton,
} from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CloseCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import MyDataTable from "../../../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import FormTable from "../../../../Components/FormTable";

export default function NewModal({
  modalOpen,
  setModalOpen,
  open,
  setOpen,
  getPendingData,
}) {
  const [delModal, setDelModal] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [mat, setMat] = useState([]);
  const [head, setHead] = useState([]);
  const [l, setl] = useState("");
  const [qty1, setQty1] = useState("");
  const [location, setLocation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pickLoc, setPickLoc] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const compInputHandler = async (name, value, id) => {
    let arr = mat;
    // console.log(name, value, id);
    if (name == "qty") {
      arr = arr.map((a) => {
        if (a.id == id) {
          {
            return { ...a, qty1: value };
          }
        } else {
          return a;
        }
      });
    } else if (name == "comment") {
      arr = arr.map((a) => {
        if (a.id == id.id) {
          {
            return { ...a, remark: value };
          }
        } else {
          return a;
        }
      });
    } else if (name == "loc") {
      setLocLoading(true);
      const { data } = await imsAxios.post("/godown/godownStocks", {
        component: id?.compKey,
        location: value,
      });
      setLocLoading(false);
      // console.log(data?.data?.available_qty);

      arr = arr.map((a) => {
        if (a.id == id.id) {
          // console.log(...a)
          return {
            ...a,
            loc: value,
            setl: data?.data?.available_qty,
          };
        } else {
          return a;
        }
      });
    }

    setMat(arr);
  };

  // console.log(locLoading);
  const getDataFetch = async () => {
    setLoading(true);
    const { data } = await imsAxios.post(
      "/storeApproval/fetchTransactionItems",
      {
        transaction: open?.transaction_id,
      }
    );
    if (data.code == 200) {
      let arr = data.data.material.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      if (arr.length > 0) {
        setMat(arr);
        setHead(data?.data?.header);
        setLoading(false);
      } else {
        setModalOpen(false);
        getPendingData();
      }
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setOpen(false);
      getPendingData();
      // setLoading(false);
    }
  };

  const getLocation = async () => {
    const { data } = await imsAxios.get(
      "/storeApproval/fetchLocationAllotedTransApprv"
    );
    const arr = [];
    data.data.map((a) => arr.push({ label: a.text, value: a.id }));
    setLocation(arr);
    // console.log(arr);
  };

  const saveFunction = async (materialData, headerData) => {
    setUpdateLoading(materialData?.id);
    setSpinLoading(true);
    const { data } = await imsAxios.post(
      "/storeApproval/AllowComponentsApproval",
      {
        location: headerData?.locationKey,
        authKey: materialData?.authIdentity,
        subject: headerData?.bomKey,

        pickLocation: materialData?.loc,
        component: materialData?.compKey,
        issueQty: materialData?.qty1,
        remark: materialData?.remark,
        requestedQty: materialData?.requiredQty,
      }
    );
    setUpdateLoading(false);
    if (data.code == 200) {
      if (mat.length > 1) {
        // getDataFetch();
        setMat((allDataComes) => {
          return allDataComes.filter((row) => row.id != materialData?.id);
        });
        setSpinLoading(false);
        toast.success(data.message.replaceAll("<br/>", "\n"));
        // setMat([]);
      } else {
        setOpen(false);
        getPendingData();
        toast.success(data.message.replaceAll("<br/>", "\n"));
        setSpinLoading(false);
      }
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setSpinLoading(false);
    }
    // if(data.code == 200){
    //   setSpinLoading(false)
    //   toast.success(data.message)
    // }
    // else if(data.code == 500){
    //   setSpinLoading(false)
    //   toast.error(data.message.msg)
    // }
  };

  const content = (row) => (
    <div>
      <span
        style={{ fontWeight: "bold" }}
        dangerouslySetInnerHTML={{ __html: row }}
      />
    </div>
  );

  const columns = [
    {
      field: "index",
      headerName: "S No.",
      width: 60,
      renderCell: ({ row }) => <span>{row?.index}</span>,
    },
    {
      field: "component",
      headerName: "Component/ Part Code",
      width: 300,
      renderCell: ({ row }) => (
        // console.log(row),
        <Popover content={content(row?.remark)}>
          <span
            style={{
              fontWeight: "bolder",
              cursor: "pointer",
            }}
          >{`${row?.component} / ${row?.partno}`}</span>
        </Popover>
      ),
    },
    {
      field: "requiredQty",
      headerName: "Requested Qty",
      width: 100,
      renderCell: ({ row }) => <span>{row?.requiredQty}</span>,
    },
    {
      field: "location",
      headerName: "Pick Location",
      width: 120,
      renderCell: ({ row }) => (
        <>
          <Select
            style={{ width: "100%" }}
            options={location}
            value={row?.loc}
            onChange={(e) => compInputHandler("loc", e, row)}
          />
        </>
      ),
    },
    {
      headerName: "Available Qty",
      width: 100,
      renderCell: ({ row }) => (
        <span>{row?.setl == null ? "0" : `${row.setl} ${row?.unit}`}</span>
      ),
    },
    {
      field: "qty",
      headerName: "Issued Qty",
      width: 120,
      renderCell: ({ row }) => (
        <>
          <Input
            // size="small"
            value={row?.qty1}
            onChange={(e) => compInputHandler("qty", e.target.value, row.id)}
          />
        </>
      ),
    },

    {
      field: "comment",
      headerName: "Remarks",
      width: 180,
      renderCell: ({ row }) => (
        // console.log(row),
        <>
          <Input
            // size="small"
            value={row?.remark}
            onChange={(e) => compInputHandler("comment", e.target.value, row)}
          />
        </>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 100,
      renderCell: ({ row }) => (
        <div style={{ display: "flex" }}>
          <CloseCircleFilled
            onClick={() => setDelModal(row)}
            style={{ fontSize: "20px" }}
          />
          <CheckCircleFilled
            onClick={() => saveFunction(row, head[0])}
            style={{ fontSize: "20px", marginLeft: "10px" }}
          />
        </div>
      ),
    },
  ];

  const reset = () => {
    setOpen(false);
    setMat([]);
    // setModalOpen(false);
    // setDelModal(false);
  };

  const close = () => {
    setOpen(false);
    // setMat([]);
  };
  useEffect(() => {
    getLocation();
    if (open?.transaction_id) {
      getDataFetch();
    }
  }, [open?.transaction_id]);

  return (
    <>
      <Space>
        <Drawer
          width="100vw"
          title={`Material Requisition Request : ${open?.transaction_id}`}
          placement="right"
          closable={false}
          onClose={close}
          open={open}
          getContainer={false}
          style={{
            position: "absolute",
          }}
          extra={
            <Space>
              <Button loading={loading}>
                {mat.length > 0 ? head[0].location : " "}
              </Button>
              <CloseCircleFilled onClick={reset} />
            </Space>
          }
        >
          {loading ? (
            <div
              style={{
                // height:"80vh",
                justifyItems: "center",
                padding: "350px 0",
                textAlign: "center",
              }}
            >
              <Spin />
            </div>
          ) : (
            <>
              {locLoading || spinLoading ? (
                <div
                  style={{
                    // height:"80vh",
                    justifyItems: "center",
                    padding: "350px 0",
                    textAlign: "center",
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <FormTable data={mat} columns={columns} />
              )}
            </>
          )}
        </Drawer>
      </Space>

      <RemoveModal
        delModal={delModal}
        setDelModal={setDelModal}
        modalOpen={modalOpen?.transaction_id}
        getDataFetch={getDataFetch}
        mat={mat}
        setOpen={setOpen}
      />
    </>
  );
}
