import { useEffect, useState } from "react";
import MyDatePicker from "@/Components/MyDatePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import {
  Button,
  Card,
  Row,
  Space,
  Col,
  Skeleton,
  Modal,
  Form,
  Input,
} from "antd";
import { v4 } from "uuid";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadCSVCustomColumns } from "@/Components/exportToCSV";
import MyButton from "@/Components/MyButton";
import MySelect from "@/Components/MySelect";
import useApi from "@/hooks/useApi";
import { getTrialBalance } from "@/api/finance/reports";
import { scalingCurrencyOptions, scalingOptions } from "@/utils/selectOptions";

function TrialBalReport() {
  const [date, setDate] = useState("");
  const [allData, setAllData] = useState([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [currentCurrency, setCurrnetCurrency] = useState("inr");
  const [currentExchangeRate, setCurrentExchangeRate] = useState(1);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currentScaling, setCurrentScaling] = useState("0");
  const { loading, executeFun } = useApi();

  let arr = [];

  const fetchTrialBalanceFun = async () => {
    const response = await executeFun(() => getTrialBalance(date), "fetch");
    let finalArr = flatArray(response.data);

    finalArr = [
      ...finalArr,
      {
        type: "Total",
        label: "",
        originalCredit: getSum(finalArr, "credit"),
        originalDebit: getSum(finalArr, "debit"),
        debit: getSum(finalArr, "debit"),
        credit: getSum(finalArr, "credit"),
      },
    ];

    applyScaling(currentScaling, currentExchangeRate, finalArr);
  };

  const handleDownloadCSV = () => {
    let csvData = [];
    csvData = allData.map((row) => {
      return {
        Code: row.code,
        Name: row.label
          ? row.label
              .toString()
              .replaceAll("&amp;", "&")
              // .replaceAll("amp", "")
              .replaceAll(";", "")
          : " ",

        Type: row.parent
          ? row.parent == "--"
            ? "Master"
            : "Sub Group"
          : !row.type
          ? "Ledger"
          : row.type,
        Debit: row.debit && convertToNumber(row.debit),
        "Credit.": row.credit && convertToNumber(row.credit),
      };
    });
    // csvData.push({
    //   Type: "",
    //   Name: "",
    //   Code: "",
    //   Credit: getSum(allData, "credit"),
    //   Debit: getSum(allData, "debit"),
    // });

    downloadCSVCustomColumns(csvData, "Trial Balance Report");
  };
  const convertToNumber = (debitString) => {
    const cleanedDebit = parseFloat(
      typeof debitString === "string"
        ? debitString.replace(/,/g, "")
        : debitString
        ? debitString
        : 0
    );

    const debitNumber = cleanedDebit === 0 ? 0 : cleanedDebit || 0;

    return +Number(debitNumber).toFixed(2);
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
    setAllData((curr) => {
      let arr: any[] = rows ?? curr;
      arr = arr.map((row: any) => {
        if (
          row.type === "Sub Group" ||
          row.type === "End Total" ||
          row.type === "Total"
        ) {
          return {
            ...row,
            credit: row.originalCredit
              ? +Number(
                  +Number(convertToNumber(row.originalCredit) / exchangeRate) /
                    amount
                )
                  .toFixed(2)
                  ?.toLocaleString("en-IN")
              : 0,
            suffix: suffix,
            debit: row.originalDebit
              ? +Number(
                  +Number(convertToNumber(row.originalDebit) / exchangeRate) /
                    amount
                )
                  .toFixed(2)
                  ?.toLocaleString("en-IN")
              : 0,
          };
        } else if (row.type === "Ledger") {
          return {
            ...row,

            credit: Number(
              +Number(convertToNumber(row.originalCredit) / exchangeRate) /
                amount
            )
              .toFixed(2)
              ?.toLocaleString("en-IN"),
            suffix: suffix,
            debit: Number(
              convertToNumber(row.originalDebit / exchangeRate) / amount
            )
              .toFixed(2)
              ?.toLocaleString("en-IN"),
          };
        } else {
          return row;
        }
      });

      return arr;
    });
  };
  const flatArray = (array) => {
    array?.map((row) => {
      if (row.nodes) {
        arr = [...arr, row];
        flatArray(row.nodes);
        if (row.legers) {
          // let total row.legers.
          arr = [...arr, ...row.legers];
        }
      } else {
        arr = [...arr, row];
        if (row.legers) {
          arr = [
            ...arr,
            ...row.legers,
            {
              type: "End Total",
              label: row.label + " Total",
              originalCredit: row.total_credit,
              originalDebit: row.total_debit,
              debit: row.total_debit,
              credit: row.total_credit,
            },
          ];
        }
      }
    });
    arr = arr.map((row) => {
      return {
        ...row,
        id: v4(),
        originalCredit: row.credit,
        originalDebit: row.debit,
        type: row.parent
          ? row.parent == "--"
            ? "Master"
            : "Sub Group"
          : !row.type
          ? "Ledger"
          : row.type,
        lable:
          row.label &&
          row.label
            .replaceAll("&amp;", "&")
            .replaceAll("amp", "")
            .replaceAll(";", ""),
      };
    });
    return arr;
  };

  const getSum = (arr, type) => {
    return arr
      .reduce((partialSum, a) => {
        return +Number(
          partialSum +
            Number(
              a.type === "Ledger" && a.type !== "Total" ? a[type] : 0 ?? 0
            ) ?? 0
        );
      }, 0)
      .toFixed(2);
  };

  useEffect(() => {
    if (currentCurrency === "foreign") {
      setShowCurrencyModal(true);
    } else {
      setCurrentExchangeRate(1);
    }
  }, [currentCurrency]);

  useEffect(() => {
    applyScaling(currentScaling, currentExchangeRate);
  }, [currentScaling, currentExchangeRate]);

  console.log("current exchange rate", +currentExchangeRate);
  return (
    <div
      style={{
        overflow: "hidden",
      }}
    >
      <CurrencyModal
        show={showCurrencyModal}
        hide={() => setShowCurrencyModal(false)}
        setCurrentExchangeRate={setCurrentExchangeRate}
        setCurrnetCurrency={setCurrnetCurrency}
        currentExchangeRate={currentExchangeRate}
      />
      <Row justify="space-between" style={{ padding: "5px", width: "100%" }}>
        <Col>
          <Space>
            <div style={{ width: 250 }}>
              <MyDatePicker setDateRange={setDate} size="default" />
            </div>
            <div>
              <MyButton
                loading={loading("fetch")}
                type={date ? "primary" : "default"}
                onClick={fetchTrialBalanceFun}
                variant="search"
              >
                Fetch
              </MyButton>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                onChange={setCurrnetCurrency}
                value={currentCurrency}
                options={scalingCurrencyOptions}
              />
            </div>
            <div style={{ width: 200 }}>
              <MySelect
                onChange={setCurrentScaling}
                value={currentScaling}
                options={scalingOptions}
              />
            </div>
            <Button
              disabled={allData.length > 0 ? false : true}
              type={allData.length > 0 ? "primary" : "default"}
              onClick={handleDownloadCSV}
            >
              <DownloadOutlined />
            </Button>
          </Space>
        </Col>
      </Row>
      <Card size="small" style={{ height: "90%", margin: "10px" }}>
        <TableContainer sx={{ maxHeight: "78vh" }}>
          <Skeleton
            active
            loading={loading("fetch")}
            paragraph={{
              rows: 15,
            }}
          >
            <Table stickyHeader sx={{ width: "100%" }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Debit</TableCell>
                  <TableCell>Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allData.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    style={{
                      backgroundColor: row.type === "End Total" && "#f5f6f3",
                    }}
                  >
                    {/* code */}
                    <TableCell
                      style={{ fontWeight: row.type === "End Total" && "bold" }}
                      component="th"
                      scope="row"
                    >
                      {row.code}
                    </TableCell>
                    {/* name */}
                    <TableCell
                      style={{
                        fontWeight: row.type === "End Total" && "bold",
                        color: row.type === "End Total" && "#3cb1b9",
                      }}
                    >
                      {row.label}
                    </TableCell>
                    {/* type */}
                    <TableCell
                      style={{
                        fontWeight: row.type === "End Total" && "bold",
                        color: row.type === "End Total" && "#3cb1b9",
                      }}
                    >
                      {row.parent
                        ? row.parent == "--"
                          ? "Master"
                          : "Sub Group"
                        : !row.type
                        ? "Ledger"
                        : row.type === "End Total"
                        ? ""
                        : row.type}
                    </TableCell>

                    {/* debit */}
                    <TableCell
                      style={{
                        fontWeight: row.type === "End Total" && "bold",
                        color: row.type === "End Total" && "red",
                      }}
                    >
                      {row.debit
                        ? Number(row.debit).toLocaleString("en-IN")
                        : 0}{" "}
                      {row.suffix ?? ""}
                    </TableCell>
                    {/* credit */}
                    <TableCell
                      style={{
                        fontWeight: row.type === "End Total" && "bold",
                        color: row.type === "End Total" && "#26c426",
                      }}
                    >
                      {row.credit
                        ? Number(row.credit)?.toLocaleString("en-IN")
                        : 0}{" "}
                      {row.suffix ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Skeleton>
        </TableContainer>
      </Card>
      {/* <Row justify="end">
        <Col span={4}>
          <Typography.Text strong>Debit Total</Typography.Text>
          <br />
          <Typography.Text>
            {Number(getSum(allData, "debit")).toLocaleString("en-IN")} {}
          </Typography.Text>
        </Col>
        <Col span={4}>
          <Typography.Text strong>Credit Total</Typography.Text>
          <br />
          <Typography.Text>
            {Number(getSum(allData, "credit")).toLocaleString("en-IN")}
          </Typography.Text>
        </Col>
      </Row> */}
    </div>
  );
}

export default TrialBalReport;

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
