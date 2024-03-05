import React, { useState, useEffect } from "react";
import { Drawer, Space, Tooltip } from "antd";
import {
  EyeFilled,
  CloseCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";
import { imsAxios } from "../../../../axiosInterceptor";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";

function CashPaymentModal({ setOpen, open }) {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [header, setHeader] = useState([]);
  // console.log("DATA", allData);
  // console.log("HEADER", header);
  const getFetchData = async () => {
    setLoading(true);
    const { data } = await imsAxios.post(
      "/tally/cash/cash_payment_report",
      {
        v_code: open,
      }
    );
    if (data.code == 200) {
      setHeader(data.header[0]);
      const arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      console.log(arr);
      setAllData(arr);
    }
  };

  const columns = [
    {
      headerName: "Particulars",
      field: "particulars",
      flex: 1,
      // sortable: false,
    },
    {
      headerName: "Payment",
      renderCell: ({ row }) => row.ammount,
      //   row.which_module == "BP" ? <span>{row.debit}</span> : <span>{row.credit}</span>,

      field: "type",
      flex: 1,
      sortable: false,
    },
    {
      headerName: "Comment",
      //   width: "12.5vw",
      flex: 1,
      field: "comment",
      renderCell: ({ row }) => (
        <Tooltip title={row.comment}>{row.comment}</Tooltip>
      ),
      sortable: false,
    },
  ];

  useEffect(() => {
    if (open) {
      getFetchData();
    }
  }, [open]);
  return (
    <Space>
      <Drawer
        width="50vw"
        height="100vh"
        title={`Cash Payment Voucher: ${open}`}
        placement="right"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
        getContainer={false}
        extra={
          <Space>
            <CloseOutlined onClick={() => setOpen(false)} />
          </Space>
        }
      >
        <div
          style={{
            // border: "1px solid red",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <span>
            Created Date:{" "}
            <span style={{ fontWeight: "bold" }}>
              {header.insert_date}
            </span>
          </span>
          <span>
            Effective Date:{" "}
            <span style={{ fontWeight: "bold" }}>
              {header.ref_date}
            </span>
          </span>
          <span>
            Account:{" "}
            <span style={{ fontWeight: "bold" }}>
              {header.account}
            </span>
          </span>
        </div>
        <div
          className="remove-table-footer"
          style={{ height: "85%", paddingTop: "10px" }}
        >
          <MyDataTable data={allData} columns={columns} />
        </div>
      </Drawer>
    </Space>
  );
}

export default CashPaymentModal;
