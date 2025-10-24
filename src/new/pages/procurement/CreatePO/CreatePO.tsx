import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useDispatch } from "react-redux";
// @ts-ignore
import CustomFieldBox from "@/new/components/reuseable/CustomFieldBox";
import CustomButton from "@/new/components/reuseable/CustomButton";
import { POoption, vendorDetailsOptions } from "@/new/optionsData/options";
import ReusableAsyncSelect from "@/Components/ReusableAsyncSelect";
import { fetchBillingAddress } from "@/new/features/procurement/POSlice";
import { transformData } from "@/new/utils/transforme/transform";


const CreatePO: React.FC = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<any>({});

  // Memoized transform functions to prevent unnecessary re-renders
  const vendorTransform = useCallback(
    (data: any[]) =>
      data.map((vendor: any) => ({
        label: vendor.text,
        value: vendor.id,
      })),
    []
  );

  const handleInputChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      [field]: value,
    };
    setFormData(newData);
  };


//  const handleProjectChange = async (value:any) => {
//     const response = await imsAxios.post("/backend/projectDescription", {
//       project_name: value,
//     });
  
//     const { data } = response;
//     if (data) {
//       if (data.code === 200) {
//         setProjectDesc(data.data.description);
//       } else {
//         // toast.error(data.message.msg);
//       }
//     }
//   };
  return (
    <Box sx={{ height: "calc(100vh - 45px)" }}>
      {/* <Paper className="p-4 md:p-6 h-full"> */}
      <Box className="w-full flex items-center justify-between  " sx={{ p: 2 }}>
        <Typography variant="h6">Create Purchase Order</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <CustomButton
            title="Reset"
            size="small"
            onclick={() => {}}
            variant="text"
          />
          <CustomButton title="Submit" size="small" onclick={() => {}} />
        </Box>
      </Box>
      <Divider className="mb-4" />
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: "column",
          height: "calc(100vh - 130px)",
          overflowY: "auto",

          p: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <CustomFieldBox
            title="PO Type"
            subtitle="Provide Purchase Order type as in
          (New Or Supplementary)"
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
                PO Type <span className="text-red-500">*</span>
              </InputLabel>
              <Select
                value={formData.pocreatetype || ""}
                onChange={(e) =>
                  handleInputChange("pocreatetype", e.target.value)
                }
                sx={{
                  fontSize: "0.875rem",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                }}
                label="PO Type *"
              >
                {POoption.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CustomFieldBox>
          <CustomFieldBox
            title="Vendor Details"
            subtitle="Type Name or Code of the vendor"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                mb: 2,
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
                  value={formData.vendortype || ""}
                  onChange={(e) =>
                    handleInputChange("vendortype", e.target.value)
                  }
                  sx={{
                    fontSize: "0.875rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d1d5db",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0d9488",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0d9488",
                    },
                  }}
                  label="Vendor Type"
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
                transform={vendorTransform}
                fetchOptionWith="payload"
                value={formData.vendorcode}
                onChange={() => handleInputChange("vendorcode", null)}
                label={"Vendor Name"}
                size="medium"
              />
              <ReusableAsyncSelect
                placeholder="Search Branch"
                endpoint="/backend/vendorBranchList"
                transform={(data) => transformData(data)}
                fetchOptionWith="payload"
                value={formData.vendorbranch}
                onChange={() => handleInputChange("vendorbranch", null)}
                label={"Branch Name"}
                size="medium"
              />
              <TextField
                fullWidth
                label="GSTIN"
                value={formData.gstin || ""}
                disabled
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="MSME Type"
                value={formData.msmeType || ""}
                disabled
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="MSME Id"
                value={formData.msmeid || ""}
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
          </CustomFieldBox>
          <CustomFieldBox
            title="PO Terms"
            subtitle="Provide PO terms and other information"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                label="Terms and Conditions"
                value={formData.termscondition || ""}
                onChange={(e) =>
                  handleInputChange("termscondition", e.target.value)
                }
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="Quotation"
                value={formData.quotation || ""}
                onChange={(e) => handleInputChange("quotation", e.target.value)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
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
                value={formData.duedate || ""}
                onChange={(e) => handleInputChange("duedate", e.target.value)}
                sx={{ fontSize: "0.875rem" }}
              />
              <ReusableAsyncSelect
                placeholder="Cost Center"
                endpoint="/backend/costCenter"
                transform={(data) => transformData(data)}
                fetchOptionWith="payload"
                value={formData.costCenter}
                onChange={() => handleInputChange("costCenter", null)}
                label={"Const Center"}
                size="medium"
              />{" "}
              <ReusableAsyncSelect
                placeholder="Project Id"
                endpoint="/backend/poProjectName"
                transform={(data) => transformData(data)}
                fetchOptionWith="payload"
                value={formData.projectId}
                onChange={() => handleInputChange("projectId", null)}
                label={"Project Id"}
                size="medium"
              />{" "}
              <TextField
                fullWidth
                label="Project Description"
                value={formData.projectDescription || ""}
                onChange={()=>{}}
                sx={{ fontSize: "0.875rem" }}
                disabled
              />
              <TextField
                fullWidth
                label="Comment"
                value={formData.comment || ""}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <ReusableAsyncSelect
                placeholder="Required By"
                endpoint="/backend/fetchAllUser"
                transform={(data) => transformData(data)}
                fetchOptionWith="payload"
                value={formData.requestedBy}
                onChange={() => handleInputChange("requestedBy", null)}
                label={"Requested By"}
                size="medium"
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
          <CustomFieldBox
            title="Billing Details"
            subtitle="Provide billing information"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <ReusableAsyncSelect
                placeholder="Billing Id"
                endpoint="/backend/billingAddressList"
                transform={(data) => transformData(data)}
                fetchOptionWith="payload"
                value={formData.billingId}
                onChange={() => handleInputChange("billingId", null)}
                label={"Billing Id"}
                size="medium"
              />{" "}
              <TextField
                fullWidth
                label="Pan No."
                value={formData.panNo || ""}
                onChange={(e) =>
                  handleInputChange("po_transaction", e.target.value)
                }
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="GSTIN / UIN"
                value={formData.gstin || ""}
                onChange={(e) => handleInputChange("gstin", e.target.value)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Billing Address"
              value={formData.billingaddress || ""}
              onChange={(e) =>
                handleInputChange("billingaddress", e.target.value)
              }
              sx={{ fontSize: "0.875rem" }}
            />
          </CustomFieldBox>
          <CustomFieldBox
            title="Shipping Details"
            subtitle="Provide shipping information
"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <ReusableAsyncSelect
                placeholder="Shipping Id"
                endpoint="/backend/billingAddressList"
                transform={(data) => transformData(data)}
                fetchOptionWith="payload"
                value={formData.billingId}
                onChange={() => handleInputChange("shippingId", null)}
                label={"Shipping Id"}
                size="medium"
              />{" "}
              <TextField
                fullWidth
                label="Pan No."
                value={formData.s_panNo || ""}
                onChange={(e) => handleInputChange("s_panNo", e.target.value)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="GSTIN / UIN"
                value={formData.s_gstin || ""}
                onChange={(e) => handleInputChange("s_gstin", e.target.value)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Shipping Address"
              value={formData.shippingaddress || ""}
              onChange={(e) =>
                handleInputChange("shippingaddress", e.target.value)
              }
              sx={{ fontSize: "0.875rem" }}
            />
          </CustomFieldBox>
        </Box>
      </Box>
    </Box>
  );
};

export default CreatePO;
