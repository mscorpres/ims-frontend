import React, { useState, useEffect } from "react";
import { EyeFilled, CloseCircleFilled, DeleteTwoTone } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Button, Col, Drawer, Row, Skeleton, Space, Input } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import TableActions from "../../../Components/TableActions.jsx/TableActions";

function UpdateModal({ updateModalInfo, setUpdateModalInfo, getRows }) {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [view, setView] = useState([]);
  const [mainData, setMainData] = useState([]);

  let row = updateModalInfo.row;

  const getAllData = async () => {
    // console.log("this is the status", row.recipeStatus);
    setLoading(true);
    const { data } = await imsAxios.post("/jobwork/fetchJwAnlyUpdate", {
      jw_transaction: row?.jwId,
      po_transaction: row?.jwId,
      skucode: row?.skuKey,
    });
    setView(data?.headers);

    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          rate: row.rate,
          bom_req: row.bom_req_qty,
        };
      });
      setMainData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const compInputHandler = async (name, value, id) => {
    console.log(name, value, id);
    if (name == "bom_req") {
      setMainData((issueQty) =>
        issueQty.map((a) => {
          if (a.id == id) {
            {
              return { ...a, bom_req: value };
            }
          } else {
            return a;
          }
        })
      );
    } else {
      let arr = mainData;
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id === id) {
          return {
            ...obj,
            [name]: value,
          };
        } else {
          return obj;
        }
      });
      setMainData(arr);
    }
  };

  const reset = (i) => {
    setMainData((allDataComes) => {
      return allDataComes.filter((row) => row.id != i);
    });
  };
  const columns = [
    { field: "index", headerName: "S No.", width: 8 },
    { field: "part_code", headerName: "Part Code.", width: 120 },
    { field: "component_name", headerName: "Component Name", width: 450 },
    { field: "bom_req_qty", headerName: "BOM Required Qty", width: 180 },
    {
      field: "rate",
      headerName: "Rate",
      width: 180,
      renderCell: ({ row }) => (
        <Input
          value={row.rate}
          type="number"
          onChange={(e) => compInputHandler("rate", e.target.value, row.id)}
        />
      ),
    },
    { field: "uom", headerName: "UoM", width: 100 },
    {
      // field: "bom_req_qty",
      headerName: "Update Qty",
      width: 240,
      renderCell: ({ row }) => (
        <>
          <Input
            disabled={row?.recipeStatus == "PENDING"}
            type="number"
            // value={row?.bom_req_qty}
            onChange={(e) =>
              compInputHandler("bom_req", e.target.value, row.id)
            }
          />
        </>
      ),
    },
    {
      field: "Actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <TableActions
            action="delete"
            disabled={row?.recipeStatus == "PENDING"}
            onClick={() => reset(row.id)}
            // onClick={() => console.log(row)}
            style={{ fontSize: "20px", marginLeft: "10px" }}
          />
        </>
      ),
    },
  ];

  const updateFun = async () => {
    let allCompArray = [];
    let allQtyArray = [];
    // const invalidRates = mainData.filter((row) => !row.rate || row.rate <= 0);

    // if (invalidRates.length > 0) {
    //   toast.error("Rate field cannot be empty for all rows.");
    //   return;  // Prevent submission if validation fails
    // }
    mainData.map((a) => allCompArray.push(a.component_key));
    mainData.map((a) => allQtyArray.push(a.bom_req ?? "")); 

    //  console.log(view);
    setSubmitLoading(true);

    const { data } = await imsAxios.post("/jobwork/updateJwAnlyComp", {
      component: allCompArray,
      qty: allQtyArray,
      sku_trans_id: view?.jobwork_sku_id,
      trans_id: view?.jobwork_id,
      rate: mainData.map((row) => row.rate ?? 0),
    });
    setSubmitLoading(false);
    if (data.code == 200) {
      getRows();
      setUpdateModalInfo(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setUpdateModalInfo(false);
    }
    //  console.log(data)
  };

  useEffect(() => {
    if (updateModalInfo) {
      getAllData();
    }
  }, [updateModalInfo]);
  return (
    <Space>
      <Drawer
        width="100vw"
        title={
          <span style={{ fontSize: "15px", color: "#1890ff" }}>
            {`${row?.jwId} / ${row?.vendor}`}
          </span>
        }
        placement="right"
        closable={false}
        onClose={() => setUpdateModalInfo(false)}
        open={updateModalInfo}
        getContainer={false}
        style={
          {
            //  position: "absolute",
          }
        }
        extra={
          <Space>
            <CloseCircleFilled onClick={() => setUpdateModalInfo(false)} />
          </Space>
        }
      >
        <Skeleton active loading={loading}>
          <Row>
            <Col span={24}>
              <Row gutter={5}>
                <Col span={8} style={{ fontSize: "12px", fontWeight: "bold" }}>
                  JW PO ID:
                  <span>{view?.jobwork_id}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Jobwork ID : <span>{view?.jobwork_id}</span>
                </Col>

                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Name & SKU :<span>{view?.product_name}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  JW PO created by :<span>{view?.created_by}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG BOM of Recipe :<span>{view?.subject_name}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Regisered Date & Time :<span>{view?.registered_date}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Ord Qty :<span>{view?.ordered_qty}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Job ID Status :<span>{view?.jw_status}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG processed Qty:
                  <span>{view?.proceed_qty}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG processed Qty:
                  <span>{view?.vendor_name}</span>
                </Col>
              </Row>
            </Col>
          </Row>
        </Skeleton>

        <Skeleton loading={loading} active>
          <div style={{ height: "75%", marginTop: "20px" }}>
            <div style={{ height: "100%" }}>
              <MyDataTable
                loading={loading}
                columns={columns}
                data={mainData}
              />
            </div>
          </div>
        </Skeleton>

        <Skeleton loading={loading} active>
          <Row>
            <Col span={24}>
              <div style={{ textAlign: "end", marginTop: "30px" }}>
                <Button
                  loading={submitLoading}
                  onClick={updateFun}
                  type="primary"
                >
                  Update
                </Button>
              </div>
            </Col>
          </Row>
        </Skeleton>
      </Drawer>
    </Space>
  );
}

export default UpdateModal;
