import  { useEffect, useState, useMemo } from "react";
import AddBilling from "./Modal/AddBilling";
import { v4 } from "uuid";
import { Row, Space } from "antd";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../axiosInterceptor";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleGlobalFilterButton,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";

const BillingAddress = () => {
  const [dataa, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [search, setSearch] = useState("");
  const [ShowAddBillingModal, setShowAddBillingModal] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/billingAddress/getAll");
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setData(arr);
    setLoading(false);
  };

  const billingColumns = [
    { accessorKey: "label", header: "Label" },
    { accessorKey: "company", header: "Company" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "pan", header: "PAN No." },
    { accessorKey: "gst", header: "GSN" },
    { accessorKey: "cin", header: "CIN" },
    { accessorKey: "insert_dt", header: "Register Date" },
  ];

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const res = dataa.filter((a) => {
      return a.company.toLowerCase().match(search.toLowerCase());
    });
    setFilterData(res);
  }, [search]);

  const columns = useMemo(() => billingColumns, []);
  const table = useMaterialReactTable({
    columns: columns,
    data: dataa || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: false,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 190px)" : "calc(100vh - 240px)",
      },
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
        <CommonIcons
          disabled={dataa.length === 0}
          action="addButton"
          onClick={() => setShowAddBillingModal(true)}
        />
      </>
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
    <div style={{ height: "90%", margin: 12 }}>
      <Row justify="end" style={{ paddingBottom: 5 }}>
        <Space>
          {/* <CommonIcons
            action="addButton"
            onClick={() => setShowAddBillingModal(true)}
          /> */}
          {/* <Button type="primary" onClick={() => setShowAddBillingModal(true)}>
            Add Billing Address
          </Button> */}
        </Space>
      </Row>
      <div style={{ height: "100%" }}>
        <MaterialReactTable table={table} />
      </div>

      <AddBilling
        setShowAddBillingModal={setShowAddBillingModal}
        ShowAddBillingModal={ShowAddBillingModal}
        fetchLocation={fetchLocation}
      />
    </div>
  );
};

export default BillingAddress;
