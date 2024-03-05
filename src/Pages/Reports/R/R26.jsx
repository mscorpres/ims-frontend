import { useState } from "react";
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

const R26 = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterForm] = Form.useForm();

  const getRows = async () => {
    try {
      const filter = await filterForm.validateFields();
      setLoading("fetch");
      const response = await imsAxios.post("/report/xmlViewOut", {
        wise: filter.wise,
        data: filter.date,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.data.map((row, index) => ({
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
  return (
    <Row gutter={6} style={{ height: "90%", padding: "0px 5px" }}>
      <Col span={4}>
        <Card title="Filters" size="small">
          <Form
            initialValues={defaultValues}
            form={filterForm}
            layout="vertical"
          >
            <Form.Item rules={rules.wise} name="wise" label="Transaction Type">
              <MySelect options={wiseOptions} />
            </Form.Item>
            <Form.Item rules={rules.date} name="date" label="Date">
              <SingleDatePicker
                setDate={(date) => filterForm.setFieldValue("date", date)}
              />
            </Form.Item>
          </Form>
          <Row justify="end">
            <Col>
              <Space>
                <CommonIcons action="downloadButton" onClick={handleDownload} />
                <Button
                  loading={loading === "fetch"}
                  onClick={getRows}
                  type="primary"
                >
                  Fetch
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable columns={columns} data={rows} />
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
    headerName: "UOM",
    width: 60,
    field: "unit",
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
