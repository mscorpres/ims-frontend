import React, { useEffect, useState } from "react";
import AddBilling from "./Modal/AddBilling";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { Row, Space } from "antd";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../axiosInterceptor";

const BillingAddress = () => {
  const [dataa, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [search, setSearch] = useState("");
  const [ShowAddBillingModal, setShowAddBillingModal] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/billingAddress/getAll");
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setData(arr);
    setLoading(false);
  };

  const columns = [
    { field: "label", headerName: "Label", flex: 1 },
    { field: "company", headerName: "Company", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "pan", headerName: "PAN No.", flex: 1 },
    { field: "gst", headerName: "GSN", flex: 1 },
    { field: "cin", headerName: "CIN", flex: 1 },
    { field: "insert_dt", headerName: "Register Date", flex: 1 },
  ];

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const res = dataa.filter((a) => {
      return a.company.toLowerCase().match(search.toLowerCase());
    });
    setFilterData(res);
  }, [search]);

  return (
    <div style={{ height: "90%" }}>
      <Row justify="end" style={{ padding: "0px 10px", paddingBottom: 5 }}>
        <Space>
          <CommonIcons
            action="addButton"
            onClick={() => setShowAddBillingModal(true)}
          />
          {/* <Button type="primary" onClick={() => setShowAddBillingModal(true)}>
            Add Billing Address
          </Button> */}
        </Space>
      </Row>
      <div style={{ height: "90%", padding: "0 10px" }}>
        <MyDataTable loading={loading} data={dataa} columns={columns} />
      </div>

      <AddBilling
        setShowAddBillingModal={setShowAddBillingModal}
        ShowAddBillingModal={ShowAddBillingModal}
        fetchLocation={fetchLocation}
      />
    </div>
  );
};

export default BillingAddress;
