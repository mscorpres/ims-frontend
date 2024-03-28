import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  Space,
  Button,
  Switch,
  Table,
  Pagination,
  Spin,
} from "antd";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import Exceljs from "exceljs";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
import MyButton from "../../../Components/MyButton";
const PartCodeConversionReport = () => {
  const wiseOptions = [
    {
      text: "Component Wise",
      value: "rm",
    },
    {
      text: "Date Wise",
      value: "date",
    },
  ];

  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [fetchConversion, SetfetchConversion] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const columns = [
    {
      title: "Serial Number",
      dataIndex: "serial_no",
      key: "serial_no",
    },
    {
      title: "Final label",
      dataIndex: "final_label",
      key: "final_label",
    },
    {
      title: "Final Part",
      dataIndex: "final_part",
      key: "final_part",
    },
    {
      title: "Final QTY",
      dataIndex: "final_qty",
      key: "final_qty",
    },
    {
      title: "UoM",
      dataIndex: "uom",
      key: "uom",
    },
    {
      title: "Transaction Date",
      dataIndex: "txn_dt",
      key: "txn_dt",
    },
    {
      title: "Transaction By",
      dataIndex: "txn_by",
      key: "txn_by",
    },
    {
      title: "Transaction Id",
      dataIndex: "txn_id",
      key: "txn_id",
    },
    {
      title: "Drop Location",
      dataIndex: "drop_location",
      key: "drop_location",
    },
  ];

  const expandedRowRender = (record) => {
    const expendedColumn = [
      {
        title: "Serial Number",
        dataIndex: "serial_no",
        key: "serial_no",
        width: "10%",
      },
      {
        title: "Consumption Part Name",
        dataIndex: "consump_part_name",
        key: "consump_part_name",
        width: "12%",
      },
      {
        title: "Consumption Part Code",
        dataIndex: "consump_part_code",
        key: "consump_part_code",
        width: "11.3%",
      },
      {
        title: "Consumption Quantity",
        dataIndex: "consump_qty",
        key: "consump_qty",
        width: "11.2%",
      },

      {
        title: "UoM",
        dataIndex: "uom",
        key: "uom",
        width: "44.5%",
      },

      {
        title: "Pick Location",
        dataIndex: "pick_location",
        key: "pick_location",
      },
    ];
    const data = record.consumption.map((consumptionItem) => ({
      serial_no: consumptionItem.serial_no,
      consump_part_name: consumptionItem.consump_part_name,
      consump_qty: consumptionItem.consump_qty,
      consump_part_code: consumptionItem.consump_part_code,
      uom: consumptionItem.uom,
      pick_location: consumptionItem.pick_location,
    }));

    return (
      <Table columns={expendedColumn} dataSource={data} pagination={false} />
    );
  };

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.key] : []);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await imsAxios.post("/conversion/fetchConversion", {
        wise: wise,
        data: searchInput,
      });

      console.log(response.data);
      if (response.data.code == 200) {
        SetfetchConversion(response.data.data);
        toast.success(response.data.status);
      } else {
        toast.error(response.data.message.msg);
        SetfetchConversion([]);
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientOptions = async (search) => {
    try {
      // setLoading("select");
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: search,
      // });
      // console.log(data);
      const response = await executeFun(
        () => getComponentOptions(search),
        "select"
      );
      const { data } = response;
      if (data && data?.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);

  const handleDownload = () => {
    const workbook = new Exceljs.Workbook();
    const sheet = workbook.addWorksheet("Part Code Conversion Report");

    // sheet.getRow(1).border ={
    //   top:{style : thick , color : {argb:''}}
    // }

    sheet.getRow(1).fill = {
      pattern: "solid",
      type: "pattern",
      fgColor: { argb: "FFCCFFCC" },
      bgColor: { argb: "FF0000" },
    };

    sheet.getRow(1).font = {
      family: 4,
      size: 12,
      bold: true,
    };

    const columns = [
      { header: "Serial Number", key: "serial_no", width: 10 },
      { header: "Final Label", key: "final_label", width: 20 },
      { header: "Final Part", key: "final_part", width: 15 },
      { header: "Final Qty", key: "final_qty", width: 10 },
      { header: "UoM", key: "uom", width: 10 },
      { header: "Transaction Date", key: "txn_dt", width: 20 },
      { header: "Transaction By", key: "txn_by", width: 20 },
      { header: "Transaction Id", key: "txn_id", width: 20 },
      { header: "Drop Location", key: "drop_location", width: 20 },
      { header: "Serial Number", key: "serial_no_consumption", width: 10 },
      { header: "Consumption Part Name", key: "consump_part_name", width: 20 },
      { header: "Consumption Part Code", key: "consump_part_code", width: 20 },
      { header: "Consumption Quantity", key: "consump_qty", width: 10 },
      { header: "Consumption UoM", key: "consump_uom", width: 10 },
      { header: "Pick Location", key: "pick_location", width: 20 },
    ];

    // Add columns to the worksheet
    sheet.columns = columns;

    // Add data to the worksheet
    fetchConversion.forEach((record) => {
      // Add a row for the main record
      const rowData = {
        serial_no: record.serial_no,
        final_label: record.final_label,
        final_part: record.final_part,
        final_qty: record.final_qty,
        uom: record.uom,
        txn_dt: record.txn_dt,
        txn_by: record.txn_by,
        txn_id: record.txn_id,
        drop_location: record.drop_location,
        serial_no_consumption: "",
        consump_part_name: "", // Empty values for consumption data
        consump_part_code: "",
        consump_qty: "",
        consump_uom: "",
        pick_location: "",
      };

      // Add consumption data to the same row
      if (record.consumption && record.consumption.length > 0) {
        record.consumption.forEach((consumptionItem, index) => {
          const consumptionKeyPrefix = index === 0 ? "" : index;
          rowData[`serial_no_consumption${consumptionKeyPrefix}`] =
            consumptionItem.serial_no;
          rowData[`consump_part_name${consumptionKeyPrefix}`] =
            consumptionItem.consump_part_name;
          rowData[`consump_part_code${consumptionKeyPrefix}`] =
            consumptionItem.consump_part_code;
          rowData[`consump_qty${consumptionKeyPrefix}`] =
            consumptionItem.consump_qty;
          rowData[`consump_uom${consumptionKeyPrefix}`] = consumptionItem.uom;
          rowData[`pick_location${consumptionKeyPrefix}`] =
            consumptionItem.pick_location;
        });
      }

      sheet.addRow(rowData);
    });

    // Save the Excel file
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "PartCodeConversionReport.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <Row
        style={{ margin: 4, padding: "1rem", paddingTop: 0 }}
        justify="space-between"
      >
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <div style={{ width: 200 }}>
                  <MySelect
                    onChange={setWise}
                    options={wiseOptions}
                    value={wise}
                    placeholder="Select Wise"
                  />
                </div>
                {wise === wiseOptions[0].value && (
                  <div style={{ width: 270 }}>
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={setSearchInput}
                      loadOptions={handleClientOptions}
                    />
                  </div>
                )}
                {wise === wiseOptions[1].value && (
                  <MyDatePicker setDateRange={setSearchInput} />
                )}

                <MyButton
                  variant="search"
                  onClick={handleSubmit}
                  // //   onClick={getRows}
                  loading={loading === "fetch"}
                  type="primary"
                >
                  Fetch
                </MyButton>
              </Space>
            </div>
          </Space>
        </Col>
        <CommonIcons
          action="downloadButton"
          type="primary"
          onClick={handleDownload}
        />
      </Row>
      <Row
        style={{ width: "92vw", marginLeft: "1.5rem", marginRight: "1.5rem" }}
      >
        <Table
          columns={columns}
          bordered="false"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: handleExpand,
          }}
          dataSource={fetchConversion.map((record, index) => ({
            ...record,
            key: index.toString(),
          }))}
          size="small"
          pagination={{
            pageSize: 50,
          }}
          scroll={{
            y: 550,
          }}
          loading={loading}
        />
      </Row>
    </>
  );
};

export default PartCodeConversionReport;
