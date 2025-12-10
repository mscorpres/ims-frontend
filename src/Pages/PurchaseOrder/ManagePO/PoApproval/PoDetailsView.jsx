import React from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useState } from "react";
import { useEffect } from "react";
import { Drawer, Space, Typography } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";

export default function PoDetailsView({ viewPoDetails, setViewPoDetails }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post(
      "/purchaseOrder/fetchComponentList4POApproval",
      {
        poid: viewPoDetails,
      }
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          id: index + 1,
          ...row,
        }));
        setRows(arr);
      } else {
        toast.message(data.message.msg);
        setViewPoDetails(false);
      }
    }
  };
  const columns = [
    { headerName: "Sr. No", field: "id", width: 80 },
    {
      headerName: "Part Code",
      field: "componentPartID",
      width: 100,
    },
    {
      headerName: "Component",
      field: "po_components",
      width: 250,
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_components} />,
    },
    {
      headerName: "Comp. Status",
      field: "po_part_status",
      width: 120,
    },
    {
      headerName: "Qty",
      field: "ordered_qty",
      width: 120,
    },
    {
      headerName: "UoM",
      field: "uom",
      width: 100,
    },
    {
      headerName: "Item Description",
      field: "poItemDescription",
      width: 300,
    },
    {
      headerName: "Approval Remark",
      field: "approval_remark",
      renderCell: ({ row }) => (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            // overflowX: "auto",
          }}
        >
          <Typography.Text
            ellipsis={{
              tooltip: row.approval_remark,
            }}
            style={{
              width: "100%",
              // overflowX: "auto",
              fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.9rem",
              // alignSelf: "center",
            }}
          >
            {row.approval_remark}
          </Typography.Text>
          {/* <ToolTipEllipses copy={true} text={row.approval_remark} /> */}
        </div>
      ),
      // width: "100%",
      flex: 1,
    },
  ];
  useEffect(() => {
    if (viewPoDetails) {
      getRows();
    }
  }, [viewPoDetails]);
  return (
    <Drawer
      title={`PO : ${viewPoDetails}`}
      placement="right"
      width="100vw"
      onClose={() => setViewPoDetails(false)}
      open={viewPoDetails}
      bodyStyle={{
        padding: 5,
      }}
      extra={
        <Space>
          {rows.length} Items{" "}
          <CommonIcons
            action="downloadButton"
            onClick={() => downloadCSV(rows, columns, viewPoDetails)}
          />
        </Space>
      }
    >
      <div style={{ height: "100%", overflowX: "auto", width: "100%" }}>
        <MyDataTable
          loading={loading === "fetch"}
          columns={columns}
          rows={rows}
        />
      </div>
    </Drawer>
  );
}
