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
} from "antd";
import { v4 } from "uuid";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { useDispatch } from "react-redux/es/exports";
import { useEffect } from "react";
import { setCurrentLinks } from "../../../Features/loginSlice/loginSlice.js";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { useLocation, useParams } from "react-router-dom";
import useApi from "../../../hooks/useApi.jsx";
import { getLedgerReport } from "../../../api/finance/reports.js";
import MyButton from "../../../Components/MyButton/index.jsx";
import { getLedgerOptions } from "../../../api/ledger.jsx";
import { getRecoReport } from "../../../api/finance/vendor-reco.jsx";

export default function LedgerReport() {
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [selectLoading, setSelectLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState({ rows: [] });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [filterForm] = Form.useForm();
  const dispatch = useDispatch();
  const params = useParams();
  const { executeFun, loading: loading1 } = useApi();
  const { Title, Link, Text } = Typography;
  // const getLedgerOptions = async (searchInput) => {
  //   setSelectLoading(true);
  //   const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
  //     search: searchInput,
  //   });
  //   setSelectLoading(false);
  //   if (data.code === 200) {
  //     let arr = [];
  //     arr = data.data.map((d) => {
  //       return {
  //         text: d.text,
  //         value: d.id,
  //       };
  //     });
  //     setAsyncOptions(arr);
  //   }
  // };
  const handleFetchLedgerReport = async () => {
    const values = await filterForm.validateFields();
    const response = await executeFun(
      () => getLedgerReport(values.vendor.value, values.date),
      "fetch"
    );

    setLedgerData(response.data);

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
      () => getRecoReport(values.vendor),
      "fetch"
    );
  };
  const handleFetchLedgerOptions = async (search) => {
    const response = await executeFun(() => getLedgerOptions(search), "select");
    setAsyncOptions(response.data);
  };
  const ledgerReportColumns = [
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
  const downloadFun = () => {
    let csvData = ledgerData.rows.map((row, index) => {
      return {
        "Ref Date": row.ref_date,
        Refrence: row.ref,
        "Invoice Date": row.invoice_date,
        "Invoice No.": row.invoice_no,
        "Voucher Type.": row.which_module,
        "Voucher Number": row.module_used,
        "Debit.": row.debit.replaceAll(",", ""),
        Credit: row.credit.replaceAll(",", ""),
      };
    });
    csvData = [
      ...csvData,
      {
        title: "Ledger: ",
        Ledger: searchLedger.label,
        datetitle: "Date Range",
        Date: searchDateRange,
      },
      {
        Opening:
          "Opening: " + ledgerData?.summary[0]?.opening.replaceAll(",", ""),
        "Current Total Debit":
          "Current Total Debit: " +
          ledgerData?.summary[0]?.total_debit.replaceAll(",", ""),
        "Current Total Credit":
          "Current Total Credit: " +
          ledgerData?.summary[0]?.total_credit.replaceAll(",", ""),
        Closing:
          "Closing: " + ledgerData?.summary[0]?.closing.replaceAll(",", ""),
      },
    ];
    downloadCSVCustomColumns(
      csvData,
      `Ledger Report ${searchLedger.label} ${searchDateRange}`
    );
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
    <Row gutter={6} style={{ height: "95%", padding: 10 }}>
      <Col span={4}>
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
                  <CommonIcons action="downloadButton" />
                  <MyButton
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
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.opening}
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
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.total_debit}
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
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.total_credit}
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
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.closing}
                  </Typography.Text>
                )}
              </Col>
            </Row>
          </Card>
        </Flex>
      </Col>
      <Col style={{ height: "100%" }} span={20}>
        <MyDataTable
          sortable={true}
          loading={loading}
          columns={ledgerReportColumns}
          data={ledgerData?.rows}
          pagination
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
