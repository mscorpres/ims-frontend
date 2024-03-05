import {
  Button,
  Col,
  Drawer,
  Input,
  Space,
  Row,
  Card,
  DatePicker,
} from "antd";
import React, { useEffect, useState } from "react";

import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import FormTable from "../../../../Components/FormTable";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";

function CashReceiptEdit({
  edit,
  setEdit,
  fetchData,
  selectValueWhenFetch,
}) {
  // conso/le.log(selectValueWhenFetch);
  const [allData, setAllData] = useState([]);
  const [header, setHeader] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [cash, setCash] = useState(null);
  // console.log(cash);
  const [insertDate, setInsertDate] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [search, setSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // // console.log("All", allData);
  // console.log("Cash Account", cash);
  // //   console.log("Header", header.ref_date);
  // // allData.map((a) => console.log(a.particulars.text));

  const callFunction = async () => {
    setEffectiveDate("");
    const { data } = await imsAxios.post(
      "/tally/cash/cash_receipt_report",
      {
        v_code: edit?.module_used,
      }
    );
    // console.log(data);
    if (data.code == 200) {
      // setHeader(data.header[0].account);
      setInsertDate(data.header[0].insert_date);
      setEffectiveDate(data.header[0].ref_date);

      let accountObj = {
        label: data.header[0].account,
        value: data.header[0].account_code,
      };
      setCash(accountObj);
      let arr = data.data.map((row, index) => {
        let particularyObj = {
          label: row.particularLabel,
          value: row.particularID,
        };
        return {
          ...row,
          id: v4(),
          index: index + 1,
          particular: particularyObj,
        };
      });
      // console.log(arr);
      setAllData(arr);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }

    // data.data.map((aa) => setCash(aa.particulars));
    // if (data.code == 200) {
    //   setCash(data.header[0].account);
    //   setInsertDate(data.header[0].insert_date);
    //   setEffectiveDate(data.header[0].ref_date);

    //   const arr = data.data.map((row) => {
    //     return {
    //       ...row,
    //       id: v4(),
    //     };
    //   });

    //   setAllData(arr);
    // }
  };

  const getAccount = async (search) => {
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

  const getParticulars = async (search) => {
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
      // console.log(arr);
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const inputHandler = (name, value, id) => {
    console.log(name, value, id);
    let arr = allData;
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        if (name === "particular") {
          let particularObj = {
            text: value.label,
            value: value.value,
          };
          obj = {
            ...obj,
            [name]: particularObj,
          };
        } else {
          obj = {
            ...obj,
            [name]: value,
          };
        }

        return obj;
      } else {
        return row;
      }
    });
    console.log("this is the array", arr);
    setAllData(arr);
  };
  // console.log(allData);

  const columns = [
    {
      headerName: "Particulars Code",
      field: "particularLabel",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          value={row?.particular}
          onBlur={() => setAsyncOptions([])}
          labelInValue
          // selectLoading={selectLoading}
          loadOptions={getParticulars}
          optionsState={asyncOptions}
          placeholder="Particulars"
          onChange={(value) => {
            inputHandler("particular", value, row?.id);
          }}
        />
      ),
    },
    {
      headerName: "Payment",
      field: "ammount",
      width: 150,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          value={row.ammount}
          onChange={(e) =>
            inputHandler("ammount", e.target.value, row.id)
          }
        />
      ),
    },
    {
      headerName: "Comment",
      field: "comment",
      width: 150,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          size="small"
          value={row.comment}
          onChange={(e) =>
            inputHandler("comment", e.target.value, row.id)
          }
        />
      ),
    },
  ];

  const submitHandler = async () => {
    if (selectValueWhenFetch == "date_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const { data } = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (data.code == 200) {
        fetchData("date_wise");
        toast.success(data.code);
        setEdit(false);
      } else if (data.code == 500) {
        console.log(data.message.msg);
      }
    } else if (selectValueWhenFetch == "eff_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const { data } = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (data.code == 200) {
        fetchData("eff_wise");
        toast.success(data.code);
        setEdit(false);
      } else if (data.code == 500) {
        console.log(data.message.msg);
      }
    } else if (selectValueWhenFetch == "key_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const { data } = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (data.code == 200) {
        fetchData("key_wise");
        toast.success(data.code);
        setEdit(false);
      } else if (data.code == 500) {
        console.log(data.message.msg);
      }
    } else if (selectValueWhenFetch == "ledger_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const { data } = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (data.code == 200) {
        fetchData("ledger_wise");
        toast.success(data.code);
        setEdit(false);
      } else if (data.code == 500) {
        console.log(data.message.msg);
      }
    }
  };

  useEffect(() => {
    if (edit?.module_used) {
      callFunction();
    }
  }, [edit?.module_used]);

  // useEffect(() => {
  //   console.log("All", allData);
  // }, [allData]);

  return (
    <Space>
      <Drawer
        width="50vw"
        height="100vh"
        title="Edit Cash Receipt"
        placement="right"
        onClose={() => setEdit(false)}
        open={edit}
        extra={
          <Button
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Submit
          </Button>
        }
      >
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Input value={insertDate} disabled />
            </Col>
            <Col span={6}>
              {effectiveDate && (
                <SingleDatePicker
                  value={effectiveDate}
                  setDate={setEffectiveDate}
                  selectedDate={effectiveDate}
                  showValue={effectiveDate}
                />
              )}
              {/* <Input value={header[0].ref_date} disabled /> */}
            </Col>
            <Col span={10}>
              <MyAsyncSelect
                size="default"
                value={cash}
                labelInValue
                onBlur={() => setAsyncOptions([])}
                loadOptions={getAccount}
                placeholder="Select Account.."
                optionsState={asyncOptions}
                onChange={(value) => setCash(value)}
              />
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={24} style={{ height: "95%" }}>
              <FormTable data={allData} columns={columns} />
            </Col>
          </Row>
        </>
      </Drawer>
    </Space>
  );
}

export default CashReceiptEdit;
