import {
  Card,
  Col,
  Flex,
  Input,
  List,
  Row,
  Select,
  Steps,
  Typography,
} from "antd";
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
import AreaChart from "./AreaChart";
import RadiusChart from "./RadiusChart";
import MyDatePicker from "../../Components/MyDatePicker";
import BubbleChart from "./bubbleChart";
import RePieChart from "./RePieChart";
import RePieForPO from "./RePieForPO";
function ProcurementDashboard() {
  const [summaryDate, setSummaryDate] = useState("");
  const [barChartData, setBarChartData] = useState([]);
  const [areaChartData, setAreaChartData] = useState([]);
  const [areaChartLabel, setAreaChartLabel] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [masterData, setMasterData] = useState("");
  const [domesticPOData, setDomesticPoData] = useState([]);
  const [combinedPoData, setCombinedData] = useState([]);
  const [totalPOData, setTotalPoData] = useState([]);
  const [importPOData, setImportPoData] = useState([]);
  const [gstGraphLables, setGstGraphLables] = useState([]);
  const [gstGraphData, setGstGraphData] = useState([]);
  const [totVendors, setTotVendors] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [chartlabels, setChartlabels] = useState([]);
  const [totVen, setTotVen] = useState("");
  const [totRegGST, setTotRegGST] = useState([]);
  const [totNotRegGST, setTotNotRegGST] = useState([]);

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
    if (response.success) {
      let arr = response?.data?.topPart;
      setMasterData(response?.data);
      // setAreaChartData(response?.data);
      chartData = {
        labels: arr.map((r) => r?.partCode),
        values: arr.map((r) => r?.total_value / 10000000),
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
  const getPendingPO = async () => {
    const response = await imsAxios.get("/dashboard/po_pending_counts");
    const { data } = response;
    if (response.success) {
      let b = Object.values(data);
      let labels = Object.keys(data);
      let arr = [];
      for (let keys in data) {
        let newK = data[keys];
        // console.log("newk", newK);
        let obj = {
          name: keys,
          value: newK,
        };
        arr = [...arr, obj];
      }
      console.log("arr", arr);
      setAreaChartData(arr);
      setAreaChartLabel(labels);
      setChartlabels(response.data);
    }
  };
  const vendorRegistered = async () => {
    const response = await imsAxios.get("/dashboard/vendorData");
    const { data } = response;
    // return;
    if (response.success) {
      let b = Object.values(data);
      let labels = Object.keys(data);
      setGstGraphData(b);
      // setGstGraphLables(labels);
      setGstGraphLables(["Total Vendors", "Registered", "Unregeistered"]);
      setTotVendors(response.data.totalVendors);
      // const { data } = response;
      // const totalVendors = [];
      // const registeredWithGST = [];
      // const registeredWithoutGST = [];

      // data.forEach((item) => {
      //   const values = Object.values(item)[0];
      //   totalVendors.push(values.totalVendors);
      //   registeredWithGST.push(values.registeredWithGST);
      //   registeredWithoutGST.push(values.registeredWithoutGST);
      // });

      // console.log("datas:", data);
      // setTotVen(totalPoValues);
      // setTotRegGST(registeredWithGST);
      // setTotNotRegGST(registeredWithoutGST);
      // console.log("Domestic PO Values:", domesticPoValues);
      // console.log("Import PO Values:", importPoValues);
    }

    // console.log("b", labels);
    // setAreaChartData(b);
    // setAreaChartLabel(labels);
  };

  let labels = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];
  const getPoDetails = async () => {
    const response = await imsAxios.get("/dashboard/po_trends");
    if (response.success === true) {
      const { data } = response;
      // console.log("respinse for pending po", response);
      setCombinedData(response.data);
      const totalPoValues = [];
      const domesticPoValues = [];
      const importPoValues = [];

      data.forEach((item) => {
        const values = Object.values(item)[0];
        // console.log("values", values);
        totalPoValues.push(values.total_po);
        domesticPoValues.push(values.domestic_po);
        importPoValues.push(values.import_po);
      });

      // console.log("Total PO Values:", totalPoValues);
      setTotalPoData(totalPoValues);
      setDomesticPoData(domesticPoValues);
      setImportPoData(importPoValues);
      // console.log("Domestic PO Values:", domesticPoValues);
      // console.log("Import PO Values:", importPoValues);
    }
  };

  const pieData = {
    labels: ["Purple", "Blue", "Yellow", "Green", "Purple"],
    values: [804, 16, 0, 0, 0],
  };
  useEffect(() => {
    getPartNumDashboard();
    getPoDetails();
    getPendingPO();
    vendorRegistered();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      {/* <div>
        
      </div> */}
      <Card
        style={{
          background: "#e3efea",
          //   background: "#F5F5F5",
          height: "80vh",
          // width: " 93vw",
          margin: "1em 2em 1em 2em",
          overflowY: "scroll",
        }}
      >
        <Row justify="space-between" gutter={[10, 0]}>
          <Col span={15} style={{ padding: 0 }}>
            <Flex
              vertical
              gap={8}
              style={{ height: "100%" }}
              // justify="end"
            >
              <Flex justify="end">
                {/* <div style={{ flex: 1 }}>
                  {" "}
                  <Row>
                    <Col span={8}>
                      <RadiusChart
                        data={gstGraphData}
                        labels={gstGraphLables}
                      />
                    </Col>
                  </Row>
                </div> */}
                <div style={{ flex: 1 }}>
                  {/* <MyDatePicker setDateRange={setDateRange} />{" "} */}
                  <span style={{ display: "flex" }}>
                    <Col span={10}>
                      <Input
                        placeholder="Filled"
                        variant="filled"
                        value="Financial Year  2023 - 2024 "
                        style={{
                          borderBottomWidth: "medium",
                          borderRadius: "3%",
                          marginBottom: " 2.5rem",
                        }}
                        disabled
                      ></Input>
                    </Col>
                    {/* <Input
                      placeholder="Filled"
                      variant="filled"
                      value="2023- 2024"
                      disabled
                    ></Input> */}
                  </span>
                  <Card>
                    {" "}
                    <Row gutter={[10, 10]}>
                      <Col span={24}>
                        <Row justify="end">
                          {" "}
                          <Col span={8}>
                            <CircleNumber
                              value={totVendors}
                              heading={"Total Vendors"}
                            />
                          </Col>
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
                      </Col>
                    </Row>
                  </Card>
                </div>{" "}
                <div style={{ flex: 0.5 }}>
                  {" "}
                  <Row>
                    <Col span={8}>
                      {/* <RadiusChart
                        datas={gstGraphData}
                        labels={gstGraphLables}
                      /> */}
                      <BubbleChart
                        datas={gstGraphData}
                        labels={gstGraphLables}
                      />
                    </Col>
                  </Row>
                </div>
              </Flex>
              <Flex style={{ flex: 1 }}>
                <Card
                  style={{ flex: 1 }}
                  bodyStyle={{ flex: 1, height: "100%" }}
                >
                  <Flex align="center" style={{ flex: 1, height: "100%" }}>
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
                  </Flex>
                </Card>
              </Flex>
            </Flex>
          </Col>
          <Col span={9}>
            <RePieChart data={areaChartData} />
            {/* <AreaChart data={areaChartData} label={areaChartLabel} /> */}
          </Col>
        </Row>
        <Row style={{ marginTop: 10 }}>
          <Col span={24}>
            <Row gutter={[80, 10]}>
              <Col
                span={10}
                style={
                  {
                    // height: "10vh",
                    // marginLeft: "-11rem",
                    // marginRight: "-5rem",
                  }
                }
              >
                <LineChart
                  labels={labels}
                  importPOData={importPOData}
                  domesticPOData={domesticPOData}
                  totalPOData={totalPOData}
                  combinedPoData={combinedPoData}
                />
                {/* <RePieForPO combinedPoData={combinedPoData} /> */}
              </Col>
              <Col span={7} style={{ height: "10vh" }}>
                {/* <div style={{ height: "20rem", width: " 27rem" }}> */}
                <BarChart data={barChartData} />
                {/* </div> */}
              </Col>

              <Col span={7}>
                <Card
                  size="small"
                  // style={{ width: "26vw", height: "50vh", marginRight: "4em" }}
                  title={"Top Vendors (Value in Crores"}
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
                          <List.Item.Meta
                            title={item.name + " " + "(" + item.venCode + ")"}
                          />
                          <div>
                            {Number(item.total_po_value / 10000000).toFixed(2)}
                          </div>
                        </List.Item>
                      </>
                    )}
                  />
                  {/* </Card> */}
                </Card>
              </Col>
              <Col span={10} style={{ height: "10vh" }}>
                <div style={{ height: "22rem", width: " 27rem" }}>
                  {/* <BarChart data={barChartData} /> */}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      {/* <Row> */}
    </div>
  );
}

export default ProcurementDashboard;
