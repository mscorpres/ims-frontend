import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
} from "@mui/icons-material";
import { HeaderProps } from "../../../types";

const Header: React.FC<HeaderProps> = ({
  user,
  notifications,
  showNotifications,
  setShowNotifications,
  showTickets,
  setShowTickets,
  showSetting,
  setShowSetting,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Add logout logic here
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          IMS - Inventory Management System
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Company Branch Selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={user?.company_branch || ""}
              displayEmpty
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
              }}
            >
              <MenuItem value="BRMSC012">A-21 [BRMSC012]</MenuItem>
              <MenuItem value="BRMSC029">B-29 [BRMSC029]</MenuItem>
            </Select>
          </FormControl>

          {/* Session Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={user?.session || ""}
              displayEmpty
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
              }}
            >
              <MenuItem value="22-23">Session 22-23</MenuItem>
              <MenuItem value="23-24">Session 23-24</MenuItem>
              <MenuItem value="24-25">Session 24-25</MenuItem>
              <MenuItem value="25-26">Session 25-26</MenuItem>
            </Select>
          </FormControl>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Badge
              badgeContent={
                notifications.filter((n) => n.type !== "message").length
              }
              color="error"
            >
              <Notifications />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton
            color="inherit"
            onClick={() => setShowSetting(!showSetting)}
          >
            <Settings />
          </IconButton>

          {/* User Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
              {user?.name?.charAt(0) || "U"}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
