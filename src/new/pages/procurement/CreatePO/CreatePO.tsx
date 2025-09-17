import React, { useEffect } from "react";
import { Box, Paper, Typography, Divider, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendors,
  submitPo,
} from "../../../features/procurement/createPoSlice";

const CreatePO: React.FC = () => {
  const dispatch = useDispatch();
  const { vendorOptions, loading } = useSelector((s: any) => s.createPo);

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchVendors(""));
  }, []);

  return (
    <Box className="p-4 md:p-6">
      <Paper className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6">Create Purchase Order</Typography>
          <div className="flex gap-2">
            <Button size="small" variant="outlined">
              Reset
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => dispatch<any>(submitPo())}
            >
              Submit
            </Button>
          </div>
        </div>
        <Divider className="mb-4" />
        
      </Paper>
    </Box>
  );
};

export default CreatePO;
