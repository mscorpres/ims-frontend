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
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { Store } from "../../../../Features/Store";
import ReusableAsyncSelect from "@/Components/ReusableAsyncSelect";
import {
  fetchVendorOptions,
  fetchCostCenterOptions,
  fetchBillingAddresses,
  fetchShippingAddresses,
  fetchVendorBranches,
  fetchVendorAddress,
  fetchBillingAddress,
  fetchShippingAddress,
} from "@/new/features/procurement/POSlice";

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
  const dispatch = useDispatch<typeof Store.dispatch>();
  const [activeTab, setActiveTab] = useState(0);
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [resetDetailsData, setResetDetailsData] = useState<any>(null);
  const [showDetailsConfirm, setShowDetailsConfirm] = useState(false);

  // Get data from Redux store
  const {
    vendorOptions,
    costCenterOptions,
    billingAddresses,
    shippingAddresses,
    vendorBranches,
    vendorAddress,
    billingAddress,
    shippingAddress,
    vendorOptionsLoading,
    costCenterOptionsLoading,
    billingAddressesLoading,
    shippingAddressesLoading,
    vendorBranchesLoading,
    vendorAddressLoading,
    billingAddressLoading,
    shippingAddressLoading,
  } = useSelector((state: any) => state.createPo);

  const vendorDetailsOptions = [
    { text: "JWI (Job Work In)", value: "j01" },
    { text: "Vendor", value: "v01" },
  ];

  useEffect(() => {
    if (showEditPO) {
      // Fetch initial data
      dispatch(fetchBillingAddresses());
      dispatch(fetchShippingAddresses());

      // Initialize form data from the PO details
      const initialData = {
        ...showEditPO,
        poid: showEditPO?.orderid,
        shipaddress: showEditPO.shipaddress?.replaceAll("<br>", "\n") || "",
        vendoraddress: showEditPO.vendoraddress?.replaceAll("<br>", "\n") || "",
        billaddress: showEditPO.billaddress?.replaceAll("<br>", "\n") || "",
        advancePayment: showEditPO.advPayment === "1" ? 1 : 0,
      };
      setFormData(initialData);
      setPurchaseOrder(initialData);
      setResetDetailsData(initialData);

      if (initialData.vendorcode?.value) {
        dispatch(fetchVendorBranches(initialData.vendorcode.value));
      }
    }
  }, [showEditPO, dispatch]);

  // Handle address updates from Redux
  useEffect(() => {
    if (billingAddress) {
      setFormData((prev: any) => ({
        ...prev,
        billgstid: billingAddress.gstin,
        billpanno: billingAddress.pan,
        billaddress: billingAddress.address,
      }));
      setPurchaseOrder((prev: any) => ({
        ...prev,
        billgstid: billingAddress.gstin,
        billpanno: billingAddress.pan,
        billaddress: billingAddress.address,
      }));
    }
  }, [billingAddress]);

  useEffect(() => {
    if (shippingAddress) {
      setFormData((prev: any) => ({
        ...prev,
        shipgstid: shippingAddress.gstin,
        shippanno: shippingAddress.pan,
        shipaddress: shippingAddress.address,
      }));
      setPurchaseOrder((prev: any) => ({
        ...prev,
        shipgstid: shippingAddress.gstin,
        shippanno: shippingAddress.pan,
        shipaddress: shippingAddress.address,
      }));
    }
  }, [shippingAddress]);

  useEffect(() => {
    if (vendorAddress) {
      setFormData((prev: any) => ({
        ...prev,
        vendoraddress: vendorAddress.address,
      }));
      setPurchaseOrder((prev: any) => ({
        ...prev,
        vendoraddress: vendorAddress.address,
      }));
    }
  }, [vendorAddress]);

  const handleVendorSearch = (search: string) => {
    if (search.length > 2) {
      dispatch(fetchVendorOptions(search));
    }
  };

  const handleCostCenterSearch = (search: string) => {
    if (search.length > 2) {
      dispatch(fetchCostCenterOptions(search));
    }
  };

  const selectInputHandler = (name: string, value: any) => {
    if (value) {
      let obj = { ...purchaseOrder };

      if (name === "addrbillid") {
        dispatch(fetchBillingAddress(value));
        obj = {
          ...obj,
          [name]: value,
        };
      } else if (name === "addrshipid") {
        dispatch(fetchShippingAddress(value));
        obj = {
          ...obj,
          [name]: value,
        };
      } else if (name === "vendorcode") {
        dispatch(fetchVendorBranches(value.value));
        obj = {
          ...obj,
          [name]: value,
          vendorname: value.label,
        };
      } else if (name === "vendorbranch") {
        dispatch(
          fetchVendorAddress({
            vendorcode: purchaseOrder.vendorcode.value,
            branchcode: value.value,
          })
        );
        obj = {
          ...obj,
          [name]: value,
        };
      } else {
        obj = {
          ...obj,
          [name]: value,
        };
      }

      setFormData(obj);
      setPurchaseOrder(obj);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      [field]: value,
    };
    setFormData(newData);
    setPurchaseOrder(newData);
  };

  const resetDetails = () => {
    setFormData(resetDetailsData);
    setPurchaseOrder(resetDetailsData);
    setShowDetailsConfirm(false);
  };

  const handleSubmit = async () => {
    try {
      // Here you would implement the actual update API call
      // const { data } = await imsAxios.post("/purchaseOrder/updatePO", formData);

      toast.success("PO updated successfully");
      setShowEditPO(null);
      onEditSuccess(); // Refresh the data
    } catch (error) {
      toast.error("Error updating PO");
    }
  };

  const handleCancel = () => {
    setShowEditPO(null);
    setFormData({});
    setActiveTab(0);
  };

  return (
    <>
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={showDetailsConfirm}
        onClose={() => setShowDetailsConfirm(false)}
      >
        <DialogTitle>Confirm Reset!</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure to reset details of this Purchase Order to the details
            it was created with?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsConfirm(false)}>No</Button>
          <Button onClick={resetDetails} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={!!showEditPO}
        onClose={handleCancel}
        sx={{ width: "100vw" }}
        PaperProps={{ sx: { width: "100vw" } }}
      >
        <Box sx={{ p: 3, height: "100%", bgcolor: "#f9fafb" }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#111827" }}>
            Updating PO: {showEditPO?.orderid}
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Edit Purchase Order" />
              <Tab label="Edit Components Details" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box sx={{ height: "calc(100% - 120px)", overflow: "auto", p: 2 }}>
              {/* Two Column Card Layout */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {/* Left Column */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Vendor Details Card */}
                  <Paper
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      border: "1px solid #e5e7eb",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#eff6ff",
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#111827" }}
                      >
                        Vendor Details
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mt: 0.5 }}
                      >
                        Type Name or Code of the vendor
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: "0.875rem" }}>
                            Vendor Type
                          </InputLabel>
                          <Select
                            value={formData.vendortype_value || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "vendortype_value",
                                e.target.value
                              )
                            }
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {vendorDetailsOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <ReusableAsyncSelect
                          placeholder="Search Vendor"
                          endpoint="/backend/vendorList"
                          transform={(data: any[]) =>
                            data.map((vendor: any) => ({
                              label: vendor.text,
                              value: vendor.id,
                            }))
                          }
                          fetchOptionWith="payload"
                          value={formData.vendorcode}
                          onChange={(value: any) =>
                            selectInputHandler("vendorcode", value)
                          }
                          label="Vendor Name"
                          size="small"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: "0.875rem" }}>
                            Vendor Branch
                          </InputLabel>
                          <Select
                            value={formData.vendorbranch || ""}
                            onChange={(e) =>
                              selectInputHandler("vendorbranch", {
                                value: e.target.value,
                                label: vendorBranches.find(
                                  (b: any) => b.value === e.target.value
                                )?.text,
                              })
                            }
                            sx={{ fontSize: "0.875rem" }}
                            disabled={vendorBranchesLoading}
                          >
                            {vendorBranches.map((branch: any) => (
                              <MenuItem key={branch.value} value={branch.value}>
                                {branch.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="GSTIN"
                          value="--"
                          disabled
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Vendor Address"
                        value={formData.vendoraddress || ""}
                        onChange={(e) =>
                          handleInputChange("vendoraddress", e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      />
                    </Box>
                  </Paper>

                  {/* Billing Details Card */}
                  <Paper
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      border: "1px solid #e5e7eb",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#eff6ff",
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#111827" }}
                      >
                        Billing Details
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mt: 0.5 }}
                      >
                        Provide billing information
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: "0.875rem" }}>
                            Billing ID
                          </InputLabel>
                          <Select
                            value={formData.addrbillid || ""}
                            onChange={(e) =>
                              selectInputHandler("addrbillid", e.target.value)
                            }
                            sx={{ fontSize: "0.875rem" }}
                            disabled={billingAddressesLoading}
                          >
                            {billingAddresses.map((option: any) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="PAN No."
                          value={formData.billpanno || ""}
                          onChange={(e) =>
                            handleInputChange("billpanno", e.target.value)
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="GSTIN / UIN"
                        value={formData.billgstid || ""}
                        onChange={(e) =>
                          handleInputChange("billgstid", e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Billing Address"
                        value={formData.billaddress || ""}
                        onChange={(e) =>
                          handleInputChange("billaddress", e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      />
                    </Box>
                  </Paper>
                </Box>

                {/* Right Column */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* PO Terms Card */}
                  <Paper
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      border: "1px solid #e5e7eb",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#eff6ff",
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#111827" }}
                      >
                        PO Terms
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mt: 0.5 }}
                      >
                        Provide PO terms and other information
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Terms and Conditions"
                          value={formData.termsofcondition || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "termsofcondition",
                              e.target.value
                            )
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                        <TextField
                          fullWidth
                          label="Quotation"
                          value={formData.termsofquotation || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "termsofquotation",
                              e.target.value
                            )
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Payment Terms"
                          value={formData.paymentterms || ""}
                          onChange={(e) =>
                            handleInputChange("paymentterms", e.target.value)
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                        <TextField
                          fullWidth
                          label="Due Date (in days)"
                          type="number"
                          value={formData.paymenttermsday || ""}
                          onChange={(e) =>
                            handleInputChange("paymenttermsday", e.target.value)
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <ReusableAsyncSelect
                          placeholder="Search Cost Center"
                          endpoint="/backend/costCenterList"
                          transform={(data: any[]) =>
                            data.map((center: any) => ({
                              label: center.text,
                              value: center.id,
                            }))
                          }
                          fetchOptionWith="payload"
                          value={formData.costcenter}
                          onChange={(value: any) =>
                            handleInputChange("costcenter", value)
                          }
                          label="Cost Center"
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Project"
                          value={formData.projectname || ""}
                          onChange={(e) =>
                            handleInputChange("projectname", e.target.value)
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Comments"
                        value={formData.pocomment || ""}
                        onChange={(e) =>
                          handleInputChange("pocomment", e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      />
                      <FormControl fullWidth>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}
                        >
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
                          sx={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            value={1}
                            control={<Radio size="small" />}
                            label="Yes"
                            sx={{ fontSize: "0.875rem" }}
                          />
                          <FormControlLabel
                            value={0}
                            control={<Radio size="small" />}
                            label="No"
                            sx={{ fontSize: "0.875rem" }}
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  </Paper>

                  {/* Shipping Details Card */}
                  <Paper
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      border: "1px solid #e5e7eb",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#eff6ff",
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#111827" }}
                      >
                        Shipping Details
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mt: 0.5 }}
                      >
                        Provide shipping information
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: "0.875rem" }}>
                            Shipping ID
                          </InputLabel>
                          <Select
                            value={formData.addrshipid || ""}
                            onChange={(e) =>
                              selectInputHandler("addrshipid", e.target.value)
                            }
                            sx={{ fontSize: "0.875rem" }}
                            disabled={shippingAddressesLoading}
                          >
                            {shippingAddresses.map((option: any) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="PAN No."
                          value={formData.shippanno || ""}
                          onChange={(e) =>
                            handleInputChange("shippanno", e.target.value)
                          }
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="GSTIN / UIN"
                        value={formData.shipgstid || ""}
                        onChange={(e) =>
                          handleInputChange("shipgstid", e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Shipping Address"
                        value={formData.shipaddress || ""}
                        onChange={(e) =>
                          handleInputChange("shipaddress", e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      />
                    </Box>
                  </Paper>
                </Box>
              </Box>
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
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
              pt: 3,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={handleCancel} sx={{ px: 3 }}>
                Cancel
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowDetailsConfirm(true)}
                sx={{ px: 3 }}
              >
                Reset
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                px: 4,
                bgcolor: "#0d9488",
                "&:hover": { bgcolor: "#0f766e" },
                color: "white",
              }}
              endIcon={<span style={{ marginLeft: "4px" }}>→</span>}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default EditPOModal;
