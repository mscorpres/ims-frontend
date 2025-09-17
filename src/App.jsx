import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import Sidebar from "./new/components/layout/Sidebar/Sidebar";
import Rout from "./Routes/Routes";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "buffer";
import {
  logout,
  setNotifications,
  setFavourites,
  setTestPages,
  setCompanyBranch,
  setCurrentLink,
  setSession,
} from "./Features/loginSlice/loginSlice.js";
import UserMenu from "./Components/UserMenu";
import Logo from "./Components/Logo";
import socket from "./Components/socket.js";
import Notifications from "./Components/Notifications";
import MessageModal from "./Components/MessageModal/MessageModal";
// antd imports
import Layout, { Content } from "antd/lib/layout/layout";
import { Badge, Row, Select, Space, Switch, Typography } from "antd";
// icons import
import {
  CustomerServiceOutlined,
  BellFilled,
  StarFilled,
  StarOutlined,
  MenuOutlined,
  LoadingOutlined,
  SearchOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { Tooltip, IconButton } from "@mui/material";
import { SiSocketdotio } from "react-icons/si";
import { AppHeader } from "./new/components/layout/Header";
import InternalNav from "./Components/InternalNav";
import { imsAxios } from "./axiosInterceptor";
import MyAsyncSelect from "./Components/MyAsyncSelect";
import internalLinks from "./Pages/internalLinks.jsx";
import TicketsModal from "./Components/TicketsModal/TicketsModal";
import { items, items1 } from "./utils/sidebarRoutes.jsx";
// import TopBanner from "./Components/TopBanner";
import SettingDrawer from "./Components/SettingDrawer.jsx";

const App = () => {
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
    const term = (search || "").toLowerCase().trim();
    if (!term) {
      setModulesOptions([]);
      return;
    }

    const flatLinks = (internalLinks || []).flatMap((group) => group || []);

    const matched = flatLinks
      .filter((row) => {
        const name = (row?.routeName || "").toLowerCase();
        const path = (row?.routePath || "").toLowerCase();
        const placeholder = (row?.placeholder || "").toLowerCase();
        return (
          name.includes(term) ||
          path.includes(term) ||
          placeholder.includes(term)
        );
      })
      .map((row) => ({ text: row.routeName, value: row.routePath }));

    // Deduplicate by value, cap to 50 results to keep dropdown fast
    const unique = Array.from(
      new Map(matched.map((m) => [m.value, m])).values()
    ).slice(0, 50);

    setSearchHis(unique);
    setModulesOptions(unique);
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
  useEffect(() => {
    const otherData = JSON.parse(localStorage.getItem("otherData"));

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
      imsAxios.defaults.headers["x-csrf-token"] = user.token;
      imsAxios.defaults.headers["Company-Branch"] = "BRMSC012";
      imsAxios.defaults.headers["Session"] = "24-25";
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
    { label: "B-36 Alwar [BRBA036]", value: "BRBA036" },
  ];
  const sessionOptions = [
    { label: "Session 22-23", value: "22-23" },
    { label: "Session 23-24", value: "23-24" },
    { label: "Session 24-25", value: "24-25" },
    { label: "Session 25-26", value: "25-26" },
  ];
  const path = window.location.hostname;

  const refreshConnection = () => {
    setIsLoading(true);
    socket.close();
    socket.open();
  };

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
        {user && user.passwordChanged === "C" && (
          <Layout style={{ height: "100%" }}>
            <AppHeader
              onToggleSidebar={() => setShowSideBar((open) => !open)}
              logo={<Logo />}
              title="IMS"
              branchOptions={options}
              sessionOptions={sessionOptions}
              branchValue={user.company_branch}
              sessionValue={user.session}
              onChangeBranch={(value) => handleSelectCompanyBranch(value)}
              onChangeSession={(value) => handleSelectSession(value)}
              showSearch
              searchComponent={
                <MyAsyncSelect
                  // style={{ color: "black" }}
                  placeholder="Select Module"
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
              }
              testSwitchVisible={
                user?.type && user?.type.toLowerCase() == "developer"
              }
              testSwitchValue={testPage}
              testSwitchLoading={testToggleLoading}
              onChangeTestSwitch={(value) => handleChangePageStatus(value)}
              showControlIcon={
                user?.type && user?.type.toLowerCase() == "developer"
              }
              onClickControl={() => navToControl()}
              socketConnected={isConnected}
              socketLoading={isLoading}
              onRefreshSocket={() => refreshConnection()}
              notificationsCount={
                notifications.filter((not) => not?.type != "message")?.length
              }
              onClickNotifications={() => setShowNotifications((n) => !n)}
              messagesCount={
                notifications.filter((not) => not?.type == "message").length
              }
              onClickMessages={() => setShowTickets(true)}
              userMenu={
                <UserMenu
                  user={user}
                  logoutHandler={logoutHandler}
                  setShowSettings={setShowSetting}
                />
              }
              extraRight={
                showSetting ? (
                  <SettingDrawer
                    open={showSetting}
                    hide={() => setShowSetting(false)}
                  />
                ) : null
              }
            />
            {showNotifications &&
              createPortal(
                <div
                  id="notifications-panel"
                  style={{
                    position: "fixed",
                    top: 60,
                    right: 12,
                    zIndex: 10000,
                    width: 420,
                    maxHeight: "calc(100vh - 72px)",
                    overflowY: "auto",
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    pointerEvents: "auto",
                    outline: "1px solid transparent",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Notifications
                    source={"notifications"}
                    showNotifications={showNotifications}
                    notifications={notifications.filter(
                      (not) => not?.type != "message"
                    )}
                    deleteNotification={deleteNotification}
                  />
                </div>,
                document.body
              )}
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
          <div style={{ display: "flex", height: "100%", paddingTop: 45 }}>
            <TicketsModal
              open={showTickets}
              handleClose={() => setShowTickets(false)}
            />
            {user && user.passwordChanged === "C" && (
              <Sidebar
                className="site-layout-background"
                key={1}
                setShowSideBar={setShowSideBar}
                showSideBar={showSideBar}
                useJsonConfig={true}
                topOffset={
                  path.includes("dev.mscorpres") || path.includes("localhost")
                    ? 60
                    : 45
                }
                onWidthChange={(w) => {
                  const layout = document.querySelector(
                    "#app-content-left-margin"
                  );
                  if (layout) layout.style.marginLeft = `${w}px`;
                }}
              />
            )}
            {/* sidebar ends */}
            <Layout
              onClick={() => {
                setShowNotifications(false);
                setShowMessageNotifications(false);
              }}
              id="app-content-left-margin"
              style={{
                height: "100%",
                marginLeft: showSideBar ? 230 : 56,
                minWidth: 0,
              }}
            >
              <Content style={{ height: "100%" }}>
                <InternalNav links={internalLinks} />

                <div
                  style={{
                    height: "calc(100vh - 45px)",
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
          </div>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;
