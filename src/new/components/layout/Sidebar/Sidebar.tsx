import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Dashboard,
  Inventory,
  AccountBalance,
  Factory,
  Warehouse,
  Assessment,
} from "@mui/icons-material";
import { SidebarProps, MenuItem } from "../../../types";

const Sidebar: React.FC<SidebarProps> = ({
  showSideBar,
  setShowSideBar,
  user,
  setShowTickets,
}) => {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const handleItemClick = (key: string) => {
    setOpenItems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <Dashboard />,
    },
    {
      key: "finance",
      label: "Finance",
      icon: <AccountBalance />,
      children: [
        { key: "finance-accounts", label: "Accounts" },
        { key: "finance-reports", label: "Reports" },
        { key: "finance-vouchers", label: "Vouchers" },
      ],
    },
    {
      key: "material",
      label: "Material Management",
      icon: <Inventory />,
      children: [
        { key: "material-master", label: "Master Data" },
        { key: "material-procurement", label: "Procurement" },
        { key: "material-warehouse", label: "Warehouse" },
      ],
    },
    {
      key: "production",
      label: "Production",
      icon: <Factory />,
      children: [
        { key: "production-ppc", label: "PPC" },
        { key: "production-qca", label: "QCA" },
        { key: "production-mes", label: "MES" },
      ],
    },
    {
      key: "warehouse",
      label: "Warehouse",
      icon: <Warehouse />,
      children: [
        { key: "warehouse-inventory", label: "Inventory" },
        { key: "warehouse-transfers", label: "Transfers" },
        { key: "warehouse-reports", label: "Reports" },
      ],
    },
    {
      key: "reports",
      label: "Reports",
      icon: <Assessment />,
    },
  ];

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.key);

    return (
      <React.Fragment key={item.key}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() =>
              hasChildren ? handleItemClick(item.key) : undefined
            }
            sx={{
              pl: 2 + level * 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              sx={{
                color: "white",
                "& .MuiListItemText-primary": {
                  fontSize: "0.9rem",
                },
              }}
            />
            {hasChildren &&
              (isOpen ? (
                <ExpandLess sx={{ color: "white" }} />
              ) : (
                <ExpandMore sx={{ color: "white" }} />
              ))}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={showSideBar}
      sx={{
        width: showSideBar ? 240 : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#047780",
          border: "none",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          IMS
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>

      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
          }}
        >
          {user?.name || "User"}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
