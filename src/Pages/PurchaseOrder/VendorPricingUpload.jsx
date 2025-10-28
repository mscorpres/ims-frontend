import { useState, useMemo } from "react";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { toast } from "react-toastify";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import NavFooter from "../../Components/NavFooter";
import { v4 } from "uuid";
import { Card, Col, Empty, Row, Space } from "antd";
import { downloadCSVCustomColumns } from "../../Components/exportToCSV";
import { imsAxios } from "../../axiosInterceptor";
import { Typography } from "@mui/material";
import CustomButton from "../../new/components/reuseable/CustomButton";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { getVendorPricingUploadColumns } from "../../new/pages/procurement/POType";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";

export default function VendorPricingUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);

  const previewFile = async () => {
    setPreviewLoading(true);
    const api = "/purchaseorder/uploadVendorPricing?stage=1";
    let formData = new FormData();
    formData.append("uploadfile", file);
    const { data } = await imsAxios.post(api, formData);
    setPreviewLoading(false);
    if (data.code == 200) {
      let arr = data.data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });

      setPreviewRows(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  const submitFunction = async () => {
    let formData = new FormData();
    formData.append("uploadfile", file);
    setLoading(true);
    const { data } = await imsAxios.post(
      "/purchaseorder/uploadVendorPricing?stage=2",
      formData
    );
    setLoading(false);
    // console.log(data);
    if (data.code == 200) {
      toast.success(data.message);
    } else {
      toast.error(data.message.msg);
    }
  };

  const columns = useMemo(() => getVendorPricingUploadColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: previewRows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        height: "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });
  const sampleData = [
    {
      VENDOR_CODE: "VEN0000",
      PART_CODE: "P2044",
      RATE: "00",
    },
  ];
  const resetFunction = () => {
    setFile(null);
    setPreviewRows([]);
  };

  return (
    <div style={{ height: "calc(100vh - 80px)", marginTop: 8 }}>
      <Row
        gutter={8}
        style={{ height: "100%", padding: "4px 10px" }}
        className="vendor-price-upload"
      >
        <Col span={10}>
          <form
            style={{
              position: "relative",
            }}
            className="image-upload-btn"
          >
            <Typography gutterBottom variant="subtitle1">
              Upload Vendor Pricing Files
            </Typography>
            <Card size="small" className="!bg-[#e0f2f1] border border-[white]">
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
                    onChange={(e) =>
                      e.target.files[0] && setFile(e.target.files[0])
                    }
                    style={{
                      opacity: 0,
                      // width: "100%",
                      // backgroundColor:"red",
                      height: "200px",
                      zIndex: 2,
                      width: "100%",
                      left: 0,
                      position: "absolute",
                      pointerEvents: loading ? "none" : file ? "none" : "all",
                      cursor: "pointer",
                    }}
                  />
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
                          color: "#0d9488",
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
          </form>
          <Row justify="end">
            <Space style={{ marginTop: 10 }} justify="start">
              <CustomButton
                title={"Sample File"}
                size="small"
                variant="text"
                starticon={<SaveAltIcon fontSize="small" />}
                onclick={() =>
                  downloadCSVCustomColumns(sampleData, "POVENDORPRICNG")
                }
              />
              <CustomButton
                title={"Reset"}
                size="small"
                starticon={<RestartAltIcon fontSize="small" />}
                onclick={resetFunction}
                disabled={!file || previewLoading ? true : false}
              />
              <CustomButton
                title={"Next"}
                size="small"
                endicon={<ArrowForwardIcon fontSize="small" />}
                onclick={previewFile}
                disabled={!file || previewLoading ? true : false}
              />
            </Space>
          </Row>
        </Col>
        <Col
          span={14}
          style={{
            height: "calc(100vh - 180px)",
            borderRadius: 5,
          }}
        >
          <MaterialReactTable table={table} />
        </Col>
      </Row>
      <NavFooter
        nextLabel="Upload File"
        submitFunction={submitFunction}
        loading={loading}
        nextDisabled={!file || previewRows?.length == 0}
      />
    </div>
  );
}
