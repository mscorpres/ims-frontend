import { Card, Col, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { imsAxios } from "../../axiosInterceptor";
import SummarySection from "./SummarySection";
import BarChart from "./BarChart";
import { StarFilled, StarOutlined, StarTwoTone } from "@ant-design/icons";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import "./index.css";
import CircleNumber from "./CircleNumber";
function ProcurementDashboard() {
  const [summaryDate, setSummaryDate] = useState("");
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
  const getProcurementData = async () => {
    const response = await imsAxios.get("/dashboard/commonData");
    console.log("response", response);
  };
  //   useEffect(() => {
  //     getProcurementData();
  //   }, []);
  const chartData = {
    labels: ["P0002", "P0011", "P0019", "P0014", "P0018", "P0010"],
    values: [12, 19, 3, 5, 2, 3], // Example data values
  };
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
          <Card>
            {" "}
            <Row gutter={24}>
              <Col span={8}>
                <CircleNumber value={840} heading={"Total Vendors"} />
              </Col>
              <Col span={8}>
                <CircleNumber value={12} heading={"GST verified"} />
              </Col>
              <Col span={8}>
                <CircleNumber value={12} heading={"Total Vendors"} />
              </Col>
            </Row>
          </Card>
        </Row>
        <Row style={{ marginTop: "2em" }}>
          <Col span={24}>
            <Row gutter={[2, 2]}>
              <Col span={10} style={{ height: "10vh" }}>
                <BarChart data={chartData} />
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
                <Card size="small">
                  <StarTwoTone twoToneColor="#ffd700" />
                  <Typography.Text style={{ margin: "1em" }}>
                    vendor
                  </Typography.Text>
                </Card>
                <Card size="small">
                  <StarTwoTone twoToneColor="#ffd700" />
                  <Typography.Text style={{ margin: "1em" }}>
                    vendor
                  </Typography.Text>
                </Card>
                <Card size="small">
                  <StarTwoTone twoToneColor="#ffd700" />
                  <Typography.Text style={{ margin: "1em" }}>
                    vendor
                  </Typography.Text>
                </Card>
                <Card size="small">
                  <StarTwoTone twoToneColor="#ffd700" />
                  <Typography.Text style={{ margin: "1em" }}>
                    vendor
                  </Typography.Text>
                </Card>
                <Card size="small">
                  <StarTwoTone twoToneColor="#ffd700" />
                  <Typography.Text style={{ margin: "1em" }}>
                    vendor
                  </Typography.Text>
                </Card>
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
