import React, { useMemo, useState } from "react";
import "../../../../index.css";

type AnyItem = any;

const Sidebar = ({
  showSideBar,
  setShowSideBar,
  items,
  items1,
}: {
  showSideBar: boolean;
  setShowSideBar: (v: boolean) => void;
  items: AnyItem[];
  items1: AnyItem[];
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleItemHover = (key: string, hasChildren: boolean) => {
    if (!showSideBar && hasChildren && !activeKey) {
      setHoveredKey(key);
    }
  };

  const handleItemClick = (key: string, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveKey((prev) => (prev === key ? null : key));
    }
  };

  const isSubSidebarVisible = (key: string) => {
    return activeKey === key || (!activeKey && hoveredKey === key);
  };

  const hoveredItem = useMemo(() => {
    return items.find((item) => item.key === (activeKey || hoveredKey));
  }, [hoveredKey, activeKey, items]);

  const renderList = (arr: AnyItem[], alwaysShowText = false) => (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {arr.map((c: AnyItem) => {
        const hasChildren = c.children && c.children.length > 0;
        const isVisible = isSubSidebarVisible(c.key);

        return (
          <li key={c.key}>
            <div
              onMouseEnter={() => handleItemHover(c.key, hasChildren)}
              onMouseLeave={() => {
                if (!activeKey) setHoveredKey(null);
              }}
              onClick={() => handleItemClick(c.key, hasChildren)}
              style={{
                padding: "10px 12px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 6,
                backgroundColor: isVisible
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              }}
            >
              <span
                style={{
                  width: 24,
                  display: "inline-flex",
                  justifyContent: "center",
                }}
              >
                {c.icon}
              </span>
              {(showSideBar || alwaysShowText) && (
                <div
                  style={{
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {typeof c.label === "string" ? (
                    <span>{c.label}</span>
                  ) : (
                    c.label
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  const subSidebarOpen = !showSideBar && hoveredItem && hoveredItem.children;
  const rootWidth = showSideBar ? 230 : subSidebarOpen ? 56 + 230 : 56;

  return (
    <div style={{ display: "flex", position: "relative", width: rootWidth }}>
      {/* Main Sidebar */}
      <div
        style={{
          height: "100vh",
          width: showSideBar ? 230 : 56,
          transition: "width .2s ease",
          background: "#047780",
          overflowY: "auto",
          position: "relative",
          zIndex: 99,
          flex: "none",
        }}
      >
        <div
          style={{
            padding: 12,
            color: "#fff",
            fontWeight: 700,
            borderBottom: "1px solid rgba(255,255,255,.1)",
          }}
        >
          {showSideBar ? "IMS" : ""}
        </div>
        <div style={{ overflowY: "auto" }}>{renderList(items)}</div>
        <div style={{ position: "absolute", bottom: 12, left: 0, right: 0 }}>
          {renderList(items1)}
        </div>
      </div>

      {/* Sub Sidebar: always visible when clicked or hovered */}
      {!showSideBar && hoveredItem && hoveredItem.children && (
        <div
          style={{
            height: "100vh",
            width: 230,
            background: "#047780",
            overflowY: "auto",
            borderLeft: "1px solid rgba(255,255,255,.1)",
            position: "absolute",
            top: 0,
            left: 56,
            transition: "left .2s ease",
            zIndex: 100,
          }}
          onMouseEnter={() => {
            if (!activeKey) setHoveredKey(hoveredItem.key);
          }}
          onMouseLeave={() => {
            if (!activeKey) setHoveredKey(null);
          }}
        >
          <div
            style={{
              padding: 12,
              color: "#fff",
              fontWeight: 700,
              borderBottom: "1px solid rgba(255,255,255,.1)",
            }}
          >
            {typeof hoveredItem.label === "string"
              ? hoveredItem.label
              : hoveredItem.label?.props?.children || ""}
          </div>
          {renderList(hoveredItem.children, true)}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
