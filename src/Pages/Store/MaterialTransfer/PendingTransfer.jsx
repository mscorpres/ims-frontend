import  { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ViewModal from "./Modal/ViewModal";

import { Col, DatePicker, Input, Row, Select } from "antd";
import MySelect from "../../../Components/MySelect";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search, Visibility } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, IconButton, LinearProgress } from "@mui/material";

function PendingTransfer() {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    typeWise: "",
    selectdate: "",
    transactionText: "",
    locationText: "",
  });

  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);
  const [dataComesFromTransactionWise, setDataComesFromTransactionWise] =
    useState([]);
  const [dataComesFromLocationWise, setdataComesFromLocationWise] = useState(
    []
  );

  const [viewModal, setViewModal] = useState(false);
  const opt = [
    { label: "Date", value: "datewise" },
    { label: "Transaction", value: "transactionwise" },
    { label: "Location", value: "locationwise" },
  ];

  const columns = [
    { accessorKey: "insert_date", header: "Date", size: 160 },
    { accessorKey: "component_part", header: "Part", size: 100 },
    { accessorKey: "component_name", header: "Component", size: 300 },
    { accessorKey: "transfer_from", header: "Out Location", size: 150 },
    { accessorKey: "transfer_to", header: "In Location", size: 150 },
    {
      accessorKey: "request_qty",
      header: "Qty",
      size: 100,
      renderCell: ({ row }) => (
        <span>{row.request_qty + "/" + row.required_qty}</span>
      ),
    },
    { accessorKey: "transaction_id", header: "Txn ID", size: 150 },
    { accessorKey: "request_by", header: "Req. By", size: 150 },
  ];

  // fetch Date wise
  const dateWise = async (e) => {
    setLoading(true);
    e.preventDefault();

    const { data } = await imsAxios.post("/godown/fetchPending_tranfers", {
      data: datee,
      wise: allData.typeWise,
    });
    console.log(data);
    if (data.code == 200) {
      let arr = data.response.data.map((row) => {
        return { ...row, id: v4() };
      });
      setDataComesFromDateWise(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const transactionWise = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/godown/fetchPending_tranfers", {
      data: allData.transactionText,
      wise: allData.typeWise,
    });

    if (data.code == 200) {
      let arr = data.response.data.map((row) => {
        return { ...row, id: v4() };
      });
      setDataComesFromTransactionWise(arr);
      setLoading(false);
      // setFilterDate(data.data);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
    // setDataComesFromTransactionWise(data.response.data);
  };

  const locationWiseDateFecth = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/godown/fetchPending_tranfers", {
      data: allData.locationText,
      wise: allData.typeWise,
    });
    console.log(data);
    if (data.code == 200) {
      let arr = data.response.data.map((row) => {
        return { ...row, id: v4() };
      });
      setdataComesFromLocationWise(arr);
      setLoading(false);
      // setFilterDate(data.data);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { data } = await imsAxios.post("/backend/fetchLocation");
    const arr = [];
    data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationData(arr);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    // if(allData.typeWise.value == 'transactionwise'){
    // }
  }, [allData.typeWise.value]);

  const table = useMaterialReactTable({
    columns: columns,
    data:
      allData.typeWise == "datewise"
        ? dataComesFromDateWise
        : allData.typeWise == "transactionwise"
        ? dataComesFromTransactionWise
        : allData.typeWise == "locationwise"
        ? dataComesFromLocationWise
        : dataComesFromDateWise || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <IconButton
        size="small"
        color="inherit"
        onClick={() => setViewModal(row)}
      >
        <Visibility fontSize="small" />
      </IconButton>
    ),
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

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
  return (
    <div style={{ height: "85%" }}>
      <Row gutter={16} style={{ margin: "10px" }}>
        <Col span={4} className="gutter-row">
          <div>
            <Select
              style={{ width: "100%" }}
              options={opt}
              placeholder="Select Option"
              value={allData.typeWise.value}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, typeWise: e };
                })
              }
            />
          </div>
        </Col>
        {allData.typeWise == "datewise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={dateWise}
              />
            </Col>
          </>
        ) : allData.typeWise == "transactionwise" ? (
          <>
            <Col span={5} className="gutter-row">
              <Input
                style={{ width: "100%" }}
                value={allData.transactionText}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, transactionText: e.target.value };
                  })
                }
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={transactionWise}
              />
            </Col>
          </>
        ) : allData.typeWise == "locationwise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MySelect
                options={locationData}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, locationText: e };
                  })
                }
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                onclick={locationWiseDateFecth}
              />
            </Col>
          </>
        ) : (
          ""
        )}
      </Row>

      <div style={{ height: "100%", margin: "10px" }}>
        <MaterialReactTable table={table} />
      </div>

      <ViewModal setViewModal={setViewModal} viewModal={viewModal} />
    </div>
  );
}

export default PendingTransfer;
