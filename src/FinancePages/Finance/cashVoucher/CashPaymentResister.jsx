import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { EyeFilled } from "@ant-design/icons";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import CashPaymentModal from "./model/CashPaymentModal";
import CashEditModal from "./model/cashEditModal";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
// import CashEditModal from "./model/CashEditModal";

function CashPaymentResister() {
  const [open, setOpen] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState({
    selType: "",
    code: "",
    pick: "",
  });
  const [cashEdit, setCashEdit] = useState(false);
  // console.log(selectedValue);

  const getSelectOption = [
    { label: "Date Wise", value: "date_wise" },
    { label: "Effective Wise", value: "eff_wise" },
    { label: "Code Wise", value: "key_wise" },
    { label: "Ledger Wise", value: "ledger_wise" },
  ];
  const [dateData, setDateData] = useState([]);
  const [effectiveData, setEffectiveData] = useState([]);
  const [codeData, setCodeData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);

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
    if (e == "date_wise") {
      setDateData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashpayment_list",
        {
          wise: selectedValue.selType,
          data: datee,
        }
      );
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDateData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    } else if (e == "eff_wise") {
      setEffectiveData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashpayment_list",
        {
          wise: selectedValue.selType,
          data: datee,
        }
      );
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setEffectiveData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    } else if (e == "key_wise") {
      setCodeData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashpayment_list",
        {
          wise: selectedValue.selType,
          data: selectedValue?.code,
        }
      );
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setCodeData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    } else if (e == "ledger_wise") {
      setLedgerData([]);
      setLoading(true);
      const { data } = await imsAxios.post(
        "/tally/cash/cashpayment_list",
        // "/tally/cash/cashreceipt_list",
        {
          wise: selectedValue?.selType,
          data: selectedValue?.pick,
        }
      );
      if (data.code == 200) {
        let arr = data?.data?.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setLedgerData(arr);
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
        <TableActions
        action="edit"
        onClick={() => setCashEdit(row.module_used)}
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
    {
      field: "which_module",
      headerName: "VOUCHER TYPE",
      width: 180,
    },
    {
      field: "module_used",
      headerName: "VOUCHER ID",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.module_used}>
          {row?.module_used}
        </ToolTipEllipses>
      ),
    },
    { field: "payment", headerName: "PAYMENT", width: 140 },
    {
      field: "comment",
      headerName: "COMMENT",
      width: 240,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.comment}>
          {row?.comment}
        </ToolTipEllipses>
      ),
    },
    { field: "status", headerName: "STATUS", width: 140 },
  ];

  return (
    <>
      <div style={{ height: "90%", margin: "10px" }}>
      <CashEditModal cashEdit={cashEdit} setCashEdit={setCashEdit} />
        <Row gutter={10}>
          {selectedValue?.selType === "" ? (
            <>
              <Col span={4}>
                <Select
                  options={getSelectOption}
                  style={{ width: "100%" }}
                  placeholder="Select option"
                  value={selectedValue?.selType?.value}
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
              <Col span={4}>
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
          ) : selectedValue?.selType === "date_wise" ? (
            <>
              <Col span={4}>
                <Select
                  options={getSelectOption}
                  style={{ width: "100%" }}
                  placeholder="Select option"
                  value={selectedValue?.selType?.value}
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
              <Col span={4}>
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
          ) : selectedValue?.selType === "eff_wise" ? (
            <>
              <Col span={4}>
                <Select
                  options={getSelectOption}
                  style={{ width: "100%" }}
                  placeholder="Select option"
                  value={selectedValue?.selType?.value}
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
              <Col span={4}>
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
          ) : selectedValue?.selType === "key_wise" ? (
            <>
              <Col span={4}>
                <Select
                  options={getSelectOption}
                  style={{ width: "100%" }}
                  placeholder="Select option"
                  value={selectedValue?.selType?.value}
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
              <Col span={4}>
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
          ) : (
            selectedValue?.selType === "ledger_wise" && (
              <>
                <Col span={4}>
                  <Select
                    options={getSelectOption}
                    style={{ width: "100%" }}
                    placeholder="Select option"
                    value={selectedValue?.selType?.value}
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
                <Col span={4}>
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
            )
          )}
        </Row>
        <div style={{ height: "87%", marginTop: "5px" }}>
          {selectedValue?.selType == "date_wise" ? (
            <MyDataTable
              loading={loading}
              data={dateData}
              columns={columns}
            />
          ) : selectedValue?.selType == "eff_wise" ? (
            <MyDataTable
              loading={loading}
              data={effectiveData}
              columns={columns}
            />
          ) : selectedValue?.selType == "key_wise" ? (
            <MyDataTable
              loading={loading}
              data={codeData}
              columns={columns}
            />
          ) : (
            <MyDataTable
              loading={loading}
              data={ledgerData}
              columns={columns}
            />
          )}
        </div>
      </div>
      <CashEditModal cashEdit={cashEdit} setCashEdit={setCashEdit} />
    </>
  );
}

export default CashPaymentResister;
