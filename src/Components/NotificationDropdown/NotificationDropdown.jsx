import React, { useEffect, useState } from "react";
import { List, Empty, Progress, Typography } from "antd";
import { ConfigProvider } from "antd";
import { Link } from "react-router-dom";
import { CommonIcons } from "../TableActions.jsx/TableActions";
import { socketLink as axiosLink } from "../../axiosInterceptor";
import { ReloadOutlined } from "@ant-design/icons";

const NotificationDropdown = ({
  open,
  onClose,
  notifications,
  deleteNotification,
  anchorRef,
}) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && anchorRef?.current) {
      const updatePosition = () => {
        const rect = anchorRef.current.getBoundingClientRect();
        const dropdownWidth = 420;
        const viewportWidth = window.innerWidth;
        const rightEdge = viewportWidth - rect.right;

        // Calculate position
        let right = rightEdge;

        // If dropdown would go off-screen, adjust it
        if (right + dropdownWidth > viewportWidth - 12) {
          right = viewportWidth - dropdownWidth - 12;
        }

        // Ensure minimum margin from right edge
        right = Math.max(12, right);

        // Position dropdown below the button
        setPosition({
          top: rect.bottom + 8,
          right: right,
        });
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target) &&
        !event.target.closest(".notification-dropdown")
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  const EmptyList = () => (
    <div
      style={{
        maxHeight: "calc(100vh - 460px)",
        minHeight: "calc(100vh - 460px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{
          height: 80,
        }}
        description={<span>No Notifications</span>}
      />
    </div>
  );

  return (
    <>
      {/* Arrow indicator - positioned relative to button */}
      {anchorRef?.current && (
        <div
          style={{
            position: "fixed",
            top: `${position.top - 6}px`,
            right: anchorRef.current
              ? `${
                  window.innerWidth -
                  anchorRef.current.getBoundingClientRect().right -
                  -6
                }px`
              : `${position.right + 20}px`,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid #f5f5f5",
            zIndex: 10001,
            filter: "drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1))",
          }}
        />
      )}
      <div
        className="notification-dropdown"
        style={{
          position: "fixed",
          top: `${position.top}px`,
          right: `${position.right}px`,
          width: "420px",
          maxHeight: "calc(100vh - 100px)",
          backgroundColor: "#f5f5f5",
          borderRadius: "2px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          zIndex: 10000,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          marginTop: 2,
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            // borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              margin: 0,
              color: "#000",
            }}
          >
            Notifications
            {notifications.length > 0 && (
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "14px",
                  fontWeight: "normal",
                  color: "#fff",
                }}
              >
                ({notifications.length})
              </span>
            )}
          </Typography.Text>
        </div>
        <div
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 360px)",
            minHeight: "calc(100vh - 360px)",
            backgroundColor: "#fff",
            margin: "0px  12px",
          }}
        >
          <ConfigProvider renderEmpty={EmptyList}>
            <List
              bordered={false}
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  actions={[
                    <span key="action">
                      {item.type == "file" &&
                        (item.loading ||
                        (item.status == "pending" && item.total) ? (
                          <Progress
                            width={32}
                            type="circle"
                            percent={item.total}
                          />
                        ) : (
                          <a
                            href={
                              axiosLink.split(":")[1] +
                              "/" +
                              item.file?.substring(2)
                            }
                            download
                          >
                            <CommonIcons
                              loading={item.loading || item.status == "pending"}
                              action="downloadButton"
                              size="small"
                            />
                          </a>
                        ))}
                      {item.type == "msg" && (
                        <span>{JSON.parse(item?.other_data)?.message}</span>
                      )}
                    </span>,
                  ]}
                >
                  {item.type == "message" ? (
                    <Link
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        display: "flex",
                      }}
                      to="/messenger"
                      onClick={onClose}
                    >
                      {!item.loading && (
                        <Typography.Text
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            fontWeight: "500",
                          }}
                        >
                          From: {item.title}
                        </Typography.Text>
                      )}
                      {!item.loading && (
                        <Typography.Text
                          style={{
                            margin: 0,
                            fontSize: "0.7rem",
                            marginTop: "4px",
                          }}
                        >
                          {item.message}
                        </Typography.Text>
                      )}
                    </Link>
                  ) : (
                    <div
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        display: "flex",
                      }}
                    >
                      <Typography.Text
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          fontWeight: "500",
                        }}
                      >
                        {item.title}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          margin: 0,
                          fontSize: "0.7rem",
                          marginTop: "4px",
                        }}
                      >
                        {item.details}
                      </Typography.Text>
                    </div>
                  )}
                </List.Item>
              )}
            />
          </ConfigProvider>
        </div>
        <div
          className="flex justify-end items-center"
          style={{ padding: "4px 12px", gap: 4, cursor: "pointer" }}
        >
          <ReloadOutlined
            style={{ color: "#000", fontWeight: "600px", fontSize: "14px" }}
          />
          <Typography
            style={{ color: "#000", fontWeight: "600", fontSize: "14px" }}
          >
            Reload
          </Typography>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
