import { Card, Col, Collapse, Row, Table } from "antd";
import React, { useState } from "react";
import MyButton from "../../../Components/MyButton";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import { Box, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import { styled } from "@mui/material/styles";
function R33() {
  const StyledGridOverlay = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    "& .ant-empty-img-1": {
      fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626",
    },
    "& .ant-empty-img-2": {
      fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959",
    },
    "& .ant-empty-img-3": {
      fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343",
    },
    "& .ant-empty-img-4": {
      fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c",
    },
    "& .ant-empty-img-5": {
      fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
      fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff",
    },
  }));
  const [effectiveDate, setEffectiveDate] = useState();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [skulsit, setSkulsit] = useState([]);
  const getRows = async () => {
    setLoading(true);
    // console.log("here");
    const response = await imsAxios.post("/report33/", { date: effectiveDate });
    let { data } = response;

    let arr = [];
    if (response.success) {
      for (let key in data) {
        const current = data[key];
        let innerArr = [];
        for (let innerKey in current) {
          const innerCurrent = current[innerKey];
          let innerNewObj = {
            product: innerKey,
            data: innerCurrent,
            // [innerKey]: innerCurrent,
          };

          innerArr = [...innerArr, innerNewObj];
        }
        let newObj = {
          department: key,
          skuData: innerArr,
        };

        arr = [...arr, newObj];
      }

      setRows(arr);

      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }}>
        <Col span={3} style={{ marginLeft: "1rem" }}>
          {/* <MyDatePicker size="default" setDateRange={setDatee} /> */}
          <SingleDatePicker
            setDate={setEffectiveDate}
            placeholder="Select Effective Date.."
            selectedDate={effectiveDate}
            value={effectiveDate}
          />
        </Col>
        <MyButton
          variant="search"
          style={{ marginLeft: 4 }}
          loading={loading}
          onClick={getRows}
          type="primary"
        >
          Fetch
        </MyButton>
      </Row>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <Card style={{ height: "90%", overflowY: "scroll" }}>
          {" "}
          <TableRow>
            <TableCell sx={{ width: "20rem" }}>Department</TableCell>
          </TableRow>
          <Collapse style={{ background: "#f8f6f3" }}>
            {rows.map((row, index) => (
              <Collapse.Panel
                header={row.department ? `${row.department}` : "No depat"}
                key={index}
              >
                <Collapse>
                  {row.skuData.map((innerRow, innerIndex) => (
                    <Collapse.Panel
                      header={"SKU:" + "   " + innerRow.product}
                      key={innerIndex}
                      // style={{ marginLeft: "20rem" }}
                    >
                      <div
                        style={{
                          maxHeight: 400,
                          overflowY: "auto",
                          height: 200,
                        }}
                      >
                        <MyDataTable
                          columns={columnss}
                          data={
                            innerRow?.data
                              ? innerRow?.data.map((r, id) => ({
                                  ...r,
                                  id: id + 1,
                                }))
                              : []
                          }
                        />
                      </div>
                    </Collapse.Panel>
                  ))}
                </Collapse>
                {!row.skuData.length && (
                  <StyledGridOverlay>
                    <svg
                      width="120"
                      height="100"
                      viewBox="0 0 184 152"
                      aria-hidden
                      focusable="false"
                    >
                      <g fill="none" fillRule="evenodd">
                        <g transform="translate(24 31.67)">
                          <ellipse
                            className="ant-empty-img-5"
                            cx="67.797"
                            cy="106.89"
                            rx="67.797"
                            ry="12.668"
                          />
                          <path
                            className="ant-empty-img-1"
                            d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                          />
                          <path
                            className="ant-empty-img-2"
                            d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                          />
                          <path
                            className="ant-empty-img-3"
                            d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                          />
                        </g>
                        <path
                          className="ant-empty-img-3"
                          d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                        />
                        <g
                          className="ant-empty-img-4"
                          transform="translate(149.65 15.383)"
                        >
                          <ellipse
                            cx="20.654"
                            cy="3.167"
                            rx="2.849"
                            ry="2.815"
                          />
                          <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                        </g>
                      </g>
                    </svg>
                    <Box sx={{ mt: 1 }}>No SKU</Box>
                  </StyledGridOverlay>
                )}
              </Collapse.Panel>
            ))}
          </Collapse>
        </Card>
      </div>
    </div>
  );
}

export default R33;

const columnss = [
  {
    headerName: "#",
    field: "id",
    width: 40,
  },
  {
    headerName: " Date",
    field: "date",
    width: 100,
  },

  {
    headerName: "UoM",
    field: "unit",
    width: 70,
  },
  {
    headerName: " Manpower",
    field: "manPower",
    width: 150,
  },

  {
    headerName: "No Of Lines",
    field: "noOfLines",
    width: 150,
  },
  {
    headerName: "Output",
    field: "output",
    width: 150,
  },
  {
    headerName: " Shift Start",
    field: "shiftStart",
    width: 150,
  },
  {
    headerName: "Shift End",
    field: "shiftEnd",
    width: 150,
  },
  {
    headerName: "Over Time",
    field: "overTm",
    width: 150,
  },
  {
    headerName: " Working Hours",
    field: "workHrs",
    width: 150,
  },
  {
    headerName: "Remarks.",
    field: "remark",
    width: 220,
  },
];
