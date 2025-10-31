import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../../common.css";
import { v4 } from "uuid";
import { Button, Col, Input, Row, Select, Skeleton } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { DeleteTwoTone, DeleteOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

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
      accessorKey: "Actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <>
          <DeleteTwoTone
            onClick={() => resetData(row.id)}
            // onClick={() => console.log(row)}
            style={{ fontSize: "20px" }}
          />
        </>
      ),
    },
    { accessorKey: "componentName", header: "Component", size: 300 },
    { accessorKey: "partno", header: "Part", size: 100 },
    { accessorKey: "hsncode", header: "HSN", size: 100 },
    { accessorKey: "gsttype", header: "GST", size: 100 },
    {
      accessorKey: "inward_qty",
      header: "Total",
      size: 140,
      Cell: ({ row }) => (
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
    { accessorKey: "rejected_qty", header: "Reject Qty", size: 100 },
    { accessorKey: "min_date", header: "Date", size: 180 },
    { accessorKey: "location", header: "Pick(-) From", size: 120 },
    {
      accessorKey: "loc",
      header: "Drop (+)To",
      size: 160,
      Cell: ({ row }) => (
        <Select
          style={{ size: "100%" }}
          options={loctionData}
          onChange={(e) => compInputHandler("loc", e, row.id)}
        />
      ),
    },
  ];
  const table = useMaterialReactTable({
    columns: columns,
    data: allDataComes || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Purchase Orders Found" />
    ),

    renderTopToolbar: () =>
      loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });

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
        <Col span={3}>
          <CustomButton
            size="small"
            title={"Search"}
            starticon={<Search fontSize="small" />}
            loading={loading}
            onclick={rejectListFunction}
          />
        </Col>
        {allDataComes.length > 0 && (
          <Col span={8} offset={10}>
            <TextArea placeholder="Reject Comment (Not Compulsory)" />
          </Col>
        )}
      </Row>

      <div style={{ height: "69vh", margin: "15px" }}>
        {/* <MyDataTable data={allDataComes} columns={columns} />
         */}
        <MaterialReactTable table={table} />
      </div>

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
