import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../../common.css";
import { v4 } from "uuid";
import { Button, Col, Input, Row, Select, Skeleton } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { DeleteTwoTone, DeleteOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const { TextArea } = Input;

const Rejection = () => {
  const [loading, setLoading] = useState(false);
  const [loadingRejection, setLoadingRejection] = useState(false);
  const [seacrh, setSearch] = useState(null);
  const [rejectedValue, setRejectedvalue] = useState({
    selValue: "",
  });
  const [asyncOptions, setAsyncOptions] = useState([]);

  //   // console.log(rejectedValue);

  const [allDataComes, setAllDataComes] = useState([]);
  const [loctionData, setloctionData] = useState([]);

  //   console.log(allDataComes);

  // console.log(allDataComes);

  const [valueComesApi, setValueComesApi] = useState({
    branch: "",
    component: [],
    quantity: [],
    loc_to: [],
    remark: "",
  });

  const getRejectedList = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/getMinTransactionByNo", {
        search: e,
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const getLoctionsss = async () => {
    const { data } = await imsAxios.post("/rejection/fetchAllotedLocation");
    let u = [];
    console.log(data.data);
    data.data.map((d) => u.push({ label: d.text, value: d.id }));
    setloctionData(u);
  };

  const rejectListFunction = async () => {
    setAllDataComes([]);
    setLoading(true);
    const { data } = await imsAxios.post("/rejection/fetchMINData", {
      min_transaction: rejectedValue?.selValue,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      getLoctionsss();
      setAllDataComes(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.min_transaction[0]);
      setLoading(false);
    }
  };

  const reset = () => {
    setAllDataComes([]);
  };

  const resetData = (i) => {
    setAllDataComes((allDataComes) => {
      return allDataComes.filter((row) => row.id != i);
    });
  };

  const compInputHandler = async (name, value, id) => {
    console.log(name, value, id);
    if (name == "inward_qty") {
      setAllDataComes((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, inward_qty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "loc") {
      setAllDataComes((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, loc: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const columns = [
    {
      field: "Actions",
      headerName: "Actions",
      width: 100,
      renderCell: ({ row }) => (
        <>
          <DeleteTwoTone
            onClick={() => resetData(row.id)}
            // onClick={() => console.log(row)}
            style={{ fontSize: "20px" }}
          />
        </>
      ),
    },
    { field: "componentName", headerName: "Component", width: 300 },
    { field: "partno", headerName: "Part", width: 100 },
    { field: "hsncode", headerName: "HSN", width: 100 },
    { field: "gsttype", headerName: "GST", width: 100 },
    {
      field: "inward_qty",
      headerName: "Total",
      width: 140,
      renderCell: ({ row }) => (
        <>
          <Input
            suffix={row.uom}
            value={row.inward_qty}
            placeholder="QTY"
            onChange={(e) =>
              compInputHandler("inward_qty", e.target.value, row.id)
            }
          />
        </>
      ),
    },
    { field: "rejected_qty", headerName: "Reject Qty", width: 100 },
    { field: "min_date", headerName: "Date", width: 180 },
    { field: "location", headerName: "Pick(-) From", width: 120 },
    {
      field: "loc",
      headerName: "Drop (+)To",
      width: 160,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "100%" }}
          options={loctionData}
          onChange={(e) => compInputHandler("loc", e, row.id)}
        />
      ),
    },
  ];

  const rejectionFun = async () => {
    setLoadingRejection(true);
    let compArry = [];
    let qtyArry = [];
    let locArry = [];
    allDataComes.map((aa) => compArry.push(aa.componentKey));
    allDataComes.map((aa) => qtyArry.push(aa?.inward_qty));
    allDataComes.map((aa) => locArry.push(aa?.loc));
    const { data } = await imsAxios.post("/rejection/saveRejection", {
      branch: "BRMSC012",
      component: compArry,
      qty: qtyArry,
      loc_to: locArry,
      remark: valueComesApi.remark,
      min_transaction: rejectedValue.selValue,
    });

    if (data.code == 200) {
      toast.success(data.message);
      setAllDataComes([]);
      setLoadingRejection(false);
    } else if (data.code == 500) {
      // allDataComes([]);
      toast.error(data.message.msg);
      setLoadingRejection(false);
    }
  };

  useEffect(() => {
    if (allDataComes.length > 0) {
      console.log(allDataComes);
    }
  }, [allDataComes]);

  return (
    <>
      <Row gutter={10} style={{ margin: "10px" }}>
        <Col span={4}>
          <MyAsyncSelect
            style={{ width: "100%" }}
            onBlur={() => setAsyncOptions([])}
            loadOptions={getRejectedList}
            placeholder="MIN / TXN ID"
            optionsState={asyncOptions}
            onChange={(e) =>
              setRejectedvalue((rejectedValue) => {
                return { ...rejectedValue, selValue: e };
              })
            }
          />
        </Col>
        <Col span={2}>
          <MyButton
            variant="search"
            type="primary"
            onClick={rejectListFunction}
            loading={loading}
          >
            Fetch
          </MyButton>
        </Col>
        {allDataComes.length > 0 && (
          <Col span={8} offset={10}>
            <TextArea placeholder="Reject Comment (Not Compulsory)" />
          </Col>
        )}
      </Row>

      <Skeleton loading={loading}>
        <div style={{ height: "69vh", margin: "15px" }}>
          <div style={{ height: "100%" }}>
            <MyDataTable data={allDataComes} columns={columns} />
          </div>
        </div>
      </Skeleton>

      {allDataComes.length > 0 && (
        <Row gutter={16} style={{ margin: "10px" }}>
          <Col span={24}>
            <div style={{ textAlign: "end" }}>
              <Button onClick={reset} style={{ marginRight: "5px" }}>
                Reset
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={rejectionFun}
                loading={loadingRejection}
                style={{ background: "red", color: "white" }}
              >
                Rejection
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Rejection;
