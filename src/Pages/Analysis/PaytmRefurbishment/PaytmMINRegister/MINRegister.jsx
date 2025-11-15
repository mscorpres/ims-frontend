import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MySelect from "../../../../Components/MySelect";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import { convertSelectOptions } from "../../../../utils/general";
import { getVendorOptions } from "../../../../api/general";
import useApi from "../../../../hooks/useApi.ts";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";
import { Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, LinearProgress } from "@mui/material";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox.jsx";

function MINRegister() {
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [scanningMIN, setScanningMIN] = useState(false);
  const [imeiArr, setImeiArr] = useState([]);
  const [previousCount, setPreviousCount] = useState({
    total: 0,
    pending: 0,
    complete: 0,
  });
  const [imeiInput, setImeiInput] = useState("");
  const [rows, setRows] = useState([]);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const hiddenImeiInputRef = useRef();

  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "MIN Wise", value: "minwise" },
    { text: "Vendor Wise", value: "vendorwise" },
  ];

  const fetchIMEINumbers = async (row) => {
    hiddenImeiInputRef.current.focus();
    setLoading("imeiInfoLoading");
    const response = await imsAxios.post("/paytmRefurb/countRefurb", {
      txn: row.txn,
    });
    setLoading(false);
    const { data } = response;
    if (data.code === 200) {
      let obj = {
        total: data.data.total,
        pending: data.data.pending,
        complete: data.data.complete,
      };
      setPreviousCount(obj);
    } else {
      toast.error(data.message.msg);
    }
    setScanningMIN(row.txn);
  };
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getRows = async () => {
    setLoading("fetch");

    const response = await imsAxios.post("/paytmRefurb/fetch", {
      data: searchInput,
      wise: wise,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          id: v4(),
          index: index + 1,
          ...row,
        }));
        setRows(arr);
        setImeiArr([]);
        setImeiInput("");
        setScanningMIN(false);
      } else {
        setRows([]);
        toast.error(data.message.msg);
      }
    }
  };
  const validateHandler = () => {
    let obj = {
      txn: scanningMIN,
      imei: imeiArr,
    };
    setSubmitConfirm(obj);
  };
  const submitHandler = async () => {
    setLoading("submit");
    if (submitConfirm) {
      const response = await imsAxios.post(
        "/paytmRefurb/insertRefurb",
        submitConfirm
      );
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setSubmitConfirm(false);
          setImeiArr([]);
          setImeiInput("");
          setScanningMIN(false);
        } else {
          toast.error(data.message.msg);
        }
      }
    }
  };
  const columns = [
    { header: "S. No.", width: 60, accessorKey: "index" },
    { header: "SKU", width: 100, accessorKey: "sku" },
    {
      header: "MIN ID",
      width: 150,
      accessorKey: "txn",
      render: ({ row }) => <ToolTipEllipses text={row.txn} copy={true} />,
    },
    {
      header: "Component",
      width: 180,
      accessorKey: "product",
      render: ({ row }) => <ToolTipEllipses text={row.product} />,
    },
    {
      header: "Vendor Code",
      width: 120,
      accessorKey: "vcode",
      render: ({ row }) => <ToolTipEllipses text={row.vcode} copy={true} />,
    },
    {
      header: "Vendor",
      width: 180,
      accessorKey: "vname",
      render: ({ row }) => <ToolTipEllipses text={row.vname} />,
    },
    { header: "Qty", width: 120, accessorKey: "qty" },
    { header: "UoM", width: 80, accessorKey: "uom" },
    {
      header: "In Date",
      width: 150,
      accessorKey: "indt",
      render: ({ row }) => <ToolTipEllipses text={row.indt} />,
    },
    {
      header: "In By",
      width: 150,
      accessorKey: "inby",
      render: ({ row }) => <ToolTipEllipses text={row.inby} />,
    },

  ];

  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  useEffect(() => {
    setImeiArr([]);
  }, [scanningMIN]);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
     enableRowActions: true,
    
        renderRowActions: ({ row }) => (
         <CustomButton size="small" title={"scan"}  variant="text" onclick={() => fetchIMEINumbers(row)}/>
        ),

    muiTableContainerProps: {
      sx: {
        height:
          loading === "fetch" ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
    <div style={{ height: "90%", margin: 12 }}>
      <Modal
        title="Submit Confirm"
        open={submitConfirm}
        onOk={submitHandler}
        confirmLoading={loading === "submit"}
        onCancel={() => setSubmitConfirm(false)}
      >
        <p>
          Are you sure you want to submit these {imeiArr.length} IMEI Numbers to
          MIN {scanningMIN}?
        </p>
      </Modal>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
                setSearchString={setSearchInput}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" && (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  dateRange={searchInput}
                  value={searchInput}
                />
              )}
              {wise === "minwise" && (
                <Input
                  style={{ width: "100%" }}
                  type="text"
                  placeholder="Enter MIN Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              )}
              {wise === "vendorwise" && (
                <MyAsyncSelect
                  size="default"
                  selectLoading={loading1("select")}
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={getVendors}
                  optionsState={asyncOptions}
                />
              )}
            </div>

            <CustomButton
              disabled={
                !wise || !searchInput || searchInput === "" ? true : false
              }
              size="small"
              title={"Search"}
              starticon={<Search fontSize="small" />}
              loading={loading === "fetch"}
              onclick={getRows}
            />
          </Space>
        </Col>
      </Row>

      <Row gutter={6} style={{ height: "95%" }}>
        <Col span={18} style={{ height: "100%", marginTop: 12 }}>
          <MaterialReactTable table={table} />
        </Col>
        <Col
          span={6}
          style={{
            maxHeight: "calc(100% - 30px)",
            overflow: "auto",
            padding: "2px 8px",
            marginTop: 12,
          }}
        >
          <input
            ref={hiddenImeiInputRef}
            style={{
              // visibility: "hidden",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
              position: "absolute",
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                let arr = imeiArr;
                if (e.target.value.length >= 15) {
                  arr = [...arr, e.target.value];
                  setImeiArr(arr);
                  setImeiInput("");
                }
              }
            }}
            value={imeiInput}
            onChange={(e) => setImeiInput(e.target.value)}
          />
          <CustomFieldBox>
            <Typography.Text
              onClick={() => hiddenImeiInputRef.current.focus()}
              style={{ fontWeight: 600 }}
            >{`Scanning MIN : ${
              scanningMIN ? scanningMIN : ""
            }`}</Typography.Text>
          </CustomFieldBox>
          <Row style={{ height: "93%", width: "100%" }}>
            <Col span={24} style={{ marginTop: 12 }}>
              <CustomFieldBox>
                <Row gutter={[4, 8]}>
                  <Col span={12}>
                    {scanningMIN && (
                      <Typography.Text style={{ fontWeight: 500 }}>
                        Total Records:
                        <br />
                        {loading === "imeiInfoLoading" ? (
                          <Skeleton.Input
                            loading={loading === "imeiInfoLoading"}
                            active={true}
                            block
                          />
                        ) : (
                          previousCount.total
                        )}
                      </Typography.Text>
                    )}
                  </Col>
                  <Col span={12}>
                    {scanningMIN && (
                      <Typography.Text style={{ fontWeight: 500 }}>
                        Completed:
                        <br />
                        {loading === "imeiInfoLoading" ? (
                          <Skeleton.Input
                            loading={loading === "imeiInfoLoading"}
                            active={true}
                            block
                          />
                        ) : (
                          previousCount.complete
                        )}
                      </Typography.Text>
                    )}
                  </Col>
                  <Col span={12}>
                    {scanningMIN && (
                      <Typography.Text style={{ fontWeight: 500 }}>
                        Pending:
                        <br />
                        {loading === "imeiInfoLoading" ? (
                          <Skeleton.Input
                            loading={loading === "imeiInfoLoading"}
                            active={true}
                            block
                          />
                        ) : (
                          previousCount.pending
                        )}
                      </Typography.Text>
                    )}
                  </Col>

                  <Col span={12}>
                    {scanningMIN && (
                      <Typography.Text style={{ fontWeight: 500 }}>
                        Scanned:
                        <br />
                        {loading === "imeiInfoLoading" ? (
                          <Skeleton.Input
                            loading={loading === "imeiInfoLoading"}
                            active={true}
                            block
                          />
                        ) : (
                          imeiArr.length
                        )}
                      </Typography.Text>
                    )}
                  </Col>
                </Row>
              </CustomFieldBox>
            </Col>
            <Col span={24}>
              <CustomFieldBox>
                <Col style={{ overflow: "auto", height: "93%" }} span={24}>
                  {imeiArr.map((imei) => (
                    <Row>
                      <Typography.Text style={{ margin: "5px 0" }}>
                        {imei}
                      </Typography.Text>
                    </Row>
                  ))}
                </Col>
              </CustomFieldBox>
            </Col>

            <Col span={24}>
              <Col span={24}>
                <Row justify="end">
                  <CustomButton
                    size="small"
                    title={"Submit"}
                    onclick={validateHandler}
                    disabled={imeiArr.length === 0}
                  />
                </Row>
              </Col>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default MINRegister;
