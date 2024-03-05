import React, { useEffect, useState } from "react";
import { Button, Col, Drawer, Input, Row } from "antd";
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
import { imsAxios } from "../../../axiosInterceptor";

export default function DebitEdit({ editDebit, setEditDebit }) {
  const [debitTotal, setDebitTotal] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creditTotal, setCreditTotal] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState("");
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
  //   const addRows = () => {
  //     let dummy = [];
  //     dummy = journalRows;
  //     dummy = [
  //       { id: v4(), glCode: "", debit: "", credit: "", comment: "" },
  //       ...dummy,
  //     ];
  //     setJounralRows(dummy);
  //   };
  //   const removeRow = (rowId) => {
  //     let arr = journalRows;
  //     arr = arr.filter((row) => row.id != rowId);
  //     let creditArr = arr.map((row, index) => {
  //       // console.log(index);
  //       if (index < arr.length - 1) {
  //         if (row.credit != "") {
  //           return row.credit;
  //         } else {
  //           return 0;
  //         }
  //       } else {
  //         return 0;
  //       }
  //     });
  //     let debitArr = arr.map((row, index) => {
  //       if (index < arr.length - 1) {
  //         if (row.debit != "") {
  //           return row.debit;
  //         } else {
  //           return 0;
  //         }
  //       } else {
  //         return 0;
  //       }
  //     });
  //     setCreditTotal(
  //       creditArr?.reduce((partialSum, a) => {
  //         return Number(partialSum) + Number(a);
  //       }, 0)
  //     );
  //     setDebitTotal(
  //       debitArr?.reduce((partialSum, a) => {
  //         return Number(partialSum) + Number(a);
  //       }, 0)
  //     );
  //     setJounralRows(arr);
  //   };
  const submitHandler = async () => {
    if (!effectiveDate) {
      return toast.error("Please select Effective date");
    }
    let finalObj = {
      dv_key: editDebit,
      effective_date: effectiveDate,
      gls: [],
      credit: [],
      debit: [],
      comment: [],
      trans_id: [],
    };
    let problem = null;
    journalRows.map((row, index) => {
      if (row.glCode == "") {
        problem = "gls";
      } else {
        if (index < journalRows.length - 1) {
          finalObj = {
            ...finalObj,
            gls: [
              ...finalObj.gls,
              row.glCode.value ? row.glCode.value : row.glCode,
            ],
            credit: [...finalObj.credit, row.credit == "" ? 0 : row.credit],
            debit: [...finalObj.debit, row.debit == "" ? 0 : row.debit],
            comment: [...finalObj.comment, row.comment],
            trans_id: [
              ...finalObj.trans_id,
              row.transactionId ? row.transactionId : "",
            ],
          };
        }
      }
    });
    if (!problem) {
      //   console.log(finalObj);
      setSubmitLoading(true);
      const { data } = await imsAxios.post("/tally/dv/updateDebitVoucher", {
        ...finalObj,
      });
      setSubmitLoading(false);
      if (data.code == 200) {
        // resetHandler();
        toast.success(data.message);
        setTimeout(() => {
          setEditDebit(null);
        }, 3000);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      if (problem == "gls") {
        return toast.error("All entries should have a gls");
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
  const columns = [
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
      headerName: "Debit",
      field: "debit",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          <Input
            value={row.total ? debitTotal.toFixed(2) : row.debit}
            onChange={(e) => inputHandler("debit", e.target.value, row.id)}
            disabled={row.total || Number(row.credit) > 0}
          />
        </>
      ),

      // width: "10vw",
    },
    {
      headerName: "Credit",
      field: "credit",
      width: 150,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          value={row.total ? creditTotal.toFixed(2) : row.credit}
          onChange={(e) => inputHandler("credit", e.target.value, row.id)}
          disabled={row.total || Number(row.debit) > 0}
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
    const { data } = await imsAxios.post("/tally/dv/editDebitVoucher", {
      dv_key: editDebit,
    });
    setLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          id: row.trans_id,
          glCode: { value: row.l_key, label: row.l_name },
          debit: row.debit,
          credit: row.credit,
          comment: row.comment,
          transactionId: row.trans_id,
        };
      });
      arr = [...arr, { id: v4(), total: true, debit: 0, credit: 0 }];
      setJounralRows(arr);
      console.log(moment(data.data[0].effective_date));
      setEffectiveDate(data.data[0].effective_date);
    } else {
      toast.error(data.message.msg);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = journalRows;
    console.log(name, value, id);
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
    if (editDebit) {
      getVoucherDetails();
    }
  }, [editDebit]);

  useEffect(() => {
    let debit = [];
    let credit = [];
    debit = journalRows.map((row) => {
      return row.debit;
    });
    credit = journalRows.map((row) => {
      return row.credit;
    });

    setDebitTotal(
      debit.reduce((partialSum, a) => {
        return partialSum + Number(a);
      }, 0)
    );

    setCreditTotal(
      credit.reduce((partialSum, a) => {
        return partialSum + Number(a);
      }, 0)
    );
    console.log(journalRows);
  }, [journalRows]);
  return (
    <Drawer
      title={`Updating Voucher ${editDebit}`}
      placement="right"
      width="70vw"
      style={{ height: "100vh" }}
      onClose={() => {
        setEditDebit(null);
      }}
      open={editDebit}
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
            <Col span={6}>
              <SingleDatePicker
                setDate={setEffectiveDate}
                placeholder="Select Effective Date.."
                selectedDate={effectiveDate}
                value={effectiveDate}
              />
            </Col>
          </Col>
          <Col style={{ height: "95%" }} span={24}>
            <Col
              className="remove-cell-border remove-table-footer"
              style={{ height: "100%", oadding: 0 }}
              // offset={2}
              span={24}
            >
              <MyDataTable
                //   loading={loading}
                hideHeaderMenu
                data={journalRows}
                columns={columns}
              />
            </Col>
          </Col>
        </Row>
      )}
    </Drawer>
  );
}
