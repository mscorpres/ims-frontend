import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { loadMenuConfig } from "../utils/moduleSearchUtils";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { PushPin } from "@mui/icons-material";


/** Chevron graphic for nested sub-menu rows (Component and deeper); parents use menu icons larger. */
const MENU_CHILD_CHEVRON_SRC = `${import.meta.env.BASE_URL}assets/images/menu-child-chevron.svg`;
const SUB_MENU_PARENT_LEAD_SIZE = 18;
const SUB_MENU_CHILD_CHEVRON_SIZE = 14;
const SUB_MENU_DEEP_CHEVRON_SIZE = 12;

const SUB_MENU_TREE_STEP = 16;

const SIDEBAR_INJECTED_STYLES = `
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
          .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .hide-scrollbar::-webkit-scrollbar { width: 0; height: 0; }
          .sub-sidebar-scroll { overflow-y: auto; }
          .sub-sidebar-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
          @media (max-width: 768px) {
            .sub-sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
            .sub-sidebar-scroll::-webkit-scrollbar { width: 0; height: 0; }
          }
          .sub-menu-tree-prefix {
            display: inline-flex;
            flex-shrink: 0;
            align-self: stretch;
          }
          .sub-menu-tree-guide-continue,
          .sub-menu-tree-guide-empty,
          .sub-menu-tree-branch {
            width: ${SUB_MENU_TREE_STEP}px;
            position: relative;
            flex-shrink: 0;
            align-self: stretch;
          }
          .sub-menu-tree-guide-continue::before {
            content: "";
            position: absolute;
            left: 8px;
            top: 0;
            bottom: 0;
            border-left: 1px solid #bdbdbd;
          }
          .sub-menu-tree-branch.is-mid::before {
            content: "";
            position: absolute;
            left: 8px;
            top: 0;
            bottom: 0;
            border-left: 1px solid #bdbdbd;
          }
          .sub-menu-tree-branch.is-mid::after,
          .sub-menu-tree-branch.is-last::after {
            content: "";
            position: absolute;
            left: 8px;
            top: 50%;
            width: 10px;
            border-top: 1px solid #bdbdbd;
          }
          .sub-menu-tree-branch.is-last::before {
            content: "";
            position: absolute;
            left: 8px;
            top: 0;
            height: 50%;
            border-left: 1px solid #bdbdbd;
          }
          .sub-menu-tree-row {
            display: flex;
            align-items: stretch;
            min-height: 36px;
          }
          .sub-menu-tree-row-content {
            flex: 1;
            min-width: 0;
          }
        `;

function findActiveMenuItem(items, currentPath, parentKey = null, headingKeys = []) {
  for (const item of items) {
    if (item.path && currentPath === item.path) {
      return { item, parentKey, headingKeys };
    }

    if (item.children) {
      const nextHeadingKeys = item.isHeading
        ? [...headingKeys, item.key]
        : headingKeys;

      const currentParentKey =
        !item.isHeading && item.children ? item.key : parentKey;

      const result = findActiveMenuItem(
        item.children,
        currentPath,
        currentParentKey || item.key,
        nextHeadingKeys,
      );

      if (result) {
        return result;
      }
    }
  }
  return null;
}

function filterItemsByIsShown(items) {
  return items
    .map((item) => {
      if (item.isShown === false) {
        return null;
      }

      const filteredItem = { ...item };

      if (item.children && item.children.length > 0) {
        const filteredChildren = filterItemsByIsShown(item.children);

        if (filteredChildren.length === 0 && item.isShown !== true) {
          return null;
        }
        filteredItem.children = filteredChildren;
      }

      return filteredItem;
    })
    .filter((item) => item !== null);
}

const SidebarInner = ({
  showSideBar,
  setShowSideBar,
  items,
  items1,
  onWidthChange,
  useJsonConfig = false,
  topOffset = 45,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState(null);
  const [isSecondSidebarOpen, setIsSecondSidebarOpen] = useState(false);
  const [isSecondSidebarCollapsed, setIsSecondSidebarCollapsed] =
    useState(false);
  const [expandedHeadings, setExpandedHeadings] = useState([]);
  const [isSecondSidebarPin, setIsSecondSidebarPin] = useState(false);
  const [isFirstSidebarPin, setIsFirstSidebarPin] = useState(false);

  const config = useMemo(() => {
    if (useJsonConfig) {
      return loadMenuConfig();
    }
    return {
      sidebar1: { items: items || [] },
    };
  }, [useJsonConfig, items]);

  const sidebar1Items = config.sidebar1.items;
  const sidebar2ItemsFromConfig = config.sidebar2?.items || [];

  const filteredSidebar1Items = useMemo(
    () => filterItemsByIsShown(sidebar1Items),
    [sidebar1Items],
  );

  const filteredSidebar2FromConfig = useMemo(
    () => filterItemsByIsShown(sidebar2ItemsFromConfig),
    [sidebar2ItemsFromConfig],
  );

  const filteredItems1 = useMemo(
    () => filterItemsByIsShown(items1 || []),
    [items1],
  );

  useEffect(() => {
    const activeMenuItem = findActiveMenuItem(
      filteredSidebar1Items,
      location.pathname,
    );

    if (activeMenuItem) {
      if (activeMenuItem.parentKey) {
        setActiveKey(activeMenuItem.parentKey);

        setIsSecondSidebarOpen(true);
        if (!isSecondSidebarPin) {
          setIsSecondSidebarCollapsed(true);
        }

        setExpandedHeadings(activeMenuItem.headingKeys || []);
      } else if (!isSecondSidebarPin) {
        setActiveKey(null);
        setIsSecondSidebarOpen(false);
      }
    } else if (!isSecondSidebarPin) {
      setActiveKey(null);
      setIsSecondSidebarOpen(false);
      setExpandedHeadings([]);
    }
  }, [location.pathname, filteredSidebar1Items, isSecondSidebarPin]);

  useEffect(() => {
    if (showSideBar && activeKey) {
      setIsSecondSidebarOpen(true);
      if (!isSecondSidebarPin) {
        setIsSecondSidebarCollapsed(true);
      }
    }
  }, [showSideBar, activeKey, isSecondSidebarPin]);

  const handleItemClick = useCallback(
    (key, hasChildren, path, isInSubMenu = false) => {
    if (isInSubMenu) {
      if (!isSecondSidebarOpen) setIsSecondSidebarOpen(true);
      if (isSecondSidebarCollapsed) setIsSecondSidebarCollapsed(false);
    }
    if (hasChildren) {
      if (isInSubMenu) {
        setExpandedHeadings((prev) =>
          prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );

        setIsSecondSidebarOpen(true);
        setIsSecondSidebarCollapsed(false);
      } else {
        if (activeKey === key) {
          if (isSecondSidebarPin) {
            return;
          }
          if (isSecondSidebarOpen) {
            setIsSecondSidebarCollapsed(!isSecondSidebarCollapsed);
          } else {
            setIsSecondSidebarOpen(true);
            setIsSecondSidebarCollapsed(false);
          }
        } else {
          setActiveKey(key);
          setIsSecondSidebarOpen(true);
          setIsSecondSidebarCollapsed(false);
        }
      }
    } else if (path) {
      navigate(path);

      if (!isFirstSidebarPin) {
        setShowSideBar(false);
      }
      if (!isSecondSidebarPin) {
        setIsSecondSidebarCollapsed(true);
      }

      if (!isInSubMenu && !isSecondSidebarPin) {
        setActiveKey(null);
        setIsSecondSidebarOpen(false);
      }
    } else {
      if (!isInSubMenu && !isSecondSidebarPin) {
        setActiveKey(null);
        setIsSecondSidebarOpen(false);
      }
    }
  },
    [
      activeKey,
      isSecondSidebarOpen,
      isSecondSidebarCollapsed,
      isSecondSidebarPin,
      isFirstSidebarPin,
      navigate,
      setShowSideBar,
    ],
  );

  const hoveredItem = useMemo(() => {
    return filteredSidebar1Items.find((item) => item.key === activeKey);
  }, [activeKey, filteredSidebar1Items]);

  const bottomBarItems = useJsonConfig
    ? filteredSidebar2FromConfig
    : filteredItems1;

  /** Each nested menu level steps down one tier (Master → Component → links → deeper). */
  const menuTierFontSize = (nestLevel) => {
    if (nestLevel <= 0) return 14;
    if (nestLevel === 1) return 12;
    if (nestLevel === 2) return 11;
    return 10;
  };

  const subMenuChevronImg = (px) => (
    <img
      src={MENU_CHILD_CHEVRON_SRC}
      alt=""
      width={px}
      height={px}
      style={{
        display: "block",
        width: px,
        height: px,
        objectFit: "contain",
        flexShrink: 0,
      }}
      draggable={false}
    />
  );

  const renderSubMenuTreePrefix = (ancestorHasMore, isLast) => (
    <span className="sub-menu-tree-prefix" aria-hidden="true">
      {ancestorHasMore.map((continues, index) => (
        <span
          key={`tree-guide-${index}`}
          className={
            continues
              ? "sub-menu-tree-guide-continue"
              : "sub-menu-tree-guide-empty"
          }
        />
      ))}
      <span
        className={`sub-menu-tree-branch ${isLast ? "is-last" : "is-mid"}`}
      />
    </span>
  );

  const renderList = (
    arr,
    alwaysShowText = false,
    isSubMenu = false,
    nestLevel = 0,
    ancestorHasMore = [],
  ) => {
    const shouldShowText = isSubMenu
      ? alwaysShowText && !isSecondSidebarCollapsed
      : showSideBar;

    const headingFontSize = menuTierFontSize(nestLevel);
    /** Leaf rows use the size of their depth under the parent heading (same tier index as sibling headings). */
    const leafFontSize = menuTierFontSize(nestLevel);
    const headingPlayArrowSize =
      isSubMenu && nestLevel === 0 ? 18 : isSubMenu ? 16 : 20;
    /** Link rows always use menu icons; the image chevron is only for accordion headings (see isHeading branch). */
    const leafIconBoxSize = !isSubMenu
      ? 18
      : nestLevel <= 1
        ? 18
        : nestLevel === 2
          ? 16
          : 14;

    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {arr.map((c, index) => {
          const hasChildren = c.children && c.children.length > 0;
          const isActive = activeKey === c.key;

          const isPathActive = c.path && location.pathname === c.path;
          const isHeading = c.isHeading;
          const isHeadingExpanded = expandedHeadings.includes(c.key);
          const isLast = index === arr.length - 1;
          const showSubMenuTree = isSubMenu && shouldShowText;
          const continuesBelow =
            hasChildren &&
            (isHeading ? isHeadingExpanded : false);
          const branchIsLast = isLast && !continuesBelow;
          const childAncestorHasMore = [
            ...ancestorHasMore,
            !isLast || continuesBelow,
          ];

          const reactKey = `${c.key}-${isSubMenu ? "sub" : "main"}-${index}`;

          if (isHeading && shouldShowText) {
            return (
              <li key={reactKey}>
                <div className={showSubMenuTree ? "sub-menu-tree-row" : undefined}>
                  {showSubMenuTree &&
                    renderSubMenuTreePrefix(ancestorHasMore, branchIsLast)}
                  <div
                    className={
                      showSubMenuTree ? "sub-menu-tree-row-content" : undefined
                    }
                    onClick={() =>
                      handleItemClick(c.key, hasChildren, undefined, isSubMenu)
                    }
                    style={{
                      padding: showSubMenuTree
                        ? "10px 12px 10px 4px"
                        : "16px 16px 8px 16px",
                      color: "#474545",
                      fontSize: headingFontSize,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderTop: showSubMenuTree
                        ? "none"
                        : "1px solid #e0e0e0",
                      marginTop: showSubMenuTree ? 0 : 8,
                      cursor: hasChildren ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (hasChildren) {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (hasChildren) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                  {isSubMenu ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {nestLevel === 0 ? (
                        <span
                          style={{
                            width: SUB_MENU_PARENT_LEAD_SIZE,
                            height: SUB_MENU_PARENT_LEAD_SIZE,
                            display: "inline-flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: SUB_MENU_PARENT_LEAD_SIZE,
                            flexShrink: 0,
                          }}
                        >
                          {c.icon}
                        </span>
                      ) : (
                        subMenuChevronImg(
                          nestLevel === 1
                            ? SUB_MENU_CHILD_CHEVRON_SIZE
                            : SUB_MENU_DEEP_CHEVRON_SIZE,
                        )
                      )}
                      <span style={{ lineHeight: 1.3 }}>{c.label}</span>
                    </span>
                  ) : (
                    <span>{c.label}</span>
                  )}
                  {hasChildren && (
                    <PlayArrowIcon
                      style={{
                        fontSize: headingPlayArrowSize,
                        width: headingPlayArrowSize,
                        height: headingPlayArrowSize,
                        flexShrink: 0,
                        transform: isHeadingExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  )}
                  </div>
                </div>
                {hasChildren && isHeadingExpanded && (
                  <div style={{ padding: 0 }}>
                    {renderList(
                      c.children,
                      alwaysShowText,
                      isSubMenu,
                      nestLevel + 1,
                      childAncestorHasMore,
                    )}
                  </div>
                )}
              </li>
            );
          }

          return (
            <li key={reactKey}>
              <div
                className={showSubMenuTree ? "sub-menu-tree-row" : undefined}
              >
                {showSubMenuTree &&
                  renderSubMenuTreePrefix(ancestorHasMore, branchIsLast)}
                <div
                  className={
                    showSubMenuTree ? "sub-menu-tree-row-content" : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!isActive && !isPathActive) {
                      e.currentTarget.style.backgroundColor = isSubMenu
                        ? "#e8f4fd"
                        : "#d4edda";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isPathActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  onClick={() =>
                    handleItemClick(c.key, hasChildren, c.path, isSubMenu)
                  }
                  title={
                    !shouldShowText
                      ? typeof c.label === "string"
                        ? c.label
                        : "Menu Item"
                      : undefined
                  }
                  style={{
                    padding: showSubMenuTree
                      ? "8px 12px 8px 4px"
                      : shouldShowText
                        ? "8px 16px"
                        : "8px 12px",
                    color: isSubMenu ? "#333" : "#666",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: shouldShowText ? 12 : 0,
                    fontSize: leafFontSize,
                    fontWeight: "600",
                    backgroundColor:
                      isActive || isPathActive
                        ? isSubMenu
                          ? "#e8f4fd"
                          : "#f0f0f0"
                        : "transparent",
                    borderLeft:
                      isActive || isPathActive
                        ? "3px solid #0d9489"
                        : "3px solid transparent",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    justifyContent: shouldShowText ? "flex-start" : "center",
                  }}
                >
                <span
                  style={{
                    width: leafIconBoxSize,
                    height: leafIconBoxSize,
                    minWidth: leafIconBoxSize,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: leafIconBoxSize,
                    flexShrink: 0,
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
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const subSidebarOpen = useMemo(
    () =>
      Boolean(
        hoveredItem &&
          hoveredItem.children != null &&
          isSecondSidebarOpen,
      ),
    [hoveredItem, isSecondSidebarOpen],
  );
  const secondSidebarWidth = isSecondSidebarCollapsed ? 56 : 280;

  const rootWidth = useMemo(() => {
    if (showSideBar && subSidebarOpen) {
      return 280 + secondSidebarWidth;
    }
    if (showSideBar && !subSidebarOpen) {
      return 280;
    }
    if (!showSideBar && subSidebarOpen) {
      return 56 + secondSidebarWidth;
    }
    return 56;
  }, [showSideBar, subSidebarOpen, secondSidebarWidth]);

  useEffect(() => {
    onWidthChange?.(rootWidth);
  }, [rootWidth, onWidthChange]);

  const toggleSidebar = useCallback(() => {
    setShowSideBar((open) => !open);
   setIsFirstSidebarPin(false);
  }, [setShowSideBar]);

  const toggleSecondSidebarCollapse = useCallback(() => {
    setIsSecondSidebarCollapsed((c) => !c);
    setIsSecondSidebarPin(false);
  }, []);

  const pinSecondSidebar = useCallback(() => {
    setIsSecondSidebarPin((p) => !p);
  }, []);

  const pinFirstSidebar = useCallback(() => {
    setIsFirstSidebarPin((wasPinned) => {
      if (wasPinned) {
        setShowSideBar(false);
        return false;
      }
      return true;
    });
  }, [setShowSideBar]);



  return (
    <>
      <style>{SIDEBAR_INJECTED_STYLES}</style>
      <div
        className="flex fixed left-0 z-[5] transition-[width] duration-300 ease-in-out"
        style={{
          top: topOffset,
          left: 0,
          width: rootWidth,
          height: `calc(100vh - ${topOffset}px)`,
        }}
      >
        {/* Main Sidebar */}
        <div
          className={`h-full 
          ${
            showSideBar
              ? "w-[280px] shadow-[2px_0_8px_rgba(0,0,0,0.1)]"
              : "w-[56px] shadow-none"
          } 
          transition-all duration-300 ease-in-out 
          bg-[#f8f9fa] 
          overflow-y-auto 
          relative 
          z-[99] 
          flex-none 
          border-r border-[#e0e0e0]`}
        >
          {/* Logo/Brand */}
          <div
            style={{
              color: "#333",
              fontSize: 18,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 56,
              overflow: "hidden",
            }}
          >
            <img
              src={
                showSideBar
                  ? "/assets/images/ms.png"
                  : "/assets/images/mscorpres_auto_logo.png"
              }
              alt="IMS Logo"
              style={{
                width: showSideBar ? 220 : 32,
                height: 40,
                objectFit: "contain",
                aspectRatio: "5 / 1",
              }}
            />
          </div>

          {/* Main Menu Items */}
          <div style={{ padding: "8px 0" }}>
            {renderList(filteredSidebar1Items)}
          </div>

          {/* Bottom Section - Show sidebar2 items from config or items1 */}
          {bottomBarItems.length > 0 && (
            <div
              style={{ position: "absolute", bottom: 60, left: 0, right: 0 }}
            >
              {renderList(bottomBarItems)}
            </div>
          )}

       {
        showSideBar && (
             <button
            type="button"
            onClick={() => {
              if (!showSideBar) {
                setShowSideBar(true);
              } else {
                pinFirstSidebar();
              }
            }}
            style={{
              position: "absolute",
              bottom: "16px",
              left: "12px",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 0.2s ease",
              zIndex: 101,
              ...(showSideBar
                ? {
                    background: isFirstSidebarPin ? "orange" : "none",
                    border: "none",
                    color: isFirstSidebarPin ? "white" : "#666",
                    boxShadow: "none",
                  }
                : {
                    backgroundColor: "#0d9488",
                    border: "none",
                    color: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              if (!showSideBar) {
                e.currentTarget.style.backgroundColor = "#0f766e";
              } else {
                e.currentTarget.style.backgroundColor = "#e0e0e0";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              if (!showSideBar) {
                e.currentTarget.style.backgroundColor = "#0d9488";
              } else {
                e.currentTarget.style.backgroundColor = isFirstSidebarPin
                  ? "orange"
                  : "transparent";
              }
            }}
            title={
              !showSideBar
                ? "Expand sidebar"
                : isFirstSidebarPin
                  ? "Unpin main sidebar (allow auto-collapse on navigate)"
                  : "Pin main sidebar (stay expanded on navigate)"
            }
          >
          
         
              <PushPin fontSize="small" />
           
          </button>
        )
       }
          <button
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              bottom: "16px",
              right: "12px",
              width: "32px",
              height: "32px",
              backgroundColor: "#0d9488",
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
              e.currentTarget.style.backgroundColor = "#0f766e";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0f766e";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title={showSideBar ? "Collapse sidebar" : "Expand sidebar"}
          >
            <KeyboardArrowLeftIcon
              fontSize="small"
              style={{
                transform: showSideBar ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "inline-block",
              }}
            />
          </button>
        </div>

        {/* Sub Sidebar: appears on click */}
        {subSidebarOpen && (
          <div
            className={isSecondSidebarCollapsed ? "hide-scrollbar" : undefined}
            style={{
              height: "100%",
              width: secondSidebarWidth,
              background: "#fff5e0",
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
                fontSize: 14,
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#fff5e0",
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
                  fontWeight: "bold",
                }}
              >
                {typeof hoveredItem?.label === "string"
                  ? hoveredItem.label.toUpperCase()
                  : hoveredItem?.label?.props?.children || ""}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={()=> {
                    if (isSecondSidebarCollapsed) {
                     toggleSecondSidebarCollapse();
                    } else {
                      pinSecondSidebar();
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    background: isSecondSidebarPin ? "orange" : "none",
                    border: "none",
                    fontSize: 14,
                    color: isSecondSidebarPin ? "#fff" : "#666",
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
                    e.currentTarget.style.backgroundColor = isSecondSidebarPin
                      ? "orange"
                      : "transparent";
                  }}
                  title={
                    isSecondSidebarCollapsed
                      ? "Expand submenu"
                      : isSecondSidebarPin
                        ? "Unpin submenu (allow auto-close)"
                        : "Pin submenu (keep open while navigating)"
                  }
                >
                  {!isSecondSidebarCollapsed ? (
                    <PushPin fontSize="small" />
                  ) : (
                    <KeyboardArrowRightIcon fontSize="small" />
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div
              className={`sub-sidebar-scroll ${
                isSecondSidebarCollapsed ? "hide-scrollbar" : ""
              }`}
              style={{
                height: "calc(100% - 120px)",
                padding: "8px 8px 64px 8px",
                overflowY: isSecondSidebarCollapsed ? "hidden" : "auto",
              }}
            >
              {!isSecondSidebarCollapsed ? (
                <div style={{ padding: "8px 0" }}>
                  {renderList(hoveredItem.children, true, true, 0)}
                </div>
              ) : (
                <div style={{ padding: "8px 0" }}>
                  {renderList(hoveredItem.children, false, true, 0)}
                </div>
              )}
            </div>

            <button
              onClick={toggleSecondSidebarCollapse}
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                backgroundColor: "#0d9488",
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
                e.currentTarget.style.backgroundColor = "#0f766e";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0f766e";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={
                isSecondSidebarCollapsed ? "Expand submenu" : "Collapse submenu"
              }
            
            >
              <KeyboardArrowLeftIcon
                fontSize="small"
                style={{
                  transform: isSecondSidebarCollapsed
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  display: "inline-block",
                }}
              />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const Sidebar = memo(SidebarInner);
export default Sidebar;
