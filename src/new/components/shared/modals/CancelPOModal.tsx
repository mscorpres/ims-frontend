import React, { useState, useEffect } from "react";
import {
  Drawer,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
// @ts-ignore
import { imsAxios } from "../../../../axiosInterceptor";

interface CancelPOModalProps {
  showCancelPO: string | null;
  setShowCancelPO: (value: string | null) => void;
  onCancelSuccess: () => void; // Callback to refresh data after cancel
}

export const CancelPOModal: React.FC<CancelPOModalProps> = ({
  showCancelPO,
  setShowCancelPO,
  onCancelSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<any>();
  const [payment, setPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPOStatus = async () => {
    if (showCancelPO) {
      try {
        const { data } = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
          purchaseOrder: showCancelPO,
        });
        if (data.code === 200) {
          setStatus("okay");
          setPayment(data?.data?.advPayment === "1");
        } else {
          setStatus(data);
        }
      } catch (error) {
        toast.error("Error fetching PO status");
      }
    }
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const showConfirmModal = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    handleCancelPO();
  };

  const handleCancelPO = async () => {
    if (showCancelPO) {
      setLoading(true);
      try {
        const { data } = await imsAxios.post("/purchaseOrder/CancelPO", {
          purchase_order: showCancelPO,
          remark: reason,
        });

        if (data.code === 200) {
          toast.success(data.message.msg);
          setReason("");
          setShowCancelPO(null);
          onCancelSuccess(); // Refresh the data
        } else {
          toast.error(data.message.msg);
        }
      } catch (error) {
        toast.error("Error cancelling PO");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (showCancelPO) {
      getPOStatus();
      setReason("");
    }
  }, [showCancelPO]);

  return (
    <>
      <Drawer
        anchor="right"
        open={!!showCancelPO}
        onClose={() => setShowCancelPO(null)}
        PaperProps={{
          sx: { width: "50vw" },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Cancelling Purchase Order: {showCancelPO}
          </Typography>

          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Cancellation Reason"
              multiline
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please enter Cancellation Reason"
              helperText={
                reason && reason.length < 5
                  ? "Please enter at least 5 characters"
                  : ""
              }
              error={reason.length > 0 && reason.length < 5}
              required
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              disabled={reason.length < 5 || loading}
              onClick={payment ? showConfirmModal : handleCancelPO}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ mt: 2 }}
            >
              {loading ? "Cancelling..." : "Cancel PO"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this PO? Since the advanced payment
            has already been made to the vendor.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmCancel}
            color="primary"
            variant="contained"
          >
            Confirm Cancel PO
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelPOModal;
