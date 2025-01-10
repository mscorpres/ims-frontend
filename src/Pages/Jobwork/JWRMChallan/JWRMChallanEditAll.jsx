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
  Space,
} from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import FormTable from "../../../Components/FormTable";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import Loading from "../../../Components/Loading";
import NavFooter from "../../../Components/NavFooter";
import errorToast from "../../../Components/errorToast";
import {
  UserAddOutlined,
  ToolOutlined,
  DeleteTwoTone,
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
    }
  };

  const inputHandler = async (name, value, id) => {
    console.log(name, value, id);
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
    // console.log(rows)
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
      },
      material: finalObj,
      // transaction_id: obj?.,
    };
    const response = await executeFun(() => saveCreateChallan(final), "select");
    // console.log("response", response);

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
  const getLocations = async () => {
    const response = await imsAxios.get("/jobwork/jwChallanLocations");
    if (response.data.code === 200) {
      let arr = response.data.data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setLocationOptions(arr);
    } else {
      setLocationOptions([]);
      toast.error(response.data.message.msg);
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
            deleteRow(row);
          }}
        />
      ),
    },
    {
      headerName: "Part No.",
      renderCell: ({ row }) => (
        <div style={{ width: 80 }}>
          <ToolTipEllipses text={row.part_no} />
        </div>
      ),
      width: 80,
    },
    {
      headerName: "Component",
      renderCell: ({ row }) => (
        <div style={{ width: 150 }}>
          <ToolTipEllipses text={row.component_name} />
        </div>
      ),
      width: 150,
    },
    {
      headerName: "Qty",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            style={{ width: "100%" }}
            value={row.issue_qty}
            onChange={(e) => inputHandler("issue_qty", e.target.value, row.id)}
            suffix={row.unit_name}
          />
        </div>
      ),
      width: 120,
    },
    {
      headerName: "Avail. Qty",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            disabled
            style={{ width: "100%" }}
            value={row.availableQty}
            // onChange={(e) => inputHandler("issue_qty", e.target.value, row.id)}
            // suffix={row.availableQty}
          />
        </div>
      ),
      width: 120,
    },
    {
      headerName: "Rate",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            style={{ width: "100%" }}
            value={row.assign_rate}
            onChange={(e) =>
              inputHandler("assign_rate", e.target.value, row.id)
            }
          />
        </div>
      ),
      width: 100,
    },
    {
      headerName: "Value",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input value={+row.issue_qty * +Number(row.assign_rate).toFixed(3)} />
        </div>
      ),
      width: 120,
    },
    {
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
      headerName: "Description",
      renderCell: ({ row }) => (
        <div style={{ width: 200 }}>
          <Input
            value={row.remarks}
            onChange={(e) => inputHandler("remarks", e.target.value, row.id)}
          />
        </div>
      ),
      // width: 170,
    },
  ];

  const deleteRow = async (i) => {
    console.log(i);
    setLoading("tableSpinner", true);
    const { data } = await imsAxios.post("/jobwork/removeChallanJWPart", {
      partcode: i?.component_key,
      row_id: i?.trans_row_id,
    });
    setLoading("tableSpinner", false);
    if (data.code == 200) {
      let arr = rows;
      arr = arr.filter((row) => row.id !== i.id);
      setRows(arr);
      // getDetails();
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoadChallan(false);
    }
    // console.log(data);
  };
  useEffect(() => {
    if (editiJWAll) {
      getDetails();
      getLocations();
      getBillingBranchOptions();
      getDispatchBranchOptions();
    }
  }, [editiJWAll]);
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
          <FormTable data={rows} columns={columns} />
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
