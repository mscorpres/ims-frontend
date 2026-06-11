import React, { useState, useEffect } from "react";
import { Col, Row, Select, Button, Input, Popover } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import MyDatePicker from "../../Components/MyDatePicker";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { ArrowRightOutlined } from "@ant-design/icons";
import JwIssurModel from "./Modal/JwIssurModel";
import { imsAxios } from "../../axiosInterceptor";
import useLoading from "../../hooks/useLoading";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import MyButton from "../../Components/MyButton";

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
  const { executeFun, loading: loading1 } = useApi();
  //   console.log(dateData);
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
        // for (let i = 0; i < arr.length; i++) {
        //   console.log(arr[i].vendor);
        //   dangerouslySetInnerHTML:{{__html:arr[i].vendor}}
        // }
        // console.log(arr);
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
    { field: "index", headerName: "S No.", width: 8 },
    { field: "date", headerName: "Date", width: 100 },
    { field: "jw_transaction_id", headerName: "JW ID", width: 150 },
    {
      field: "vendor",
      headerName: "Vendor",
      width: 400,
      renderCell: ({ row }) => (
        <>
          <Popover content={content(row.vendor)}>
            <span dangerouslySetInnerHTML={{ __html: row.vendor }} />
          </Popover>
          {/* <Popover>{row.qty_in}</Popover> */}
        </>
      ),
    },
    { field: "skucode", headerName: "SKU", width: 100 },
    { field: "product", headerName: "Product", width: 350 },
    { field: "req_qty", headerName: "Required Qty", width: 120 },
    {
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: ({ row }) => [
        <ArrowRightOutlined onClick={() => setOpenModal(row)} />,
        //   <TableActions action="view" onClick={() => setViewModalOpen(row)} />,
        //   <TableActions action="cancel" onClick={() => setCloseModalOpen(row)} />,
        //   <TableActions action="print" onClick={() => console.log(row)} />,
      ],
    },
  ];
  return (
    <>
      <div style={{ height: "95%" }}>
        {/* <InternalNav links={JobworkLinks} /> */}
        <Row gutter={10} style={{ margin: "10px" }}>
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
                <Button
                  loading={loading("fetch")}
                  onClick={datewiseFetchData}
                  type="primary"
                >
                  Fetch
                </Button>
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
                <Button
                  type="primary"
                  loading={loading("fetch")}
                  onClick={JWFecthData}
                >
                  Fetch
                </Button>
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
                <Button
                  type="primary"
                  loading={loading("fetch")}
                  onClick={dataFetchSFG}
                >
                  Fetch
                </Button>
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
                <Button
                  loading={loading("fetch")}
                  onClick={vendorFetch}
                  type="primary"
                >
                  Fetch
                </Button>
              </Col>
            </>
          ) : (
            <>
              <Col span={4}>
                <MyDatePicker size="default" setDateRange={setDatee} />
              </Col>
              <Col span={1}>
                <MyButton
                  variant="search"
                  loading={loading("fetch")}
                  onClick={datewiseFetchData}
                  type="primary"
                >
                  Fetch
                </MyButton>
              </Col>
            </>
          )}
        </Row>

        <div style={{ height: "87%", margin: "10px" }}>
          {allData.setType == "datewise" ? (
            <MyDataTable
              loading={loading("fetch")}
              data={dateData}
              columns={columns}
            />
          ) : allData.setType == "jw_transaction_wise" ? (
            <MyDataTable
              loading={loading("fetch")}
              data={jwData}
              columns={columns}
            />
          ) : allData.setType == "jw_sfg_wise" ? (
            <MyDataTable
              loading={loading("fetch")}
              data={sfgData}
              columns={columns}
            />
          ) : allData.setType == "vendorwise" ? (
            <MyDataTable
              loading={loading("fetch")}
              data={vendorData}
              columns={columns}
            />
          ) : (
            <MyDataTable
              loading={loading("fetch")}
              data={vendorData}
              columns={columns}
            />
          )}
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
