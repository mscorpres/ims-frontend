import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { useDispatch } from "react-redux";
// @ts-ignore
import CustomFieldBox from "@/new/components/reuseable/CustomFieldBox";

const CreatePO: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <Box  sx={{ height: "calc(100vh - 45px)" }}>
      {/* <Paper className="p-4 md:p-6 h-full"> */}
      <Box className="w-full flex items-center justify-between  " sx={{ p: 2 }}>
        <Typography variant="h6">Create Purchase Order</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button size="small" variant="text">
            Reset
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {}}
          >
            Submit
          </Button>
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
        <CustomFieldBox title="PO Type" subtitle="">
          <h5>Po Type Field</h5>
        </CustomFieldBox>
      </Box>
    </Box>
  );
};

export default CreatePO;
