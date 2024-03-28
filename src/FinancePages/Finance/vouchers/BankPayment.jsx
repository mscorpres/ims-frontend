import { useState, useEffect } from "react";
import { v4 } from "uuid";
import NavFooter from "../../../Components/NavFooter";
import { toast } from "react-toastify";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Card, Col, DatePicker, Form, Input, Modal, Row } from "antd";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import FormTable from "../../../Components/FormTable";
import MySelect from "../../../Components/MySelect";
import SummaryCard from "../../../Components/SummaryCard";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import dayjs from "dayjs";
import useApi from "../../../hooks/useApi";
import { getProjectOptions } from "../../../api/general";

export default function BankPayment() {
  const [bankPaymentRows, setBankPaymentRows] = useState([
    {
      id: v4(),
      glCode: "",
      debit: "",
      comment: "",
      currency: "364907247",
      exchangeRate: 1,
      foreignValue: 0,
    },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [projectDesc, setProjectDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [totalValues, setTotalValues] = useState({
    totalINR: 0,
    totalForeign: 0,
  });

  const { executeFun, loading: loading1 } = useApi();
  const [bankPaymentForm] = Form.useForm();
  const getCurrencies = async () => {
    const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
    let arr = [];
    arr = data.data.map((d) => {
      return {
        text: d.currency_symbol,
        value: d.currency_id,
        notes: d.currency_notes,
      };
    });
    setCurrencyOptions(arr);
  };
  const addRows = () => {
    setBankPaymentRows((rows) => {
      return [
        ...rows,
        {
          id: v4(),
          glCode: "",
          debit: "",
          comment: "",
          currency: "364907247",
          exchangeRate: 1,
          foreignValue: 0,
        },
      ];
    });
  };
  const removeRow = (id) => {
    let arr = bankPaymentRows;
    arr = arr.filter((row) => row.id != id);
    setBankPaymentRows(arr);
  };
  const BankPaymentTable = [
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
      width: 50,
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
                  bankPaymentRows.indexOf(row) <= 0 ? "none" : "all",
                opacity: bankPaymentRows.indexOf(row) <= 0 ? 0.5 : 1,
              }}
            />
          }
          onClick={() => {
            let del = null;
            del = bankPaymentRows.indexOf(row) > 0;

            del && removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },
    {
      headerName: "Particulars",
      width: 350,
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <MyAsyncSelect
            sectLoading={selectLoading}
            onBlur={() => setAsyncOptions([])}
            value={row?.glCode}
            onChange={(value) => {
              inputHandler("glCode", value, row?.id);
            }}
            loadOptions={getLedger}
            optionsState={asyncOptions}
            placeholder="Select Ledger.."
          />
        </div>
      ),
    },
    {
      headerName: "Debit",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.debit}
          disabled={row.currency !== "364907247"}
          onChange={(e) => {
            inputHandler("debit", e.target.value, row.id);
          }}
          placeholder="0"
        />
      ),
    },
    {
      headerName: "Currency/Rate",

      width: 130,
      renderCell: ({ row }) => (
        <Input.Group compact>
          <Input
            style={{ width: "55%" }}
            disabled={row.currency === "364907247"}
            value={row.exchangeRate}
            onChange={(e) =>
              inputHandler("exchangeRate", e.target.value, row.id)
            }
          />
          <div style={{ width: "45%" }}>
            <MySelect
              options={currencyOptions}
              value={row.currency}
              onChange={(value) => inputHandler("currency", value, row.id)}
            />
          </div>
        </Input.Group>
      ),
    },
    {
      headerName: "Foreign Value",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.foreignValue}
          disabled={row.currency === "364907247"}
          onChange={(e) => inputHandler("foreignValue", e.target.value, row.id)}
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
              inputHandler("comment", e.target.value, row.id);
            }}
            value={row?.comment}
            placeholder="Enter a comment..."
          />
        ), //ask
    },
  ];
  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
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
  const getHeaderAccount = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/backend/fetchBankLedger", {
      search: search,
    });
    setSelectLoading(false);
    const arr = data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };
  const getProjectDetails = async () => {
    setLoading("page");
    const response = await imsAxios.post("/backend/projectDescription ", {
      project_name: bankPaymentForm.getFieldValue("project"),
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setProjectDesc(data.data.description);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = [];
    arr = bankPaymentRows;
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        if (name === "foreignValue") {
          obj = {
            ...obj,
            debit: +Number(+Number(value) * +Number(row.exchangeRate)).toFixed(
              2
            ),
          };
        } else if (name === "currency" && value === "364907247") {
          obj = {
            ...obj,
            exchangeRate: 1,
            foreignValue: 0,
          };
        } else if (name === "exchangeRate") {
          obj = {
            ...obj,
            debit: +Number(+Number(value) * +Number(row.foreignValue)).toFixed(
              2
            ),
          };
        }
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    setBankPaymentRows(arr);
  };
  const validateHandler = async () => {
    let values = await bankPaymentForm.validateFields();
    values.effectveDate = dayjs(values.effectveDate).format("DD-MM-YYYY");
    setShowSubmitConfirmModal(values);
  };
  const submitHandler = async () => {
    let validating = { status: true, message: "" };
    let gls = [];
    let debit = [];
    let comment = [];
    let currency = [];
    let exchangeRate = [];

    bankPaymentRows.map((row) => {
      if (row.gls == "") {
        validating = {
          status: false,
          message: "GLS is required in all the fields",
        };
      } else if (row.debit == "") {
        validating = {
          status: false,
          message: "Debit is required in all the fields",
        };
      }

      if (validating) {
        gls.push(row.glCode ? row.glCode : "");
        debit.push(row.debit);
        comment.push(row.comment);
        currency.push(row.currency);
        exchangeRate.push(row.exchangeRate);
      }
    });
    if (validating.status == false) {
      toast.error(validating.message);
    } else if (validating.status == true) {
      setLoading("submit");
      const response = await imsAxios.post("/tally/voucher/insert_bp", {
        gls: gls,
        debit: debit,
        comment: comment,
        currency_type: currency,
        exchange_rate: exchangeRate,
        account: showSubmitConfirmModal.account,
        effective_date: showSubmitConfirmModal.effectveDate,
        project_code: showSubmitConfirmModal.project ?? "--",
      });
      setShowSubmitConfirmModal(false);
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code == 200) {
          resetFunction();
          toast.success(data.message);
        } else {
          toast.error(data.message.msg);
        }
      }
    }
  };
  const resetFunction = () => {
    let obj = {
      account: "",
      effectveDate: "",
      project: "",
    };
    setBankPaymentRows([
      {
        id: v4(),
        glCode: "",
        credit: "",
        comment: "",
        currency: "364907247",
        exchangeRate: 1,
        foreignValue: 0,
      },
    ]);
    bankPaymentForm.setFieldsValue(obj);
  };
  const totalCard = [
    { title: "Total Value", description: totalValues.totalINR },
    { title: "Total Foreign Value", description: totalValues.totalForeign },
  ];
  useEffect(() => {
    getCurrencies();
  }, []);
  useEffect(() => {
    let totalINR = bankPaymentRows.map((row) => +Number(row.debit).toFixed(2));
    let totalForeign = bankPaymentRows.map(
      (row) => +Number(row.foreignValue).toFixed(2)
    );
    let totalINRValue = () => {
      let sum = 0;
      for (let i = 0; i < totalINR.length; i++) {
        sum += totalINR[i];
      }
      return sum;
    };
    let totalForeignValue = () => {
      let sum = 0;
      for (let i = 0; i < totalForeign.length; i++) {
        sum += totalForeign[i];
      }
      return sum;
    };
    setTotalValues({
      totalINR: totalINRValue().toFixed(2),
      totalForeign: totalForeignValue().toFixed(2),
    });
  }, [bankPaymentRows]);
  return (
    <div
      style={{
        height: "90%",
      }}
    >
      <Modal
        title="Create Bank Payment Confirm!"
        open={showSubmitConfirmModal}
        onOk={submitHandler}
        confirmLoading={loading === "submit"}
        onCancel={() => setShowSubmitConfirmModal(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to create this bank payment voucher</p>
      </Modal>
      <Row gutter={8} style={{ height: "100%", padding: "0px 10px" }}>
        <Col
          span={6}
          style={{
            maxHeight: "90%",
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: 10,
          }}
        >
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Card title="Header Detail" size="small">
                {loading === "page" && <Loading />}
                <Form form={bankPaymentForm} layout="vertical">
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        label="Account"
                        name="account"
                        rules={[
                          {
                            required: true,
                            message: "Select Account",
                          },
                        ]}
                      >
                        <MyAsyncSelect
                          sectLoading={selectLoading}
                          optionsState={asyncOptions}
                          onBlur={() => setAsyncOptions([])}
                          loadOptions={getHeaderAccount}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Effective Date"
                        name="effectveDate"
                        rules={[
                          {
                            required: true,
                            message: "Select Effective Date",
                          },
                        ]}
                      >
                        <DatePicker
                          format="DD-MM-YYYY"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="Project" name="project">
                        <MyAsyncSelect
                          selectLoading={loading1("select")}
                          optionsState={asyncOptions}
                          onBlur={() => setAsyncOptions([])}
                          loadOptions={handleFetchProjectOptions}
                          onChange={getProjectDetails}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="Project Description">
                        <Input.TextArea rows={4} value={projectDesc} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
            <Col span={24}>
              <SummaryCard title="Summary" summary={totalCard} />
            </Col>
          </Row>
        </Col>
        <Col
          style={{
            height: "90%",
            border: "1px solid #eeeeee",
            padding: "0px 0px",
          }}
          span={18}
        >
          <FormTable
            hideHeaderMenu
            data={bankPaymentRows}
            columns={BankPaymentTable}
          />
        </Col>
      </Row>
      <NavFooter
        resetFunction={resetFunction}
        submitFunction={validateHandler}
        nextLabel="Submit"
        loading={loading}
      />
    </div>
  );
}
