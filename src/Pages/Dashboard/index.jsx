import { useState } from "react";
import { Col, Row } from "antd";
import SummarySection from "./SummarySection";
import Section3 from "./Section3";
import { imsAxios } from "../../axiosInterceptor";
import { useEffect } from "react";
import { toast } from "react-toastify";
import MINSummary from "./MINSummary";
import MyDatePicker from "../../Components/MyDatePicker";

const Dashboard = () => {
  const [summaryDate, setSummaryDate] = useState("");
  // const [gatePassDate, setGatePassDate] = useState("");
  // const [pendingTransactionsDate, setpendingTransactionDate] = useState("");
  // const [minDate, setMINDate] = useState("");
  // const [mfgProductsDate, setMfgProductDate] = useState("");

  const [transactionSummary, setTransactionSummary] = useState([
    {
      title: "Total Rejection",
      date: "",
      value: "",
    },
    {
      title: "Total MFG",
      date: "",
      value: "",
    },
    {
      title: "Total Consumption",
      date: "",
      value: "",
      // link: "/transaction-In",
    },
    {
      title: "Total Purchase Orders",
      value: "",
      link: "/manage-po",
    },
  ]);
  const [pendingTransactionSummary, setPendingTransactionSummary] = useState([
    {
      title: "Pending PO",
      value: "",
    },
    {
      title: "Pending JW PO",
      value: "",
    },
    {
      title: "Pending PPR",
      value: "",
      // link: "/transaction-In",
    },
    {
      title: "Pending FG",
      value: "",
      link: "/manage-po",
    },
    {
      title: "Pending MR Approval",
      value: "",
      link: "/manage-po",
    },
  ]);
  const [masterSummary, setMasterSummary] = useState([
    {
      title: "Total Components",
      value: "",
      date: "",
      link: "/material",
    },
    {
      title: "Total Products",
      value: "",
      date: "",
      link: "/masters/products/fg",
    },
    {
      title: "Total Projects",
      value: "",
      date: "",
      link: "/master/reports/projects",
    },
    {
      title: "Total Vendors",
      value: "",
      date: "",
      link: "/vendor",
    },
  ]);
  const [gatePassSummary, setGatePassSummary] = useState([
    {
      title: "Total Gatepass",
      value: "",
      date: "",
    },
    {
      title: "Total RGP",
      value: "",
      date: "",
    },
    {
      title: "Total NRGP",
      value: "",
      date: "",
    },
    {
      title: "Total Challan",
      value: "",
    },
  ]);
  const [minSummary, setMINSummary] = useState([
    {
      title: "PO MIN",
      value: "",
      date: "",
      key: "poMin",
    },
    {
      title: "Without PO MIN",
      value: "",
      date: "",
      key: "withoutPoMin",
    },
    {
      title: "JW MIN",
      value: "",
      date: "",
      key: "jwMin",
    },
  ]);
  const [mfgProducts, setMfgProductSummary] = useState([]);
  const [loading, setLoading] = useState({
    master: true,
    transactions: true,
    gatePass: true,
    min: true,
    pendingSummary: true,
  });

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
              {
                title: "Total Purchase Orders",
                value: data.data.totalPO,
                date: data.data.lastPO,
                link: "/manage-po",
              },
            ]);
          } else if (transactionType === "gatePass") {
            setGatePassSummary([
              {
                title: "Total Gatepass",

                value: data.data.totalGatePass,
              },
              {
                title: "Total RGP",
                date: data.data.lastRGP,
                value: data.data.totalRGP,
              },
              {
                title: "Total NRGP",
                date: data.data.lastNRGP,
                value: data.data.totalNRGP,
              },
              {
                title: "Total Challan",
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
  const getMasterSummary = async () => {
    try {
      setLoading((curr) => ({
        ...curr,
        master: true,
      }));
      const response = await imsAxios.post("/tranCount/master_counts");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setMasterSummary([
            {
              title: "Total Components",
              value: data.data.totalComponents,
              date: data.data.lastComponent,
              link: "/material",
            },
            {
              title: "Total Products",
              value: data.data.totalProducts,
              date: data.data.lastProduct,
              link: "/masters/products/fg",
            },
            {
              title: "Total Projects",
              date: data.data.lastProject,
              value: data.data.totalProjects,
              link: "/master/reports/projects",
            },
            {
              title: "Total Vendors",
              date: data.data.lastVendor,
              value: data.data.totalVendors,
              link: "/vendor",
            },
          ]);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading((curr) => ({
        ...curr,
        master: false,
      }));
    }
  };

  const getMfgProducts = async (date) => {
    try {
      setLoading((curr) => ({
        ...curr,
        master: true,
      }));
      const response = await imsAxios.post("/tranCount/top_mfg_products", {
        data: date,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.topProducts.map((item, index) => ({
            sku: item.productSku,
            qty: item.totalmfgQuantity,
            product: item.productName,
          }));

          setMfgProductSummary(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading((curr) => ({
        ...curr,
        master: false,
      }));
    }
  };
  const gettingPendingTransaction = async (date) => {
    try {
      setLoading((curr) => ({
        ...curr,
        pendingSummary: true,
      }));
      const response = await imsAxios.post("/tranCount/pending_counts", {
        data: date,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setPendingTransactionSummary([
            {
              title: "Pending PO",
              value: data.data.pendingPO,
            },
            {
              title: "Pending JW PO",
              value: data.data.pendingJW_PO,
            },
            {
              title: "Pending PPR",
              value: data.data.pendingPPR,
              // link: "/transaction-In",
            },
            {
              title: "Pending FG",
              value: data.data.pendingFG,
              // link: "/manage-po",
            },
            {
              title: "Pending MR Approval",
              value: data.data.pendingMRapproval,
              // link: "/manage-po",
            },
          ]);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading((curr) => ({
        ...curr,
        pendingSummary: false,
      }));
    }
  };
  useEffect(() => {
    if (summaryDate && summaryDate.split("-").length > 2) {
      gettingDateSummary("transactions", summaryDate);
      gettingDateSummary("gatePass", summaryDate);
      gettingDateSummary("min", summaryDate);
      gettingPendingTransaction(summaryDate);
      getMfgProducts(summaryDate);
    }
  }, [summaryDate]);

  useEffect(() => {
    getMasterSummary();
  }, []);
  return (
    <Row justify="center" style={{ padding: 50 }}>
      <Col span={22}>
        <Row gutter={[6, 12]}>
          <Col>
            <MyDatePicker setDateRange={setSummaryDate} startingDate={true} />
          </Col>
          <SummarySection
            title="Master Summary"
            summary={masterSummary}
            loading={loading["master"]}
          />
          <SummarySection
            title="Transactions Summary"
            summary={transactionSummary}
            loading={loading["transactions"]}
          />
          <Section3
            columns={mfgProductColumns}
            rows={mfgProducts}
            title="Most MFG Products"
          />
          <MINSummary minSummary={minSummary} loading={loading["min"]} />
          <SummarySection
            title="Pending Transactions Summary"
            subTitle="(Stats not dependant on selected date range)"
            summary={pendingTransactionSummary}
            loading={loading["pendingSummary"]}
          />
          <SummarySection
            title="Gate Pass Summary"
            summary={gatePassSummary}
            loading={loading["gatePass"]}
          />
        </Row>
      </Col>
    </Row>
  );
};

export default Dashboard;

const mfgProductColumns = [
  { headerName: "Product", field: "product" },
  { headerName: "SKU", field: "sku" },
  { headerName: "MFG Qty", field: "qty" },
];
