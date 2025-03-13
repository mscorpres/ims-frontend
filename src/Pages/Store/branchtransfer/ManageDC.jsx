import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Input, Row, Select } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import validateResponse from "../../../Components/validateResponse";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import EditDC from "./EditDC/EditDC";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";

function ManageDC() {
  const [allData, setAlldata] = useState({
    selType: "",
    gpValue: "",
    gpInput: "",
  });
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [dateData, setDateData] = useState([]);
  const [dateData1, setDateData1] = useState([]);
  const [updatedDCId, setUpdateDCId] = useState(null);

  const opt = [
    { label: "Date Wise", value: "datewise" },
    { label: "GP ID Wise", value: "gpwise" },
  ];

  const datewiseGP = async () => {
    if (allData.selType == "") {
      toast.error("Please select type");
    } else {
      setLoading(true);

      const { data } = await imsAxios.post("/gatepass/fetchAllGatepass", {
        data: datee,
        wise: allData.selType,
      });
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDateData(arr);
        // toast(data.status);
        setLoading(false);
      } else if (data.code == 500) {
        toast(data.message);
        setLoading(false);
      }
    }
  };

  const gpWiseDataFecth = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/gatepass/fetchAllGatepass", {
      data: allData.gpInput,
      wise: allData.selType,
    });
    if (data.code == 200) {
      let arr = data.response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setDateData1(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast(data.message);
      setLoading(false);
    }
  };

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = dateData;
    csvData = arr.map((row) => {
      return {
        "Journal ID": row.transaction_id,
        "To (Name)": row.vendor_name,
        "Created Date/Time": row.insert_date,
      };
    });

    downloadCSVCustomColumns(csvData, "Manage DC Report");
  };
  const printFun = async (id) => {
    setLoading(true);
    const { data } = await imsAxios.post("/gatepass/printGatePass", {
      transaction: id,
    });
    setLoading(false);
    const validatedData = validateResponse(data);
    printFunction(validatedData.data.buffer.data);
  };
  const downloadFun = async (id) => {
    setLoading(true);
    const { data } = await imsAxios.post("/gatepass/printGatePass", {
      transaction: id,
    });
    setLoading(false);
    const validatedData = validateResponse(data);
    let filename = id;
    downloadFunction(validatedData.data.buffer.data, filename);
  };
  const columns = [
    {
      field: "transaction_id",
      headerName: "Journal ID",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction_id} copy={true} />
      ),
    },
    { field: "vendor_name", headerName: "To (Name)", width: 500 },
    { field: "insert_date", headerName: "Created Date/Time", width: 200 },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        <TableActions
          action="edit"
          onClick={() => setUpdateDCId(row.transaction_id)}
        />,
        <TableActions
          action="download"
          onClick={() => downloadFun(row.transaction_id)}
        />,
        <TableActions
          action="print"
          onClick={() => printFun(row.transaction_id)}
        />,
      ],
    },
  ];
  return (
    <div style={{ height: "90%" }}>
      <EditDC updatedDCId={updatedDCId} setUpdateDCId={setUpdateDCId} />
      <Row gutter={16} style={{ padding: "0px 10px", paddingBottom: 5 }}>
        <Col span={4}>
          <div>
            <Select
              style={{ width: "100%" }}
              options={opt}
              placeholder="Please Select Option"
              value={allData.selType.value}
              onChange={(e) =>
                setAlldata((allData) => {
                  return { ...allData, selType: e };
                })
              }
            />
          </div>
        </Col>
        {allData.selType == "datewise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2} className="gutter-row">
              <Button type="primary" onClick={datewiseGP}>
                Fetch
              </Button>
            </Col>
            {dateData.length > 0 && (
              <Col span={1} offset={11} className="gutter-row">
                <Button onClick={handleDownloadingCSV}>
                  <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
                </Button>
              </Col>
            )}
          </>
        ) : allData.selType == "gpwise" ? (
          <>
            <Col span={5} className="gutter-row">
              <div>
                <div>
                  <Input
                    style={{ width: "100%" }}
                    placeholder="Enter Gp ID"
                    value={allData.gpInput}
                    onChange={(e) =>
                      setAlldata((allData) => {
                        return { ...allData, gpInput: e.target.value };
                      })
                    }
                  />
                </div>
              </div>
            </Col>
            <Col span={2} className="gutter-row">
              <Button type="primary" onClick={gpWiseDataFecth}>
                Fetch
              </Button>
            </Col>
          </>
        ) : (
          <>
            <Col span={5} className="gutter-row">
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2} className="gutter-row">
              <Button type="primary" onClick={datewiseGP}>
                Fetch
              </Button>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "95%", margin: "10px" }}>
        {allData.selType == "datewise" ? (
          <MyDataTable loading={loading} data={dateData} columns={columns} />
        ) : (
          <MyDataTable loading={loading} data={dateData1} columns={columns} />
        )}
      </div>
    </div>
  );
}

export default ManageDC;
