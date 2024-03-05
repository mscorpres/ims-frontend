import React, { useState } from "react";
import { Card, Col, Form, Row, Input } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import axios from "axios";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import FormTable from "../../../Components/FormTable";
import NavFooter from "../../../Components/NavFooter";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  AiOutlineMinusSquare,
  AiOutlinePlusSquare,
} from "react-icons/ai";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";

function CashReceipt() {
  const [headerCash, setHeaderCash] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [effectiveDate, setSetEffective] = useState("");
  //   const [headerAccount, setHeaderAccount] = useState("");
  const [cashPaymentRows, setCashPaymentRows] = useState([
    {
      id: v4(),
      glCode: "",
      cash: "",
      comment: "",
    },
  ]);
  // console.log(cashPaymentRows);

  const getCash = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post(
      "/tally/cash/fetch_cash",
      {
        search: search,
      }
    );
    setSelectLoading(false);
    const arr = data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };

  const addRows = () => {
    setCashPaymentRows((rows) => {
      return [
        ...rows,
        {
          id: v4(),
          glCode: "",
          cash: "",
          comment: "",
        },
      ];
    });
  };

  const removeRow = (id) => {
    let arr = cashPaymentRows;
    arr = arr.filter((row) => row.id != id);
    setCashPaymentRows(arr);
  };

  const CashPaymentTable = [
    {
      headerName: (
        <span>
          <AiOutlinePlusSquare
            onClick={addRows}
            style={{
              cursor: "pointer",
              fontSize: "1.7rem",
              marginTop: 10,
              opacity: "0.7",
            }}
          />
        </span>
      ),
      width: 150,
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
                  cashPaymentRows.indexOf(row) <= 0
                    ? "none"
                    : "all",
                opacity:
                  cashPaymentRows.indexOf(row) <= 0
                    ? 0.5
                    : 1,
              }}
            />
          }
          onClick={() => {
            let del = null;
            del = cashPaymentRows.indexOf(row) > 0;

            del && removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },
    {
      headerName: "Particulars",
      flex: 1,
      field: "glcode",
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          selectLoading={selectLoading}
          onBlur={() => setAsyncOptions([])}
          value={row?.glCode}
          onChange={(value) => {
            inputHandler("glCode", value, row?.id);
          }}
          loadOptions={getLedger}
          optionsState={asyncOptions}
          placeholder="Select Ledger.."
        />
      ),
    },
    {
      headerName: "Amount",
      field: "cash",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => (
        <Input
          value={row.cash}
          onChange={(e) => {
            inputHandler("cash", e.target.value, row.id);
          }}
          placeholder="0"
        />
      ),
    },

    {
      headerName: "Comment",
      field: "comment",
      sortable: false,
      flex: 1,
      //   width: "12.5vw",
      renderCell: ({ row }) =>
        !row.total && (
          <Input
            fun={inputHandler}
            onChange={(e) => {
              inputHandler(
                "comment",
                e.target.value,
                row.id
              );
            }}
            value={row?.comment}
            placeholder="Enter a comment..."
          />
        ), //ask
    },
  ];

  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post(
      "/tally/ledger/ledger_options",
      {
        search: search,
      }
    );
    setSelectLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const inputHandler = (name, value, id) => {
    let arr = [];
    arr = cashPaymentRows;
    arr = arr.map((row) => {
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
    setCashPaymentRows(arr);
  };

  const saveFunction = async () => {
    let validating = { status: true, message: "" };
    let gls = [];
    let cash = [];
    let comment = [];
    if (headerCash == "") {
      return toast.error("A account is required");
    } else if (effectiveDate == "") {
      return toast.error("Effective date is required");
    }
    cashPaymentRows.map((row) => {
      if (row.gls == "") {
        validating = {
          status: false,
          message: "GLS is required in all the fields",
        };
      } else if (row.cash == "") {
        validating = {
          status: false,
          message: "cash is required in all the fields",
        };
      }

      if (validating) {
        gls.push(row.glCode ? row.glCode : "");
        cash.push(row.cash);
        comment.push(row.comment);
      }
    });
    if (validating.status == false) {
      toast.error(validating.message);
    } else if (validating.status == true) {
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/insert_cashreceipt",
        {
          gls: gls,
          credit: cash,
          comment: comment,
          account: headerCash ? headerCash : "",
          effective_date: effectiveDate,
        }
      );
      setLoading(false);
      if (data.code == 200) {
        resetFunction();
        toast.success(data.message);
      }
    }
  };

  const resetFunction = () => {
    setHeaderCash("");
    setCashPaymentRows([
      {
        id: v4(),
        glCode: "",
        debit: "",
        comment: "",
      },
    ]);
  };

  return (
    <div style={{ height: "90%" }}>
      <Row
        gutter={10}
        style={{ height: "100%", margin: "10px" }}
      >
        <Col span={6}>
          <Card title="Cash Receipt" size="small">
            <Form layout="vertical" size="small">
              <Row>
                <Col span={24}>
                  <Form.Item
                    label="Cash"
                    rules={[
                      {
                        required: true,
                        message: "Select Account",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      size="default"
                      selectLoading={selectLoading}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      loadOptions={getCash}
                      value={headerCash}
                      placeholder="Select Account.."
                      onChange={(value) =>
                        setHeaderCash(value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Select EffectiveDate"
                    rules={[
                      {
                        required: true,
                        message: "Select Effective Date",
                      },
                    ]}
                  >
                    <SingleDatePicker
                      size="default"
                      setDate={setSetEffective}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={18}>
          <FormTable
            hideHeaderMenu
            data={cashPaymentRows}
            columns={CashPaymentTable}
          />
        </Col>
      </Row>
      <NavFooter
        resetFunction={resetFunction}
        submitFunction={saveFunction}
        nextLabel="SUBMIT"
        loading={loading}
      />
    </div>
  );
}

export default CashReceipt;
