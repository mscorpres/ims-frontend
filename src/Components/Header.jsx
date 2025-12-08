import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { logout } from "../Features/loginSlice.js/loginSlice";
import { FaCube } from "react-icons/fa";
import io from "socket.io-client";
import UserMenu from "./UserMenu";
let socket;
// import { Space } from "antd";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import Logo from "./Logo";

const Header = ({ showSideBar, setShowSideBar, notifications }) => {
  const { user } = useSelector((state) => state.login);
  // const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState(false);
  const [location, setLocation] = useState("");
  const locationOptions = [{ value: "BRMSC012", label: "A-21 [BRMSC012]" }];
  const [norificationStatus, setNotificationStatus] = useState(false);

  const logoutHandler = () => {
    dispatch(logout());
  };
  const toggleSideBar = () => {
    setShowSideBar((open) => !open);
  };
  const colourStyles = {
    control: (provided, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...provided,
        backgroundColor: "#4d636f",
        border: "none",
        color: "white",
        boxShadow: "none",
        outline: "none",
        // borderBottom: "2px solid white",
      };
    },
    placeholder: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: "#4d636f",
        border: "none",
        color: "white",
        paddingBottom: "3px",
        borderBottom: "2px solid white",
      };
    },
    dropdownIndicator: (base, { data, isDisabled, isFocused, isSelected }) => ({
      ...base,
      color: isFocused && "white", // Custom colour
    }),
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
 

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        height: 45,
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Space size="large">
        <MenuOutlined
          onClick={() => {
            setShowSideBar((open) => !open);
          }}
          style={{
            color: "white",
            marginLeft: 12,
          }}
        />

        <Space
          style={{
            color: "white",
            fontSize: "1.2rem",
          }}
        >
          {/* <FaCube style={{ marginBottom: -3 }} /> */}
          <Logo /> IMS
        </Space>
      </Space>
    </Header>
  );
};

export default Header;
