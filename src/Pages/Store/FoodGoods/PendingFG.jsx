import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import PendingFGModal from "./Modal/PendingFGModal";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { Button, Col, Row, Select, Skeleton } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { getFgColumns } from "./fgcolunms";

const PendingFG = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [search, setSearch] = useState("");
  const [fGModal, setFGModal] = useState(false);

  const getPendingData = async () => {
    setLoading(true);
    setPending([]);

    imsAxios
      .post("/fgIN/pending")
      .then((response) => {
        let arr = response.data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setPending(arr);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err);
        setLoading(false);
      });
  };


  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = pending;
    csvData = arr.map((row) => {
      return {
        "Req.ID": `${row.mfg_transaction} /${row.mfg_ref_id}`,
        Type: row.typeOfPPR,
        "Data/Time": row.mfg_full_date,
        SKU: row.SKU,
        Product: row.p_name,
        "MFG/STIN Qty": `${row.mfg_prod_planing_qty}/${row.completedQTY}`,
      };
    });
    downloadCSVCustomColumns(csvData, "Pending FG Report");
  };
  useEffect(() => {
    getPendingData();
  }, []);
  const columns = useMemo(() => getFgColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: pending || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    positionActionsColumn: "last",
    enableStickyHeader: true,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <CustomButton
        size="small"
        title={"Process"}
        variant="text"
        onclick={() => setFGModal(row)}
      />
    ),

    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 210px)" : "calc(100vh - 260px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Product Found" />
    ),

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

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ margin: "10px" }}>
        {pending.length > 1 && (
          <Col span={2} offset={19} className="gutter-row">
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div style={{ height: "90%", margin: "10px" }}>
        <MaterialReactTable table={table} />
      </div>

      <PendingFGModal
        setFGModal={setFGModal}
        fGModal={fGModal}
        getPendingData={getPendingData}
      />
    </div>
  );
};

export default PendingFG;
