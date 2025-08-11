import { Button, FormControl, IconButton, MenuItem, Select, SelectChangeEvent, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React, { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';

const STORAGE_KEY = "baseUrls";
const CURRENT_URL_KEY = "currentUrl";

const SelectEndPoint: React.FC = () => {
  const [urls, setUrls] = useState<string[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  const [currentUrl, setCurrentUrl] = useState<string>(() => localStorage.getItem(CURRENT_URL_KEY) || import.meta.env.VITE_REACT_APP_API_BASE_URL);
  const [open, setOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const handleStorageChange = () => {
      setUrls(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
      setCurrentUrl(localStorage.getItem(CURRENT_URL_KEY) || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSaveUrl = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newUrl.trim()) return;

    const updatedUrls = Array.from(new Set([...urls, newUrl.trim()])); // Avoid duplicates
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUrls));
    localStorage.setItem(CURRENT_URL_KEY, newUrl.trim());
    setUrls(updatedUrls);
    setCurrentUrl(newUrl.trim());
    setNewUrl("");
    handleClose();
    window.location.reload();
  };

  const handleChange = (event: SelectChangeEvent) => {
    const selectedUrl = event.target.value;
    localStorage.setItem(CURRENT_URL_KEY, selectedUrl);
    setCurrentUrl(selectedUrl);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} PaperProps={{ component: "form", onSubmit: handleSaveUrl }}>
        <DialogTitle>Enter Base URL</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter your backend base URL to save and use it across the application.</DialogContentText>
          <TextField autoFocus required margin="dense" id="url" name="url" label="Base URL" type="url" fullWidth variant="standard" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>

      <div className="flex items-center gap-2">
       
        <FormControl fullWidth>
          <Select
          size="small"
            sx={{
             
              width: "300px",
            }}
          placeholder="Select Base URL"
            value={currentUrl}
            onChange={handleChange}
           
          >
            {
              !urls.length && <MenuItem value={import.meta.env.VITE_REACT_APP_API_BASE_URL}>{import.meta.env.VITE_REACT_APP_API_BASE_URL}</MenuItem>
            }
            {urls.map((url, index) => (
              <MenuItem key={index} value={url}>
                {url}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={handleClickOpen}>
          <AddIcon />
        </IconButton>
      </div>
    </>
  );
};

export default SelectEndPoint;
