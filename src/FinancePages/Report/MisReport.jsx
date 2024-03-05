import React from "react";
import MyDatePicker from "../../Components/MyDatePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Button,
  Card,
  Form,
  Row,
  Space,
  Col,
  Skeleton,
  Typography,
} from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import socket from "../../Components/socket";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import Item from "antd/es/list/Item";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../Components/exportToCSV";
import { useEffect } from "react";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
// import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const initColumns = [
  { headerName: "Name", field: "name", width: 100 },
  { headerName: "Type", field: "type", width: 100 },
  { headerName: "YTD", field: "ytd", width: 100 },
  { headerName: "Q1", field: "Q1", width: 100 },
  { headerName: "Q2", field: "Q2", width: 100 },
  { headerName: "Q3", field: "Q3", width: 100 },
  { headerName: "Q4", field: "Q4", width: 100 },
];
function MisReport() {
  const [dateRange, setDateRange] = useState("");

  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [months, setMonths] = useState([]);
  const [colm, setColm] = useState(initColumns);
  const { user, notifications } = useSelector((state) => state.login);

  const fetchMisReport = async () => {
    setLoading(true);
    const response = await imsAxios.get(`/mis/generate?date=${dateRange}`);
    // console.log("All DATA->", response);
    const { data } = response;
    setMonths(data.totalMonths);
    // console.log("data->", data);
    setLoading(false);
    let flatExpense = flattenArray(data.expenses_master);
    // flatExpense.filter((item) => item.ytd !== "0");
    console.log("data flatExpense", flatExpense);
    setAllData(flatExpense);
    arr = [];
    let flatIncomes = flattenArray(data.income_master);
    // let fianl = flatIncomes.filter((item) => );
    // arr = [...allData, flatIncomes];
    setIncomeData(flatIncomes);
    console.log("arrb->", flatIncomes);
    // let indirectIncomes = incomeMaster[0].children.filter(
    //   (row) => row.code === "8030000"
    // );
  };

  const handleDownloadCSV = () => {
    console.log("this is the income data", incomeData);
    console.log("this is the columns data", allData);
    let a = [...incomeData, ...allData];
    console.log(" a", a);
    return;
    downloadCSV([...incomeData, ...allData], colm, "MIS Report");
    // downloadCSV([...incomeData, ...allData], colm, "MIS Report");
  };

  const flattenArray = (array) => {
    array?.map((row) => {
      if (row.children && row.ytd != "0") {
        arr = [...arr, row];
        flattenArray(row.children);
      } else {
        // console.log("this is the row in the rlat array", {
        //   ...row,
        //   ...row.months,
        //   ...row.quarters,
        // });
        if (row.ytd != "0") {
          arr = [...arr, { ...row, ...row.months, ...row.quarters }];
        }
      }
    });
    return arr;
  };
  const customFlatArrayforExpense = (row) => {
    console.log("row->", row);

    row &&
      row.children?.map((row) => {
        if (
          row.type.toLowerCase() === "group" ||
          row.type.toLowerCase() === "master"
        ) {
          arrs = [...arrs, row];
          if (row.children) {
            let children = row.children;
            delete row["children"];
            arrs = [...arrs, row];
            customFlatArrayforExpense(arrs);
            arrs = [...arr, ...children];
            arrs.forEach((element) => {
              customFlatArrayforExpense(element);
              if (row.children) {
                //   element.forEach((e) => {
                //     arr = [...element, ...e];
                customFlatArrayforExpense(arrs);
                // });
              }
              // if (row.children) {
              //   let children = row.children;
              //   delete row["children"];
              //   arr = [...arr, row];
              //   customFlatArray(arr);
              //   arr = [...arr, ...children];
              //   arr.forEach((element) => {
              //     customFlatArray(element);
              //   });
              // }
              // let arrs = [...arr, ...element];
              // arrs.forEach((e) => {
              //   customFlatArray(e);
              // });
            });
          }
        } else {
          let children = row;
          arrs = [...arrs, children];
          // console.log("row with ledger", children);
          //   arr.forEach((element) => {
          //     customFlatArray(element);
          //   });
        }
        // } else if (row.type.toLowerCase() === "sub group") {
        //   console.log("children in subgrp", row);
        //   if (row.children) {
        //     let children = row.children;
        //     console.log("children in subgrp", children);
        //     delete row["children"];
        //     arr = [...arr, row];
        //     customFlatArray(children);
        //     arr = [...arr, ...children];
        //     arr.forEach((element) => {
        //       customFlatArray(element);
        //     });
        //     // }
        //   } else {
        //     arr = [...arr, row];
        //   }
        // } else {
        // }
      });

    //   console.log("items", items);
    // });

    return arrs;
  };
  let arr = [];
  let arrs = [];

  const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
  }));

  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<GridExpandMoreIcon sx={{ fontSize: "0.9rem" }} />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, .05)"
        : "rgba(0, 0, 0, .03)",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1),
    },
  }));

  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)",
  }));

  useEffect(() => {
    setColm((curr) => {
      let newCols = initColumns;
      newCols = months.map((e) => ({
        headerName: e,
        field: e,
        width: 100,
      }));

      curr = [...initColumns, ...newCols];
      return curr;
    });
  }, [months]);

  return (
    <div style={{ height: "80%" }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={5}>
          <MyDatePicker setDateRange={setDateRange} />
        </Col>
        <Space span={1}>
          <div>
            <Button loading={loading} type="primary" onClick={fetchMisReport}>
              Fetch
            </Button>
          </div>
          {/* <div>
            <CommonIcons
              action="downloadButton"
              size="small"
              type="secondary"
              onClick={handleDownloadCSV}
            />
          </div> */}
          <Space>
            <CommonIcons action="downloadButton" onClick={handleDownloadCSV} />
          </Space>
        </Space>
      </Row>
      <Col style={{ paddingBottom: 45 }}>
        <Card
          size="small"
          style={{ minHeight: "80%" }}
          bodyStyle={{ padding: 0, backgroundColor: "#F7F9FE" }}
        >
          <TableContainer sx={{ maxHeight: "75vh" }}>
            <Skeleton
              active
              loading={loading}
              paragraph={{
                rows: 15,
              }}
            >
              <div>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<GridExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    LoadingUnloding
                    // disabled={incomeData.length < 0}
                  >
                    <Typography>Income</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table stickyHeader sx={{ width: "100%" }} size="small">
                      <TableHead>
                        <TableRow>
                          {/* <TableCell>Code</TableCell> */}
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>YTD</TableCell>
                          <TableCell>Q1</TableCell>
                          <TableCell>Q2</TableCell>
                          <TableCell>Q3</TableCell>
                          <TableCell>Q4</TableCell>
                          {/* <TableCell> */}
                          {months?.map((month) => (
                            <TableCell key={month}>{month}</TableCell>
                          ))}
                          {/* </TableCell> */}

                          {/* <TableCell>Debit</TableCell>
                          <TableCell>Credit</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {incomeData.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                border: 0,
                              },
                            }}
                            style={{
                              backgroundColor: "#F7F9FE",
                            }}
                          >
                            {/* code */}
                            {/* <TableCell
                        style={{
                          fontWeight: row.type === "End Total" && "bold",
                        }}
                        component="th"
                        scope="row"
                      >
                        {row.code}
                      </TableCell> */}
                            {/* name */}

                            <TableCell
                              style={{
                                fontWeight:
                                  row.type === "Group" ||
                                  (row.type === "Master" && "bold"),
                                color:
                                  row.type === "Group"
                                    ? "#04B0A8"
                                    : row.type === "Sub Group"
                                    ? "#3b90b4"
                                    : "",
                              }}
                            >
                              {row.name}
                            </TableCell>
                            {/* type */}
                            <TableCell
                              style={{
                                fontWeight:
                                  row.type === "Group" ||
                                  (row.type === "Master" && "bold"),
                                color:
                                  row.type === "Group"
                                    ? "#04B0A8"
                                    : row.type === "Sub Group"
                                    ? "#3b90b4"
                                    : "",
                                // color: row.type === "End Total" && "#3cb1b9",
                              }}
                            >
                              {row.parent
                                ? row.type == "group"
                                  ? "Master"
                                  : "Sub Group"
                                : row.type == "ledger"
                                ? "Ledger"
                                : row.type}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#3cb1b9",
                              }}
                            >
                              {row.ytd}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q1
                                  ? (row.quarters?.Q1).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q2
                                  ? (row.quarters?.Q2).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q3
                                  ? (row.quarters?.Q3).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q4
                                  ? (row.quarters?.Q4).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            {/* //month */}
                            {/* <TableCell> */}
                            {/* {row.type === "ledger" && row.months ? (
                              <TableCell>{row.months}</TableCell>
                            ) : (
                              ""
                            )} */}
                            {row.type === "ledger"
                              ? months.map((month) => (
                                  <TableCell key={month}>
                                    {row?.months[month]}
                                  </TableCell>
                                ))
                              : months.map((month) => (
                                  <TableCell key={month}></TableCell>
                                ))}
                            {/* </TableCell> */}
                            {/* <TableCell> */}
                            {/* {row &&
                              row.keys(months).forEach((key) => {
                                // newObject[key] = fn(obj[key]);
                                <TableCell>{key}</TableCell>;
                              })} */}
                            {/* </TableCell> */}

                            {/* <TableCell>{row.totalMonths}</TableCell> */}
                            {/* debit */}
                            {/* <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "red",
                              }}
                            >
                              {row.debit}
                            </TableCell> */}
                            {/* credit */}
                            {/* <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.credit}
                            </TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </div>
              <div>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<GridExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    LoadingUnloding
                    // disabled={incomeData.length < 0}
                  >
                    <Typography>Expense</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table stickyHeader sx={{ width: "100%" }} size="small">
                      <TableHead>
                        <TableRow>
                          {/* <TableCell>Code</TableCell> */}
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>YTD</TableCell>
                          <TableCell>Q1</TableCell>
                          <TableCell>Q2</TableCell>
                          <TableCell>Q3</TableCell>
                          <TableCell>Q4</TableCell>
                          {/* <TableCell> */}
                          {months?.map((month) => (
                            <TableCell key={month}>{month}</TableCell>
                          ))}
                          {/* </TableCell> */}

                          {/* <TableCell>Debit</TableCell>
                          <TableCell>Credit</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allData.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                            style={{
                              backgroundColor: "#F7F9FE",
                            }}
                          >
                            {/* code */}
                            {/* <TableCell
                        style={{
                          fontWeight: row.type === "End Total" && "bold",
                        }}
                        component="th"
                        scope="row"
                      >
                        {row.code}
                      </TableCell> */}
                            {/* name */}
                            <TableCell
                              style={{
                                fontWeight:
                                  row.type === "Group" ||
                                  (row.type === "Master" && "bold"),
                                color:
                                  row.type === "Group"
                                    ? "#04B0A8"
                                    : row.type === "Sub Group"
                                    ? "#3b90b4"
                                    : "",
                              }}
                            >
                              {row.name}
                            </TableCell>
                            {/* type */}
                            <TableCell
                              style={{
                                fontWeight:
                                  row.type === "Group" ||
                                  (row.type === "Master" && "bold"),
                                // color: row.type === "End Total" && "#3cb1b9",
                                color:
                                  row.type === "Group"
                                    ? "#04B0A8"
                                    : row.type === "Sub Group"
                                    ? "#3b90b4"
                                    : "",
                              }}
                            >
                              {row.parent
                                ? row.type == "group"
                                  ? "Master"
                                  : "Sub Group"
                                : row.type == "ledger"
                                ? "Ledger"
                                : row.type}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#3cb1b9",
                              }}
                            >
                              {row.ytd}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q1
                                  ? (row.quarters?.Q1).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q2
                                  ? (row.quarters?.Q2).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q3
                                  ? (row.quarters?.Q3).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.type === "ledger"
                                ? row && row.quarters && row.quarters?.Q4
                                  ? (row.quarters?.Q4).toFixed(2)
                                  : "-"
                                : ""}
                            </TableCell>
                            {/* //month */}
                            {/* <TableCell> */}
                            {/* {row.type === "ledger" && row.months ? (
                              <TableCell>{row.months}</TableCell>
                            ) : (
                              ""
                            )} */}
                            {row.type === "ledger"
                              ? months.map((month) => (
                                  <TableCell key={month}>
                                    {row?.months[month]}
                                  </TableCell>
                                ))
                              : months.map((month) => (
                                  <TableCell key={month}></TableCell>
                                ))}
                            {/* </TableCell> */}
                            {/* <TableCell> */}
                            {/* {row &&
                              row.keys(months).forEach((key) => {
                                // newObject[key] = fn(obj[key]);
                                <TableCell>{key}</TableCell>;
                              })} */}
                            {/* </TableCell> */}

                            {/* <TableCell>{row.totalMonths}</TableCell> */}
                            {/* debit */}
                            {/* <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "red",
                              }}
                            >
                              {row.debit}
                            </TableCell> */}
                            {/* credit */}
                            {/* <TableCell
                              style={{
                                fontWeight: row.type === "End Total" && "bold",
                                color: row.type === "End Total" && "#26c426",
                              }}
                            >
                              {row.credit}
                            </TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </div>
            </Skeleton>
          </TableContainer>
        </Card>
      </Col>
    </div>
  );
}

export default MisReport;
