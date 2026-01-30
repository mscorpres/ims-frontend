import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Skeleton,
  Modal,
} from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import FormTableDataGrid from "../../../Components/FormTableDataGrid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading";
import NavFooter from "../../../Components/NavFooter";
import errorToast from "../../../Components/errorToast";
import {
  DeleteTwoTone,
  ReloadOutlined,
} from "@ant-design/icons";
import useLoading from "../../../hooks/useLoading";
import { saveCreateChallan } from "../../../api/general";
import useApi from "../../../hooks/useApi";

function JWRMChallanEditAll({ setEditJWAll, editiJWAll, getRows }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useLoading();
  const [loadChallan, setLoadChallan] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [dropLocationOptions, setDropLocationOptions] = useState([]);
  const [dispatchBranches, setDispatchBranches] = useState([]);
  const [billingBranches, setBillingBranches] = useState([]);
  const [restCom, setRestCom] = useState({
    nature: "",
    duration: "",
    otherRef: "",
  });
  const [createJobWorkChallanForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();

  const getDetails = async () => {
    setLoading("fetchDetails", true);
    const response = await imsAxios.post("/jobwork/createJwChallan", {
      transaction: editiJWAll.fetchTransactionId,
      jwtxn: editiJWAll.saveTransactionId,
      sku: editiJWAll.sku,
    });
    // console.log(response.data.data.header)
    setLoading("fetchDetails", false);
    if (response.data.code === 200) {
      let arr = response.data.data.material.map((row, index) => ({
        id: v4(),
        index: index + 1,
        issue_qty: 0,
        // assign_rate: 0,
        out_loc: "",
        remarks: "",
        ...row,
      }));
      setRows(arr);
      let obj = response.data.data.header;
      // console.log(obj)
      obj = {
        ...obj,
        billingaddrid: "",
        dispatchfromaddrid: "",
        vendor_address: obj.vendor_address?.replaceAll("<br>", "\n"),
      };
      // console.log(obj.vendorcode)
      createJobWorkChallanForm.setFieldsValue(obj);
      // Call getLocations after vendor is set
      if (obj.vendorcode?.value) {
        getLocations(obj.vendorcode?.value);
      }
    }
  };

  const inputHandler = async (name, value, id) => {
    let arr = rows;
    if (name === "out_loc") {
      setLoading("tableSpinner", true);
      const response = await imsAxios.post("/backend/compStockLoc", {
        component: value.component,
        location: value.value,
      });
      setLoading("tableSpinner", false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          arr = arr.map((row) => {
            if (row.id === id) {
              return {
                ...row,
                availableQty: data.data.closingStock,
                [name]: value.value,
              };
            } else {
              return row;
            }
          });
        } else {
          toast.error(data.message.msg);
        }
      }
    } else {
      arr = arr.map((row) => {
        if (row.id === id) {
          row = {
            ...row,
            [name]: value,
          };
          return row;
        } else {
          return row;
        }
      });
    }

    setRows(arr);
  };

  const refreshStockHandler = async (row) => {
    if (!row.out_loc) {
      toast.warning("Please choose Out Location first");
      return;
    }
    setLoading("tableSpinner", true);
    try {
      const response = await imsAxios.post("/backend/compStockLoc", {
        component: row.component_key,
        location: row.out_loc,
      });
      const { data } = response;
      if (data?.code === 200) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? { ...r, availableQty: data.data.closingStock }
              : r
          )
        );
      } else {
        toast.error(data?.message?.msg || "Failed to fetch stock");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message?.msg || "Failed to fetch stock");
    } finally {
      setLoading("tableSpinner", false);
    }
  };

  const submitHandler = async () => {
    let obj = await createJobWorkChallanForm.validateFields();
    obj = {
      ...obj,
      reference_id: rows[0].ref_id,
    };
    const finalObj = {
      // ...obj,
      component: rows.map((row) => row.component_key),
      hsncode: rows.map((row) => row.hsn_code),
      qty: rows.map((row) => row.issue_qty),
      rate: rows.map((row) => row.assign_rate),
      remark: rows.map((row) => row.remarks),
      picklocation: rows.map((row) => row.out_loc),
      // transaction_id: editiJWAll.saveTransactionId,
    };
    setLoading("submit", true);
    // const response = await imsAxios.post("/jobwork/saveCreateChallan", {
    //   header: {
    //     billingaddrid: obj?.billingaddrid,
    //     billingaddr: obj?.billingaddr,
    //     reference_id: obj?.reference_id,
    //     dispatchfromaddrid: obj?.dispatchfromaddrid,
    //     dispatchfromaddr: obj?.dispatchfromaddr,
    //     dispatchfrompincode: obj?.dispatchfrompincode,
    //     dispatchfromgst: obj?.dispatchfromgst,
    //     vehicle: obj?.vehicle,
    //     transaction_id: editiJWAll?.saveTransactionId,
    //     vendoraddress: obj?.vendor_address,
    //     vendorbranch: obj?.vendorbranch.value,
    //     nature: restCom?.nature,
    //     duration: restCom?.duration,
    //     other_ref: restCom?.otherRef,
    //   },
    //   material: finalObj,
    //   // transaction_id: obj?.,
    // });
    let final = {
      header: {
        billingaddrid: obj?.billingaddrid,
        billingaddr: obj?.billingaddr,
        reference_id: obj?.reference_id,
        dispatchfromaddrid: obj?.dispatchfromaddrid,
        dispatchfromaddr: obj?.dispatchfromaddr,
        dispatchfrompincode: obj?.dispatchfrompincode,
        dispatchfromgst: obj?.dispatchfromgst,
        vehicle: obj?.vehicle,
        transaction_id: editiJWAll?.saveTransactionId,
        vendoraddress: obj?.vendor_address,
        vendorbranch: obj?.vendorbranch.value,
        nature: restCom?.nature,
        duration: restCom?.duration,
        other_ref: restCom?.otherRef,
        // picklocation: obj?.pickLocation,
        // droplocation: obj?.dropLocation,
        // picklocation: obj?.pickLocation,
      },
      material: finalObj,
      // transaction_id: obj?.,
    };
    const response = await executeFun(() => saveCreateChallan(final), "select");
    setLoading("submit", false);
    if (response.data.code === 200) {
      toast.success(response.data.message);
      setEditJWAll(false);
      getRows();
    } else {
      if (response.data.message.msg) {
        toast.error(response.data.message.msg);
      } else {
        toast.error(errorToast(response.data.message));
      }
    }
  };
  const getLocations = async (vendor) => {
    const response = await imsAxios.get(`backend/jw/warehouse/location?vendor=${vendor}&jw=${editiJWAll.saveTransactionId}`);
    if (response.data.code === 200) {
      let arr = response.data.data.map((row) => ({
        text: row.name,
        value: row.key,
      }));
      setLocationOptions(arr);
    } else {
      setLocationOptions([]);
      toast.error(response.data.message);
    }
  };
  const getBillingBranchOptions = async () => {
    const response = await imsAxios.post("backend/billingAddressList", {
      search: "",
    });
    if (response.data[0]) {
      let arr = response.data;
      arr = arr.map((row) => ({
        text: row.text,
        value: row.id,
      }));

      setBillingBranches(arr);
    } else {
      setBillingBranches([]);
    }
  };
  const getDispatchBranchOptions = async () => {
    const response = await imsAxios.post("/backend/dispatchAddressList", {
      search: "",
    });
    if (response.data[0]) {
      let arr = response.data;
      arr = arr.map((row) => ({
        text: row.text,
        value: row.id,
      }));

      setDispatchBranches(arr);
    } else {
      setDispatchBranches([]);
    }
  };

  const getDropLocation = async (value) => {
    let vendor = createJobWorkChallanForm.getFieldsValue().vendorcode;
    if (vendor) {
      setLoading("select", true);
      const response = await imsAxios.get(`/backend/fetchVendorJWLocation?vendor=${vendor?.value}`);
      setLoading("select", false);
      if (response.success) {
        let arr = [];
        arr = response.data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setDropLocationOptions(arr);
      } else {
        toast.error(response.message);
      }
    }
  };
  const getAsyncOptions = async (search, type) => {
    let link =
      type === "dispatch"
        ? "/backend/dispatchAddressList"
        : type === "billing" && "/backend/billingAddressList";
    setLoading("select", true);
    const response = await imsAxios.post(link, {
      search: search,
    });
    setLoading("select", false);
    if (response.data[0]) {
      let arr = response.data;
      arr = arr.map((row) => ({
        text: row.text,
        value: row.id,
      }));

      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getDispatchAddress = async (value) => {
    setLoading("page", true);
    const response = await imsAxios.post("/backend/dispatchAddress", {
      dispatch_code: value,
    });
    setLoading("page", false);
    if (response.data.code === 200) {
      let obj = createJobWorkChallanForm.getFieldsValue();
      obj = {
        ...obj,
        dispatchfromaddr: response.data.data.address.replaceAll("<br>", "\n"),
        dispatchfromaddrid: value,
        dispatchfromgst: response.data.data.gstin,
        dispatchfrompincode: response.data.data.pincode,
      };
      createJobWorkChallanForm.setFieldsValue(obj);
    } else {
      toast.error(response.data.message.msg);
    }
  };
  const getBillingAddress = async (value) => {
    setLoading("page", true);
    const response = await imsAxios.post("/backend/billingAddress", {
      billing_code: value,
    });
    setLoading("page", false);
    if (response.data.code === 200) {
      let obj = createJobWorkChallanForm.getFieldsValue();
      obj = {
        ...obj,
        billingaddr: response.data.data.address.replaceAll("<br>", "\n"),
        billingaddrid: value,
        billingaddrgst: response.data.data.gstin,
        billingaddrcin: response.data.data.cin,
        billingaddrpan: response.data.data.pan,
      };
      createJobWorkChallanForm.setFieldsValue(obj);
    } else {
      toast.error(response.data.message.msg);
    }
  };
  const columns = [
    {
      field: "actions",
      headerName: "ACTION",
      width: 80,
      renderCell: ({ row }) => (
        <DeleteTwoTone
          onClick={() => {
                 Modal.confirm({
                okText: "Continue",
                cancelText: "Cancel",
                title:
                  `Are you sure you want to delete (${row?.part_no}) ${row?.component_name} ,  The action is irreversible ?`,
                onOk() {
                  deleteRow(row);
                }, 
                onCancel() {
                  // setEditingVBT(null);
                },
              });
            
          }}
        />
      ),
    },
    {
      field: "index",
      headerName: "S No.",
      width: 80,
      renderCell: ({ row }) => <span>{row.index}</span>,
    },
    {
      field: "part_no",
      headerName: "Part No.",
      renderCell: ({ row }) => (
        <div style={{ width: 80 }}>
          <ToolTipEllipses text={row.part_no} />
        </div>
      ),
      width: 80,
    },
    {
      field: "component_name",
      headerName: "Component",
      renderCell: ({ row }) => (
        <div style={{ width: 150 }}>
          <ToolTipEllipses text={row.component_name} />
        </div>
      ),
      width: 150,
    },
    {
      field: "issue_qty",
      headerName: "Qty",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            style={{ width: "100%" }}
            value={row.issue_qty}
            onChange={(e) => inputHandler("issue_qty", e.target.value, row.id)}
            suffix={row.unit_name}
            type="number"
          />
        </div>
      ),
      width: 180,
    },
    {
      field: "availableQty",
      headerName: "Avail. Qty",
      renderCell: ({ row }) => (
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {row.availableQty != null && row.availableQty !== "" ? (
            <span>{row.availableQty}</span>
          ) : (
            <span />
          )}
          <ReloadOutlined
            style={{ cursor: "pointer", fontSize: 16 }}
            title="Refresh stock"
            onClick={() => refreshStockHandler(row)}
          />
        </div>
      ),
      width: 120,
    },
    {
      field: "assign_rate",
      headerName: "Rate",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            style={{ width: "100%" }}
            value={row.assign_rate}
            type="number"
            onChange={(e) =>
              inputHandler("assign_rate", e.target.value, row.id)
            }
          />
        </div>
      ),
      width: 100,
    },
    {
      field: "value",
      headerName: "Value",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input value={+row.issue_qty * +Number(row.assign_rate).toFixed(3)} />
        </div>
      ),
      width: 120,
    },
    {
      field: "hsn_code",
      headerName: "HSN",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            value={row.hsn_code}
            onChange={(e) => inputHandler("hsn_code", e.target.value, row.id)}
          />
        </div>
      ),
      width: 120,
    },
    {
      field: "out_loc",
      headerName: "Out Location",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <MySelect
            // disabled
            options={locationOptions}
            value={row.out_loc}
            onChange={(value) =>
              inputHandler(
                "out_loc",
                {
                  value: value,
                  component: row.component_key,
                },
                row.id
              )
            }
          />
        </div>
      ),
      width: 120,
    },
    {
      field: "remarks",
      headerName: "Description",
      renderCell: ({ row }) => (
        <div style={{ width: 200 }}>
          <Input
            value={row.remarks}
            onChange={(e) => inputHandler("remarks", e.target.value, row.id)}
          />
        </div>
      ),
      width: 200,
    },
  ];

  const deleteRow = async (i) => {
    setLoading("tableSpinner", true);
    const { data } = await imsAxios.post("/jobwork/removeChallanJWPart", {
      partcode: i?.component_key,
      row_id: i?.trans_row_id,
    });
    setLoading("tableSpinner", false);
    if (data.code == 200) {
      let arr = rows;
      arr = arr.filter((row) => row.id !== i.id);
      arr = arr.map((row, index) => ({
        ...row,
        index: index + 1,
      }));
      setRows(arr);
      // getDetails();
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoadChallan(false);
    }
  };
  useEffect(() => {
    if (editiJWAll) {
      getDetails();
      getBillingBranchOptions();
      getDispatchBranchOptions();
    }
  }, [editiJWAll]);
  
  useEffect(() => {
    const vendorcode = createJobWorkChallanForm.getFieldsValue().vendorcode;
    if (vendorcode) {
      getDropLocation();
      getLocations(vendorcode?.value);
    }
  }, [createJobWorkChallanForm.getFieldsValue().vendorcode]);

  return (
    <Drawer
      title={`Creating Jobwork Challan`}
      width="100vw"
      open={editiJWAll}
      onClose={() => setEditJWAll(false)}
    >
      <Row style={{ height: "100%" }}>
        <Col span={9} style={{ height: "95%", overflowY: "scroll" }}>
          <Card size="small">
            {loading("page") && <Loading />}
            <Form
              onFinish={submitHandler}
              form={createJobWorkChallanForm}
              layout="vertical"
            >
              <Divider style={{ marginTop: 10 }} orientation="left">
                Vendor Details
              </Divider>
              <Row gutter={4}>
                <Col span={12}>
                  {loading("fetchDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchDetails") && (
                    <Form.Item label="Vendor" name="vendorcode">
                      <MySelect />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  {loading("fetchDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchDetails") && (
                    <Form.Item label="Vendor Branch" name="vendorbranch">
                      <MySelect />
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row>
                <Col span={24}>
                  {loading("fetchDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchDetails") && (
                    <Form.Item label="Vendor Address" name="vendor_address">
                      <Input.TextArea disabled />
                    </Form.Item>
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item label="Nature of Processing">
                    <Input
                      value={restCom?.nature}
                      onChange={(e) =>
                        setRestCom((restCom) => {
                          return { ...restCom, nature: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item label="Duration of Processing">
                    <Input
                      value={restCom?.duration}
                      onChange={(e) =>
                        setRestCom((restCom) => {
                          return { ...restCom, duration: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Vehicle Number" name="vehicle">
                    <Input
                      value={restCom?.vehicle}
                      onChange={(e) =>
                        setRestCom((restCom) => {
                          return { ...restCom, vehicle: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Other References" name="quotation_detail">
                    <Input
                      value={restCom?.otherRef}
                      onChange={(e) =>
                        setRestCom((restCom) => {
                          return { ...restCom, otherRef: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ marginTop: 10 }} orientation="left">
                Billing Details
              </Divider>

              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item label="Billing Address ID" name="billingaddrid">
                    <MySelect
                      options={billingBranches}
                      onChange={getBillingAddress}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item disabled label="PAN No." name="billingaddrpan">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item label="GSTIN." name="billingaddrgst">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="CIN" name="billingaddrcin">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item label="Billing Address" name="billingaddr">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
              <Divider orientation="left">Dispatch Details</Divider>

              <Row gutter={4}>
                <Col span={8}>
                  <Form.Item
                    label="Dispatch Address ID"
                    name="dispatchfromaddrid"
                  >
                    <MySelect
                      onChange={getDispatchAddress}
                      options={dispatchBranches}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="GSTIN" name="dispatchfromgst">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Pin Code" name="dispatchfrompincode">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item label="Dispatch Address" name="dispatchfromaddr">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={15} style={{ height: "95%" }}>
          {loading("tableSpinner") || (loading1("select") && <Loading />)}
          <FormTableDataGrid
            data={rows}
            columns={columns}
            loading={loading("tableSpinner") || loading1("select")}
          />
        </Col>
        <NavFooter
          backFunction={() => setEditJWAll(false)}
          submitFunction={submitHandler}
          nextLabel="Submit"
          loading={loading("submit")}
        />
      </Row>
    </Drawer>
  );
}

export default JWRMChallanEditAll;
