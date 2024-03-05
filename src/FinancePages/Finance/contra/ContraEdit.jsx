import { useEffect, useState } from "react";
import { Button, Col, DatePicker, Drawer, Form, Input, Row } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import FormTable from "../../../Components/FormTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import dayjs from "dayjs";

export default function ContraEdit({ contra, close }) {
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [contraEditForm] = Form.useForm();

  const getDetails = async (contraId) => {
    setRows([]);
    const response = await imsAxios.post("/tally/contra/contra_report", {
      data: contraId,
    });
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const arr = data.data.map((row) => {
          return {
            id: row.ID,
            ledger: {
              label: row.account_name,
              value: row.ledger_key,
            },
            ...row,
          };
        });
        contraEditForm.setFieldsValue({
          effectiveDate: dayjs(data.data[0].ref_date, "DD-MM-YYYY"),
        });
        setRows(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      let obj = row;
      if (obj.id === id) {
        obj = {
          ...obj,
          [name]: value,
        };
      }
      return obj;
    });
    setRows(arr);
  };
  const getLedgerOptions = async (search) => {
    const response = await imsAxios.post("/tally/contra/bank_cash_ledgers", {
      search,
    });
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const arr = data.data.map((row) => {
          return { text: row.text, value: row.id };
        });
        setAsyncOptions(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const submitHandler = async () => {
    const debitTotal = sum(rows.map((row) => row.debit));
    const creditTotal = sum(rows.map((row) => row.credit));
    if (debitTotal !== creditTotal) {
      return toast.error("Debit and Credit total should be equal");
    }
    const finalObj = {
      effective_date: dayjs(
        contraEditForm.getFieldValue("effectiveDate")
      ).format("DD-MM-YYYY"),
      contra_code: contra,
      gls: rows.map((row) => row.ledger.value),
      debit: rows.map((row) => row.debit),
      credit: rows.map((row) => row.credit),
      comment: rows.map((row) => row.comment),
      ID: rows.map((row) => row.id),
    };

    const response = await imsAxios.post(
      "/tally/contra/contra_update",
      finalObj
    );
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        close();
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  // function to add all the values in an array
  const sum = (arr) => {
    return arr.reduce((partialSum, a) => {
      return partialSum + +Number(a).toFixed(2);
    }, 0);
  };
  const columns = [
    {
      headerName: "GL Code",
      renderCell: ({ row }) => (
        <MyAsyncSelect
          selectLoading={loading === "select"}
          loadOptions={getLedgerOptions}
          optionsState={asyncOptions}
          labelInValue
          onChange={(value) => inputHandler("ledger", value, row.id)}
          value={row.ledger}
        />
      ),
    },
    {
      headerName: "Debit",
      renderCell: ({ row }) => (
        <Input
          value={row.debit}
          disabled={
            row.credit !== "0" ? (row.credit !== "" ? true : false) : false
          }
          onChange={(e) => inputHandler("debit", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Credit",
      renderCell: ({ row }) => (
        <Input
          value={row.credit}
          disabled={
            row.debit !== "0" ? (row.debit !== "" ? true : false) : false
          }
          onChange={(e) => inputHandler("credit", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Comments",
      renderCell: ({ row }) => (
        <Input
          value={row.comment}
          onChange={(e) => inputHandler("comment", e.target.value, row.id)}
        />
      ),
    },
  ];

  useEffect(() => {
    if (contra) {
      getDetails(contra);
    }
  }, [contra]);
  return (
    <Drawer
      title={`Editing Contra : ${contra}`}
      placement="right"
      onClose={close}
      open={contra}
      width={700}
      extra={
        <Button type="primary" onClick={submitHandler}>
          {" "}
          Submit
        </Button>
      }
      bodyStyle={{ padding: 5 }}
    >
      <Form
        form={contraEditForm}
        layout="vertical"
        style={{ width: "100%", padding: 5 }}
      >
        <Form.Item label="EffectiveDate Date" name="effectiveDate">
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>
      </Form>
      <Row style={{ height: "85%", marginTop: -20 }}>
        <Col span={24} style={{ height: "100%" }}>
          <FormTable columns={columns} data={rows} />
        </Col>
      </Row>
    </Drawer>
  );
}
