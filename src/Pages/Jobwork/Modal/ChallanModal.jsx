import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Drawer,
  Input,
  message,
  Row,
  Skeleton,
  Space,
  Spin,
} from "antd";
import {
  EyeFilled,
  CloseCircleFilled,
  InfoCircleTwoTone,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";

// import TableActions from "../../Components/TableActions.jsx/TableActions";

function ChallanModal({ challanModal, setChallanModal }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  console.log(data);
  let compArray = [];
  let qtyArray = [];
  let rateArray = [];
  let hsnArray = [];
  let remarkArray = [];
  data.map((az) => compArray.push(az.component_key));
  data.map((a) => qtyArray.push(a.issue_qty));
  data.map((aa) => rateArray.push(aa.part_rate));
  data.map((aaa) => hsnArray.push(aaa.hsn_code));
  data.map((aaaa) => remarkArray.push(aaaa.remarks));
  //   console.log(z);
  //   console.log(zz);
  //   console.log(zzz);
  //   console.log(za);

  const getFetchChallan = async () => {
    setSpinLoading(true);
    const { data } = await imsAxios.post("/jobwork/editJobworkChallan", {
      challan_no: challanModal.challan_id,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setData(arr);
      setSpinLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setSpinLoading(false);
    }
  };

  const inputHandler = async (name, id, value) => {
    console.log(value);
    if (name == "itemDescription") {
      setData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, itemDescription: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "hsn_code") {
      setData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, hsn_code: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "issue_qty") {
      setData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, issue_qty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "part_rate") {
      setData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, part_rate: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "remarks") {
      setData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, remarks: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 8 },
    { field: "component_name", headerName: "Component/Part Code", width: 360 },
    {
      field: "issue_qty",
      headerName: "Ord Qty",
      width: 180,
      renderCell: ({ row }) => (
        <Input
          suffix={row.unit_name}
          value={row.issue_qty}
          placeholder="Qty"
          onChange={(e) => inputHandler("issue_qty", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "part_rate",
      headerName: "Rate",
      width: 160,
      renderCell: ({ row }) => (
        <Input
          value={row.part_rate}
          placeholder="Rate"
          onChange={(e) => inputHandler("part_rate", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "value",
      headerName: "Value",
      width: 160,
      renderCell: ({ row }) => (
        <Input
          value={row.issue_qty * row.part_rate}
          disabled
          placeholder="HSN CODE"
        />
      ),
    },
    {
      // field: "hsn_code",
      headerName: "HSN Code",
      width: 160,
      field: "hsn_code",
      renderCell: ({ row }) => (
        <Input
          value={row.hsn_code}
          placeholder="HSN CODE"
          onChange={(e) => inputHandler("hsn_code", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "Remarks",
      headerName: "ITEM DESCRIPTION",
      width: 260,
      renderCell: ({ row }) => (
        <Input
          value={row.remarks}
          placeholder="Description"
          onChange={(e) => inputHandler("remarks", row.id, e.target.value)}
        />
      ),
    },
  ];

  const updateFun = async () => {
    setSpinLoading(true);
    const { data } = await imsAxios.post("/jobwork/updateJobworkChallan", {
      transaction_id: challanModal.challan_id,
      component: compArray,
      qty: qtyArray,
      rate: rateArray,
      hsncode: hsnArray,
      remark: remarkArray,
    });
    //  console.log(data);
    if (data.code == 200) {
      setSpinLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setSpinLoading(false);
    }
  };

  useEffect(() => {
    if (challanModal) {
      getFetchChallan();
    }
  }, [challanModal]);
  return (
    <>
      <Space>
        <Drawer
          width="100vw"
          title={
            <span style={{ fontSize: "15px", color: "#1890ff" }}>
              {challanModal?.vendor}
            </span>
          }
          placement="right"
          closable={false}
          onClose={() => setChallanModal(false)}
          open={challanModal}
          getContainer={false}
          style={
            {
              //  position: "absolute",
            }
          }
          extra={
            <Space>
              <CloseCircleFilled onClick={() => setChallanModal(false)} />
            </Space>
          }
        >
          <>
            <div style={{ height: "80%", margin: "10px" }}>
              <div style={{ height: "100%" }}>
                <Skeleton active loading={spinLoading}>
                  <MyDataTable data={data} columns={columns} />
                </Skeleton>

                {/* <Skeleton active loading={loading}></Skeleton> */}
              </div>
            </div>
            {data.length > 0 && (
              <Row style={{ margin: "10px", marginTop: "80px" }}>
                <Col span={24}>
                  <div style={{ textAlign: "end" }}>
                    <Button
                      onClick={() => setChallanModal(false)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        marginRight: "10px",
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      loading={spinLoading}
                      type="primary"
                      onClick={updateFun}
                    >
                      Update
                    </Button>
                  </div>
                </Col>
              </Row>
            )}
          </>
        </Drawer>
      </Space>
    </>
  );
}

export default ChallanModal;
