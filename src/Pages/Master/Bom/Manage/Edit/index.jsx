import { useState } from "react";
import { Card, Col, Divider, Drawer, Form, Input, Row, Typography } from "antd";
import { imsAxios } from "../../../../../axiosInterceptor";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import MySelect from "../../../../../Components/MySelect";
import MyDataTable from "../../../../../Components/MyDataTable";
import FormTable from "../../../../../Components/FormTable";
import { useEffect } from "react";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import Loading from "../../../../../Components/Loading";
import { v4 } from "uuid";
import {
  getComponentOptions,
  getVendorOptions,
} from "../../../../../api/general";

import useApi from "../../../../../hooks/useApi";
import { convertSelectOptions } from "../../../../../utils/general";
const EditModal = ({ show, close, bomType }) => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState({});
  const { executeFun, loading: loading1 } = useApi();
  const getDetails = async (id) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/bom/fetchProductInBom", {
        subject_id: id,
      });
      await getRows(id);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const detailsObj = {
            product: data.data.product,
            partCode: data.data.sfg_inward_rm_code,
            sfgName: data.data.sfg_inward_rm_name,
            sku: data.data.sku,
            bom: data.data.subject,
            bomId: data.data.subjectid,
          };

          setDetails(detailsObj);
        }
      }
    } catch (error) {
      console.log("some error occured while fetching rows or details", error);
    } finally {
      setLoading(false);
    }
  };
  const inputHandler = (name, value, id) => {
    setRows((curr) =>
      curr.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            [name]: value,
          };
        } else {
          return row;
        }
      })
    );
  };
  const submitHandler = async (row) => {
    const finalObj = {
      component_id: row.new ? row.newComponent.value : row.id,
      qty: row.qty,
      category: row.category,
      status: row.status,
      subject_id: show.id,
      sku: details.sku, //from details
      priority: row?.priority ?? 1,
      smt_mi_loc: row.loc ?? "--",
      process: row.process ?? "--",
      comp_source: row.source ?? "--",
      vendor: row.vendor?.value ?? "--",
    };

    setLoading(row.id);
    const response = await imsAxios.post("/bom/updateBomComponent", finalObj);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        if (row.new) {
          setRows((curr) =>
            curr.map((comp) => {
              if (comp.id === row.id) {
                return {
                  ...comp,
                  id: data.data.component_key,
                  componentName: data.data.component_name,
                  partCode: data.data.component_part,
                  new: false,
                };
              } else {
                return comp;
              }
            })
          );
        }
        toast.success(data.message);
      } else {
        toast.error(data.message.msg);
      }
    }
    setLoading(false);
  };
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const getRows = async (id) => {
    try {
      setRows([]);
      const response = await imsAxios.post(
        "/bom/fetchComponentsInBomForUpdate",
        {
          subject_id: id,
        }
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            id: row.compKey,
            componentName: row.component,
            partCode: row.partcode,
            priority: row.priority,
            category: row.category,
            status: row.bomstatus,
            qty: row.requiredQty,
            uom: row.unit,
            vendor: row.vendor,
            process: row.process,
            source: row.comp_source,
            loc: row.smt_mi_loc,
          }));

          setRows(arr);
        }
      }
    } catch (error) {
      console.log("error while fetching bom components", error);
    } finally {
      setLoading(false);
    }
  };
  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setLoading(false);
    const { data } = response;
    const arr = data.map((row) => {
      return {
        text: row.text,
        value: row.id,
      };
    });
    setAsyncOptions(arr);
  };
  const addRow = () => {
    const newRow = {
      id: v4(),
      componentName: "",
      partCode: "",
      priority: "1",
      category: "P",
      status: "A",
      qty: "",
      uom: "",
      vendor: "",
      process: "",
      source: "",
      loc: "",
      new: true,
    };
    setRows((curr) => [newRow, ...curr]);
  };
  const removeRow = (id) => {
    setRows((curr) => curr.filter((row) => row.id !== id));
  };
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRow} />,
      width: 30,
      // flex: 1,
      renderCell: ({ row }) =>
        row.new && (
          <CommonIcons action="removeRow" onClick={() => removeRow(row.id)} />
        ),
    },
    {
      headerName: "Component",
      width: 150,
      // flex: 1,
      renderCell: ({ row }) =>
        row.new ? (
          <MyAsyncSelect
            onBlur={() => setAsyncOptions([])}
            selectLoading={loading1("select")}
            loadOptions={getComponentOption}
            optionsState={asyncOptions}
            labelInValue
            value={row.newComponent}
            onChange={(value) => inputHandler("newComponent", value, row.id)}
          />
        ) : (
          <ToolTipEllipses text={row.componentName} />
        ),
    },
    {
      headerName: "Part Code",
      width: 100,
      // flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
    },
    {
      headerName: "Status",
      width: 120,
      renderCell: ({ row }) => (
        <MySelect
          value={row.status}
          options={statusOptions}
          onChange={(value) => inputHandler("status", value, row.id)}
        />
      ),
    },
    {
      headerName: "Priority",
      width: 100,
      renderCell: ({ row }) => (
        <Input
          value={row.priority}
          onChange={(e) => inputHandler("priority", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Qty",
      width: 100,
      renderCell: ({ row }) => (
        <Input
          value={row.qty}
          onChange={(e) => inputHandler("qty", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Category",
      width: 150,
      renderCell: ({ row }) => (
        <MySelect
          options={categoryOptions}
          value={row.category}
          onChange={(value) => inputHandler("category", value, row.id)}
        />
      ),
    },
    {
      headerName: "Vendor",
      width: 200,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          onBlur={() => setAsyncOptions([])}
          selectLoading={loading1("select")}
          loadOptions={getVendorOption}
          optionsState={asyncOptions}
          labelInValue
          value={row.vendor}
          onChange={(value) => inputHandler("vendor", value, row.id)}
        />
      ),
    },
    {
      headerName: "Process",
      width: 100,
      renderCell: ({ row }) => (
        <MySelect
          options={processOptions}
          value={row.process}
          onChange={(value) => inputHandler("process", value, row.id)}
        />
      ),
    },
    {
      headerName: "Source",
      width: 150,
      renderCell: ({ row }) => (
        <MySelect
          options={sourceOptions}
          value={row.source}
          onChange={(value) => inputHandler("source", value, row.id)}
        />
      ),
    },
    {
      headerName: "SMT/MI Loc",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.loc}
          onChange={(e) => inputHandler("loc", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "",
      width: 30,
      renderCell: ({ row }) => (
        <CommonIcons
          onClick={() => submitHandler(row)}
          action="checkButton"
          size="small"
          loading={loading === row.id}
        />
      ),
    },
  ];

  useEffect(() => {
    if (show) {
      getDetails(show.id);
    }
  }, [show]);
  return (
    <Drawer
      width="100%"
      title={`Editing ${show?.name} | ${rows.length} Components`}
      onClose={close}
      open={show}
      bodyStyle={{
        padding: 5,
      }}
    >
      <Row style={{ height: "98%" }} gutter={6}>
        {loading === "fetch" && <Loading />}
        <Col span={4}>
          <SummaryCard bomType={bomType} details={details} />
        </Col>
        <Col span={20} style={{ overflowY: "auto", height: "100%" }}>
          <FormTable columns={columns} data={rows} />
        </Col>
      </Row>
    </Drawer>
  );
};

export default EditModal;

const statusOptions = [
  { text: "ACTIVE", value: "A" },
  // { text: "ALTERNATE", value: "ALT" },
  { text: "INACTIVE", value: "I" },
];
const categoryOptions = [
  { text: "Part", value: "P" },
  { text: "Packing", value: "PCK" },
  { text: "Other", value: "O" },
  { text: "PCB", value: "PCB" },
];
const processOptions = [
  { text: "MI", value: "MI" },
  { text: "SMT", value: "SMT" },
  { text: "FA", value: "FA" },
];
const sourceOptions = [
  { text: "IMPORT", value: "IMPORT" },
  { text: "DOMESTIC", value: "DOMESTIC" },
];

const SummaryCard = ({ details, bomType }) => {
  return (
    <Card size="small" title="Summary">
      <Row>
        <Col span={24}>
          <Typography.Text strong>Product</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text>{details.product}</Typography.Text>
        </Col>
        <Divider style={{ margin: 7 }} />
        {bomType === "sfg" && (
          <>
            {" "}
            <Col span={24}>
              <Typography.Text strong>SFG Code</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.partCode}</Typography.Text>
            </Col>
            <Divider style={{ margin: 7 }} />
          </>
        )}
        {bomType === "sfg" && (
          <>
            <Col span={24}>
              <Typography.Text strong>SFG</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.sfgName}</Typography.Text>
            </Col>
            <Divider style={{ margin: 7 }} />
          </>
        )}

        <Col span={24}>
          <Typography.Text strong>SKU</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text>{details.sku}</Typography.Text>
        </Col>
        <Divider style={{ margin: 7 }} />
        <Col span={24}>
          <Typography.Text strong>BOM</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text>{details.bom}</Typography.Text>
        </Col>
      </Row>
    </Card>
  );
};
