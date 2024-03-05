import React, { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { useState } from "react";
import { Col } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { toast } from "react-toastify";

function BlockTCS() {
  const [allBlockedData, setAllBlockedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllBlockTCS = async () => {
    setLoading(true);
    const { data } = await imsAxios.get(
      "tally/tcs/list/blocked"
    );
    if (data.code == 200) {
      const arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllBlockedData(arr);
    } else {
      toast.error("Some error Occured");
    }

    setLoading(false);
  };

  const columns = [
    {
      headerName: "TCS Code",
      field: "tcsCode",
      flex: 1,
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "GL/ Code",
      field: "glCode",
      flex: 1,
    },
    {
      headerName: "Description",
      field: "desc",
      flex: 1,
    },
    {
      headerName: "Percentage",
      field: "percentage",
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span
          style={{
            border: "1px solid red",
            padding: "2px 10px",
            borderRadius: "4px",
            color: "red",
          }}
        >
          {row.status}
        </span>
      ),
      flex: 1,
    },
  ];

  useEffect(() => {
    getAllBlockTCS();
  }, []);
  return (
    <div style={{ height: "90%" }}>
      <Col
        span={24}
        style={{ height: "100%", margin: "5px" }}
      >
        <MyDataTable
          loading={loading}
          columns={columns}
          data={allBlockedData}
        />
      </Col>
    </div>
  );
}

export default BlockTCS;
