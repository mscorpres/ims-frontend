import React, { useState, useEffect } from "react";
import {
  Drawer,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Delete, CloudUpload, Description } from "@mui/icons-material";
import { toast } from "react-toastify";
// @ts-ignore
import { imsAxios } from "../../../../axiosInterceptor";

interface UploadDocModalProps {
  showUploadDoc: string | null;
  setShowUploadDoc: (value: string | null) => void;
  onUploadSuccess: () => void; // Callback to refresh data after upload
}

interface FileItem {
  uid: string;
  name: string;
  status: string;
}

export const UploadDocModal: React.FC<UploadDocModalProps> = ({
  showUploadDoc,
  setShowUploadDoc,
  onUploadSuccess,
}) => {
  const [existingFiles, setExistingFiles] = useState<FileItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showExistingFiles, setShowExistingFiles] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<FileItem | null>(null);

  const getPoExistingDocuments = async () => {
    if (!showUploadDoc) return;

    setLoading(true);
    try {
      const { data } = await imsAxios.post(
        "/purchaseOrder/fetchUploadedAttachment",
        {
          po_id: showUploadDoc,
        }
      );

      if (data.code === 200) {
        const files = data.data.map((row: any) => ({
          uid: row.doc_id,
          name: row.doc_name,
          status: "done",
        }));
        setExistingFiles(files);
      } else {
        setExistingFiles([]);
      }
    } catch (error) {
      toast.error("Error fetching existing documents");
      setExistingFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (file: FileItem) => {
    try {
      const { data } = await imsAxios.post(
        "/purchaseOrder/deleteUploadedAttachment",
        {
          doc_id: file.uid,
          po_id: showUploadDoc,
        }
      );

      if (data.code === 200) {
        toast.success(data.message);
        await getPoExistingDocuments();
        setDeleteConfirm(null);
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      toast.error("Error deleting file");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !fileName.trim()) {
      toast.error("Please select a file and enter a document name");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("po_id", showUploadDoc!);
      formData.append("doc_name", fileName);

      const { data } = await imsAxios.post(
        "/purchaseOrder/uploadAttachment",
        formData
      );

      if (data.code === 200) {
        toast.success(data.message);
        setFileName("");
        setSelectedFile(null);
        await getPoExistingDocuments();
        onUploadSuccess();
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClose = () => {
    setShowUploadDoc(null);
    setFileName("");
    setSelectedFile(null);
    setShowExistingFiles(false);
    setDeleteConfirm(null);
  };

  useEffect(() => {
    if (showUploadDoc) {
      getPoExistingDocuments();
    } else {
      setExistingFiles([]);
    }
  }, [showUploadDoc]);

  return (
    <>
      <Drawer
        anchor="right"
        open={!!showUploadDoc}
        onClose={handleClose}
        PaperProps={{
          sx: { width: "35vw" },
        }}
      >
        <Box
          sx={{
            p: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            Upload Document: {showUploadDoc}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowExistingFiles(true)}
              disabled={loading}
              startIcon={<Description />}
            >
              Show Existing Files ({existingFiles.length})
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                fullWidth
                label="Document Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter document name"
                size="small"
              />

              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CloudUpload sx={{ fontSize: 48, color: "gray" }} />
                <Typography variant="body2" color="textSecondary">
                  Click or drag file to this area to upload
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  You can upload only one file at a time
                </Typography>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outlined" component="span">
                    Select File
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" color="primary">
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                onClick={uploadFile}
                disabled={!selectedFile || fileName.length < 3 || uploadLoading}
                startIcon={
                  uploadLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CloudUpload />
                  )
                }
                fullWidth
              >
                {uploadLoading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Existing Files Drawer */}
      <Drawer
        anchor="right"
        open={showExistingFiles}
        onClose={() => setShowExistingFiles(false)}
        PaperProps={{
          sx: { width: 320 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Existing Files
          </Typography>
          <List>
            {existingFiles.map((file) => (
              <ListItem key={file.uid} divider>
                <ListItemText
                  primary={file.name}
                  secondary={`Status: ${file.status}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => setDeleteConfirm(file)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {existingFiles.length === 0 && (
              <Alert severity="info">No files uploaded yet</Alert>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => deleteConfirm && deleteFile(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadDocModal;
