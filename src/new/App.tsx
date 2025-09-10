import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";

// Import theme
import theme from "./theme/theme";

// Import components
import { Header, Sidebar } from "./components/layout";
import Dashboard from "./pages/dashboard";

// Import types
import { User, Notification } from "./types";

// Mock data - replace with real Redux store
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  type: "user",
  company_branch: "BRMSC012",
  session: "24-25",
  showlegal: false,
  passwordChanged: "C",
  token: "mock-token",
};

const mockNotifications: Notification[] = [
  {
    ID: "1",
    type: "info",
    title: "New Order Received",
    details: "Order #12345 has been received",
    message: "A new order has been placed and requires processing.",
  },
  {
    ID: "2",
    type: "warning",
    title: "Low Stock Alert",
    details: "Product ABC is running low on stock",
    message: "Product ABC has only 5 units remaining.",
  },
];

const App: React.FC = () => {
  const [showSideBar, setShowSideBar] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [showSetting, setShowSetting] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex" }}>
          {/* Sidebar */}
          <Sidebar
            showSideBar={showSideBar}
            setShowSideBar={setShowSideBar}
            user={mockUser}
            setShowTickets={setShowTickets}
          />

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 0,
              width: { sm: `calc(100% - ${showSideBar ? 240 : 0}px)` },
              ml: { sm: showSideBar ? "240px" : 0 },
              transition: "margin 0.3s ease",
            }}
          >
            {/* Header */}
            <Header
              user={mockUser}
              notifications={mockNotifications}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              showTickets={showTickets}
              setShowTickets={setShowTickets}
              showSetting={showSetting}
              setShowSetting={setShowSetting}
            />

            {/* Page Content */}
            <Box sx={{ mt: 8, p: 0 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Add more routes here as you create new pages */}
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
