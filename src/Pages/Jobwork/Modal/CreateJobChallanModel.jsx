import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Drawer,
  Row,
  Space,
  Card,
  Input,
  Divider,
  Select,
  Skeleton,
} from "antd";
import axios from "axios";
import {
  UserAddOutlined,
  ToolOutlined,
  DeleteTwoTone,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
const { TextArea } = Input;

function CreateJobChallanModel({ challanModal, setChallanModal }) {
  const [loadChallan, setLoadChallan] = useState(false);
  const [status, setStatus] = useState(1);
  const [vendorData, setVendorData] = useState([]);

  // console.log("BILLING ADDRESS=>", vendorData);
  const [productData, setProductData] = useState([]);

  // productData.map((aa) => console.log(aa));
  // console.log(productData[0].jw_id);
  // Page 1 Axist Data
  const [userData, setUserData] = useState({
    nProcessing: "",
    dProcessing: "",
    vNo: "",
    otherRef: "",
    //
    billingLocationValue: "",
    dispatchLocationValue: "",
  });

  const [billingLocationData, setBillingLocationData] = useState([]);
  // console.log(billingLocationData);
  const [restBillingAddress, setrestBillingAddress] = useState([]);
  // console.log(restBillingAddress);

  const [dispatchLocation, setDispatchLocation] = useState([]);
  const [restDispatchAddress, setRestDispatchAddress] = useState([]);
  // console.log(restDispatchAddress?.gstin);

  const [lastAddressData, setLastAddressData] = useState([]);

  // console.log(restDispatchAddress?.address);
  const getFetchAllData = async () => {
    const { data } = await imsAxios.post("/jobwork/createJwChallan", {
      transaction: challanModal?.issue_transaction_id,
    });
    if (data.code == 200) {
      let arr = data?.data?.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      // console.log(data.data);
      setProductData(arr);
      setVendorData(data.data.header);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
  };

  const getBillingLocation = async (e) => {
    const { data } = await imsAxios.post("/backend/billingAddressList");
    let a = [];
    data.map((x) => a.push({ text: x.text, value: x.id }));
    setBillingLocationData(a);
    //  }
  };

  const getBillingAddress = async () => {
    const { data } = await imsAxios.post("/backend/billingAddress", {
      billing_code: userData?.billingLocationValue,
    });
    setrestBillingAddress(data?.data);
  };

  // dispatch Locatiom
  const getDispatchLocation = async () => {
    const { data } = await imsAxios.post("/backend/dispatchAddressList");
    let a = [];
    data.map((x) => a.push({ text: x.text, value: x.id }));
    setDispatchLocation(a);
  };

  const getRestDispatchAddress = async () => {
    const { data } = await imsAxios.post("/backend/dispatchAddress", {
      dispatch_code: userData?.dispatchLocationValue,
    });
    setRestDispatchAddress(data.data);
  };

  const inputHandler = async (name, id, value, a) => {
    // console.log(name, id, value, a);
    if (name == "issue_qty") {
      setProductData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, issue_qty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "rate") {
      setProductData((a) =>
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
    } else if (name == "hsn_code") {
      setProductData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, hsn_code: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "desc") {
      // productData.map((a) => console.log(a));

      setProductData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, desc: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "loc") {
      const { data } = await imsAxios.post("/backend/compStockLoc", {
        component: a,
        location: value,
      });
      // closingStock(data?.data);
      let arr = data?.data?.closingStock;
      setProductData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, loc: value, closeData: arr };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };
  const deleteRow = async (i) => {
    console.log(i);
    setLoadChallan(true);
    const { data } = await imsAxios.post("/jobwork/removeChallanJWPart", {
      partcode: i?.component_key,
      row_id: i?.trans_row_id,
    });
    if (data.code == 200) {
      getFetchAllData();
      setLoadChallan(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoadChallan(false);
    }
    // console.log(data);
  };
  const columns = [
    {
      field: "actions",
      headerName: "ACTION",
      width: 100,
      renderCell: ({ row }) => (
        <DeleteTwoTone
          onClick={() => {
            deleteRow(row);
          }}
        />
        //   <TableActions action="view" onClick={() => setViewModalOpen(row)} />,
        //   <TableActions action="cancel" onClick={() => setCloseModalOpen(row)} />,
        //   <TableActions action="print" onClick={() => console.log(row)} />,
      ),
    },
    { field: "component_name", headerName: "Component/Part Code", width: 300 },
    {
      field: "issue_qty",
      headerName: "Order Qty/UoM",
      width: 130,
      renderCell: ({ row }) => (
        <Input
          suffix={row.unit_name}
          value={row.issue_qty}
          placeholder="Qty"
          onChange={(e) => inputHandler("issue_qty", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "RATE",
      headerName: "Rate",
      width: 120,
      renderCell: ({ row }) => (
        <Input
          //  suffix={row.unit_name}
          value={row.rate}
          placeholder="Rate"
          onChange={(e) => inputHandler("rate", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "availableQty",
      headerName: "Available Qty",
      width: 120,
      renderCell: ({ row }) => (
        <Input
          disabled
          //  suffix={row.unit_name}
          //  value={row.issue_qty}
          placeholder={row?.closeData}
        />
      ),
    },
    {
      // field: "issue_qty",
      headerName: "Value",
      width: 140,
      renderCell: ({ row }) => (
        <Input
          disabled
          //  suffix={row.unit_name}
          //  value={row.issue_qty}
          placeholder={row?.rate ? row?.issue_qty * row?.rate : "---"}
          // placeholder={row?.issue_qty * row?.rate}
          //  onChange={(e) => inputHandler("issue_qty", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "hsn_code",
      headerName: "HSN Code",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          //  suffix={row.unit_name}
          value={row.hsn_code}
          placeholder="Qty"
          onChange={(e) => inputHandler("hsn_code", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "Out",
      headerName: "Out Location",
      width: 200,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "100%" }}
          options={lastAddressData}
          onChange={(e) => inputHandler("loc", row.id, e, row.component_key)}
        />
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      renderCell: ({ row }) => (
        <Input
          //  suffix={row.unit_name}
          value={row.desc}
          placeholder="Value"
          onChange={(e) => inputHandler("desc", row.id, e.target.value)}
        />
      ),
    },
  ];

  const getArrayLocation = async (e) => {
    const { data } = await imsAxios.get("/jobwork/jwChallanLocations");
    //  console.log(data);
    let arr = [];
    arr = data.data.map((d) => {
      return { label: d.text, value: d.id };
    });
    //  console.log(arr);
    setLastAddressData(arr);
    //  }
  };

  // console.log(productData);
  //

  useEffect(() => {
    if (challanModal) {
      getFetchAllData();
      getBillingLocation();
      setrestBillingAddress([]);
      getDispatchLocation();
      getArrayLocation();
      // getLocation();
    }
  }, [challanModal]);

  useEffect(() => {
    if (userData?.billingLocationValue) {
      // console.log("called");
      getBillingAddress();
    }
  }, [userData?.billingLocationValue]);

  useEffect(() => {
    if (userData?.dispatchLocationValue) {
      getRestDispatchAddress();
    }
  }, [userData?.dispatchLocationValue]);

  useEffect(() => {
    if (status == 2) {
      // console.log(productData);
    }
  }, [status]);

  const close = () => {
    setVendorData([]);
    setUserData([]);
    setRestDispatchAddress([]);
    setStatus(1);
    setChallanModal(false);
  };

  const CreateChallan = async () => {
    let comArray = [];
    let qtyArray = [];
    let rateArray = [];
    let picklocationArray = [];
    let remarkArray = [];
    let hsnCodeArray = [];
    // console.log(productData);

    productData?.map((a) => comArray.push(a?.component_key));
    productData?.map((a) => qtyArray.push(a?.issue_qty));
    productData?.map((a) => rateArray.push(a?.rate));
    // productData?.map((a) => picklocationArray.push(a?.loc));
    productData?.map((a) => remarkArray.push(a?.desc));
    productData?.map((a) => hsnCodeArray.push(a?.hsn_code));

    // console.log(comArray);
    // console.log(qtyArray);
    // console.log(rateArray);
    // console.log(picklocationArray);
    // console.log(remarkArray);
    // console.log(hsnCodeArray);

    // console.log(restBillingAddress?.address);
    const { data } = await imsAxios.post("/jobwork/saveCreateChallan", {
      transaction_id: productData[0].jw_id,
      reference_id: productData[0].ref_id,
      billingaddrid: userData?.billingLocationValue,
      billingaddr: restBillingAddress?.address,
      dispatchfromaddrid: userData?.dispatchLocationValue,
      dispatchfromaddr: restDispatchAddress?.address,
      // dispatchfromaddr1: restDispatchAddress?.address,
      // dispatchfromaddr2: "--",
      // dispatchfromstate: restDispatchAddress?.statecode,

      dispatchfrompincode: restDispatchAddress?.pincode,
      dispatchfromgst: restDispatchAddress?.gstin,
      nature: userData?.nProcessing,
      duration: userData?.dProcessing,
      other_ref: userData?.otherRef,
      vehicle: userData?.vNo,
      component: comArray,
      qty: qtyArray,
      rate: rateArray,
      // picklocation: picklocationArray,
      remark: remarkArray,
      hsncode: hsnCodeArray,
    });
    console.log(data);
    if (data.code == 200) {
      close();
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
  };
  return (
    <Space>
      <Drawer
        width="100vw"
        title="Create Jobwork Challan"
        placement="right"
        closable={false}
        onClose={() => setChallanModal(false)}
        open={challanModal}
        getContainer={false}
        extra={
          <Space>
            {/* <CloseCircleFilled onClick={() => setChallanModal(false)} /> */}
            <Button type="primary" onClick={CreateChallan}>
              Save
            </Button>
            <Button onClick={close}>Close</Button>
          </Space>
        }
      >
        <Row gutter={10}>
          <Col span={2}>
            <>
              <div style={{ padding: "1px" }}>
                <Button
                  block
                  style={{
                    backgroundColor: "#5f7682",
                    color: "white",
                    borderRadius: "5px",
                  }}
                  onClick={() => setStatus(1)}
                  icon={<UserAddOutlined />}
                >
                  Vendor
                </Button>
              </div>
              <div style={{ padding: "1px" }}>
                <Button
                  icon={<ToolOutlined />}
                  block
                  style={{
                    backgroundColor: "#5f7682",
                    color: "white",
                    borderRadius: "5px",
                  }}
                  onClick={() => setStatus(2)}
                >
                  Material
                </Button>
              </div>
            </>
          </Col>
          <Col span={22}>
            {/* <div
              style={{
                // border: "1px solid red",
                justifyContent: "center",
                display: "flex",
                marginBottom: "10px",
              }}
            >
              <Button
                type="primary"
                style={{ marginRight: "5px" }}
                onClick={() => setStatus(1)}
              >
                Vendor
              </Button>
              <Button type="primary" onClick={() => setStatus(2)}>
                Material
              </Button>
            </div> */}
            {status == 1 ? (
              <div>
                <Card
                  title="Vendor"
                  size="small"
                  headStyle={{ backgroundColor: "#5f7682", color: "white" }}
                >
                  <Card
                    title="User Information"
                    size="small"
                    headStyle={{ backgroundColor: "#5f7682", color: "white" }}
                  >
                    <Row gutter={10}>
                      <Col span={8} style={{ margin: "5px" }}>
                        <span>Name</span>
                        <Input value={vendorData?.vendor_name} disabled />
                      </Col>
                      <Col span={8} style={{ margin: "5px" }}>
                        <span>Vendor Type</span>
                        <Input value={vendorData?.vendor_type} disabled />
                      </Col>
                      <Col span={7} style={{ margin: "5px" }}>
                        <span>GSTIN*</span>
                        <Input value={vendorData?.vendor_gst} disabled />
                      </Col>
                      <Col span={8} style={{ margin: "5px" }}>
                        <span>Billing Address</span>
                        <TextArea value={vendorData?.vendor_address} disabled />
                      </Col>
                      <Col span={8} style={{ margin: "5px" }}>
                        <span>Nature of Processing</span>
                        <Input
                          placeholder="Nature of Processing"
                          value={userData?.nProcessing}
                          onChange={(e) =>
                            setUserData((userData) => {
                              return {
                                ...userData,
                                nProcessing: e.target.value,
                              };
                            })
                          }
                        />
                      </Col>
                      <Col span={7} style={{ margin: "5px" }}>
                        <span>Duration of Processing</span>
                        <Input
                          value={userData?.dProcessing}
                          onChange={(e) =>
                            setUserData((userData) => {
                              return {
                                ...userData,
                                dProcessing: e.target.value,
                              };
                            })
                          }
                        />
                      </Col>
                      <Col span={8} style={{ margin: "5px" }}>
                        <span>Vehicle No.</span>
                        <Input
                          value={userData?.vNo}
                          onChange={(e) =>
                            setUserData((userData) => {
                              return { ...userData, vNo: e.target.value };
                            })
                          }
                        />
                      </Col>
                      <Col span={8} style={{ margin: "5px" }}>
                        <span>Other Reference</span>
                        <Input
                          value={userData?.otherRef}
                          onChange={(e) =>
                            setUserData((userData) => {
                              return { ...userData, otherRef: e.target.value };
                            })
                          }
                        />
                      </Col>
                      <Divider />
                      <Col span={6} style={{ margin: "5px" }}>
                        <span>State</span>
                        <Input value={vendorData?.vendor_state} disabled />
                      </Col>
                      <Col span={6} style={{ margin: "5px" }}>
                        <span>Country</span>
                        <Input value={vendorData?.vendor_country} disabled />
                      </Col>
                    </Row>
                  </Card>
                  <Card
                    style={{
                      marginTop: 36,
                    }}
                    headStyle={{ backgroundColor: "#5f7682", color: "white" }}
                    type="inner"
                    title="Billing Address"
                    size="small"
                  >
                    <Row gutter={10}>
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>BILLING ADDRESS</span>
                        <MySelect
                          style={{ width: "100%" }}
                          options={billingLocationData}
                          placeholder="Please Select Location"
                          value={userData?.billingLocationValue}
                          onChange={(e) =>
                            setUserData((userData) => {
                              return { ...userData, billingLocationValue: e };
                            })
                          }
                        />
                      </Col>
                      <Col span={10} style={{ padding: "5px" }}>
                        <span>ADDRESS</span>
                        <TextArea
                          rows={3}
                          disabled
                          placeholder={restBillingAddress?.address}
                        />
                      </Col>
                      {/* <Col span={6} style={{ padding: "5px" }}>
                        <span>State</span>
                        <MyAsyncSelect
                          disabled
                          style={{ width: "100%" }}
                          // onBlur={() => setAsyncOptions([])}
                          // loadOptions={getLocationChange}
                          // optionsState={asyncOptions}
                          // onChange={(e) => inputHandler("stateChange", e)}
                          value={restBillingAddress?.statecode}
                        />
                      </Col> */}
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>Pan No</span>
                        <Input disabled placeholder={restBillingAddress?.pan} />
                      </Col>
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>CIN No</span>
                        <Input disabled placeholder={restBillingAddress?.cin} />
                      </Col>
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>GST No</span>
                        <Input
                          disabled
                          placeholder={restBillingAddress?.gstin}
                        />
                      </Col>
                    </Row>
                  </Card>
                  <Card
                    style={{
                      marginTop: 36,
                    }}
                    headStyle={{ backgroundColor: "#5f7682", color: "white" }}
                    type="inner"
                    title="Dispatch"
                    size="small"
                  >
                    <Row gutter={10}>
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>Dispatch ID</span>
                        <MySelect
                          style={{ width: "100%" }}
                          placeholder="Please Select Location"
                          options={dispatchLocation}
                          value={userData?.dispatchLocationValue}
                          onChange={(e) =>
                            setUserData((userData) => {
                              return { ...userData, dispatchLocationValue: e };
                            })
                          }
                        />
                      </Col>
                      <Col span={10} style={{ padding: "5px" }}>
                        <span>ADDRESS</span>
                        <TextArea
                          rows={3}
                          disabled
                          placeholder={restDispatchAddress?.address}
                        />
                      </Col>
                      {/* <Col span={6} style={{ padding: "5px" }}>
                        <span>State</span>
                        <MyAsyncSelect
                          disabled
                          style={{ width: "100%" }}
                          value={restDispatchAddress?.statecode}
                        />
                      </Col> */}
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>Pin Code</span>
                        <Input
                          disabled
                          placeholder={restDispatchAddress?.pincode}
                        />
                      </Col>
                      <Col span={8} style={{ padding: "5px" }}>
                        <span>GSTIN/UIN</span>
                        <Input
                          disabled
                          placeholder={restDispatchAddress?.gstin}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Card>
              </div>
            ) : (
              <div>
                <Card
                  title="Material"
                  size="small"
                  headStyle={{ backgroundColor: "#5f7682", color: "white" }}
                >
                  <div style={{ height: "70vh", margin: "10px" }}>
                    {/* <div style={{ height: "100%" }}> */}
                    <Skeleton loading={loadChallan}>
                      <MyDataTable data={productData} columns={columns} />
                    </Skeleton>
                    {/* </div> */}
                  </div>
                </Card>
              </div>
            )}
          </Col>
        </Row>
      </Drawer>
    </Space>
  );
}

export default CreateJobChallanModel;
