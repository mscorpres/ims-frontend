import {
  Card,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "@/axiosInterceptor";
import MyDatePicker from "@/Components/MyDatePicker.jsx";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import { Link } from "react-router-dom";
import EditSheet from "./EditSheet";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MySelect from "@/Components/MySelect";
import { v4 } from "uuid";
import socket from "@/Components/socket";
import MyButton from "@/Components/MyButton";
import { convertToNumber } from "@/utils/general";
import { scalingCurrencyOptions, scalingOptions } from "@/utils/selectOptions";

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
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [currentCurrency, setCurrnetCurrency] = useState("inr");
  const [currentExchangeRate, setCurrentExchangeRate] = useState(1);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currentScaling, setCurrentScaling] = useState("0");

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/tally/reports/plReport", {
      date: dateRange,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let incomeMaster = addOriginalQty(
          JSON.parse(JSON.stringify(data.data.income_master))
        );
        let indirectIncomes = incomeMaster[0].children.filter(
          (row) => row.code === "8030000"
        );
        let otherIncomes = incomeMaster[0].children.filter(
          (row) => row.code !== "8030000"
        );

        let expensesMaster = addOriginalQty(
          JSON.parse(JSON.stringify(data.data.expenses_master))
        );
        // let expensesMaster = data.data.expenses_master;
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

        console.log("flatOtherIncomes is => ", flatOtherIncomes);
        console.log("flatExpensesIncomes is => ", flatExpensesIncomes);
        console.log("flatOtherExpenses is => ", flatOtherExpenses);
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
        return { ...row, originalClosing: row.closing };
      }
    });

    return arr;
  };

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
  const applyScaling = (scaling, exchangeRate, rows) => {
    let amount = 1;
    let suffix = "";
    switch (scaling) {
      case "T":
        amount = 1000;
        suffix = "K";
        break;
      case "L":
        amount = 100000;
        suffix = "L";
        break;
      case "Cr":
        amount = 10000000;
        suffix = "Cr";
        break;

      default:
        amount = 1;
    }
    setCurrentPrefix(suffix);
    let arr = rows;
    return arr.map((row) => {
      if (row.children) {
        row.closing = +Number(
          +Number(convertToNumber(row.originalClosing) / exchangeRate) / amount
        ).toFixed(2);

        row.suffix = suffix;
        applyScaling(scaling, exchangeRate, row.children);
      } else {
        row.closing = +Number(
          +Number(convertToNumber(row.originalClosing) / exchangeRate) / amount
        ).toFixed(2);

        row.suffix = suffix;
      }
      return row;
    });
  };
  useEffect(() => {
    arr = [];
  }, [expenseRows, incomeRows]);

  useEffect(() => {
    setIncomeRows((curr) => {
      return applyScaling(currentScaling, currentExchangeRate, curr);
    });
    setIndirectIncomeRows((curr) => {
      return applyScaling(currentScaling, currentExchangeRate, curr);
    });
    setIndirectExpensesRows((curr) => {
      return applyScaling(currentScaling, currentExchangeRate, curr);
    });
    setExpenseRows((curr) => {
      return applyScaling(currentScaling, currentExchangeRate, curr);
    });
  }, [currentScaling, currentExchangeRate]);
  useEffect(() => {
    if (currentCurrency === "foreign") {
      setShowCurrencyModal(true);
    } else {
      setCurrentExchangeRate(1);
    }
  }, [currentCurrency]);

  return (
    <Flex
      vertical
      gap={5}
      style={{ height: "95%", padding: 10, width: "100%", overflowY: "auto" }}
    >
      <CurrencyModal
        show={showCurrencyModal}
        hide={() => setShowCurrencyModal(false)}
        setCurrentExchangeRate={setCurrentExchangeRate}
        setCurrnetCurrency={setCurrnetCurrency}
        currentExchangeRate={currentExchangeRate}
      />
      <Row justify="space-between">
        <EditSheet
          editingSheet={editingSheet}
          setEditingSheet={setEditingSheet}
        />
        <Space>
          <div style={{ width: 250 }}>
            <MyDatePicker setDateRange={setDateRange} />
          </div>
          <MyButton
            loading={loading === "fetch"}
            type="primary"
            onClick={getRows}
            variant="search"
          >
            Fetch
          </MyButton>
        </Space>
        <Col>
          <Space>
            <div style={{ width: 100 }}>
              <MySelect
                onChange={setCurrnetCurrency}
                value={currentCurrency}
                options={scalingCurrencyOptions}
              />
            </div>
            <div style={{ width: 150 }}>
              <MySelect
                onChange={setCurrentScaling}
                value={currentScaling}
                options={scalingOptions}
              />
            </div>

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
        </Col>
      </Row>
      <Flex
        style={{
          display: "grid",
          gridTemplateColumns: "50% 50%",
          gridTemplateRows: "50% 50% ",
          height: "95%",
        }}
      >
        <Card
          bodyStyle={{ height: "100%", overflowY: "auto" }}
          size="small"
          style={{ margin: 2 }}
        >
          <Flex vertical style={{ height: "100%" }}>
            <MyTable rows={expenseRows} />

            {/* {Number(grossProfit) > 0 && ( */}
            <>
              <Description
                label="Gross Profit"
                value={grossProfit.toString()}
              />
            </>
            <>
              <Description
                label="Total"
                value={
                  +Number(total.otherExpenses + grossProfit)
                    .toFixed(2)
                    .toString()
                }
              />
            </>
            {/* )} */}
          </Flex>
        </Card>
        <Card
          bodyStyle={{ height: "100%", overflowY: "auto" }}
          size="small"
          style={{ margin: 2 }}
        >
          <Flex vertical style={{ height: "100%" }}>
            <MyTable rows={incomeRows} />
            {/* {Number(grossLoss) > 0 && ( */}
            <>
              <Description label="Gross Loss" value={grossLoss.toString()} />
            </>
            <>
              <Description
                label="Total"
                value={
                  +Number(total.otherIcome + grossLoss)
                    .toFixed(2)
                    .toString()
                }
              />
            </>
            {/* )} */}
          </Flex>
        </Card>
        <Card
          bodyStyle={{ height: "100%", overflowY: "auto" }}
          size="small"
          style={{ margin: 2 }}
        >
          <Flex vertical style={{ height: "100%" }}>
            <MyTable bottom={true} rows={indirectExpensesRows} />
            {/* {Number(grossLoss) > 0 && ( */}
            <>
              <Description label="Gross Loss" value={grossLoss.toString()} />
            </>
            <>
              <Description
                label="Total"
                value={
                  +Number(total.otherIcome + grossLoss)
                    .toFixed(2)
                    .toString()
                }
              />
            </>
            {/* )} */}
            <Description label="Net Profit" value={netProfit.toString()} />
          </Flex>
        </Card>
        <Card
          bodyStyle={{ height: "100%", overflowY: "auto" }}
          size="small"
          style={{ margin: 2 }}
        >
          <Flex vertical style={{ height: "100%" }}>
            <MyTable bottom={true} rows={indirectIncomeRows} />
            <>
              <Description
                label="Gross Profit"
                value={grossProfit.toString()}
              />
            </>
            {/* {Number(netLoss) > 0 && ( */}
            <>
              <Description label="Net Loss" value={netLoss.toString()} />
            </>

            {/* )} */}
            <Description
              label="Total"
              value={
                +Number(
                  +Number(grossProfit).toFixed(2) +
                    +Number(total.indirectIncome).toFixed(2) +
                    Number(netLoss)
                )
                  .toFixed(2)
                  .toString()
              }
            />
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}

export default ProfilLossReport;
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
    render: (_, record) => (
      <p>
        <ToolTipEllipses
          text={`${record.closing.toLocaleString("en-IN")} ${
            record.suffix ?? ""
          }`}
        />
      </p>
    ),
  },
  {
    title: "Code",
    dataIndex: "code",
    width: 120,
    key: "code",
  },
];

const addOriginalQty = (arr: []) => {
  return arr.map((row) => {
    if (row.children) {
      row.originalClosing = row.closing;
      row.closing = convertToNumber(row.closing);
      addOriginalQty(row.children);
    } else {
      row.originalClosing = row.closing;
      row.closing = convertToNumber(row.closing);
    }

    return row;
  });
};

const CurrencyModal = ({
  show,
  hide,
  setCurrentExchangeRate,
  currentExchangeRate,
  setCurrnetCurrency,
}) => {
  const [form] = Form.useForm();

  const handleUpdateRate = () => {
    const rate = form.getFieldValue("rate");
    setCurrentExchangeRate(rate);
    if (rate === "") {
      setCurrnetCurrency("inr");
    }
    hide();
  };

  const handleHide = () => {
    const rate = form.getFieldValue("rate");
    console.log("this is rate", rate);
    if (rate === "" || rate === undefined || currentExchangeRate === 1) {
      setCurrnetCurrency("inr");
    }
    hide();
  };
  return (
    <Modal
      width={300}
      open={show}
      onCancel={handleHide}
      title="Currency Rate"
      okText="Apply"
      onOk={handleUpdateRate}
    >
      <Row justify="center">
        <Col span={24}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="rate"
              label="Exchange Rate"
              rules={exchangeRateRules.exchangeRate}
            >
              <Input type="number" />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

const exchangeRateRules = {
  exchangeRate: [
    {
      required: true,
      message: "Exchange Rate is required",
    },
  ],
};

const Description = ({ label, value }: { label: string; value: string }) => {
  return (
    <Flex gap={10} justify="end">
      <Typography.Text strong>{label}:</Typography.Text>
      <Typography.Text>{value}</Typography.Text>
    </Flex>
  );
};

const MyTable = ({ rows, bottom }: { rows: []; bottom?: boolean }) => {
  return (
    <Table
      columns={columns}
      bordered={false}
      pagination={false}
      size="small"
      style={{ height: bottom ? "35vh" : "38vh" }}
      scroll={{ y: bottom ? "25vh" : "28vh" }}
      dataSource={rows}
    />
  );
};
