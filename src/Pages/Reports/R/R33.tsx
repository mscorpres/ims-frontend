import React, { useEffect, useState } from "react";
import { Card, Col, Form, Row, Space } from "antd";
import { R33Type } from "@/types/reports";

import MyButton from "@/Components/MyButton";
import MyDataTable from "@/Components/MyDataTable";
import useApi from "@/hooks/useApi";
import ToolTipEllipses from "@/Components/ToolTipEllipses";
import { getR33 } from "@/api/reports/inventoryReport";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";
import { downloadCSV } from "@/Components/exportToCSV";
import MySelect from "@/Components/MySelect";
import MyDatePicker from "@/Components/MyDatePicker";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
import { getDepartmentOptions } from "@/api/master/department";
import { SelectOptionType } from "@/types/general";
import { getProductsOptions } from "@/api/general";

const wiseOptions = [
  {
    text: "Product Wise",
    value: "product",
  },
  {
    text: "Department Wise",
    value: "department",
  },
  {
    text: "Consolidated",
    value: "consolidated",
  },
];

function R33() {
  const [rows, setRows] = useState<R33Type[]>([]);
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const date = Form.useWatch("date", form);
  const wise = Form.useWatch("wise", form);

  const handleFetchRows = async () => {
    const values = await form.validateFields();

    const response = await executeFun(
      () => getR33(values.date, values.wise, values.data),
      "fetch"
    );

    setRows(response.data ?? []);
  };

  const handleFetchDepartmentOptions = async (search: string) => {
    const response = await executeFun(
      () => getDepartmentOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const handleFetchProductOptions = async (search: string) => {
    const response = await executeFun(
      () => getProductsOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };
  useEffect(() => {
    setRows([]);
    form.setFieldValue("data", "");
  }, [wise]);

  return (
    <Row style={{ height: "95%", padding: 10 }} gutter={6}>
      <Col span={4}>
        <Card size="small">
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item name="wise" label="Wise">
              <MySelect options={wiseOptions} />
            </Form.Item>
            {wise !== "consolidated" && (
              <Form.Item
                label={wise === "product" ? "Product" : "Department"}
                name="data"
              >
                <MyAsyncSelect
                  loadOptions={(search) =>
                    wise === "department"
                      ? handleFetchDepartmentOptions(search)
                      : handleFetchProductOptions(search)
                  }
                  selectLoading={loading("select")}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                />
              </Form.Item>
            )}
            <Form.Item name="date" label="Date">
              <MyDatePicker
                setDateRange={(value) => form.setFieldValue("date", value)}
              />
            </Form.Item>
            <Row justify="end">
              <Space>
                <CommonIcons
                  action="downloadButton"
                  disabled={rows.length === 0}
                  onClick={() =>
                    downloadCSV(
                      rows,
                      wise === "singleDate" ? singleColumns : rangeColumns,
                      "R33 Report",
                      [
                        {
                          id: "Selected Date",
                          department: date,
                        },
                      ]
                    )
                  }
                />
                <MyButton
                  onClick={handleFetchRows}
                  loading={loading("fetch")}
                  variant="search"
                  text="Fetch"
                />
              </Space>
            </Row>
          </Form>
        </Card>
      </Col>
      <Col span={20}>
        <MyDataTable
          columns={wise === "consolidated" ? rangeColumns : singleColumns}
          data={rows}
        />
      </Col>
    </Row>
  );
}

export default R33;

const singleColumns = [
  {
    headerName: "#",
    field: "id",
    width: 40,
  },
  {
    headerName: " Date",
    field: "date",
    width: 100,
  },
  {
    headerName: " Shift Start",
    field: "shiftStart",
    width: 140,
  },
  {
    headerName: "Shift End",
    field: "shiftEnd",
    width: 140,
  },
  {
    headerName: " Department",
    field: "department",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.department} />
    ),
    width: 150,
  },

  {
    headerName: "SKU",
    field: "sku",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
    width: 100,
  },
  {
    headerName: "Product",
    field: "product",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.product} />
    ),
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "UoM",
    field: "uom",
    width: 70,
  },
  {
    headerName: " Manpower",
    field: "manPower",
    width: 110,
  },

  {
    headerName: "No Of Lines",
    field: "lineCount",
    width: 110,
  },
  {
    headerName: "Output",
    field: "output",
    width: 110,
  },

  {
    headerName: "Over Time",
    field: "overTime",
    width: 140,
  },
  {
    headerName: " Working Hours",
    field: "workHours",
    width: 150,
  },
  {
    headerName: "Remarks.",
    field: "remarks",
    renderCell: ({ row }: { row: R33Type }) => (
      <ToolTipEllipses text={row.remarks} />
    ),
    width: 220,
  },
];

const rangeColumns = [
  {
    headerName: "#",
    field: "id",
    width: 40,
  },

  {
    headerName: " Department",
    field: "department",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.department} />
    ),
    width: 150,
  },

  {
    headerName: "SKU",
    field: "sku",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.sku} copy={true} />
    ),
    width: 100,
  },
  {
    headerName: "Product",
    field: "product",
    renderCell: ({ row }: { row: R34Type }) => (
      <ToolTipEllipses text={row.product} />
    ),
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "UoM",
    field: "uom",
    width: 70,
  },
  {
    headerName: " Manpower",
    field: "manPower",
    width: 110,
  },

  {
    headerName: "No Of Lines",
    field: "lineCount",
    width: 110,
  },
  {
    headerName: "Output",
    field: "output",
    width: 110,
  },

  {
    headerName: "Over Time",
    field: "overTime",
    width: 140,
  },
  {
    headerName: " Working Hours",
    field: "workHours",
    width: 150,
  },
  // {
  //   headerName: "Remarks.",
  //   field: "remarks",
  //   renderCell: ({ row }: { row: R34Type }) => (
  //     <ToolTipEllipses text={row.remarks} />
  //   ),
  //   width: 220,
  // },
];

const initialValues = {
  wise: "product",
};
