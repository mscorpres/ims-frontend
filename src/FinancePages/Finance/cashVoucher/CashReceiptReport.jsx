import { Button, Col, Input, Row, Select } from "antd";
import React, { useState, useEffect } from "react";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  EyeFilled,
  CloseCircleFilled,
  EditFilled,
} from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import CashPaymentModal from "./model/CashPaymentModal";
import CashReceiptModal from "./model/CashReceiptModal";
import CashReceiptEdit from "./model/CashReceiptEdit";

function CashReceiptReport() {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateData, setDateData] = useState([]);
  const [effective, setEffective] = useState([]);
  const [codeData, setCodeData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [selectValueWhenFetch, setSelectValueWhenFetch] =
    useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState({
    selType: "",
    code: "",
    pick: "",
  });
  // console.log(selectedValue);

  const getSelectOption = [
    { label: "Date Wise", value: "date_wise" },
    { label: "Effective Wise", value: "eff_wise" },
    { label: "Code Wise", value: "key_wise" },
    { label: "Ledger Wise", value: "ledger_wise" },
  ];

  const getLedgerFunction = async (e) => {
    if (e?.length > 1) {
      setSelectLoading(true);
      const { data } = await imsAxios.post(
        "/tally/ledger/ledger_options",
        {
          seacrh: e,
        }
      );
      setSelectLoading(false);
      // console.log(data.data);
      let arr = [];
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const fetchData = async (e) => {
    // console.log(selectedValue.selType);
    if (e == "date_wise") {
      setDateData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashreceipt_list",
        {
          wise: selectedValue.selType,
          data: datee,
        }
      );
      //  console.log(data);
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDateData(arr);
        setSelectValueWhenFetch("date_wise");
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    } else if (e == "eff_wise") {
      setEffective([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashreceipt_list",
        {
          wise: selectedValue.selType,
          data: datee,
        }
      );
      console.log(data);
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        // console.log(arr);
        setSelectValueWhenFetch("eff_wise");
        setEffective(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    } else if (e == "key_wise") {
      setCodeData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashreceipt_list",
        {
          wise: selectedValue.selType,
          data: selectedValue?.code,
        }
      );
      //  console.log(data);
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setCodeData(arr);
        setSelectValueWhenFetch("key_wise");
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    } else if (e == "ledger_wise") {
      setLedgerData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashreceipt_list",
        {
          wise: selectedValue.selType,
          data: selectedValue?.pick,
        }
      );
      //  console.log(data);
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setLedgerData(arr);
        setSelectValueWhenFetch("ledger_wise");
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "View",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={
            <EyeFilled
              onClick={() => setOpen(row?.module_used)}
            />
          }
        />,
        <GridActionsCellItem
          icon={
            <EditFilled
              // onClick={() => console.log(row?.ID)}
              onClick={() => setEdit(row)}
            />
          }
        />,
      ],
    },
    { field: "ref_date", headerName: "DATE", width: 120 },
    {
      field: "bank_name",
      headerName: "BANK NAME",
      width: 400,
    },
    {
      field: "bank_name_code",
      headerName: "BANK CODE",
      width: 150,
    },
    {
      field: "perticular",
      headerName: "PARTICULAR",
      width: 250,
    },
    {
      field: "perticular_code",
      headerName: "PARTICULAR CODE",
      width: 180,
    },
    // {
    //   field: "which_module",
    //   headerName: "VOUCHER TYPE",
    //   width: 180,
    // },
    {
      field: "module_used",
      headerName: "VOUCHER ID",
      width: 200,
    },
    { field: "payment", headerName: "PAYMENT", width: 140 },
    { field: "comment", headerName: "COMMENT", width: 240 },
    { field: "status", headerName: "STATUS", width: 140 },
  ];

  return (
    <>
      <div style={{ height: "90%" }}>
        <Row gutter={10} style={{ margin: "5px" }}>
          {selectedValue?.selType == "date_wise" ? (
            <>
              <Col span={4}>
                <Select
                  style={{ width: "100%" }}
                  options={getSelectOption}
                  value={selectedValue?.selType.value}
                  placeholder="Select option"
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        selType: e,
                      };
                    })
                  }
                />
              </Col>
              <Col span={5}>
                <MyDatePicker
                  setDateRange={setDatee}
                  size="default"
                />
              </Col>
              <Col span={1}>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={() => fetchData("date_wise")}
                >
                  Fetch
                </Button>
              </Col>
            </>
          ) : selectedValue?.selType == "eff_wise" ? (
            <>
              <Col span={4}>
                <Select
                  style={{ width: "100%" }}
                  options={getSelectOption}
                  value={selectedValue?.selType.value}
                  placeholder="Select option"
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        selType: e,
                      };
                    })
                  }
                />
              </Col>
              <Col span={5}>
                <MyDatePicker
                  setDateRange={setDatee}
                  size="default"
                />
              </Col>
              <Col span={1}>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={() => fetchData("eff_wise")}
                >
                  Fetch
                </Button>
              </Col>
            </>
          ) : selectedValue?.selType == "key_wise" ? (
            <>
              <Col span={4}>
                <Select
                  style={{ width: "100%" }}
                  options={getSelectOption}
                  value={selectedValue?.selType.value}
                  placeholder="Select option"
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        selType: e,
                      };
                    })
                  }
                />
              </Col>
              <Col span={5}>
                <Input
                  placeholder="Code"
                  value={selectedValue?.code}
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        code: e.target.value,
                      };
                    })
                  }
                />
              </Col>
              <Col span={1}>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={() => fetchData("key_wise")}
                >
                  Fetch
                </Button>
              </Col>
            </>
          ) : selectedValue?.selType == "ledger_wise" ? (
            <>
              <Col span={4}>
                <Select
                  style={{ width: "100%" }}
                  options={getSelectOption}
                  value={selectedValue?.selType}
                  placeholder="Select option"
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        selType: e,
                      };
                    })
                  }
                />
              </Col>
              <Col span={5}>
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  style={{ width: "100%" }}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getLedgerFunction}
                  value={selectedValue.pick}
                  optionsState={asyncOptions}
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        pick: e,
                      };
                    })
                  }
                />
              </Col>
              <Col span={1}>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={() => fetchData("ledger_wise")}
                >
                  Fetch
                </Button>
              </Col>
            </>
          ) : (
            <>
              <Col span={4}>
                <Select
                  style={{ width: "100%" }}
                  options={getSelectOption}
                  value={selectedValue?.selType.value}
                  placeholder="Select option"
                  onChange={(e) =>
                    setSelectedValue((selectedValue) => {
                      return {
                        ...selectedValue,
                        selType: e,
                      };
                    })
                  }
                />
              </Col>
              <Col span={5}>
                <MyDatePicker
                  setDateRange={setDatee}
                  size="default"
                />
              </Col>
              <Col span={1}>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={() => fetchData("date_wise")}
                >
                  Fetch
                </Button>
              </Col>
            </>
          )}
        </Row>
        <div style={{ height: "87%", margin: "10px" }}>
          {selectedValue?.selType == "date_wise" ? (
            <MyDataTable
              loading={loading}
              data={dateData}
              columns={columns}
            />
          ) : selectedValue?.selType == "eff_wise" ? (
            <MyDataTable
              loading={loading}
              data={effective}
              columns={columns}
            />
          ) : selectedValue?.selType == "key_wise" ? (
            <MyDataTable
              loading={loading}
              data={codeData}
              columns={columns}
            />
          ) : selectedValue?.selType == "ledger_wise" ? (
            <MyDataTable
              loading={loading}
              data={ledgerData}
              columns={columns}
            />
          ) : (
            <MyDataTable
              loading={loading}
              data={dateData}
              columns={columns}
            />
          )}
        </div>
      </div>
      <CashReceiptModal setOpen={setOpen} open={open} />
      <CashReceiptEdit
        setEdit={setEdit}
        edit={edit}
        fetchData={fetchData}
        selectValueWhenFetch={selectValueWhenFetch}
      />
    </>
  );
}

export default CashReceiptReport;
