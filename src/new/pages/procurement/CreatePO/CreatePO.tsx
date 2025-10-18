import React, { useCallback, useState } from "react";
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
                 onChange={() => handleInputChange("termscondition", null)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="MSME Type"
                value={formData.msmeType || ""}
                 onChange={() => handleInputChange("vendorbranch", null)}
                sx={{ fontSize: "0.875rem" }}
              />{" "}
              <TextField
                fullWidth
                label="MSME Id"
                value={formData.msmeid || ""}
                 onChange={() => handleInputChange("vendorbranch", null)}
                sx={{ fontSize: "0.875rem" }}
              />
                  <TextField
                fullWidth
                label="MSME Id"
                value={formData.msmeid || ""}
                 onChange={() => handleInputChange("vendorbranch", null)}
                sx={{ fontSize: "0.875rem" }}
              />
            </Box>
          </CustomFieldBox>
          <CustomFieldBox title="PO Type" subtitle="">
            <h5>Po Type Field</h5>
          </CustomFieldBox>
          <CustomFieldBox title="PO Type" subtitle="">
            <h5>Po Type Field</h5>
          </CustomFieldBox>
          <CustomFieldBox title="PO Type" subtitle="">
            <h5>Po Type Field</h5>
          </CustomFieldBox>
          <CustomFieldBox title="PO Type" subtitle="">
            <h5>Po Type Field</h5>
          </CustomFieldBox>
        </Box>
      </Box>
    </Box>
  );
};

export default CreatePO;
