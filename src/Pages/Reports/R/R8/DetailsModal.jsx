import { Drawer } from "antd";
import { useState, useEffect } from "react";
import MyDataTable from "../../../../Components/MyDataTable";
import { imsAxios } from "../../../../axiosInterceptor";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";

const DetailsModal = ({ show, close }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRows = async (mfgId) => {
    try {
      setRows([]);
      setLoading("fetch");
      const { data } = await imsAxios.post(
        "/report8/getMfgConsumptionComponent",
        {
          mfg_no: mfgId,
        }
      );

      if (data) {
        const arr = data.response.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(arr);
      }
    } catch (error) {
      console.log("some error occurred while fetching the components", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = () => {
    downloadCSV(rows, columns, `${show} details`);
  };
  useEffect(() => {
    if (show) {
      getRows(show);
    }
  }, [show]);
  return (
    <Drawer
      title={show}
      width="50%"
      placement="right"
      onClose={close}
      open={show}
      bodyStyle={{
        padding: 5,
      }}
      extra={
        <CommonIcons
          onClick={handleDownload}
          action="downloadButton"
          type="primary"
        />
      }
    >
      <div style={{ height: "100%" }}>
        <MyDataTable
          loading={loading === "fetch"}
          rows={rows}
          columns={columns}
        />
      </div>
    </Drawer>
  );
};

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Type",
    field: "fgtype",
    width: 50,
  },
  {
    headerName: "Part Code",
    field: "partcode",
    width: 100,
  },
  {
    headerName: "Component",
    field: "component",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },

  {
    headerName: "UoM",
    field: "unit",
    width: 50,
  },
  {
    headerName: "Qty Consumed",
    field: "cons_qty",
    width: 120,
  },
  {
    headerName: "BOM Qty",
    field: "bom_qty",
    width: 120,
  },
  {
    headerName: "Weighted Purchase Rate",
    field: "weightedPurchaseRate",
    width: 120,
  },
  {
    headerName: "Weighted Total Cost",
    field: "weightedTotalCost",
    width: 120,
  },
  {
    headerName: "Location",
    field: "cons_loc",
    width: 120,
  },
  {
    headerName: "Remarks",
    field: "comment",
    width: 300,
    renderCell: ({ row }) => <ToolTipEllipses text={row.comment} />,
  },
];

export default DetailsModal;
