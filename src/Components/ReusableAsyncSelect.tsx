import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
  Skeleton,
  Box,
} from "@mui/material";
//@ts-ignore
import { imsAxios } from "../axiosInterceptor";

interface ReusableAsyncSelectProps<T> {
  endpoint: string;
  transform: (data: T[]) => { label: string; value: string }[];
  onChange: (selectedOption: { label: string; value: string } | null) => void;
  value?: { label: string; value: string } | null;
  fetchOptionWith: "query" | "payload";
  placeholder: string;
  label?: string;
  size?: "small" | "medium";
  disabled?: boolean;
  fullWidth?: boolean;
  sx?: any;
}

const ReusableAsyncSelect = <T,>({
  endpoint,
  transform,
  onChange,
  value,
  fetchOptionWith,
  placeholder,
  label,
  size = "medium",
  disabled = false,
  fullWidth = true,
  sx,
}: ReusableAsyncSelectProps<T>) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce input value
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 2 || inputValue.length === 0) {
        fetchOptions(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const fetchOptions = async (searchTerm: string) => {
    setLoading(true);
    try {
      let response;

      if (fetchOptionWith === "query") {
        response = await imsAxios.get(
          `${endpoint}?search=${encodeURIComponent(searchTerm)}`
        );
      } else if (fetchOptionWith === "payload") {
        response = await imsAxios.post(endpoint, { search: searchTerm });
      } else {
        response = await imsAxios.get(endpoint);
      }

      const data = response.data?.data || response.data;
      const transformedData = Array.isArray(data) ? transform(data) : [];
      setOptions(transformedData);
    } catch (error) {
      console.error("Error fetching options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Load initial options when opened
    if (options.length === 0) {
      fetchOptions("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChange = (event: any, newValue: any) => {
    onChange(newValue);
  };

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const getOptionLabel = (option: any) => {
    if (typeof option === "string") return option;
    return option?.label || "";
  };

  const isOptionEqualToValue = (option: any, value: any) => {
    return option?.value === value?.value;
  };

  const renderLoading = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={20}
          width="100%"
          sx={{ mb: 1 }}
        />
      ))}
    </Box>
  );

  const renderNoOptions = () => (
    <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
      {loading ? "Loading..." : "No options found"}
    </Box>
  );

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      onOpen={handleOpen}
      onClose={handleClose}
      open={isOpen}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      filterOptions={(x) => x} // Disable client-side filtering
      noOptionsText={renderNoOptions()}
      loadingText={renderLoading()}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.value}>
          {option.label}
        </li>
      )}
    />
  );
};

export default ReusableAsyncSelect;
