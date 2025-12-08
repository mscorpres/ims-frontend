import React, { useState, useEffect, useRef } from "react";
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
  logout,
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
  Switch,
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

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("previousToken");
  const sessionFromUrl = searchParams.get("session");
  const branchFromUrl = searchParams.get("branch");
  const comFromUrl = searchParams.get("company");
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const { user, notifications, testPages } = useSelector(
    (state) => state.login
  );

  const filteredRoutes = Rout.filter((route) => {
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
  const { pathname } = useLocation();
  const [testToggleLoading, setTestToggleLoading] = useState(false);
  const [testPage, setTestPage] = useState(false);
  const [branchSelected, setBranchSelected] = useState(true);
  const [modulesOptions, setModulesOptions] = useState([]);
  const [searchModule, setSearchModule] = useState("");
  const [showTickets, setShowTickets] = useState(false);
  const [searchHis, setSearchHis] = useState("");
  const [hisList, setHisList] = useState([]);
  const [showHisList, setShowHisList] = useState([]);
  const notificationsRef = useRef();
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
    dispatch(logout());
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
  const handleChangePageStatus = (value) => {
    let status = value ? "TEST" : "LIVE";
    socket.emit("setPageStatus", {
      page: pathname,
      status: status,
    });
    setTestToggleLoading(true);
    setTestPage(value);
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
  // notifications recieve handlers
  socket.on("connect", () => {
    console.log("WebSocket connected!!!!");
    setIsConnected(true);
    setIsLoading(false);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    setIsConnected(false);
    setIsLoading(false);
  });

  socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
    setIsConnected(false);
    setIsLoading(false);
  });
  const fetchUserDeatils = async (token, session, com, branch) => {
    setLoadingSwitch(true);
    localStorage.removeItem("loggedInUser");

    try {
      const response = await imsAxios.get(
        `/auth/switch?next=alwar.mscorpres.com&company=${com}&token=${token}&session=${session}&branch=${branch}`
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
        setLoadingSwitch(false);
        setSearchParams({}, { replace: true });
      } else {
        setLoadingSwitch(false);
         toast.error(response?.message);
         window.location.replace("https://alwar.mscorpres.com/");
       
      }
    } catch (error) {
      setLoadingSwitch(false);
         toast.error(response?.message);
        window.location.replace("https://alwar.mscorpres.com/");
   
    }
  };

  useEffect(() => {
    if (tokenFromUrl && sessionFromUrl && comFromUrl && branchFromUrl) {
      fetchUserDeatils(tokenFromUrl, sessionFromUrl, comFromUrl, branchFromUrl);
    }
  }, [tokenFromUrl, sessionFromUrl, comFromUrl, branchFromUrl]);

  useEffect(() => {
    if (Notification.permission == "default") {
      Notification.requestPermission();
    }
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        setShowSideBar(false);
      }
    });
    if (!user) {
      navigate("/login");
    }
    if (user) {
      if (user.company_branch) {
        setBranchSelected(true);
      }
    }
    if (user) {
      if (!user.company_branch) {
      }
      if (user.company_branch) {
        setBranchSelected(true);
      }
      socket.emit("fetch_notifications", {
        source: "react",
      });
    }

    if (user && user.token) {
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        arr = arr.map((row) => {
          console.log(
            "this one in norification",
            JSON.parse(row.other_data)?.message
          );
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
            message: JSON.parse(row.other_data)?.message,
          };
        });
        dispatch(setNotifications(arr));
      });
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file" || data[0].msg_type == "msg") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.req_date,
                file: JSON.parse(data.other_data).fileUrl,
                message: JSON.parse(data.other_data)?.message,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });

      // event for starting detail
      socket.on("download_start_detail", (data) => {
        console.log("start details arrived");
        toast.success("Your report has been started generating");
        if (data.title || data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        setTestToggleLoading(false);
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          let obj = {
            url: property,
            status: data[property],
          };
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        toast.error(data.message);
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
      socket.on("getting-loading-percentage", (data) => {
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                total: data.total,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, []);
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user) {
      let branch = JSON.parse(
        localStorage.getItem("otherData")
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
      const link = JSON.parse(localStorage.getItem("otherData"))?.currentLink;
      if (user.passwordChanged === "P") {
        navigate("/first-login");
      } else {
        navigate(link ?? "/");
      }
    }
    if (user && user.token) {
      // Use newToken from localStorage if available, otherwise use user.token
      const tokenToUse = localStorage.getItem("newToken") || user.token;
      imsAxios.defaults.headers["x-csrf-token"] = tokenToUse;
      imsAxios.defaults.headers["Company-Branch"] =
        user.company_branch || "BRMSC012";
      imsAxios.defaults.headers["Session"] = user.session || "25-26";
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.status,
                file: JSON.parse(data.other_data).fileUrl,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        // console.log("allnotifications", arr);
        arr = arr.map((row) => {
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
          };
        });
        dispatch(setNotifications(arr));
      });
      // event for starting detail
      socket.on("download_start_detail", (data) => {
        if (data.title && data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        setTestToggleLoading(false);
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          let obj = {
            url: property,
            status: data[property],
          };
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        toast.error(data.message);
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, [user?.token]);
  // Added useEffect to fetch enabled modules
  useEffect(() => {
    if (user && user.token && user.company_branch) {
      const fetchEnabledModules = async () => {
        try {
          console.log("Fetching modules for branch:", user.company_branch); // Debug branch
          // Use newToken if available, otherwise use user.token
          const tokenToUse = localStorage.getItem("newToken") || user.token;
          const { data } = await imsAxios.get("/branchdata/getEnabledModules", {
            headers: {
              "x-csrf-token": tokenToUse,
              "Company-Branch": user.company_branch,
              Session: user.session,
            },
          });
          console.log("Enabled Modules Response:", data); // Debug API response
          if (data.code === 200) {
            setEnabledModules(data.data || []); // Ensure empty array if undefined
          } else {
            toast.error(data.message?.msg || "Failed to fetch enabled modules");
            setEnabledModules([]);
          }
        } catch (error) {
          console.error("Error fetching enabled modules:", error);
          toast.error("Error fetching module permissions");
          setEnabledModules([]);
          if (error.response?.status === 403) {
            dispatch(logout());
            navigate("/login");
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
        "You are no longer connected to the Internet, please check your connection and try again."
      );
    });
    window.addEventListener("online", (e) => {
      toast(
        "The internet has been restored. Kindly review your progress to ensure there is no duplication of data."
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
        ({ text }, index) => !ids.includes(text, index + 1)
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
    console.log("obj in fnc");
    let obj = JSON.parse(localStorage.getItem("searchHistory"));
    // localStorage.setItem("searchHistory", JSON.stringify({ filtered }));

    let arr = obj?.filtered?.map((row) => ({
      text: row.text,
      value: row.value,
    }));
    // console.log("obj arr", arr);
    setShowHisList(arr);
  };

  const options = [
    { label: "A-21 [BRMSC012]", value: "BRMSC012" },
    { label: "B-29 [BRMSC029]", value: "BRMSC029" },
    { label: "B36 [ALWAR]", value: "BRALWR36" },
    { label: "D-160 [BRBAD116]", value: "BRBAD116" },
  ];
  const sessionOptions = [
    { label: "Session 22-23", value: "22-23" },
    { label: "Session 23-24", value: "23-24" },
    { label: "Session 24-25", value: "24-25" },
    { label: "Session 25-26", value: "25-26" },
  ];

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
      urlParams.append("previousToken", previousToken);
      urlParams.append("company", company);
      urlParams.append("branch", branch);
      urlParams.append("session", session);
    }

    const redirectUrl = `${targetUrl}?${urlParams.toString()}`;
    window.location.replace(redirectUrl);
  };

  const path = window.location.hostname;

  const refreshConnection = () => {
    setIsLoading(true);
    socket.close();
    socket.open();
  };

  const filteredItems = items(user)
    .map((item) => {
      const isItemEnabled = enabledModules.some(
        (mod) =>
          String(mod.module_key) === String(item.module_key) &&
          mod.enabled === 1
      );
      const isParentEnabled = enabledModules.some(
        (mod) =>
          String(mod.parent_module_key) === String(item.module_key) &&
          mod.enabled === 1
      );

      if (item.module_key) {
        if (item.children) {
          const enabledChildren = item.children.filter((child) => {
            const isChildEnabled = child.module_key
              ? enabledModules.some(
                  (mod) =>
                    String(mod.module_key) === String(child.module_key) &&
                    mod.enabled === 1
                )
              : isItemEnabled || isParentEnabled;
            console.log(
              `Checking child ${child.label} (module_key: ${
                child.module_key || "none"
              }):`,
              isChildEnabled
            );
            return isChildEnabled;
          });
          if (isItemEnabled || isParentEnabled || enabledChildren.length > 0) {
            console.log(
              `Showing ${item.label} (module_key: ${item.module_key}):`,
              {
                isItemEnabled,
                isParentEnabled,
                hasEnabledChildren: enabledChildren.length > 0,
              }
            );
            return { ...item, children: enabledChildren };
          }
          console.log(
            `Hiding ${item.label} (module_key: ${item.module_key}): no enabled children or not enabled`
          );
          return null;
        }
        if (isItemEnabled || isParentEnabled) {
          console.log(
            `Showing ${item.label} (module_key: ${item.module_key}):`,
            { isItemEnabled, isParentEnabled }
          );
          return item;
        }
        console.log(
          `Hiding ${item.label} (module_key: ${item.module_key}): not enabled`
        );
        return null;
      }

      console.log("No module_key, hiding item:", item.label);
      return null;
    })
    .filter((item) => item !== null);

  const filteredItems1 = items1(user, setShowTickets)
    .map((item) => {
      if (!item.module_key) {
        console.log("No module_key, showing item1:", item.label);
        return item;
      }
      const isEnabled = enabledModules.some(
        (mod) =>
          String(mod.module_key) === String(item.module_key) &&
          mod.enabled === 1
      );
      console.log(
        `Checking ${item.label} (module_key: ${item.module_key}):`,
        isEnabled
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
      {/* <TopBanner /> */}
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
                      <Typography.Text style={{ color: "white" }}>
                        <SearchOutlined />
                      </Typography.Text>
                      <div style={{ width: 250, color: "white" }}>
                        <MyAsyncSelect
                          style={{ color: "black" }}
                          // placeholder={
                          //   <span style={{ color: "#000000" }}>
                          //     Search here...
                          //   </span>
                          // }
                          placeholder="Select users"
                          onBlur={() => setModulesOptions([])}
                          noBorder={true}
                          hideArrow={true}
                          searchIcon={false}
                          color="white"
                          optionsState={modulesOptions}
                          loadOptions={getModuleSearchOptions}
                          value={searchModule}
                          onChange={setSearchModule}
                          onMouseEnter={showRecentSearch}
                          options={showHisList}
                        />
                      </div>
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
                      <Switch
                        loading={testToggleLoading}
                        checked={testPage}
                        onChange={(value) => handleChangePageStatus(value)}
                        checkedChildren="Test"
                        unCheckedChildren="Live"
                      />

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
                  {/* {favLoading ? (
                    <LoadingOutlined
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                    />
                  ) : user?.favPages?.filter(
                      (fav) => fav.url == pathname
                    )[0] ? (
                    <StarFilled
                      onClick={() => handleFavPages(true)}
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                    />
                  ) : (
                    <StarOutlined
                      onClick={() => handleFavPages(false)}
                      style={{
                        fontSize: 18,
                        color: "white",
                        cursor: "pointer",
                      }}
                    />
                  )} */}

                  <div>
                    <Badge
                      size="small"
                      style={{
                        background: notifications.filter(
                          (not) => not?.loading || not?.status == "pending"
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
                          (not) => not?.type != "message"
                        )}
                        deleteNotification={deleteNotification}
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
                        setSwitchingLocation(null);
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
                                switchSession || user?.session
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
          {user && user.passwordChanged === "C" && (
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
                  opacity: testPage ? 0.5 : 1,
                  pointerEvents:
                    testPage && user?.type != "developer" ? "none" : "all",

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
