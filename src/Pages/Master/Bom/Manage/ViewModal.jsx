import { Drawer } from "antd";
import { useState, useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import { toast } from "react-toastify";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";

const ViewModal = ({ show, close }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    downloadCSV(rows, columns, `BOM ${show.name}`);
  };

  const getRows = async (id) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/bom/bomComponents", {
        subject_id: id,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row, index) => ({
            id: index + 1,
            component: row.c_name,
            partCode: row.c_part_no,
            qty: row.qty,
            uom: row.units_name,
          }));

          setRows(arr);
        }
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      console.log("error while fetching bom components", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      getRows(show.id);
    }
  }, [show]);
  return (
    <Drawer
      width="50vw"
      title={`${show?.name} / ${rows?.length} items`}
      extra={
        <CommonIcons
          disabled={rows.length === 0}
          action="downloadButton"
          onClick={handleDownload}
        />
      }
      onClose={close}
      open={show}
      bodyStyle={{
        padding: 5,
      }}
    >
      <MyDataTable
        loading={loading === "fetch"}
        columns={columns}
        data={rows}
      />
    </Drawer>
  );
};

export default ViewModal;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Component",
    minWidth: 200,
    flex: 1,
    field: "component",
  },
  {
    headerName: "Part Code",
    width: 100,
    field: "partCode",
  },
  {
    headerName: "BOM Qty",
    width: 100,
    field: "qty",
  },
  {
    headerName: "UoM",
    width: 80,
    field: "uom",
  },
];
