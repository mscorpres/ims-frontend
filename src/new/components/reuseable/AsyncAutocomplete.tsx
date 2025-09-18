import useDebounce from "@/hooks/useDebounce";
import { Card, CardContent, CircularProgress, TextField } from "@mui/material";
import { useState, useEffect } from "react";

// Define props interface
type AsyncAutocompleteProps<T> = {
  loadOptions: any// API endpoint to fetch from
  onSelect: (item: T) => void; // callback when user selects an item
  labelKey?: keyof T; // key for displaying text
  valueKey?: keyof T; // key for unique value
  placeholder?: string;
  minChars?: number; // min characters before search

  loading: boolean;
};

const AsyncAutocomplete = <T extends Record<string, any>>({
  loading,
  loadOptions,
  onSelect,
  labelKey = "label",
  valueKey = "id",
  placeholder = "Search...",
  minChars = 2,
}: AsyncAutocompleteProps<T>) => {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query);
  const [results, setResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);


    useEffect(() => {
      if (debouncedQuery.length >= 3) {
        loadOptions(debouncedQuery);
      }
    }, [debouncedQuery]);

 

  return (
    <div className="relative w-full max-w-md">
      <TextField
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && (results.length > 0 || loading) && (
        <Card className="absolute mt-1 w-full z-10 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-3 text-gray-500">
                <CircularProgress size={20} /> Loading...
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={String(item[valueKey])}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    onSelect(item);
                    setQuery(String(item[labelKey]));
                    setShowDropdown(false);
                  }}
                >
                  {String(item[labelKey])}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AsyncAutocomplete;
