import React, { useState, useEffect } from "react";
import {
  Modal,
  Timeline,
  Card,
  Tag,
  Typography,
  Space,
  Divider,
  Empty,
  Skeleton,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import useLoading from "../../../hooks/useLoading";
import { v4 } from "uuid";

const { Text, Title } = Typography;

const ViewPOLogs = ({ poId, setPoId }) => {
  const [loading, setLoading] = useLoading();
  const [poLogsData, setPoLogsData] = useState([]);

  const getStatusConfig = (status) => {
    const statusUpper = (status || "").toUpperCase().trim();

    if (statusUpper === "CREATED") {
      return {
        color: "blue",
        icon: <FileTextOutlined />,
        bgColor: "#e6f7ff",
        borderColor: "#1890ff",
      };
    } else if (
      statusUpper === "FULLY REJECTED" ||
      statusUpper.includes("REJECTED")
    ) {
      return {
        color: "red",
        icon: <CloseCircleOutlined />,
        bgColor: "#fff1f0",
        borderColor: "#ff4d4f",
      };
    } else if (statusUpper === "APPROVED" || statusUpper.includes("APPROVED")) {
      return {
        color: "green",
        icon: <CheckCircleOutlined />,
        bgColor: "#f6ffed",
        borderColor: "#52c41a",
      };
    } else if (statusUpper === "PENDING") {
      return {
        color: "orange",
        icon: <ClockCircleOutlined />,
        bgColor: "#fff7e6",
        borderColor: "#faad14",
      };
    }
    return {
      color: "default",
      icon: <ClockCircleOutlined />,
      bgColor: "#fafafa",
      borderColor: "#d9d9d9",
    };
  };

  const fetchPoLogs = async () => {
    if (!poId) return;

    setLoading("fetch", true);
    try {
      const response = await imsAxios.post("/purchaseOthers/pologs", {
        po_id: poId,
      });

      if (response?.data) {
        const { data } = response;
        if (data.code === "200" || data.code == 200) {
          let arr = (data.data || []).map((row, index) => ({
            ...row,
            id: v4(),
            index: index + 1,
          }));
          // Reverse to show latest first
          setPoLogsData(arr.reverse());
        } else {
          toast.error(data.message?.msg || "Failed to fetch PO logs");
          setPoLogsData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching PO logs:", error);
      toast.error(error?.message || "Error fetching PO logs");
      setPoLogsData([]);
    } finally {
      setLoading("fetch", false);
    }
  };

  useEffect(() => {
    if (poId) {
      fetchPoLogs();
    } else {
      setPoLogsData([]);
    }
  }, [poId]);

  const handleClose = () => {
    setPoId(null);
    setPoLogsData([]);
  };

  const timelineItems = poLogsData.map((log, index) => {
    const statusConfig = getStatusConfig(log.po_log_status);

    return {
      color: statusConfig.color,
      dot: statusConfig.icon,
      children: (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            backgroundColor: statusConfig.bgColor,
            border: `1px solid ${statusConfig.borderColor}`,
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Tag
                color={statusConfig.color}
                style={{
                  fontSize: "13px",
                  padding: "4px 12px",
                  fontWeight: 600,
                  borderRadius: "12px",
                }}
              >
                {log.po_log_status || "N/A"}
              </Tag>
              {log.min_no && log.min_no !== "--" && (
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  MIN: {log.min_no}
                </Text>
              )}
            </div>

            {log.po_log_remark && log.po_log_remark.trim() !== "" && (
              <>
                <Divider style={{ margin: "8px 0" }} />
                <div
                  style={{
                    backgroundColor: "#fff",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <Text strong style={{ fontSize: "12px", color: "#595959" }}>
                    Remark:
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text style={{ fontSize: "13px", color: "#262626" }}>
                      {log.po_log_remark}
                    </Text>
                  </div>
                </div>
              </>
            )}

            <Divider style={{ margin: "8px 0" }} />

            <Space size="middle" wrap>
              <Space size="small">
                <UserOutlined style={{ color: "#8c8c8c" }} />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {log.user_name || "--"}
                </Text>
              </Space>
              <Space size="small">
                <CalendarOutlined style={{ color: "#8c8c8c" }} />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {log.date || "--"} {log.time ? `at ${log.time}` : ""}
                </Text>
              </Space>
            </Space>
          </Space>
        </Card>
      ),
    };
  });

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileTextOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            PO Logs:{" "}
            <Text copyable style={{ fontWeight: 600 }}>
              {poId || ""}
            </Text>
          </Title>
        </div>
      }
      open={!!poId}
      onCancel={handleClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{
        maxHeight: "75vh",
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <Skeleton active loading={loading("fetch")} paragraph={{ rows: 5 }}>
        {poLogsData.length === 0 && !loading("fetch") ? (
          <Empty
            description="No logs found for this Purchase Order"
            style={{ margin: "40px 0" }}
          />
        ) : (
          <Timeline
            mode="left"
            items={timelineItems}
            style={{ marginTop: "20px" }}
          />
        )}
      </Skeleton>
    </Modal>
  );
};

export default ViewPOLogs;
