import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import {
  CircularProgress,
  Box,
  Typography,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import {
  Download,
  NewReleases,
  CalendarToday,
  Person,
} from "@mui/icons-material";

const VersionDownload = () => {
  const navigate = useNavigate();
  const [versionFiles, setVersionFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    const fetchVersionFiles = async () => {
      try {
        setLoading(true);
        console.log("Fetching version files...");
        const response = await imsAxios.post("/version/fetchVersionFiles");

        console.log("API Response:", response);
        console.log("Response data:", response.data);

        if (response.data) {
          const files = response.data || [];
          console.log("Setting version files:", files);
          setVersionFiles(files);
          toast.success("Version files loaded successfully!");
        } else {
          toast.error("Failed to fetch version files");
        }
      } catch (error) {
        console.error("Error fetching version files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersionFiles();
  }, []);

  const handleViewFile = (file) => {
    try {
      setViewing(file.doc_id);
      toast.info(`Loading ${file.doc_name}...`);
      toast.success(`${file.doc_name} loaded successfully!`);
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error(`Failed to load ${file.doc_name}. Please try again.`);
    } finally {
      setViewing(null);
    }
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
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading version files...
        </Typography>
      </Box>
    );
  }

  const handleRetry = async () => {
    try {
      setLoading(true);
      setVersionFiles([]);
      console.log("Retrying fetch version files...");
      const response = await imsAxios.post("/version/fetchVersionFiles");
      if (response.data) {
        const files = response.data || [];
        setVersionFiles(files);
        toast.success("Version files loaded successfully!");
      } else {
        toast.error("Failed to fetch version files");
      }
    } catch (error) {
      console.error("Error fetching version files:", error);
      toast.error("Failed to fetch version files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {versionFiles.length === 0 ? (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Version Files
            </Typography>
            {!loading && versionFiles.length === 0 && (
              <Button variant="outlined" onClick={handleRetry} color="primary">
                Retry
              </Button>
            )}
          </Box>
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No version files available
            </Typography>
          </Paper>
        </Box>
      ) : (
        versionFiles.map((file, index) => (
          <Box
            key={file.doc_id}
            sx={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            {/* Header Section */}
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {file.doc_name}
                </Typography>
                {file.is_new && (
                  <Chip
                    icon={<NewReleases />}
                    label="NEW"
                    color="warning"
                    size="small"
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                  {(file.uploaded_date)}
                </Typography>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Person sx={{ fontSize: 16, mr: 1 }} />
                  {file.uploaded_by}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Serial No: {file.serial_no}
                </Typography>
              </Box>
            </Box>

            {/* Full-page Document Viewer */}
            <Box sx={{ flex: 1, position: "relative" }}>
              <iframe
                src={file.file_url || file.doc_url}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                title={file.doc_name}
                onLoad={() => handleViewFile(file)}
                onError={() => {
                  console.error(
                    "Failed to load PDF:",
                    file.file_url || file.doc_url
                  );
                  toast.error(
                    `Failed to load ${file.doc_name}. Please check the file URL.`
                  );
                }}
              />
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default VersionDownload;
