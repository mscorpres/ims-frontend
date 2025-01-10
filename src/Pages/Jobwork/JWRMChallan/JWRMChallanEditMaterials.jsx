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
  Skeleton,
  Space,
} from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import FormTable from "../../../Components/FormTable";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import errorToast from "../../../Components/errorToast";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import useLoading from "../../../hooks/useLoading";

function JWRMChallanEditMaterials({
  editingJWMaterials,
  setEditingJWMaterials,
  getRows,
}) {
  const [rows, setRows] = useState([]);
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useLoading();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [bilingAddressOptions, setBillingAddressOptions] = useState([]);
  const [dispatchAddressOptions, setDispatchAddressOptions] = useState([]);

  const [createJobWorkChallanForm] = Form.useForm();
  const getDetails = async () => {
    console.log(editingJWMaterials);
    setLoading("fetchingDetails", true);
    const response = await imsAxios.post("/jobwork/editJobworkChallan", {
      challan_no: editingJWMaterials,
    });
    setLoading("fetchingDetails", false);
    if (response.data.code === 200) {
      let arr = response.data.material.map((row, index) => ({
        id: v4(),
        index: index + 1,
        ...row,
      }));
      let obj = response.data.header;
      let vendor = {
        label: obj.vendorcode.label,
        value: obj.vendorcode.value,
      };
      createJobWorkChallanForm.setFieldsValue({ ...obj, vendor: vendor });
      await getVendorBranches(obj.vendorcode.value);
      await getDispatchAddressDetails(obj.dispatch_info.value);
      await getBillingAddressDetails(obj.billing_info.value);
      setVendorData({ vendor: vendor, ...obj });
      setRows(arr);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = rows;
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
    setRows(arr);
  };
  const submitHandler = async () => {
    let vendor = createJobWorkChallanForm.getFieldsValue();

    const finalObj = {
      material: {
        component: rows.map((row) => row.component_key),
        hsncode: rows.map((row) => row.hsn_code),
        qty: rows.map((row) => row.issue_qty),
        rate: rows.map((row) => row.part_rate),
        remark: rows.map((row) => row.remarks),
      },
      header: {
        vendorbranch: vendor.vendorbranch.value ?? vendor.vendorbranch,
        vendoraddress: vendor.vendor_address,
        nature: vendor.nature_process,
        duration: vendor.duration_process,
        vehicle: vendor.vehicle,
        other_ref: vendor.other_ref,
        billingid: vendor.billing_info.value ?? vendor.billing_info,
        billingaddress: vendor.billing_address,
        dispatchid: vendor.dispatch_info.value ?? vendor.dispatch_info,
        dispatchaddress: vendor.dispatch_to__line1,
      },
      transaction_id: editingJWMaterials,
    };
    console.log(finalObj);

    setLoading("submit", true);
    const response = await imsAxios.post(
      "/jobwork/updateJobworkChallan",
      finalObj
    );
    setLoading("submit", false);
    console.log(response);
    if (response.data.code === 200) {
      toast.success(response.data.message);
      setEditingJWMaterials(false);
      getRows();
    } else {
      if (response.data.message.msg) {
        toast.error(response.data.message.msg);
      } else {
        toast.error(errorToast(response.data.message));
      }
    }
  };
  const getAsyncOptions = async (search, type) => {
    let link =
      type === "dispatch"
        ? "/backend/dispatchAddressList"
        : type === "billing"
        ? "/backend/billingAddressList"
        : type === "vendor" && "/backend/vendorList";
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
  const getVendorBranches = async (vendor_id) => {
    setLoading("values", true);
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendor_id,
    });
    setLoading("values", false);
    // console.log("response->", response)
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setVendorBranchOptions(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const getVendorBranchDetails = async (branchCode) => {
    const vendorCode = createJobWorkChallanForm.getFieldsValue().vendor.value;
    let obj1 = createJobWorkChallanForm.getFieldsValue();
    setLoading("values", true);
    const response = await imsAxios.post("backend/vendorAddress", {
      branchcode: branchCode,
      vendorcode: vendorCode,
    });
    setLoading("values", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let obj = {
          vendor_address: data.data.address?.replaceAll("<br>", "\n"),
          vendor_gst: data.data.gstid,
        };
        obj1 = { ...obj1, ...obj };
        createJobWorkChallanForm.setFieldsValue(obj);
        return obj;
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const getBillingDispatchAddress = async () => {
    setLoading("values", true);
    const billingResponse = await imsAxios.post("/backend/billingAddressList");
    const dispatchgResponse = await imsAxios.post(
      "/backend/dispatchAddressList"
    );
    setLoading("values", false);
    const { data: billingData } = billingResponse;
    const { data: dispatchData } = dispatchgResponse;
    if (billingData) {
      if (billingData[0]) {
        let arr = billingData.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setBillingAddressOptions(arr);
      } else {
        toast.error(billingData.message.msg);
      }
    }
    if (dispatchData) {
      if (dispatchData[0]) {
        let arr = dispatchData.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setDispatchAddressOptions(arr);
      } else {
        toast.error(dispatchData.message.msg);
      }
    }
  };
  const getDispatchAddressDetails = async (code) => {
    let obj1 = createJobWorkChallanForm.getFieldsValue();
    setLoading("values", true);
    const response = await imsAxios.post("/backend/dispatchAddress", {
      dispatch_code: code,
    });
    setLoading("values", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        obj1 = {
          ...obj1,
          dispatch_to__line1: data.data.address.replaceAll("<br>", "\n"),
          dispatchfromgst: data.data.gstin,
          dispatch_to__pincode: data.data.pincode,
          // billingaddrpan: data.data.pan,
        };
        createJobWorkChallanForm.setFieldsValue(obj1);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const getBillingAddressDetails = async (code) => {
    let obj1 = createJobWorkChallanForm.getFieldsValue();
    setLoading("values", true);
    const response = await imsAxios.post("/backend/billingAddress", {
      billing_code: code,
    });
    setLoading("values", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        obj1 = {
          ...obj1,
          billing_address: data.data.address.replaceAll("<br>", "\n"),
          billingaddrgst: data.data.gstin,
          billingaddrcin: data.data.cin,
          billingaddrpan: data.data.pan,
        };
        createJobWorkChallanForm.setFieldsValue(obj1);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const columns = [
    { headerName: "Sr. No", renderCell: ({ row }) => row.index, width: 80 },
    {
      headerName: "Component",
      renderCell: ({ row }) => (
        <div style={{ width: 150 }}>
          <ToolTipEllipses text={row.component_name} />
        </div>
      ),
      width: 100,
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
            type="number"
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
            value={row.part_rate}
            onChange={(e) => inputHandler("part_rate", e.target.value, row.id)}
            type="number"
          />
        </div>
      ),
      width: 100,
    },
    {
      headerName: "Value",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input value={+row.issue_qty * +Number(row.part_rate).toFixed(2)} />
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
      headerName: "Description",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            value={row.remarks}
            onChange={(e) => inputHandler("remarks", e.target.value, row.id)}
          />
        </div>
      ),
    },
  ];
  useEffect(() => {
    if (editingJWMaterials) {
      getDetails();
      getBillingDispatchAddress();
    }
  }, [editingJWMaterials]);

  return (
    <Drawer
      title={`Editing Challan Number: ${editingJWMaterials}`}
      width="100vw"
      open={editingJWMaterials}
      onClose={() => setEditingJWMaterials(false)}
    >
      <Row style={{ height: "100%" }}>
        <Col span={10} style={{ height: "95%", overflowY: "scroll" }}>
          <Card size="small">
            {}
            {(loading("page") || loading("values")) && <Loading />}
            <Form
              // onFinish={submitHandler}
              form={createJobWorkChallanForm}
              layout="vertical"
            >
              <Divider style={{ marginTop: 10 }} orientation="left">
                Vendor Details
              </Divider>
              <Row gutter={4}>
                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Vendor Name" name="vendor">
                      <MyAsyncSelect
                        loadOptions={(value) =>
                          getAsyncOptions(value, "vendor")
                        }
                        disabled={true}
                        selectLoading={loading("select")}
                        optionsState={asyncOptions}
                        onChange={(value) => getVendorBranches(value)}
                        onBlur={() => setAsyncOptions([])}
                      />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Vendor Branch"
                      name="vendorbranch"
                      rules={[
                        {
                          required: true,
                          message: "Please Select a Vendor branch!",
                        },
                      ]}
                    >
                      <MySelect
                        onChange={(value) => getVendorBranchDetails(value)}
                        options={vendorBranchOptions}
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Nature of Processing"
                      name="nature_process"
                    >
                      <Input />
                    </Form.Item>
                  )}
                </Col>

                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Duration of Processing"
                      name="duration_process"
                    >
                      <Input />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Vehicle Number"
                    name="vehicle"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a vehicle number!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Other References" name="other_ref">
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{}} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Vendor Address" name="vendor_address">
                      <Input.TextArea disabled />
                    </Form.Item>
                  )}
                </Col>
                <Divider style={{ marginTop: 10 }} orientation="left">
                  Billing Details
                </Divider>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Billing Address ID" name="billing_info">
                      <MySelect
                        options={bilingAddressOptions}
                        onChange={getBillingAddressDetails}
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Billing Address" name="billing_address">
                      <Input.TextArea />
                    </Form.Item>
                  )}
                </Col>

                <Divider orientation="left">Dispatch Details</Divider>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Dispatch Address ID" name="dispatch_info">
                      <MySelect
                        onChange={getDispatchAddressDetails}
                        options={dispatchAddressOptions}
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Dispatch Address"
                      name="dispatch_to__line1"
                    >
                      <Input.TextArea />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={14} style={{ height: "95%" }}>
          <FormTable data={rows} columns={columns} />
        </Col>
      </Row>
      <NavFooter
        loading={loading("submit")}
        nextLabel="Submit"
        submitFunction={submitHandler}
      />
    </Drawer>
  );
}

export default JWRMChallanEditMaterials;
