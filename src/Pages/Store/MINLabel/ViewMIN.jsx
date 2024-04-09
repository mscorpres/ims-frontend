import React from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tooltip,
} from "antd";
import {
  PrinterFilled,
  DownloadOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { useState } from "react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useEffect } from "react";
import { downloadCSV } from "../../../Components/exportToCSV";
import Loading from "../../../Components/Loading";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

export default function ViewMIN() {
  const [searchInput, setSearchInput] = useState("");
  const [showPrintLabels, setShowPrintLabels] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState();
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("datewise");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [getPartLoading, setGetPartLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [printLabelInfo, setPrintLabelInfo] = useState({
    copies_qty: [],
    part_code: [],
    transaction: "",
  });
  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "MIN Wise", value: "minwise" },
  ];
  const getSearchResults = async () => {
    setLoading(true);
    setSearchLoading(true);
    const { data } = await imsAxios.post(
      "/transaction/getMinTransactionByDate",
      {
        wise: wise,
        data: wise == "datewise" ? searchDateRange : searchInput,
      }
    );
    setSearchLoading(false);
    setLoading(false);
    if (data.code === 200) {
      const arr = data.data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });

      setRows(arr);
    } else {
      toast.error(data.message.msg);
    }
  };

  const columns = [
    {
      headerName: "Sr. No.",
      field: "index",
      width: 100,
    },
    {
      headerName: "Actions",
      type: "actions",
      field: "action",
      width: 90,
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // icon={<CloudDownloadOutlined className="view-icon" />}
          onClick={() => downloadMin(row.print_id)}
          disabled={row.invoiceStatus == false}
          label="Download Attachement"
        />,
        <GridActionsCellItem
          showInMenu
          // icon={<PrinterFilled className="view-icon" />}
          onClick={() => printFun(row.print_id)}
          label="Print Attachement"
        />,
        <GridActionsCellItem
          showInMenu
          // icon={<PrinterFilled className="view-icon" />}
          disabled={row.consumptionStatus == false}
          onClick={() => getConsumptionList(row.transaction)}
          label="Consumption List"
        />,
      ],
    },
    {
      headerName: "MIN Date / Time",
      field: "datetime",
      width: 150,
    },
    {
      headerName: "MIN ID",
      field: "print_id",
      renderCell: ({ row }) => (
        <Tooltip title={row.print_id}>
          <span>{row.print_id}</span>
        </Tooltip>
      ),
      width: 150,
    },
    {
      headerName: "Invoice ID",
      field: "invoice",
      width: 150,
    },
    {
      headerName: "Vendor",
      field: "vendorname",
      //   width: 200,
      flex: 1,
    },
    {
      headerName: "Part Code",
      field: "partcode",
      width: 130,
    },
    {
      headerName: "In Qty",
      field: "inqty",
      width: 100,
    },
    {
      headerName: "In Loc",
      field: "location",
      width: 120,
    },
    {
      headerName: "In By",
      field: "inby",
      width: 150,
    },
  ];
  const printFun = async (minId) => {
    setLoading(true);
    const { data } = await imsAxios.post("minPrint/printSingleMin", {
      transaction: minId,
    });
    setLoading(false);
    printFunction(data.data.buffer.data);
  };
  const getTxnId = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("qrLabel/getMinsTransaction", {
      searchTerm: search,
    });
    setSelectLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    }
  };
  const inputHandler = async (name, value, id) => {
    let obj = printLabelInfo;
    if (name == "transaction") {
      setGetPartLoading(true);
      const { data } = await imsAxios.post("/qrLabel/getComponents", {
        transaction: value,
      });
      setGetPartLoading(false);
      obj = {
        ...obj,
        [name]: value,
        part_code: data.data.map((row) => {
          return row.part_code;
        }),
        copies_qty: data.data.map((row) => {
          return { id: row.part_code, qty: "" };
        }),
      };
    } else if (name == "copies_qty") {
      obj = {
        ...obj,
        copies_qty: obj.copies_qty.map((row) => {
          if (row.id == id) {
            return {
              ...row,
              qty: value,
            };
          } else {
            return row;
          }
        }),
      };
    }
    setPrintLabelInfo(obj);
  };
  const printLabels = async () => {
    let validate = false;
    if (printLabelInfo.copies_qty.length == 0) {
      return toast.error("Please Enter items quantity");
    } else if (printLabelInfo.transaction == 0) {
      return toast.error("Please select MIN Number");
    }

    printLabelInfo.copies_qty.map((row) => {
      if (row.qty != 0 || row.qty.length > 0) {
        validate = true;
      }
    });
    let obj = printLabelInfo.copies_qty.map((row) => {
      return row.qty;
    });
    if (validate == false) {
      return toast.error("Please Enter quantity for at least one item");
    }
    setPrintLoading(true);
    const { data } = await imsAxios.post("qrLabel/generateQR", {
      ...printLabelInfo,
      copies_qty: obj,
    });
    if (data.code == 200) {
      printFunction(data.data.buffer.data);
      setPrintLoading(false);
      setShowPrintLabels(false);
      setPrintLabelInfo({
        copies_qty: [],
        part_code: [],
        transaction: "",
      });
    } else {
      toast.error(data.message.msg);
    }
  };
  const downloadLabels = async () => {
    let validate = false;
    if (printLabelInfo.copies_qty.length == 0) {
      return toast.error("Please Enter items quantity");
    } else if (printLabelInfo.transaction == 0) {
      return toast.error("Please select MIN Number");
    }

    printLabelInfo.copies_qty.map((row) => {
      if (row.qty != 0 || row.qty.length > 0) {
        validate = true;
      }
    });
    let obj = printLabelInfo.copies_qty.map((row) => {
      return row.qty;
    });
    if (validate == false) {
      return toast.error("Please Enter quantity for at least one item");
    }
    setDownloadLoading(true);
    const { data } = await imsAxios.post("qrLabel/generateQR", {
      ...printLabelInfo,
      copies_qty: obj,
    });
    if (data.code == 200) {
      downloadFunction(data.data.buffer.data, "MIN labels");
      setDownloadLoading(false);
      setShowPrintLabels(false);
      setPrintLabelInfo({
        copies_qty: [],
        part_code: [],
        transaction: "",
      });
    } else {
      toast.error(data.message.msg);
    }
  };
  const col = [
    {
      headerName: "MIN Date / Time",
      field: "date",
      width: 150,
    },
    {
      headerName: "MIN by",
      field: "by",
      width: 150,
    },
    {
      headerName: "Part Name",
      field: "partName",
      width: 150,
    },
    {
      headerName: "Part Code",
      field: "partCode",
      width: 150,
    },
    {
      headerName: "Cat PartCode",
      field: "catPartCodeate",
      width: 150,
    },
    {
      headerName: "Qty",
      field: "qty",
      width: 150,
    },
    {
      headerName: "UoM",
      field: "uom",
      width: 150,
    },
  ];
  const downloadMin = async (minId) => {
    // downlaod for single min
    const filename = minId;
    setLoading(true);
    const { data } = await imsAxios.post("minPrint/printSingleMin", {
      transaction: minId,
    });
    if (data.code == 200) {
      downloadFunction(data.data.buffer.data, filename);
      setLoading(false);
    } else {
      toast.error(data.message.msg);
    }
  };
  const getConsumptionList = async () => {
    const response = await imsAxios.post("/jobwork/getjwsfinwardConsumption", {
      minTxn: minId,
    });
    // console.log("repose", response);
    if (response.success) {
      const { data } = response;
      let arr = data.map((r, id) => {
        return {
          ...r,
          id: id + 1,
        };
      });
      downloadCSV(arr, col, "MIN Consumption List");
    } else {
      toast.error(response.message);
    }
    // }
    return;
  };
  useEffect(() => {
    console.log(printLabelInfo);
    setPrintLabelInfo({
      copies_qty: [],
      part_code: [],
      transaction: "",
      setPrintLabelInfo,
    });
  }, [showPrintLabels]);

  return (
    <div style={{ height: "90%" }}>
      <Row
        style={{ padding: "0px 10px", paddingBottom: 5 }}
        justify="space-between"
      >
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size={"default"}
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
                setSearchString={setSearchInput}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <SingleDatePicker
                  size="default"
                  setDate={setSearchDateRange}
                  //   dateRange={searchDateRange}
                  //   value={searchDateRange}
                />
              ) : (
                wise === "minwise" && (
                  <Input
                    style={{ width: "100%" }}
                    type="text"
                    placeholder="Enter MIN Number"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                )
              )}{" "}
            </div>
            <Space>
              <MyButton
                variant="search"
                disabled={
                  wise === "datewise"
                    ? searchDateRange === ""
                      ? true
                      : false
                    : !searchInput
                    ? true
                    : false
                }
                type="primary"
                loading={searchLoading}
                onClick={getSearchResults}
              >
                Search
              </MyButton>
              <Button onClick={() => setShowPrintLabels(true)} type="default">
                Print / Download Labels
              </Button>
            </Space>
          </Space>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => downloadCSV(rows, columns, "MIN Report")}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "95%", padding: "0px 10px" }}>
        <MyDataTable loading={loading} columns={columns} data={rows} />
      </div>
      <Drawer
        title="Print Labels"
        width="30vw"
        confirmLoading={printLoading}
        open={showPrintLabels}
        // onOk={printLabels}

        onClose={() => {
          setShowPrintLabels(false);
        }}
      >
        {getPartLoading && <Loading />}
        <Form
          // form={form}
          layout="horizontal"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item
            // name="Transaction"
            label="Select Transaction"
            rules={[
              {
                required: true,
                message: "Please Select a Transaction!",
              },
            ]}
          >
            <MyAsyncSelect
              size="default"
              selectLoading={selectLoading}
              onBlur={() => setAsyncOptions([])}
              loadOptions={getTxnId}
              onChange={(value) => {
                inputHandler("transaction", value);
              }}
              value={printLabelInfo.transaction}
              optionsState={asyncOptions}
              placeholder="Select Transaction"
            />
          </Form.Item>
        </Form>
        <div style={{ height: "80%", overflowY: "auto" }}>
          {printLabelInfo.copies_qty.length > 0 &&
            printLabelInfo.copies_qty.map((partCode) => {
              return (
                <Form
                  // form={form}

                  layout="horizontal"
                  name="form_in_modal"
                  style={{ paddingRight: 10 }}
                  initialValues={{ modifier: "public" }}
                >
                  <Form.Item
                    name="Quantity"
                    label={`Quantity for ${partCode.id}`}
                  >
                    <Input
                      type="textarea"
                      value={printLabelInfo.copies_qty}
                      onChange={(e) => {
                        inputHandler("copies_qty", e.target.value, partCode.id);
                      }}
                    />
                  </Form.Item>
                </Form>
              );
            })}
        </div>
        <Row style={{ marginTop: 20 }} gutter={6} justify="end">
          <Col>
            <Button type="primary" loading={printLoading} onClick={printLabels}>
              Print Labels
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              loading={downloadLoading}
              onClick={downloadLabels}
            >
              Download Labels
            </Button>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
}
