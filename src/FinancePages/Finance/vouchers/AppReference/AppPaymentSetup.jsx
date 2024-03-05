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
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { InfoCircleOutlined } from "@ant-design/icons";

export default function AppPaymentSetup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showSubmitConfir, setShowSubmitConfirm] = useState(false);

  const [vbtRows, setVBTRows] = useState([]);
  const [bpRows, setBPRows] = useState([]);

  const [totalVBTSelectedAmount, setTotalVBTSelectedAmount] = useState(0);
  const [totalBPSelectedAmount, setTotalBpSelectedAmount] = useState(0);

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

  const getVBTRows = async () => {
    setVBTRows([]);
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
        selected: false,
      }));
      const bpArr = data.voucher_data.map((item, index) => ({
        ...item,
        id: v4(),
        index: index + 1,
        selected: false,
        selectedAmount: 0,
      }));
      setBPRows(bpArr);
      setVBTRows(arr);
    }
  };
  // handlet vbt amount change
  const inputHandler = (value, id) => {
    const arr = bpRows.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          selectedAmount: value,
        };
      } else {
        return item;
      }
    });

    setBPRows(arr);
  };
  // handle checkbox change
  const handleVBTSelection = (id) => {
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
        return {
          ...item,
          selected: false,
          selectedAmount: 0,
        };
      }
    });

    setVBTRows(arr);
  };
  // handle checkbox change
  const handleBPSelection = (id) => {
    const arr = bpRows.map((item) => {
      if (item.id === id) {
        let val = "";
        if (!item.selected) {
          val = item.so_amm;
        } else {
          val = 0;
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

    setBPRows(arr);
  };

  // submit handler
  const submitHandler = async () => {
    const selectedVBTRows = vbtRows.filter((item) => item.selected);
    const selectedBankRows = bpRows.filter((item) => item.selected);
    const obj = {
      ref_no: selectedVBTRows.map((item) => item.v_key), //selected vbt arr,
      os_ammount: selectedVBTRows.map((item) => item.selectedAmount), //selected vbt entered amount,
      so_ref_no: selectedBankRows.map((item) => item.voucher_code), //seected bank voucher number single,
      so_ammount: selectedBankRows.map((item) => item.selectedAmount),
      vendor: searchTerm,
    };

    setLoading("submit");
    const response = await imsAxios.post("/tally/ap/paymentSetup", obj);

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
        {bpRows.filter((item) => item.selected).length > 0 && (
          <>
            <Col span={2}>#</Col>
            <Col span={12}>
              <Typography.Text strong>Voucher Number</Typography.Text>
            </Col>
            <Col span={10}>
              <Typography.Text strong>Amount</Typography.Text>
            </Col>
          </>
        )}
        {bpRows.filter((item) => item.selected).length > 0 ? (
          bpRows
            .filter((item) => item.selected)
            .map((item, index) => (
              <>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    {index + 1}
                  </Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text>{item.voucher_code}</Typography.Text>
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
  // right vbt columns
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
      width: 150,
    },
    {
      headerName: "Invoice",
      field: "invoice_number",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_number} />,
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
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      width: 100,
    },

    {
      headerName: "Clear Amount",
      field: "clear_amm",
      renderCell: ({ row }) => <ToolTipEllipses text={row.clear_amm} />,
      width: 120,
    },
  ];

  // left bp columns
  const leftColumns = [
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
      headerName: "Voucher Number",
      field: "voucher_code",
      renderCell: ({ row }) => <ToolTipEllipses text={row.voucher_code} />,
      width: 150,
    },
    {
      headerName: "Effective Date",
      field: "effective_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.effective_date} />,
      width: 150,
    },

    {
      headerName: "Amount",
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
      headerName: "O/S Amount",
      field: "ammount",
      renderCell: ({ row }) => <ToolTipEllipses text={row.so_amm} />,
      width: 150,
    },
    // {
    //   headerName: "O/S Amount / Bill Amount",
    //   field: "ammount",
    //   renderCell: ({ row }) => (
    //     <ToolTipEllipses text={row.so_amm + " / " + row.ammount} />
    //   ),
    //   width: 150,
    // },

    {
      headerName: "Project",
      field: "projectCode",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.projectCode} copy={true} />
      ),
      width: 100,
    },
  ];
  useEffect(() => {
    const selectedVBTRows = vbtRows.filter((item) => item.selected);
    const vbtTotal = add(selectedVBTRows.map((item) => item.selectedAmount));
    setTotalVBTSelectedAmount(vbtTotal);
  }, [vbtRows]);

  useEffect(() => {
    const selectedBankRows = bpRows.filter((item) => item.selected);
    const bpTotal = add(selectedBankRows.map((item) => item.selectedAmount));
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
      <Row gutter={6} align="middle">
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
          <Button onClick={getVBTRows} type="primary">
            Fetch
          </Button>
        </Col>

        <Col span={6} style={{ marginLeft: 15 }}>
          <Space>
            <Popover
              content={content}
              title={`Selected Invoice Numbers --  (${
                vbtRows.filter((item) => item.selected).length
              })`}
            >
              {" "}
              <InfoCircleOutlined style={{ cursor: "pointer" }} />
              <Typography.Text strong>
                Payments Amount: {totalBPSelectedAmount}
              </Typography.Text>
            </Popover>
          </Space>
        </Col>
        <Col span={5}>
          <Typography.Text
            strong
            style={{
              color:
                totalBPSelectedAmount - totalVBTSelectedAmount < 0
                  ? "green"
                  : "brown",
            }}
          >
            Settle Amount: {totalVBTSelectedAmount - totalBPSelectedAmount}
          </Typography.Text>
        </Col>
        <Col span={5}>
          <Typography.Text strong>
            VBT Amount: {totalVBTSelectedAmount}
          </Typography.Text>
        </Col>
        <Col span={1}>
          <Button
            disabled={
              totalBPSelectedAmount - totalVBTSelectedAmount >= 0 ||
              vbtRows.filter((item) => item.selected).length === 0
            }
            onClick={() => setShowSubmitConfirm(true)}
            type="primary"
          >
            Settle
          </Button>
        </Col>
      </Row>
      <Row gutter={6} style={{ height: "95%", paddingTop: 5 }}>
        <Col span={12} style={{ height: "100%" }}>
          {/* <FormTable data={vbtRows} columns={leftColumns} /> */}
          <MyDataTable
            loading={loading === "fetching"}
            data={bpRows}
            columns={leftColumns}
          />
        </Col>
        <Col span={12}>
          <MyDataTable
            loading={loading === "fetching"}
            data={vbtRows}
            columns={rightColumns}
          />
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
                      <Typography.Text>{item.selectedAmount}</Typography.Text>
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
        </Row>
      </Modal>
    </div>
  );
}
