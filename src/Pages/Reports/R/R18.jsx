import { Button, Col, Row, Space, Typography } from "antd";
import React, { useState } from "react";
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
  const [date, setDate] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [reportStarted, setReportStarted] = useState(false);

  const getRows = async () => {
    const finalObj = {
      for_location: location,
      date: date,
    };

    setFetchLoading(true);
    const { data } = await imsAxios.post("/report18", finalObj);
    setFetchLoading(false);
    let headers = [];
    if (data.code === 200) {
      let location = {};
      let headerArr = [];
      let arr = data.data.map((row) => {
        let obj = JSON.parse(row.locations);
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            let headerName = key.replaceAll("\n", " - ");
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
      let locations = JSON.parse(data.data[0].locations);
      for (const key in locations) {
        if (locations.hasOwnProperty(key)) {
          location = { headerName: key };
        }
        headers.push(location);
      }
      headers = headers.map((row) => {
        return {
          headerName: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <ToolTipEllipses text={row.headerName} />
            </span>
          ),
          width: 100,
          field: row.headerName.replaceAll("\n", " - "),
        };
      });
      headers = [
        {
          headerName: "Component",
          width: 200,
          renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
          field: "component",
        },
        {
          headerName: "Part",
          width: 150,
          renderCell: ({ row }) => <ToolTipEllipses text={row.part} />,
          field: "part",
        },
        ...headers,
      ];
      setColumns(headers);
      setRows(arr);
    }
  };
  const generateHandler = async () => {
    try {
      setButtonEnabled(false);

      const finalObj = {
        for_location: location,
        date: date,
      };

      setTimeout(() => {
        setReportStarted(true);
      }, 2000);

      const response = await imsAxios.post("/report18/generate", finalObj);
      if (response) {
        setButtonEnabled(false);
      }
    } catch (error) {}
  };
  const handleDownloadCSV = () => {
    downloadCSVCustomColumns(rows, "test");
    // let obj = {}
    // let arr = columnsName.map(row => {
    //   obj[row] =
    // })
    // downloadCSV(rows, columns, "R18 Report");
  };
  return (
    <Row style={{ height: "90%", padding: "0px 10px" }}>
      <Col span={24}>
        <Row justify="space-between">
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                value={location}
                onChange={setLocation}
                options={locationOptions}
              />
            </div>
            <SingleDatePicker setDate={setDate} />
            <MyButton
              variant="search"
              loading={fetchLoading}
              onClick={getRows}
              type="primary"
            >
              Fetch
            </MyButton>
          </Space>
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
          <>
            <Typography.Title
              level={4}
              style={{ textAlign: "center", color: "darkslategray" }}
            >
              {reportStarted &&
                "Your report has started generating, You can fetch the report to see the progress of the report"}
              Click Generate button to generate the report
            </Typography.Title>
          </>
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
