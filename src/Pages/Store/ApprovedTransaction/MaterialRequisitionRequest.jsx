import { Button, Col, Row, Space } from "antd";
import axios from "axios";
import React, { useState } from "react";
import InternalNav from "../../../Components/InternalNav";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import validateResponse from "../../../Components/validateResponse";
import { v4 } from "uuid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import { downloadCSV } from "../../../Components/exportToCSV";
import ViewMRTransaction from "./ViewMRTransaction";
import { imsAxios } from "../../../axiosInterceptor";

export default function MaterialRequisitionRequest() {
  const [searchUser, setSearchUser] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [rows, setRows] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [viewTransaction, setViewTransaction] = useState(false);
  const getUser = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/backend/fetchAllUser", { search });
    setSelectLoading(false);
    if (data) {
      let arr = data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setAsyncOptions(arr);
    }
  };
  const getRows = async () => {
    setSearchLoading(true);
    const { data } = await imsAxios.post("/transaction/viewApprovalStatus", {
      user: searchUser,
      date: searchDate,
    });
    setSearchLoading(false);
    const validatedData = validateResponse(data);
    if (validatedData) {
      let arr = validatedData.data.map((row, index) => ({
        ...row,
        id: v4(),
        index: index + 1,
      }));
      setRows(arr);
    }
  };

  const columns = [
    { headerName: "Sr. No.", field: "index", width: 80 },
    { headerName: "Req. Date.", field: "datetime", flex: 1 },
    {
      headerName: "Transaction Id",
      field: "transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction} copy={true} />
      ),
      flex: 1,
    },
    { headerName: "Total Req. RM Qty", field: "totalrm", flex: 1 },
    { headerName: "Sending Location", field: "location", flex: 1 },
    {
      headerName: "Actions",
      type: "actions",
      width: 300,
      getActions: ({ row }) => [
        <TableActions
          action="view"
          onClick={() => setViewTransaction(row.transaction)}
        />,
      ],
    },
  ];
  return (
    <div style={{ height: "90%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <ViewMRTransaction
          viewTransaction={viewTransaction}
          setViewTransaction={setViewTransaction}
        />
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MyAsyncSelect
                size="default"
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
                value={searchUser}
                onChange={(value) => setSearchUser(value)}
                loadOptions={getUser}
                optionsState={asyncOptions}
                placeholder="Select User..."
              />
            </div>
            <div style={{ width: 300 }}>
              <SingleDatePicker setDate={setSearchDate} />
            </div>
            <Button
              type="primary"
              disabled={!searchUser || !searchDate}
              loading={searchLoading}
              onClick={getRows}
              id="submit"
            >
              Search
            </Button>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() =>
                downloadCSV(rows, columns, "Material Requesition Status Report")
              }
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div style={{ height: "95%", padding: "0px 10px" }}>
        <MyDataTable loading={searchLoading} rows={rows} columns={columns} />
      </div>
    </div>
  );
}
