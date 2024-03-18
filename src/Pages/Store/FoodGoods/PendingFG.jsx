import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import PendingFGModal from "./Modal/PendingFGModal";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { Button, Col, Row, Select, Skeleton } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { GoArrowRight } from "react-icons/go";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";

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

  const columns = [
    {
      headerName: "Req.ID",
      field: "mfg_transaction",
      renderCell: ({ row }) => (
        <span> {row.mfg_transaction + " / " + row.mfg_ref_id}</span>
      ),
      width: 200,
    },
    { field: "typeOfPPR", headerName: "Type", width: 150 },
    { field: "mfg_full_date", headerName: "Data/Time", width: 180 },
    { field: "mfg_sku", headerName: "SKU", width: 100 },
    { field: "p_name", headerName: "Product", width: 220 },
    {
      field: "mfg_prod_planing_qty",
      headerName: "MFG/STIN Qty",
      width: 160,
      renderCell: ({ row }) => (
        <span>{row.mfg_prod_planing_qty + "/" + row.completedQTY}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 140,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={
            <GoArrowRight
              onClick={() => setFGModal(row)}
              style={{ color: "#62AAFF", fontSize: "20px" }}
            />
          }
        />,
      ],
    },
  ];

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

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ margin: "10px" }}>
        {/* <Col span={4} className="gutter-row">
          <div>
            <Select options={options} placeholder="Pending" style={{ width: "100%" }} />
          </div>
        </Col> */}
        <Col span={3} className="gutter-row">
          <div>
            <Button type="primary" onClick={getPendingData}>
              Pending Data
            </Button>
          </div>
        </Col>
        {pending.length > 1 && (
          <Col span={2} offset={19} className="gutter-row">
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div style={{ height: "90%", margin: "10px" }}>
        {/* <Skeleton loading={loading}> */}
        <MyDataTable data={pending} columns={columns} loading={loading} />
        {/* </Skeleton> */}
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
