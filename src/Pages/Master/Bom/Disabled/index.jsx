import { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import { Row, Switch } from "antd";
import { toast } from "react-toastify";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";

const Disabled = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/bom/getDraftBOMs");
      const { data } = response;
      if (data && data?.data.length) {
        const arr = data.data.map((row, index) => ({
          id: index + 1,
          product: row.subject_name,
          sku: row.bom_product_sku,
          bomId: row.subject_id,
          status: "DISABLE",
        }));

        setRows(arr);
      } else if (data && !data?.data) {
        toast.error(data.message.msg);
      }
    } catch (error) {
      setRows([]);
      console.log("error while fetching disabled BOMs", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, status) => {
    const statusText = status ? "ENABLE" : "DISABLE";
    setLoading(id);
    const response = await imsAxios.post("/bom/updateBOMStatus", {
      subject_id: id,
      status: statusText,
    });
    const { data } = response;
    if (data) {
      if (data.status === "success") {
        setRows((curr) =>
          curr.map((row) => {
            if (row.bomId === id) {
              return {
                ...row,
                status: row.status === "ENABLE" ? "DISABLED" : "ENABLE",
              };
            } else {
              return row;
            }
          })
        );
      }
    }
    setLoading(false);
  };

  const downloadHandler = () => {
    downloadCSV(rows, columns, "disabled BOM List");
  };

  const actionColumns = [
    {
      headerName: "Status",
      width: 100,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === "ENABLE"}
          loading={loading === row.bomId}
          onChange={(value) => {
            toggleStatus(row.bomId, value);
          }}
        />
      ),
    },
  ];
  useEffect(() => {
    getRows();
  }, []);
  return (
    <div style={{ height: "90%", padding: 10, paddingTop: 0 }}>
      <Row style={{ paddingBottom: 5 }} justify="end">
        <CommonIcons
          action="downloadButton"
          onClick={downloadHandler}
          disabled={rows.length === 0}
        />
      </Row>
      <MyDataTable
        data={rows}
        columns={[...actionColumns, ...columns]}
        loading={loading === "fetch"}
      />
    </div>
  );
};

export default Disabled;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 200,
    flex: 1,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 150,
  },
];
