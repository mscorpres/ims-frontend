import { useEffect, useState } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { Card, Col, Row, Tabs } from "antd";
import EditLedger from "./EditLedger";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MapClient from "./MapClient";
import AddLedger from "./AddLedger";
import MapVendor from "./MapVendor";
import { imsAxios } from "../../../axiosInterceptor";

export default function CreateMaster() {
  const [ledgerList, setLedgerList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const columns = [
    {
      headerName: "#",
      field: "index",
      width: 30,
    },
    {
      headerName: "Name",
      field: "ladgerName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ladgerName} />,
      width: 200,
    },
    {
      headerName: "Code",
      field: "ladgerCode",
      width: 120,
    },
    {
      headerName: "Search Name",
      field: "searchName",
      width: 150,
    },
    {
      headerName: "Group Name",
      field: "subGroup",
      renderCell: ({ row }) => <ToolTipEllipses text={row.subGroup} />,
      width: 200,
    },
    {
      headerName: "GST Applicable",
      field: "gst",
    },
    {
      headerName: "TDS Applicable",
      field: "tds",
    },
    {
      headerName: "Account Status",
      field: "accountStatus",
      width: 150,
    },
  ];
  const getLedgerList = async () => {
    setLedgerList([]);
    setTableLoading(true);
    const response = await imsAxios.get("/tally/ledger/listAllLedger");
    setTableLoading(false);
    const { data } = response;
    if (data) {
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });

      setLedgerList(arr);
    }
  };

  const options = [
    { text: "YES", value: "yes" },
    { text: "NO", value: "no" },
  ];
  const statusOptions = [
    { text: "ACTIVE", value: "active" },
    { text: "INACTIVE", value: "inactive" },
  ];

  useEffect(() => {
    getLedgerList();
  }, []);
  return (
    <div style={{ height: "90%" }}>
      <Row gutter={8} style={{ height: "100%", padding: "0px 10px" }}>
        <Col span={12}>
          <Tabs type="card" size="small">
            {/* add ledger */}
            <Tabs.TabPane tab="Add new Ledger" key="1">
              <AddLedger
                getLedgerList={getLedgerList}
                options={options}
                statusOptions={statusOptions}
              />
            </Tabs.TabPane>
            {/*edit ledger  */}
            <Tabs.TabPane tab="Edit Ledger" key="2">
              <Card title="Edit Ledger" size="small">
                <EditLedger getLedgerList={getLedgerList} />
              </Card>
            </Tabs.TabPane>
            {/* map vendor */}
            <Tabs.TabPane tab="Map Vendor" key="3">
              <MapVendor statusOptions={statusOptions} options={options} />
            </Tabs.TabPane>
            {/* map customer */}
            <Tabs.TabPane tab="Map Customer" key="4">
              <MapClient />
            </Tabs.TabPane>
          </Tabs>
        </Col>
        {/* add form column ends */}
        <Col style={{ padding: "10px 0px", height: "95%" }} span={12}>
          <Row justify="end" style={{ marginBottom: 10 }}>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(ledgerList, columns, "Ledgers")}
            />
          </Row>
          <MyDataTable
            loading={tableLoading}
            columns={columns}
            data={ledgerList}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Col>
      </Row>
    </div>
  );
}
