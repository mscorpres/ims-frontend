import React, { useState } from "react";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import links from "./links";
import {
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Typography,
  Flex,
  Form,
  Divider,
} from "antd";
import { v4 } from "uuid";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { useDispatch } from "react-redux/es/exports";
import { useEffect } from "react";
import { setCurrentLinks } from "../../../Features/loginSlice/loginSlice.js";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { useLocation, useParams } from "react-router-dom";
import useApi from "../../../hooks/useApi.ts";
import { getLedgerReport } from "../../../api/ledger";
import MyButton from "../../../Components/MyButton/index.jsx";
import { getLedgerOptions } from "../../../api/ledger";
import { getRecoReport } from "../../../api/finance/vendor-reco.js";
import Loading from "../../../Components/Loading.jsx";
import { imsAxios } from "../../../axiosInterceptor.tsx";

export default function LedgerReport() {
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [selectLoading, setSelectLoading] = useState(false);
  const [rows, setRows] = useState({ rows: [] });
  const [summary, setSummary] = useState({});
  const [searchLedger, setSearchLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recoRows, setRecoRows] = useState([]);

  const [filterForm] = Form.useForm();
  const dispatch = useDispatch();
  const params = useParams();
  const { executeFun, loading: loading1 } = useApi();
  const { Title, Link, Text } = Typography;

  const getLedgerOptions = async (searchInput) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: searchInput,
    });
    setSelectLoading(false);
    if (data.code === 200) {
      let arr = [];
      arr = data.data.map((d) => {
        return {
          text: d.text,
          value: d.id,
        };
      });
      setAsyncOptions(arr);
    }
  };
  const handleFetchLedgerReport = async () => {
    const values = await filterForm.validateFields();
    let payload = {
      ledger: values?.vendor.value,
      date: values?.date,
    };
    const response = await executeFun(() => getLedgerReport(payload), "fetch");
    handleFetchRecoReport();
    let { data } = response;
    if (response.success) {
      if (data.code === 200) {
        if (data?.data.rows) {
          let arr = data?.data.rows.map((r, id) => {
            return {
              referenceDate: r.ref_date,
              invoiceNumber: r.invoice_no,
              invoiceDate: r.invoice_date,
              reference: r.ref,
              whichModule: r.which_module,
              moduleUsed: r.module_used,
              debitAmount: r.debit,
              creditAmount: r.credit,
              id: id + 1,
            };
          });
          setRows(arr);
        } else {
          setRows([]);
        }
        setSummary(data?.data.summary);
      } else {
        toast.error();
      }
    }

    console.log("ledger report response", response);
    // if (searchLedger && searchDateRange) {
    //   setLoading(true);
    //   setSearchLoading(true);
    //   const { data } =
    //   setLoading(false);
    //   setSearchLoading(false);
    //   if (data.code === 200) {
    //     const arr = data.data.rows.map((row, index) => {
    //       return {
    //         ...row,
    //         id: v4(),
    //         index: index + 1,
    //       };
    //     });
    //     setLedgerData({ summary: data.data.summary, rows: arr });
    //   } else {
    //     setLedgerData({ rows: [] });
    //     toast.error(data.message.msg);
    //   }
    // }
  };

  const handleFetchRecoReport = async () => {
    const values = await filterForm.validateFields();
    const response = await executeFun(
      () => getRecoReport(values.vendor.value),
      "fetch"
    );

    setRecoRows(response.data);
  };
  const handleFetchLedgerOptions = async (search) => {
    // const response = await executeFun(() => , "select");
    getLedgerOptions(search);
    // setAsyncOptions(response.data);
  };
  const ledgerReportColumns = [
    {
      headerName: "#",
      field: "id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.id} />,
      width: 100,
    },
    {
      headerName: "Ref. Date",
      field: "referenceDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row.referenceDate} />,
      width: 100,
    },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.invoiceNumber} copy={true} />
      ),
      flex: 1,
    },
    {
      headerName: "Invoice Date",
      field: "invoiceDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceDate} />,
      width: 100,
    },

    {
      headerName: "Reference",
      field: "reference",
      renderCell: ({ row }) => <ToolTipEllipses text={row.reference} />,
      width: 200,

      // width: "12vw",
    },
    {
      headerName: "Voucher Type",
      field: "whichModule",
      width: 100,
    },
    {
      headerName: "Voucher Number",
      field: "moduleUsed",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.moduleUsed} copy={true} />
      ),
      flex: 1,
    },
    {
      headerName: "Debit",
      field: "debitAmount",
      flex: 1,
    },
    {
      headerName: "Credit",
      flex: 1,
      field: "creditAmount",
    },
  ];
  const downloadFun = async () => {
    console.log("this are the rows", summary);

    const values = await filterForm.validateFields();
    let csvData = rows.map((row, index) => {
      return {
        "Ref Date": row.referenceDate,
        Refrence: row.reference,
        "Invoice Date": row.invoiceDate,
        "Invoice No.": row.invoiceNumber,
        "Voucher Type.": row.whichModule,
        "Voucher Number": row.moduleUsed,
        "Debit.": row.debitAmount.replaceAll(",", ""),
        Credit: row.creditAmount.replaceAll(",", ""),
      };
    });
    csvData = [
      ...csvData,
      {
        title: "Ledger: ",
        Ledger: values.vendor.label,
        datetitle: "Date Range",
        Date: values.date,
      },
      {
        Opening: "Opening: " + summary?.opening.replaceAll(",", ""),
        "Current Total Debit":
          "Current Total Debit: " + summary?.debitTotal.replaceAll(",", ""),
        "Current Total Credit":
          "Current Total Credit: " + summary?.creditTotal.replaceAll(",", ""),
        Closing: "Closing: " + summary?.closing.replaceAll(",", ""),
      },
    ];
    downloadCSVCustomColumns(
      csvData,
      `Ledger Report ${values.vendor.label} ${values.date}`
    );
  };
  const ledgerByCode = async (code) => {
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: code,
    });
    if (response.data) {
      if (response.data.code === 200) {
        let obj = {
          label: response.data.data[0].text,
          value: response.data.data[0].id,
        };
        // setSearchLedger(obj);
        filterForm.setFieldValue("vendor", obj);
      } else {
        toast.error(response.data.message.msg);
      }
    }
  };
  useEffect(() => {
    dispatch(setCurrentLinks(links));
  }, []);
  useEffect(() => {
    if (params && params?.code) {
      ledgerByCode(params.code);
    }
  }, [params]);
  return (
    <Row gutter={6} style={{ height: "95%", padding: 10, overflow: "hidden" }}>
      <Col span={4} style={{ height: "100%", overflow: "auto" }}>
        <Flex vertical gap={6}>
          <Card size="small">
            <Form form={filterForm} layout="vertical">
              <Form.Item name="vendor" label="Ledger" rules={rules.vendor}>
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  selectLoading={loading1("select")}
                  placeholder="Select Ledger"
                  labelInValue
                  loadOptions={handleFetchLedgerOptions}
                  optionsState={asyncOptions}
                  onChange={(value) =>
                    filterForm.setFieldValue("vendor", value)
                  }
                  value={searchLedger}
                />
              </Form.Item>
              <Form.Item name="date" label="Time Period" rules={rules.date}>
                <MyDatePicker
                  setDateRange={(value) =>
                    filterForm.setFieldValue("date", value)
                  }
                />
              </Form.Item>
              <Row justify="end">
                <Space>
                  <CommonIcons onClick={downloadFun} action="downloadButton" />
                  <MyButton
                    loading={loading1("fetch")}
                    variant="search"
                    onClick={handleFetchLedgerReport}
                  />
                </Space>
              </Row>
            </Form>
          </Card>
          <Card title="Summary" size="small">
            <Row gutter={[0, 10]}>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Opening:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading1("fetch")}
                  active
                />
                {!loading1("fetch") && summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {summary?.opening}
                  </Typography.Text>
                )}
              </Col>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Current Total Debit:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading1("fetch")}
                  active
                />
                {!loading1("fetch") && summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {summary?.total_debit ?? "--"}
                  </Typography.Text>
                )}
              </Col>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Current Total Credit:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading1("fetch")}
                  active
                />
                {!loading1("fetch") && summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {summary?.total_credit}
                  </Typography.Text>
                )}
              </Col>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Closing:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading1("fetch")}
                  active
                />
                {!loading1("fetch") && summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {summary?.closing}
                  </Typography.Text>
                )}
              </Col>
            </Row>
          </Card>
          <Card title="Reconcillations" size="small">
            {loading1("fetch") && <Loading />}
            {recoRows.length === 0 && (
              <Flex justify="center">
                <Typography.Text type="secondary" strong>
                  No Recos found
                </Typography.Text>
              </Flex>
            )}
            {recoRows.length > 0 && (
              <Flex vertical>
                <Flex justify="space-between">
                  <Typography.Text strong>Month</Typography.Text>
                  <Typography.Text strong>Status</Typography.Text>
                </Flex>
                <Divider />
                {recoRows.map((row) => (
                  <Flex justify="space-between">
                    <Typography.Text>{row.month}</Typography.Text>
                    <Typography.Text>{row.status}</Typography.Text>
                  </Flex>
                ))}
              </Flex>
            )}
          </Card>
        </Flex>
      </Col>
      <Col style={{ height: "100%" }} span={20}>
        <MyDataTable
          columns={ledgerReportColumns}
          data={rows}
          // pagination
          loading={loading1("fetch")}
          headText="center"
          // export={true}
        />
      </Col>
    </Row>
  );
}

const rules = {
  vendor: [
    {
      required: true,
      message: "Please select a ledger",
    },
  ],
  date: [
    {
      required: true,
      message: "Please select a time period",
    },
  ],
};
