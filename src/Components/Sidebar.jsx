import React from "react";
import "../index.css";
import Sider from "antd/lib/layout/Sider";
import { Menu } from "antd";
const Sidebar = ({ showSideBar, setShowSideBar, items, items1, ...props }) => {
  return (
    <Sider
      style={{
        height: "100vh",
        zIndex: 99,
        overflowY: "auto",
      }}
      width={230}
      collapsedWidth={50}
      collapsed={!showSideBar}
      onCollapse={(value) => setShowSideBar(value)}
    >
      <Menu
        theme="dark"
        // forceSubMenuRender
        style={{ height: "90%", background: "#001529" }}
        defaultSelectedKeys={["1"]}
        mode="vertical"
        triggerSubMenuAction="hover"
        inlineCollapsed={!showSideBar}
        items={[...items, ...items1]}
      />
      {/* //item 2 removed  */}
      {/* <Menu
        theme="dark"
        // forceSubMenuRender
        style={{
          height: "30%",
          // background: "#047780",
          background: " #001529",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 50,
          justifyContent: "flex-end",
        }}
        defaultSelectedKeys={["1"]}
        mode="vertical"
        inlineCollapsed={!showSideBar}
        items={items1}
      /> */}
    </Sider>
  );
};
export default Sidebar;
