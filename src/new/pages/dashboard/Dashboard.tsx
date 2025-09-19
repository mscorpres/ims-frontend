import React, { useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Launch as LaunchIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import MyDatePicker from "../../../Components/MyDatePicker.jsx";
import {
  fetchGatePassSummary,
  fetchMasterSummary,
  fetchMfgProducts,
  fetchMinSummary,
  fetchPendingSummary,
  fetchTransactionsSummary,
  setSummaryDate,
  // @ts-ignore
} from "../../../Features/dashboardSlice/dashboardSlice";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

type SummaryItem = {
  title: string;
  value: string | number | null | undefined;
  date?: string | null | undefined;
  link?: string;
  key?: string;
};

type LoadingState = {
  master: boolean;
  transactions: boolean;
  gatePass: boolean;
  min: boolean;
  pendingSummary: boolean;
};

type MfgProduct = { product: string; sku: string; qty: number };

const CHART_COLORS = [
  "#6366F1",
  "#06B6D4",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#3B82F6",
  "#F97316",
  "#14B8A6",
];

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const {
    summaryDate,
    masterSummary,
    transactionSummary,
    gatePassSummary,
    minSummary,
    pendingTransactionSummary,
    mfgProducts,
    loading,
  } = useSelector((state: any) => state.dashboard);

  const transactionsChartData = useMemo(
    () =>
      (transactionSummary || []).map((i: SummaryItem) => ({
        name: i.title,
        value: Number(i.value ?? 0),
      })),
    [transactionSummary]
  );

  const gatePassChartData = useMemo(
    () =>
      (gatePassSummary || []).map((i: SummaryItem) => ({
        name: i.title,
        value: Number(i.value ?? 0),
      })),
    [gatePassSummary]
  );

  const pendingChartData = useMemo(
    () =>
      (pendingTransactionSummary || []).map((i: SummaryItem) => ({
        name: i.title,
        value: Number(i.value ?? 0),
      })),
    [pendingTransactionSummary]
  );

  const topMfgProducts = useMemo(
    () =>
      (mfgProducts || [])
        .slice(0, 10)
        .map((p: MfgProduct) => ({ name: p.product, qty: Number(p.qty ?? 0) })),
    [mfgProducts]
  );

  useEffect(() => {
    if (summaryDate && summaryDate.split("-").length > 2) {
      dispatch(fetchTransactionsSummary(summaryDate));

      dispatch(fetchGatePassSummary(summaryDate));

      dispatch(fetchMinSummary(summaryDate));

      dispatch(fetchPendingSummary(summaryDate));

      dispatch(fetchMfgProducts(summaryDate));
    }
  }, [summaryDate]);

  useEffect(() => {
    dispatch(fetchMasterSummary());
  }, []);

  const renderSummaryGrid = (
    title: string,
    items: SummaryItem[],
    loadingFlag: boolean,
    subtitle?: string
  ) => (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{
          p: 2,
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          "&:hover": {
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loadingFlag ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {items.map((it, idx) => (
              <Card
                key={`${it.title}-${idx}`}
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                  boxShadow:
                    "4px 4px 6px -1px rgba(0, 0, 0, 0.1), 4px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  "&:hover": {
                    boxShadow:
                      "4px 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {it.title}
                  </Typography>
                  <Typography variant="h5" sx={{ my: 0.5 }}>
                    {it.value ?? "-"}
                  </Typography>
                  {it?.date && (
                    <Typography variant="caption" color="text.secondary">
                      Last: {it.date}
                    </Typography>
                  )}
                  {it?.link && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        icon={<LaunchIcon fontSize="small" />}
                        label="Details"
                        color="primary"
                        variant="outlined"
                        clickable
                        onClick={() => {
                          window.location.href = it.link as string;
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );

  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3, paddingBottom: "80px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5">Dashboard</Typography>
          <Box sx={{ minWidth: 260 }}>
            <MyDatePicker
              setDateRange={(v: string) => {
                dispatch(setSummaryDate(v));
              }}
              startingDate={true as any}
            />
          </Box>
        </Box>

        {renderSummaryGrid("Master Summary", masterSummary, loading.master)}

        {/* Row 2: Transactions Overview and Pending Summary */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Transactions Overview
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={transactionsChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {transactionsChartData?.map((_: any, idx: number) => (
                      <Cell
                        key={`tc-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pending Summary
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pendingChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                  >
                    {pendingChartData.map((_: any, idx: number) => (
                      <Cell
                        key={`pc-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {/* Row 3: Gate Pass Overview and Top MFG Products */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Gate Pass Overview
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gatePassChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {gatePassChartData.map((_: any, idx: number) => (
                      <Cell
                        key={`gp-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top MFG Products
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={topMfgProducts}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} hide={false} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="qty"
                    name="Qty"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {renderSummaryGrid("MIN Summary", minSummary, loading.min)}
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
