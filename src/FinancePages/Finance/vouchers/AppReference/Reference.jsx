import { useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Row,
  Input,
  Typography,
  Modal,
  Popover,
  Space,
  Switch,
  Upload,
  message,
  Form,
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  DownloadOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { async } from "q";
import MyButton from "../../../../Components/MyButton";

export default function Reference() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showSubmitConfir, setShowSubmitConfirm] = useState(false);

  const [vbtRows, setVBTRows] = useState([]);
  const [bpRows, setBPRows] = useState([]);

  const [totalVBTSelectedAmount, setTotalVBTSelectedAmount] = useState(0);
  const [totalBPSelectedAmount, setTotalBpSelectedAmount] = useState(0);
  const [showZeroVBTRows, setShowZeroVBTRows] = useState(false);
  const [showZeroBpRows, setShowZeroBpRows] = useState(false);
  const [zeroVbtRows, setZeroVbtRows] = useState([]);
  const [zeroBpRows, setZeroBpRows] = useState([]);
  const [fileList, setFileList] = useState([
    {
      uid: "-1",
      name: "xxx.png",
      status: "done",
      url: "http://www.baidu.com/xxx.png",
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  // const []
  const [uploadForm] = Form.useForm();
  const getVendorOptions = async (search) => {
    setAsyncOptions([]);
    setLoading("select");
    const response = await imsAxios.post("/tally/ap/fetchVendorLedger", {
      search: search,
    });
    setLoading(false);
    const { data } = response;
    if (data.length) {
      const arr = data.map((item) => ({
        text: item.text,
        value: item.id,
      }));
      setAsyncOptions(arr);
    }
  };
  const filterZeroVBTRows = (rows, status) => {
    console.log(rows);
    if (status) {
      const arr = [...rows, ...zeroVbtRows];
      setVBTRows(arr);
    } else {
      const arr = rows.filter(
        (item) =>
          item.os_amm === "0" || item.os_amm === "-0" || item.os_amm === 0
      );
      let arr1 = [];
      rows.map((row) => {
        if ((row.os_amm != "0" && row.os_amm != "-0") || row.os_amm != 0) {
          arr1.push(row);
        }
      });
      setVBTRows(arr1);
      setZeroVbtRows(arr);
    }
  };
  const filterZeroBPRows = (rows, status) => {
    if (status) {
      const arr = [...rows, ...zeroBpRows];
      setBPRows(arr);
    } else {
      const arr = rows.filter(
        (item) => item.os_amm === "0" || item.os_amm === "-0"
      );
      let arr1 = [];
      rows.map((row) => {
        if (row.os_amm != "0" && row.os_amm != "-0") {
          arr1.push(row);
        }
      });
      setBPRows(arr1);
      setZeroBpRows(arr);
    }
  };
  const resetForm = () => {
    uploadForm.resetFields();
  };
  const getVBTRows = async () => {
    setShowUploadFile(false);
    setUploadFile(false);
    resetForm();
    setVBTRows([]);
    setBPRows([]);
    setZeroBpRows([]);
    setZeroVbtRows([]);
    setLoading("fetching");
    const response = await imsAxios.post("/tally/ap/fetchApData", {
      vendor: searchTerm,
    });
    setLoading(false);
    const { data } = response;
    if (data.code === 200) {
      const arr = data.bill_data.map((item, index) => ({
        ...item,
        id: v4(),
        index: index + 1,
        selectedAmmount: 0,
        selected: false,
      }));
      const bpArr = data.voucher_data.map((item, index) => ({
        ...item,
        id: v4(),
        index: index + 1,
        selected: false,
      }));
      setShowZeroBpRows(false);
      setShowZeroVBTRows(false);

      // setVBTRows(arr);
      filterZeroVBTRows(arr, false);
      filterZeroBPRows(bpArr, false);
      // setBPRows(bpArr);
    }
  };
  // handlet vbt amount change
  const inputHandler = (value, id) => {
    const arr = vbtRows.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          selectedAmount: value,
        };
      } else {
        return item;
      }
    });

    setVBTRows(arr);
  };
  // handle checkbox change
  const handleVBTSelection = (id) => {
    if (uploadFile == true) {
      const arr = vbtRows.map((item) => {
        if (item.id === id) {
          let val = item.selectedAmount;
          if (!item.selected) {
            val = item.selectedAmount;
          }
          // else {
          //   val = "";
          // }
          return {
            ...item,
            selected: !item.selected,
            selectedAmount: val,
          };
        } else {
          return item;
        }
      });

      setVBTRows(arr);
    } else {
      const arr = vbtRows.map((item) => {
        if (item.id === id) {
          let val = "";
          if (!item.selected) {
            val = item.os_amm;
          } else {
            val = "";
          }
          return {
            ...item,
            selected: !item.selected,
            selectedAmount: val,
          };
        } else {
          return item;
        }
      });

      setVBTRows(arr);
    }
  };
  // handle checkbox change
  const handleBPSelection = (id) => {
    const arr = bpRows.map((item) => {
      if (item.id === id) {
        let val = "";
        if (!item.selected) {
          val = item.selectedAmount;
        } else {
          val = "";
        }
        return {
          ...item,
          selected: !item.selected,
          selectedAmount: val,
        };
      } else {
        return {
          ...item,
          selected: false,
          selectedAmount: item.selectedAmount,
        };
      }
    });

    setBPRows(arr);
  };

  // submit handler
  const submitHandler = async () => {
    const selectedVBTRows = vbtRows.filter((item) => item.selected);
    const selectedBankRows = bpRows.filter((item) => item.selected);
    setLoading("submit");
    const response = await imsAxios.post("/tally/ap/insertAp", {
      ref_no: selectedVBTRows.map((item) => item.v_key), //selected vbt arr
      poID: selectedVBTRows.map((item) => item.po_id), //vbt po id
      project: selectedVBTRows.map((item) => item.project), //vbt project
      os_ammount: selectedVBTRows.map((item) => item.selectedAmount), //selected vbt entered amount
      so_ref_no: selectedBankRows.map((item) => item.voucher_code), //seected bank voucher number single
      so_ammount: selectedBankRows.map((item) => item.os_amm), //selected bank voucher amount single
      vendor: searchTerm,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        setShowSubmitConfirm(false);
        getVBTRows();
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const content = (
    <div style={{ maxWidth: 350, maxHeight: 400, overflow: "hidden" }}>
      <Row style={{ maxHeight: 400, overflowY: "auto", overflowX: "hidden" }}>
        {vbtRows.filter((item) => item.selected).length > 0 && (
          <>
            <Col span={2}>#</Col>
            <Col span={12}>
              <Typography.Text strong>Invoice Number</Typography.Text>
            </Col>
            <Col span={10}>
              <Typography.Text strong>Amount</Typography.Text>
            </Col>
          </>
        )}
        {vbtRows.filter((item) => item.selected).length > 0 ? (
          vbtRows
            .filter((item) => item.selected)
            .map((item, index) => (
              <>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    {index + 1}
                  </Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text>{item.invoice_number}</Typography.Text>
                </Col>
                <Col span={10}>
                  <Typography.Text>{item.selectedAmount}</Typography.Text>
                </Col>
              </>
            ))
        ) : (
          <Typography.Text strong type="secondary">
            No VBT selected...
          </Typography.Text>
        )}
      </Row>
    </div>
  );
  // left vbt columns
  const leftColumns = [
    {
      headerName: "#",
      field: "index",
      renderCell: ({ row }) => row.index,
      width: 30,
    },
    {
      headerName: "",
      field: "check",
      renderCell: ({ row }) => (
        <Checkbox
          onChange={() => handleVBTSelection(row.id)}
          checked={row.selected}
        />
      ),
      width: 30,
    },
    {
      headerName: "Invoice Date",
      field: "invoice_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_date} />,
      width: 100,
    },
    {
      headerName: "Invoice",
      field: "invoice_number",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_number} />,
      width: 210,
    },
    {
      headerName: "O/S Amount",
      field: "selectedAmount",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler(e.target.value, row.id)}
          value={row.selectedAmount}
        />
      ),
      width: 150,
    },
    {
      headerName: "O/S Amount / Bill Amount",
      field: "ammount",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.os_amm + " / " + row.ammount} />
      ),
      width: 150,
    },
    {
      headerName: "Settled Amount",
      field: "clear_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clear_amm} />,
      width: 120,
    },
    {
      headerName: "Total Bill Amount",
      field: "totalBillAmount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.totalBillAmount} />,
      width: 120,
    },
    {
      headerName: "VBT No.",
      field: "v_key",
      renderCell: ({ row }) => <ToolTipEllipses text={row.v_key} />,
      width: 150,
    },
    {
      headerName: "Project",
      field: "project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project} />,
      width: 100,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      width: 100,
    },
    {
      headerName: "PO ID",
      field: "po_id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_id} />,
      width: 100,
    },
  ];
  // left vbt columns
  // const leftColumnsforCSV = [
  //   {
  //     headerName: "InvoiceDate",
  //     field: "invoice_date",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_date} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "Invoice",
  //     field: "invoice_number",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_number} />,
  //     width: 180,
  //   },

  //   {
  //     headerName: "O/SAmount/Bill Amount",
  //     field: "os_amm",
  //     renderCell: ({ row }) => (
  //       <ToolTipEllipses text={row.os_amm + " / " + row.ammount} />
  //     ),
  //     width: 150,
  //   },
  //   {
  //     headerName: "SettledAmount",
  //     field: "clear_amm",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.clear_amm} />,
  //     width: 120,
  //   },
  //   {
  //     headerName: "TotalBillAmount",
  //     field: "totalBillAmount",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.totalBillAmount} />,
  //     width: 120,
  //   },
  //   {
  //     headerName: "VBTNo.",
  //     field: "v_key",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.v_key} />,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Project",
  //     field: "project",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.project} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "CostCenter",
  //     field: "cost_center",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "POID",
  //     field: "po_id",
  //     renderCell: ({ row }) => <ToolTipEllipses text={row.po_id} />,
  //     width: 100,
  //   },
  //   {
  //     headerName: "osAmount",
  //     // field: "invoice_number",
  //     // renderCell: ({ row }) => (
  //     // <Input
  //     //   onChange={(e) => inputHandler(e.target.value, row.id)}
  //     //   value={row.selectedAmount}
  //     // />
  //     // ),
  //     width: 150,
  //   },
  // ];

  const leftColumnsforCSV = [
    {
      headerName: "invoiceDate",
      field: "invoice_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_date} />,
      width: 100,
    },
    {
      headerName: "invoiceNo",
      field: "invoice_number",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_number} />,
      width: 180,
    },

    {
      headerName: "pendingAmount",
      field: "os_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.os_amm} />,
      width: 150,
    },
    {
      headerName: "billAmount",
      field: "ammount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ammount} />,
      width: 150,
    },
    {
      headerName: "settledAmount",
      field: "clear_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clear_amm} />,
      width: 120,
    },
    {
      headerName: "totalBillAmount",
      field: "totalBillAmount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.totalBillAmount} />,
      width: 120,
    },
    {
      headerName: "vbtNo",
      field: "v_key",
      renderCell: ({ row }) => <ToolTipEllipses text={row.v_key} />,
      width: 150,
    },
    {
      headerName: "project",
      field: "project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project} />,
      width: 100,
    },
    {
      headerName: "costCenter",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      width: 100,
    },
    {
      headerName: "poID",
      field: "po_id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_id} />,
      width: 100,
    },
    {
      headerName: "osAmount",
      // field: "invoice_number",
      // renderCell: ({ row }) => (
      // <Input
      //   onChange={(e) => inputHandler(e.target.value, row.id)}
      //   value={row.selectedAmount}
      // />
      // ),
      width: 150,
    },
  ];
  const leftColumnsAfterUpload = [
    {
      headerName: "#",
      field: "index",
      renderCell: ({ row }) => row.index,
      width: 30,
    },
    {
      headerName: "",
      field: "check",
      renderCell: ({ row }) => (
        <Checkbox
          onChange={() => handleVBTSelection(row.id)}
          checked={row.selected}
        />
      ),
      width: 30,
    },
    {
      headerName: "Invoice Date",
      field: "invoice_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_date} />,
      width: 100,
    },
    {
      headerName: "Invoice",
      field: "invoice_number",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_number} />,
      width: 180,
    },
    {
      headerName: "O/S Amount",
      field: "selectedAmount",
      renderCell: ({ row }) => (
        <ToolTipEllipses disabled text={row.selectedAmount} />
      ),
      width: 150,
    },
    {
      headerName: "O/S Amount / Bill Amount",
      field: "ammount",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.os_amm + " / " + row.ammount} />
      ),
      width: 150,
    },
    {
      headerName: "Settled Amount",
      field: "clear_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clear_amm} />,
      width: 120,
    },
    {
      headerName: "Total Bill Amount",
      field: "totalBillAmount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.totalBillAmount} />,
      width: 120,
    },
    {
      headerName: "VBT No.",
      field: "v_key",
      renderCell: ({ row }) => <ToolTipEllipses text={row.v_key} />,
      width: 150,
    },
    {
      headerName: "Project",
      field: "project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project} />,
      width: 100,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      width: 100,
    },
    {
      headerName: "PO ID",
      field: "po_id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_id} />,
      width: 100,
    },
  ];

  // right bp columns
  const rightColumns = [
    {
      headerName: "#",
      field: "index",
      // renderCell: ({ row }) => row.index,
      width: 30,
    },
    {
      headerName: "",
      field: "check",
      renderCell: ({ row }) => (
        <Checkbox
          onChange={() => handleBPSelection(row.id)}
          checked={row.selected}
        />
      ),
      width: 30,
    },
    {
      headerName: "Voucher Code",
      field: "voucher_code",
      renderCell: ({ row }) => <ToolTipEllipses text={row.voucher_code} />,
      width: 150,
    },
    {
      headerName: "Payment Amount",
      field: "bank_amount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.bank_amount} />,
      width: 150,
    },
    {
      headerName: "Settled Amount",
      field: "so_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.so_amm ?? 0} />,
      width: 150,
    },
    {
      headerName: "O/S Amount",
      field: "os_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.os_amm} />,
      width: 150,
    },

    {
      headerName: "Bank",
      field: "bank",
      renderCell: ({ row }) => <ToolTipEllipses text={row.bank} />,
      width: 200,
    },
    {
      headerName: "Effective Date",
      field: "effective_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.effective_date} />,
      width: 100,
    },
    {
      headerName: "Project",
      field: "projectCode",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.projectCode} copy={true} />
      ),
      width: 100,
    },
  ];
  const getUploadFilePreview = () => {};
  const handleDownloadExcel = () => {
    console.log("vbt rows---------", vbtRows);
    console.log("left columns for csv---------", leftColumnsforCSV);
    downloadCSV(vbtRows, leftColumnsforCSV, "app payment setup");
  };

  const props = {
    multiple: false,
    maxCount: 1,
    beforeUpload(file) {
      uploadButton(file);
      return false;
    },
  };
  const uploadButton = async (finalfile) => {
    const formData = new FormData();
    formData.append("file", finalfile);
    const response = await imsAxios.post("/tally/ap/fetchApDataFile", formData);
    if (response.status === 200 || response.status === "200") {
      setUploadFile(true);
      const { data } = response;
      let arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });

      setVBTRows(arr);
    }
  };
  useEffect(() => {
    if (uploadFile == true) {
      setShowUploadFile(true);
    }
  }, [setUploadFile]);

  useEffect(() => {
    const selectedVBTRows = vbtRows.filter((item) => item.selected);
    const vbtTotal = add(selectedVBTRows.map((item) => item.selectedAmount));
    setTotalVBTSelectedAmount(vbtTotal);
  }, [vbtRows]);

  useEffect(() => {
    const selectedBankRows = bpRows.filter((item) => item.selected);
    const bpTotal = add(selectedBankRows.map((item) => item.os_amm));
    // setSelectedBpVoucherNo(selectedBankRows.map((item) => item.voucher_code));
    setTotalBpSelectedAmount(bpTotal);
  }, [bpRows]);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 120000);
    }
  }, [loading]);

  // function to add all the values in an array
  const add = (arr) => {
    return arr.reduce(
      (a, b) => +Number(a).toFixed(2) + +Number(b).toFixed(2),
      0
    );
  };

  return (
    <div style={{ height: "90%", padding: "0px 10px" }}>
      <Row gutter={6} style={{ marginTop: "5px" }}>
        <Col></Col>
        <Col span={4}>
          <MyAsyncSelect
            selectLoading={loading === "select"}
            loadOptions={getVendorOptions}
            optionsState={asyncOptions}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Col>
        <Col span={1}>
          <MyButton onClick={getVBTRows} type="primary" variant="search">
            Fetch
          </MyButton>
        </Col>

        {vbtRows.length > 0 ? (
          <>
            <Col style={{ marginLeft: "14px" }}>
              <Button
                // type="secondary"
                disabled={vbtRows.length < 0}
                icon={<DownloadOutlined />}
                onClick={handleDownloadExcel}
              ></Button>
            </Col>
            {/* upload file */}
            <Col span={4} style={{ marginLeft: "6px" }}>
              <Form
                span={4}
                form={uploadForm}
                style={{ marginRight: 45, align: "middle" }}
              >
                <Form.Item name="dragger">
                  <Upload name="files" {...props}>
                    <Button icon={<UploadOutlined />}></Button>
                  </Upload>
                </Form.Item>
              </Form>
            </Col>
          </>
        ) : (
          <Col span={4}></Col>
        )}

        <Col span={4}>
          <Space>
            <Popover
              content={content}
              title={`Selected Invoice Numbers --  (${
                vbtRows.filter((item) => item.selected).length
              })`}
            >
              <InfoCircleOutlined style={{ cursor: "pointer" }} />
            </Popover>
            <Typography.Text strong>
              VBT Amount: {Number(totalVBTSelectedAmount).toFixed(2)}
            </Typography.Text>
          </Space>
        </Col>
        <Col span={4}>
          <Typography.Text
            strong
            style={{
              color:
                totalBPSelectedAmount - totalVBTSelectedAmount >= 0
                  ? "green"
                  : "brown",
            }}
          >
            Remaining:{" "}
            {Number(totalBPSelectedAmount - totalVBTSelectedAmount).toFixed(2)}
          </Typography.Text>
        </Col>
        <Col span={4}>
          <Typography.Text strong>
            Payments Amount: {+Number(totalBPSelectedAmount).toFixed(2)}
          </Typography.Text>
        </Col>
        <Col span={1}>
          <Button
            disabled={
              totalBPSelectedAmount - totalVBTSelectedAmount < 0 ||
              vbtRows.filter((item) => item.selected).length === 0
            }
            onClick={() => setShowSubmitConfirm(true)}
            type="primary"
          >
            Settle
          </Button>
        </Col>
      </Row>
      <Row gutter={6} style={{ height: "85%", paddingTop: 5 }}>
        <Col span={12} style={{ height: "100%" }}>
          {/* <FormTable data={vbtRows} columns={leftColumns} /> */}
          {uploadFile == true ? (
            <MyDataTable
              loading={loading === "fetching"}
              data={vbtRows}
              columns={leftColumnsAfterUpload}
            />
          ) : (
            <MyDataTable
              loading={loading === "fetching"}
              data={vbtRows}
              columns={leftColumns}
            />
          )}

          <Row
            style={{ marginTop: 10, padding: "0px 10px" }}
            justify="space-between"
          >
            <Col>
              <Typography.Text strong>Total Bill Amount : </Typography.Text>
              {vbtRows.reduce(
                (a, b) =>
                  +Number(a).toFixed(2) +
                  (+Number(b["ammount"]).toFixed(2) || 0),
                0
              )}
            </Col>
            <Col>
              <Typography.Text strong style={{ marginRight: 10 }}>
                Include Entries with 0 OS Amount
              </Typography.Text>
              <Switch
                onChange={(value) => {
                  filterZeroVBTRows(vbtRows, value);
                  setShowZeroVBTRows(value);
                }}
                checked={showZeroVBTRows}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <MyDataTable
            loading={loading === "fetching"}
            data={bpRows}
            columns={rightColumns}
          />
          <Row style={{ marginTop: 10 }} justify="space-between">
            <Col>
              <Typography.Text strong>Total Payment Amount : </Typography.Text>
              {bpRows.reduce(
                (a, b) =>
                  +Number(a).toFixed(2) +
                  (+Number(b["bank_amount"]).toFixed(2) || 0),
                0
              )}
            </Col>
            <Col>
              <Typography.Text strong style={{ marginRight: 10 }}>
                Include Entries with 0 OS Amount
              </Typography.Text>
              <Switch
                onChange={(value) => {
                  filterZeroBPRows(bpRows, value);
                  setShowZeroBpRows(value);
                }}
                checked={showZeroBpRows}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        title="Are you sure you want to set off the following invoices with the following vouchers"
        open={showSubmitConfir}
        width={900}
        onOk={submitHandler}
        confirmLoading={loading === "submit"}
        onCancel={() => setShowSubmitConfirm(false)}
      >
        <Row gutter={16} style={{ paddingTop: 20 }}>
          <Col span={12}>
            <Row>
              <Col span={12}>
                <Typography.Text strong>Invoice Number</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Amount</Typography.Text>
              </Col>
              {vbtRows
                .filter((item) => item.selected)
                .map((item) => (
                  <>
                    <Col span={12}>
                      <Typography.Text>{item.invoice_number}</Typography.Text>
                    </Col>
                    <Col span={12}>
                      <Typography.Text>{item.selectedAmount}</Typography.Text>
                    </Col>
                  </>
                ))}
              <Col span={12}>
                <Typography.Text strong>Total Amount</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>
                  {totalVBTSelectedAmount}
                </Typography.Text>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={12}>
                <Typography.Text strong>Voucher Number</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Amount</Typography.Text>
              </Col>
              {bpRows
                .filter((item) => item.selected)
                .map((item) => (
                  <>
                    <Col span={12}>
                      <Typography.Text>{item.voucher_code}</Typography.Text>
                    </Col>
                    <Col span={12}>
                      <Typography.Text>{item.os_amm}</Typography.Text>
                    </Col>
                  </>
                ))}
              <Col span={12}>
                <Typography.Text strong>Total Amount</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>
                  {totalBPSelectedAmount}
                </Typography.Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
