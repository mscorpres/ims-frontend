import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Input, Row, Space } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import socket from "../../../Components/socket";
import { useSelector } from "react-redux/es/exports";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";
import { GridActionsCellItem } from "@mui/x-data-grid";
import useApi from "../../../hooks/useApi";
import { downloadAttachement } from "../../../api/store/material-in";

const TransactionIn = () => {
  const [wise, setWise] = useState("M");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.login);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Date Wise", value: "M" },
    { text: "PO Wise", value: "P" },
  ];
  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/transaction/transactionIn", {
      data: searchInput,
      min_types: wise,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          index: index + 1,
          id: v4(),
          ...row,
        }));
        setRows(arr);
      } else {
        toast.error(data.message.msg);
        setRows([]);
      }
    }
  };

  const handleDownloadAttachement = async (transactionId) => {
    const response = await executeFun(
      () => downloadAttachement(transactionId),
      "download"
    );
    if (response.success) {
      window.open(response.data.url, "_blank", "noreferrer");
    }
  };
  const columns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // Upload DOC Icon
        <GridActionsCellItem
          showInMenu
          onClick={() => handleDownloadAttachement(row.TRANSACTION)}
          // disabled={disabled}
          label="Download Attachement"
          // disabled={row.approval_status == "C"}
        />,
      ],
    },
    { headerName: "Sr. No", field: "index", width: 80 },
    {
      headerName: "Date",
      field: "DATE",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row.DATE} />,
    },
    { headerName: "Transaction Type", field: "TYPE", width: 120 },
    { headerName: "Part No.", field: "PART", width: 100 },
    { headerName: "Cat Part Code", field: "PART_NEW", width: 100 },
    {
      headerName: "Component",
      field: "COMPONENT",
      minWidth: 200,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.COMPONENT} />,
    },
    { headerName: "In Location", field: "LOCATION", width: 120 },
    { headerName: "Rate", field: "RATE", width: 100 },
    { headerName: "Currency", field: "CURRENCY", width: 100 },
    { headerName: "In Qty", field: "INQTY", width: 120 },
    {
      headerName: "Vendor",
      field: "VENDOR",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.VENDOR} />,
    },
    {
      headerName: "Doc Id",
      field: "INVOICENUMBER",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.INVOICENUMBER} />,
    },
    { headerName: "Transaction Id", field: "TRANSACTION", width: 150 },
    { headerName: "Cost Center", field: "COSTCENTER", width: 150 },
    { headerName: "By", field: "ISSUEBY", width: 120 },
  ];
  const handleDownloadingCSV = () => {
    let newId = v4();

    socket.emit("trans_in", {
      otherdata: JSON.stringify({
        date: searchInput,
        branch: user.company_branch,
        wise: wise,
      }),
      notificationId: newId,
    });
  };
  const handleSimmpleDownloadingCSV = () => {
    downloadCSV(rows, columns, "MIN Register Report");
  };
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{ height: "90%", padding: "5px", paddingTop: 0 }}>
      <Row justify="space-between">
        <Space>
          <div style={{ width: 150 }}>
            <MySelect
              options={wiseOptions}
              defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
              onChange={setWise}
              value={wise}
            />
          </div>
          <div style={{ width: 300 }}>
            {wise === "M" && (
              <MyDatePicker
                size="default"
                setDateRange={setSearchInput}
                dateRange={searchInput}
                value={searchInput}
              />
            )}
            {wise === "P" && (
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            )}
          </div>
          <MyButton
            variant="search"
            onClick={getRows}
            type="primary"
            loading={loading === "fetch"}
            disabled={wise === "" || searchInput === ""}
          >
            Fetch
          </MyButton>
        </Space>
        <Space>
          <CommonIcons
            tooltip="Download Detailed Report"
            onClick={handleDownloadingCSV}
            action="downloadButton"
          />
          <CommonIcons
            tooltip="Download Brief Report"
            type="secondary"
            onClick={handleSimmpleDownloadingCSV}
            action="downloadButton"
          />
        </Space>
      </Row>
      <div style={{ height: "95%", paddingTop: 5 }}>
        <MyDataTable
          loading={loading === "fetch" || loading1("download")}
          rows={rows}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default TransactionIn;
