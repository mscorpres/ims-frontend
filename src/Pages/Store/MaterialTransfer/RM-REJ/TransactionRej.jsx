import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Button, Col, DatePicker, Row, Select } from "antd";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import MyDataTable from "../../../../Components/MyDataTable";
import MyDatePicker from "../../../../Components/MyDatePicker";
import { imsAxios } from "../../../../axiosInterceptor";
import MyButton from "../../../../Components/MyButton";

const { RangePicker } = DatePicker;

function TransactionRej() {
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "",
  });
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);
  //   console.log(allData);
  //   console.log(datee);
  // console.log(dataComesFromDateWise);

  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "part", headerName: "Part Code", width: 90 },
    { field: "cat_part", headerName: "Cat Part Code", width: 120 },
    { field: "name", headerName: "Component", width: 390 },
    { field: "out_location", headerName: "Out Location", width: 150 },
    { field: "in_location", headerName: "In Location", width: 150 },
    { field: "qty", headerName: "Qty", width: 100 },
    { field: "uom", headerName: "UoM", width: 80 },
    { field: "transaction", headerName: "Transaction In", width: 150 },
    { field: "completed_by", headerName: "Shiffed By", width: 150 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = dataComesFromDateWise;
    csvData = arr.map((row) => {
      return {
        Date: row.approvedate,
        Part: row.part,
        Component: row.name,
        "Out Location": row.out_location,
        "In Location": row.in_location,
        Qty: row.qty,
        Uom: row.uom,
        "Txd In": row.transaction,
        "Shiffed By": row.completed_by,
      };
    });
    downloadCSVCustomColumns(csvData, "Transaction Rejection");
  };

  const dataComesFromDBWhenClickButton = async () => {
    if (!allData.selectdate) {
      toast.error("Please Select date wise then proceed");
    } else if (!datee[0]) {
      toast.error("Please Select date ");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/godown/report_rm_rej", {
        data: datee,
        wise: allData.selectdate,
      });
      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDataComesFromDateWise(arr);
        // setFilterDate(data.data);
        setLoading(false);
      } else if (data.code == 500) {
        setDataComesFromDateWise([]);
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };
  return (
    <div style={{ height: "100vh" }}>
      <Row gutter={16} style={{ margin: "10px" }}>
        <Col span={4} className="gutter-row">
          <div>
            <Select
              options={options}
              style={{ width: "100%" }}
              placeholder="Select"
              value={allData.selectdate}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectdate: e };
                })
              }
            />
          </div>
        </Col>
        <Col span={5} className="gutter-row">
          <MyDatePicker size="default" setDateRange={setDatee} />
        </Col>
        <Col span={1} className="gutter-row">
          <div>
            <MyButton
              variant="search"
              onClick={dataComesFromDBWhenClickButton}
              type="primary"
              loading={loading}
            >
              Fetch
            </MyButton>
          </div>
        </Col>
        {dataComesFromDateWise.length > 0 && (
          <Col span={1} offset={12} className="gutter-row">
            <div>
              <Button
                onClick={handleDownloadingCSV}
                style={{
                  backgroundColor: "#4090FF",
                  color: "white",
                  marginLeft: "60px",
                }}
              >
                <FaDownload />
              </Button>
            </div>
          </Col>
        )}
      </Row>
      <div className="m-2" style={{ height: "100%" }}>
        <div style={{ height: "80%", margin: "10px" }}>
          <MyDataTable
            loading={loading}
            data={dataComesFromDateWise}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
export default TransactionRej;

// <form>
//   <div className="d-flex justify-content-between m-3 mt-4">
//     <div className="d-flex">
//       <div className="mr-2" style={{ width: "150px" }}>
//         <Select
//           options={options}
//           placeholder="Select"
//           value={allData.selectdate}
//           onChange={(e) =>
//             setAllData((allData) => {
//               return { ...allData, selectdate: e };
//             })
//           }
//         />
//       </div>
//       <>
//         <div>
//           <RangePicker
//             style={{
//               minHeight: "39px",
//               borderRadius: "4px",
//               width: "300px",
//             }}
//             onChange={(e) => {
//               setDatee(
//                 e.map((item) => {
//                   return moment(item).format("DD-MM-YYYY");
//                 })
//               );
//             }}
//           />
//         </div>
//         <div>
//           <button
//             className="btn btn-secondary"
//             type="button"
//             onClick={dataComesFromDBWhenClickButton}
//           >
//             Date Wise
//           </button>
//         </div>
//       </>
//     </div>
//     <div className="cursorr">
//       <FaDownload size={20} color="#5D7788" onClick={handleDownloadingCSV} />
//     </div>
//   </div>
// </form>

// <hr />

// {loading ? (
//   <div
//     style={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       height: "70vh",
//       zIndex: "999999",
//     }}
//   >
//     <Lottie animationData={waiting} loop={true} style={{ height: "200px" }} />
//   </div>
// ) : (
//   <div className="m-2">
//     <DataTable
//       fixedHeader="true"
//       fixedHeaderScrollHeight={"55vh"}
//       data={dataComesFromDateWise}
//       columns={col}
//       pagination
//       customStyles={customStyles}
//     />
//   </div>
// )}
