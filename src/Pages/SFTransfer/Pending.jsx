import React from "react";
import { useState, useEffect } from "react";
import { Button, Col, Form, Input, Modal, Row, Space } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyDataTable from "../../Components/MyDataTable";
import { imsAxios } from "../../axiosInterceptor";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { EyeFilled } from "@ant-design/icons";
import SFTransferDrawer from "./SFTransferDrawer";
import { toast } from "react-toastify";
function Pending() {
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [sfTransferModal, setSfTransferModal] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.post("/sfMin/sfMinTransferList", {
      date: searchInput,
    });
    // console.log("response", response);
    const { data } = response;
    if (data.code === 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        };
      });
      setRows(arr);
      setLoading(false);
    }if(data.code === 500){
      toast.error(data.message.msg)
    }
    setLoading(false);
  };
  const columns = [
    // {
    //   headerName: "k",
    //   field: "actions",
    //   width: 10,
    //   type: "actions",
    //   getActions: ({ row }) => (
    //     <GridActionsCellItem
    //       //   showInMenu
    //       //   disabled={loading}
    //       onClick={() => {
    //         // setViewReportData(row.vbt_code);
    //       }}
    //       label="View"
    //     />
    //   ),
    // },
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      field: "insert_date",
      headerName: "Registeration Date",
      flex: 1,
    },
    {
      field: "insert_by",
      headerName: "Created By",
      flex: 1,
    },

    {
      field: "trans_id",
      headerName: "Transaction Id",
      flex: 1,
    },
    {
      field: "remark",
      headerName: "Remark",
      flex: 1,
    },
    {
      headerName: "Action",
      flex: 1,
      renderCell: ({ row }) => (
        <div>
          <Button
            // icon={<DownloadOutlined />}

            onClick={() => setDrawerData(row)}
            // onClick={() => downloadFunction(row.inv, seoice)}
            type="primary"
          >
            Process
          </Button>
        </div>
      ),
    },
  ];
  return (
    <Row
      style={{
        height: "90%",
        paddingRight: 10,
        paddingLeft: 10,
      }}
    >
      <Col span={24}>
        <Row>
          <Col>
            <div style={{ paddingTop: 10, paddingBottom: 10 }}>
              <Space>
                <MyDatePicker setDateRange={setSearchInput} />

                <Button onClick={getRows} loading={loading} type="primary">
                  Fetch
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Col>
      <Col span={24} style={{ height: "95%" }}>
        <MyDataTable laoding={loading} data={rows} columns={columns} />
      </Col>
      {drawerData && (
        <SFTransferDrawer
          sfTransferModal={sfTransferModal}
          setSfTransferModal={setSfTransferModal}
          setDrawerData={setDrawerData}
          drawerData={drawerData}
        />
      )}

      {/* <ViewModal showView={showView} setShowView={setShowView} />
     
      <FinalizeModal
        getRows={getRows}
        showView={showFinalizeModal}
        setShowView={setShowFinalizeModal}
      /> */}
    </Row>
  );
}

export default Pending;
