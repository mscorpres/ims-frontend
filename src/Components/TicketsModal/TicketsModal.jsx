import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Row,
  Typography,
  Input,
  Select,
  Upload,
  Space,
  Divider,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  UnorderedListOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";

const { TextArea } = Input;
const axiosLink = "https://support.mscorpres.com";

export default function TicketsModal({ open, handleClose }) {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeMenu, setActiveMenu] = useState("create"); // 'create' or 'fetch'
  const { user } = useSelector((state) => state.login);

  // Masters data from API
  const [topicOptions, setTopicOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  // Create ticket form state
  const [formData, setFormData] = useState({
    topic: null,
    subject: "",
    concern: "",
    priority: null,
    language: null,
    attachment: null,
  });
  const [fileList, setFileList] = useState([]);

  // Fetch masters (topics, priority, language)
  const fetchMasters = async () => {
    try {
      const response = await imsAxios.get("/ticket/masters");
      if (response?.success && response?.data) {
        const { topics, priorities, languages } = response.data;

        // Map topics - { value, text }
        if (topics && Array.isArray(topics)) {
          setTopicOptions(
            topics.map((t) => ({
              label: t.text,
              value: t.value,
            }))
          );
        }

        // Map priorities - { value, text }
        if (priorities && Array.isArray(priorities)) {
          setPriorityOptions(
            priorities.map((p) => ({
              label: p.text,
              value: p.value,
            }))
          );
        }

        // Map languages - { value, text }
        if (languages && Array.isArray(languages)) {
          setLanguageOptions(
            languages.map((l) => ({
              label: l.text,
              value: l.value,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
    }
  };

  // Getting tickets list
  const getTickets = async () => {
    setLoading("fetching");
    try {
      const response = await imsAxios.get("/ticket/fetch", {
        params: { email: user.email, topic: 18 },
      });
      setLoading(false);
      if (response?.success && response?.data) {
        setTickets(response.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch tickets");
        setTickets([]);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching tickets:", error);
      setTickets([]);
    }
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleFileChange = ({ fileList: newFileList }) => {
    const MAX_FILES = 3;
    
    // Check if more than 3 files are selected
    if (newFileList.length > MAX_FILES) {
      toast.error(`You can only select a maximum of ${MAX_FILES} files. Only the first ${MAX_FILES} files will be kept.`);
      // Limit to first 3 files
      const limitedFileList = newFileList.slice(0, MAX_FILES);
      setFileList(limitedFileList);
      
      if (limitedFileList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          attachment: limitedFileList[0].originFileObj,
        }));
      }
      return;
    }
    
    setFileList(newFileList);
    if (newFileList.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachment: newFileList[0].originFileObj,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        attachment: null,
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      topic: null,
      subject: "",
      concern: "",
      priority: null,
      language: null,
      attachment: null,
    });
    setFileList([]);
  };

  // Handle submit ticket
  const handleSubmit = async () => {
    // Validation
    if (!formData.topic) {
      toast.error("Please select a topic");
      return;
    }
    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!formData.concern.trim()) {
      toast.error("Please describe your concern");
      return;
    }

    try {
      setLoading("submitting");

      // Build FormData payload
      const submitFormData = new FormData();
      submitFormData.append("name", user.userName || user.name || "");
      submitFormData.append("email", user.email || "");
      submitFormData.append("phone", user.phone || "");
      submitFormData.append("subject", formData.subject);
      submitFormData.append("message", formData.concern);
      submitFormData.append("topic", formData.topic);

      if (formData.priority) {
        submitFormData.append("priority", formData.priority);
      }

      if (formData.language) {
        submitFormData.append("language", formData.language);
      }

      // Add attachment if present
      if (formData.attachment) {
        submitFormData.append("attachment[]", formData.attachment);
      } else {
        // Add empty attachment array if no file
        submitFormData.append("attachment[]", "");
      }

      const response = await imsAxios.post("/ticket/create", submitFormData);

      setLoading(false);

      if (response?.success) {
        toast.success("Ticket created successfully!");
        resetForm();
        setActiveMenu("fetch");
        getTickets();
      } else {
        toast.error(response?.message || "Failed to create ticket");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    setActiveMenu("fetch");
  };

  useEffect(() => {
    if (open) {
      setActiveMenu("create");
      fetchMasters();
    } else {
      setTickets([]);
      resetForm();
    }
  }, [open]);

  return (
    <Drawer
      title="Your Tickets"
      placement="right"
      onClose={handleClose}
      open={open}
      width={800}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        {/* Left Vertical Icon Menu */}
        <div
          style={{
            width: 50,
            borderRight: "1px solid #cccccc",
            backgroundColor: "#eeeeee",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 12,
            gap: 8,
          }}
        >
          {/* Create Ticket Icon */}
          <div
            onClick={() => setActiveMenu("create")}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor:
                activeMenu === "create" ? "#0d9489" : "transparent",
              color: activeMenu === "create" ? "#fff" : "#666",
              transition: "all 0.2s ease",
            }}
            title="Create Ticket"
          >
            <PlusOutlined style={{ fontSize: 18 }} />
          </div>

          {/* My Tickets Icon */}
          <div
            onClick={() => {
              setActiveMenu("fetch");
              getTickets();
            }}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor:
                activeMenu === "fetch" ? customColor.newBgColor : "transparent",
              color: activeMenu === "fetch" ? "#fff" : "#666",
              transition: "all 0.2s ease",
            }}
            title="My Tickets"
          >
            <UnorderedListOutlined style={{ fontSize: 18 }} />
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, padding: 20, overflow: "auto" }}>
          {/* Create Ticket Form */}
          {activeMenu === "create" && (
            <div style={{ maxWidth: 600 }}>
              <Typography.Title level={4} style={{ marginBottom: 24 }}>
                Create New Ticket
              </Typography.Title>

              {/* Topic */}
              <div style={{ marginBottom: 20 }}>
                <Typography.Text strong>
                  Topic <span style={{ color: "red" }}>*</span>
                </Typography.Text>
                <Select
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder="Select Topic"
                  options={topicOptions}
                  value={formData.topic}
                  onChange={(value) => handleFormChange("topic", value)}
                  loading={topicOptions.length === 0}
                />
              </div>

              {/* Priority & Language Row */}
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>Priority</Typography.Text>
                  <Select
                    style={{ width: "100%", marginTop: 8 }}
                    placeholder="Select Priority"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(value) => handleFormChange("priority", value)}
                    allowClear
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>Language</Typography.Text>
                  <Select
                    style={{ width: "100%", marginTop: 8 }}
                    placeholder="Select Language"
                    options={languageOptions}
                    value={formData.language}
                    onChange={(value) => handleFormChange("language", value)}
                    allowClear
                  />
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 20 }}>
                <Typography.Text strong>
                  Subject <span style={{ color: "red" }}>*</span>
                </Typography.Text>
                <Input
                  style={{ marginTop: 8 }}
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={(e) => handleFormChange("subject", e.target.value)}
                  maxLength={100}
                  showCount
                />
              </div>

              {/* Concern */}
              <div style={{ marginBottom: 20 }}>
                <Typography.Text strong>
                  Describe Your Concern <span style={{ color: "red" }}>*</span>
                </Typography.Text>
                <TextArea
                  style={{ marginTop: 8 }}
                  placeholder="Please describe your issue or concern in detail..."
                  rows={6}
                  value={formData.concern}
                  onChange={(e) => handleFormChange("concern", e.target.value)}
                  maxLength={1000}
                  showCount
                />
              </div>

              {/* Attachment */}
              <div style={{ marginBottom: 24 }}>
                <Typography.Text strong>Attachment</Typography.Text>
                <Upload.Dragger
                  style={{ marginTop: 8 }}
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                  maxCount={3}
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to upload
                  </p>
                  <p className="ant-upload-hint">
                    Supported: PNG, JPG, PDF, DOC, XLS (Max 3 file)
                  </p>
                </Upload.Dragger>
              </div>

              <Divider />

              {/* Bottom Fixed Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <Button onClick={handleCancel}>Cancel</Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading === "submitting"}
                  style={{ backgroundColor: "#0d9489", borderColor: "#0d9489" }}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Fetch Tickets List */}
          {activeMenu === "fetch" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Typography.Title level={4} style={{ margin: 0 }}>
                  My Tickets
                </Typography.Title>
                <Button
                  href={`${axiosLink}/open.php`}
                  target="_blank"
                  type="link"
                >
                  Open on Support Portal
                </Button>
              </div>

              {/* Skeleton Loading */}
              {loading === "fetching" && (
                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  {[1, 2, 3].map((item) => (
                    <Card size="small" key={item}>
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                  ))}
                </Space>
              )}

              {/* No Tickets */}
              {tickets.length === 0 && loading !== "fetching" && (
                <Card style={{ textAlign: "center", padding: 40 }}>
                  <Typography.Text type="secondary">
                    No tickets found
                  </Typography.Text>
                </Card>
              )}

              {/* Tickets List */}
              {!loading && tickets.length > 0 && (
                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  {tickets.map((ticket, index) => (
                    <Card size="small" key={ticket.ticket || index}>
                      <Row gutter={[6, 4]}>
                        <Col span={8}>
                          <Typography.Text strong>Date: </Typography.Text>
                          <Typography.Text>{ticket.date}</Typography.Text>
                        </Col>
                        <Col span={8}>
                          <Typography.Text strong>Priority: </Typography.Text>
                          <Typography.Text
                            style={{
                              backgroundColor:
                                ticket.priorityColor || "#f0f0f0",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          >
                            {ticket.priority}
                          </Typography.Text>
                        </Col>
                        <Col span={8}>
                          <Typography.Text strong>Ticket No.: </Typography.Text>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`${axiosLink}/view.php?e=${user.email}&t=${ticket.ticket}`}
                          >
                            <Typography.Text
                              style={{ color: customColor.newBgColor }}
                              copyable
                            >
                              {ticket.ticket}
                            </Typography.Text>
                          </a>
                        </Col>
                        <Col span={24}>
                          <Typography.Text strong>Subject: </Typography.Text>
                          <Typography.Text>{ticket.subject}</Typography.Text>
                        </Col>
                        <Col span={24}>
                          <Typography.Text strong>Status: </Typography.Text>
                          <Typography.Text
                            style={{
                              color:
                                ticket.status === "O"
                                  ? "#faad14"
                                  : ticket.status === "R"
                                  ? "#52c41a"
                                  : ticket.status === "C"
                                  ? "#1890ff"
                                  : "#999",
                            }}
                          >
                            {ticket.status === "O"
                              ? "Open"
                              : ticket.status === "A"
                              ? "Archived"
                              : ticket.status === "C"
                              ? "Closed"
                              : ticket.status === "R"
                              ? "Resolved"
                              : ticket.status === "D"
                              ? "Deleted"
                              : ticket.status}
                          </Typography.Text>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
