import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { Button, Col, Input, Row, Space } from "antd";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";

export default function ManageGatePass() {
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [searchDateRange, setSearchDateRange] = useState();
  const [rows, setRows] = useState([]);
  const [searchLoading, serSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "GP ID Wise", value: "gpwise" },
    { text: "Mobile / Email Wise", value: "mobemailwise" },
  ];
  const columns = [
    {
      headerName: "Serial No.",
      field: "index",
      width: 100,
    },
    {
      headerName: "Jounral ID",
      field: "transaction_id",
      flex: 1,
    },
    {
      headerName: "To (Name)",
      field: "recipient",
      flex: 1,
    },
    {
      headerName: "Created Date/Time",
      field: "gp_reg_date",
      flex: 1,
    },
    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <TableActions
          action="print"
          onClick={() => {
            printFun(row.transaction_id);
          }}
        />,
        <TableActions
          action="download"
          onClick={() => {
            downloadFun(row.transaction_id);
          }}
        />,
      ],
    },
  ];
  const downloadFun = async (id) => {
    setLoading(true);
    let filename = `Gatepass ${id}`;
    const { data } = await imsAxios.post("/gatepass/printGP", {
      transaction: id,
    });
    setLoading(false);
    if (data.code == 200) {
      downloadFunction(data.data.buffer.data, filename);
    } else {
      toast.error(
        data.message.msg ? data.message.msg : data.message && data.message
      );
    }
  };
  const printFun = async (id) => {
    setLoading(true);
    const { data } = await imsAxios.post("/gatepass/printGP", {
      transaction: id,
    });
    setLoading(false);
    if (data.code == 200) {
      printFunction(data.data.buffer.data);
    } else {
      toast.error(
        data.message.msg ? data.message.msg : data.message && data.message
      );
    }
  };
  const getRows = async () => {
    serSearchLoading(true);
    const { data } = await imsAxios.post("/gatepass/fetchAllGP", {
      data: wise == "datewise" ? searchDateRange : searchInput,
      wise: wise,
    });
    serSearchLoading(false);
    if (data.code == 200) {
      const arr = data.response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      toast.error(
        data.message.msg ? data.message.msg : data.message && data.message
      );
    }
  };
  const additional = () => (
    <Space>
      <div style={{ width: 150 }}>
        <MySelect options={wiseOptions} onChange={setWise} value={wise} />
      </div>
      <div style={{ width: 300 }}>
        {wise === "datewise" ? (
          <div style={{ width: 300 }}>
            <MyDatePicker
              setDateRange={setSearchDateRange}
              dateRange={searchDateRange}
              value={searchDateRange}
              size="default"
            />
          </div>
        ) : wise === "gpwise" ? (
          <div style={{ width: 300 }}>
            <Input
              type="text"
              // className="form-control w-100 "
              placeholder="Enter GP ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        ) : (
          wise === "mobemailwise" && (
            <div style={{ width: 300 }}>
              <Input
                type="text"
                // className="form-control w-100 "
                placeholder="Enter Email / Phone Number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          )
        )}
      </div>
      <Button
        loading={searchLoading}
        disabled={
          wise === "datewise"
            ? searchDateRange === ""
              ? true
              : false
            : !searchInput
            ? true
            : false
        }
        type="primary"
        onClick={getRows}
        id="submit"
      >
        Search
      </Button>
      <CommonIcons
        action="downloadButton"
        onClick={() => downloadCSV(rows, columns, "GatePass Report")}
        disabled={rows.length == 0}
      />
    </Space>
  );
  return (
    <div style={{ position: "relative", height: "95%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <div style={{ width: 300 }}>
                  <MyDatePicker
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                    size="default"
                  />
                </div>
              ) : wise === "gpwise" ? (
                <div style={{ width: 300 }}>
                  <Input
                    type="text"
                    // className="form-control w-100 "
                    placeholder="Enter GP ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              ) : (
                wise === "mobemailwise" && (
                  <div style={{ width: 300 }}>
                    <Input
                      type="text"
                      // className="form-control w-100 "
                      placeholder="Enter Email / Phone Number"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                )
              )}
            </div>
            <Button
              loading={searchLoading}
              disabled={
                wise === "datewise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              type="primary"
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
              onClick={() => downloadCSV(rows, columns, "GatePass Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div
        style={{
          height: "90%",
          padding: "0px 10px",
        }}
      >
        <MyDataTable
          pagination={true}
          data={rows}
          columns={columns}
          headText="center"
          loading={loading || searchLoading}
        />
      </div>
    </div>
  );
}
