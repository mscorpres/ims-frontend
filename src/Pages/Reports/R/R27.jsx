import React, { useState } from "react";
import { Button, Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { DownloadOutlined } from "@ant-design/icons";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyButton from "../../../Components/MyButton";

function R27() {
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateData, setDateData] = useState([]);

  const columns = [
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      headerName: "Product",
      flex: 1,
      field: "product",
    },
    {
      headerName: "SKU ",
      // minWidth: 80,
      //   flex: 1,
      field: "sku",
      renderCell: ({ row }) => <ToolTipEllipses text={row.sku} />,
    },
    {
      headerName: "FG Type",
      width: 100,
      field: "fgtype",
    },
    {
      headerName: "Unit",
      width: 60,
      field: "unit",
    },
    // {
    //   headerName: "Total OB",
    //   width: 120,
    //   field: "totalOB",
    //   renderCell: ({ row }) => <ToolTipEllipses text={row.totalOB} />,
    // },
    // {
    //   headerName: "Total Closing",
    //   width: 120,
    //   field: "totalClosing",
    // },
    // {
    //   headerName: "Total In",
    //   width: 100,
    //   field: "totalIn",
    // },

    {
      headerName: "Open Bal",
      width: 100,
      field: "openBal",
    },
    {
      headerName: "Outward QTY",
      width: 100,
      field: "debitBal",
    },
    {
      headerName: "Inward QTY",
      width: 100,
      field: "creditBal",
    },
    {
      headerName: "Closing QTY",
      width: 100,
      field: "closingBal",
    },

    {
      headerName: "Replenishment",
      width: 110,
      field: "replenishment",
    },
    {
      headerName: "Min Stock",
      width: 90,
      field: "minqty",
    },
    {
      headerName: "Batch Size",
      width: 90,
      field: "batchqty",
    },
    {
      headerName: "EQP",
      width: 90,
      field: "eqp",
    },
  ];

  const getRows = async () => {
    setDateData([]);
    setLoading(true);
    const { data } = await imsAxios.post("/report27", {
      date: datee,
    });

    if (data.code == 200) {
      setLoading(false);
      toast.success(data.message);
      let arr = data.response.data.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        };
      });
      setDateData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const handleDownloadingCSV = () => {
    downloadCSV(dateData, columns, `RM Issue Register Report ${datee}`);
  };

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }}>
        <Col span={5}>
          <MyDatePicker size="default" setDateRange={setDatee} />
        </Col>
        <MyButton variant="search"
          style={{ marginLeft: 4 }}
          loading={loading}
          onClick={getRows}
          type="primary"
        >
          Fetch
        </MyButton>
      </Row>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <MyDataTable loading={loading} columns={columns} data={dateData} />
      </div>
    </div>
  );
}

export default R27;
