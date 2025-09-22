import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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

  // Memoized API call function
  const fetchOptions = useCallback(
    async (searchTerm: string) => {
      setLoading(true);
      try {
        const response =
          fetchOptionWith === "query"
            ? await imsAxios.get(
                `${endpoint}?search=${encodeURIComponent(searchTerm)}`
              )
            : await imsAxios.post(endpoint, { search: searchTerm });

        const data = response.data?.data || response.data;
        const transformedData = Array.isArray(data) ? transform(data) : [];
        setOptions(transformedData);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, fetchOptionWith, transform]
  );

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 3 || inputValue.length === 0) {
        fetchOptions(inputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchOptions]);

  // Event handlers
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (options.length === 0) {
      fetchOptions("");
    }
  }, [options.length, fetchOptions]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleChange = useCallback(
    (event: any, newValue: any) => {
      onChange(newValue);
    },
    [onChange]
  );

  const handleInputChange = useCallback((event: any, newInputValue: string) => {
    setInputValue(newInputValue);
  }, []);

  // Memoized utility functions
  const getOptionLabel = useCallback((option: any) => {
    return typeof option === "string" ? option : option?.label || "";
  }, []);

  const isOptionEqualToValue = useCallback((option: any, value: any) => {
    return option?.value === value?.value;
  }, []);

  // Memoized render functions
  const renderLoading = useMemo(
    () => (
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
    ),
    []
  );

  const renderNoOptions = useMemo(
    () => (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        {loading ? "Loading..." : "No options found"}
      </Box>
    ),
    [loading]
  );

  const renderInput = useCallback(
    (params: any) => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading && <CircularProgress color="inherit" size={20} />}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    ),
    [label, placeholder, loading]
  );

  const renderOption = useCallback(
    (props: any, option: any) => (
      <li {...props} key={option.value}>
        {option.label}
      </li>
    ),
    []
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
      filterOptions={(x) => x}
      noOptionsText={renderNoOptions}
      loadingText={renderLoading}
      renderInput={renderInput}
      renderOption={renderOption}
    />
  );
};

export default ReusableAsyncSelect;
