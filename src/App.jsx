import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Rout from "./Routes/Routes";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Box, LinearProgress } from "@mui/material";
import "buffer";
import {
  setNotifications,
  setFavourites,
  setTestPages,
  setCompanyBranch,
  setCurrentLink,
  setSession,
  setUser,
  setSettings,
} from "./Features/loginSlice/loginSlice.js";
import UserMenu from "./Components/UserMenu";
import Logo from "./Components/Logo";
import socket from "./Components/socket.js";
import Notifications from "./Components/Notifications";
import MessageModal from "./Components/MessageModal/MessageModal";
// antd imports
import Layout, { Content, Header } from "antd/lib/layout/layout";
import {
  Badge,
  Row,
  Select,
  Space,
  Typography,
  Modal,
  Button,
} from "antd";
// icons import
import {
  CustomerServiceOutlined,
  BellFilled,
  SwapOutlined,
  EditOutlined,
  MenuOutlined,
  LoadingOutlined,
  SearchOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { Tooltip, IconButton } from "@mui/material";
import { SiSocketdotio } from "react-icons/si";
import InternalNav from "./Components/InternalNav";
import { imsAxios } from "./axiosInterceptor";
import MyAsyncSelect from "./Components/MyAsyncSelect";
import internalLinks from "./Pages/internalLinks.jsx";
import TicketsModal from "./Components/TicketsModal/TicketsModal";
import { items, items1 } from "./utils/sidebarRoutes.jsx";
import TopBanner from "./Components/TopBanner";
import SettingDrawer from "./Components/SettingDrawer.jsx";
import { logoutUser } from "./Features/loginSlice/logoutSlice.js";
import {
  getDefaultFinancialYearValue,
  getFinancialYearOptions,
} from "./utils/financialYear";
import {
  buildRelativePathFromLocation,
  consumePostLoginRedirect,
  getPostLoginRedirect,
  savePostLoginRedirect,
} from "./utils/authRedirect";
import ModuleSearch from "./Components/ModuleSearch/ModuleSearch.jsx";

const parseNotificationOtherData = (raw) => {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
  } catch {
    return {};
  }
};

const mapNotificationRow = (row) => {
  const other = parseNotificationOtherData(row.other_data);
  return {
    ...row,
    type: row.msg_type ?? row.type,
    title: row.request_txt_label ?? row.title,
    details: row.req_date ?? row.details ?? row.status,
    file: other.fileUrl,
    message: other?.message,
  };
};

const normalizeAllNotificationsPayload = (data) => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  if (!source.length) return [];
  return source.map(mapNotificationRow);
};

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const sessionFromUrl = searchParams.get("session");
  const branchFromUrl = searchParams.get("branch");
  const comFromUrl = searchParams.get("company");
  const type = searchParams.get("type");
  const isSwitchFlow = Boolean(
    tokenFromUrl && sessionFromUrl && comFromUrl && branchFromUrl && type,
  );
  const [loadingSwitch, setLoadingSwitch] = useState(isSwitchFlow);
  const { user, notifications, testPages } = useSelector(
    (state) => state.login,
  );

  const filteredRoutes = Rout?.filter((route) => {
    // Include the route if it doesn't have a "dept" property or if showlegal is true
    return !route.dept || user?.showlegal;
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSideBar, setShowSideBar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [showMessageNotifications, setShowMessageNotifications] =
    useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  // Pages opened in their own browser tab (e.g. PO Analysis Edit) render
  // without the app sidebar.
  const hideSidebar = [
    "/po-analysis/edit",
    "/jw-issue-challan/edit",
  ].includes(pathname);
 

  const [branchSelected, setBranchSelected] = useState(true);
  const [modulesOptions, setModulesOptions] = useState([]);
  const [searchModule, setSearchModule] = useState("");
  const [showTickets, setShowTickets] = useState(false);
  const [searchHis, setSearchHis] = useState("");
  const [hisList, setHisList] = useState([]);
  const [showHisList, setShowHisList] = useState([]);
  const notificationsRef = useRef([]);
  const testPagesRef = useRef(testPages);
  const pathnameRef = useRef(pathname);
  const lastAllNotificationsKeyRef = useRef("");
  const lastFetchNotificationsAtRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [enabledModules, setEnabledModules] = useState([]); // Added state for enabled modules
  const [showSwitchModule, setShowSwitchModule] = useState(false);
  const [isSwitchingModule, setIsSwitchingModule] = useState(false);
  const [switchLocation, setSwitchLocation] = useState(null);
  const [switchBranch, setSwitchBranch] = useState(null);
  const [switchSession, setSwitchSession] = useState(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);

  const logoutHandler = () => {
    dispatch(logoutUser());
  };
  const redirectToLogin = () => {
    const redirectPath = buildRelativePathFromLocation(location);
    if (pathname !== "/login") {
      savePostLoginRedirect(redirectPath);
    }
    navigate("/login", { replace: true });
  };
  const deleteNotification = (id) => {
    let arr = notifications;
    arr = arr.filter((not) => not.ID != id);
    dispatch(setNotifications(arr));
  };
  useEffect(() => {
    if (pathname === "/controlPanel/registeredUsers" && user?.type == "user") {
      navigate("/");
    }
  }, [user?.type]);

  const handleFavPages = async (status) => {
    let favs = user.favPages;

    if (!status) {
      setFavLoading(true);
      const { data } = await imsAxios.post("/backend/favouritePages", {
        pageUrl: pathname,
        source: "react",
      });
      setFavLoading(false);
      if (data.code == 200) {
        favs = JSON.parse(data.data);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      let page_id = favs.filter((f) => f.url == pathname)[0].page_id;
      setFavLoading(true);
      const { data } = await imsAxios.post("/backend/removeFavouritePages", {
        page_id,
      });
      setFavLoading(false);
      if (data.code == 200) {
        let fav = JSON.parse(data.data);
        favs = fav;
      } else {
        toast.error(data.message.msg);
      }
    }
    dispatch(setFavourites(favs));
  };
  // to trigger
  const navToControl = () => {
    if (user?.type == "user") {
      navigate("/");
    } else {
      navigate("/controlPanel/registeredUsers");
    }
  };

  const handleSelectCompanyBranch = (value) => {
    dispatch(setCompanyBranch(value));
    setBranchSelected(true);
    socket.emit("getBranch", value);
  };

  const handleSelectSession = (value) => {
    dispatch(setSession(value));
  };

  const getModuleSearchOptions = (search) => {
    let arr = [];
    let modOpt = [];
    internalLinks.map((row) => {
      let a = row;
      arr.push(...a);
    });
    arr.map((row) => {
      if (row.routeName?.toLowerCase().includes(search)) {
        let obj = {
          text: row.routeName,
          value: row.routePath,
        };
        modOpt.push(obj);
      }
    });
    setSearchHis(modOpt);
    setModulesOptions(modOpt);
  };
  useEffect(() => {
    if (modulesOptions?.length === 0) {
      setModulesOptions(showHisList);
    }
  }, [modulesOptions]);
  // Prevent duplicate listeners on re-render.
  useEffect(() => {
    const handleConnect = () => {
      console.log("WebSocket connected!!!!");
      setIsConnected(true);
      setIsLoading(false);
    };
    const handleConnectError = (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
      setIsLoading(false);
    };
    const handleDisconnect = (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
      setIsLoading(false);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);
  const fetchUserDeatils = async (token, session, com, branch, type) => {
    setLoadingSwitch(true);
    localStorage.setItem("switchInProgress", "1");

    try {
      const response = await imsAxios.get(
        `/auth/switch?next=alwar.mscorpres.com&company=${com}&token=${token}&session=${session}&branch=${branch}&type=${type}`,
      );
      if (response?.success) {
        const payload = response?.data;
        const obj = {
          email: payload.crn_email,
          phone: payload.crn_mobile,
          comId: payload.company_id,
          userName: payload.username,
          token: payload.token,
          favPages: payload.fav_pages ? JSON.parse(payload.fav_pages) : [],
          type: payload.crn_type,
          mobileConfirmed: payload.other?.m_v,
          emailConfirmed: payload.other?.e_v,
          passwordChanged: payload.other?.c_p ?? "C",
          company_branch: branch, // Use selected branch from login form
          currentLink: JSON.parse(localStorage.getItem("branchData"))
            ?.currentLink,
          id: payload.crn_id,
          showlegal: payload.department === "legal" ? true : false,
          session: session,
        };
        localStorage.setItem("loggedInUser", JSON.stringify(obj));
        dispatch(setUser(obj));
        if (payload.settings) dispatch(setSettings(payload.settings));

        setSearchParams({}, { replace: true });
      } else {
        toast.error(response?.message);
        window.location.replace("https://alwar.mscorpres.com/");
      }
    } catch (error) {
      toast.error(error?.message);
      window.location.replace("https://alwar.mscorpres.com/");
    } finally {
      localStorage.removeItem("switchInProgress");
      setLoadingSwitch(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl && sessionFromUrl && comFromUrl && branchFromUrl && type) {
      fetchUserDeatils(
        tokenFromUrl,
        sessionFromUrl,
        comFromUrl,
        branchFromUrl,
        type,
      );
    }
  }, [tokenFromUrl, sessionFromUrl, comFromUrl, branchFromUrl, type]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    const handleKeyup = (e) => {
      if (e.key === "Escape") {
        setShowSideBar(false);
      }
    };
    document.addEventListener("keyup", handleKeyup);
    return () => document.removeEventListener("keyup", handleKeyup);
  }, []);
  useEffect(() => {
    if (!user) {
      redirectToLogin();
    } else if (user) {
      let branch = JSON.parse(
        localStorage.getItem("otherData"),
      )?.company_branch;
      if (branch) {
        setBranchSelected(true);
        // toast.error(
        //   "Please select a company branch before working on any modules"
        // );
      }
      // handleSelectSession("23-24");
    }
  }, [user]);
  useEffect(() => {
    if (pathname === "/login" && user) {
      const fallbackLink =
        JSON.parse(localStorage.getItem("otherData"))?.currentLink ?? "/";
      const pendingRedirect = getPostLoginRedirect(fallbackLink);
      const link = JSON.parse(localStorage.getItem("otherData"))?.currentLink;
      if (user.passwordChanged === "P") {
        consumePostLoginRedirect("/first-login");
        navigate("/first-login");
      } else {
        consumePostLoginRedirect(link ?? "/");
        navigate(pendingRedirect, { replace: true });
      }
    }
  }, [pathname, user, navigate]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const fetchNotifications = useCallback(() => {
    if (!user?.token) return;
    const now = Date.now();
    if (now - lastFetchNotificationsAtRef.current < 2000) return;
    lastFetchNotificationsAtRef.current = now;
    socket.emit("fetch_notifications", { source: "react" });
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return;

    const tokenToUse = localStorage.getItem("newToken") || user.token;
    const companyBranch = user.company_branch || "BRMSC012";
    const session = user.session || getDefaultFinancialYearValue();

    imsAxios.defaults.headers["Authorization"] = `${tokenToUse}`;
    imsAxios.defaults.headers["Company-Branch"] = companyBranch;
    imsAxios.defaults.headers["Session"] = session;

    socket.auth = {
      token: tokenToUse,
      companyBranch,
    };

    const handleAllNotifications = (data) => {
      const arr = normalizeAllNotificationsPayload(data);
      if (!arr.length) return;

      const payloadKey = arr
        .map((n) => n.notificationId ?? n.ID ?? n.id)
        .join("|");
      if (payloadKey && payloadKey === lastAllNotificationsKeyRef.current) {
        return;
      }
      lastAllNotificationsKeyRef.current = payloadKey;
      dispatch(setNotifications(arr));
    };

    const handleSocketReceiveNotification = (data) => {
      if (data?.type === "message") {
        const arr = [
          data,
          ...notificationsRef.current.filter(
            (not) => not.conversationId !== data.conversationId,
          ),
        ];
        dispatch(setNotifications(arr));
        setNewNotification(data);
        return;
      }

      const payload = Array.isArray(data) ? data[0] : data;
      if (
        !payload ||
        (payload.msg_type !== "file" && payload.msg_type !== "msg")
      ) {
        return;
      }

      const mapped = mapNotificationRow(payload);
      const exists = notificationsRef.current.some(
        (not) => not.notificationId === mapped.notificationId,
      );
      const arr = exists
        ? notificationsRef.current.map((not) =>
            not.notificationId === mapped.notificationId ? mapped : not,
          )
        : [mapped, ...notificationsRef.current];
      dispatch(setNotifications(arr));
      setNewNotification(mapped);
    };

    const handleDownloadStartDetail = (data) => {
      if (data?.title || data?.details) {
        toast.success("Your report has been started generating");
        dispatch(setNotifications([data, ...notificationsRef.current]));
      }
    };

    const handleGetPageStatus = (data) => {
      setTestToggleLoading(false);
      let pages = testPagesRef.current ?? [];

      let arr = [];
      for (const property in data) {
        if (!property.includes("/")) continue;
        if (data[property] === "TEST") {
          arr = [{ url: property, status: data[property] }, ...arr];
        }
        if (data[property] === "LIVE") {
          pages = pages.filter((page) => page.url !== property);
        }
      }
      dispatch(setTestPages(arr));
      setTestPage(
        Boolean(arr.find((page) => page.url === pathnameRef.current)),
      );
    };

    const handleFileGenerateError = (data) => {
      toast.error(data?.message);
      const exists = notificationsRef.current.some(
        (row) => row.notificationId === data.notificationId,
      );
      const arr = exists
        ? notificationsRef.current.map((row) =>
            row.notificationId === data.notificationId
              ? { ...row, error: true }
              : row,
          )
        : [data, ...notificationsRef.current];
      dispatch(setNotifications(arr));
    };

    const handleLoadingPercentage = (data) => {
      const exists = notificationsRef.current.some(
        (row) => row.notificationId === data.notificationId,
      );
      const arr = exists
        ? notificationsRef.current.map((row) =>
            row.notificationId === data.notificationId
              ? { ...row, total: data.total }
              : row,
          )
        : [data, ...notificationsRef.current];
      dispatch(setNotifications(arr));
    };

    socket.on("all-notifications", handleAllNotifications);
    socket.on("socket_receive_notification", handleSocketReceiveNotification);
    socket.on("download_start_detail", handleDownloadStartDetail);
    socket.on("getPageStatus", handleGetPageStatus);
    socket.on("file-generate-error", handleFileGenerateError);
    socket.on("getting-loading-percentage", handleLoadingPercentage);

    fetchNotifications();

    return () => {
      socket.off("all-notifications", handleAllNotifications);
      socket.off(
        "socket_receive_notification",
        handleSocketReceiveNotification,
      );
      socket.off("download_start_detail", handleDownloadStartDetail);
      socket.off("getPageStatus", handleGetPageStatus);
      socket.off("file-generate-error", handleFileGenerateError);
      socket.off("getting-loading-percentage", handleLoadingPercentage);
    };
  }, [
    user?.token,
    user?.company_branch,
    user?.session,
    dispatch,
    fetchNotifications,
  ]);
  // Added useEffect to fetch enabled modules
  useEffect(() => {
    if (user && user.token) {
      const fetchEnabledModules = async () => {
        try {
          // Use newToken if available, otherwise use user.token
          const tokenToUse = localStorage.getItem("newToken") || user.token;
          const { data } = await imsAxios.get("/branchdata/getEnabledModules", {
            headers: {
              Authorization: `${tokenToUse}`,
              // Prefer current user selection, but fall back to localStorage and defaults.
              "Company-Branch":
                user.company_branch ??
                JSON.parse(localStorage.getItem("otherData"))?.company_branch ??
                "BRMSC012",
              Session:
                user.session ??
                JSON.parse(localStorage.getItem("otherData"))?.session ??
                getDefaultFinancialYearValue(),
            },
          });
          if (data?.code === 200) {
            setEnabledModules(data?.data || []); // Ensure empty array if undefined
          } else {
            toast.error(data?.message?.msg || "Failed to fetch enabled modules");
            setEnabledModules([]);
          }
        } catch (error) {
          toast.error(error?.message || "Error fetching module permissions");
          setEnabledModules([]);
          if (error.response?.status === 403) {
            dispatch(logoutUser());
            redirectToLogin();
          }
        }
      };
      fetchEnabledModules();
    } else {
      console.log("Missing user data:", {
        user,
        token: user?.token,
        branch: user?.company_branch,
      });
      setEnabledModules([]);
    }
  }, [
    user,
    user?.token,
    user?.company_branch,
    user?.session,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    setShowSideBar(false);
    setShowMessageNotifications(false);
    setShowNotifications(false);
    let currentLink = pathname;
    if (user) {
      if (pathname !== "login") {
        dispatch(setCurrentLink(currentLink));
        if (user.passwordChanged === "P") {
          navigate("/first-login");
        }
      }
    }
  }, [navigate]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  useEffect(() => {
    testPagesRef.current = testPages;
  }, [testPages]);
  useEffect(() => {
    if (newNotification?.type) {
      if (Notification.permission == "default") {
        Notification.requestPermission(function (permission) {
          if (permission === "default") {
            let notification = new Notification(newNotification.title, {
              body: newNotification.message,
            });
            notification.onclick = () => {
              notification.close();
              window.parent.focus();
            };
          }
        });
      } else {
        let notification = new Notification(newNotification?.title, {
          body: newNotification?.message,
        });
        notification.onclick = () => {
          notification.close();
          window.parent.focus();
        };
      }
    }
  }, [newNotification]);
  useEffect(() => {
    if (showMessageNotifications) {
      {
        setShowNotifications(false);
      }
    }
  }, [showMessageNotifications]);
  useEffect(() => {
    if (showNotifications) {
      {
        setShowMessageNotifications(false);
      }
    }
  }, [showNotifications]);
  useEffect(() => {
    if (testPages) {
      let match = testPages?.filter((page) => page.url == pathname)[0];
      if (match) {
        setTestPage(true);
      } else {
        setTestPage(false);
      }
    }
  }, [navigate, user]);
  useEffect(() => {
    window.addEventListener("offline", (e) => {
      console.log("offline", e);
      toast(
        "You are no longer connected to the Internet, please check your connection and try again.",
      );
    });
    window.addEventListener("online", (e) => {
      toast(
        "The internet has been restored. Kindly review your progress to ensure there is no duplication of data.",
      );
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    setModulesOptions([]);
    if (searchModule.length > 2) {
      // console.log("Search module is here", searchModule);
      // console.log("Search msearchHis", searchHis);
      let searching = searchHis.filter((i) => i.value === searchModule);
      // setHisList([...hisList,searching]);
      let a = hisList.push(...hisList, ...searching);
      const ids = hisList.map(({ text }) => text);
      const filtered = hisList.filter(
        ({ text }, index) => !ids.includes(text, index + 1),
      );
      // console.log("Search module Array after filtering in here", a);
      // console.log("Search module Array after filtering in here", filtered);
      // setHisList(filtered);
      // localStorage.setItem("searchHistory", hisList);
      localStorage.setItem("searchHistory", JSON.stringify({ filtered }));

      navigate(searchModule);
    }
  }, [searchModule]);

  const showRecentSearch = () => {
    let obj = JSON.parse(localStorage.getItem("searchHistory"));
    // localStorage.setItem("searchHistory", JSON.stringify({ filtered }));

    let arr = obj?.filtered?.map((row) => ({
      text: row.text,
      value: row.value,
    }));

    setShowHisList(arr);
  };

  const options = [
    { label: "A-21 [BRMSC012]", value: "BRMSC012" },
    { label: "B-29 [BRMSC029]", value: "BRMSC029" },
    { label: "B36 [ALWAR]", value: "BRALWR36" },
    { label: "D-160 [BRBAD116]", value: "BRBAD116" },
  ];
  const sessionOptions = getFinancialYearOptions(22);

  const locationBranchOptions = {
    alwar: [{ label: "B36 [ALWAR]", value: "BRALWR36" }],
    noida: [
      { label: "A-21 [BRMSC012]", value: "BRMSC012" },
      { label: "B-29 [BRMSC029]", value: "BRMSC029" },
      { label: "D-160 [BRBAD116]", value: "BRBAD116" },
    ],
  };

  const handleSwitchModule = async (location, branch, session) => {
    const existing = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    const previousToken = existing?.token;

    const company = location.toLowerCase() === "alwar" ? "COM0002" : "COM0001";
    if (company === existing?.comId) {
      toast.error(`You are already On ${location} Module`);
      return;
    }

    const targetUrl = import.meta.env.VITE_REACT_APP_SWITCH_URL;

    const urlParams = new URLSearchParams();
    if (previousToken && location && branch && session) {
      urlParams.append("token", previousToken);
      urlParams.append("company", company);
      urlParams.append("branch", branch);
      urlParams.append("session", session);
      urlParams.append("type", "switch");
    }

    const redirectUrl = `${targetUrl}?${urlParams.toString()}`;
    window.location.replace(redirectUrl);
  };

  const path = window.location.hostname;

  const refreshNotifications = useCallback(() => {
    lastFetchNotificationsAtRef.current = 0;
    lastAllNotificationsKeyRef.current = "";
    fetchNotifications();
  }, [fetchNotifications]);

  const refreshConnection = () => {
    if (user?.token) {
      const tokenToUse = localStorage.getItem("newToken") || user.token;
      socket.auth = {
        token: tokenToUse,
        companyBranch: user.company_branch || "BRMSC012",
      };
    }
    setIsLoading(true);
    socket.disconnect();
    socket.connect();
    refreshNotifications();
  };

  const filteredItems = items(user)
    .map((item) => {
      const isItemEnabled = enabledModules.some(
        (mod) =>
          String(mod.module_key) === String(item.module_key) &&
          mod.enabled === 1,
      );
      const isParentEnabled = enabledModules.some(
        (mod) =>
          String(mod.parent_module_key) === String(item.module_key) &&
          mod.enabled === 1,
      );

      if (item.module_key) {
        if (item.children) {
          const enabledChildren = item.children.filter((child) => {
            const isChildEnabled = child.module_key
              ? enabledModules.some(
                  (mod) =>
                    String(mod.module_key) === String(child.module_key) &&
                    mod.enabled === 1,
                )
              : isItemEnabled || isParentEnabled;

            return isChildEnabled;
          });
          if (isItemEnabled || isParentEnabled || enabledChildren.length > 0) {
            return { ...item, children: enabledChildren };
          }

          return null;
        }
        if (isItemEnabled || isParentEnabled) {
          return item;
        }

        return null;
      }

      return null;
    })
    .filter((item) => item !== null);

  const filteredItems1 = items1(user, setShowTickets)
    .map((item) => {
      if (!item.module_key) {
        return item;
      }
      const isEnabled = enabledModules.some(
        (mod) =>
          String(mod.module_key) === String(item.module_key) &&
          mod.enabled === 1,
      );

      return isEnabled ? item : null;
    })
    .filter((item) => item !== null);

  if (loadingSwitch) {
    return (
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <LinearProgress
          sx={{
            position: "sticky",
            top: 0,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/assets/images/mscorpres_auto_logo.png"
            alt=""
            style={{ width: 100, opacity: 0.8 }}
          />
        </Box>
      </Box>
    );
  }
  return (
    <div style={{ height: "100vh" }}>
      <ToastContainer
        position="bottom-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        limit={1}
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />
      <Layout
        style={{
          width: "100%",
          top: 0,
        }}
      >
        {/* header start */}

        {(path.includes("dev.mscorpres") || path.includes("localhost")) && (
          <div
            style={{
              backgroundColor: "yellow",
              height: "15px",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            TEST SERVER
          </div>
        )}
        <TopBanner />
        {user && user.passwordChanged === "C" && (
          <Layout style={{ height: "100%" }}>
            <Header
              style={{
                zIndex: 4,
                height: 45,
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Row style={{ width: "100%" }} justify="space-between">
                <Space size="large">
                  {!hideSidebar && (
                    <MenuOutlined
                      onClick={() => {
                        setShowSideBar((open) => !open);
                      }}
                      style={{
                        color: "white",
                        marginLeft: 12,
                        fontSize: window.innerWidth > 1600 && "1rem",
                      }}
                    />
                  )}

                  <Link to="/">
                    <Space
                      style={{
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      <Logo />
                      <span style={{ color: "white" }}>IMS</span>
                    </Space>
                  </Link>
                  <div className="location-select">
                    <Select
                      style={{ width: 200, color: "white" }}
                      options={options}
                      bordered={false}
                      placeholder="Select Company Branch"
                      onChange={(value) => handleSelectCompanyBranch(value)}
                      value={user.company_branch}
                      disabled
                    />
                  </div>
                  <div className="location-select">
                    <Select
                      style={{ width: 200, color: "white" }}
                      options={sessionOptions}
                      bordered={false}
                      placeholder="Select Session"
                      onChange={(value) => handleSelectSession(value)}
                      value={user.session}
                    />
                  </div>
                </Space>
                <Space>
                  <div className="location-select">
                    <Space>
                  <ModuleSearch />
                    </Space>
                  </div>
                </Space>
                <Space
                  size="large"
                  style={{
                    position: "relative",
                  }}
                >
                  {user?.type && user?.type.toLowerCase() == "developer" && (
                    <>
                      <ControlOutlined
                        style={{
                          fontSize: 18,
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={() => navToControl()}
                      />
                    </>
                  )}
                  <Tooltip title="Switch Module" placement="bottom">
                    <SwapOutlined
                      style={{
                        fontSize: 18,

                        color: "white",

                        cursor: "pointer",
                      }}
                      onClick={() => setShowSwitchModule(true)}
                    />
                  </Tooltip>
                  <Tooltip
                    title={`Socket ${
                      isConnected ? "Connected" : "Disconnected"
                    }`}
                    placement="bottom"
                  >
                    <IconButton
                      onClick={() => refreshConnection()}
                      disabled={isLoading}
                    >
                      <SiSocketdotio
                        style={{
                          fontSize: "25px",
                          color: isConnected ? "#10b981" : "#ef4444",
                          animation: isLoading
                            ? "spin 1s linear infinite"
                            : "none",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                
         

                  <div>
                    <Badge
                      size="small"
                      style={{
                        background: notifications.filter(
                          (not) => not?.loading || not?.status == "pending",
                        )[0]
                          ? "#EAAE0F"
                          : "green",
                      }}
                      count={
                        notifications.filter((not) => not?.type != "message")
                          ?.length
                      }
                    >
                      <BellFilled
                        onClick={() => setShowNotifications((n) => !n)}
                        style={{
                          fontSize: 18,
                          color: "white",
                          // marginRight: 8,
                        }}
                      />
                    </Badge>
                    {showNotifications && (
                      <Notifications
                        source={"notifications"}
                        showNotifications={showNotifications}
                        notifications={notifications.filter(
                          (not) => not?.type != "message",
                        )}
                        deleteNotification={deleteNotification}
                        onRefresh={refreshNotifications}
                      />
                    )}
                  </div>
                  <div>
                    <Badge
                      size="small"
                      count={
                        notifications.filter((not) => not?.type == "message")
                          .length
                      }
                    >
                      <CustomerServiceOutlined
                        onClick={() => setShowTickets(true)}
                        style={{
                          fontSize: 18,
                          cursor: "pointer",
                          color: "white",
                        }}
                      />
                    </Badge>
                  </div>
                  <UserMenu
                    user={user}
                    logoutHandler={logoutHandler}
                    setShowSettings={setShowSetting}
                  />
                  {showSetting && (
                    <SettingDrawer
                      open={showSetting}
                      hide={() => setShowSetting(false)}
                    />
                  )}
                  <Modal
                    title={null}
                    open={showSwitchModule}
                    onCancel={() => {
                      if (!isSwitchingModule) {
                        setShowSwitchModule(false);
                        setSwitchLocation(null);
                        setSwitchBranch(null);
                        setSwitchSession(null);
                        setIsSwitchingModule(false);
                        setSwitchSuccess(false);
                      }
                    }}
                    footer={null}
                    width={400}
                    centered
                    maskClosable={!isSwitchingModule}
                    closable={!isSwitchingModule}
                  >
                    {isSwitchingModule ? (
                      <div
                        style={{
                          padding: "60px 0",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {switchSuccess ? (
                          <>
                            <video
                              src="/assets/check.mp4"
                              autoPlay
                              muted
                              style={{ width: 120, height: 120 }}
                            />
                            <p
                              style={{
                                marginTop: 16,
                                color: "#047780",
                                fontWeight: 500,
                              }}
                            >
                              Authenticated! Redirecting...
                            </p>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                border: "4px solid #f3f3f3",
                                borderTop: "4px solid #047780",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                              }}
                            />
                            <style>
                              {`
                                @keyframes spin {
                                  0% { transform: rotate(0deg); }
                                  100% { transform: rotate(360deg); }
                                }
                              `}
                            </style>
                            <p style={{ marginTop: 16, color: "#666" }}>
                              Authenticating...
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "20px 0",
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                          }}
                        >
                          <SwapOutlined
                            style={{ fontSize: 28, color: "#047780" }}
                          />
                        </div>
                        <h3 style={{ margin: "0 0 24px 0", color: "#333" }}>
                          Switch Module
                        </h3>
                        <div style={{ width: "100%", maxWidth: 300 }}>
                          <div style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                fontWeight: 500,
                                color: "#666",
                              }}
                            >
                              Location
                            </div>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select Location"
                              options={[
                                { label: "Alwar", value: "alwar" },
                                { label: "Noida", value: "noida" },
                              ]}
                              value={switchLocation}
                              onChange={(value) => {
                                setSwitchLocation(value);
                                setSwitchBranch(null);
                              }}
                            />
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                fontWeight: 500,
                                color: "#666",
                              }}
                            >
                              Branch
                            </div>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select Branch"
                              disabled={!switchLocation}
                              options={
                                switchLocation
                                  ? locationBranchOptions[switchLocation]
                                  : []
                              }
                              value={switchBranch}
                              onChange={(value) => setSwitchBranch(value)}
                            />
                          </div>
                          <div style={{ marginBottom: 24 }}>
                            <div
                              style={{
                                marginBottom: 6,
                                fontWeight: 500,
                                color: "#666",
                              }}
                            >
                              Session
                            </div>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select Session"
                              options={sessionOptions}
                              value={switchSession || user?.session}
                              onChange={(value) => setSwitchSession(value)}
                            />
                          </div>
                          <Button
                            type="primary"
                            block
                            size="large"
                            style={{
                              background: "#047780",
                              borderColor: "#047780",
                              height: 44,
                            }}
                            disabled={!switchLocation || !switchBranch}
                            onClick={() => {
                              handleSwitchModule(
                                switchLocation.charAt(0).toUpperCase() +
                                  switchLocation.slice(1),
                                switchBranch,
                                switchSession || user?.session,
                              );
                            }}
                          >
                            Switch
                          </Button>
                        </div>
                      </div>
                    )}
                  </Modal>
                </Space>
              </Row>
            </Header>
          </Layout>
        )}
        {/* header ends */}
        {/* sidebar starts */}
        <Layout
          style={{
            height: "100%",
            opacity: user && !branchSelected ? 0.5 : 1,
            pointerEvents: user && !branchSelected ? "none" : "all",
          }}
        >
          <TicketsModal
            open={showTickets}
            handleClose={() => setShowTickets(false)}
          />
          {user && user.passwordChanged === "C" && !hideSidebar && (
            <Sidebar
              items={filteredItems}
              items1={filteredItems1}
              className="site-layout-background"
              key={1}
              setShowSideBar={setShowSideBar}
              showSideBar={showSideBar}
            />
          )}
          {/* sidebar ends */}
          <Layout
            onClick={() => {
              setShowNotifications(false);
              setShowMessageNotifications(false);
            }}
            style={{ height: "100%" }}
          >
            <Content style={{ height: "100%" }}>
              <InternalNav links={internalLinks} />

              <div
                style={{
                  height: "calc(100vh - 50px)",
                  width: "100%",
                  opacity:1,
                  pointerEvents:
                   "all",

                  overflowX: "hidden",
                }}
              >
                <MessageModal
                  showMessageDrawer={showMessageDrawer}
                  setShowMessageDrawer={setShowMessageDrawer}
                />
                <Routes>
                  {filteredRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.main />}
                    />
                  ))}
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;
