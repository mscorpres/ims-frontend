import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { Select, Button, Tag } from "antd";
import { PlayCircleOutlined, FileTextOutlined, DownOutlined, UpOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const customColor = {
  newBgColor: "#047780",
}

// Component for expandable description
const ExpandableDescription = ({ description, maxLines = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const isArray = Array.isArray(description);
  const shouldTruncate = isArray
    ? description.length > maxLines
    : description?.length > 200;

  const displayContent = () => {
    if (isArray) {
      const items = expanded ? description : description.slice(0, maxLines);
      return items.map((line, idx) => (
        <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
          • {line}
        </Typography>
      ));
    } else {
      if (!shouldTruncate || expanded) {
        return <Typography variant="body2">{description}</Typography>;
      }
      return (
        <Typography variant="body2">
          {description?.substring(0, 200)}...
        </Typography>
      );
    }
  };

  return (
    <Box>
      <Box sx={{ color: "#666" }}>{displayContent()}</Box>
      {shouldTruncate && (
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mt: 1,
            color: "#047780",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {expanded ? (
            <>
              Show less <UpOutlined style={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              Show more <DownOutlined style={{ fontSize: 12 }} />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

const VersionDownload = () => {
  // Project launch date: 01 Dec 2020
  const launchYear = 2020;
  const launchMonth = 11; // December (0-indexed)
  
  // Current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [loading, setLoading] = useState(true);
  const [changelogData, setChangelogData] = useState([]);

  // Filter states - default year to current year
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterHaving, setFilterHaving] = useState([]);
  const yearOptions = [];
  for (let year = currentYear; year >= launchYear; year--) {
    yearOptions.push({ label: year.toString(), value: year });
  }

  // Month options - all months
  const allMonths = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  // Get month options based on selected year (only show valid months)
  const getMonthOptions = () => {
    return allMonths.filter((month) => {
      // For launch year (2020), only show December onwards
      if (filterYear === launchYear && month.value < launchMonth) {
        return false;
      }
      
      // For current year, only show up to current month
      if (filterYear === currentYear && month.value > currentMonth) {
        return false;
      }
      
      return true;
    });
  };

  const monthOptions = getMonthOptions();

  // Fetch changelog data from API
  const fetchChangelog = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await imsAxios.get("/changelog/fetch", { params: filters });
      // Axios interceptor returns response.data directly
      if (response?.success) {
        setChangelogData(response.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch changelog");
        setChangelogData([]);
      }
    } catch (error) {
      console.error("Error fetching changelog:", error);
      toast.error("Failed to fetch changelog");
      setChangelogData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch with current year
  useEffect(() => {
    fetchChangelog({ year: currentYear });
  }, []);

  // Handle filter search
  const handleSearch = () => {
    const filters = {};

    if (filterYear) {
      filters.year = filterYear;
    }

    if (filterMonth !== null) {
      filters.month = filterMonth;
    }

    if (filterHaving.includes("doc")) {
      filters.hasDoc = true;
    }

    if (filterHaving.includes("video")) {
      filters.hasVideo = true;
    }

    fetchChangelog(filters);
  };

  // Handle reset - reset to current year
  const handleReset = () => {
    setFilterYear(currentYear);
    setFilterMonth(null);
    setFilterHaving([]);
    fetchChangelog({ year: currentYear });
  };

  // Toggle having filter
  const toggleHaving = (type) => {
    if (filterHaving.includes(type)) {
      setFilterHaving(filterHaving.filter((h) => h !== type));
    } else {
      setFilterHaving([...filterHaving, type]);
    }
  };

  // Group data by year and month
  const groupByYearAndMonth = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });

      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }
      grouped[year][month].push(item);
    });

    return grouped;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleString("default", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  const groupedData = groupByYearAndMonth(changelogData);

  // Handle download
  const handleDownload = () => {
    // Convert changelog data to downloadable format
    const content = changelogData.map(item => {
      const desc = Array.isArray(item.description) 
        ? item.description.join('\n  - ') 
        : item.description;
      return `Date: ${item.date}\nTitle: ${item.title}\nDescription:\n  - ${desc}\n${item.videoUrl ? 'Video: ' + item.videoUrl + '\n' : ''}${item.docUrl ? 'Doc: ' + item.docUrl + '\n' : ''}\n---\n`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog_${dayjs().format('YYYY-MM-DD')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Changelog downloaded successfully");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={60} sx={{ color: customColor.newBgColor }} />
        <Typography variant="h6" color="textSecondary">
          Loading changelog history...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 3,
        height: "calc(100vh - 100px)",
      }}
    >
      {/* Left Section - Timeline */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 2,
        }}
      >
        {/* Page Title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: customColor.newBgColor,
            }}
          >
            Changelog History
          </Typography>
          {changelogData.length > 0 && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{
                height: 36,
              }}
            >
              Download
            </Button>
          )}
        </Box>

        {changelogData.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No changelog history found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try adjusting your filters or add new changelog entries
            </Typography>
          </Paper>
        ) : (
          Object.keys(groupedData)
            .sort((a, b) => b - a)
            .map((year) => (
              <Box
                key={year}
                sx={{
                  display: "flex",
                  position: "relative",
                  mb: 4,
                  minHeight: 200,
                }}
              >
                {/* Year - Rotated 90deg, Sticky on left */}
                <Box
                  sx={{
                    width: 50,
                    flexShrink: 0,
                    position: "sticky",
                    top: 20,
                    height: "fit-content",
                    alignSelf: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: 28,
                      color: customColor.newBgColor,
                      transform: "rotate(-90deg)",
                      transformOrigin: "center center",
                      whiteSpace: "nowrap",
                      letterSpacing: 2,
                      position: "relative",
                      top: 40,
                    }}
                  >
                    {year}
                  </Typography>
                </Box>

                {/* Timeline Content */}
                <Box sx={{ flex: 1, borderLeft: "3px solid #e0e0e0", pl: 3 }}>
                  {Object.keys(groupedData[year]).map((month) => (
                    <Box key={month} sx={{ mb: 3 }}>
                      {/* Month Header - Sticky */}
                      <Box
                        sx={{
                          position: "sticky",
                          top: 0,
                          backgroundColor: "#fff",
                          zIndex: 2,
                          py: 1,
                          mb: 1,
                          borderBottom: "2px solid #047780",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: customColor.newBgColor,
                          }}
                        >
                          {month}
                        </Typography>
                      </Box>

                      {/* Timeline Container */}
                      <Box sx={{ position: "relative", ml: 2 }}>
                        {/* Vertical Line */}
                        <Box
                          sx={{
                            position: "absolute",
                            left: 50,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: customColor.newBgColor,
                            zIndex: 0,
                          }}
                        />

                        {/* Timeline Items */}
                        {groupedData[year][month].map((item, index) => {
                          const dateInfo = formatDate(item.date);
                          return (
                            <Box
                              key={item.changelog_id || item.id || index}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                mb: 4,
                                position: "relative",
                              }}
                            >
                              {/* Date Circle */}
                              <Box
                                sx={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: "50%",
                                  border: "3px solid #047780",
                                  backgroundColor: "#fff",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 1,
                                  flexShrink: 0,
                                  boxShadow: "0 2px 8px rgba(4, 119, 128, 0.2)",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: 22,
                                    lineHeight: 1,
                                    color: "#333",
                                  }}
                                >
                                  {dateInfo.day}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: 14,
                                    lineHeight: 1.2,
                                    color: "#333",
                                  }}
                                >
                                  {dateInfo.month}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: 12,
                                    color: customColor.newBgColor,
                                  }}
                                >
                                  {dateInfo.year}
                                </Typography>
                              </Box>

                              {/* Content */}
                              <Box sx={{ ml: 3, pt: 1, flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#333",
                                    mb: 1,
                                  }}
                                >
                                  {item.title}
                                </Typography>

                                {/* Expandable Description */}
                                <ExpandableDescription
                                  description={item.description}
                                  maxLines={3}
                                />

                                {/* Video & Doc Links */}
                                {(item.videoUrl || item.docUrl) && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      mt: 1.5,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {item.videoUrl && (
                                      <Box
                                        component="a"
                                        href={item.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          px: 1.5,
                                          py: 0.5,
                                          backgroundColor: "#ff4d4f",
                                          color: "#fff",
                                          borderRadius: 1,
                                          fontSize: 13,
                                          fontWeight: 500,
                                          textDecoration: "none",
                                          transition: "all 0.2s",
                                          "&:hover": {
                                            backgroundColor: "#d9363e",
                                            transform: "translateY(-1px)",
                                          },
                                        }}
                                      >
                                        <PlayCircleOutlined style={{ fontSize: 16 }} />
                                        Watch Video
                                      </Box>
                                    )}
                                    {item.docUrl && (
                                      <Box
                                        component="a"
                                        href={item.docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          px: 1.5,
                                          py: 0.5,
                                          backgroundColor: "#d2f571",
                                          color: "#fff",
                                          borderRadius: 1,
                                          fontSize: 13,
                                          fontWeight: 500,
                                          textDecoration: "none",
                                          transition: "all 0.2s",
                                          "&:hover": {
                                            backgroundColor: "#035a61",
                                            transform: "translateY(-1px)",
                                          },
                                        }}
                                      >
                                        <FileTextOutlined style={{ fontSize: 16 }} />
                                        View Docs
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))
        )}
      </Box>

      {/* Right Section - Filters */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          p: 2.5,
          border: "1px solid #e0e0e0",
          height: "fit-content",
          position: "sticky",
          top: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: "#333",
            borderBottom: "2px solid #047780",
            pb: 1,
          }}
        >
          Filters
        </Typography>

        {/* Year Filter */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Year
          </Typography>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Year"
            options={yearOptions}
            value={filterYear}
            onChange={(value) => {
              setFilterYear(value);
              // Reset month if invalid for selected year
              if (value === launchYear && filterMonth !== null && filterMonth < launchMonth) {
                setFilterMonth(null);
              }
              if (value === currentYear && filterMonth !== null && filterMonth > currentMonth) {
                setFilterMonth(null);
              }
            }}
            allowClear
          />
        </Box>

        {/* Month Filter */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Month
          </Typography>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Month"
            options={monthOptions}
            value={filterMonth}
            onChange={(value) => setFilterMonth(value)}
            allowClear
          />
        </Box>

        {/* Having Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Having
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tag
              color={filterHaving.includes("doc") ? customColor.newBgColor : "default"}
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                fontSize: 13,
                borderRadius: 16,
              }}
              onClick={() => toggleHaving("doc")}
            >
              <FileTextOutlined style={{ marginRight: 4 }} />
              Doc
            </Tag>
            <Tag
              color={filterHaving.includes("video") ? "#ff4d4f" : "default"}
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                fontSize: 13,
                borderRadius: 16,
              }}
              onClick={() => toggleHaving("video")}
            >
              <PlayCircleOutlined style={{ marginRight: 4 }} />
              Video
            </Tag>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{
              flex: 1,
              height: 36,
            }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              flex: 1,
              height: 36,
            }}
          >
            Search
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VersionDownload;
