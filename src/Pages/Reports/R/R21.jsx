import { Button, Col, Row, Typography } from "antd";
import React, { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { cosineSimilarity } from "@antv/algorithm";

function R21() {
  const [columns, setColumns] = useState([]);
  const [columnsName, setColumnsName] = useState([]);
  const [rows, setRows] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [closing, setClosing] = useState("");

  const getRows = async () => {
    setFetchLoading(true);
    const data = await imsAxios.get("/report21");
    console.log("data", data);
    setFetchLoading(false);
    let headers = [];
    if (data.status === 200) {
      let location = {};
      let headerArr = [];
      let arr = data.data.result.map((row) => {
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
      setClosing(data.data.closingDate);
      setColumnsName(headerArr);
      // console.log("columnName", data.data.result);
      let locations = JSON.parse(data.data.result[0].locations);
      for (const key in locations) {
        if (locations.hasOwnProperty(key)) {
          location = { headerName: key };
        }
        headers.push(location);
      }
      console.log("headerName", headers);
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
          width: 120,
          field: row.headerName.replaceAll("\n", " - "),
        };
      });
      console.log("headerName", headers);
      let sortedList = headers.sort((a, b) => a.field.localeCompare(b.field));
      console.log("sortedList", sortedList);
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
        ...sortedList,
      ];
      setColumns(headers);
      setRows(arr);
    }
  };
  const handleDownloadCSV = () => {
    downloadCSVCustomColumns(rows, "R21");
    // let obj = {}
    // let arr = columnsName.map(row => {
    //   obj[row] =
    // })
    // downloadCSV(rows, columns, "R21 Report");
  };
  return (
    <Row style={{ height: "90%", padding: "0px 10px" }}>
      <Col span={24}>
        <Row justify="space-between">
          <Button loading={fetchLoading} onClick={getRows} type="primary">
            Generate
          </Button>
          <Typography.Text style={{ margin: 0 }} level={2}>
            Data as per-{closing}
          </Typography.Text>
          <CommonIcons action="downloadButton" onClick={handleDownloadCSV} />
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
              Click Generate button to generate the report
            </Typography.Title>
          </>
        )}
      </Col>
    </Row>
  );
}

export default R21;
