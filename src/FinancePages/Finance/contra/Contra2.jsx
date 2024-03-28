import React, { useState, useEffect } from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import axios from "axios";
import { toast } from "react-toastify";
import NavFooter from "../../../Components/NavFooter";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { Card, Col, Input, Row } from "antd";
import FormTable from "../../../Components/FormTable";
import { imsAxios } from "../../../axiosInterceptor";

export default function Contra2() {
  const [contraDate, setContraDate] = useState("");
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [contraRows, setContraRows] = useState([
    {
      id: 1,
      account: "",
      debit: "",
      credit: "",
      comment: "",
    },
    {
      id: 2,
      account: "",
      debit: "",
      credit: "",
      comment: "",
    },
    {
      id: 3,
      total: "total",
      account: "",
      debit: "",
      credit: "",
      comment: "",
    },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  let columns = [
    {
      headerName: "GL Code",
      field: "glCode",
      width: 300,
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
            selectLoading={selectLoading}
            onBlur={() => setAsyncOptions([])}
            value={row?.account}
            onChange={(value) => {
              inputHandler("account", value, row?.id);
            }}
            optionsState={asyncOptions}
            loadOptions={getLedger}
            placeholder="Select G/L..."
          />
        ),
    },
    {
      headerName: "Debit",
      field: "debit",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          {row.total ? (
            <Input
              disabled={true}
              value={debitTotal.toFixed(2)}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              name="debit"
              inputType="number"
              id={row.id}
            />
          ) : (
            <Input
              value={row.debit}
              fun={inputHandler}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              disabled={row.credit?.length > 0}
              inputType="number"
              id={row.id}
            />
          )}
        </>
      ),

      // width: "10vw",
    },
    {
      headerName: "Credit",
      field: "credit",
      flex: 1,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <>
          {row.total ? (
            <Input
              disabled={true}
              value={creditTotal.toFixed(2)}
              onChange={(e) => inputHandler("credit", e.target.value, row.id)}
            />
          ) : (
            <Input
              value={row.credit}
              onChange={(e) => inputHandler("credit", e.target.value, row.id)}
              name="credit"
              disabled={row.debit?.length > 0}
            />
          )}
        </>
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
            onChange={(e) => inputHandler("comment", e.target.value, row.id)}
            value={row?.comment}
            name="comment"
            id={row.id}
          />
        ), //ask
    },
  ];
  // change api
  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/contra/bank_cash_ledgers", {
      search: search,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = [];

    arr = contraRows.map((row) => {
      if (row.id == id) {
        let obj = row;
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    let creditArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.credit != "") {
          return row.credit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    let debitArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.debit != "") {
          return row.debit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });

    setCreditTotal(
      creditArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0)
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0)
    );

    setContraRows(arr);
  };
  const submitHandler = async () => {
    if (!contraDate) {
      return toast.error("Please select date");
    }
    let finalObj = {
      effective_date: contraDate,
      gls: [],
      credit: [],
      debit: [],
      comment: [],
    };
    let problem = null;
    contraRows.map((row, index) => {
      if (row.account == "") {
        if (!row.total) {
          problem = "account";
        }
      } else if (
        index < contraRows.length - 1 &&
        row.credit == "" &&
        row.debit == ""
      ) {
        problem = "amount";
      } else if (creditTotal !== debitTotal) {
        problem = "total";
      } else {
        if (index < contraRows.length - 1) {
          finalObj = {
            ...finalObj,
            gls: [...finalObj.gls, row.account],
            credit: [...finalObj.credit, row.credit],
            debit: [...finalObj.debit, row.debit],
            comment: [...finalObj.comment, row.comment],
          };
        }
      }
    });
    finalObj = {
      ...finalObj,
      credit: finalObj.credit.map((row) => {
        if (row == "") {
          return 0;
        } else {
          return row;
        }
      }),
      debit: finalObj.debit.map((row) => {
        if (row == "") {
          return 0;
        } else {
          return row;
        }
      }),
    };
    if (!problem) {
      setLoading(true);
      const { data } = await imsAxios.post("/tally/contra/create_contra", {
        ...finalObj,
      });
      setLoading(false);
      if (data.code == 200) {
        resetHandler();
        if (data.message.msg.includes("completed")) {
          return toast.success("Contra Created");
        }
        toast.success(data.message.msg);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      if (problem == "account") {
        return toast.error("All entries should have a account selected");
      } else if (problem == "amount") {
        return toast.error("All entries should have a credit or debit amount");
      } else if (problem == "total") {
        return toast.error("Debit total and Credit total does not match");
      }
    }
  };
  const resetHandler = () => {
    setContraRows([
      {
        id: 1,
        account: "",
        debit: "",
        credit: "",
        comment: "",
      },
      {
        id: 2,
        account: "",
        debit: "",
        credit: "",
        comment: "",
      },
      {
        id: 3,
        total: "total",
        account: "",
        debit: "",
        credit: "",
        comment: "",
      },
    ]);
    setDebitTotal(0);
    setCreditTotal(0);
    setContraDate("");
  };
  return (
    <div style={{ height: "100%", padding: 5 }}>
      <Row gutter={4}>
        <Col span={6}>
          <Card title="Select Date" size="small">
            <SingleDatePicker
              setDate={setContraDate}
              placeholder="Select Date.."
              selectedDate={contraDate}
            />
          </Card>
        </Col>

        <Col style={{ height: "70%" }} span={18}>
          <Card bodyStyle={{ padding: 0 }} size="small">
            <FormTable loading={loading} data={contraRows} columns={columns} />
          </Card>
        </Col>
      </Row>
      <NavFooter
        loading={loading}
        submitFunction={submitHandler}
        resetFunction={resetHandler}
        nextLabel="Submit"
      />
    </div>
  );
}
