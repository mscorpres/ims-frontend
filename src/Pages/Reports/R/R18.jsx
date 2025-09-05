import { Button, Col, Row, Space, Typography, Form } from "antd";
import React, { useState } from "react";
import socket from "../../../Components/socket"; // Reuse existing socket from R6.jsx
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { toast } from "react-toastify";
import MyButton from "../../../Components/MyButton";

function R18() {
  const [location, setLocation] = useState("RM");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [reportStarted, setReportStarted] = useState(false);

  const [form] = Form.useForm();

  const getRows = async () => {
    try {
      const values = await form.validateFields();
      const finalObj = {
        for_location: values.location,
        date: values.date,
      };

      setFetchLoading(true);
      const { data } = await imsAxios.post("/report18", finalObj);
      setFetchLoading(false);

      if (data.code === 200) {
        let headers = [];
        let location = {};
        let headerArr = [];
        let arr = data.data.map((row) => {
          let obj = JSON.parse(row.locations);
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              let headerName = key; // Use loc_name directly (e.g., RMO21)
              headerArr.push(key);
              location = { ...location, [headerName]: obj[key] };
            }
          }

          return {
            component: row.component,
            part: row.part,
            id: v4(),
            ...location,
          };
        });

        headers = headerArr.map((key) => ({
          headerName: (
            <span style={{ display: "flex", alignItems: "center" }}>
              <ToolTipEllipses text={key} />
            </span>
          ),
          width: 100,
          field: key,
        }));

        headers = [
          {
            headerName: "Part",
            width: 150,
            renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
            field: "part",
          },
          {
            headerName: "Material Name",
            width: 200,
            renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
            field: "component",
          },
          ...headers,
        ];

        setColumns(headers);
        setRows(arr);
      } else {
        toast.error("Failed to fetch report data");
      }
    } catch (error) {
      setFetchLoading(false);
      toast.error("Error fetching report data");
    }
  };

  const generateHandler = async () => {
    try {
      setButtonEnabled(false);
      const values = await form.validateFields();
      const notificationId = v4();
      const payload = {
        otherdata: {
          for_location: values.location,
          date: values.date,
        },
        notificationId,
      };

      setReportStarted(true);
      socket.emit("generate_r18", payload); 
      toast.success("Report generation started. You'll receive an email when complete.");
    } catch (error) {
      toast.error("Error initiating report generation");
      setButtonEnabled(true);
      setReportStarted(false);
    }
  };

  const handleDownloadCSV = () => {
    if (rows.length === 0) {
      toast.warning("No data to download");
      return;
    }
    downloadCSVCustomColumns(rows, "R18");
  };

  return (
    <Row style={{ height: "90%", padding: "0px 10px" }}>
      <Col span={24}>
        <Row justify="space-between">
          <Form form={form}>
            <Space>
              <div style={{ width: 150 }}>
                <Form.Item name="location" initialValue="RM">
                  <MySelect
                    value={location}
                    onChange={setLocation}
                    options={locationOptions}
                  />
                </Form.Item>
              </div>
              <Form.Item name="date">
                <SingleDatePicker
                  setDate={(value) => form.setFieldValue("date", value)}
                />
              </Form.Item>
              <MyButton
                variant="search"
                loading={fetchLoading}
                onClick={getRows}
                type="primary"
              >
                Fetch
              </MyButton>
            </Space>
          </Form>
          <Space>
            <Button
              disabled={!buttonEnabled}
              onClick={generateHandler}
              type="primary"
            >
              Generate
            </Button>
            <CommonIcons action="downloadButton" onClick={handleDownloadCSV} />
          </Space>
        </Row>
      </Col>
      <Col
        className="hide-select"
        span={24}
        style={{ height: "95%", marginTop: 5 }}
      >
        {(rows.length > 0 || fetchLoading) && (
          <MyDataTable loading={fetchLoading} data={rows} columns={columns} />
        )}
        {rows.length === 0 && !fetchLoading && (
          <Typography.Title
            level={4}
            style={{ textAlign: "center", color: "darkslategray" }}
          >
            {reportStarted
              ? "Your report has started generating, You can fetch the report to see the progress of the report"
              : "Click Generate button to generate the report"}
          </Typography.Title>
        )}
      </Col>
    </Row>
  );
}

export default R18;

const locationOptions = [
  {
    text: "SF Floor",
    value: "SF",
  },
  {
    text: "RM Floor",
    value: "RM",
  },
];