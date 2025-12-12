import React, { useState, useEffect, useRef } from "react";
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const BANNER_STORAGE_KEY = "topBannerClosedAt";
const HIDE_DURATION = 60 * 60 * 1000;

const BannerButton = ({ onClick, children, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{
        background: isHovered || isActive ? "#bde649" : "transparent",
        border: "none",
        color: "#555",
        cursor: "pointer",
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        borderRadius: "3px",
        transition: "background 0.2s ease",
        outline: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const TopBanner = ({
  messages = ["MY message here...."],
  onVisibilityChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerRef = React.useRef(null);

  useEffect(() => {
    const closedAt = localStorage.getItem(BANNER_STORAGE_KEY);

    if (!closedAt) {
      // Never closed before, show banner
      setVisible(true);
    } else {
      const closedTime = parseInt(closedAt, 10);
      const now = Date.now();
      const timePassed = now - closedTime;

      if (timePassed >= HIDE_DURATION) {
        // 1 hour has passed, show banner again
        setVisible(true);
        localStorage.removeItem(BANNER_STORAGE_KEY);
      } else {
        // Still within 1 hour, keep hidden
        setVisible(false);

        // Set timeout to show banner after remaining time
        const remainingTime = HIDE_DURATION - timePassed;
        const timer = setTimeout(() => {
          setVisible(true);
          localStorage.removeItem(BANNER_STORAGE_KEY);
        }, remainingTime);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(visible);
    }
  }, [visible, onVisibilityChange]);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : messages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < messages.length - 1 ? prev + 1 : 0));
  };

  if (!visible || messages.length === 0) return null;

  return (
    <div
      ref={bannerRef}
      style={{
        width: "100%",
        background: "#d2f571",
        color: "#12120E",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        fontWeight: 400,
        fontSize: "13px",
        borderBottom: "1px solid #b8d95f",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: 1,
        }}
      >
        <InfoCircleOutlined style={{ color: "#203624", fontSize: "14px" }} />
        <span style={{ color: "#203624", fontWeight: 600 }}>Information</span>
        <span style={{ color: "#4a5a3a", margin: "0 4px" }}>|</span>
        <span style={{ color: "#12120E" }}>{messages[currentIndex]}</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <BannerButton onClick={handlePrev}>
          <LeftOutlined style={{ fontSize: "10px" }} />
        </BannerButton>
        <span style={{ color: "#555", fontSize: "12px", padding: "0 4px" }}>
          {currentIndex + 1}/{messages.length}
        </span>
        <BannerButton onClick={handleNext}>
          <RightOutlined style={{ fontSize: "10px" }} />
        </BannerButton>
        <BannerButton onClick={handleClose} style={{ marginLeft: "4px" }}>
          <CloseOutlined style={{ fontSize: "12px" }} />
        </BannerButton>
      </div>
    </div>
  );
};

export default TopBanner;
