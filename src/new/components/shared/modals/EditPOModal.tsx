import React, { useState, useEffect } from "react";
import {
  Drawer,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";

interface EditPOModalProps {
  showEditPO: any;
  setShowEditPO: (value: any) => void;
  onEditSuccess: () => void; // Callback to refresh data after edit
}

export const EditPOModal: React.FC<EditPOModalProps> = ({
  showEditPO,
  setShowEditPO,
  onEditSuccess,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (showEditPO) {
      // Initialize form data from the PO details
      const initialData = {
        ...showEditPO,
        shipaddress: showEditPO.shipaddress?.replaceAll("<br>", "\n") || "",
        vendoraddress: showEditPO.vendoraddress?.replaceAll("<br>", "\n") || "",
        billaddress: showEditPO.billaddress?.replaceAll("<br>", "\n") || "",
        advancePayment: showEditPO.advPayment === "1" ? 1 : 0,
      };
      setFormData(initialData);
      setPurchaseOrder(initialData);
    }
  }, [showEditPO]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Here you would implement the actual update API call
      // const { data } = await imsAxios.post("/purchaseOrder/updatePO", formData);

      toast.success("PO updated successfully");
      setShowEditPO(null);
      onEditSuccess(); // Refresh the data
    } catch (error) {
      toast.error("Error updating PO");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowEditPO(null);
    setFormData({});
    setActiveTab(0);
  };

  return (
    <Drawer
      anchor="right"
      open={!!showEditPO}
      onClose={handleCancel}
      sx={{ width: "100vw" }}
      PaperProps={{ sx: { width: "100vw" } }}
    >
      <Box sx={{ padding: 2, height: "100%" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Updating PO: {showEditPO?.orderid}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Edit Purchase Order" />
            <Tab label="Edit Components Details" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ height: "calc(100% - 120px)", overflow: "auto" }}>
            {/* Vendor Details */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vendor Details
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Vendor Type</InputLabel>
                <Select
                  value={formData.vendortype_value || ""}
                  onChange={(e) =>
                    handleInputChange("vendortype_value", e.target.value)
                  }
                >
                  <MenuItem value="j01">JWI (Job Work In)</MenuItem>
                  <MenuItem value="v01">Vendor</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Vendor Name"
                value={formData.vendorname || ""}
                onChange={(e) =>
                  handleInputChange("vendorname", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Vendor Branch"
                value={formData.vendorbranch || ""}
                onChange={(e) =>
                  handleInputChange("vendorbranch", e.target.value)
                }
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bill From Address"
              value={formData.vendoraddress || ""}
              onChange={(e) =>
                handleInputChange("vendoraddress", e.target.value)
              }
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            {/* PO Terms */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              PO Terms
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Terms and Conditions"
                value={formData.termsofcondition || ""}
                onChange={(e) =>
                  handleInputChange("termsofcondition", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Quotation"
                value={formData.termsofquotation || ""}
                onChange={(e) =>
                  handleInputChange("termsofquotation", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Payment Terms"
                value={formData.paymentterms || ""}
                onChange={(e) =>
                  handleInputChange("paymentterms", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Due Date (in days)"
                type="number"
                value={formData.paymenttermsday || ""}
                onChange={(e) =>
                  handleInputChange("paymenttermsday", e.target.value)
                }
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Cost Center"
                value={formData.costcenter || ""}
                onChange={(e) =>
                  handleInputChange("costcenter", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Project"
                value={formData.projectname || ""}
                onChange={(e) =>
                  handleInputChange("projectname", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Comments"
                value={formData.pocomment || ""}
                onChange={(e) => handleInputChange("pocomment", e.target.value)}
              />
              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Advance Payment
                </Typography>
                <RadioGroup
                  value={formData.advancePayment || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "advancePayment",
                      parseInt(e.target.value)
                    )
                  }
                  row
                >
                  <FormControlLabel value={1} control={<Radio />} label="Yes" />
                  <FormControlLabel value={0} control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Billing Details */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Billing Details
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Billing Id"
                value={formData.addrbillid || ""}
                onChange={(e) =>
                  handleInputChange("addrbillid", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Pan No."
                value={formData.billpanno || ""}
                onChange={(e) => handleInputChange("billpanno", e.target.value)}
              />
              <TextField
                fullWidth
                label="GSTIN / UIN"
                value={formData.billgstid || ""}
                onChange={(e) => handleInputChange("billgstid", e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Billing Address"
              value={formData.billaddress || ""}
              onChange={(e) => handleInputChange("billaddress", e.target.value)}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Shipping Details */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Shipping Details
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Shipping Id"
                value={formData.addrshipid || ""}
                onChange={(e) =>
                  handleInputChange("addrshipid", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Pan No."
                value={formData.shippanno || ""}
                onChange={(e) => handleInputChange("shippanno", e.target.value)}
              />
              <TextField
                fullWidth
                label="GSTIN / UIN"
                value={formData.shipgstid || ""}
                onChange={(e) => handleInputChange("shipgstid", e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Shipping Address"
              value={formData.shipaddress || ""}
              onChange={(e) => handleInputChange("shipaddress", e.target.value)}
              sx={{ mb: 3 }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box
            sx={{
              height: "calc(100% - 120px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Alert severity="info">
              Component editing functionality will be implemented in the next
              phase.
            </Alert>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditPOModal;

