import React, { useState, useEffect } from "react";
import "./r.css";
import OpenR1Modal from "../Modal/OpenR1Modal";
import "../../Store/MaterialTransfer/Modal/viewModal.css";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { Row, Col, Button, Spin } from "antd";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import {
  PlusCircleFilled,
  ArrowRightOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import MyDataTable from "../../../Components/MyDataTable";

const R1 = () => {
  const [viewModal, setViewModal] = useState(false);
  const [allResponseData, setAllResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  // console.log(allResponseData);

  const columns = [
    { field: "sku", headerName: "SKU", width: 60 },
    { field: "partno", headerName: "Part", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "components",
      headerName: "Component",
      width: 250,
    },
    {
      field: "bom_category",
      headerName: "Category",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Status",
      width: 150,
      type: "actions",
      // getActions: ({ row }) => [<DownloadOutlined />],
      renderCell: (a) =>
        a.row.bom_status ==
        '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>' ? (
          <div
            style={{
              width: "80%",
              textAlign: "center",
              backgroundColor: "#03C988",
            }}
          >
            <span
              style={{
                color: "white",
                fontWeight: "bolder",
              }}
            >
              ACTIVE
            </span>
          </div>
        ) : a.row.bom_status ==
          '<span style="color: #e53935; font-weight: 600;">INACTIVE</span>' ? (
          <div
            style={{
              width: "80%",
              textAlign: "center",
              backgroundColor: "#FF1E00",
            }}
          >
            <span
              style={{
                color: "white",
                fontWeight: "bolder",
              }}
            >
              INACTIVE
            </span>
          </div>
        ) : a.row.bom_status ==
          '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>' ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              backgroundColor: "#FFB200",
            }}
          >
            <span style={{ color: "white" }}>ALTERNATIVE</span>
          </div>
        ) : (
          ""
        ),
    },
    {
      field: "bomalt_name",
      headerName: "Alternate Of",
      width: 120,
    },
    { field: "bomqty", headerName: "BOM Qty", width: 100 },
    { field: "units_name", headerName: "UoM", width: 100 },
    { field: "opening", headerName: "Opening", width: 120 },
    { field: "inward", headerName: "Inward", width: 120 },
    { field: "outward", headerName: "Outward", width: 100 },
    { field: "closing", headerName: "Closing", width: 100 },
    {
      field: "weightedPurchaseRate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
    {
      field: "transit_in",
      headerName: "Order In Transit",
      width: 150,
    },
    {
      field: "lastrate",
      headerName: "Last Purchase Price",
      width: 180,
    },
    {
      field: "currency",
      headerName: "Currency",
      width: 180,
    },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = allResponseData;
    csvData = arr.map((row) => {
      return {
        Sku: row.sku,
        Part: row.partno,
        Component: row.components,
        Category: row.bom_category,
        Status:
          row.bom_status ==
          '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>'
            ? "ACTIVE"
            : row.bom_status ==
              '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>'
            ? "ALTERNATIVE"
            : "INACTIVE",
        "Alt Of": row.bomalt_name[0],
        "Bom Qty": row.bomqty,
        Uom: row.units_name,
        Opening: row.opening == 0 ? "0" : row.opening,
        Inward: row.inward == 0 ? "0" : row.inward,
        Outward: row.outward == 0 ? "0" : row.outward,
        Closing: row.closing == 0 ? "0" : row.closing,
        "Order In Transit": row.transit_in == 0 ? "0" : row.transit_in,
        "Last Purchase Price": row.lastrate == 0 ? "0" : row.lastrate,
        Currency: row.currency,
      };
    });
    downloadCSVCustomColumns(csvData, "Bom Wise Report");
  };
  const reset = () => {
    setAllResponseData([]);
  };

  return (
    <div style={{ height: "97%" }}>
      <Row>
        <Col span={24}>
          <div
            style={{
              textAlign: "end",
              marginRight: "15px",
            }}
          >
            {allResponseData.length >= 1 && (
              <Button
                onClick={handleDownloadingCSV}
                style={{ marginRight: "10px" }}
              >
                <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
              </Button>
            )}
            {/* <Button> */}

            {loading ? (
              ""
            ) : (
              <FilterOutlined
                className="cursorr"
                onClick={() => setViewModal(true)}
                style={{
                  fontSize: "24px",
                  // color: "#365958",
                  color: "#04b0a8",
                }}
              />
            )}
            {/* </Button> */}
          </div>
        </Col>
      </Row>

      <div className="hide-select" style={{ height: "87%", margin: "10px" }}>
        {loading ? (
          <div
            style={{
              height: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                // border: "1px solid red",
                width: "10%",
                justifyContent: "space-around",
              }}
            >
              <Spin size="large" />
              <div
                style={{
                  borderLeft: "2px solid grey",
                  height: "40px",
                }}
              ></div>
              <Button onClick={reset}>Reset</Button>
            </div>
          </div>
        ) : (
          <MyDataTable
            checkboxSelection={true}
            data={allResponseData}
            columns={columns}
            // loading={loading}
          />
        )}
      </div>

      <OpenR1Modal
        setAllResponseData={setAllResponseData}
        setViewModal={setViewModal}
        viewModal={viewModal}
        setLoading={setLoading}
      />
    </div>
  );
};

export default R1;
