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

type Option = { label: string; value: string };

export interface AppHeaderProps {
  onToggleSidebar?: () => void;
  logo?: React.ReactNode;
  title?: React.ReactNode | string;

  branchOptions?: Option[];
  sessionOptions?: Option[];
  branchValue?: string;
  sessionValue?: string;
  onChangeBranch?: (value: string) => void;
  onChangeSession?: (value: string) => void;

  showSearch?: boolean;
  searchComponent?: React.ReactNode; // custom search input/select

  testSwitchVisible?: boolean;
  testSwitchValue?: boolean;
  testSwitchLoading?: boolean;
  onChangeTestSwitch?: (checked: boolean) => void;

  showControlIcon?: boolean;
  onClickControl?: () => void;

  socketConnected?: boolean;
  socketLoading?: boolean;
  onRefreshSocket?: () => void;

  notificationsCount?: number;
  onClickNotifications?: () => void;
  messagesCount?: number;
  onClickMessages?: () => void;

  userMenu?: React.ReactNode; // right side user dropdown/menu
  extraRight?: React.ReactNode; // any extra nodes on the right
}

const AppHeader: React.FC<AppHeaderProps> = (props) => {
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
    testSwitchVisible,
    testSwitchValue,
    testSwitchLoading,
    onChangeTestSwitch,
    showControlIcon,
    onClickControl,
    socketConnected,
    socketLoading,
    onRefreshSocket,
    notificationsCount = 0,
    onClickNotifications,
    messagesCount = 0,
    onClickMessages,
    userMenu,
    extraRight,
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
              <div className="location-select">
                <div
                  className="header-search group flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-3 h-9 transition-all backdrop-blur-sm focus-within:ring-2 focus-within:ring-white/60"
                  style={{ border: "1px solid #ffffff", boxShadow: "none" }}
                >
                  <div className="pl-1 flex items-center justify-center text-white">
                    <SearchIcon
                      sx={{ fontSize: 18, color: "white", marginLeft: "2px" }}
                    />
                  </div>
                  <div className="w-[320px] text-white">{searchComponent}</div>
                  <span className="ml-2 hidden md:inline-block text-[11px] text-white/70">
                    Ctrl K
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-[24px] relative">
            {testSwitchVisible && (
              <Switch
                size="small"
                disabled={!!testSwitchLoading}
                checked={!!testSwitchValue}
                onChange={(_, checked) =>
                  onChangeTestSwitch && onChangeTestSwitch(checked)
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#fff",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#fff",
                  },
                }}
              />
            )}

            {showControlIcon && (
              <TuneIcon
                onClick={onClickControl}
                style={{
                  fontSize: 18,
                  color: "white",
                  cursor: "pointer",
                }}
              />
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

            <div>
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
                      // @ts-ignore
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
