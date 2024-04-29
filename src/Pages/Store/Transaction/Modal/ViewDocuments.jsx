import { Col, Input, Row } from "antd";
import React, { useState } from "react";
import MySelect from "../../../../Components/MySelect";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { downloadAttachement } from "../../../../api/store/material-in";
import { downloadFromLink } from "../../../../utils/general";
import useApi from "../../../../hooks/useApi.ts";

function ViewDocuments() {
  const [minId, setMinId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { executeFun } = useApi();
  const getData = async () => {
    setLoading(true);
    const response = await imsAxios.post("/backend/documents", {
      id: minId,
    });
    console.log("response", response);
    let { data } = response;
    if (response.success) {
      let arr = data.map((r, id) => {
        return {
          ...r,
          id: id + 1,
        };
      });
      console.log("arr", arr);
      setRows(arr);
      setLoading(false);
    }
  };
  const handleDownloadAttachement = async (transactionId) => {
    const response = await executeFun(
      () => downloadAttachement(transactionId),
      "download"
    );
    if (response.success) {
      downloadFromLink(response.data.url);
      // window.open(response.data.url, "_blank", "noreferrer");
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
          onClick={() => handleDownloadAttachement(row.txnID)}
          //   disabled={row.invoiceStatus == false}
          label="Download Attachement"
          // disabled={row.approval_status == "C"}
        />,
      ],
    },
    {
      headerName: "#",
      field: "id",
      width: 30,
    },
    {
      headerName: "Document Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "Date",
      field: "date",
      flex: 1,
    },
    {
      headerName: "Transaction Id",
      field: "txnID",
      flex: 1,
    },
    {
      headerName: "Uploaded By",
      field: "by",
      flex: 1,
    },
  ];

  return (
    <div style={{ height: "95%" }}>
      <Row style={{ padding: "2px 10px" }} gutter={[10]}>
        {/* <Col 
          style={{ overflowY: "auto", height: "100%", paddingBottom: 50 }}
          span={24}
        > */}

        <Col span={4}>
          <Input
            // label="search Id"
            placeholder="Search Id"
            onChange={(e) => setMinId(e.target.value)}
          />
        </Col>
        <MyButton
          variant="search"
          onClick={getData}
          loading={loading}
        ></MyButton>
        {/* </Col> */}
      </Row>
      <div style={{ height: "90%", padding: "0px 10px" }}>
        <MyDataTable columns={columns} data={rows} loading={loading} />
      </div>
    </div>
  );
}

export default ViewDocuments;
const options = [{ text: "MIN Wise", value: "L" }];
