import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  LinearProgress,
  Card,
  Typography,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { getVendorPricingUploadColumns } from "@/new/pages/procurement/POType";
import {
  printPO,
  downloadPO,
  fetchComponentData,
  fetchPOLogs,
} from "@/new/features/procurement/POSlice";
import { useDispatch, useSelector } from "react-redux";
import printFunction from "@/new/utils/printFunction";
import { downloadFunction } from "@/new/utils/printFunction";
// @ts-ignore
import { Store } from "../../../../Features/Store";
import { toast } from "react-toastify";

import CustomButton from "@/new/components/reuseable/CustomButton";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
// import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV.jsx";

const VendorPricingUpload: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const sampleData = [
    {
      VENDOR_CODE: "VEN0000",
      PART_CODE: "P2044",
      RATE: "00",
    },
  ];

  const dispatch = useDispatch<typeof Store.dispatch>();
  const {
    componentLoading,
    completedPOLoading,
  } = useSelector((state: any) => state.createPo);

  // Use optimized row actions

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => getVendorPricingUploadColumns(),
    []
  );


  const table = useMaterialReactTable({
    columns: columns,
    data: previewRows || [],
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    // enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 260px)",
        minHeight: "calc(100vh - 260px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 360px)",
          color: "text.secondary",
          fontSize: "0.9rem",
        }}
      >
        No Data Found
      </Box>
    ),

    renderTopToolbar: () =>
      completedPOLoading || componentLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : null,

  });

  const previewFile = async () => {};

  const submitFunction = async () => {};
  const downloadCSVCustomColumns = async (t: any, s: any) => {};
  const resetFunction = () => {
    setFile(null);
    setPreviewRows([]);
  };

  return (
    <div className="grid grid-cols-[1fr_2fr]" style={{ padding: 16, gap: 10 }}>
      <div className=" flex flex-col gap-3 ">
        <form>
          <Typography variant="h6" gutterBottom>
            Upload Vendor Pricing
          </Typography>
          <Card elevation={0} className="border !rounded-[16px]">
            {!file && (
              <div
                style={{
                  opacity: previewLoading ? 0.5 : 1,
                  pointerEvents: previewLoading ? "none" : "all",
                }}
              >
                <input
                  type="file"
                  name="file"
                  // disabled={true}
                  accept=".csv"
                  id="file-input"
                  className="visuallyhidden"
                  onChange={(e: any) =>
                    e.target.files[0] && setFile(e.target.files[0])
                  }
                  style={{
                    opacity: 0,
                    // width: "100%",
                    // background: "red",
                    height: "200px",
                    zIndex: 2,
                    width: "100%",
                    left: 0,
                    position: "absolute",
                    pointerEvents: loading ? "none" : file ? "none" : "all",
                    cursor: "pointer",
                  }}
                />
                {/* @ts-ignore */}
                <div htmlFor="file-input">
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      display: "flex",

                      justifyContent: "center",
                      alignItems: "center",

                      // paddingBottom: 10,
                    }}
                  >
                    <BsFillCloudArrowUpFill
                      style={{
                        fontSize: 70,
                        color: "dodgerblue",
                        opacity: 0.6,
                        zIndex: 1,
                        marginRight: "20px",
                      }}
                    />
                    <h3 className="text-muted">Upload Files</h3>
                  </div>
                </div>
              </div>
            )}
            {file && (
              <>
                <div
                  style={{
                    opacity: previewLoading ? 0.5 : 1,
                    pointerEvents: previewLoading ? "none" : "all",
                  }}
                  className="preview-file"
                >
                  {file.name}
                </div>
              </>
            )}
          </Card>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <CustomButton
              loading={previewLoading}
              title="Next"
              onclick={previewFile}
              disabled={!file || previewLoading ? true : false}
            />

            <CustomButton
              onclick={resetFunction}
              disabled={!file || previewLoading ? true : false}
              title="Reset"
            />
            <CustomButton
              title="Sample File"
              onclick={() =>
                downloadCSVCustomColumns(sampleData, "POVENDORPRICNG")
              }
              variant="text"
              starticon={<Download />}
            />
          </div>
        </form>
      </div>

      <div className="h-[calc(100vh-300px)]">
        <MaterialReactTable table={table} />
        <div className="flex justify-end" style={{marginTop:16}}>
          <CustomButton
            title="Submit"
            onclick={submitFunction}
            disabled={table.getPrePaginationRowModel().rows.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorPricingUpload;
