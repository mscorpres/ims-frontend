import React from "react";
import { Box, Grid, Card, CardContent, Typography, Paper } from "@mui/material";
import {
  TrendingUp,
  Inventory,
  AccountBalance,
  Factory,
} from "@mui/icons-material";
import { DashboardWidget } from "../../types";

const Dashboard: React.FC = () => {
  // Mock data - replace with real API calls
  const widgets: DashboardWidget[] = [
    {
      id: "1",
      title: "Total Inventory Value",
      value: "₹2,45,67,890",
      change: 12.5,
      changeType: "increase",
      icon: <Inventory />,
    },
    {
      id: "2",
      title: "Active Production Orders",
      value: "24",
      change: -3.2,
      changeType: "decrease",
      icon: <Factory />,
    },
    {
      id: "3",
      title: "Monthly Revenue",
      value: "₹1,23,45,678",
      change: 8.7,
      changeType: "increase",
      icon: <AccountBalance />,
    },
    {
      id: "4",
      title: "Growth Rate",
      value: "15.3%",
      change: 2.1,
      changeType: "increase",
      icon: <TrendingUp />,
    },
  ];

  const StatCard: React.FC<{ widget: DashboardWidget }> = ({ widget }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: "primary.main",
              color: "white",
              mr: 2,
            }}
          >
            {widget.icon}
          </Box>
          <Typography variant="h6" component="div">
            {widget.title}
          </Typography>
        </Box>

        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {widget.value}
        </Typography>

        {widget.change && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color:
                  widget.changeType === "increase"
                    ? "success.main"
                    : "error.main",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TrendingUp
                sx={{
                  fontSize: 16,
                  mr: 0.5,
                  transform:
                    widget.changeType === "decrease"
                      ? "rotate(180deg)"
                      : "none",
                }}
              />
              {Math.abs(widget.change)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {widgets.map((widget) => (
          <Grid item xs={12} sm={6} md={3} key={widget.id}>
            <StatCard widget={widget} />
          </Grid>
        ))}
      </Grid>

      {/* Charts and Tables Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Production Overview
            </Typography>
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "grey.50",
                borderRadius: 1,
              }}
            >
              <Typography color="text.secondary">
                Chart will be implemented here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "grey.50",
                borderRadius: 1,
              }}
            >
              <Typography color="text.secondary">
                Recent activities will be shown here
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
