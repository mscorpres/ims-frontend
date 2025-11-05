import { useState } from "react";
import { Col, Row, Select, Button, Input, Popover } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import MyDatePicker from "../../Components/MyDatePicker";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import JwIssurModel from "./Modal/JwIssurModel";
import { imsAxios } from "../../axiosInterceptor";
import useLoading from "../../hooks/useLoading";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import CustomButton from "../../new/components/reuseable/CustomButton.jsx";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";
import { Search } from "@mui/icons-material";

const JwIssue = () => {
  const [openModal, setOpenModal] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useLoading();
  const [dateData, setDateData] = useState([]);
  const [sfgData, setSFGData] = useState([]);
  const [jwData, setJWData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [allData, setAllData] = useState({
    setType: "",
    sfg: "",
    jwId: "",
    vendorName: "",
  });
  const { executeFun } = useApi();

  const options = [
    { label: "Date", value: "datewise" },
    { label: "JW ID", value: "jw_transaction_wise" },
    { label: "SFG SKU", value: "jw_sfg_wise" },
    { label: "Vendor", value: "vendorwise" },
  ];

  const getOption = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/getProductByNameAndNo", {
        search: e,
      });
      // console.log(data);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getVendor = async (search) => {
    if (search.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };

  const datewiseFetchData = async () => {
    if (allData.setType == "") {
      toast.error("Please Select Option");
    } else {
      setLoading("fetch", true);
      setDateData([]);
      const { data } = await imsAxios.post("/jobwork/jw_rm_issue_list", {
        data: datee,
        wise: allData.setType,
      });
      // console.log(data.data);
      setLoading("fetch", false);
      if (data.code == 200) {
        let arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
 
        setDateData(arr);
        setLoading("fetch", false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading("fetch", false);
      }
    }
  };

  const JWFecthData = async () => {
    setLoading("fetch", true);
    setJWData([]);
    const { data } = await imsAxios.post("/jobwork/jw_rm_issue_list", {
      data: allData.jwId,
      wise: allData.setType,
    });
    // console.log(data.data);
    // setLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setJWData(arr);
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };

  const dataFetchSFG = async () => {
    setLoading("fetch", true);
    setSFGData([]);
    const { data } = await imsAxios.post("/jobwork/jw_rm_issue_list", {
      data: allData.sfg,
      wise: allData.setType,
    });
    // console.log(data.data);
    // setLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setSFGData(arr);
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };

  const vendorFetch = async () => {
    setLoading("fetch", true);
    setVendorData([]);
    const { data } = await imsAxios.post("/jobwork/jw_rm_issue_list", {
      data: allData.vendorName,
      wise: allData.setType,
    });
    // console.log(data.data);
    // setLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setVendorData(arr);
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
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
    { accessorKey: "index", header: "S No.", size: 8 },
    { accessorKey: "date", header: "Date", size: 100 },
    { accessorKey: "jw_transaction_id", header: "JW ID", size: 150 },
    {
      accessorKey: "vendor",
      header: "Vendor",
      size: 400,
      renderCell: ({ row }) => (
        <>
          <Popover content={content(row.vendor)}>
            <span dangerouslySetInnerHTML={{ __html: row.vendor }} />
          </Popover>
          {/* <Popover>{row.qty_in}</Popover> */}
        </>
      ),
    },
    { accessorKey: "skucode", header: "SKU", size: 100 },
    { accessorKey: "product", header: "Product", size: 350 },
    { accessorKey: "req_qty", header: "Required Qty", size: 120 },
    // {
    //   type: "actions",
    //   header: "Actions",
    //   width: 150,
    //   getActions: ({ row }) => [
    //     <ArrowRightOutlined onClick={() => setOpenModal(row)} />,
    //   ],
    // },
  ];

  const table = useMaterialReactTable({
    columns: columns,
    data:
      allData.setType == "datewise"
        ? dateData
        : allData.setType == "jw_transaction_wise"
        ? jwData
        : allData.setType == "jw_sfg_wise"
        ? sfgData
        : allData.setType == "vendorwise"
        ? vendorData
        : vendorData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <CustomButton
        title={"Process"}
        size="small"
        onClick={() => setOpenModal(row?.original)}
      />
    ),
    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
          ? "calc(100vh - 240px)"
          : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") ? (
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
    <>
      <div style={{ height: "95%" }}>
        {/* <InternalNav links={JobworkLinks} /> */}
        <Row gutter={10} style={{ margin: "12px" }}>
          <Col span={4}>
            <Select
              placeholder="Select Option"
              style={{ width: "100%" }}
              options={options}
              value={allData.setType.value}
              onChange={(w) =>
                setAllData((allData) => {
                  return { ...allData, setType: w };
                })
              }
            />
          </Col>
          {allData.setType == "datewise" ? (
            <>
              <Col span={4}>
                <MyDatePicker size="default" setDateRange={setDatee} />
              </Col>
              <Col span={1}>
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={datewiseFetchData}
                />
              </Col>
            </>
          ) : allData.setType == "jw_transaction_wise" ? (
            <>
              <Col span={4}>
                <Input
                  placeholder="JW ID"
                  value={allData.jwId}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, jwId: e.target.value };
                    })
                  }
                />
              </Col>
              <Col span={1}>
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={JWFecthData}
                />
              </Col>
            </>
          ) : allData.setType == "jw_sfg_wise" ? (
            <>
              <Col span={6}>
                <MyAsyncSelect
                  style={{ width: "100%" }}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getOption}
                  value={allData.sfg}
                  optionsState={asyncOptions}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, sfg: e };
                    })
                  }
                  placeholder="SFG SKU wise"
                />
              </Col>
              <Col span={1}>
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={dataFetchSFG}
                />
              </Col>
            </>
          ) : allData.setType == "vendorwise" ? (
            <>
              <Col span={6}>
                <MyAsyncSelect
                  style={{ width: "100%" }}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getVendor}
                  value={allData.vendorName}
                  optionsState={asyncOptions}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, vendorName: e };
                    })
                  }
                  placeholder="Vendor wise"
                />
              </Col>
              <Col span={1}>
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={vendorFetch}
                />
              </Col>
            </>
          ) : (
            <>
              <Col span={4}>
                <MyDatePicker size="default" setDateRange={setDatee} />
              </Col>
              <Col span={1}>
                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading("fetch")}
                  onclick={datewiseFetchData}
                />
              </Col>
            </>
          )}
        </Row>

        <div style={{ height: "87%", margin: "10px" }}>
          <MaterialReactTable table={table} />
        </div>
      </div>
      <JwIssurModel
        openModal={openModal}
        setOpenModal={setOpenModal}
        datewiseFetchData={datewiseFetchData}
      />
    </>
  );
};

export default JwIssue;
