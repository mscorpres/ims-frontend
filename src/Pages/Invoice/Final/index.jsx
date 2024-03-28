import { Button } from "antd";
import React, { useEffect, useState } from "react";

import MyDataTable from "../../../Components/MyDataTable";
import printFunction from "../../../Components/printFunction";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import MyButton from "../../../Components/MyButton";

function FinalInvoice() {
  const [finalData, setFinalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      field: "client",
      headerName: "Client Name",
      flex: 1,
      renderCell: ({ row }) => (row.client == null ? "---" : row.client),
    },
    {
      field: "date",
      headerName: "Invoice Date",
      flex: 1,
    },
    {
      field: "invoice",
      headerName: "Invoice No",
      flex: 1,
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      renderCell: ({ row }) => <p>{Number(row.amount).toFixed(2)}</p>,
    },
    {
      headerName: "Action",
      flex: 1,
      renderCell: ({ row }) => (
        <div>
          <MyButton
            variant="download"
            // icon={<DownloadOutlined />}
            // loading={loading}
            // onClick={downlaodData(row.invoice)}
            onClick={() => downloadFunction(row.invoice)}
            type="secondary"
          >
            Download
          </MyButton>
        </div>
      ),
    },
  ];

  const getFinalInvoice = async () => {
    try {
      setFinalData([]);
      setLoading(true);
      const response = await imsAxios.get("/invoice/activeInvoiceList");
      const { data } = response;
      if (data) {
        let arr = data.map((row) => ({
          ...row,
          id: v4(),
        }));
        setFinalData(arr);
      }
    } catch (error) {
      console.log("Error while fetching final invoice", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFunction = async (id) => {
    const { data } = await imsAxios.get(
      `/invoice/downloadInvoice?invoiceID=${id}`
    );
    printFunction(data.buffer.data);
  };

  useEffect(() => {
    getFinalInvoice();
  }, []);
  return (
    <div className="hide-select" style={{ height: "87%", margin: "10px" }}>
      <MyDataTable data={finalData} columns={columns} loading={loading} />
    </div>
  );
}

export default FinalInvoice;
