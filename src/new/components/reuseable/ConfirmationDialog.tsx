import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import React from "react";

interface ConfirmationDialogProps {
    open: boolean ;
    close: () => void;
    title: string;
    description: string;
    onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  close,
  title="Confirm Reset!",
  onConfirm,
  description="Are you sure to process this request?"

}) => {
  return (
    <Dialog
      open={open}
      onClose={close}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>
         {description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>No</Button>
        <Button onClick={onConfirm} variant="contained">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
