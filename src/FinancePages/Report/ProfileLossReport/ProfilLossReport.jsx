import { Button, Card, Col, Row, Space, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { imsAxios, socketLink } from "../../../axiosInterceptor";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { Link } from "react-router-dom";
import EditSheet from "./EditSheet";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { useSelector } from "react-redux";
import { v4 } from "uuid";
import socket from "../../../Components/socket";

function ProfilLossReport() {
  let arr = [];
  let flatArr = [];

  const [incomeRows, setIncomeRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [total, setTotal] = useState({
    indirectExpenses: 0,
    otherExpenses: 0,
    indirectIncome: 0,
    otherIcome: 0,
  });
  const [grossProfit, setGrossProfit] = useState(0);
  const [grossLoss, setGrossLoss] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [netLoss, setNetLoss] = useState(0);
  const [indirectExpensesRows, setIndirectExpensesRows] = useState([]);
  const [indirectIncomeRows, setIndirectIncomeRows] = useState([]);
  const [dateRange, setDateRange] = useState("");
  const [editingSheet, setEditingSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.login);

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/tally/reports/plReport", {
      date: dateRange,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let incomeMaster = data.data.income_master;
        let indirectIncomes = incomeMaster[0].children.filter(
          (row) => row.code === "8030000"
        );
        let otherIncomes = incomeMaster[0].children.filter(
          (row) => row.code !== "8030000"
        );

        let expensesMaster = data.data.expenses_master;
        let indirectExpenses = expensesMaster[0].children.filter(
          (row) => row.code === "6040000"
        );
        let otherExpenses = expensesMaster[0].children.filter(
          (row) => row.code !== "6040000"
        );

        let flatIndirectIncomes = customFlatArray(indirectIncomes);
        arr = [];
        let flatOtherIncomes = customFlatArray(otherIncomes);
        arr = [];
        let flatExpensesIncomes = customFlatArray(indirectExpenses);
        arr = [];
        let flatOtherExpenses = customFlatArray(otherExpenses);
        arr = [];

        setIndirectIncomeRows(flatIndirectIncomes);
        setIncomeRows(flatOtherIncomes);
        setIndirectExpensesRows(flatExpensesIncomes);
        setExpenseRows(flatOtherExpenses);
        let totalObj = {
          indirectExpenses: flatExpensesIncomes
            .filter((row) => row.type.toLowerCase() === "sub group")
            .reduce(
              (partialSum, a) =>
                partialSum +
                +Number(a.closing.toString().replaceAll(",", "")).toFixed(2),
              0
            ),
          otherExpenses: flatOtherExpenses
            .filter((row) => row.type.toLowerCase() === "sub group")
            .reduce(
              (partialSum, a) =>
                partialSum +
                +Number(a.closing.toString().replaceAll(",", "")).toFixed(2),
              0
            ),
          indirectIncome: flatIndirectIncomes
            .filter((row) => row.type.toLowerCase() === "sub group")
            .reduce((partialSum, a) => {
              return (
                partialSum +
                +Number(a.closing.toString().replaceAll(",", "")).toFixed(2)
              );
            }, 0),
          otherIcome: flatOtherIncomes
            .filter((row) => row.type.toLowerCase() === "sub group")
            .reduce(
              (partialSum, a) =>
                partialSum +
                +Number(a.closing.toString().replaceAll(",", "")).toFixed(2),
              0
            ),
        };
        let GP =
          totalObj.otherIcome - totalObj.otherExpenses > 0
            ? totalObj.otherIcome - totalObj.otherExpenses
            : 0;
        let GL =
          totalObj.otherExpenses - totalObj.otherIcome > 0
            ? totalObj.otherExpenses - totalObj.otherIcome
            : 0;
        let NP =
          GP + totalObj.indirectIncome - (totalObj.indirectExpenses + GL) > 0
            ? GP + totalObj.indirectIncome - (totalObj.indirectExpenses + GL)
            : 0;
        let NL =
          GL + totalObj.indirectExpenses - (totalObj.indirectIncome + GP) > 0
            ? GL + totalObj.indirectExpenses - (totalObj.indirectIncome + GP)
            : 0;

        setGrossProfit(+Number(GP).toFixed(2));
        setGrossLoss(+Number(GL).toFixed(2));
        setNetProfit(+Number(NP).toFixed(2));
        setNetLoss(+Number(NL).toFixed(2));
        console.log("gross profit is => ", GP);
        console.log("gross loss is => ", GL);
        console.log("net profit is => ", NP);
        console.log("net loss is => ", NL);
        setTotal(totalObj);
      } else {
        toast.error(data.message.msg);
        setIncomeRows([]);
        setExpenseRows([]);
      }
    }
  };
  const customFlatArray = (array) => {
    array?.map((row) => {
      if (row.type.toLowerCase() === "group") {
        if (row.children) {
          let children = row.children;
          delete row["children"];
          arr = [...arr, row];
          customFlatArray(children);
          arr = [...arr, ...children];
          // }
        } else {
          arr = [...arr, row];
        }
      } else if (row.type.toLowerCase() === "sub group") {
        return row;
      }
    });

    return arr;
  };
  const columns = [
    {
      title: "Name",
      // dataIndex: "name",
      key: "name",
      width: 300,
      render: (_, record) =>
        record.type.toLowerCase() === "ledger" ? (
          <Link
            style={{ marginLeft: 110 }}
            target="_blank"
            to={`/tally/ledger_report/${record.code}`}
            state={{ code: record }}
          >
            <ToolTipEllipses text={record.name} color="#1890ff" />
          </Link>
        ) : (
          <p
            style={{
              marginLeft:
                record.type.toLowerCase() === "group"
                  ? 40
                  : record.type.toLowerCase() === "sub group" && 80,
              fontWeight:
                (record.type.toLowerCase() === "master" ||
                  record.type.toLowerCase() === "group") &&
                700,

              // fontSize: record.type.toLowerCase() === "master" && "1rem",
            }}
          >
            <ToolTipEllipses text={record.name} />
          </p>
        ),
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 120,
      key: "type",
    },
    {
      title: "Closing",
      dataIndex: "closing",
      width: 150,
      key: "closing",
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 120,
      key: "code",
    },
  ];
  const downloadFun = () => {
    let directExpenseTotal = {
      total1:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? "Gross Profit"
          : "",
      total2:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherIcome).toFixed(2) -
            +Number(total.otherExpenses).toFixed(2)
          : "",
      total3:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? "Total"
          : "",
      total4:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? Number(
              +Number(total.otherExpenses).toFixed(2) +
                +Number(total.otherIcome).toFixed(2) -
                +Number(total.otherExpenses).toFixed(2)
            ).toFixed(2)
          : "",
      total5:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? "Other Expenses Total"
          : "",
      total6:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? total.otherExpenses
          : " ",
    };
    let directIncomeTotal = {
      total1:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? "Gross Loss"
          : "",
      total2:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherIcome).toFixed(2) -
            +Number(total.otherExpenses).toFixed(2)
          : "",
      total3:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? "Total"
          : "",
      total4:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherIcome).toFixed(2) +
            +Number(total.otherExpenses).toFixed(2) -
            +Number(total.otherIcome).toFixed(2)
          : "",
      total5:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? "Other Income Total"
          : "",
      total6:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? total.otherIcome
          : " ",
    };
    let inirectExpensesTotal = {
      total1:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? "Gross Loss"
          : "",
      total2:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherExpenses).toFixed(2) -
            +Number(total.otherIcome).toFixed(2)
          : "",
      total3:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? "Total"
          : "",
      total4:
        +Number(total.otherIcome).toFixed(2) <
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherIcome).toFixed(2) +
            +Number(total.otherExpenses).toFixed(2) -
            +Number(total.otherIcome).toFixed(2)
          : "",
      total5:
        Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? "Net Profit"
          : "",
      total6:
        Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherIcome).toFixed(2) -
            +Number(total.otherExpenses).toFixed(2) +
            total.indirectIncome -
            total.indirectExpenses
          : " ",
    };
    let inirectIncomeTotal = {
      total1:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? "Gross Profit"
          : "",
      total2:
        +Number(total.otherIcome).toFixed(2) >
        Number(total.otherExpenses).toFixed(2)
          ? +Number(total.otherIcome).toFixed(2) -
            +Number(total.otherExpenses).toFixed(2)
          : "",
      total3: "Total",
      total4:
        +Number(total.otherIcome).toFixed(2) -
        +Number(total.otherExpenses).toFixed(2) +
        total.indirectIncome,
      // total5:
      //   Number(total.otherIcome).toFixed(2) >
      //   Number(total.otherExpenses).toFixed(2)
      //     ? "Net Profit"
      //     : "",
      // total6:
      //   Number(total.otherIcome).toFixed(2) >
      //   Number(total.otherExpenses).toFixed(2)
      //     ? +Number(total.otherIcome).toFixed(2) -
      //       +Number(total.otherExpenses).toFixed(2) +
      //       total.indirectIncome -
      //       total.indirectExpenses
      //     : " ",
    };
    let newId = v4();
    let expense = flatArray(expenseRows);
    flatArr = [];
    let income = flatArray(incomeRows);
    flatArr = [];
    let indirectExpense = flatArray(indirectExpensesRows);
    flatArr = [];
    let indirectIncome = flatArray(indirectIncomeRows);
    flatArr = [];
    let obj = {
      directExpenseTotal,
      directIncomeTotal,
      inirectExpensesTotal,
      inirectIncomeTotal,
      notificationId: newId,
      otherdata: { date: dateRange },
      type: "file",
      arr1: expense,
      arr2: income,
      arr3: indirectExpense,
      arr4: indirectIncome,
    };
    socket.emit("printPL", JSON.stringify(obj));
  };
  const flatArray = (array) => {
    array?.map((row) => {
      if (row.children) {
        flatArr = [...flatArr, row];

        flatArray(row.children);

        if (row.type === "ledger") {
          flatArr = [...flatArr, row];
        }
      } else {
        flatArr = [...flatArr, row];
        if (row.children) {
          flatArr = [...flatArr, ...row.legers];
        }
      }
    });

    return flatArr;
  };

  useEffect(() => {
    arr = [];
  }, [expenseRows, incomeRows]);
  return (
    <div
      style={{ height: "80%", padding: 5, paddingTop: 0, marginBottom: 100 }}
    >
      <Row justify="space-between">
        <EditSheet
          editingSheet={editingSheet}
          setEditingSheet={setEditingSheet}
        />
        <Space>
          <div style={{ width: 300 }}>
            <MyDatePicker setDateRange={setDateRange} />
          </div>
          <Button
            loading={loading === "fetch"}
            type="primary"
            onClick={getRows}
          >
            Fetch
          </Button>
        </Space>
        <Space>
          <CommonIcons
            action="editButton"
            onClick={() => setEditingSheet(true)}
          />
          <CommonIcons
            // disabled={rows.length === 0}
            action="downloadButton"
            onClick={downloadFun}
          />
        </Space>
        <Col style={{ marginTop: 5, paddingBottom: 100 }} span={24}>
          <Row gutter={6}>
            <Col span={24}>
              <Row gutter={[6, 6]}>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{ minHeight: "52vh" }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <Row style={{ height: "40vh" }}>
                      <Table
                        style={{ width: "100%" }}
                        columns={columns}
                        bordered={false}
                        pagination={false}
                        size="small"
                        scroll={{ y: "35vh" }}
                        dataSource={expenseRows}
                      />
                    </Row>
                    <Row
                      justify="end"
                      style={{ paddingTop: 20, paddingRight: 20 }}
                    >
                      <Typography.Text style={{ fontWeight: 700 }}>
                        {Number(grossProfit) > 0 && (
                          <>
                            Gross Profit :
                            {" " + +Number(grossProfit).toFixed(2)}
                          </>
                        )}
                        <br></br>

                        <>
                          Total :{" "}
                          {
                            +Number(total.otherExpenses + grossProfit).toFixed(
                              2
                            )
                          }
                        </>
                      </Typography.Text>
                    </Row>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{ minHeight: "52vh" }}
                    bodyStyle={{ padding: 0, height: "100%" }}
                  >
                    <Row style={{ height: "40vh" }}>
                      <Table
                        style={{ width: "100%" }}
                        columns={columns}
                        bordered={false}
                        pagination={false}
                        size="small"
                        scroll={{ y: "35vh" }}
                        dataSource={incomeRows}
                      />
                    </Row>
                    <Row
                      justify="end"
                      style={{ paddingTop: 20, paddingRight: 20 }}
                    >
                      <Typography.Text style={{ fontWeight: 700 }}>
                        {Number(grossLoss) > 0 && (
                          <>Gross Loss :{" " + +Number(grossLoss).toFixed(2)}</>
                        )}
                        <br></br>
                        Total :{" "}
                        {+Number(total.otherIcome + grossLoss).toFixed(2)}
                      </Typography.Text>
                    </Row>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{ minHeight: "52vh" }}
                    bodyStyle={{
                      padding: 0,
                      overflowY: "auto",
                      height: "100%",
                    }}
                  >
                    <Row style={{ height: "40vh" }}>
                      <Table
                        style={{ width: "100%" }}
                        columns={columns}
                        bordered={false}
                        pagination={false}
                        size="small"
                        scroll={{ y: "35vh" }}
                        dataSource={indirectExpensesRows}
                      />
                    </Row>
                    <Row
                      justify="end"
                      style={{ paddingTop: 20, paddingRight: 20 }}
                    >
                      <Col>
                        <Typography.Text style={{ fontWeight: 700 }}>
                          {Number(grossLoss) > 0 && (
                            <>
                              Gross Loss :{" " + +Number(grossLoss).toFixed(2)}
                            </>
                          )}
                        </Typography.Text>
                        <br></br>
                        <Typography.Text style={{ fontWeight: 700 }}>
                          {Number(netProfit) > 0 && (
                            <>
                              Net Profit :{" " + +Number(netProfit).toFixed(2)}
                            </>
                          )}
                        </Typography.Text>
                        <br></br>
                        <Typography.Text style={{ fontWeight: 700 }}>
                          <>
                            Total :
                            {" " +
                              Number(
                                +Number(grossLoss).toFixed(2) +
                                  +Number(total.indirectExpenses).toFixed(2) +
                                  +Number(netProfit).toFixed(2)
                              ).toFixed(2)}
                          </>
                        </Typography.Text>
                        <br></br>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ minHeight: "52vh" }}>
                    <Row style={{ height: "40vh" }}>
                      <Table
                        style={{ width: "100%" }}
                        columns={columns}
                        bordered={false}
                        pagination={false}
                        size="small"
                        scroll={{ y: "35vh" }}
                        dataSource={indirectIncomeRows}
                      />
                    </Row>
                    <Row
                      justify="end"
                      style={{ paddingTop: 20, paddingRight: 20 }}
                    >
                      <Col>
                        <Typography.Text style={{ fontWeight: 700 }}>
                          {Number(grossProfit) > 0 && (
                            <>
                              Gross Profit :
                              {" " + +Number(grossProfit).toFixed(2)}
                            </>
                          )}
                        </Typography.Text>
                        <br></br>
                        <Typography.Text style={{ fontWeight: 700 }}>
                          {Number(netLoss) > 0 && (
                            <>Net Loss :{" " + +Number(netLoss).toFixed(2)}</>
                          )}
                        </Typography.Text>
                        <br></br>
                        <Typography.Text style={{ fontWeight: 700 }}>
                          <>
                            Total :
                            {" " +
                              Number(
                                +Number(grossProfit).toFixed(2) +
                                  +Number(total.indirectIncome).toFixed(2) +
                                  Number(netLoss)
                              ).toFixed(2)}
                          </>
                        </Typography.Text>
                        <br></br>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default ProfilLossReport;
