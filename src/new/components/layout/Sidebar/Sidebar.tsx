import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../index.css";
import { loadMenuConfig } from "./menuLoader";

type AnyItem = any;

const Sidebar = ({
  showSideBar,
  setShowSideBar,
  items,
  items1,
  onWidthChange,
  useJsonConfig = false,
}: {
  showSideBar: boolean;
  setShowSideBar: (v: boolean) => void;
  items?: AnyItem[];
  items1?: AnyItem[];
  onWidthChange?: (w: number) => void;
  useJsonConfig?: boolean;
}) => {
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isSecondSidebarOpen, setIsSecondSidebarOpen] =
    useState<boolean>(false);
  const [isSecondSidebarCollapsed, setIsSecondSidebarCollapsed] =
    useState<boolean>(false);

  // Load configuration based on useJsonConfig flag
  const config = useMemo(() => {
    if (useJsonConfig) {
      return loadMenuConfig();
    }
    return {
      sidebar1: { items: items || [] },
    };
  }, [useJsonConfig, items]);

  const sidebar1Items = config.sidebar1.items;

  const handleItemHover = (key: string, hasChildren: boolean) => {
    if (hasChildren) {
      setHoveredKey(key);
    }
  };

  const handleItemClick = (
    key: string,
    hasChildren: boolean,
    path?: string
  ) => {
    if (hasChildren) {
      setActiveKey((prev) => (prev === key ? null : key));
      setIsSecondSidebarOpen(activeKey !== key);
      if (activeKey !== key) {
        setIsSecondSidebarCollapsed(false); // Reset collapse state when opening new submenu
      }
    } else if (path) {
      // Navigate to the path if it exists
      navigate(path);
    }
  };

  const isSubSidebarVisible = (key: string) => {
    return activeKey === key && isSecondSidebarOpen;
  };

  const hoveredItem = useMemo(() => {
    return sidebar1Items.find((item) => item.key === activeKey);
  }, [activeKey, sidebar1Items]);

  // Dynamic sidebar2 items based on selected item's children
  const sidebar2Items = useMemo(() => {
    if (useJsonConfig) {
      return hoveredItem?.children || [];
    }
    return items1 || [];
  }, [useJsonConfig, hoveredItem, items1]);

  const renderList = (
    arr: AnyItem[],
    alwaysShowText = false,
    isSubMenu = false
  ) => {
    const shouldShowText = isSubMenu
      ? alwaysShowText && !isSecondSidebarCollapsed
      : showSideBar;

    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {arr.map((c: AnyItem) => {
          const hasChildren = c.children && c.children.length > 0;
          const isVisible = isSubSidebarVisible(c.key);
          const isActive = activeKey === c.key;
          const isHeading = c.isHeading;

          // Render heading differently
          if (isHeading && shouldShowText) {
            return (
              <li key={c.key}>
                <div
                  style={{
                    padding: "16px 16px 8px 16px",
                    color: "#999",
                    fontSize: 11,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderTop: "1px solid #e0e0e0",
                    marginTop: 8,
                  }}
                >
                  {c.label}
                </div>
                {hasChildren && (
                  <div style={{ padding: "8px 0" }}>
                    {renderList(c.children, true, true)}
                  </div>
                )}
              </li>
            );
          }

          return (
            <li key={c.key}>
              <div
                onMouseEnter={() => handleItemHover(c.key, hasChildren)}
                onMouseLeave={() => {
                  if (!activeKey) setHoveredKey(null);
                }}
                onClick={() => handleItemClick(c.key, hasChildren, c.path)}
                style={{
                  padding: shouldShowText ? "8px 16px" : "8px 12px",
                  color: isSubMenu ? "#333" : "#666",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: shouldShowText ? 12 : 0,
                  fontSize: 14,
                  // fontWeight: isActive ? "500" : "400",
                  backgroundColor: isActive
                    ? isSubMenu
                      ? "#e8f4fd"
                      : "#f0f0f0"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #007acc"
                    : "3px solid transparent",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  justifyContent: shouldShowText ? "flex-start" : "center",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 16,
                  }}
                >
                  {c.icon}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                    opacity: shouldShowText ? 1 : 0,
                    transform: shouldShowText
                      ? "translateX(0)"
                      : "translateX(-10px)",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {typeof c.label === "string" ? (
                    <span>{c.label}</span>
                  ) : (
                    c.label
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderSectionHeader = (title: string, isSubMenu = false) => {
    const shouldShow = isSubMenu ? !isSecondSidebarCollapsed : showSideBar;

    if (!shouldShow) return null;

    return (
      <div
        style={{
          padding: "16px 16px 8px 16px",
          color: "#999",
          fontSize: 11,
          // fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          borderTop: "1px solid #e0e0e0",
          marginTop: 8,
        }}
      >
        {title}
      </div>
    );
  };

  const subSidebarOpen =
    hoveredItem && hoveredItem.children && isSecondSidebarOpen;
  const secondSidebarWidth = isSecondSidebarCollapsed ? 56 : 280;

  // Calculate root width based on different states
  let rootWidth = 56; // Default collapsed width

  if (showSideBar && subSidebarOpen) {
    // Both sidebars are open
    rootWidth = 280 + secondSidebarWidth;
  } else if (showSideBar && !subSidebarOpen) {
    // Only main sidebar is open
    rootWidth = 280;
  } else if (!showSideBar && subSidebarOpen) {
    // Only second sidebar is open
    rootWidth = 56 + secondSidebarWidth;
  } else {
    // Both collapsed
    rootWidth = 56;
  }

  React.useEffect(() => {
    if (onWidthChange) onWidthChange(rootWidth);
  }, [rootWidth]);

  const toggleSidebar = () => {
    setShowSideBar(!showSideBar);
  };

  const toggleSecondSidebar = () => {
    setIsSecondSidebarOpen(!isSecondSidebarOpen);
  };

  const toggleSecondSidebarCollapse = () => {
    setIsSecondSidebarCollapsed(!isSecondSidebarCollapsed);
  };

  const closeSecondSidebar = () => {
    setIsSecondSidebarOpen(false);
    setActiveKey(null);
    setIsSecondSidebarCollapsed(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          position: "fixed",
          top: 0,
          left: 0,
          width: rootWidth,
          height: "100vh",
          zIndex: 5,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          transition: "width 0.3s ease",
        }}
      >
        {/* Main Sidebar */}
        <div
          style={{
            height: "100%",
            width: showSideBar ? 280 : 56,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "#f8f9fa",
            overflowY: "auto",
            position: "relative",
            zIndex: 99,
            flex: "none",
            borderRight: "1px solid #e0e0e0",
            boxShadow: showSideBar ? "2px 0 8px rgba(0,0,0,0.1)" : "none",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              padding: "16px",
              color: "#333",
              // fontWeight: "700",
              fontSize: 18,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s ease",
              minHeight: "56px",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                background: "#007acc",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
                // fontWeight: "700",
              }}
            >
              I
            </div>
            <span
              style={{
                opacity: showSideBar ? 1 : 0,
                transform: showSideBar ? "translateX(0)" : "translateX(-10px)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              IMS
            </span>
          </div>

          {/* Main Menu Items */}
          <div style={{ padding: "8px 0" }}>{renderList(sidebar1Items)}</div>

          {/* Bottom Section - Only show when not using JSON config */}
          {!useJsonConfig && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
              {renderSectionHeader("Account", false)}
              {renderList(sidebar2Items)}
            </div>
          )}

          {/* Collapse/Expand Button */}
          <button
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              backgroundColor: "#007acc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "16px",
              // fontWeight: "700",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
              zIndex: 101,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#005a9e";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#007acc";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title={showSideBar ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span
              style={{
                transform: showSideBar ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "inline-block",
              }}
            >
              ‹
            </span>
          </button>
        </div>

        {/* Sub Sidebar: appears on click */}
        {subSidebarOpen && (
          <div
            style={{
              height: "100%",
              width: secondSidebarWidth,
              background: "#f6f0e3",
              overflowY: "auto",
              borderRight: "1px solid #e0e0e0",
              position: "absolute",
              top: 0,
              left: showSideBar ? 280 : 56,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 100,
              boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
              transform: "translateX(0)",
              opacity: 1,
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            {/* Sub Menu Header */}
            <div
              style={{
                padding: "16px",
                color: "#333",
                // fontWeight: "600",
                fontSize: 16,
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f6f0e3",
                minHeight: "56px",
              }}
            >
              <span
                style={{
                  opacity: !isSecondSidebarCollapsed ? 1 : 0,
                  transform: !isSecondSidebarCollapsed
                    ? "translateX(0)"
                    : "translateX(-10px)",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {typeof hoveredItem?.label === "string"
                  ? hoveredItem.label.toUpperCase()
                  : hoveredItem?.label?.props?.children || ""}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={toggleSecondSidebarCollapse}
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#666",
                    padding: "4px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s ease",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e0e0e0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={
                    isSecondSidebarCollapsed
                      ? "Expand submenu"
                      : "Collapse submenu"
                  }
                >
                  <span
                    style={{
                      transform: isSecondSidebarCollapsed
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "inline-block",
                    }}
                  >
                    ‹
                  </span>
                </button>
                <button
                  onClick={closeSecondSidebar}
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    fontSize: 18,
                    color: "#666",
                    padding: "4px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s ease",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e0e0e0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Sub Menu Items */}
            {!isSecondSidebarCollapsed && (
              <div style={{ padding: "8px 0" }}>
                {renderList(hoveredItem.children, true, true)}
              </div>
            )}

            {/* Collapsed Sub Menu Items - Show only icons */}
            {isSecondSidebarCollapsed && (
              <div style={{ padding: "8px 0" }}>
                {renderList(hoveredItem.children, false, true)}
              </div>
            )}

            {/* Collapse/Expand Button for Second Sidebar - Bottom Right */}
            <button
              onClick={toggleSecondSidebarCollapse}
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                backgroundColor: "#007acc",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "16px",
                // fontWeight: "700",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                zIndex: 101,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#005a9e";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#007acc";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={
                isSecondSidebarCollapsed ? "Expand submenu" : "Collapse submenu"
              }
            >
              <span
                style={{
                  transform: isSecondSidebarCollapsed
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  display: "inline-block",
                }}
              >
                ‹
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
