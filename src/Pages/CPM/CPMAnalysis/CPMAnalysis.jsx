import React, { useEffect, useState } from "react";
import { Button, Input, Space, Table, Row, Col, Select, Tooltip } from "antd";
import { toast } from "react-toastify";
import { downloadCSVAntTable } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { InfoCircleFilled } from "@ant-design/icons";
import { getProjectOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";

export default function CPMAnalysis() {
  const [fileInfo, setFileInfo] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectLoading, setSelectLoaidng] = useState(false);
  const [nestedTableLoading, setNestedTableLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateData, setDateData] = useState([]);
  const [dataa, setData] = useState({
    dateValue: "",
  });

  const { executeFun, loading } = useApi();
  const opt = [
    { label: "PACKING", value: "P" },
    { label: "PART", value: "PART" },
    { label: "OTHER", value: "O" },
    { label: "PCB", value: "PCB" },
  ];
  const getRows = async () => {
    setSearchLoading(true);
    // setDetail([]);
    const { data } = await imsAxios.post("/ppr/fetch_finalProjectBomReport", {
      // date: dataa?.dateValue,
      project: projectId,
    });
    setSearchLoading(false);
    if (data.code == 200) {
      setDetail(data);

      let arr = data.data.map((row) => ({
        ...row,
        uniqueKey: row.key,
        leftQty: "--",
        requirement: Number(row.requirement)?.toLocaleString("hi-IN"),
        order_qty: Number(row.order_qty)?.toLocaleString("hi-IN"),
        inward_qty: Number(row.inward_qty)?.toLocaleString("hi-IN"),
        pending_qty: Number(row.pending_qty)?.toLocaleString("hi-IN"),
        branch_stock: Number(row.branch_stock)
          ? Number(row.branch_stock)?.toLocaleString("hi-IN")
          : Number(row.branch_stock),
        pending_reqqty: Number(row.pending_reqqty)
          ? Number(row.pending_reqqty)?.toLocaleString("hi-IN")
          : Number(row.pending_reqqty),
        over_st_qty: Number(row.over_st_qty)
          ? Number(row.over_st_qty)?.toLocaleString("hi-IN")
          : Number(row.over_st_qty),
        sfFloor: Number(row.sf_stock)?.toLocaleString("hi-IN") ?? 0,
        debit_qty: Number(row.dnQty)?.toLocaleString("hi-IN") ?? 0,
      }));
      arr[0] = { ...arr[0], date: search.date };
      setRows(arr);
      setFilteredRows(arr);
    } else {
      setRows([]);
      toast.error(data.message.msg);
    }
  };

  const columns = [
    // {
    //   title: "Sr. No.",
    //   dataIndex: "serial",
    //   key: "serial",
    //   width: 80,
    //   sorter: (a, b) => a.age - b.age,
    // },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          Part
        </Row>
      ),
      headerName: "Part",
      dataIndex: "part",
      key: "part",
      width: 120,
      filterSearch: true,
      filterMode: "tree",
      onFilter: (value, record) => record.name.startsWith(value),
      // sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          Name
        </Row>
      ),
      dataIndex: "name",
      headerName: "Name",
      key: "name",
      width: 300,
      filterSearch: true,
      filterMode: "tree",
      onFilter: (value, record) => record.name.startsWith(value),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          TYPE
        </Row>
      ),
      headerName: "Type",
      dataIndex: "type",
      key: "type",
      width: 150,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },

    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          BOM QTY
        </Row>
      ),
      headerName: "BOM QTY",
      dataIndex: "bomqty",
      key: "bomqty",
      width: 150,
      sorter: (a, b) => a.bomqty - b.bomqty,
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          BOM RATE
        </Row>
      ),
      headerName: "BOM RATE",
      dataIndex: "bomrate",
      key: "bomrate",
      width: 150,
      sorter: (a, b) => a.bomrate - b.bomrate,
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          UoM
        </Row>
      ),
      headerName: "UoM",
      dataIndex: "unit",
      key: "unit",
      width: 150,
      // sorter: (a, b) => a.bomqty - b.bomqty,
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          PROJECT REQUIRED QTY <br /> (A)
        </Row>
      ),
      headerName: "PROJECT REQUIRED QTY",
      dataIndex: "requirement",
      key: "requirement",
      width: 150,
      sorter: (a, b) => a.requirement.localeCompare(b.requirement),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          PO ORDERED QTY <br />
          (B)
        </Row>
      ),
      headerName: "PO ORDERED QTY",
      dataIndex: "order_qty",
      key: "order_qty",
      width: 150,
      sorter: (a, b) => a.order_qty.localeCompare(b.order_qty),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          RECIEVED PO QTY <br /> (c)
        </Row>
      ),
      headerName: "RECIEVED PO QTY",
      dataIndex: "inward_qty",
      key: "inward_qty",
      width: 150,
      sorter: (a, b) => a.inward_qty.localeCompare(b.inward_qty),
    },

    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          PENDING PO QTY <br />
          (D = B-C)
        </Row>
      ),
      headerName: "PENDING PO QTY",
      dataIndex: "pending_qty",
      key: "pending_qty",
      width: 150,
      sorter: (a, b) => a.pending_qty.localeCompare(b.pending_qty),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          STOCK IN HAND AT 2ND FLOOR <br />
          (E)
        </Row>
      ),
      headerName: "STOCK IN HAND AT 2ND FLOOR",
      dataIndex: "branch_stock",
      key: "branch_stock",
      width: 150,
      sorter: (a, b) => a.branch_stock.localeCompare(b.branch_stock),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          STOCK AT SHOP FLOOR <br /> (F)
        </Row>
      ),
      headerName: "STOCK AT SHOP FLOOR",
      dataIndex: "sfFloor",
      key: "sfFloor",
      width: 150,
      // sorter: (a, b) => a.branch_stock.localeCompare(b.sfFloor),
    },
    // {
    //   title: "PO IN TRANSIT",
    //   dataIndex: "po_transit",
    //   key: "po_transit",
    //   width: 150,
    //   sorter: (a, b) => a.po_transit.localeCompare(b.po_transit),
    // },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          PENDING REQUIRED QTY <br />
          (G)
        </Row>
      ),
      headerName: "PENDING REQUIRED QTY",
      dataIndex: "pending_reqqty",
      key: "pending_reqqty",
      width: 150,
      sorter: (a, b) => a.pending_reqqty.localeCompare(b.pending_reqqty),
    },
    {
      title: (
        <Row justify="center" style={{ width: "100%", textAlign: "center" }}>
          OVER STOCK QTY <br />
          (H = D+E+F-G)
        </Row>
      ),
      headerName: "OVER STOCK QTY",
      dataIndex: "over_st_qty",
      key: "over_st_qty",
      width: 150,
      sorter: (a, b) => a.over_st_qty.localeCompare(b.over_st_qty),
    },
    {
      title: (
        <span>
          DEBIT NOTE QTY <br />
        </span>
      ),
      headerName: "DEBIT NOTE QTY",
      dataIndex: "debit_qty",
      key: "debit_qty",
      width: 150,
      sorter: (a, b) => a.over_st_qty.localeCompare(b.over_st_qty),
    },
  ];

  const nestedColumns = [
    {
      title: "Sr. No",
      dataIndex: "index",
      key: "index",
      width: "7%",
    },
    {
      title: "Part",
      dataIndex: "part",
      key: "part",
      width: "7.5%",
    },
    {
      title: "Code",
      dataIndex: "ven_code",
      key: "ven_code",
      width: "10%",
    },
    {
      title: "Name",
      dataIndex: "ven_name",
      key: "ven_name",
      width: "27.5%",
    },
    {
      title: "PO Ord Qty",
      dataIndex: "total_ord",
      key: "total_ord",
      width: "15.5%",
    },
    {
      title: "Recv. Qty",
      dataIndex: "inward_qty",
      key: "inward_qty",
      width: "15.5%",
    },
    {
      title: "Pending Qty",
      dataIndex: "pending_qty",
      key: "pending_qty",
    },
  ];
  const getDetails = async (record) => {
    if (record.uniqueKey) {
      setNestedTableLoading(record.part);
      const { data } = await imsAxios.post("/ppr/fetch_groupProjectBomReport", {
        project: projectId,
        part: record.key,
      });
      setNestedTableLoading(false);
      record.uniqueKey = null;
      let arr = filteredRows;
      let arr1 = data.data.map((row, index) => {
        return {
          ...row,
          index: index + 1,
        };
      });
      arr = arr.map((row) => {
        if (row.part == data.data[0].part) {
          return {
            ...row,
            details: arr1,
          };
        } else {
          return row;
        }
      });
      setRows((rows) =>
        rows.map((row) => {
          if (row.part == data.data[0].part) {
            return {
              ...row,
              details: arr1,
            };
          } else {
            return row;
          }
        })
      );
      setFilteredRows(arr);
    }
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const inputHandler = (name, value) => {
    setDetail((aa) => {
      return {
        ...aa,
        [name]: value,
      };
    });
  };

  const getUpdate = async () => {
    const { data } = await imsAxios.post("/ppr/updatePPRDetail", {
      project: projectId,
      detail: detail?.detail,
    });
    if (data.code == 200) {
      toast.success(data.message.msg);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
  };

  const getDate = async () => {
    // setDateData([]);
    const { data } = await imsAxios.post("/backend/fetchProjectData", {
      search: projectId,
    });
    const arr = data.data.map((d) => {
      return { value: d.id, label: d.label };
    });
    setDateData(arr);
    setFileInfo(data.other.detail);
  };

  useEffect(() => {
    let arr = rows;
    let fil = [];
    arr = arr.map((row) => {
      if (row.part.toLowerCase().includes(filterText.toLowerCase())) {
        fil.push(row);
      } else if (row.name.toLowerCase().includes(filterText.toLowerCase())) {
        fil.push(row);
      }
    });
    setFilteredRows(fil);
  }, [filterText]);

  useEffect(() => {
    if (projectId) {
      setData({ dateValue: "" });
      getDate();
    }
  }, [projectId]);
  return (
    <div>
      <Row
        style={{ padding: "0px 10px", paddingBottom: 5 }}
        justify="space-between"
      >
        <Space>
          <div style={{ width: 250 }}>
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              optionsState={asyncOptions}
              placeholder="Project ID"
              selectLoading={loading("select")}
              loadOptions={handleFetchProjectOptions}
              onInputChange={(e) => setSearch(e)}
              onChange={(e) => setProjectId(e)}
              value={projectId}
            />
          </div>

          {/* <div style={{ width: 150 }}>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Date"
              options={dateData}
              value={dataa.dateValue}
              onChange={(e) =>
                setData((data) => {
                  return { ...data, dateValue: e };
                })
              }
            />

          </div> */}
          <Button
            type="primary"
            loading={searchLoading}
            onClick={getRows}
            id="submit"
          >
            Search
          </Button>

          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSVAntTable(
                rows,
                columns,
                `CPM Analysis project:${rows[0]?.project}`
              )
            }
            disabled={rows.length == 0}
          />
          <Tooltip
            placement="bottom"
            title={fileInfo?.length > 0 ? `Project Detail: ${fileInfo} ` : ""}
          >
            <Button
              type="primary"
              shape="circle"
              icon={<InfoCircleFilled />}
              disabled={fileInfo === ""}
            />
          </Tooltip>
          {/* <InfoCircleFilled style={{ fontSize: "30px", }} /> */}
          {/* </Button> */}
        </Space>
        <Col span={4}>
          <Input
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search part..."
          />
        </Col>
      </Row>
      <div style={{ padding: "0px 10px" }}>
        <Table
          bordered={true}
          columns={columns}
          showSorterTooltip={false}
          expandable={{
            expandedRowRender: (record) => {
              getDetails(record);
              return (
                <Table
                  bordered={true}
                  className="nested-table "
                  showSorterTooltip={false}
                  columns={nestedColumns}
                  pagination={false}
                  loading={record.part == nestedTableLoading ? true : false}
                  dataSource={
                    filteredRows.filter((row) => row.part == record.part)[0]
                      ?.details
                  }
                />
              );
            },
          }}
          scroll={{ y: "75vh" }}
          dataSource={filteredRows}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
}
