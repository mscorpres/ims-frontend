import { useState, useMemo } from "react";
import { Col, Row, Space } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import MyDatePicker from "../../Components/MyDatePicker";
import { imsAxios } from "../../axiosInterceptor";
import SFTransferDrawer from "./SFTransferDrawer";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import { getProductReturnColumns } from "./sfcolummns";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import CustomButton from "../../new/components/reuseable/CustomButton";
function Pending() {
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [sfTransferModal, setSfTransferModal] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.post("/sfMin/sfMinTransferList", {
      date: searchInput,
    });
    // console.log("response", response);
    const { data } = response;
    if (data.code === 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        };
      });
      setRows(arr);
      setLoading(false);
    }
    if (data.code === 500) {
      toast.error(data.message.msg);
    }
    setLoading(false);
  };

  const columns = useMemo(() => getProductReturnColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
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
        onclick={() => setDrawerData(row?.original)}
      />
    ),
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 238px)" : "calc(100vh - 290px)",
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
    <Row
      style={{
        height: "90%",
        paddingRight: 10,
        paddingLeft: 10,
      }}
    >
      <Col span={24}>
        <Row>
          <Col>
            <div style={{ paddingTop: 10, paddingBottom: 10 }}>
              <Space>
                <MyDatePicker setDateRange={setSearchInput} />
                <CustomButton
                  size="small"
                  title="Search"
                  starticon={<SearchIcon fontSize="small" />}
                  loading={loading}
                  onclick={getRows}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </Col>
      <Col span={24} style={{ height: "95%" }}>
        <MaterialReactTable table={table} />
      </Col>
      {drawerData && (
        <SFTransferDrawer
          sfTransferModal={sfTransferModal}
          setSfTransferModal={setSfTransferModal}
          setDrawerData={setDrawerData}
          drawerData={drawerData}
        />
      )}
    </Row>
  );
}

export default Pending;
