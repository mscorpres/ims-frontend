import { Card, Col, List, Row, Steps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { imsAxios } from "../../axiosInterceptor";
import SummarySection from "./SummarySection";
import BarChart from "./BarChart";
import { StarFilled, StarOutlined, StarTwoTone } from "@ant-design/icons";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import "./index.css";
import CircleNumber from "./CircleNumber";
import { width } from "@mui/system";
import { Timeline } from "@mui/icons-material";
function ProcurementDashboard() {
  const [summaryDate, setSummaryDate] = useState("");
  const [barChartData, setBarChartData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [masterData, setMasterData] = useState("");
  const [transactionSummary, setTransactionSummary] = useState([
    {
      title: "Rejection",
      date: "",
      value: "",
    },
    {
      title: "MFG",
      date: "",
      value: "",
    },
    {
      title: "Consumption",
      date: "",
      value: "",
      // link: "/transaction-In",
    },
  ]);
  const gettingDateSummary = async (transactionType, date) => {
    try {
      let params =
        transactionType === "transactions"
          ? "transaction"
          : transactionType === "gatePass"
          ? "GP"
          : transactionType === "min" && "MIN";
      setLoading((curr) => ({
        ...curr,
        [transactionType]: true,
      }));
      const response = await imsAxios.post(
        `/tranCount/transaction_counts/${params}`,
        {
          data: date,
        }
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          if (transactionType === "transactions") {
            setTransactionSummary([
              {
                title: "Total Rejection",
                value: data.data.totalRejection,
                date: data.data.lastRejection,
              },
              {
                title: "Total MFG",
                value: data.data.totalMFG,
                date: data.data.lastMFG,
              },
              {
                title: "Total Consumption",
                value: data.data.totalConsumption,
                date: data.data.lastConsumption,
                // link: "/transaction-In",
              },
            ]);
          } else if (transactionType === "gatePass") {
            setGatePassSummary([
              {
                title: "Gatepass",

                value: data.data.totalGatePass,
              },
              {
                title: "RGP",
                date: data.data.lastRGP,
                value: data.data.totalRGP,
              },
              {
                title: "NRGP",
                date: data.data.lastNRGP,
                value: data.data.totalNRGP,
              },
              {
                title: "Challan",
                date: data.data.lastDCchallan,
                value: data.data.totalRGP_DCchallan,
              },
            ]);
          } else if (transactionType === "min") {
            setMINSummary([
              {
                title: "PO MIN",
                date: data.data.lastMin,
                value: data.data.totalPOMin,
              },
              {
                title: "Without PO MIN",
                date: data.data.lastNormalMin,
                value: data.data.totalNormalMIN,
              },

              {
                title: "JW MIN",
                date: data.data.lastJWMin,
                value: data.data.totalJWMin,
                key: "jwMin",
              },
            ]);
          }
        }
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
    } finally {
      setLoading((curr) => ({
        ...curr,
        [transactionType]: false,
      }));
    }
  };
  useEffect(() => {
    if (summaryDate && summaryDate.split("-").length > 2) {
      gettingDateSummary("transactions", summaryDate);
      gettingDateSummary("gatePass", summaryDate);
      gettingDateSummary("min", summaryDate);
    }
  }, [summaryDate]);

  var chartData;
  const getPartNumDashboard = async () => {
    const response = await imsAxios.get("/dashboard/commonData");
    console.log("responsesss->", response);
    if (response.success) {
      let arr = response?.data?.topPart;
      setMasterData(response?.data);
      // console.log("arr", arr);
      chartData = {
        labels: arr.map((r) => r?.partCode),
        values: arr.map((r) => r?.name.split(",")[1]),
      };
      setVendorData(response?.data?.topPo);

      // if (a.length > 0) {
      //   a = chartData;
      // }
      setBarChartData(chartData);
    }
    // console.log("chartData", chartData);
    // console.log("chartData", barChartData);
  };
  //  = {
  //   labels: ["P0002", "P0011", "P0019", "P0014", "P0018", "P0010"],
  //   values: [12, 19, 3, 5, 2, 3], // Example data values
  // };
  const lineData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Total",
        data: [65, 59, 80, 81, 56, 55],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
      {
        label: "Domestic",
        data: [45, 89, 70, 91, 66, 75],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
      },
      {
        label: "Income",
        data: [35, 69, 60, 71, 46, 65],
        borderColor: "rgba(255, 205, 86, 1)",
        backgroundColor: "rgba(255, 205, 86, 0.2)",
        borderWidth: 2,
      },
    ],
  };
  const pieData = {
    labels: ["Purple", "Blue", "Yellow", "Green", "Purple"],
    values: [804, 16, 0, 0, 0],
  };
  useEffect(() => {
    getPartNumDashboard();
  }, []);

  return (
    <div style={{ height: "50vh" }}>
      <Card
        style={{
          background: "#e3efea",
          //   background: "#F5F5F5",
          height: "93vh",
          width: " 93vw",
          margin: "1em 2em 1em 2em",
        }}
      >
        <Row>
          {" "}
          {/* <SummarySection
            title="Transactions Summary"
            summary={transactionSummary}
            //   loading={loading["transactions"]}
          /> */}
          {/* <PieChart data={pieData} /> */}
          <Card style={{ width: "30vw" }}>
            {" "}
            <Row gutter={24}>
              <Col span={8}>
                <CircleNumber value={840} heading={"Total Vendors"} />
              </Col>
              {/* <Col span={4}>
                <CircleNumber value={12} heading={"GST Verified"} />
              </Col>
              <Col span={4}>
                <CircleNumber value={12} heading={"Total Vendors"} />
              </Col> */}
              <Col span={8}>
                <CircleNumber
                  value={masterData?.totalComponent}
                  heading={"Total Component"}
                />
              </Col>
              <Col span={8}>
                <CircleNumber
                  value={masterData?.totalProject}
                  heading={"Total Project"}
                />
              </Col>
            </Row>
          </Card>
          <Card style={{ width: "62rem", marginLeft: "2em" }}>
            <Steps
              // current={1}
              items={[
                {
                  title: "Create Order",
                  // description,
                  description: "0 Days",
                },
                {
                  title: "Approval",
                  // description,
                  description: "2 Days",
                },
                {
                  title: "MIN",
                  // description,
                  description: "2 Days",
                },
                {
                  title: "Bill Booking",
                  description: "2 Days",
                  // description,
                },
                {
                  title: "Payment",
                  // description,
                  description: "2 Days",
                },
              ]}
            />
          </Card>
        </Row>
        <Row style={{ marginTop: "2em" }}>
          <Col span={24}>
            <Row gutter={[2, 2]}>
              <Col span={10} style={{ height: "10vh" }}>
                <div style={{ height: "22rem", width: " 27rem" }}>
                  <BarChart data={barChartData} />
                </div>
              </Col>
              <Col
                span={10}
                style={{
                  height: "10vh",
                  marginLeft: "-7rem",
                  marginRight: "-5rem",
                }}
              >
                <LineChart data={lineData} />
              </Col>
              <Card
                style={{ width: "26vw", height: "50vh" }}
                title={"Top Vendors"}
              >
                {" "}
                {/* <BarChart data={chartData} /> */}
                {/* <Card size="small"> */}
                <List
                  dataSource={vendorData}
                  renderItem={(item) => (
                    <>
                      <List.Item key={vendorData.name}>
                        <StarTwoTone
                          style={{ marginRight: "1em" }}
                          twoToneColor="#ffd700"
                        />
                        <List.Item.Meta title={item.name} />
                        <div>{item.venCode}</div>
                      </List.Item>
                    </>
                  )}
                />
                {/* </Card> */}
              </Card>
            </Row>
          </Col>
        </Row>
      </Card>
      {/* <Row> */}
    </div>
  );
}

export default ProcurementDashboard;
