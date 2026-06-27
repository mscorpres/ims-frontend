import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Empty } from "antd";
import { SearchOutlined, CloseCircleFilled } from "@ant-design/icons";
import internalLinks from "../../Pages/internalLinks";
import { filterModuleOptions } from "./moduleSearchUtils";

const PALETTE_STYLES = `
  .cmd-palette-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(20, 24, 28, 0.35);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 72px;
    opacity: 0;
    transition: opacity 180ms ease;
  }
  .cmd-palette-overlay.open {
    opacity: 1;
  }
  .cmd-palette-panel {
    width: min(620px, calc(100vw - 32px));
    background: #f8f9fa;
    border: 1px solid #d6dde3;
    border-radius: 14px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
    overflow: hidden;
    transform: translateY(-8px) scale(0.98);
    opacity: 0;
    transition: transform 180ms ease, opacity 180ms ease;
  }
  .cmd-palette-panel.open {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

export default function ModuleSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  const allModules = useMemo(() => {
    const flat = [];
    internalLinks.forEach((group, gIdx) => {
      if (!Array.isArray(group)) return;
      group.forEach((item, iIdx) => {
        if (!item.routePath) return;
        const label = item.routeName || "";
        const breadcrumb = item.placeholder || "";
        const idx = `${gIdx + 1}${iIdx + 1}`;
        flat.push({
          key: idx,
          value: item.routePath,
          label,
          breadcrumb,
          searchIndex: idx,
          searchLabel: label.toLowerCase().trim(),
          searchBreadcrumb: breadcrumb.toLowerCase().trim(),
        });
      });
    });
    return flat;
  }, []);

  const results = useMemo(
    () => filterModuleOptions(allModules, query),
    [allModules, query],
  );

  const highlight = (text, q) => {
    if (!q || !text) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark
          key={i}
          style={{
            background: "#fef08a",
            color: "inherit",
            borderRadius: 2,
            padding: "0 1px",
          }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const open = () => {
    setQuery("");
    setActiveIndex(0);
    setIsVisible(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
    setTimeout(() => setIsVisible(false), 180);
  };

  const selectItem = (item) => {
    navigate(item.value);
    close();
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
    itemRefs.current = [];
  }, [query]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeIndex, results]);

  useEffect(() => {
    const isTypingElement = (target) => {
      if (!target) return false;
      const tag = target.tagName?.toLowerCase?.() || "";
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      return Boolean(
        target.isContentEditable ||
          target.closest?.("[contenteditable='true']"),
      );
    };

    const onSlash = (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingElement(e.target)) return;
      e.preventDefault();
      if (!isVisible) open();
    };

    window.addEventListener("keydown", onSlash);
    return () => window.removeEventListener("keydown", onSlash);
  }, [isVisible]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        Math.min(prev + 1, Math.max(results.length - 1, 0)),
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) selectItem(results[activeIndex]);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <>
      <style>{PALETTE_STYLES}</style>
      <button
        type="button"
        onClick={open}
        style={{
          width: 200,
          height: 34,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          cursor: "pointer",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <SearchOutlined />
          <span style={{ opacity: 0.85 }}>Search</span>
        </span>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 20,
            height: 20,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.35)",
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          /
        </span>
      </button>

      {isVisible && (
        <div
          className={`cmd-palette-overlay ${isOpen ? "open" : ""}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={`cmd-palette-panel ${isOpen ? "open" : ""}`}>
            <div style={{ padding: "14px 16px 10px" }}>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search"
                variant="borderless"
                prefix={
                  <SearchOutlined style={{ color: "#6b7280", fontSize: 20 }} />
                }
                suffix={
                  query ? (
                    <CloseCircleFilled
                      onClick={() => setQuery("")}
                      style={{
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: 18,
                      }}
                    />
                  ) : null
                }
                style={{
                  color: "#1f2937",
                  fontSize: 28,
                  lineHeight: "36px",
                  background: "transparent",
                  padding: 0,
                }}
              />
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb" }}>
              {query.trim().length > 0 &&
                (results.length > 0 ? (
                  <div
                    style={{
                      maxHeight: 280,
                      overflowY: "auto",
                      padding: "8px 0",
                    }}
                  >
                    {results.map((item, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={`${item.value}-${item.key}`}
                          ref={(el) => {
                            itemRefs.current[idx] = el;
                          }}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => selectItem(item)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            border: "none",
                            background: isActive ? "#e8f4fd" : "transparent",
                            color: "#1f2937",
                            padding: "10px 14px",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 700,
                                  lineHeight: 1.1,
                                }}
                              >
                                {highlight(item.label, query.trim())}
                              </div>
                              {item.breadcrumb && (
                              <div
                                style={{
                                  marginTop: 4,
                                  color: "#4b5563",
                                  fontSize: 13,
                                }}
                              >
                                {highlight(item.breadcrumb, query.trim())}
                              </div>
                              )}
                              <div
                                style={{
                                  marginTop: 2,
                                  color: "#0d9488",
                                  fontSize: 13,
                                }}
                              >
                                {highlight(item.value, query.trim())}
                              </div>
                            </div>
                            <div
                              style={{
                                color: "#0d9488",
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              ID {item.searchIndex}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "30px 0" }}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span style={{ color: "#6b7280" }}>
                          No matching page found
                        </span>
                      }
                    />
                  </div>
                ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "8px 14px",
                display: "flex",
                gap: 16,
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              <span>↑ ↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
