import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
import { useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import { toast } from "react-toastify";
import FormTable from "../../../../Components/FormTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { useLocation } from "react-router-dom";
import Loading from "../../../../Components/Loading";

export default function CashEditModal({ cashEdit, setCashEdit }) {
  const [loading, setLoading] = useState(false);
  const [headerDetails, setHeaderDetails] = useState({});
  const [resetData, setResetData] = useState(false);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState();

  const { pathname } = useLocation();

  const getDetails = async () => {
    setLoading("fetch");
    let link = "";
    if (pathname.includes("payment")) {
      link = "/tally/cash/cash_payment_report";
    } else {
      link = "/tally/cash/cash_receipt_report";
    }
    const response = await imsAxios.post(link, {
      v_code: cashEdit,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let rowsArr = data.data.map((row) => ({
          ...row,
          ledger: { label: row.particularLabel, value: row.particularID },
          id: row.ID,
        }));
        let headerAccount = {
          label: data.header[0].account,
          value: data.header[0].account_code,
        };
        setHeaderDetails({
          headerAccount,
          refDate: data.header[0].ref_date,
        });
        setRows(rowsArr);
        setResetData({
          headerData: {
            headerAccount,
            refDate: data.header[0].ref_date,
          },
          rows: rowsArr,
        });
      } else {
        toast.error(data.message.msg);
        setCashEdit(false);
      }
    }
  };
  const getHeaderAccountOptions = async (search) => {
    setLoading("select");
    const { data } = await imsAxios.post("/tally/cash/fetch_cash", {
      search: search,
    });
    setLoading(false);
    const arr = data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };
  const getLedgerOptions = async (search) => {
    setLoading("select");
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const headerInputHandler = async (name, value) => {
    let obj = {
      ...headerDetails,
      [name]: value,
    };
    setHeaderDetails(obj);
  };
  const inputHandler = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      let obj = row;
      if (row.ID === id) {
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return obj;
      }
    });
    setRows(arr);
  };
  const addRows = () => {
    let arr = rows;
    arr.push({});
  };
  const removeRow = (id) => {
    let arr = rows.filter((row) => row.id !== id);
    setRows(arr);
  };
  const submitHandler = async () => {
    let link = "";
    if (pathname.includes("payment")) {
      link = "/tally/cash/updateCashPayment";
    } else {
      link = "/tally/cash/updateCashReceipt";
    }
    setLoading("submit");
    const response = await imsAxios.post(link, {
      module_used: cashEdit,
      ID: rows.map((row) => row.ID),
      debit: rows.map((row) => row.ammount),
      credit: rows.map((row) => row.ammount),
      gls: rows.map((row) => row.ledger.value),
      comment: rows.map((row) => row.comment),
      account: headerDetails.headerAccount.value,
      effective_date: headerDetails?.refDate,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        setCashEdit(false);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const resetHandler = () => {
    const { headerData, rows } = resetData;
    setRows(rows);
    setHeaderDetails(headerData);
  };
  const columns = [
    // {
    //   headerName: <CommonIcons action="addRow" onClick={addRows} />,
    //   width: 40,
    //   type: "actions",
    //   field: "add",
    //   sortable: false,
    //   renderCell: ({ row }) =>
    //     rows.length > 1 &&
    //     !row?.total && (
    //       <CommonIcons
    //         action="removeRow"
    //         onClick={() => {
    //           removeRow(row.id);
    //         }}
    //       />
    //     ),
    // },

    {
      headerName: "GL Code",
      field: "glCode",
      width: 250,
      sortable: false,
      renderCell: ({ row }) =>
        row.total ? (
          <span
            style={{
              width: 150,
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          >
            Total
          </span>
        ) : (
          <div style={{ width: 300 }}>
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              value={row?.ledger}
              labelInValue
              onChange={(value) => {
                inputHandler("ledger", value, row?.ID);
              }}
              selectLoading={loading === "select"}
              optionsState={asyncOptions}
              loadOptions={getLedgerOptions}
            />
          </div>
        ),
    },

    {
      headerName: "Amount",
      field: "payment",
      width: 100,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          //   value={row.total ? paymentTotal?.toFixed(2) : row.payment}
          value={row.ammount}
          onChange={(e) => inputHandler("ammount", e.target.value, row.ID)}
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
            id={row.ID}
          />
        ),
    },
  ];
  useEffect(() => {
    if (cashEdit) {
      getDetails();
    } else {
      setHeaderDetails(false);
      setRows([]);
    }
  }, [cashEdit]);

  return (
    <Drawer
      title={`Editing Cash ${
        pathname?.includes("payment") ? "Payment" : "Receipt"
      } : ${cashEdit}`}
      placement="right"
      width="50vw"
      extra={<Typography.Text>{rows?.length} Entries</Typography.Text>}
      onClose={() => setCashEdit(false)}
      open={cashEdit}
      bodyStyle={{ padding: 10 }}
    >
      {loading === "fetch" && <Loading />}
      {headerDetails?.refDate && (
        <Row style={{ height: "95%" }} gutter={[0, 4]}>
          <Form style={{ width: "100%", margin: 0 }} layout="vertical">
            <Col span={24}>
              <Row gutter={6}>
                <Col span={4}>
                  <Form.Item style={{ margin: 0 }} label="Effective Date">
                    <SingleDatePicker
                      setDate={(value) => headerInputHandler("refDate", value)}
                      value={headerDetails?.refDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item style={{ margin: 0 }} label="Account">
                    <MyAsyncSelect
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={headerDetails.headerAccount}
                      labelInValue
                      onChange={(value) =>
                        headerInputHandler("headerAccount", value)
                      }
                      loadOptions={getHeaderAccountOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Form>
          <Col style={{ height: "90%" }} span={24}>
            <FormTable columns={columns} data={rows} />
          </Col>
          <Col span={24}>
            <Row justify="end">
              <Space>
                {/* <Popconfirm
                  title="Reset Confirm"
                  description="Are you sure you want to reset this voucher with it's original created data?"
                  onConfirm={resetHandler}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button>Reset</Button>
                </Popconfirm> */}
                <Popconfirm
                  title="Submit Confirm"
                  description="Are you sure you want to update this cash voucher?"
                  onConfirm={submitHandler}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{
                    loading: loading === "submit",
                  }}
                >
                  <Button type="primary">Submit</Button>
                </Popconfirm>
              </Space>
            </Row>
          </Col>
        </Row>
      )}
    </Drawer>
  );
}
