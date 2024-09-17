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
  Checkbox,
} from "antd";
import { CloseCircleFilled, InboxOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import FormTable from "../../../Components/FormTable";
import useLoading from "../../../hooks/useLoading";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import NavFooter from "../../../Components/NavFooter";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiOutlineMinusSquare } from "react-icons/ai";
import { uploadMinInvoice } from "../../../api/store/material-in";
import SuccessPage from "../../Store/MaterialIn/SuccessPage";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import SingleProduct from "../../Master/Vendor/SingleProduct";
export default function JwInwordModal({ editModal, setEditModal }) {
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
  const [irnNo, setIrnNo] = useState("");
  const [materialInSuccess, setMaterialInSuccess] = useState(false);
  const [isApplicable, setIsApplicable] = useState(false);
  const [isScan, setIsScan] = useState(false);
  const [modalForm] = Form.useForm();

  const fileComponents = Form.useWatch("fileComponents", modalForm);
  const [uplaoaClicked, setUploadClicked] = useState(false);
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
      console.log("data-------------------------", data.header.einvoice_status);
      getLocation(data.header.cost_center);
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          component: { label: row.componentname, value: row.componentKey },
        };
      });
      setIsApplicable(data.header.einvoice_status);
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
  const getLocation = async (costCenter) => {
    const { data } = await imsAxios.post("/backend/jw_sf_inward_location", {
      cost_center: costCenter,
    });
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
    } else if (name == "rqdQty") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, rqdQty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "irn") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, irn: value };
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
      width: 180,
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
      width: 180,
      renderCell: ({ row }) => (
        <Input
          type="number"
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
    // {
    //   field: "irn",
    //   headerName: "Acknowledgment Number",
    //   width: 220,
    //   renderCell: ({ row }) => (
    //     <Input
    //       //  value={row.orderqty}
    //       placeholder="Acknowledgment Number"
    //       onChange={(e) => inputHandler("irn", row.id, e.target.value)}
    //     />
    //   ),
    // },
    {
      field: "remark",
      headerName: "Remark",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          //  value={row.orderqty}
          placeholder="Remark"
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
    // {
    //   field: "pendingWithjobwork",
    //   headerName: "Pending with Jw",
    //   width: 120,
    //   renderCell: ({ row }) => (
    //     <Typography.Text>{row.pendingWithjobwork}</Typography.Text>
    //   ),
    // },
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
    // getLocation();
    setEWayBill("");
    setShowBomList(false);
    setBomList([]);
  };

  const saveFunction = async (fetchAttachment) => {
    // let filedata = modalForm.getFieldValue("fileComponents");
    let value = await modalForm.validateFields();
    let filedata = value.fileComponents;
    console.log("bomList", bomList);
    console.log("values", value);
    let payload = {
      attachment: fetchAttachment,
      companybranch: "BRMSC012",
      cost_center: header.cost_center,
      documentName: filedata.map((r) => r.documentName),
      component: mainData[0].component.value ?? mainData[0].component,
      consCompcomponents: bomList.map((r) => r.key),
      consQty: bomList.map((r) => r.rqdQty),
      consRemark: bomList.map((r) => r.conRemark),
      ewaybill: eWayBill,
      invoice: mainData[0].invoice,
      irn: irnNo,
      jobwork_trans_id: mainData[0].jobwork_id,
      location: mainData[0].location,
      product: row.sku_code,
      qty: mainData[0].orderqty,
      rate: mainData[0].rate,
      remark: mainData[0].remark,
      qrScan: isScan == true ? "Y" : "N",
    };
    console.log("payload", payload);
    setModalUploadLoad(true);
    const response = await imsAxios.post("/jobwork/savejwsfinward", payload);
    const minNum = response.message;
    const { data } = response;

    if (response.success) {
      setModalUploadLoad(false);
      const pattern = /\[(.*?)\]/;
      let getMin;
      // Using match() method to find the first match of the pattern in the input string
      const match = minNum.match(pattern);
      if (match) {
        setModalUploadLoad(false);
        // console.log(); // Output the text inside square brackets
        getMin = match[1];
      } else {
        setModalUploadLoad(false);
      }
      setModalUploadLoad(false);
      toast.success(response.message);
      // setEditModal(false);
      setModalUploadLoad(false);
      setShowBomList(false);
      modalForm.resetFields();
      setBomList([]);
      setMaterialInSuccess({
        materialInId: getMin,
        poId: mainData[0].jobwork_id,
        vendor: row?.vendor,
        components: bomList.map((row) => {
          return {
            id: row.id,
            componentName: row.partName,
            partNo: row.partNo,
            inQuantity: row.bomQty,
            invoiceNumber: mainData[0].invoice,
            // invoiceDate: mainData[0].invoice,
            location: mainData[0].location,
            poQuantity: row.rqdQty,
            pendingWithjobwork: row.pendingWithjobwork,
          };
        }),
      });
    } else {
      setModalUploadLoad(false);
      toast.error(response.message);
    }
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
          catPartName: r.catPartName,
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
  // const addAttachmentModal = async () => {
  //   // const values = await modalForm.validateFields();
  //   Modal.confirm({
  //     title: "Do you want to submit this JW SF Inward??",
  //     content: (
  //       <Form form={modalForm} layout="vertical">
  //         <Form.Item
  //           label="Invoice / Document"
  //           rules={[
  //             {
  //               required: true,
  //               message: "Please Select attachment!",
  //             },
  //           ]}
  //         >
  //           <Form.Item
  //             name="invoice"
  //             valuePropName="file"
  //             getValueFromEvent={(e) => e?.file}
  //             noStyle
  //             rules={[
  //               {
  //                 required: true,
  //                 message: "Please Select attachment!",
  //               },
  //             ]}
  //           >
  //             <Upload.Dragger
  //               name="invoice"
  //               beforeUpload={() => false}
  //               // maxCount={1}
  //               multiple={true}
  //             >
  //               <p className="ant-upload-drag-icon">
  //                 <InboxOutlined />
  //               </p>
  //               <p className="ant-upload-text">
  //                 Click or drag file to this area to upload
  //               </p>
  //               <p className="ant-upload-hint">
  //                 Upload vendor invoice / Document.
  //               </p>
  //             </Upload.Dragger>
  //           </Form.Item>
  //         </Form.Item>
  //       </Form>
  //     ),
  //     onOk: () => submitHandler(),
  //     okText: "Submit",
  //   });
  // };
  const newMinFunction = () => {
    setMaterialInSuccess(false);
  };
  const submitHandler = async () => {
    setUploadClicked(false);
    const formData = new FormData();
    const values = await modalForm.validateFields();
    console.log("values", values);
    let fileName;
    values.fileComponents.map((comp) => {
      formData.append("files", comp.file[0]?.originFileObj);
    });
    const fileResponse = await executeFun(
      () => uploadMinInvoice(formData),
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
      getFetchData();
      // getLocation();
      setEWayBill("");
      setShowBomList(false);
      setBomList([]);
      newMinFunction();
    }
  }, [editModal]);

  const text = "Are you sure to update this jw sf Inward?";
  const closeModal = () => {
    setEditModal(false);
    setShowBomList(false);
    setBomList([]);
    modalForm.resetFields();
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
          {!materialInSuccess && (
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
                    span={8}
                    style={{
                      fontSize: "15px",
                      fontWeight: "bolder",
                      marginTop: "20px",
                    }}
                  >
                    <Form size="small">
                      <Form.Item label="E-Way Bill No.">
                        <Input
                          style={{ width: "15rem" }}
                          size="small"
                          value={eWayBill}
                          onChange={(e) => setEWayBill(e.target.value)}
                        />
                      </Form.Item>
                    </Form>
                  </Col>
                  {isApplicable == "Y" && (
                    <Col
                      span={6}
                      style={{ display: "flex", paddingLeft: "-2px" }}
                    >
                      <span>
                        <Col span={24}>
                          <Checkbox
                            checked={isScan}
                            onChange={(e) => setIsScan(e.target.checked)}
                          />
                          <Typography.Text
                            style={{
                              fontSize: 11,
                              marginLeft: "4px",
                              fontWeight: 700,
                            }}
                          >
                            {" "}
                            Scan with QR Code
                          </Typography.Text>
                        </Col>{" "}
                        <Col
                          span={24}
                          style={{
                            marginTop: "5px",
                            fontSize: "12px",
                            fontWeight: "bolder",
                            // marginLeft: "8rem",
                          }}
                        >
                          <Form size="small">
                            <Form.Item label="Acknowledgment Number">
                              <Input
                                size="small"
                                style={{ width: "15rem" }}
                                value={irnNo}
                                onChange={(e) => setIrnNo(e.target.value)}
                                disabled={isScan}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </span>
                    </Col>
                  )}
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
                      <>
                        <Button onClick={prev}>Back</Button>

                        <Button
                          style={{ marginLeft: 4 }}
                          type="primary"
                          onClick={() => setUploadClicked(true)}
                          // loading={loading}
                          loading={modalUploadLoad}
                        >
                          Save
                        </Button>
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
                  </div>
                </Col>
              </Row>
            </Skeleton>
          )}

          {materialInSuccess && (
            <SuccessPage
              newMinFunction={newMinFunction}
              title={"Sfg"}
              po={materialInSuccess}
              successColumns={successColumns}
            />
          )}
          <Modal
            open={uplaoaClicked}
            width={700}
            title={"Upload Document"}
            // destroyOnClose={true}
            onOk={() => submitHandler()}
            onCancel={() => setUploadClicked(false)}
            // style={{ maxHeight: "50%", height: "50%", overflowY: "scroll" }}
          >
            {" "}
            <Form
              style={{ height: "100%" }}
              initialValues={defaultValues}
              form={modalForm}
              layout="vertical"
            >
              {" "}
              <Card style={{ height: "20rem", overflowY: "scroll" }}>
                <div style={{ flex: 1 }}>
                  <Col
                    span={24}
                    style={{
                      overflowX: "hidden",
                      overflowY: "auto",
                    }}
                  >
                    <Form.List name="fileComponents">
                      {(fields, { add, remove }) => (
                        <>
                          <Col>
                            {fields.map((field, index) => (
                              <Form.Item noStyle>
                                <SingleProduct
                                  fields={fields}
                                  field={field}
                                  index={index}
                                  add={add}
                                  form={modalForm}
                                  remove={remove}
                                  // setFiles={setFiles}
                                  // files={files}
                                />
                              </Form.Item>
                            ))}
                            <Row justify="center">
                              <Typography.Text type="secondary">
                                ----End of the List----
                              </Typography.Text>
                            </Row>
                          </Col>
                        </>
                      )}
                    </Form.List>
                  </Col>
                </div>
              </Card>
            </Form>
          </Modal>
        </>
      </Drawer>
    </Space>
  );
}
const successColumns = [
  {
    headerName: "Component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
    field: "componentName",
    flex: 1,
  },
  { headerName: "Part No.", field: "partNo", flex: 1 },
  { headerName: "SFG Quantity", field: "poQuantity", flex: 1 },
  { headerName: "In Quantity", field: "inQuantity", flex: 1 },
  { headerName: "Invoice Number", field: "invoiceNumber", flex: 1 },
  { headerName: "Pending With Jobwork", field: "pendingWithjobwork", flex: 1 },
  // { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
  // { headerName: "Location", field: "location", flex: 1 },
];
const defaultValues = {
  vendorType: "v01",
  vendorName: "",
  vendorBranch: "",
  gstin: "",
  vendorAddress: "",
  ewaybill: "",
  companybranch: "BRMSC012",
  projectID: "",
  costCenter: "",
  components: [
    {
      gstType: "L",
      location: "",
      autoConsumption: 0,
      currency: "364907247",
      exchangeRate: 1,
    },
  ],
  fileComponents: [
    {
      // file: "",
    },
  ],
};
