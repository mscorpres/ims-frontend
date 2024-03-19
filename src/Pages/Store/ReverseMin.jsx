import React, { useEffect, useState } from "react";
import { Button, Col, Popover, Row } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../Components/MyDataTable";
import { InfoCircleFilled } from "@ant-design/icons";
import MinReverseModal from "./Modal/MinReverseModal";
import { imsAxios } from "../../axiosInterceptor";

function ReverseMin() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [reverseModal, setReverseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputStore, setInputStore] = useState("");
  const [mainData, setMainData] = useState([]);
  const [headerData, setHeaderData] = useState([]);
  console.log(headerData);

  const getOption = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/getMinTransactionByNo", {
        search: e,
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const fetchInputData = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/reversal/fetchMINData", {
      transaction: inputStore,
    });
    // console.log(data);
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

  const columns = [
    {
      field: "componentName",
      headerName: "Component",
      width: 550,
    },
    {
      field: "partno",
      headerName: "Part",
      width: 90,
    },
    {
      field: "hsncode",
      headerName: "HSN",
      width: 90,
    },
    {
      field: "gstrate",
      headerName: "GST",
      width: 80,
    },
    {
      field: "inward_qty",
      headerName: "Qty",
      width: 90,
    },
    {
      field: "uom",
      headerName: "UoM",
      width: 90,
    },
    {
      field: "min_date",
      headerName: "Min Date",
      width: 160,
    },
    {
      field: "location",
      headerName: "Drop(+) To",
      width: 120,
    },
    {
      field: "invoice_id",
      headerName: "Invoice",
      width: 150,
    },
    // {
    //   field: "hsncode",
    //   headerName: "HSN",
    //   width: 80,
    // },
    // {
    //   field: "gstrate",
    //   headerName: "GST",
    //   width: 80,
    // },
    // {
    //   field: "inward_qty",
    //   headerName: "QTY|UOM",
    //   width: 130,
    //   renderCell: ({ row }) => (
    //     <Input
    //       suffix={row?.uom}
    //       disabled
    //       value={row?.inward_qty}
    //       placeholder="Qty"
    //       // onChange={(e) => inputHandler("rate", row.id, e.target.value)}
    //     />
    //   ),
    // },
    // {
    //   field: "min_date",
    //   headerName: "MIN DATE",
    //   width: 160,
    // },
    // {
    //   field: "invoice_id",
    //   headerName: "INVOICE",
    //   width: 160,
    //   renderCell: ({ row }) => (
    //     <Input
    //       value={row?.invoice_id}
    //       placeholder="Invoice"
    //       onChange={(e) => inputHandler("invoice_id", row.id, e.target.value)}
    //     />
    //   ),
    // },
    // {
    //   field: "remark",
    //   headerName: "REMARK",
    //   width: 350,
    //   renderCell: ({ row }) => (
    //     <Input
    //       value={row?.remark}
    //       placeholder="Remark"
    //       onChange={(e) => inputHandler("remark", row.id, e.target.value)}
    //     />
    //   ),
    // },
  ];

  const resetFun = () => {
    setMainData([]);
  };

  const content = (
    <div style={{ padding: "15px" }}>
      <div>
        <span>Name:</span>
        <span
          style={{ fontSize: "13px", fontWeight: "bolder", marginLeft: "5px" }}
        >
          {headerData.insert_by}
        </span>
      </div>
      <div>
        <span>Email:</span>
        <span
          style={{ fontSize: "13px", fontWeight: "bolder", marginLeft: "5px" }}
        >
          {headerData.insert_by_useremail}
        </span>
      </div>
      <div>
        <span>Contact:</span>
        <span
          style={{ fontSize: "13px", fontWeight: "bolder", marginLeft: "5px" }}
        >
          {headerData.insert_by_usermobile}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      <Row gutter={10} style={{ margin: "5px" }}>
        <Col span={5}>
          <MyAsyncSelect
            style={{ width: "100%" }}
            onBlur={() => setAsyncOptions([])}
            loadOptions={getOption}
            value={inputStore}
            optionsState={asyncOptions}
            onChange={(a) => setInputStore(a)}
            placeholder="MIN / TXN ID"
          />
        </Col>
        <Col span={2}>
          <Button type="primary" loading={loading} onClick={fetchInputData}>
            Fetch
          </Button>
        </Col>
        {mainData?.length > 0 && (
          <Col span={2} offset={15}>
            <Popover
              placement="leftTop"
              title="Information"
              content={content}
              trigger="click"
            >
              <Button>
                <InfoCircleFilled style={{ fontSize: "15px" }} />
              </Button>
            </Popover>
          </Col>
        )}
      </Row>
      <div style={{ height: "72vh", margin: "10px" }}>
        <div style={{ height: "100%" }}>
          <MyDataTable data={mainData} columns={columns} loading={loading} />
        </div>
      </div>

      {mainData?.length > 0 && (
        <Row gutter={10} style={{ margin: "5px", marginTop: "20px" }}>
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
              {/* <Button> */}
              <Button type="primary" onClick={() => setReverseModal(true)}>
                Reverse
              </Button>
            </div>
          </Col>
        </Row>
      )}

      <MinReverseModal
        inputStore={inputStore}
        reverseModal={reverseModal}
        setReverseModal={setReverseModal}
        mainData={mainData}
      />
    </div>
  );
}

export default ReverseMin;
