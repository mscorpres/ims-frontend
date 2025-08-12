import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Space } from "antd";
import React from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import socket from "../../../Components/socket";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import MyButton from "../../../Components/MyButton";

const R26 = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterForm] = Form.useForm();
  const wiseOption = Form.useWatch("wise", filterForm);

  const getRows = async () => {
    let arr;
    try {
      const filter = await filterForm.validateFields();
      setLoading("fetch");
      const response = await imsAxios.post("/report/xmlViewOut", {
        wise: filter.wise,
        data: filter.date,
      });
      // console.log("response", response);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          if (wiseOption == "ven-cons") {
            arr = data.data.map((row, index) => ({
              id: index + 1,
              createDate: row.create_dt,
              component: row.part_name,
              partCode: row.part_no,
              consumedQty: row.consumedQty,
              createBy: row.create_by,
              docDate: row.doc_date,
              docRef: row.doc_ref,
              hsn: row.hsn,
              qty: row.qty,
              remark: row.remark,
              txnId: row.txn_id,
              type: row.type,
              unit: row.unit,
            }));
          } else {
            arr = data.data.data.map((row, index) => ({
              id: index + 1,
              date: row.DATE,
              component: row.COMPONENT,
              partCode: row.PART,
              outLoc: row.FROMLOCATION,
              inLoc: row.TOLOCATION,
              qty: row.OUTQTY,
              unit: row.UNIT,
              type: row.UNIT,
              lastPurchasePrice: row.LPP,
            }));
          }

          setRows(arr);
        } else {
          toast.error(data.message.msg);
          throw new Error("Some error occured");
        }
      } else {
        throw new Error("Some error occured");
      }
    } catch (error) {
      setRows([]);
      console.log("Error while fetching R26 report", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    // console.log("gere");
    const filter = await filterForm.validateFields();
    const otherdata = JSON.stringify({
      type: filter.wise,
      date: filter.date,
    });
    socket.emit("generate_xml_report", {
      otherdata,
      notificationId: v4(),
    });
  };
  const searchVendor = async () => {
    const filter = await filterForm.validateFields();
    const otherdata = JSON.stringify({
      type: filter.wise,
      date: filter.date,
    });
    socket.emit("generate_xml_report", {
      otherdata,
      notificationId: v4(),
    });
  };
  useEffect(() => {
    if (wiseOption) {
      setRows([]);
    }
  }, [wiseOption]);

  return (
    <Row gutter={6} style={{ height: "90%", padding: "0px 5px" }}>
      <Col span={5}>
        <Card title="Filters" size="small">
          <Form
            initialValues={defaultValues}
            form={filterForm}
            layout="vertical"
          >
            <Form.Item rules={rules.wise} name="wise" label="Transaction Type">
              <MySelect options={wiseOptions} />
            </Form.Item>
            {/* {wiseOption !== "ven-cons" && ( */}
            <Form.Item rules={rules.date} name="date" label="Date">
              <SingleDatePicker
                setDate={(date) => filterForm.setFieldValue("date", date)}
              />
            </Form.Item>
            {/* )} */}
          </Form>
          <Row justify="end">
            <Col>
              <Space>
                <CommonIcons action="downloadButton" onClick={handleDownload} />
                <MyButton
                  variant="search"
                  loading={loading === "fetch"}
                  onClick={getRows}
                  type="primary"
                >
                  Fetch
                </MyButton>
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={19}>
        <MyDataTable
          columns={wiseOption == "ven-cons" ? vencolumns : columns}
          data={rows}
          loading={loading === "fetch"}
        />
      </Col>
    </Row>
  );
};

const defaultValues = {
  wise: "rm-sf",
};

const wiseOptions = [
  {
    text: "RM-SF",
    value: "rm-sf",
  },
  {
    text: "RM-Cons",
    value: "rm-cons",
  },
  {
    text: "RM-JW",
    value: "rm-jw",
  },
  {
    text: "RM-REJ",
    value: "rm-rej",
  },
  {
    text: "MFG XML",
    value: "mfg-xml",
  },
  {
    text: "Vendor Consumption",
    value: "ven-cons",
  },
  {
    text: "JW SFG Inward",
    value: "rm-sfg",
  },
   {
    text: "JW RM Return",
    value: "rm-return",
  },
  {
    text: "Production Floor to SF024(Rej)",
    value: "sf-rej",
  },

  {
    text: "SF024(Rej) to Production Floor",
    value: "rej-sf",
  },
  {
    text: "SF024(Rej) to Rej021(Scrap)",
    value: "rej-rj21",
  },
  {
    text:"Production floor to RM",
    value:"rm_sf999"
  },
  {
    text:"SF024(Rej) to RM",
    value:"rej-sf999"
  },
  {
    text:"Finish stock Outward",
    value:"fg-dismantle"
  },
  {
    text:"Part Code Conversion",
    value:"part-conv"
  }
];

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Date",
    width: 120,
    field: "date",
    renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
  },
  {
    headerName: "Type",
    width: 120,
    field: "type",
  },
  {
    headerName: "Part Code",
    width: 100,
    field: "partCode",
  },
  {
    headerName: "Component",
    minWidth: 200,
    flex: 1,
    field: "component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Out Loc.",
    width: 100,
    field: "outLoc",
  },
  {
    headerName: "In Loc.",
    width: 100,
    field: "inLoc",
  },
  {
    headerName: "Qty",
    width: 100,
    field: "qty",
  },
  {
    headerName: "UoM",
    width: 60,
    field: "unit",
  },
];
const vencolumns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "TransactionId",
    width: 130,
    field: "txnId",
  },
  {
    headerName: "Document Date",
    width: 120,
    field: "docDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.docDate} />,
  },
  {
    headerName: "Create By",
    width: 160,
    field: "createBy",
  },
  {
    headerName: "Create Date",
    width: 160,
    field: "createDate",
  },
  {
    headerName: "Document Ref",
    width: 120,
    field: "docRef",
    renderCell: ({ row }) => <ToolTipEllipses text={row.docRef} />,
  },
  {
    headerName: "Type",
    width: 120,
    field: "type",
  },
  {
    headerName: "Part Code",
    width: 100,
    field: "partCode",
  },
  {
    headerName: "Component",
    minWidth: 200,
    flex: 1,
    field: "component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },

  {
    headerName: "Consumed Qty",
    width: 180,
    field: "consumedQty",
  },
  {
    headerName: "Qty",
    width: 100,
    field: "qty",
  },
  {
    headerName: "UoM",
    width: 60,
    field: "unit",
  },
  {
    headerName: "HSN",
    width: 160,
    field: "hsn",
  },
  {
    headerName: "Remark",
    width: 260,
    field: "remark",
  },
];

const rules = {
  wise: [
    {
      required: true,
      message: "Please select a location",
    },
  ],
  date: [
    {
      required: true,
      message: "Please select a date",
    },
  ],
};

export default R26;
