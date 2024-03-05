import { useState, useEffect } from "react";
import {
  Card,
  Col,
  Drawer,
  Row,
  Space,
  Input,
  Select,
  Button,
  Skeleton,
  Popconfirm,
  Form,
} from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import FormTable from "../../../Components/FormTable";
import useLoading from "../../../hooks/useLoading";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
export default function JwInwordModal({
  editModal,
  setEditModal,
  fetchDatewise,
  fetchJWwise,
  fetchSKUwise,
  fetchVendorwise,
}) {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locValue, setLocValue] = useState([]);
  const [header, setHeaderData] = useState([]);
  const [modalLoad, setModalLoad] = useLoading();
  const [modalUploadLoad, setModalUploadLoad] = useState(false);
  const { all, row } = editModal;
  const [mainData, setMainData] = useState([]);
  const [eWayBill, setEWayBill] = useState("");
  // console.log(mainData);
  const { executeFun, loading: loading1 } = useApi();
  const getFetchData = async () => {
    setModalLoad("fetch", true);
    const { data } = await imsAxios.post(
      "/jobwork/fetch_jw_sf_inward_components",
      {
        skucode: row.sku,
        transaction: row.transaction_id,
      }
    );
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          component: { label: row.componentname, value: row.componentKey },
        };
      });
      setMainData(arr);
      setHeaderData(data.header);
      setModalLoad("fetch", false);
    }
  };
  const getOption = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(() => getComponentOptions(e), "select");
      //     setLoading("select", false);
      //     const { data } = response;
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const getLocation = async (e) => {
    const { data } = await imsAxios.get("/backend/jw_sf_inward_location");
    let arr = [];
    arr = data.data.map((d) => {
      return { label: d.text, value: d.id };
    });
    setLocValue(arr);
  };

  const inputHandler = async (name, id, value) => {
    if (name == "component") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, component: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "orderqty") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, orderqty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "rate") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, rate: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "invoice") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, invoice: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "remark") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, remark: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "location") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, location: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const columns = [
    {
      field: "componentname",
      headerName: "Part Name",
      width: 320,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          style={{ width: "100%" }}
          onBlur={() => setAsyncOptions([])}
          loadOptions={getOption}
          value={row.component}
          optionsState={asyncOptions}
          onChange={(e) => inputHandler("component", row.id, e)}
          placeholder="Part/Name"
          selectLoading={loading1("select")}
        />
      ),
    },
    {
      field: "orderqty",
      headerName: "Quantity",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          suffix={row.unitsname}
          value={row.orderqty}
          placeholder="Qty"
          onChange={(e) => inputHandler("orderqty", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          //  value={row.orderqty}
          placeholder="Qty"
          onChange={(e) => inputHandler("rate", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "value",
      headerName: "Value",
      width: 120,
      renderCell: ({ row }) => (
        <Input
          disabled
          value={row.orderqty * row.rate ? row.orderqty * row.rate : "--"}
          placeholder="Value"
          onChange={(e) => inputHandler("value", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "invoice",
      headerName: "Invoice Id",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          //  value={row.orderqty}
          placeholder="Invoice"
          onChange={(e) => inputHandler("invoice", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "remark",
      headerName: "Remark",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          //  value={row.orderqty}
          placeholder="remark"
          onChange={(e) => inputHandler("remark", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 120,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "100%" }}
          options={locValue}
          onChange={(e) => inputHandler("location", row.id, e)}
        />
      ),
    },
  ];

  const saveFunction = async () => {
    setModalUploadLoad(true);
    //  console.log(mainData[0]);
    const { data } = await imsAxios.post("/jobwork/savejwsfinward", {
      companybranch: "BRMSC012",
      jobwork_trans_id: mainData[0].jobwork_id,
      product: row.sku_code,
      component: mainData[0].component.value ?? mainData[0].component,
      qty: mainData[0].orderqty,
      rate: mainData[0].rate,
      invoice: mainData[0].invoice,
      location: mainData[0].location,
      remark: mainData[0].remark,
      ewaybill: eWayBill,
    });
    if (data.code == 200) {
      if (all == "datewise") {
        console.log("Called");
        setModalUploadLoad(false);
        setEditModal(false);
        fetchDatewise();
        toast.success(data.message);
      } else if (all == "jw_transaction_wise") {
        setEditModal(false);
        setModalUploadLoad(false);
        fetchJWwise();
        toast.success(data.message);
      } else if (all == "jw_sfg_wise") {
        setEditModal(false);
        setModalUploadLoad(false);
        fetchSKUwise();
        toast.success(data.message);
      } else if (all == "vendorwise") {
        setEditModal(false);
        setModalUploadLoad(false);
        // fetchJWwise();
        fetchVendorwise();
        toast.success(data.message);
      }
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setModalUploadLoad(false);
    }
    //  console.log(data);
  };

  useEffect(() => {
    if (editModal) {
      getFetchData();
      getLocation();
      setEWayBill("");
    }
  }, [editModal]);

  const text = "Are you sure to update this jw sf Inward?";

  return (
    <Space>
      <Drawer
        width="100vw"
        //   title="JW Purchase Order (PO) - IN"
        title={
          <span style={{ fontSize: "15px", color: "#1890ff" }}>
            {row?.vendor}
          </span>
        }
        placement="right"
        closable={false}
        onClose={() => setEditModal(false)}
        open={editModal}
        getContainer={false}
        style={
          {
            //  position: "absolute",
          }
        }
        extra={
          <Space>
            <CloseCircleFilled onClick={() => setEditModal(false)} />
          </Space>
        }
      >
        <>
          <Skeleton active loading={modalLoad("fetch")}>
            <Card type="inner" title={header?.jobwork_id}>
              <Row gutter={10}>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  JW PO ID: {header?.jobwork_id}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Jobwork ID: {header?.jobwork_id}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Name & SKU:{" "}
                  {`${header?.product_name} / ${header?.sku_code}`}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  JW PO created by: {header?.created_by}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG BOM of Recipe: {header?.subject_name}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Regisered Date & Time: {header?.registered_date}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Ord Qty: {header?.ordered_qty}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Job ID Status: {header?.jw_status}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG processed Qty: {header?.proceed_qty}
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Job Worker: {header?.vendor_name}
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  <Form size="small">
                    <Form.Item label="E-Way Bill Bo.">
                      <Input
                        size="small"
                        value={eWayBill}
                        onChange={(e) => setEWayBill(e.target.value)}
                      />
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </Card>
            <div style={{ height: "60%", marginTop: "5px" }}>
              <div style={{ height: "100%" }}>
                <FormTable data={mainData} columns={columns} />
              </div>
            </div>
            <Row style={{ marginTop: "50px" }}>
              <Col span={24}>
                <div style={{ textAlign: "end" }}>
                  <Popconfirm
                    placement="topLeft"
                    title={text}
                    onConfirm={saveFunction}
                    loading={modalUploadLoad}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary">Save</Button>
                  </Popconfirm>
                  {/* <Button
                    onClick={() => setEditModal(false)}
                    style={{ background: "red", color: "white", marginLeft: "5px" }}
                  >
                    Reset
                  </Button> */}
                  {/* 
                  <Button type="primary" loading={modalUploadLoad} onClick={saveFunction}>
                    Save
                  </Button> */}
                </div>
              </Col>
            </Row>
          </Skeleton>
        </>
      </Drawer>
    </Space>
  );
}
