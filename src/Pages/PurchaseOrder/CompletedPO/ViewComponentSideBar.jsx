import React, { useState } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { Drawer, Space } from "antd";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";

export default function ViewComponentSideBar({
  showComponentSideBar,
  setShowComponentSideBar,
  componentData,
}) {
  const [loading, setLoading] = useState(null);
  const columns = [
    {
      headerName: "SR. No",
      field: "po_transaction",
      valueGetter: ({ row }) => {
        return `${componentData?.components?.indexOf(row) + 1}`;
      },
      id: "Sr. No",
    },
    {
      headerName: "Component Name / Part No.",
      field: "componentPartId",
      valueGetter: ({ row }) => {
        return `${row.po_components} / ${row.componentPartID}`;
      },
      id: "po_components",
      width: 400,
    },
    {
      headerName: "Ordered Qty",
      field: "ordered qty",
      id: "ordered_qty",
      width: 170,
    },
    {
      headerName: "Pending QTY",
      field: "pending_qty",

      id: "pending_qty",
      width: 170,
    },
  ];
  const printFun = async () => {
    setLoading("print");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poId,
    });
    printFunction(data.data.buffer.data);
    setLoading(null);
  };

  const handleDownload = async () => {
    setLoading("download");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poId,
    });
    let filename = `PO ${componentData?.poId}`;
    downloadFunction(data.data.buffer.data, filename);
    setLoading(null);
  };
  return (
    <Drawer
      title={`Purchase Order: ${componentData?.poId}  / ${
        componentData?.components?.length
      } Item${componentData?.components?.length > 1 ? "s" : ""}`}
      width="50vw"
      onClose={() => setShowComponentSideBar(null)}
      open={showComponentSideBar}
      extra={
        <Space>
          <CommonIcons
            action="printButton"
            loading={loading == "print"}
            onClick={printFun}
          />
          <CommonIcons
            action="downloadButton"
            loading={loading == "download"}
            onClick={handleDownload}
          />
        </Space>
      }
    >
      <div style={{ height: "100%" }} className="remove-table-footer">
        <MyDataTable
          pagination={undefined}
          rows={componentData?.components}
          columns={columns}
        />
      </div>
    </Drawer>
  );
}
