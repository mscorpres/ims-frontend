import React, { useEffect, useState } from "react";
import { Button, Card, Col, Drawer, Input, Row, Space } from "antd";
import { v4 } from "uuid";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { PlusSquareFilled, MinusSquareFilled } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading";
import FormTable from "../../../Components/FormTable";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";

export default function EditBankVoucher({
  editVoucher,
  setEditVoucher,
  voucherType,
  getRows,
}) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [bank, setBank] = useState(null);
  const [journalRows, setJounralRows] = useState([
    {
      id: v4(),
      glCode: "",
      debit: "",
      credit: "",
      comment: "",
    },
    {
      id: v4(),
      glCode: "",
      debit: "",
      credit: "",
      comment: "",
    },
    { id: v4(), total: true, debit: 0, credit: 0 },
  ]);
  const addRows = () => {
    setJounralRows([
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
        type: "new",
      },
      ...journalRows,
    ]); // add a new row
  };
  const removeRow = (id) => {
    setJounralRows(journalRows.filter((row) => row.id !== id)); // remove the row
  };
  const submitHandler = async () => {
    if (!effectiveDate) {
      return toast.error("Please select Effective date");
    }
    let paymentLabel = voucherType === "bank-payment" ? "debit" : "credit";
    let finalObj = {
      v_code: editVoucher,
      account: bank.value,
      effective_date: effectiveDate,
      gls: [],
      [paymentLabel]: [],
      comment: [],
      tras_id: [],
    };

    let problem = null;
    journalRows.map((row, index) => {
      if (row.glCode == "") {
        problem = "gls";
      } else if (row.payment == "") {
        problem = "payment";
      } else {
        if (index < journalRows.length - 1) {
          finalObj = {
            ...finalObj,
            gls: [...finalObj.gls, row.glCode.value],
            [paymentLabel]: [...finalObj[paymentLabel], row.payment],
            // credit: [...finalObj.credit, row.credit == "" ? 0 : row.credit],
            // debit: [...finalObj.debit, row.debit == "" ? 0 : row.debit],
            comment: [...finalObj.comment, row.comment],
            tras_id: [...finalObj.tras_id, row.transactionId ?? "--"],
          };
        }
      }
    });
    finalObj.gls = finalObj.gls.reverse();
    if (finalObj.debit) {
      finalObj.debit = finalObj.debit.reverse();
    } else {
      finalObj.credit = finalObj.credit.reverse();
    }
    finalObj.comment = finalObj.comment.reverse();
    finalObj.tras_id = finalObj.tras_id.reverse();
    if (!problem) {
      let link = "";
      if (voucherType === "bank-payment") {
        link = "/tally/voucher/updateBP";
      } else if (voucherType === "bank-receipt") {
        link = "/tally/voucher/updateBR";
      }

      setSubmitLoading(true);
      const { data } = await imsAxios.post(link, {
        ...finalObj,
      });
      setSubmitLoading(false);
      if (data.code == 200) {
        // resetHandler();
        toast.success(data.message);
        getRows();
        setTimeout(() => {
          setEditVoucher(null);
        }, 3000);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      if (problem == "gls") {
        return toast.error("All entries should have a gls");
      } else if (problem == "payment") {
        return toast.error("All entries should have a payment amount");
      }
    }
  };
  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (!data.msg) {
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getHeaderAccount = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/voucher/bank_header", {
      search: search,
    });
    setSelectLoading(false);
    const arr = data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      field: "actions",
      width: 40,
      renderCell: ({ row }) =>
        row.type === "new" && (
          <CommonIcons action="removeRow" onClick={() => removeRow(row.id)} />
        ),
    },

    {
      headerName: "GL Code",
      field: "glCode",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) =>
        row.total ? (
          <span
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          >
            Total
          </span>
        ) : (
          <MyAsyncSelect
            onBlur={() => setAsyncOptions([])}
            value={row?.glCode}
            labelInValue
            onChange={(value) => {
              inputHandler("glCode", value, row?.id);
            }}
            selectLoading={selectLoading}
            optionsState={asyncOptions}
            loadOptions={getLedger}
            placeholder="Select G/L..."
          />
        ),
    },

    {
      headerName: "Payment",
      field: "payment",
      width: 150,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          value={row.total ? paymentTotal?.toFixed(2) : row.payment}
          onChange={(e) => inputHandler("payment", e.target.value, row.id)}
          disabled={row.total}
        />
      ),
    },
    {
      headerName: "Comment",
      // width: "20.5vw",
      field: "comment",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) =>
        !row.total && (
          <Input
            onChange={(e) => {
              inputHandler("comment", e.target.value, row.id);
            }}
            value={row?.comment}
            name="comment"
            id={row.id}
          />
        ),
    },
  ];
  const getVoucherDetails = async () => {
    setLoading(true);
    let link;
    if (voucherType === "bank-payment") {
      link = "/tally/voucher/editBP";
    } else if (voucherType === "bank-receipt") {
      link = "/tally/voucher/editBR";
    }
    const { data } = await imsAxios.post(link, {
      v_code: editVoucher,
    });
    setLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          id: v4(),
          glCode: { value: row.particular_key, label: row.particular },
          payment: row.payment,

          comment: row.comment,
          transactionId: row.tras_id,
        };
      });
      arr = [...arr, { id: v4(), total: true, debit: 0, credit: 0 }];
      setJounralRows(arr);
      setBank({ value: data.data[0].bank_key, label: data.data[0].bank_name });
      setEffectiveDate(data.data[0].ref_date);
    } else {
      toast.error(data.message.msg);
      setEditVoucher(null);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = journalRows;
    arr = arr.map((row) => {
      let obj = row;
      if (obj.id == id) {
        return {
          ...obj,
          [name]: value,
        };
      } else {
        return obj;
      }
    });
    setJounralRows(arr);
  };
  useEffect(() => {
    if (editVoucher) {
      getVoucherDetails();
    }
  }, [editVoucher]);
  useEffect(() => {
    let payment = [];

    payment = journalRows.map((row, index) => {
      if (index < journalRows.length - 1) {
        return row.payment;
      } else {
        return 0;
      }
    });
    setPaymentTotal(
      payment.reduce((partialSum, a) => {
        return partialSum + Number(a);
      }, 0)
    );
  }, [journalRows]);
  return (
    <Drawer
      title={`Updating Voucher ${editVoucher}`}
      placement="right"
      width="60vw"
      style={{ height: "100vh" }}
      onClose={() => {
        setEditVoucher(null);
      }}
      open={editVoucher}
      extra={
        <Button type="primary" loading={submitLoading} onClick={submitHandler}>
          Submit
        </Button>
      }
    >
      {loading ? (
        <Loading />
      ) : (
        <Row gutter={[0, 4]} style={{ paddingBottom: 10, height: "100%" }}>
          <Col span={24} style={{ height: "5%" }}>
            <Row>
              <Space>
                <Col span={24}>
                  <MyAsyncSelect
                    size="default"
                    sectLoading={selectLoading}
                    optionsState={asyncOptions}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={getHeaderAccount}
                    value={bank}
                    labelInValue
                    placeholder="Select Account.."
                    onChange={(value) => setBank(value)}
                  />
                </Col>
                <Col span={24}>
                  <SingleDatePicker
                    setDate={setEffectiveDate}
                    placeholder="Select Effective Date.."
                    selectedDate={effectiveDate}
                    value={effectiveDate}
                    showValue={effectiveDate}
                  />
                </Col>
              </Space>
            </Row>
          </Col>
          <Col style={{ height: "95%" }} span={24}>
            <Card
              size="small"
              style={{ height: "100%" }}
              bodyStyle={{ padding: 0, maxHeight: "80%" }}
            >
              <FormTable data={journalRows} columns={columns} />
            </Card>
          </Col>
        </Row>
      )}
    </Drawer>
  );
}
