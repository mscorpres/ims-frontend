import React, { useState, useEffect } from "react";

const TopBanner = () => {
  const [visible, setVisible] = useState(true);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const colors = [
    "#ff6b35", // Orange
    "#4ecdc4", // Teal
    "#45b7d1", // Blue
    "#96ceb4", // Mint
    "#feca57", // Yellow
  ];

  // Function to determine if text should be black based on background color
  const getTextColor = (backgroundColor) => {
    const lightColors = ["#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];
    return lightColors.includes(backgroundColor) ? "#333333" : "white";
  };

  const currentTextColor = getTextColor(colors[currentColorIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, 3000); // Change color every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        width: "100%",
        background: colors[currentColorIndex],
        color: currentTextColor,
        padding: "6px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 2000,
        fontWeight: 500,
        fontSize: "13px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        transition: "background-color 0.5s ease-in-out",
        borderBottom: "2px solid rgba(255,255,255,0.2)",
      }}
    >
      <div
        style={{
          flex: 1,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "14px" }}>🚀</span>
        <span>
          We are now completely moving to{" "}
          <a
            href="https://oakter.mscorpres.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: currentTextColor,
              textDecoration: "underline",
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "4px",
              background:
                currentTextColor === "white"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                currentTextColor === "white"
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(0,0,0,0.2)";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                currentTextColor === "white"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)";
              e.target.style.transform = "scale(1)";
            }}
          >
            oakter.mscorpres.com
          </a>{" "}
          on August 11, 2025. Please update your bookmarks! 📌
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        style={{
          background:
            currentTextColor === "white"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.1)",
          border: "none",
          color: currentTextColor,
          fontSize: "16px",
          fontWeight: "bold",
          marginLeft: 12,
          cursor: "pointer",
          lineHeight: 1,
          padding: "4px 8px",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background =
            currentTextColor === "white"
              ? "rgba(255,255,255,0.3)"
              : "rgba(0,0,0,0.2)";
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            currentTextColor === "white"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.1)";
          e.target.style.transform = "scale(1)";
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default TopBanner;
