import React, { useState, useEffect } from "react";
import { Breadcrumb, Button, Card, Col, Divider, Input, Row } from "antd";
import axios from "axios";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import {
  UserOutlined,
  MailOutlined,
  MobileOutlined,
  PrinterTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import { FaUserCircle } from "react-icons/fa";
import MyDataTable from "../../Components/MyDataTable";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import FormTable from "../../Components/FormTable";

function UpdateRM() {
  const [updteModal, setUpdteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selLoading, setSelLoading] = useState(false);
  const [inputStore, setInputStore] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [mainData, setMainData] = useState([]);
  const [headerData, setHeaderData] = useState([]);

  // console.log(mainData);
  const getOption = async (e) => {
    if (e?.length > 2) {
      setSelLoading(true);
      const { data } = await imsAxios.post("/backend/getMinTransactionByNo", {
        search: e,
      });
      setSelLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const fetchInputData = async () => {
    setLoading(true);
    setMainData([]);
    setHeaderData([]);
    const { data } = await imsAxios.post("/transaction/fetchMINData", {
      min_transaction: inputStore,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setMainData(arr);
      setHeaderData(data.header);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const reset = (i) => {
    setMainData((allDataComes) => {
      return allDataComes.filter((row) => row.id != i);
    });
  };

  const inputHandler = async (name, id, value) => {
    console.log(name, id, value);
    if (name == "invoice_id") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, invoice_id: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "remark") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, remark: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const columns = [
    {
      type: "actions",
      headerName: "Delete",
      width: 80,
      renderCell: ({ row }) => (
        <CloseCircleTwoTone
          onClick={() => reset(row?.id)}
          style={{ color: "#1890ff", fontSize: "15px" }}
        />
      ),
    },
    {
      field: "componentName",
      headerName: "Component",
      width: 350,
      renderCell: ({ row }) => (
        <span>{`${row?.componentName} / ${row?.partno}`}</span>
      ),
    },

    {
      field: "hsncode",
      headerName: "HSN",
      width: 100,
      renderCell: ({ row }) => <span>{row?.hsncode}</span>,
    },
    {
      field: "gstrate",
      headerName: "GST",
      width: 80,
      renderCell: ({ row }) => <span>{row?.gstrate}</span>,
    },
    {
      field: "inward_qty",
      headerName: "Qty",
      width: 90,
      renderCell: ({ row }) => (
        <span>{`${row?.inward_qty} ${row?.uom}`}</span>
        // <Input
        //   suffix={row?.uom}
        //   disabled
        //   value={row?.inward_qty}
        //   placeholder="Qty"
        //   // onChange={(e) => inputHandler("rate", row.id, e.target.value)}
        // />
      ),
    },
    {
      field: "min_date",
      headerName: "Min Date",
      width: 160,
      renderCell: ({ row }) => <span>{row?.min_date}</span>,
    },
    {
      field: "invoice_id",
      headerName: "Invoice",
      width: 160,
      renderCell: ({ row }) => (
        <Input
          value={row?.invoice_id}
          placeholder="Invoice"
          onChange={(e) => inputHandler("invoice_id", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "remark",
      headerName: "Remark",
      width: 310,
      renderCell: ({ row }) => (
        <Input
          value={row?.remark}
          placeholder="Remark"
          onChange={(e) => inputHandler("remark", row.id, e.target.value)}
        />
      ),
    },
  ];

  const resetFun = () => {
    setMainData([]);
    // setInputStore([]);
  };

  const updateFunction = async () => {
    setUpdteModal(true);
    const keyArray = [];
    const compKeyArray = [];
    const invoiceArray = [];
    const remarkArray = [];
    mainData.map((key) => keyArray.push(key.key));
    mainData.map((comp) => compKeyArray.push(comp.componentKey));
    mainData.map((invo) => invoiceArray.push(invo.invoice_id));
    mainData.map((rem) => remarkArray.push(rem.remark));

    const { data } = await imsAxios.post("/transaction/updateMIN", {
      branch: "BRMSC012",
      key: keyArray,
      component: compKeyArray,
      invoice: invoiceArray,
      remark: remarkArray,
      min_transaction: inputStore,
    });
    if (data.code == 200) {
      setUpdteModal(false);
      resetFun();
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setUpdteModal(false);
    }
    console.log(data);
  };
  return (
    <Row gutter={10} style={{ margin: "5px" }}>
      <Col span={6} style={{}}>
        <Row gutter={10}>
          <Col span={18}>
            <MyAsyncSelect
              selectLoading={selLoading}
              style={{ width: "100%" }}
              onBlur={() => setAsyncOptions([])}
              loadOptions={getOption}
              value={inputStore}
              optionsState={asyncOptions}
              onChange={(a) => setInputStore(a)}
              placeholder="MIN/TXD ID"
            />
          </Col>
          <Col span={1}>
            <Button loading={loading} type="primary" onClick={fetchInputData}>
              Fetch
            </Button>
          </Col>
          <Divider orientation="left"></Divider>
          {mainData?.length > 0 && (
            <>
              <Col span={24}>
                <Card
                  type="inner"
                  title={headerData?.insert_by}
                  extra={headerData?.insert_by_usermobile}
                >
                  <MailOutlined /> :
                  <span style={{ marginLeft: "5px" }}>
                    {headerData?.insert_by_useremail}
                  </span>
                </Card>
              </Col>
              <Divider orientation="left"></Divider>
              <Col span={24}>
                <div style={{ textAlign: "end" }}>
                  <Button
                    onClick={resetFun}
                    style={{
                      marginRight: "5px",
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={updateFunction}
                    loading={updteModal}
                    type="primary"
                  >
                    Update
                  </Button>
                </div>
              </Col>
            </>
          )}
        </Row>
      </Col>
      <Col span={18} style={{}}>
        <div style={{ height: "85vh", padding: "0px 10px" }}>
          <FormTable
            // loading={loading}
            data={mainData}
            columns={columns}
          />
        </div>
      </Col>
    </Row>
  );
}

{
  /* <div>
  <FaUserCircle size={25} style={{ marginTop: "5px" }} />:{headerData?.insert_by}
</div>insert_by_useremail/insert_by_usermobile */
}
export default UpdateRM;
