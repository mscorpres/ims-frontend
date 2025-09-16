import React, { useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Launch as LaunchIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore - JS module without types
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
// @ts-ignore - JS module without types
import MyDatePicker from "../../../Components/MyDatePicker";
import {
  fetchGatePassSummary,
  fetchMasterSummary,
  fetchMfgProducts,
  fetchMinSummary,
  fetchPendingSummary,
  fetchTransactionsSummary,
  setSummaryDate,
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
      // @ts-ignore
      dispatch(fetchTransactionsSummary(summaryDate));
      // @ts-ignore
      dispatch(fetchGatePassSummary(summaryDate));
      // @ts-ignore
      dispatch(fetchMinSummary(summaryDate));
      // @ts-ignore
      dispatch(fetchPendingSummary(summaryDate));
      // @ts-ignore
      dispatch(fetchMfgProducts(summaryDate));
    }
  }, [summaryDate]);

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchMasterSummary());
  }, []);

  const renderSummaryGrid = (
    title: string,
    items: SummaryItem[],
    loadingFlag: boolean,
    subtitle?: string
  ) => (
    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
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
          <Grid container spacing={2}>
            {items.map((it, idx) => (
              <Grid key={`${it.title}-${idx}`} item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      idx % 4 === 0
                        ? "#eef2ff"
                        : idx % 4 === 1
                        ? "#ecfeff"
                        : idx % 4 === 2
                        ? "#fef9c3"
                        : "#fce7f3",
                    border: 0,
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
                            // simple navigate
                            window.location.href = it.link as string;
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
              // @ts-ignore
              dispatch(setSummaryDate(v));
            }}
            startingDate={true as any}
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {renderSummaryGrid("Master Summary", masterSummary, loading.master)}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
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
                  {transactionsChartData.map((_: any, idx: number) => (
                    <Cell
                      key={`tc-${idx}`}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
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
        </Grid>

        {renderSummaryGrid("MIN Summary", minSummary, loading.min)}
      </Grid>
    </Box>
  );
};

export default Dashboard;
