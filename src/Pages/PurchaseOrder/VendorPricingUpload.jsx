import React, { useState, useeffect } from "react";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { toast } from "react-toastify";
import MyDataTable from "../../Components/MyDataTable";
import NavFooter from "../../Components/NavFooter";
import { v4 } from "uuid";
import { Card, Col, Row, Space } from "antd";
import { downloadCSVCustomColumns } from "../../Components/exportToCSV";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import { Typography } from "@mui/material";
import CustomButton from "../../new/components/reuseable/CustomButton";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

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
  const previewColumns = [
    { headerName: "Vendor Code", field: "VENDOR_CODE", flex: 1 },
    { headerName: "PART Code", field: "PART_CODE", flex: 1 },
    { headerName: "Part Name", field: "PART_NAME", flex: 1 },
    { headerName: "Rate", field: "RATE", flex: 1 },
  ];
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
            <Card
              size="small"
              className="!bg-[#e1fffc] border border-[#0d9488]"
            >
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
                onClick={resetFunction}
                disabled={!file || previewLoading ? true : false}
              />
              <CustomButton
                title={"Next"}
                size="small"
                endicon={<ArrowForwardIcon fontSize="small" />}
                onclick={previewFile}
                disabled={!file || previewLoading ? true : false}
              />
              {/* <MyButton
                loading={previewLoading}
                type="primary"
                onClick={previewFile}
                disabled={!file || previewLoading ? true : false}
                variant="next"
              >
                Next
              </MyButton> */}
              {/* <MyButton
                onClick={resetFunction}
                disabled={!file || previewLoading ? true : false}
                variant="reset"
              >
                Reset File
              </MyButton> */}
              {/* <MyButton
                onClick={() =>
                  downloadCSVCustomColumns(sampleData, "POVENDORPRICNG")
                }
                type="link"
                variant="downloadSample"
              >
                Download Sample File
              </MyButton> */}
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
          <MyDataTable
            columns={previewColumns}
            data={previewRows}
            headText="center"
          />
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
