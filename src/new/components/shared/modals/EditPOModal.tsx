import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { Store } from "../../../../Features/Store";
import ReusableAsyncSelect from "@/Components/ReusableAsyncSelect";
import EditComponentsModal from "./EditComponentsModal";
import {
  fetchBillingAddresses,
  fetchShippingAddresses,
  fetchVendorBranches,
  fetchVendorAddress,
  fetchBillingAddress,
  fetchShippingAddress,
  updatePOData,
} from "@/new/features/procurement/POSlice";
import CustomFieldBox from "../../reuseable/CustomFieldBox";
import ConfirmationDialog from "../../reuseable/ConfirmationDialog";
import CustomButton from "../../reuseable/CustomButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { vendorDetailsOptions } from "@/new/optionsData/options";

interface Material {
  id: string;
  component: { label: string; value: string };
  qty: number;
  rate: number;
  duedate: string;
  hsncode: string;
  gsttype: string;
  gstrate: number;
  cgst: number;
  sgst: number;
  igst: number;
  remark: string;
  inrValue: number;
  foreginValue: number;
  unit: string;
  updateRow?: string;
  project_rate: number;
  localPrice: number;
  tol_price: number;
  project_qty: number;
  po_ord_qty: number;
  currency: string;
  exchange_rate: number;
}

interface EditPOModalProps {
  showEditPO: any;
  setShowEditPO: (value: any) => void;
  onEditSuccess: () => void; // Callback to refresh data after edit
}

export const  EditPOModal: React.FC<EditPOModalProps> = React.memo(
  ({ showEditPO, setShowEditPO, onEditSuccess }) => {
    const dispatch = useDispatch<typeof Store.dispatch>();
    const [activeTab, setActiveTab] = useState(0);
    const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [resetDetailsData, setResetDetailsData] = useState<any>(null);
    const [showDetailsConfirm, setShowDetailsConfirm] = useState(false);
    const [materials, setMaterials] = useState<Material[]>([]);

    // Get data from Redux store
    const {
      billingAddresses,
      shippingAddresses,
      vendorBranches,
      vendorAddress,
      billingAddress,
      shippingAddress,
      billingAddressesLoading,
      shippingAddressesLoading,
      vendorBranchesLoading,
      updatePOLoading,
    } = useSelector((state: any) => state.createPo);

    // Memoized transform functions to prevent unnecessary re-renders
    const vendorTransform = useCallback(
      (data: any[]) =>
        data.map((vendor: any) => ({
          label: vendor.text,
          value: vendor.id,
        })),
      []
    );

    const costCenterTransform = useCallback(
      (data: any[]) =>
        data.map((center: any) => ({
          label: center.text,
          value: center.id,
        })),
      []
    );

    // Memoized onChange handlers to prevent unnecessary re-renders
    const handleVendorChange = useCallback(
      (value: any) => {
        selectInputHandler("vendorcode", value);
      },
      [purchaseOrder]
    );

    const handleCostCenterChange = useCallback((value: any) => {
      setFormData((prev: any) => {
        const newData = {
          ...prev,
          costcenter: value,
        };
        setPurchaseOrder(newData);
        return newData;
      });
    }, []);

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
          vendoraddress:
            showEditPO.vendoraddress?.replaceAll("<br>", "\n") || "",
          billaddress: showEditPO.billaddress?.replaceAll("<br>", "\n") || "",
          advancePayment: showEditPO.advPayment === "1" ? 1 : 0,
          // Initialize vendor data properly
          vendorcode: showEditPO.vendorcode
            ? {
                value: showEditPO.vendorcode,
                label: showEditPO.vendorname || showEditPO.vendorcode,
              }
            : null,
          vendorbranch: showEditPO.vendorbranch
            ? {
                value: showEditPO.vendorbranch,
                label: showEditPO.vendorbranchname || showEditPO.vendorbranch,
              }
            : null,
          // Initialize address IDs
          addrbillid: showEditPO.addrbillid || "",
          addrshipid: showEditPO.addrshipid || "",
          // Initialize cost center
          costcenter: showEditPO.costcenter
            ? {
                value: showEditPO.costcenter,
                label: showEditPO.costcentername || showEditPO.costcenter,
              }
            : null,
          // Initialize vendor type
          vendortype_value:
            showEditPO.vendortype_value || showEditPO.vendortype || "",
        };
        setFormData(initialData);
        setPurchaseOrder(initialData);
        setResetDetailsData(initialData);

        // Initialize materials if they exist
        if (showEditPO.materials && showEditPO.materials.length > 0) {
          const formattedMaterials = showEditPO.materials.map(
            (material: any) => ({
              id: material.id || `material-${Date.now()}-${Math.random()}`,
              component: {
                label: material.component + " " + material.part_no,
                value: material.componentKey,
              },
              qty: material.orderqty || 0,
              rate: material.rate || 0,
              duedate: material.duedate || "",
              hsncode: material.hsncode || "",
              gsttype: material.gsttype?.[0]?.id || "",
              gstrate: material.gstrate || 0,
              cgst: material.cgst === "--" ? 0 : material.cgst || 0,
              sgst: material.sgst === "--" ? 0 : material.sgst || 0,
              igst: material.igst === "--" ? 0 : material.igst || 0,
              remark: material.remark || "",
              inrValue: material.taxablevalue || 0,
              foreginValue: material.exchangetaxablevalue || 0,
              unit: material.unitname || "",
              updateRow: material.updateid,
              project_rate: material.project_rate || 0,
              localPrice:
                material.exchangerate && material.rate
                  ? Number(material.exchangerate) * Number(material.rate)
                  : 0,
              tol_price: material.project_rate
                ? Number((material.project_rate * 1) / 100)
                : 0,
              project_qty: material.project_qty || 0,
              po_ord_qty: material.po_ord_qty || 0,
              currency: material.currency || "INR",
              exchange_rate: material.exchangerate || 1,
            })
          );
          setMaterials(formattedMaterials);
        }

        if (initialData.vendorcode?.value) {
          dispatch(fetchVendorBranches(initialData.vendorcode.value));
        }

        // Fetch initial addresses if they exist
        if (initialData.addrbillid) {
          dispatch(fetchBillingAddress(initialData.addrbillid));
        }
        if (initialData.addrshipid) {
          dispatch(fetchShippingAddress(initialData.addrshipid));
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

    // Remove these functions as they're not needed with ReusableAsyncSelect
    // const handleVendorSearch = (search: string) => {
    //   if (search.length > 2) {
    //     dispatch(fetchVendorOptions(search));
    //   }
    // };

    // const handleCostCenterSearch = (search: string) => {
    //   if (search.length > 2) {
    //     dispatch(fetchCostCenterOptions(search));
    //   }
    // };

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
            // Reset vendor branch when vendor changes
            vendorbranch: null,
            vendoraddress: "",
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
        } else if (name === "costcenter") {
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

    // Handle materials save
    const handleMaterialsSave = useCallback((updatedMaterials: Material[]) => {
      setMaterials(updatedMaterials);
      toast.success("Components updated successfully");
    }, []);

    // Handle materials cancel
    const handleMaterialsCancel = useCallback(() => {
      setActiveTab(0); // Go back to first tab
    }, []);

    // Validation function similar to EditPO.jsx
    const validateData = () => {
      let validation = true;
      let components: any = {
        component: [],
        qty: [],
        rate: [],
        currency: [],
        exchange_rate: [],
        date: [],
        hsn: [],
        gsttype: [],
        gstrate: [],
        sgst: [],
        igst: [],
        cgst: [],
        updaterow: [],
        remark: [],
        rate_cap: [],
        project_qty: [],
        exq_po_qty: [],
      };

      // Validate materials
      materials.forEach((row) => {
        if (
          !row.currency ||
          !row.exchange_rate ||
          !row.component ||
          !row.qty ||
          !row.rate ||
          !row.hsncode ||
          !row.gsttype
        ) {
          validation = false;
        }
      });

      if (!validation) {
        toast.error("Please fill all the component fields");
        return null;
      }

      // Build components data structure
      materials.forEach((row) => {
        components = {
          component: [...components.component, row.component?.value],
          qty: [...components.qty, row.qty],
          rate: [...components.rate, row.rate],
          currency: [...components.currency, row.currency],
          exchange_rate: [...components.exchange_rate, row.exchange_rate],
          date: [...components.date, row.duedate],
          hsn: [...components.hsn, row.hsncode],
          gsttype: [...components.gsttype, row.gsttype],
          gstrate: [...components.gstrate, row.gstrate],
          sgst: [...components.sgst, row.sgst],
          igst: [...components.igst, row.igst],
          cgst: [...components.cgst, row.cgst],
          remark: [...components.remark, row.remark],
          rate_cap: [...components.rate_cap, row.project_rate],
          project_qty: [...components.project_qty, row.project_qty],
          exq_po_qty: [...components.exq_po_qty, row.po_ord_qty],
          updaterow: [
            ...components.updaterow,
            row.updateRow ? row.updateRow : "",
          ],
        };
      });

      // Validate currency consistency
      if (
        components.currency.filter((v: any, i: any, a: any) => v === a[0])
          .length !== components.currency.length
      ) {
        validation = false;
        toast.error("Currency of all components should be the same");
        return null;
      }

      // Validate GST type consistency
      if (
        components.gsttype.filter((v: any, i: any, a: any) => v === a[0])
          .length !== components.gsttype.length
      ) {
        validation = false;
        toast.error("GST Type of all components should be the same");
        return null;
      }

      return components;
    };

    const handleSubmit = async () => {
      try {
        // Validate data first
        const components = validateData();
        if (!components) {
          return;
        }
        console.log("Form Data:", formData);
        console.log("Cost Center Value:", formData?.costcenter);

        // Helper function to extract value from select objects
        const getSelectValue = (field: any) => {
          if (typeof field === "string") return field;
          if (field && typeof field === "object" && field.value) {
            return field.value;
          }
          return "";
        };

        // Build final PO data structure exactly like EditPO.jsx
        const finalPO = {
          poid: showEditPO?.orderid,
          vendor_name: getSelectValue(formData?.vendorcode),
          vendor_type: formData?.vendortype_value?.trim() || "",
          vendor_branch: getSelectValue(formData?.vendorbranch),
          vendor_address: formData?.vendoraddress?.trim() || "",
          paymentterms: formData?.paymentterms?.trim() || "",
          quotationterms: formData?.termsofquotation?.trim() || "",
          termsandcondition: formData?.termsofcondition?.trim() || "",
          costcenter: getSelectValue(formData?.costcenter),
          ship_address_id: formData?.addrshipid || "",
          ship_address: formData?.shipaddress?.trim() || "",
          projectname: formData?.projectname?.trim() || "",
          pocomment: formData?.pocomment?.trim() || "",
          bill_address_id: formData?.addrbillid || "",
          billaddress: formData?.billaddress?.trim() || "",
          termsday: formData?.paymenttermsday || "",
          advancePayment: formData?.advancePayment || 0,
          ...components,
          materials: null,
        };

        console.log("Final PO Payload:", finalPO);
        console.log("Cost Center in Payload:", finalPO.costcenter);
        console.log(
          "getSelectValue result for costcenter:",
          getSelectValue(formData?.costcenter)
        );
        // Make API call using Redux slice
        const result = await dispatch(updatePOData(finalPO));

        if (updatePOData.fulfilled.match(result)) {
          toast.success(result.payload.message);
          onEditSuccess(); // Refresh the data
        } else {
          toast.error("Failed to update PO");
        }
      } catch (error) {
        console.error("Error updating PO:", error);
        toast.error("Error updating PO. Please try again.");
      }
    };

    const handleCancel = () => {
      setShowEditPO(null);
      setFormData({});
      setActiveTab(0);
    };

    return (
      <>
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
              <Box
                sx={{ height: "calc(100% - 200px)", overflow: "auto", p: 2 }}
              >
                {/* Two Column Card Layout */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  {/* Left Column */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {/* Vendor Details Card */}
                    <CustomFieldBox
                      title="Vendor Details"
                      subtitle="Type Name or Code of the vendor"
                    >
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
                            <InputLabel
                              sx={{
                                fontSize: "0.875rem",
                                "&.Mui-focused": {
                                  color: "#0d9488",
                                },
                              }}
                            >
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
                              sx={{
                                fontSize: "0.875rem",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#d1d5db",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#0d9488",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#0d9488",
                                  },
                              }}
                              label="Vendor Type"
                            >
                              {vendorDetailsOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.text}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <ReusableAsyncSelect
                            placeholder="Search Vendor"
                            endpoint="/backend/vendorList"
                            transform={vendorTransform}
                            fetchOptionWith="payload"
                            value={formData.vendorcode}
                            onChange={handleVendorChange}
                            label={formData.vendorname || "Vendor Name"}
                            size="medium"
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
                            <InputLabel
                              sx={{
                                fontSize: "0.875rem",
                                "&.Mui-focused": {
                                  color: "#0d9488",
                                },
                              }}
                            >
                              Vendor Branch
                            </InputLabel>
                            <Select
                              value={formData.vendorbranch?.value || ""}
                              onChange={(e) =>
                                selectInputHandler("vendorbranch", {
                                  value: e.target.value,
                                  label: vendorBranches.find(
                                    (b: any) => b.value === e.target.value
                                  )?.text,
                                })
                              }
                              sx={{
                                fontSize: "0.875rem",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#d1d5db",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#0d9488",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#0d9488",
                                  },
                              }}
                              disabled={vendorBranchesLoading}
                              label={"Vendor Branch"}
                            >
                              {vendorBranches.length > 0 ? (
                                vendorBranches.map((branch: any) => (
                                  <MenuItem
                                    key={branch.value}
                                    value={branch.value}
                                  >
                                    {branch.text}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  {vendorBranchesLoading
                                    ? "Loading..."
                                    : "No branches available"}
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
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
                    </CustomFieldBox>

                    {/* Billing Details Card */}
                    <CustomFieldBox
                      title="Billing Details"
                      subtitle="Provide billing information"
                    >
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
                            <InputLabel
                              sx={{
                                fontSize: "0.875rem",
                                "&.Mui-focused": {
                                  color: "#0d9488",
                                },
                              }}
                            >
                              Billing ID
                            </InputLabel>
                            <Select
                              value={formData.addrbillid || ""}
                              onChange={(e) =>
                                selectInputHandler("addrbillid", e.target.value)
                              }
                              sx={{
                                fontSize: "0.875rem",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#d1d5db",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#0d9488",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#0d9488",
                                  },
                              }}
                              disabled={billingAddressesLoading}
                              label="Billing ID"
                            >
                              {billingAddresses.length > 0 ? (
                                billingAddresses.map((option: any) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.text}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  {billingAddressesLoading
                                    ? "Loading..."
                                    : "No addresses available"}
                                </MenuItem>
                              )}
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
                    </CustomFieldBox>
                  </Box>

                  {/* Right Column */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <CustomFieldBox
                      title="PO Terms"
                      subtitle="Provide PO terms and other information"
                    >
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
                              handleInputChange(
                                "paymenttermsday",
                                e.target.value
                              )
                            }
                            sx={{ fontSize: "0.875rem" }}
                          />
                        </Box>
                        <ReusableAsyncSelect
                          placeholder="Search Cost Center"
                          endpoint="/backend/costCenter"
                          transform={costCenterTransform}
                          fetchOptionWith="payload"
                          value={formData.costcenter}
                          onChange={handleCostCenterChange}
                          label="Cost Center"
                          size="medium"
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
                            sx={{
                              mb: 1,
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            }}
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
                    </CustomFieldBox>
                    {/* Shipping Details Card */}

                    <CustomFieldBox
                      title="Shipping Details"
                      subtitle="Provide shipping information"
                    >
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
                            <InputLabel
                              sx={{
                                fontSize: "0.875rem",
                                "&.Mui-focused": {
                                  color: "#0d9488",
                                },
                              }}
                            >
                              Shipping ID
                            </InputLabel>
                            <Select
                              value={formData.addrshipid || ""}
                              onChange={(e) =>
                                selectInputHandler("addrshipid", e.target.value)
                              }
                              sx={{
                                fontSize: "0.875rem",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#d1d5db",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#0d9488",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#0d9488",
                                  },
                              }}
                              disabled={shippingAddressesLoading}
                              label="Shipping ID"
                            >
                              {shippingAddresses.length > 0 ? (
                                shippingAddresses.map((option: any) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.text}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  {shippingAddressesLoading
                                    ? "Loading..."
                                    : "No addresses available"}
                                </MenuItem>
                              )}
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
                    </CustomFieldBox>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ height: "calc(100% - 200px)", p: 2 }}>
                <EditComponentsModal
                  materials={materials}
                  onSave={handleMaterialsSave}
                  onCancel={handleMaterialsCancel}
                  loading={updatePOLoading}
                />
              </Box>
            )}

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                pt: 3,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <CustomButton title="Cancel" variant="text" onclick={handleCancel} />
                <CustomButton
                  title="Reset"
                  onclick={() => setShowDetailsConfirm(true)}
                />
              </Box>
              {activeTab === 0 ? (
                <CustomButton
                  title="Next"
                  onclick={() => setActiveTab(1)}
                  endicon={<ArrowForwardIcon fontSize="small" />}
                />
              ) : (
                
                <CustomButton
                  title="Save Po"
                  onclick={handleSubmit}
                  loading={updatePOLoading}
                />
              )}
            </Box>
          </Box>
        </Drawer>

        <ConfirmationDialog
          open={showDetailsConfirm}
          close={() => setShowDetailsConfirm(false)}
          title="Confirm Reset!"
          description="Are you sure to reset details of this Purchase Order to the
              details it was created with?"
          onConfirm={resetDetails}
        />
      </>
    );
  }
);

EditPOModal.displayName = "EditPOModal";

export default EditPOModal;
