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
  Typography,
  Upload,
  Modal,
} from "antd";
import { CloseCircleFilled, InboxOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import FormTable from "../../../Components/FormTable";
import useLoading from "../../../hooks/useLoading";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
import NavFooter from "../../../Components/NavFooter";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiOutlineMinusSquare } from "react-icons/ai";
import {
  uploadMinInvoice,
  validateInvoice,
  validateInvoiceforSFG,
} from "../../../api/store/material-in";
import { Save } from "@mui/icons-material";
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
  const [bomList, setBomList] = useState([]);
  const [showBomList, setShowBomList] = useState(false);
  const [conrem, setConRem] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState("");

  const [modalForm] = Form.useForm();
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
    } else if (name == "conRemark") {
      setBomList((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, conRemark: value };
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
  const removeRow = (id) => {
    let arr = bomList;
    arr = arr.filter((row) => row.id != id);
    setBomList(arr);
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
          placeholder="Rate"
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
  const bomcolumns = [
    {
      headerName: "",
      width: 50,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) => [
        <GridActionsCellItem
          icon={
            <AiOutlineMinusSquare
            // style={{
            //   fontSize: "1.7rem",
            //    pointerEvents:
            //     journalRows.length === 3 || row.total ? "none" : "all",
            //   opacity: journalRows.length === 3 || row.total ? 0.5 : 1,
            // }} cursor: "pointer",
            />
          }
          onClick={() => {
            removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },
    {
      field: "id",
      headerName: "#",
      width: 50,
      renderCell: ({ row }) => <Typography.Text>{row.id}</Typography.Text>,
    },
    {
      field: "partNo",
      headerName: "Part No.",
      width: 50,
      renderCell: ({ row }) => <Typography.Text>{row.partNo}</Typography.Text>,
    },
    {
      field: "catPartName",
      headerName: "Cat Part No.",
      width: 50,
      renderCell: ({ row }) => (
        <Typography.Text>{row.catPartName}</Typography.Text>
      ),
    },
    {
      field: "partName",
      headerName: "Part Name",
      width: 320,
      renderCell: ({ row }) => <Input disabled value={row.partName} />,
    },
    {
      field: "bomQty",
      headerName: "Bom Qty",
      width: 150,
      renderCell: ({ row }) => <Input disabled value={row.bomQty} />,
    },
    {
      field: "rqdQty",
      headerName: "Required Qty",
      width: 120,
      renderCell: ({ row }) => <Input value={row.rqdQty} />,
    },
    {
      field: "pendingWithjobwork",
      headerName: "Pending with Jw",
      width: 120,
      renderCell: ({ row }) => (
        <Typography.Text>{row.pendingWithjobwork}</Typography.Text>
      ),
    },
    {
      field: "uom",
      headerName: "Uom",
      width: 50,
      renderCell: ({ row }) => <Typography.Text>{row.uom}</Typography.Text>,
    },
    {
      field: "conRemark",
      headerName: "Consumption Remark",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          // value={row.conRemark}
          // onChange={(e) => {
          //   setConRem(e.target.value);
          // }}
          onChange={(e) => inputHandler("conRemark", row.id, e.target.value)}
        />
      ),
    },
    // {
    //   field: "pendingStock",
    //   headerName: "Pending Stock",
    //   width: 180,
    //   renderCell: ({ row }) => <Input disabled value={row.pendingStock} />,
    // },
  ];
  const prev = async () => {
    getFetchData();
    getLocation();
    setEWayBill("");
    setShowBomList(false);
    setBomList([]);
  };

  const saveFunction = async (fetchAttachment) => {
    setModalUploadLoad(true);
    console.log("bomList", bomList);
    console.log("conrem", conrem);
    let payload = {
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
      consCompcomponents: bomList.map((r) => r.key),
      consQty: bomList.map((r) => r.rqdQty),
      consRemark: bomList.map((r) => r.conRemark),
      attachment: fetchAttachment,
    };
    console.log("payload", payload);
    const response = await imsAxios.post("/jobwork/savejwsfinward", payload);
    console.log("response", response);
    const { data } = response;

    if (response.success) {
      toast.success(response.message);
      setEditModal(false);
      setShowBomList(false);
      setBomList([]);
    } else {
      toast.error(data.message);
    }
    // if (data.code == 200) {
    //   if (all == "datewise") {
    //     console.log("Called");
    //     setModalUploadLoad(false);
    //     setEditModal(false);
    //     fetchDatewise();
    //     toast.success(data.message);
    //   } else if (all == "jw_transaction_wise") {
    //     setEditModal(false);
    //     setModalUploadLoad(false);
    //     fetchJWwise();
    //     toast.success(data.message);
    //   } else if (all == "jw_sfg_wise") {
    //     setEditModal(false);
    //     setModalUploadLoad(false);
    //     fetchSKUwise();
    //     toast.success(data.message);
    //   } else if (all == "vendorwise") {
    //     setEditModal(false);
    //     setModalUploadLoad(false);
    //     // fetchJWwise();
    //     fetchVendorwise();
    //     toast.success(data.message);
    //   }
    // } else if (data.code == 500) {
    //   toast.error(data.message.msg);
    //   setModalUploadLoad(false);
    // }
    //  console.log(data);
  };
  const getBomList = async () => {
    setLoading(true);
    const response = await imsAxios.post("/jobwork/getBomItem", {
      jwID: header?.jobwork_id,
      sfgCreateQty: mainData[0].orderqty,
    });
    console.log(response);
    if (response.data.status === "success") {
      const { data } = response;
      let arr = data.data.map((r, id) => {
        return {
          id: id + 1,
          bomQty: r.bom_qty,
          partName: r.part_name,
          catPartName: r.cat_part_no,
          partNo: r.part_no,
          pendingStock: r.pendingStock,
          rqdQty: r.rqd_qty,
          pendingWithjobwork: r.pendingWithjobwork,
          uom: r.uom,
          key: r.key,
        };
      });
      // console.log("arr,arr", arr);
      setBomList(arr);
      setLoading(false);
      setShowBomList(true);
    }

    setLoading(false);
  };
  const addAttachmentModal = async () => {
    // const values = await modalForm.validateFields();
    Modal.confirm({
      title: "Do you want to submit this JW SF Inward??",
      content: (
        <Form form={modalForm} layout="vertical">
          <Form.Item
            label="Invoice / Document"
            rules={[
              {
                required: true,
                message: "Please Select attachment!",
              },
            ]}
          >
            <Form.Item
              name="invoice"
              valuePropName="file"
              getValueFromEvent={(e) => e?.file}
              noStyle
              rules={[
                {
                  required: true,
                  message: "Please Select attachment!",
                },
              ]}
            >
              <Upload.Dragger
                name="invoice"
                beforeUpload={() => false}
                // maxCount={1}
                multiple={true}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Upload vendor invoice / Document.
                </p>
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>
        </Form>
      ),
      onOk: () => submitHandler(),
      okText: "Submit",
    });
  };
  const submitHandler = async () => {
    const values = await modalForm.validateFields();
    console.log("values", values);
    let fileName;
    const fileResponse = await executeFun(
      () => uploadMinInvoice(values.invoice),
      "submit"
    );
    console.log("fileResponse", fileResponse);
    if (fileResponse.success) {
      const { data } = fileResponse;
      let fetchAttachment = data.data;
      setAttachment(fetchAttachment);

      console.log("fethc", fetchAttachment);

      saveFunction(fetchAttachment);
    }
  };

  useEffect(() => {
    if (editModal) {
      // console.log("editModal", editModal);
      getFetchData();
      getLocation();
      setEWayBill("");
      setShowBomList(false);
      setBomList([]);
    }
  }, [editModal]);

  const text = "Are you sure to update this jw sf Inward?";
  const closeModal = () => {
    setEditModal(false);
    setShowBomList(false);
    setBomList([]);
  };
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
        onClose={closeModal}
        open={editModal}
        getContainer={false}
        destroyOnClose={true}
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
            <div style={{ height: "50%", marginTop: "5px" }}>
              <div style={{ height: "100%" }}>
                {showBomList && bomList ? (
                  <FormTable
                    data={bomList}
                    columns={bomcolumns}
                    loading={loading}
                  />
                ) : (
                  <FormTable data={mainData} columns={columns} />
                )}
              </div>
            </div>
            <Row style={{ marginTop: "50px" }}>
              <Col span={24}>
                <div style={{ textAlign: "end" }}>
                  {showBomList ? (
                    // <NavFooter
                    //   // loading={loading}
                    //   submitFunction={saveFunction}
                    //   backFunction={() => setEditModal(false)}
                    //   // resetFunction={resetHandler}
                    //   nextLabel="Submit"
                    // />
                    <>
                      <Button onClick={prev}>Back</Button>
                      {/* <Popconfirm
                        placement="topLeft"
                        title={text}
                        onConfirm={saveFunction}
                        loading={modalUploadLoad}
                        okText="Yes"
                        cancelText="No"
                      > */}
                      <Button
                        style={{ marginLeft: 4 }}
                        type="primary"
                        onClick={addAttachmentModal}
                      >
                        Save
                      </Button>
                      {/* </Popconfirm> */}
                    </>
                  ) : (
                    <NavFooter
                      loading={loading}
                      submitFunction={getBomList}
                      backFunction={closeModal}
                      // resetFunction={resetHandler}
                      nextLabel="Next"
                    />
                  )}

                  {/* <Popconfirm
                    placement="topLeft"
                    title={text}
                    // onConfirm={saveFunction}
                    loading={modalUploadLoad}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary">Save</Button>
                  </Popconfirm> */}
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
