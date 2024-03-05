import React, { useEffect, useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { Button, Col, Collapse, Row, Typography } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import Loading from "../../../Components/Loading";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { maxHeight } from "@mui/system";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
function LedgerQuery() {
  const [component, setComponent] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectLoading, setSelectLoading] = useState(false);
  const [totalConsideredQty, setTotalConsideredQty] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const getRows = async () => {
    const response = await imsAxios.get(
      `/itemLedger?componentID=${searchInput}`
    );
    console.log("response--", response);
    if (response.status === 200) {
      const { data } = response;

      console.log("data--", data);
      let arr = data.result.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
      setTotalConsideredQty(data.totalConsideredQty);
      setTotalPrice(data.totalPrice);
      setClosingDate(data.closingDate);
    }
  };

  const getAsyncOptions = async (search) => {
    // let link = "/backend/getComponentByNameAndNo";
    // setLoading(true);
    // const { data } = await imsAxios.post(link, {
    //   search: search,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const columns = [
    {
      headerName: "S.No",
      field: "index",
      renderCell: ({ row }) => row.index,
      width: 30,
    },
    {
      headerName: "Vendor Code",
      field: "venCode",
      renderCell: ({ row }) => row.venCode,
      width: 100,
    },
    {
      headerName: "Vendor Name",
      field: "venName",
      renderCell: ({ row }) => row.venName,
      width: 200,
      flex: 1,
    },
    {
      headerName: "Effective Date",
      field: "effectiveDate",
      renderCell: ({ row }) => row.effectiveDate,
      width: 200,
      flex: 1,
    },
    {
      headerName: "Insert Date",
      field: "insertDate",
      renderCell: ({ row }) => row.insertDate,
      width: 200,
      flex: 1,
    },
    {
      headerName: "VBT No.",
      field: "vbtKey",
      renderCell: ({ row }) => row.vbtKey,
      flex: 1,
    },
    {
      headerName: "Project",
      field: "project",
      renderCell: ({ row }) => row.project,
      flex: 1,
    },
    {
      headerName: "PO ID",
      field: "poID",
      renderCell: ({ row }) => row.poID,
      flex: 1,
    },
    {
      headerName: "Min ID",
      field: "minID",
      renderCell: ({ row }) => row.minID,
      flex: 1,
    },
    {
      headerName: "Invoice No",
      field: "invoiceNo",
      renderCell: ({ row }) => row.invoiceNo,
      flex: 1,
    },
    {
      headerName: "In Rate",
      field: "inRate",
      renderCell: ({ row }) => row.inRate,
      width: 70,
    },
    {
      headerName: "In Qty",
      field: "inQty",
      renderCell: ({ row }) => row.inQty,
      width: 70,
    },
    {
      headerName: "Considered Qty",
      field: "consideredQty",
      renderCell: ({ row }) => row.consideredQty,
      width: 110,
    },
    {
      headerName: "Total Value",
      field: "totalValue",
      renderCell: ({ row }) => row.totalValue,
      width: 110,
    },
  ];
  return (
    <div
      style={{
        margin: "2px 2px",
      }}
    >
      <Row gutter={10}>
        <Col span={4}>
          <MyAsyncSelect
            placeholder="Select a Component"
            onBlur={() => setAsyncOptions([])}
            value={searchInput}
            optionsState={asyncOptions}
            selectLoading={loading1("select")}
            onChange={(value) => setSearchInput(value)}
            loadOptions={(value) => getAsyncOptions(value)}
          />
        </Col>
        <Col>
          <Button type="primary" onClick={getRows}>
            Search
          </Button>
        </Col>
        <Col span={6} style={{ marginLeft: "18px", marginTop: "5px" }}>
          <Typography.Text level={2}>Data As Per-{closingDate}</Typography.Text>
        </Col>
        <Col span={8} style={{ marginTop: "5px" }}>
          <Typography.Text style={{ margin: 0 }} level={2}>
            Total Considered Qty-{totalConsideredQty}
          </Typography.Text>
        </Col>
        <Col span={2} style={{ marginTop: "5px" }}>
          <Typography.Text style={{ margin: 0 }} level={2}>
            Total Price-{totalPrice}
          </Typography.Text>
        </Col>
      </Row>

      <Row style={{ marginTop: 15, height: "90vh" }}>
        <MyDataTable columns={columns} data={rows} />
      </Row>
    </div>
  );
}
export default LedgerQuery;
