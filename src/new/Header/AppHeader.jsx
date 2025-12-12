import React from "react";
import {
  Badge,
  Switch,
  IconButton,
  Select,
  MenuItem,
  Tooltip,
  Link,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import { SiSocketdotio } from "react-icons/si";
import { useNavigate } from "react-router-dom";


const AppHeader = (props) => {
  const {
    onToggleSidebar,
    logo,
    title,
    branchOptions = [],
    sessionOptions = [],
    branchValue,
    sessionValue,
    onChangeBranch,
    onChangeSession,
    showSearch = true,
    searchComponent,
    onChangeTestSwitch,
    socketConnected,
    socketLoading,
    onRefreshSocket,
    notificationsCount = 0,
    onClickNotifications,
    notificationButtonRef,
    messagesCount = 0,
    onClickMessages,
    userMenu,
    extraRight,
    switchModule,
  } = props;
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 right-0 z-10 h-[45px] w-full flex items-center bg-[var(--ant-layout-header-background,#1d252c)]">
      <div className="w-full pr-[26px]">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-[24px]">
            <MenuIcon
              onClick={onToggleSidebar}
              className="ml-[12px] cursor-pointer font-size-[1rem]"
              style={{ color: "white" }}
            />

            <Link
              className="flex items-center h-[45px] gap-[8px]"
              onClick={() => navigate("/")}
            >
              <div className="h-[45px]">{logo}</div>
              {title && (
                <span className="text-[1rem] text-[#f0f0f0]">{title}</span>
              )}
            </Link>

            {branchOptions?.length > 0 && (
              <div className="location-select">
                <Select
                  style={{ width: 200, color: "white" }}
                  value={branchValue ?? ""}
                  onChange={(e) =>
                    onChangeBranch && onChangeBranch(e.target.value)
                  }
                  displayEmpty
                  sx={{
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSvgIcon-root": { color: "#fff" },
                  }}
                >
                  {branchOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}

            {sessionOptions?.length > 0 && (
              <div className="location-select">
                <Select
                  style={{ width: 200, color: "white" }}
                  value={sessionValue ?? ""}
                  onChange={(e) =>
                    onChangeSession && onChangeSession(e.target.value)
                  }
                  displayEmpty
                  sx={{
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSvgIcon-root": { color: "#fff" },
                  }}
                >
                  {sessionOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {showSearch && (
             searchComponent
            )}
          </div>

          <div className="flex items-center gap-[24px] relative">
            

            {switchModule && (
                switchModule
            )}

           

            {onRefreshSocket && (
              <Tooltip
                title={`Socket ${
                  socketConnected ? "Connected" : "Disconnected"
                }`}
                placement="bottom"
              >
                <span>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshSocket();
                    }}
                    disabled={socketLoading}
                    style={{ padding: 0 }}
                  >
                    <SiSocketdotio
                      style={{
                        fontSize: "25px",
                        color: socketConnected ? "#10b981" : "#ef4444",
                        animation: socketLoading
                          ? "spin 1s linear infinite"
                          : "none",
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <div
              ref={notificationButtonRef}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Badge
                sx={{
                  "& .MuiBadge-badge": {
                    background: notificationsCount > 0 ? "#EAAE0F" : "green",
                  },
                }}
                badgeContent={notificationsCount}
              >
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Prevent any other handlers from immediately closing the panel
                    // @ts-ignore
                    if (
                      e.nativeEvent &&
                      typeof e.nativeEvent.stopImmediatePropagation ===
                        "function"
                    ) {
                      e.nativeEvent.stopImmediatePropagation();
                    }
                    onClickNotifications && onClickNotifications();
                  }}
                  size="small"
                  sx={{ p: 0.5 }}
                  aria-label="Notifications"
                >
                  <NotificationsIcon sx={{ fontSize: 18, color: "white" }} />
                </IconButton>
              </Badge>
            </div>

            <div>
              <Badge badgeContent={messagesCount}>
                <HeadsetMicIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickMessages && onClickMessages();
                  }}
                  style={{
                    fontSize: 18,
                    cursor: "pointer",
                    color: "white",
                  }}
                />
              </Badge>
            </div>

            {userMenu}
            {extraRight}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;