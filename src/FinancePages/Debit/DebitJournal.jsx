import React, { useState, useEffect } from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { v4 } from "uuid";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import NavFooter from "../../../Components/NavFooter";
import links from "../jounralPosting/links";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import FormTable from "../../../Components/FormTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Card, Col, Input, Row } from "antd";
import { imsAxios } from "../../../axiosInterceptor";

export default function JournalPosting() {
  const [journalDate, setJournalDate] = useState("");
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
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
  console.log(journalRows);
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);

  const addRows = () => {
    let dummy = [];
    dummy = journalRows;
    dummy = [
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      ...dummy,
    ];
    setJounralRows(dummy);
  };
  const removeRow = (rowId) => {
    let arr = journalRows;
    arr = arr.filter((row) => row.id != rowId);
    let creditArr = arr.map((row, index) => {
      // console.log(index);
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
    setJounralRows(arr);
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
  const inputHandler = (name, value, id) => {
    let arr = [];

    arr = journalRows.map((row) => {
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

    setJounralRows(arr);
  };

  const columns = [
    {
      headerName: (
        <span onClick={addRows}>
          <AiOutlinePlusSquare
            style={{
              cursor: "pointer",
              fontSize: "1.7rem",
              opacity: "0.7",
            }}
          />
        </span>
      ),
      width: 80,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) => [
        <GridActionsCellItem
          icon={
            <AiOutlineMinusSquare
              style={{
                fontSize: "1.7rem",
                cursor: "pointer",
                pointerEvents:
                  journalRows.length === 3 || row.total ? "none" : "all",
                opacity: journalRows.length === 3 || row.total ? 0.5 : 1,
              }}
            />
          }
          onClick={() => {
            journalRows.length > 3 && removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },

    {
      headerName: "GL Code",
      field: "glCode",
      width: 400,
      sortable: false,
      renderCell: ({ row }) =>
        row.total ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          >
            Total
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              value={row?.glCode}
              onChange={(value) => {
                inputHandler("glCode", value, row?.id);
              }}
              labelInValue
              selectLoading={selectLoading}
              optionsState={asyncOptions}
              loadOptions={getLedger}
              placeholder="Select G/L..."
            />
          </div>
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
            />
          ) : (
            <Input
              value={row.debit}
              fun={inputHandler}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              disabled={row.credit?.length > 0}
              inputType="number"
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
        <Input
          // size="small"
          value={row.total ? creditTotal.toFixed(2) : row.credit}
          onChange={(e) => inputHandler("credit", e.target.value, row.id)}
          disabled={row.total || row.debit?.length > 0}
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
          />
        ),
    },
  ];
  const submitHandler = async () => {
    if (!journalDate) {
      return toast.error("Please select Effective date");
    }
    let finalObj = {
      effective_date: journalDate,
      gl_code: [],
      credit: [],
      debit: [],
      comment: [],
    };
    let problem = null;
    journalRows.map((row, index) => {
      if (row.glCode == "") {
        problem = "gl_code";
      } else {
        if (index < journalRows.length - 1) {
          finalObj = {
            ...finalObj,
            gl_code: [...finalObj.gl_code, row.glCode.value],
            credit: [...finalObj.credit, row.credit == "" ? 0 : row.credit],
            debit: [...finalObj.debit, row.debit == "" ? 0 : row.debit],
            comment: [...finalObj.comment, row.comment],
          };
        }
      }
    });
    if (!problem) {
      setLoading(true);
      const { data } = await imsAxios.post("/tally/dv/createDebitVoucher", {
        ...finalObj,
      });
      setLoading(false);
      if (data.code == 200) {
        resetHandler();
        toast.success(data.message.msg);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      if (problem == "gl_code") {
        return toast.error("All entries should have a gl_code");
      }
    }
  };
  const resetHandler = () => {
    setJounralRows([
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
    setDebitTotal(0);
    setCreditTotal(0);
    // setJournalDate("");
  };
  return (
    <div style={{ height: "90%" }}>
      <Row
        gutter={[4, 4]}
        style={{
          height: "100%",
          padding: "0px 5px",
        }}
      >
        <Col span={6}>
          <Card title="Select Date" size="small">
            <Row>
              <Col span={24}>
                <SingleDatePicker
                  setDate={setJournalDate}
                  placeholder="Select Effective Date.."
                  selectedDate={journalDate}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "100%", padding: 0 }} span={18}>
          <Row style={{ height: "100%", padding: 0 }}>
            <Col style={{ height: "100%", padding: 0 }} span={24}>
              <Card
                style={{ height: "90%", padding: 0 }}
                bodyStyle={{ height: "100%", padding: 0 }}
                size="small"
              >
                <FormTable data={journalRows} columns={columns} />
              </Card>
            </Col>
          </Row>
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
