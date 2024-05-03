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
import MyDataTable from "../../../../Components/MyDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import { convertSelectOptions } from "../../../../utils/general.ts";
import { getVendorOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import MyButton from "../../../../Components/MyButton";

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
    { headerName: "S. No.", width: 60, field: "index" },
    { headerName: "SKU", width: 100, field: "sku" },
    {
      headerName: "MIN ID",
      width: 150,
      field: "txn",
      renderCell: ({ row }) => <ToolTipEllipses text={row.txn} copy={true} />,
    },
    {
      headerName: "Component",
      width: 180,
      field: "product",
      renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
    },
    {
      headerName: "Vendor Code",
      width: 120,
      field: "vcode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vcode} copy={true} />,
    },
    {
      headerName: "Vendor",
      width: 180,
      field: "vname",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vname} />,
    },
    { headerName: "Qty", width: 120, field: "qty" },
    { headerName: "UoM", width: 80, field: "uom" },
    {
      headerName: "In Date",
      width: 150,
      field: "indt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.indt} />,
    },
    {
      headerName: "In By",
      width: 150,
      field: "inby",
      renderCell: ({ row }) => <ToolTipEllipses text={row.inby} />,
    },
    {
      headerName: "Actions",
      type: "actions",
      width: 80,
      getActions: ({ row }) => [
        <TableActions action="scan" onClick={() => fetchIMEINumbers(row)} />,
      ],
    },
  ];

  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  useEffect(() => {
    setImeiArr([]);
  }, [scanningMIN]);
  return (
    <div style={{ height: "90%" }}>
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
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
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
            <MyButton
              variant="search"
              disabled={
                !wise || !searchInput || searchInput === "" ? true : false
              }
              type="primary"
              loading={loading === "fetch"}
              onClick={getRows}
              id="submit"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        {/* <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col> */}
      </Row>
      <Row gutter={6} style={{ height: "95%", padding: "0px 10px" }}>
        <Col span={18} style={{ height: "100%" }}>
          <MyDataTable columns={columns} rows={rows} />
        </Col>
        <Col span={6} style={{ height: "100%" }}>
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
          <Card onClick={() => hiddenImeiInputRef.current.focus()} size="small">
            <Typography.Text style={{ fontWeight: 600 }}>{`Scanning MIN : ${
              scanningMIN ? scanningMIN : ""
            }`}</Typography.Text>
          </Card>
          <Row style={{ height: "93%" }}>
            <Card
              size="small"
              style={{ width: "100%", height: 150 }}
              bodyStyle={{ width: "100%", height: "100%" }}
            >
              <Col span={24}>
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
              </Col>
            </Card>
            <Col span={24}>
              <Card
                size="small"
                style={{ height: "100%" }}
                bodyStyle={{ height: "100%" }}
              >
                <Col style={{ overflow: "auto", height: "93%" }} span={24}>
                  {imeiArr.map((imei) => (
                    <Row>
                      <Typography.Text style={{ margin: "5px 0" }}>
                        {imei}
                      </Typography.Text>
                    </Row>
                  ))}
                </Col>
              </Card>
              <Col span={24}>
                <Row justify="end">
                  <Button
                    onClick={validateHandler}
                    disabled={imeiArr.length === 0}
                    type="primary"
                  >
                    Submit
                  </Button>
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
