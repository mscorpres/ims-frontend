import React, { useState } from "react";
import { Button, Row, Space } from "antd";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";

export default function MaterialTransferReport({ type }) {
  const [wise, setWise] = useState("datewise");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [rows, setRows] = useState([]);

  const wiseOptions = [{ text: "Date Wise", value: "datewise" }];
  const getRows = async () => {
    let link = "";
    if (type == "sftosf") {
      link = "/godown/report_rmsf_same";
    } else if ((type = "sftorej")) {
      link = "/godown/report_sf_rej";
    }
    setSearchLoading(true);
    const { data } = await imsAxios.post(link, {
      data: searchDateRange,
      wise: wise,
    });
    setSearchLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
    }
  };
  const columns = [
    { headerName: "Sr. No.", field: "index", width: 80 },
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Part Code", field: "part", width: 80 },
    { headerName: "Cat Part Code", field: "cat_partpart", width: 80 },
    {
      headerName: "Component",
      field: "name",
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    },
    { headerName: "Out Loc.", field: "out_location", flex: 1 },
    { headerName: "In Loc.", field: "in_location", flex: 1 },
    { headerName: "Qty", field: "qty", flex: 1 },
    { headerName: "UOM", field: "uom", flex: 1 },
    { headerName: "TXN ID", field: "transaction", flex: 1 },
    { headerName: "Shifted By", field: "completed_by", flex: 1 },
    { headerName: "Remarks", field: "remark", flex: 1 },
  ];
  return (
    <div style={{ height: "90%" }}>
      <Row
        style={{ padding: "0px 10px", paddingBottom: 5 }}
        justify="space-between"
      >
        <Space>
          <div style={{ width: 200 }}>
            <MySelect
              size={"default"}
              options={wiseOptions}
              defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
              onChange={setWise}
              value={wise}
            />
          </div>
          <div style={{ width: 300 }}>
            {wise === "datewise" && (
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
            )}{" "}
          </div>
          <Button
            disabled={
              wise === "datewise" && searchDateRange === "" ? true : false
            }
            type="primary"
            loading={searchLoading}
            onClick={getRows}
            id="submit"
            // className="primary-button search-wise-btn"
          >
            Search
          </Button>
        </Space>

        <div className="right search-type">
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(
                rows,
                columns,
                `SF To ${type == "sftosf" ? "SF" : "REJ"} Report`
              )
            }
          />
        </div>
      </Row>
      <div style={{ height: "95%", padding: "0px 10px" }}>
        <MyDataTable loading={searchLoading} columns={columns} data={rows} />
      </div>
    </div>
  );
}
